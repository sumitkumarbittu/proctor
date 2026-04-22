import { apiFetch } from './api';
import {
    removeAuthToken,
    getUserInitials,
    showToast,
    escapeHtml,
    getStatusBadgeClass,
} from './utils';

let currentUser: any = null;
let editingExamId: number | null = null;
let editingUserId: number | null = null;

const views = ['exams', 'results', 'users', 'questions', 'reports'] as const;

function renderEmptyState(icon: string, title: string, description: string): string {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-desc">${description}</div>
        </div>
    `;
}

function toggleBodyModalState() {
    const hasActiveModal = Array.from(document.querySelectorAll('.modal-overlay')).some((modal) =>
        modal.classList.contains('active'),
    );
    document.body.classList.toggle('modal-open', hasActiveModal);
}

async function initDashboard() {
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        removeAuthToken();
        window.location.href = '/';
    });

    try {
        currentUser = await apiFetch('/users/me');
        renderUserInfo();
        setupNavigation();
        setupModals();

        const isAdmin = currentUser.role === 'admin' || currentUser.role === 'examiner';
        if (isAdmin) {
            document.getElementById('admin-nav')?.classList.remove('hidden');
            document.getElementById('admin-controls')?.classList.remove('hidden');
            void loadAdminStats();
        }

        await loadExams();
    } catch (error: any) {
        showToast(error.message || 'Failed to load the dashboard.', 'error');
        const examList = document.getElementById('exam-list');
        if (examList) {
            examList.innerHTML = renderEmptyState(
                '!',
                'Unable to load dashboard',
                'Please refresh the page or try again in a moment.',
            );
        }
    }
}

function renderUserInfo() {
    const name = currentUser.name || currentUser.email;

    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    const userAvatar = document.getElementById('user-avatar');

    if (userName) userName.textContent = name;
    if (userRole) userRole.textContent = currentUser.role;
    if (userAvatar) userAvatar.textContent = getUserInitials(currentUser.name, currentUser.email);
}

function setupNavigation() {
    document.querySelectorAll<HTMLElement>('.nav-link[data-view]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const view = link.dataset.view;
            if (!view) return;
            switchView(view);
        });
    });
}

function switchView(view: string) {
    document.querySelectorAll('.nav-link[data-view]').forEach((link) => {
        link.classList.toggle('active', (link as HTMLElement).dataset.view === view);
    });

    views.forEach((name) => {
        document.getElementById(`view-${name}`)?.classList.toggle('hidden', name !== view);
    });

    if (view === 'exams') void loadExams();
    if (view === 'results') void loadResults();
    if (view === 'users') void loadUsers();
    if (view === 'questions') void loadQuestions();
    if (view === 'reports') void loadReports();
}

function setupModals() {
    document.querySelectorAll<HTMLElement>('[data-close-modal]').forEach((button) => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.closeModal;
            if (modalId) closeModal(modalId);
        });
    });

    document.querySelectorAll<HTMLElement>('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) closeModal(overlay.id);
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        document.querySelectorAll<HTMLElement>('.modal-overlay.active').forEach((modal) => {
            closeModal(modal.id);
        });
    });

    document.getElementById('create-exam-btn')?.addEventListener('click', () => openExamModal());
    document.getElementById('create-user-btn')?.addEventListener('click', () => openUserModal());
    document.getElementById('create-question-btn')?.addEventListener('click', () => openQuestionModal());
    document.getElementById('exam-form')?.addEventListener('submit', handleExamSubmit);
    document.getElementById('user-form')?.addEventListener('submit', handleUserSubmit);
    document.getElementById('question-form')?.addEventListener('submit', handleQuestionSubmit);
    document.getElementById('q-type')?.addEventListener('change', (event) => {
        const value = (event.target as HTMLSelectElement).value;
        const optionsSection = document.getElementById('mcq-options-section');
        if (optionsSection) {
            optionsSection.style.display = value === 'MCQ' ? 'block' : 'none';
        }
    });
}

function openModal(id: string) {
    document.getElementById(id)?.classList.add('active');
    toggleBodyModalState();
}

function closeModal(id: string) {
    document.getElementById(id)?.classList.remove('active');
    toggleBodyModalState();
}

async function loadAdminStats() {
    try {
        const stats = await apiFetch<any>('/reports/dashboard');
        const statsBar = document.getElementById('stats-bar');
        if (!statsBar) return;

        statsBar.classList.remove('hidden');
        statsBar.innerHTML = `
            <div class="stat-card blue animate-in">
                <div class="stat-card-icon">EX</div>
                <div class="stat-card-value">${stats.total_exams}</div>
                <div class="stat-card-label">Total Exams</div>
            </div>
            <div class="stat-card green animate-in" style="animation-delay: 40ms;">
                <div class="stat-card-icon">US</div>
                <div class="stat-card-value">${stats.total_users}</div>
                <div class="stat-card-label">Users</div>
            </div>
            <div class="stat-card amber animate-in" style="animation-delay: 80ms;">
                <div class="stat-card-icon">AT</div>
                <div class="stat-card-value">${stats.total_attempts}</div>
                <div class="stat-card-label">Attempts</div>
            </div>
            <div class="stat-card rose animate-in" style="animation-delay: 120ms;">
                <div class="stat-card-icon">RV</div>
                <div class="stat-card-value">${stats.pending_evaluation}</div>
                <div class="stat-card-label">Pending Review</div>
            </div>
        `;
    } catch {
        // Keep the dashboard usable even if stats fail.
    }
}

async function loadExams() {
    const list = document.getElementById('exam-list');
    if (!list) return;

    try {
        const exams = await apiFetch<any[]>('/exams/');
        list.innerHTML = '';

        if (!exams.length) {
            list.innerHTML = renderEmptyState(
                'EX',
                'No exams yet',
                'Create your first exam or wait for an assignment to appear here.',
            );
            return;
        }

        exams.forEach((exam, index) => {
            const card = document.createElement('div');
            card.className = 'card card-interactive exam-card animate-in';
            card.style.animationDelay = `${index * 50}ms`;

            const isAdmin = currentUser.role !== 'student';
            card.innerHTML = `
                <div class="exam-card-header">
                    <div>
                        <h3>${escapeHtml(exam.title)}</h3>
                        <p class="helper-text">${escapeHtml(exam.instructions || 'No instructions added yet.')}</p>
                    </div>
                    <span class="badge ${getStatusBadgeClass(exam.status)}">${exam.status}</span>
                </div>
                <div class="exam-card-meta">
                    <span>${exam.duration_minutes} min</span>
                    <span>${exam.questions?.length || 0} questions</span>
                </div>
                <div class="exam-card-actions">
                    ${
                        isAdmin
                            ? `
                                <div class="flex gap-xs">
                                    <button class="icon-btn edit-exam" data-id="${exam.id}" title="Edit exam">✎</button>
                                    <button class="icon-btn detail-exam" data-id="${exam.id}" title="Open details">⋯</button>
                                    <button class="icon-btn danger delete-exam" data-id="${exam.id}" title="Delete exam">×</button>
                                </div>
                            `
                            : '<div class="helper-text">Assigned exam</div>'
                    }
                    <button class="btn btn-primary btn-sm start-btn" data-id="${exam.id}">
                        ${currentUser.role === 'student' ? 'Start exam' : 'View details'}
                    </button>
                </div>
            `;
            list.appendChild(card);
        });

        attachExamListeners();
    } catch (error: any) {
        list.innerHTML = renderEmptyState(
            '!',
            'Unable to load exams',
            error.message || 'Please try again in a moment.',
        );
    }
}

function attachExamListeners() {
    document.querySelectorAll<HTMLElement>('.start-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            if (!id) return;

            if (currentUser.role === 'student') {
                try {
                    const attempt = await apiFetch<any>(`/attempts/${id}/start`, { method: 'POST' });
                    window.location.href = `/exam.html?attempt_id=${attempt.id}`;
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
                return;
            }

            void openExamDetail(Number.parseInt(id, 10));
        });
    });

    document.querySelectorAll<HTMLElement>('.edit-exam').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            if (!id) return;

            try {
                const exam = await apiFetch<any>(`/exams/${id}`);
                openExamModal(exam);
            } catch (error: any) {
                showToast(error.message, 'error');
            }
        });
    });

    document.querySelectorAll<HTMLElement>('.delete-exam').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            if (!id || !window.confirm('Delete this exam?')) return;

            try {
                await apiFetch(`/exams/${id}`, { method: 'DELETE' });
                showToast('Exam deleted.', 'success');
                await loadExams();
                await loadAdminStats();
            } catch (error: any) {
                showToast(error.message, 'error');
            }
        });
    });

    document.querySelectorAll<HTMLElement>('.detail-exam').forEach((button) => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            if (!id) return;
            void openExamDetail(Number.parseInt(id, 10));
        });
    });
}

function openExamModal(exam?: any) {
    editingExamId = exam ? exam.id : null;

    const title = document.getElementById('exam-modal-title');
    const submitButton = document.getElementById('exam-submit-btn');
    const examTitle = document.getElementById('exam-title') as HTMLInputElement | null;
    const instructions = document.getElementById('exam-instructions') as HTMLTextAreaElement | null;
    const duration = document.getElementById('exam-duration') as HTMLInputElement | null;
    const status = document.getElementById('exam-status') as HTMLSelectElement | null;

    if (title) title.textContent = exam ? 'Edit Exam' : 'Create Exam';
    if (submitButton) submitButton.textContent = exam ? 'Save Changes' : 'Create Exam';
    if (examTitle) examTitle.value = exam?.title || '';
    if (instructions) instructions.value = exam?.instructions || '';
    if (duration) duration.value = exam?.duration_minutes?.toString() || '60';
    if (status) status.value = exam?.status || 'DRAFT';

    openModal('exam-modal');
}

async function handleExamSubmit(event: Event) {
    event.preventDefault();

    const body = {
        title: (document.getElementById('exam-title') as HTMLInputElement).value,
        instructions: (document.getElementById('exam-instructions') as HTMLTextAreaElement).value,
        duration_minutes: Number.parseInt(
            (document.getElementById('exam-duration') as HTMLInputElement).value,
            10,
        ),
        status: (document.getElementById('exam-status') as HTMLSelectElement).value,
    };

    try {
        if (editingExamId) {
            await apiFetch(`/exams/${editingExamId}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });
            showToast('Exam updated.', 'success');
        } else {
            await apiFetch('/exams/', {
                method: 'POST',
                body: JSON.stringify(body),
            });
            showToast('Exam created.', 'success');
        }

        closeModal('exam-modal');
        await loadExams();
        await loadAdminStats();
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

