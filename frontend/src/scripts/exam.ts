import { apiFetch } from './api';
import { Proctor } from './proctor';
import { debounce, escapeHtml, formatTime, showToast } from './utils';

const urlParams = new URLSearchParams(window.location.search);
const attemptId = urlParams.get('attempt_id');

let timerInterval: number | null = null;
let syncInterval: number | null = null;
let examData: any = null;
let currentAttempt: any = null;
let totalQuestions = 0;
let saveErrorShown = false;
let isSubmitting = false;
let lastExamSignature = '';
const answeredQuestions = new Set<number>();
let proctor: Proctor | null = null;

const LIVE_SYNC_INTERVAL_MS = 6000;

function redirectToDashboard(delay = 0) {
    window.setTimeout(() => {
        window.location.href = '/dashboard.html';
    }, delay);
}

function setLiveUpdateStatus(message: string) {
    const status = document.getElementById('live-update-status');
    if (status) {
        status.textContent = message;
    }
}

function setSaveState(state: 'ready' | 'saving' | 'error', message?: string) {
    const saveStatus = document.getElementById('save-status');
    const connectionStatus = document.getElementById('connection-status');
    const connectionDot = document.getElementById('connection-dot');

    if (!saveStatus || !connectionStatus || !connectionDot) return;

    saveStatus.className = `save-status${state === 'ready' ? '' : ` ${state}`}`;
    connectionDot.className = `connection-indicator${state === 'ready' ? '' : ` ${state}`}`;

    if (state === 'saving') {
        saveStatus.textContent = message || 'Saving changes...';
        connectionStatus.textContent = 'Saving';
        return;
    }

    if (state === 'error') {
        saveStatus.textContent = message || 'Save failed. Please keep this tab open.';
        connectionStatus.textContent = 'Connection issue';
        return;
    }

    saveStatus.textContent = message || 'All changes saved';
    connectionStatus.textContent = 'Connected';
}

function getExamSignature(exam: any) {
    return JSON.stringify({
        title: exam.title,
        instructions: exam.instructions,
        duration_minutes: exam.duration_minutes,
        status: exam.status,
        questions: (exam.questions || []).map((entry: any) => ({
            question_id: entry.question_id,
            order_index: entry.order_index,
            id: entry.question?.id,
            prompt: entry.question?.prompt,
            type: entry.question?.type,
            marks: entry.question?.marks,
            options: entry.question?.options || [],
        })),
    });
}

function collectResponseSnapshot() {
    const snapshot = new Map<number, string>();

    document.querySelectorAll<HTMLInputElement>('input[type="radio"]:checked').forEach((input) => {
        const questionId = Number.parseInt(input.name.split('_')[1], 10);
        snapshot.set(questionId, input.value);
    });

    document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => {
        const questionId = Number.parseInt(textarea.name.split('_')[1], 10);
        snapshot.set(questionId, textarea.value);
    });

    return snapshot;
}

function captureFocusState() {
    const activeElement = document.activeElement as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;

    if (!activeElement?.name) return null;

    return {
        name: activeElement.name,
        selectionStart:
            'selectionStart' in activeElement ? activeElement.selectionStart : null,
        selectionEnd: 'selectionEnd' in activeElement ? activeElement.selectionEnd : null,
        scrollY: window.scrollY,
    };
}

function restoreFocusState(focusState: any) {
    if (!focusState) return;

    const target = document.querySelector<
        HTMLInputElement | HTMLTextAreaElement
    >(`[name="${CSS.escape(focusState.name)}"]`);

    if (!target) {
        window.scrollTo({ top: focusState.scrollY || 0 });
        return;
    }

    target.focus({ preventScroll: true });
    if ('selectionStart' in target && focusState.selectionStart !== null) {
        target.selectionStart = focusState.selectionStart;
        target.selectionEnd = focusState.selectionEnd;
    }
    window.scrollTo({ top: focusState.scrollY || 0 });
}

function buildResponseMap(responses: any[], draftResponses = new Map<number, string>()) {
    const responseMap = new Map<number, string>();

    responses.forEach((response) => {
        responseMap.set(response.question_id, response.answer || '');
    });

    draftResponses.forEach((value, key) => {
        responseMap.set(key, value);
    });

    return responseMap;
}

function restoreResponses(responseMap: Map<number, string>) {
    responseMap.forEach((answer, questionId) => {
        const radioInput = document.querySelector<HTMLInputElement>(
            `[name="q_${questionId}"][value="${CSS.escape(answer)}"]`,
        );

        if (radioInput) {
            radioInput.checked = true;
            markQuestionAnswered(questionId);
            return;
        }

        const textarea = document.querySelector<HTMLTextAreaElement>(
            `textarea[name="q_${questionId}"]`,
        );
        if (textarea) {
            textarea.value = answer;
            if (answer.trim()) {
                markQuestionAnswered(questionId);
            }
        }
    });
}

