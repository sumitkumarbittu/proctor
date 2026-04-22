import { apiFetch } from './api';
import { Proctor } from './proctor';
import { showToast, escapeHtml, debounce, formatTime } from './utils';

const urlParams = new URLSearchParams(window.location.search);
const attemptId = urlParams.get('attempt_id');

let timerInterval: number | null = null;
let examData: any = null;
let currentAttempt: any = null;
let totalQuestions = 0;
let saveErrorShown = false;
let isSubmitting = false;
const answeredQuestions = new Set<number>();
let proctor: Proctor | null = null;

function redirectToDashboard(delay = 0) {
    window.setTimeout(() => {
        window.location.href = '/dashboard.html';
    }, delay);
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

        renderExam(examData);
        startTimer(currentAttempt.started_at, examData.duration_minutes);
        proctor = new Proctor(Number.parseInt(attemptId, 10));

        const responses = await apiFetch<any[]>(`/attempts/${attemptId}/responses`).catch(() => []);
        restoreResponses(responses);
        setSaveState('ready');
    } catch (error: any) {
        showToast(error.message || 'Failed to load exam.', 'error');
        redirectToDashboard(1500);
    }
}

function restoreResponses(responses: any[]) {
    responses.forEach((response) => {
        const radioInput = document.querySelector<HTMLInputElement>(
            `[name="q_${response.question_id}"][value="${CSS.escape(response.answer)}"]`,
        );

        if (radioInput) {
            radioInput.checked = true;
            markQuestionAnswered(response.question_id);
            return;
        }

        const textarea = document.querySelector<HTMLTextAreaElement>(
            `textarea[name="q_${response.question_id}"]`,
        );
        if (textarea) {
            textarea.value = response.answer;
            if (response.answer.trim()) {
                markQuestionAnswered(response.question_id);
            }
        }
    });
}

function renderExam(exam: any) {
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
        questionCard.style.animationDelay = `${index * 45}ms`;
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
    updateProgress();
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
        }
    }
}

void initExam();