async function openExamDetail(examId: number) {
    try {
        const [exam, questions, attempts] = await Promise.all([
            apiFetch<any>(`/exams/${examId}`),
            apiFetch<any[]>('/exams/questions').catch(() => []),
            apiFetch<any[]>(`/attempts/exam/${examId}`).catch(() => []),
        ]);

        const content = document.getElementById('exam-detail-content');
        const title = document.getElementById('exam-detail-title');
        if (!content || !title) return;

        title.textContent = exam.title;

        const assignedQuestionIds = (exam.questions || []).map((question: any) => question.question_id);
        const availableQuestions = questions.filter(
            (question: any) => !assignedQuestionIds.includes(question.id),
        );

        content.innerHTML = `
            <div class="tabs">
                <button class="tab active" data-tab="questions">Questions (${exam.questions?.length || 0})</button>
                <button class="tab" data-tab="attempts">Attempts (${attempts.length})</button>
                <button class="tab" data-tab="assign">Assign</button>
            </div>

            <div id="tab-questions">
                ${renderExamQuestions(exam)}
                <div class="detail-divider"></div>
                <div class="section-title mb-1">Add From Question Bank</div>
                ${
                    availableQuestions.length
                        ? availableQuestions
                              .map(
                                  (question: any) => `
                                    <div class="detail-row">
                                        <span class="text-sm">${escapeHtml(question.prompt.substring(0, 90))}</span>
                                        <button class="btn btn-primary btn-sm add-q-to-exam" data-exam="${examId}" data-qid="${question.id}">
                                            Add
                                        </button>
                                    </div>
                                `,
                              )
                              .join('')
                        : '<p class="text-sm text-muted">No additional questions available.</p>'
                }
            </div>

            <div id="tab-attempts" class="hidden">${renderAttemptsList(attempts)}</div>

            <div id="tab-assign" class="hidden">
                <p class="text-sm text-muted mb-2">Enter student IDs as a comma-separated list.</p>
                <div class="assign-row">
                    <input type="text" id="assign-ids" class="input" placeholder="1, 2, 3">
                    <button class="btn btn-primary" id="assign-btn">Assign</button>
                </div>
            </div>
        `;

        content.querySelectorAll<HTMLElement>('.tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                content.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
                tab.classList.add('active');

                const tabName = tab.dataset.tab;
                ['questions', 'attempts', 'assign'].forEach((name) => {
                    document
                        .getElementById(`tab-${name}`)
                        ?.classList.toggle('hidden', name !== tabName);
                });
            });
        });

        content.querySelectorAll<HTMLElement>('.add-q-to-exam').forEach((button) => {
            button.addEventListener('click', async () => {
                const examIdValue = button.dataset.exam;
                const questionId = button.dataset.qid;
                if (!examIdValue || !questionId) return;

                try {
                    await apiFetch(`/exams/${examIdValue}/questions/${questionId}`, { method: 'POST' });
                    showToast('Question added to exam.', 'success');
                    await openExamDetail(examId);
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });

        content.querySelectorAll<HTMLElement>('.remove-q').forEach((button) => {
            button.addEventListener('click', async () => {
                const examIdValue = button.dataset.exam;
                const questionId = button.dataset.qid;
                if (!examIdValue || !questionId) return;

                try {
                    await apiFetch(`/exams/${examIdValue}/questions/${questionId}`, { method: 'DELETE' });
                    showToast('Question removed from exam.', 'success');
                    await openExamDetail(examId);
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });

        content.querySelectorAll<HTMLElement>('.evaluate-btn').forEach((button) => {
            button.addEventListener('click', async () => {
                const attemptId = button.dataset.id;
                if (!attemptId) return;

                try {
                    const result = await apiFetch<any>(`/attempts/${attemptId}/evaluate`, {
                        method: 'POST',
                    });
                    showToast(`Evaluated: ${result.score}/${result.max_score}`, 'success');
                    await openExamDetail(examId);
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });

        const assignButton = content.querySelector<HTMLButtonElement>('#assign-btn');
        assignButton?.addEventListener('click', async () => {
            const assignInput = content.querySelector<HTMLInputElement>('#assign-ids');
            const ids =
                assignInput?.value
                    .split(',')
                    .map((value) => Number.parseInt(value.trim(), 10))
                    .filter((value) => !Number.isNaN(value)) || [];

            if (!ids.length) {
                showToast('Enter at least one valid student ID.', 'warning');
                return;
            }

            try {
                await apiFetch(`/exams/${examId}/assign`, {
                    method: 'POST',
                    body: JSON.stringify({ student_ids: ids }),
                });
                showToast('Students assigned.', 'success');
            } catch (error: any) {
                showToast(error.message, 'error');
            }
        });

        openModal('exam-detail-modal');
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

function renderExamQuestions(exam: any): string {
    if (!exam.questions?.length) {
        return '<p class="text-sm text-muted">No questions added yet.</p>';
    }

    return exam.questions
        .map((entry: any) => {
            const question = entry.question || entry;
            return `
                <div class="detail-row">
                    <div class="flex items-center gap-sm">
                        <span class="badge badge-info">${question.type || 'MCQ'}</span>
                        <span class="text-sm">${escapeHtml((question.prompt || '').substring(0, 80))}</span>
                    </div>
                    <div class="flex items-center gap-sm">
                        <span class="chip">${question.marks || 1} marks</span>
                        <button class="icon-btn danger remove-q" data-exam="${exam.id}" data-qid="${entry.question_id}" title="Remove question">
                            ×
                        </button>
                    </div>
                </div>
            `;
        })
        .join('');
}

function renderAttemptsList(attempts: any[]): string {
    if (!attempts.length) {
        return renderEmptyState('AT', 'No attempts yet', 'Attempts will appear here once students start.');
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${attempts
                    .map(
                        (attempt) => `
                            <tr>
                                <td>#${attempt.id}</td>
                                <td><span class="badge ${getStatusBadgeClass(attempt.status)}">${attempt.status}</span></td>
                                <td class="text-sm">${new Date(attempt.started_at).toLocaleString()}</td>
                                <td>
                                    ${
                                        attempt.status === 'SUBMITTED'
                                            ? `<button class="btn btn-sm btn-success evaluate-btn" data-id="${attempt.id}">Evaluate</button>`
                                            : attempt.status === 'EVALUATED'
                                              ? '<span class="text-sm text-muted">Done</span>'
                                              : '<span class="text-sm text-muted">In progress</span>'
                                    }
                                </td>
                            </tr>
                        `,
                    )
                    .join('')}
            </tbody>
        </table>
    `;
}

async function loadUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    try {
        const users = await apiFetch<any[]>('/users/');

        tbody.innerHTML = users
            .map(
                (user) => `
                    <tr>
                        <td class="table-primary">${escapeHtml(user.name || '—')}</td>
                        <td>${escapeHtml(user.email)}</td>
                        <td>
                            <span class="badge ${
                                user.role === 'admin'
                                    ? 'badge-danger'
                                    : user.role === 'examiner'
                                      ? 'badge-warning'
                                      : 'badge-info'
                            }">${user.role}</span>
                        </td>
                        <td>
                            <span class="badge ${user.is_active ? 'badge-success' : 'badge-danger'}">
                                ${user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td style="text-align: right;">
                            <div class="flex gap-xs" style="justify-content: flex-end;">
                                <button class="icon-btn edit-user" data-id="${user.id}" data-name="${encodeURIComponent(user.name || '')}" data-email="${encodeURIComponent(user.email)}" data-role="${user.role}" title="Edit user">
                                    ✎
                                </button>
                                ${
                                    user.id !== currentUser.id
                                        ? `<button class="icon-btn danger delete-user" data-id="${user.id}" title="Delete user">×</button>`
                                        : ''
                                }
                            </div>
                        </td>
                    </tr>
                `,
            )
            .join('');

        attachUserListeners();
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

function attachUserListeners() {
    document.querySelectorAll<HTMLElement>('.edit-user').forEach((button) => {
        button.addEventListener('click', () => {
            openUserModal({
                id: Number.parseInt(button.dataset.id || '', 10),
                name: decodeURIComponent(button.dataset.name || ''),
                email: decodeURIComponent(button.dataset.email || ''),
                role: button.dataset.role,
            });
        });
    });

    document.querySelectorAll<HTMLElement>('.delete-user').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            if (!id || !window.confirm('Delete this user?')) return;

            try {
                await apiFetch(`/users/${id}`, { method: 'DELETE' });
                showToast('User deleted.', 'success');
                await loadUsers();
                await loadAdminStats();
            } catch (error: any) {
                showToast(error.message, 'error');
            }
        });
    });
}

function openUserModal(user?: any) {
    editingUserId = user ? user.id : null;

    const title = document.getElementById('user-modal-title');
    const submitButton = document.getElementById('user-submit-btn');
    const name = document.getElementById('user-name-input') as HTMLInputElement | null;
    const email = document.getElementById('user-email-input') as HTMLInputElement | null;
    const password = document.getElementById('user-password-input') as HTMLInputElement | null;
    const role = document.getElementById('user-role-input') as HTMLSelectElement | null;

    if (title) title.textContent = user ? 'Edit User' : 'Add User';
    if (submitButton) submitButton.textContent = user ? 'Save Changes' : 'Add User';
    if (name) name.value = user?.name || '';
    if (email) email.value = user?.email || '';
    if (password) {
        password.value = '';
        password.required = !user;
    }
    if (role) role.value = user?.role || 'student';

    openModal('user-modal');
}

async function handleUserSubmit(event: Event) {
    event.preventDefault();

    const body: any = {
        name: (document.getElementById('user-name-input') as HTMLInputElement).value,
        email: (document.getElementById('user-email-input') as HTMLInputElement).value,
        role: (document.getElementById('user-role-input') as HTMLSelectElement).value,
    };

    const password = (document.getElementById('user-password-input') as HTMLInputElement).value;
    if (password) body.password = password;

    try {
        if (editingUserId) {
            await apiFetch(`/users/${editingUserId}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });
            showToast('User updated.', 'success');
        } else {
            if (!password) {
                showToast('Password required for a new user.', 'warning');
                return;
            }

            await apiFetch('/users/', {
                method: 'POST',
                body: JSON.stringify(body),
            });
            showToast('User created.', 'success');
        }

        closeModal('user-modal');
        await loadUsers();
        await loadAdminStats();
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

async function loadQuestions() {
    const list = document.getElementById('questions-list');
    if (!list) return;

    try {
        const questions = await apiFetch<any[]>('/exams/questions');

        if (!questions.length) {
            list.innerHTML = renderEmptyState(
                'QB',
                'No questions yet',
                'Build your question bank here for reuse across exams.',
            );
            return;
        }

        list.innerHTML = questions
            .map(
                (question, index) => `
                    <div class="card question-card animate-in" style="animation-delay: ${index * 40}ms;">
                        <div class="question-card-header">
                            <div class="flex items-center gap-sm">
                                <span class="badge ${question.type === 'MCQ' ? 'badge-primary' : 'badge-purple'}">${question.type}</span>
                                <span class="chip">${question.marks} marks</span>
                            </div>
                            <button class="icon-btn danger delete-question" data-id="${question.id}" title="Delete question">×</button>
                        </div>
                        <p class="text-sm">${escapeHtml(question.prompt)}</p>
                        ${
                            question.options?.length
                                ? `
                                    <div class="flex gap-xs mt-2" style="flex-wrap: wrap;">
                                        ${question.options
                                            .map((option: string) => `<span class="chip">${escapeHtml(option)}</span>`)
                                            .join('')}
                                    </div>
                                `
                                : ''
                        }
                    </div>
                `,
            )
            .join('');

        document.querySelectorAll<HTMLElement>('.delete-question').forEach((button) => {
            button.addEventListener('click', async () => {
                const id = button.dataset.id;
                if (!id || !window.confirm('Delete this question?')) return;

                try {
                    await apiFetch(`/exams/questions/${id}`, { method: 'DELETE' });
                    showToast('Question deleted.', 'success');
                    await loadQuestions();
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

function openQuestionModal() {
    const title = document.getElementById('question-modal-title');
    const type = document.getElementById('q-type') as HTMLSelectElement | null;
    const prompt = document.getElementById('q-prompt') as HTMLTextAreaElement | null;
    const marks = document.getElementById('q-marks') as HTMLInputElement | null;
    const correct = document.getElementById('q-correct') as HTMLInputElement | null;

    if (title) title.textContent = 'Add Question';
    if (type) type.value = 'MCQ';
    if (prompt) prompt.value = '';
    if (marks) marks.value = '1';
    if (correct) correct.value = '';

    document.querySelectorAll<HTMLInputElement>('.mcq-option').forEach((input) => {
        input.value = '';
    });

    const optionsSection = document.getElementById('mcq-options-section');
    if (optionsSection) optionsSection.style.display = 'block';

    openModal('question-modal');
}

async function handleQuestionSubmit(event: Event) {
    event.preventDefault();

    const type = (document.getElementById('q-type') as HTMLSelectElement).value;
    const body: any = {
        type,
        prompt: (document.getElementById('q-prompt') as HTMLTextAreaElement).value,
        marks: Number.parseInt((document.getElementById('q-marks') as HTMLInputElement).value, 10),
    };

    if (type === 'MCQ') {
        body.options = Array.from(document.querySelectorAll<HTMLInputElement>('.mcq-option'))
            .map((input) => input.value.trim())
            .filter(Boolean);
        body.correct_option = (document.getElementById('q-correct') as HTMLInputElement).value;
    }

    try {
        await apiFetch('/exams/questions', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        showToast('Question created.', 'success');
        closeModal('question-modal');
        await loadQuestions();
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

async function loadResults() {
    const list = document.getElementById('results-list');
    if (!list) return;

    try {
        const attempts = await apiFetch<any[]>('/attempts/');
        const completedAttempts = attempts.filter(
            (attempt) => attempt.status === 'SUBMITTED' || attempt.status === 'EVALUATED',
        );

        if (!completedAttempts.length) {
            list.innerHTML = renderEmptyState(
                'RS',
                'No results yet',
                'Completed exam attempts will show up here.',
            );
            return;
        }

        list.innerHTML = completedAttempts
            .map(
                (attempt, index) => `
                    <div class="card card-interactive exam-card animate-in result-entry" data-attempt-id="${attempt.id}" style="cursor: pointer; animation-delay: ${index * 40}ms;">
                        <div class="exam-card-header">
                            <div>
                                <h3>Attempt #${attempt.id}</h3>
                                <p class="helper-text">Exam #${attempt.exam_id}</p>
                            </div>
                            <span class="badge ${getStatusBadgeClass(attempt.status)}">${attempt.status}</span>
                        </div>
                        <div class="exam-card-meta">
                            <span>${new Date(attempt.started_at).toLocaleDateString()}</span>
                            <span>Open result details</span>
                        </div>
                    </div>
                `,
            )
            .join('');

        document.querySelectorAll<HTMLElement>('.result-entry').forEach((entry) => {
            entry.addEventListener('click', () => {
                const attemptId = entry.dataset.attemptId;
                if (!attemptId) return;
                window.location.href = `/result.html?attempt_id=${attemptId}`;
            });
        });
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

async function loadReports() {
    const content = document.getElementById('reports-content');
    if (!content) return;

    try {
        const exams = await apiFetch<any[]>('/exams/');

        if (!exams.length) {
            content.innerHTML = renderEmptyState(
                'RP',
                'No report data',
                'Reports will appear once exams and attempts exist.',
            );
            return;
        }

        const summaries = await Promise.all(
            exams.map(async (exam) => {
                try {
                    const report = await apiFetch<any>(`/reports/exam/${exam.id}/summary`);
                    return { exam, report };
                } catch {
                    return null;
                }
            }),
        );

        const validSummaries = summaries.filter(Boolean) as Array<{ exam: any; report: any }>;

        if (!validSummaries.length) {
            content.innerHTML = renderEmptyState(
                'RP',
                'Reports unavailable',
                'Summary data could not be loaded right now.',
            );
            return;
        }

        content.innerHTML = validSummaries
            .map(
                ({ exam, report }) => `
                    <div class="card view-panel animate-in">
                        <div class="main-header">
                            <div class="flex flex-col gap-xs">
                                <span class="section-title">Summary</span>
                                <h3 class="card-title">${escapeHtml(exam.title)}</h3>
                            </div>
                            <span class="badge ${getStatusBadgeClass(exam.status)}">${exam.status}</span>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-card blue">
                                <div class="stat-card-value">${report.total_attempts}</div>
                                <div class="stat-card-label">Attempts</div>
                            </div>
                            <div class="stat-card green">
                                <div class="stat-card-value">${report.average_score}</div>
                                <div class="stat-card-label">Average Score</div>
                            </div>
                            <div class="stat-card amber">
                                <div class="stat-card-value">${report.total_submitted}</div>
                                <div class="stat-card-label">Submitted</div>
                            </div>
                            <div class="stat-card rose">
                                <div class="stat-card-value">${report.total_proctoring_violations}</div>
                                <div class="stat-card-label">Violations</div>
                            </div>
                        </div>
                    </div>
                `,
            )
            .join('');
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

void initDashboard();