function renderOptions(question: any): string {
    if (question.type === 'MCQ') {
        return (question.options || [])
            .map(
                (option: string) => `
                    <label class="option-label">
                        <input type="radio" name="q_${question.id}" value="${escapeHtml(option)}">
                        <span>${escapeHtml(option)}</span>
                    </label>
                `,
            )
            .join('');
    }

    return `<textarea class="textarea" name="q_${question.id}" rows="5" placeholder="Type your answer here..."></textarea>`;
}

function renderExam(exam: any, responseMap = new Map<number, string>()) {
    const title = document.getElementById('exam-title');
    const instructions = document.getElementById('exam-instructions');
    const container = document.getElementById('questions-container');
    const navigator = document.getElementById('question-nav');
    const count = document.getElementById('question-count');

    if (!title || !instructions || !container || !navigator || !count) return;

    title.textContent = exam.title;
    instructions.innerHTML = escapeHtml(exam.instructions || '').replace(/\n/g, '<br>');
    container.innerHTML = '';
    navigator.innerHTML = '';
    answeredQuestions.clear();

    exam.questions.sort(
        (left: any, right: any) => (left.order_index ?? 0) - (right.order_index ?? 0),
    );
    totalQuestions = exam.questions.length;
    count.textContent = `${totalQuestions} Questions`;

    if (!totalQuestions) {
        container.innerHTML = `
            <div class="card question-card empty-state">
                <div class="empty-state-icon">!</div>
                <div class="empty-state-title">No questions available</div>
                <div class="empty-state-desc">This exam does not have any questions assigned yet.</div>
            </div>
        `;
        updateProgress();
        return;
    }

    exam.questions.forEach((questionItem: any, index: number) => {
        const question = questionItem.question || questionItem;
        const questionNumber = index + 1;

        const questionCard = document.createElement('div');
        questionCard.className = 'card question-card animate-in';
        questionCard.id = `question-${question.id}`;
        questionCard.style.animationDelay = `${index * 30}ms`;
        questionCard.innerHTML = `
            <div class="question-card-header">
                <div class="flex items-center gap-sm">
                    <span class="badge badge-info">Q${questionNumber}</span>
                    <span class="text-sm text-muted">${question.type}</span>
                </div>
                <span class="chip">${question.marks} marks</span>
            </div>
            <p class="mb-2">${escapeHtml(question.prompt)}</p>
            <div>${renderOptions(question)}</div>
        `;
        container.appendChild(questionCard);

        const navButton = document.createElement('button');
        navButton.type = 'button';
        navButton.className = 'question-nav-btn';
        navButton.id = `nav-btn-${question.id}`;
        navButton.textContent = questionNumber.toString();
        navButton.addEventListener('click', () => {
            document.getElementById(`question-${question.id}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        });
        navigator.appendChild(navButton);
    });

    attachQuestionListeners();
    restoreResponses(responseMap);
    updateProgress();
}

function markQuestionAnswered(questionId: number) {
    answeredQuestions.add(questionId);
    document.getElementById(`nav-btn-${questionId}`)?.classList.add('answered');
    updateProgress();
}

function unmarkQuestionAnswered(questionId: number) {
    answeredQuestions.delete(questionId);
    document.getElementById(`nav-btn-${questionId}`)?.classList.remove('answered');
    updateProgress();
}

function updateProgress() {
    const progress = document.getElementById('exam-progress');
    if (!progress) return;

    const percentage =
        totalQuestions === 0 ? 0 : Math.round((answeredQuestions.size / totalQuestions) * 100);
    progress.style.width = `${percentage}%`;
}

async function handleAnswerChange(questionId: number, answer: string) {
    if (!attemptId) return;

    setSaveState('saving');

    try {
        await apiFetch(`/attempts/${attemptId}/response`, {
            method: 'POST',
            body: JSON.stringify({
                question_id: questionId,
                answer,
            }),
        });
        saveErrorShown = false;
        setSaveState('ready');
    } catch {
        setSaveState('error');
        if (!saveErrorShown) {
            saveErrorShown = true;
            showToast('Failed to save your latest response.', 'error');
        }
    }
}

function attachQuestionListeners() {
    document.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
        input.addEventListener('change', async (event) => {
            const target = event.target as HTMLInputElement;
            const questionId = Number.parseInt(target.name.split('_')[1], 10);
            markQuestionAnswered(questionId);
            await handleAnswerChange(questionId, target.value);
        });
    });

    const debouncedSave = debounce(async (questionId: number, value: string) => {
        if (value.trim()) {
            markQuestionAnswered(questionId);
        } else {
            unmarkQuestionAnswered(questionId);
        }

        await handleAnswerChange(questionId, value);
    }, 700);

    document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => {
        textarea.addEventListener('input', (event) => {
            const target = event.target as HTMLTextAreaElement;
            const questionId = Number.parseInt(target.name.split('_')[1], 10);
            setSaveState('saving');
            debouncedSave(questionId, target.value);
        });
    });
}

function animateQuestionRefresh() {
    const container = document.getElementById('questions-container');
    if (!container) return;

    container.animate(
        [
            { opacity: 0.55, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ],
        {
            duration: 260,
            easing: 'ease',
        },
    );
}

async function syncExamState() {
    if (!attemptId || !currentAttempt) return;

    try {
        const [latestAttempt, latestExam] = await Promise.all([
            apiFetch<any>(`/attempts/${attemptId}`),
            apiFetch<any>(`/exams/${currentAttempt.exam_id}`),
        ]);

        if (latestAttempt.status !== 'IN_PROGRESS') {
            window.location.href = `/result.html?attempt_id=${attemptId}`;
            return;
        }

        const latestSignature = getExamSignature(latestExam);
        if (latestSignature !== lastExamSignature) {
            const focusState = captureFocusState();
            const draftResponses = collectResponseSnapshot();
            const savedResponses = await apiFetch<any[]>(`/attempts/${attemptId}/responses`).catch(() => []);
            const responseMap = buildResponseMap(savedResponses, draftResponses);

            examData = latestExam;
            lastExamSignature = latestSignature;
            renderExam(latestExam, responseMap);
            restoreFocusState(focusState);
            animateQuestionRefresh();
            setLiveUpdateStatus('Exam updated live. Latest question changes were applied smoothly.');
            showToast('This exam was updated live. Your view has been refreshed.', 'info');
        } else {
            setLiveUpdateStatus('Question changes sync automatically during the attempt.');
        }

        currentAttempt = latestAttempt;
    } catch {
        setLiveUpdateStatus('Live sync is temporarily unavailable. Your current answers remain on screen.');
    }
}

function startLiveSync() {
    if (syncInterval) {
        window.clearInterval(syncInterval);
    }

    syncInterval = window.setInterval(() => {
        void syncExamState();
    }, LIVE_SYNC_INTERVAL_MS);
}

function clearLiveSync() {
    if (syncInterval) {
        window.clearInterval(syncInterval);
        syncInterval = null;
    }
}

function clearTimer() {
    if (timerInterval) {
        window.clearInterval(timerInterval);
        timerInterval = null;
    }
}

function startTimer(startedAt: string, durationMinutes: number) {
    const timer = document.getElementById('timer');
    if (!timer) return;

    const startedAtTime = new Date(startedAt).getTime();
    const endTime = startedAtTime + durationMinutes * 60 * 1000;

    const renderRemainingTime = () => {
        const remainingSeconds = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

        timer.textContent = formatTime(remainingSeconds);
        timer.classList.remove('warning', 'danger');

        if (remainingSeconds <= 60) {
            timer.classList.add('danger');
        } else if (remainingSeconds <= 300) {
            timer.classList.add('warning');
        }

        if (remainingSeconds <= 0) {
            clearTimer();
            void submitExam(true);
        }
    };

    renderRemainingTime();
    timerInterval = window.setInterval(renderRemainingTime, 1000);
}

async function initExam() {
    if (!attemptId) {
        showToast('Invalid attempt ID.', 'error');
        redirectToDashboard(900);
        return;
    }

    try {
        currentAttempt = await apiFetch<any>(`/attempts/${attemptId}`);
        examData = await apiFetch<any>(`/exams/${currentAttempt.exam_id}`);

        if (currentAttempt.status !== 'IN_PROGRESS') {
            window.location.href = `/result.html?attempt_id=${attemptId}`;
            return;
        }

        const responses = await apiFetch<any[]>(`/attempts/${attemptId}/responses`).catch(() => []);
        lastExamSignature = getExamSignature(examData);
        renderExam(examData, buildResponseMap(responses));
        startTimer(currentAttempt.started_at, examData.duration_minutes);
        startLiveSync();
        setLiveUpdateStatus('Question changes sync automatically during the attempt.');
        proctor = new Proctor(Number.parseInt(attemptId, 10));
        setSaveState('ready');
    } catch (error: any) {
        showToast(error.message || 'Failed to load exam.', 'error');
        redirectToDashboard(1500);
    }
}

document.getElementById('submit-btn')?.addEventListener('click', (event) => {
    event.preventDefault();

    if (answeredQuestions.size < totalQuestions) {
        const confirmSubmit = window.confirm(
            `You answered ${answeredQuestions.size} of ${totalQuestions} questions. Submit anyway?`,
        );
        if (!confirmSubmit) return;
    } else {
        const confirmSubmit = window.confirm('Submit your exam now?');
        if (!confirmSubmit) return;
    }

    void submitExam();
});

async function submitExam(auto = false) {
    if (!attemptId || isSubmitting) return;

    isSubmitting = true;
    clearTimer();
    clearLiveSync();
    proctor?.destroy();

    const submitButton = document.getElementById('submit-btn') as HTMLButtonElement | null;
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = auto ? 'Submitting automatically...' : 'Submitting...';
    }

    if (auto) {
        showToast('Time is up. Submitting your exam now.', 'info');
    }

    try {
        await apiFetch(`/attempts/${attemptId}/submit`, { method: 'POST' });
        window.location.href = `/result.html?attempt_id=${attemptId}`;
    } catch (error: any) {
        showToast(error.message || 'Submission failed. Please try again.', 'error');
        isSubmitting = false;

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit exam';
        }

        if (currentAttempt && examData) {
            startTimer(currentAttempt.started_at, examData.duration_minutes);
            startLiveSync();
        }
    }
}

void initExam();
