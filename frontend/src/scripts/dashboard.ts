import { apiFetch } from './api';
import {
    escapeHtml,
    formatDateTimeIst,
    formatTime,
    fromDateTimeLocalIstValue,
    getStatusBadgeClass,
    getUserInitials,
    toDateTimeLocalIstValue,
    removeAuthToken,
    showToast,
} from './utils';

let currentUser: any = null;
let editingExamId: number | null = null;
let editingUserId: number | null = null;
const views = ['exams', 'results', 'users', 'questions', 'reports', 'trash'] as const;
const REFRESH_INTERVAL_MS = 10000;
let activeView: (typeof views)[number] = 'exams';
let activeExamDetailId: number | null = null;
let refreshTimer: number | null = null;
let questionFolders: any[] = [];
let managedUsers: any[] = [];
let selectedQuestionFolderId: number | null = null;
let userSearchTimer: ReturnType<typeof setTimeout> | null = null;
let questionSearchTimer: ReturnType<typeof setTimeout> | null = null;
let trashSearchTimer: ReturnType<typeof setTimeout> | null = null;
let pendingExamStart: { examId: number; title: string; requiresPassword: boolean } | null = null;

// ── SVG icon snippets used throughout ─────────────────────────────────────────
const ICON = {
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    detail: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
    restore: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>`,
    folder: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    exam: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    question: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    statExams: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
    statLive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1.5"/><path d="M8.8 15.2a4.5 4.5 0 0 1 0-6.4"/><path d="M15.2 15.2a4.5 4.5 0 0 0 0-6.4"/><path d="M5.8 18.2a8.7 8.7 0 0 1 0-12.4"/><path d="M18.2 18.2a8.7 8.7 0 0 0 0-12.4"/></svg>`,
    statAttempts: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4.5h6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    statReview: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><circle cx="11" cy="14" r="2.6"/><path d="m13 16 2.4 2.4"/></svg>`,
};

function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    ) {
        return String((error as { message: string }).message);
    }
    return fallback;
}

function isStaffUser() {
    return currentUser?.role === 'admin' || currentUser?.role === 'examiner';
}

function isAdminUser() {
    return currentUser?.role === 'admin';
}

function canManageUserEntry(user: any) {
    return Boolean(user?.can_edit || user?.can_remove_access);
}

function getFolderShareSelections(containerId: string): number[] {
    const container = document.getElementById(containerId);
    if (!container) return [];

    return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')).map(
        (input) => Number.parseInt(input.value, 10),
    );
}

function getEditableQuestionFolders() {
    return questionFolders.filter((folder) => folder.can_edit);
}

function formatRemainingTime(remainingSeconds?: number, status?: string) {
    if (status !== 'IN_PROGRESS') return '—';
    if (typeof remainingSeconds !== 'number') return '—';
    return formatTime(remainingSeconds);
}

function getExamQuestionCount(exam: any) {
    return exam.question_count || exam.questions?.length || 0;
}

function getStudentAttemptCount(exam: any) {
    return exam.student_attempt_count || 0;
}

function getStudentAttemptStatus(exam: any) {
    return exam.student_attempt_status || '';
}

function getStudentActionLabel(exam: any) {
    const attemptsUsed = getStudentAttemptCount(exam);
    const attemptsAllowed = exam.max_attempts_per_student || 1;
    if (!attemptsUsed) return 'Start exam';
    if (getStudentAttemptStatus(exam) === 'IN_PROGRESS') return 'Resume exam';
    return attemptsUsed >= attemptsAllowed ? 'View Detail' : 'Start next attempt';
}

function getStaffExamHealthCopy(exam: any) {
    const attempts = exam.attempt_count || 0;
    const pending = exam.submitted_attempt_count || 0;
    const active = exam.in_progress_attempt_count || 0;
    const evaluated = exam.evaluated_attempt_count || 0;

    if (!attempts) return 'No attempts yet';
    return `${active} active • ${pending} pending review • ${evaluated} evaluated`;
}

function getFolderAccessCopy(folder: any) {
    if (folder.access_level === 'owner') return 'You own this bank';
    if (folder.access_level === 'admin') return 'Admin access';
    return 'Shared with you';
}

function syncUserRoleOptions(selectedRole?: string) {
    const roleSelect = document.getElementById('user-role-input') as HTMLSelectElement | null;
    const adminOption = document.getElementById('user-role-option-admin') as HTMLOptionElement | null;
    if (!roleSelect || !adminOption) return;

    const adminAllowed = isAdminUser();
    adminOption.disabled = !adminAllowed;
    adminOption.hidden = !adminAllowed;

    if (!adminAllowed && (selectedRole === 'admin' || roleSelect.value === 'admin')) {
        roleSelect.value = 'examiner';
    } else if (selectedRole) {
        roleSelect.value = selectedRole;
    }
}

async function loadExaminerDirectory() {
    const examiners = await apiFetch<any[]>('/users/?role=examiner&limit=200');
    return examiners.filter((user) => user.id !== currentUser?.id);
}

async function renderFolderShareOptions(containerId: string, selectedIds: number[] = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const examiners = await loadExaminerDirectory();
    if (!examiners.length) {
        container.innerHTML = '<p class="helper-text">No other examiners are available to share with right now.</p>';
        return;
    }

    const selected = new Set(selectedIds);
    container.innerHTML = examiners
        .map(
            (user) => `
                <label class="assignment-option">
                    <input
                        type="checkbox"
                        value="${user.id}"
                        ${selected.has(user.id) ? 'checked' : ''}
                    >
                    <div>
                        <strong>${escapeHtml(user.name || user.email)}</strong>
                        <p class="helper-text">${escapeHtml(user.email)}${user.is_active ? '' : ' • Inactive'}</p>
                    </div>
                </label>
            `,
        )
        .join('');
}

function renderEmptyState(icon: string, title: string, description: string): string {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${escapeHtml(title)}</div>
            <div class="empty-state-desc">${escapeHtml(description)}</div>
        </div>
    `;
}

function toggleBodyModalState() {
    const hasActiveModal = Array.from(document.querySelectorAll('.modal-overlay')).some((modal) =>
        modal.classList.contains('active'),
    );
    document.body.classList.toggle('modal-open', hasActiveModal);
}

function openModal(id: string) {
    document.getElementById(id)?.classList.add('active');
    toggleBodyModalState();
}

function closeModal(id: string) {
    document.getElementById(id)?.classList.remove('active');
    if (id === 'exam-detail-modal') {
        activeExamDetailId = null;
    }
    if (id === 'exam-start-modal') {
        pendingExamStart = null;
    }
    toggleBodyModalState();
}

function renderUserInfo() {
    const name = currentUser.name || currentUser.email;

    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    const userAvatar = document.getElementById('user-avatar');

    if (userName) userName.textContent = name;
    if (userRole) userRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    if (userAvatar) {
        const initials = getUserInitials(currentUser.name, currentUser.email);
        userAvatar.innerHTML = `<span style="font-weight:800;font-size:0.9rem;letter-spacing:-0.03em;">${initials}</span>`;
    }
}

function startAutoRefresh() {
    if (refreshTimer) {
        window.clearInterval(refreshTimer);
    }

    refreshTimer = window.setInterval(() => {
        void refreshActiveView(true);
    }, REFRESH_INTERVAL_MS);
}

async function refreshActiveView(silent = false) {
    if (isStaffUser()) {
        await loadAdminStats(silent);
    }

    if (activeView === 'exams') await loadExams(silent);
    if (activeView === 'results') await loadResults(silent);
    if (activeView === 'users' && isStaffUser()) await loadUsers(silent);
    if (activeView === 'questions' && isStaffUser()) await loadQuestions(silent);
    if (activeView === 'reports' && isStaffUser()) await loadReports(silent);
    if (activeView === 'trash' && isStaffUser()) await loadTrash(silent);

    const examDetailModal = document.getElementById('exam-detail-modal');
    if (activeExamDetailId && examDetailModal?.classList.contains('active')) {
        await openExamDetail(activeExamDetailId, { keepOpen: true, silent });
    }
}

function setupNavigation() {
    document.querySelectorAll<HTMLElement>('.nav-link[data-view]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const view = link.dataset.view as (typeof views)[number] | undefined;
            if (!view) return;
            void switchView(view);
        });
    });
}

async function switchView(view: (typeof views)[number]) {
    activeView = view;

    document.querySelectorAll('.nav-link[data-view]').forEach((link) => {
        link.classList.toggle('active', (link as HTMLElement).dataset.view === view);
    });

    views.forEach((name) => {
        document.getElementById(`view-${name}`)?.classList.toggle('hidden', name !== view);
    });

    await refreshActiveView(false);
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
    document
        .getElementById('create-question-btn')
        ?.addEventListener('click', () => void openQuestionModal());
    document.getElementById('create-folder-btn')?.addEventListener('click', () => void openFolderModal());
    document.getElementById('exam-form')?.addEventListener('submit', handleExamSubmit);
    document.getElementById('exam-password-required')?.addEventListener('change', syncExamPasswordControls);
    document.getElementById('exam-start-form')?.addEventListener('submit', handleExamStartSubmit);
    document.getElementById('user-form')?.addEventListener('submit', handleUserSubmit);
    document.getElementById('question-form')?.addEventListener('submit', handleQuestionSubmit);
    document.getElementById('folder-form')?.addEventListener('submit', handleFolderSubmit);
    document.getElementById('question-edit-form')?.addEventListener('submit', handleQuestionEditSubmit);
    document.getElementById('folder-edit-form')?.addEventListener('submit', handleFolderEditSubmit);

    // MCQ section toggle for create modal
    document.getElementById('q-type')?.addEventListener('change', (event) => {
        const value = (event.target as HTMLSelectElement).value;
        const optionsSection = document.getElementById('mcq-options-section');
        if (optionsSection) optionsSection.style.display = value === 'MCQ' ? 'block' : 'none';
    });
    // MCQ section toggle for edit modal
    document.getElementById('eq-type')?.addEventListener('change', (event) => {
        const value = (event.target as HTMLSelectElement).value;
        const optionsSection = document.getElementById('eq-mcq-section');
        if (optionsSection) optionsSection.style.display = value === 'MCQ' ? 'block' : 'none';
    });

    // User search with debounce
    document.getElementById('user-search-input')?.addEventListener('input', () => {
        if (userSearchTimer) clearTimeout(userSearchTimer);
        userSearchTimer = setTimeout(() => void loadUsers(true), 300);
    });
    document.getElementById('user-role-filter')?.addEventListener('change', () => void loadUsers(true));
    document.getElementById('question-search-input')?.addEventListener('input', () => {
        if (questionSearchTimer) clearTimeout(questionSearchTimer);
        questionSearchTimer = setTimeout(() => void loadQuestions(true), 300);
    });

    // Trash type filter
    document.getElementById('trash-type-filter')?.addEventListener('change', () => void loadTrash(true));
    document.getElementById('trash-search-input')?.addEventListener('input', () => {
        if (trashSearchTimer) clearTimeout(trashSearchTimer);
        trashSearchTimer = setTimeout(() => void loadTrash(true), 300);
    });
}

async function initDashboard() {
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await apiFetch('/auth/logout', { method: 'POST' }).catch(() => null);
        removeAuthToken();
        window.location.href = '/';
    });

    try {
        currentUser = await apiFetch('/users/me');
        renderUserInfo();
        setupNavigation();
        setupModals();

        // Role-based nav visibility
        if (isStaffUser()) {
            document.getElementById('staff-nav')?.classList.remove('hidden');
            document.getElementById('admin-controls')?.classList.remove('hidden');
            document.getElementById('trash-nav-wrap')?.classList.remove('hidden');
            document.getElementById('admin-nav')?.classList.remove('hidden');
        }
        if (!isAdminUser()) {
            document.getElementById('trash-user-option')?.remove();
        }
        syncUserRoleOptions();

        await refreshActiveView(false);
        startAutoRefresh();
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

async function loadAdminStats(silent = false) {
    if (!isStaffUser()) return;

    try {
        const stats = await apiFetch<any>('/reports/dashboard');
        const overview = stats.overview || stats;
        const statsBar = document.getElementById('stats-bar');
        if (!statsBar) return;

        statsBar.classList.remove('hidden');
        statsBar.innerHTML = `
            <div class="stat-card blue animate-in">
                <div class="stat-card-icon">${ICON.statExams}</div>
                <div class="stat-card-value">${overview.total_exams}</div>
                <div class="stat-card-label">Visible Exams</div>
                <div class="stat-card-note">${overview.draft_exams || 0} drafts • ${overview.closed_exams || 0} closed</div>
            </div>
            <div class="stat-card green animate-in" style="animation-delay: 40ms;">
                <div class="stat-card-icon">${ICON.statLive}</div>
                <div class="stat-card-value">${overview.live_exams}</div>
                <div class="stat-card-label">Live Exams</div>
                <div class="stat-card-note">${overview.active_attempts || 0} active attempts right now</div>
            </div>
            <div class="stat-card amber animate-in" style="animation-delay: 80ms;">
                <div class="stat-card-icon">${ICON.statAttempts}</div>
                <div class="stat-card-value">${overview.total_attempts}</div>
                <div class="stat-card-label">Attempts</div>
                <div class="stat-card-note">${formatPercent(overview.participation_rate)} participation</div>
            </div>
            <div class="stat-card rose animate-in" style="animation-delay: 120ms;">
                <div class="stat-card-icon">${ICON.statReview}</div>
                <div class="stat-card-value">${overview.pending_evaluation}</div>
                <div class="stat-card-label">Pending Review</div>
                <div class="stat-card-note">${overview.integrity_alerts || 0} integrity alerts</div>
            </div>
        `;
    } catch (error: any) {
        if (!silent) {
            showToast(error.message || 'Failed to load dashboard stats.', 'error');
        }
    }
}

async function loadExams(silent = false) {
    const list = document.getElementById('exam-list');
    if (!list) return;

    try {
        const exams = await apiFetch<any[]>('/exams/');
        list.innerHTML = '';

        if (!exams.length) {
            list.innerHTML = renderEmptyState(
                'EX',
                'No exams yet',
                isStaffUser()
                    ? 'Create your first exam or wait for a collaborator to assign one.'
                    : 'Assigned exams will appear here when they are ready.',
            );
            return;
        }

        exams.forEach((exam, index) => {
            const card = document.createElement('div');
            card.className = `card card-interactive exam-card ${
                isStaffUser() ? 'staff-exam-card' : 'student-exam-card'
            } animate-in`;
            card.style.animationDelay = `${index * 45}ms`;
            const scheduleMeta = exam.start_time
                ? `Starts ${formatDateTimeIst(exam.start_time)}`
                : 'No fixed start time';
            const passwordMeta = exam.password_required
                ? exam.requires_password
                    ? 'Password protected'
                    : 'Password setup needed'
                : 'No password';
            const questionCount = getExamQuestionCount(exam);
            const studentAttemptCount = getStudentAttemptCount(exam);
            const studentAttemptStatus = getStudentAttemptStatus(exam);
            const attemptsAllowed = exam.max_attempts_per_student || 1;

            card.innerHTML = `
                <div class="exam-card-header">
                    <div>
                        <h3>${escapeHtml(exam.title)}</h3>
                        ${
                            isStaffUser()
                                ? `<p class="helper-text">${escapeHtml(exam.instructions || 'No instructions added yet.')}</p>`
                                : ''
                        }
                    </div>
                    <span class="badge ${getStatusBadgeClass(exam.status)}">${escapeHtml(exam.status)}</span>
                </div>
                ${
                    isStaffUser()
                        ? `
                            <div class="exam-card-meta">
                                <span>${exam.duration_minutes} min</span>
                                <span>${exam.max_attempts_per_student || 1} attempt${(exam.max_attempts_per_student || 1) === 1 ? '' : 's'}</span>
                                <span>${questionCount} questions</span>
                                <span>${exam.teacher_assignments?.length || 0} teachers</span>
                                <span>${exam.assignments?.length || 0} students</span>
                            </div>
                            <div class="exam-detail-grid">
                                <div>
                                    <span>Schedule</span>
                                    <strong>${escapeHtml(scheduleMeta)}</strong>
                                </div>
                                <div>
                                    <span>Attempts</span>
                                    <strong>${exam.attempt_count || 0}</strong>
                                </div>
                                <div>
                                    <span>Review</span>
                                    <strong>${exam.submitted_attempt_count || 0} pending</strong>
                                </div>
                                <div>
                                    <span>Security</span>
                                    <strong>${escapeHtml(passwordMeta)}</strong>
                                </div>
                            </div>
                            <div class="helper-text">
                                ${escapeHtml(getStaffExamHealthCopy(exam))} • Created by ${escapeHtml(
                                    exam.creator?.name || exam.creator?.email || 'Team',
                                )}
                            </div>
                        `
                        : `
                            <div class="student-exam-summary">
                                <div>
                                    <span>No. of questions</span>
                                    <strong>${questionCount}</strong>
                                </div>
                                <div>
                                    <span>Attempt</span>
                                    <strong>${studentAttemptCount}/${attemptsAllowed}</strong>
                                    <small>${studentAttemptStatus ? escapeHtml(studentAttemptStatus) : 'Not started'}</small>
                                </div>
                            </div>
                        `
                }
                <div class="exam-card-actions">
                    ${
                        isStaffUser()
                            ? `
                                <div class="flex gap-xs">
                                    ${
                                        exam.can_manage_schedule
                                            ? `<button class="icon-btn edit-exam" data-id="${exam.id}" title="Edit schedule">${ICON.edit}</button>`
                                            : ''
                                    }
                                    <button class="icon-btn detail-exam" data-id="${exam.id}" title="Open details">${ICON.detail}</button>
                                    <button class="icon-btn danger delete-exam" data-id="${exam.id}" title="Delete exam">${ICON.trash}</button>
                                </div>
                            `
                            : '<div class="helper-text">Assigned exam</div>'
                    }
                    <button
                        class="btn btn-primary btn-sm start-btn"
                        data-id="${exam.id}"
                        data-title="${escapeHtml(exam.title)}"
                        data-requires-password="${exam.requires_password ? 'true' : 'false'}"
                        data-attempt-id="${exam.student_attempt_id || ''}"
                        data-attempt-status="${studentAttemptStatus}"
                        data-attempt-count="${studentAttemptCount}"
                        data-attempt-max="${attemptsAllowed}"
                    >
                        ${currentUser.role === 'student' ? getStudentActionLabel(exam) : 'View details'}
                    </button>
                </div>
            `;
            list.appendChild(card);
        });

        attachExamListeners();
    } catch (error: any) {
        if (!silent) {
            showToast(error.message || 'Unable to load exams.', 'error');
        }
        if (!list.innerHTML.trim()) {
            list.innerHTML = renderEmptyState(
                '!',
                'Unable to load exams',
                error.message || 'Please try again in a moment.',
            );
        }
    }
}

function attachExamListeners() {
    document.querySelectorAll<HTMLElement>('.start-btn').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            if (!id) return;

            if (currentUser.role === 'student') {
                const studentAttemptId = button.dataset.attemptId;
                const studentAttemptStatus = button.dataset.attemptStatus;
                const attemptCount = Number.parseInt(button.dataset.attemptCount || '0', 10);
                const attemptMax = Number.parseInt(button.dataset.attemptMax || '1', 10);

                if (studentAttemptId && studentAttemptStatus !== 'IN_PROGRESS' && attemptCount >= attemptMax) {
                    window.location.href = `/result.html?attempt_id=${studentAttemptId}`;
                    return;
                }

                openExamStartModal({
                    id: Number.parseInt(id, 10),
                    title: button.dataset.title || 'this exam',
                    requiresPassword: button.dataset.requiresPassword === 'true',
                });
                return;
            }

            await openExamDetail(Number.parseInt(id, 10));
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
                await refreshActiveView(true);
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

function openExamStartModal(exam: { id: number; title: string; requiresPassword: boolean }) {
    pendingExamStart = {
        examId: exam.id,
        title: exam.title,
        requiresPassword: exam.requiresPassword,
    };

    const title = document.getElementById('exam-start-modal-title');
    const prompt = document.getElementById('exam-start-modal-copy');
    const passwordInput = document.getElementById('exam-start-password') as HTMLInputElement | null;
    const passwordGroup = document.getElementById('exam-start-password-group');

    if (title) title.textContent = `Open ${exam.title}`;
    if (prompt) {
        prompt.textContent = exam.requiresPassword
            ? 'Enter the exam password to start or resume your attempt.'
            : 'This exam does not require a password. Continue to open your attempt.';
    }
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.required = exam.requiresPassword;
        passwordInput.disabled = !exam.requiresPassword;
        if (exam.requiresPassword) passwordInput.focus();
    }
    passwordGroup?.classList.toggle('hidden', !exam.requiresPassword);

    openModal('exam-start-modal');
}

async function handleExamStartSubmit(event: Event) {
    event.preventDefault();

    if (!pendingExamStart) {
        showToast('Select an exam first.', 'error');
        return;
    }

    const passwordInput = document.getElementById('exam-start-password') as HTMLInputElement | null;
    const password = passwordInput?.value || '';
    if (pendingExamStart.requiresPassword && !password.trim()) {
        showToast('Enter the exam password to continue.', 'warning');
        passwordInput?.focus();
        return;
    }

    try {
        const attempt = await apiFetch<any>(`/attempts/${pendingExamStart.examId}/start`, {
            method: 'POST',
            body: JSON.stringify({ password }),
        });

        closeModal('exam-start-modal');

        if (attempt.status === 'IN_PROGRESS') {
            window.location.href = `/exam.html?attempt_id=${attempt.id}`;
            return;
        }

        window.location.href = `/result.html?attempt_id=${attempt.id}`;
    } catch (error: any) {
        showToast(error.message, 'error');
        passwordInput?.focus();
        passwordInput?.select();
    }
}

function openExamModal(exam?: any) {
    editingExamId = exam ? exam.id : null;

    const title = document.getElementById('exam-modal-title');
    const submitButton = document.getElementById('exam-submit-btn');
    const examTitle = document.getElementById('exam-title') as HTMLInputElement | null;
    const instructions = document.getElementById('exam-instructions') as HTMLTextAreaElement | null;
    const duration = document.getElementById('exam-duration') as HTMLInputElement | null;
    const attemptLimit = document.getElementById('exam-attempt-limit') as HTMLInputElement | null;
    const startTime = document.getElementById('exam-start-time') as HTMLInputElement | null;
    const status = document.getElementById('exam-status') as HTMLSelectElement | null;
    const passwordRequired = document.getElementById('exam-password-required') as HTMLInputElement | null;
    const password = document.getElementById('exam-password') as HTMLInputElement | null;
    const passwordHelp = document.getElementById('exam-password-help');

    if (title) title.textContent = exam ? 'Edit Exam' : 'Create Exam';
    if (submitButton) submitButton.textContent = exam ? 'Save Changes' : 'Create Exam';
    if (examTitle) examTitle.value = exam?.title || '';
    if (instructions) instructions.value = exam?.instructions || '';
    if (duration) duration.value = exam?.duration_minutes?.toString() || '60';
    if (attemptLimit) attemptLimit.value = exam?.max_attempts_per_student?.toString() || '1';
    if (startTime) startTime.value = toDateTimeLocalIstValue(exam?.start_time);
    if (status) status.value = exam?.status || 'DRAFT';
    if (passwordRequired) passwordRequired.checked = exam ? Boolean(exam?.password_required) : true;
    if (password) {
        password.value = '';
        password.placeholder = exam ? 'Leave blank to keep the current exam password' : 'Enter exam password';
    }
    if (passwordHelp) {
        passwordHelp.textContent = exam
            ? exam?.password_required
                ? 'Only the assigned examiner or an admin can change the exam password. Leave this blank to keep the current password.'
                : 'Password protection is turned off for this exam.'
            : 'Students must enter this password before they can open the exam.';
    }
    syncExamPasswordControls();

    openModal('exam-modal');
}

function syncExamPasswordControls() {
    const passwordRequired = document.getElementById('exam-password-required') as HTMLInputElement | null;
    const password = document.getElementById('exam-password') as HTMLInputElement | null;
    const passwordHelp = document.getElementById('exam-password-help');
    const required = passwordRequired?.checked ?? true;

    if (password) {
        password.disabled = !required;
        password.required = required && !editingExamId;
    }
    if (passwordHelp && !required) {
        passwordHelp.textContent = 'Password protection is turned off for this exam.';
    } else if (passwordHelp && required && !editingExamId) {
        passwordHelp.textContent = 'Students must enter this password before they can open the exam.';
    }
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
        max_attempts_per_student: Number.parseInt(
            (document.getElementById('exam-attempt-limit') as HTMLInputElement).value,
            10,
        ),
        password_required: (document.getElementById('exam-password-required') as HTMLInputElement).checked,
        start_time: fromDateTimeLocalIstValue(
            (document.getElementById('exam-start-time') as HTMLInputElement).value,
        ),
        status: (document.getElementById('exam-status') as HTMLSelectElement).value,
    };
    const password = (document.getElementById('exam-password') as HTMLInputElement).value.trim();

    if (body.password_required && !editingExamId && !password) {
        showToast('Exam password is required before students can start the exam.', 'warning');
        return;
    }
    if (body.password_required && password) {
        (body as Record<string, unknown>).password = password;
    }

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
        await refreshActiveView(true);
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

function renderAvailableQuestionRows(examId: number, questions: any[]) {
    if (!questions.length) {
        return '<p class="text-sm text-muted">No additional accessible questions available.</p>';
    }

    return questions
        .map(
            (question: any) => `
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <span class="text-sm">${escapeHtml(question.prompt.substring(0, 110))}</span>
                        <span class="helper-text">
                            ${escapeHtml(question.folder?.name || 'Unfiled')} • ${escapeHtml(
                                question.owner?.name || question.owner?.email || 'Shared bank',
                            )}
                        </span>
                    </div>
                    <button class="btn btn-primary btn-sm add-q-to-exam" data-exam="${examId}" data-qid="${question.id}">
                        Add
                    </button>
                </div>
            `,
        )
        .join('');
}

function renderAvailableQuestionSection(
    examId: number,
    questions: any[],
    errorMessage: string | null,
) {
    if (errorMessage) {
        return `
            <div class="card" style="padding: 1rem; border: 1px dashed var(--border-color);">
                <div class="section-title mb-1">Question bank unavailable</div>
                <p class="helper-text">${escapeHtml(errorMessage)}</p>
            </div>
        `;
    }

    return renderAvailableQuestionRows(examId, questions);
}

function renderAssignmentChecklist(
    users: any[],
    selectedIds: Set<number>,
    type: 'teacher' | 'student',
) {
    if (!users.length) {
        return `<p class="text-sm text-muted">No ${type}s available.</p>`;
    }

    return `
        <div class="assignment-grid">
            ${users
                .map(
                    (user) => `
                        <label class="assignment-option">
                            <input
                                type="checkbox"
                                class="assign-${type}"
                                value="${user.id}"
                                ${selectedIds.has(user.id) ? 'checked' : ''}
                            >
                            <div>
                                <strong>${escapeHtml(user.name || user.email)}</strong>
                                <p class="helper-text">${escapeHtml(user.email)}</p>
                            </div>
                        </label>
                    `,
                )
                .join('')}
        </div>
    `;
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
                    <div class="flex flex-col gap-xs">
                        <div class="flex items-center gap-sm">
                            <span class="badge badge-info">${question.type || 'MCQ'}</span>
                            <span class="chip">${question.marks || 1} marks</span>
                            ${
                                question.folder?.name
                                    ? `<span class="chip">${escapeHtml(question.folder.name)}</span>`
                                    : ''
                            }
                        </div>
                        <span class="text-sm">${escapeHtml((question.prompt || '').substring(0, 110))}</span>
                    </div>
                    <button class="icon-btn danger remove-q" data-exam="${exam.id}" data-qid="${entry.question_id}" title="Remove question">
                        ×
                    </button>
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
                    <th>Student</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Time Left</th>
                    <th>Score</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${attempts
                    .map(
                        (attempt) => `
                            <tr>
                                <td class="table-primary">${escapeHtml(
                                    attempt.student?.name || attempt.student?.email || `Student #${attempt.student_id}`,
                                )}</td>
                                <td><span class="badge ${getStatusBadgeClass(attempt.status)}">${attempt.status}</span></td>
                                <td class="text-sm">${formatDateTimeIst(attempt.started_at)}</td>
                                <td class="text-sm">${formatRemainingTime(attempt.remaining_seconds, attempt.status)}</td>
                                <td>
                                    ${
                                        attempt.result
                                            ? `${attempt.result.total_score}/${attempt.result.max_score}`
                                            : '—'
                                    }
                                </td>
                                <td>
                                    <div class="flex gap-xs">
                                        ${
                                            attempt.status === 'SUBMITTED'
                                                ? `<button class="btn btn-sm btn-success evaluate-btn" data-id="${attempt.id}">Evaluate</button>`
                                                : ''
                                        }
                                        ${
                                            attempt.status === 'SUBMITTED' || attempt.status === 'EVALUATED'
                                                ? `<a class="btn btn-ghost btn-sm" href="/result.html?attempt_id=${attempt.id}">Open report</a>`
                                                : '<span class="text-sm text-muted">In progress</span>'
                                        }
                                        <button class="btn btn-ghost btn-sm delete-attempt" data-id="${attempt.id}">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `,
                    )
                    .join('')}
            </tbody>
        </table>
    `;
}

async function openExamDetail(
    examId: number,
    options: { keepOpen?: boolean; silent?: boolean } = {},
) {
    const { keepOpen = false, silent = false } = options;

    try {
        activeExamDetailId = examId;

        const [examResult, questionsResult, attemptsResult, teachersResult, studentsResult] = await Promise.allSettled([
            apiFetch<any>(`/exams/${examId}`),
            apiFetch<any[]>('/exams/questions'),
            apiFetch<any[]>(`/attempts/exam/${examId}`),
            apiFetch<any[]>('/users/?role=examiner'),
            apiFetch<any[]>('/users/?role=student'),
        ]);

        if (examResult.status !== 'fulfilled') {
            throw examResult.reason;
        }

        const exam = examResult.value;
        const questions = questionsResult.status === 'fulfilled' ? questionsResult.value : [];
        const attempts = attemptsResult.status === 'fulfilled' ? attemptsResult.value : [];
        const teachers = teachersResult.status === 'fulfilled' ? teachersResult.value : [];
        const students = studentsResult.status === 'fulfilled' ? studentsResult.value : [];
        const availableQuestionsError =
            questionsResult.status === 'rejected'
                ? getErrorMessage(
                      questionsResult.reason,
                      'The question bank could not be loaded for this exam right now.',
                  )
                : null;

        const content = document.getElementById('exam-detail-content');
        const title = document.getElementById('exam-detail-title');
        if (!content || !title) return;

        title.textContent = exam.title;

        const selectedTeacherIds: Set<number> = new Set(
            (exam.teacher_assignments || []).map((assignment: any) => assignment.teacher_id),
        );
        const selectedStudentIds: Set<number> = new Set(
            (exam.assignments || []).map((assignment: any) => assignment.student_id),
        );
        const assignedQuestionIds = (exam.questions || []).map((entry: any) => entry.question_id);
        const availableQuestions = availableQuestionsError
            ? []
            : questions.filter((question: any) => !assignedQuestionIds.includes(question.id));

        content.innerHTML = `
            <div class="tabs">
                <button class="tab active" data-tab="questions">Questions (${exam.questions?.length || 0})</button>
                <button class="tab" data-tab="attempts">Attempts (${attempts.length})</button>
                <button class="tab" data-tab="assign">Assignments</button>
            </div>

            <div id="tab-questions">
                ${renderExamQuestions(exam)}
                <div class="detail-divider"></div>
                <div class="section-title mb-1">Add From Question Bank</div>
                ${renderAvailableQuestionSection(examId, availableQuestions, availableQuestionsError)}
            </div>

            <div id="tab-attempts" class="hidden">
                ${renderAttemptsList(attempts)}
            </div>

            <div id="tab-assign" class="hidden">
                <div class="stack-list">
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Teachers</div>
                        <p class="helper-text mb-2">
                            Assigned teachers can see this exam, manage questions, and review attempts.
                        </p>
                        ${renderAssignmentChecklist(teachers, selectedTeacherIds, 'teacher')}
                    </div>
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Students</div>
                        <p class="helper-text mb-2">
                            Assigned students will see the exam on their dashboard once it becomes available.
                        </p>
                        ${renderAssignmentChecklist(students, selectedStudentIds, 'student')}
                    </div>
                    <div class="flex items-center justify-between gap-sm">
                        <p class="helper-text">Question folders used in this exam will be shared to assigned teachers automatically.</p>
                        <button class="btn btn-primary" id="assign-btn">Save assignments</button>
                    </div>
                </div>
            </div>
        `;

        content.querySelectorAll<HTMLElement>('.tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                content.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
                tab.classList.add('active');

                const tabName = tab.dataset.tab;
                ['questions', 'attempts', 'assign'].forEach((name) => {
                    content.querySelector<HTMLElement>(`#tab-${name}`)?.classList.toggle('hidden', name !== tabName);
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
                    await openExamDetail(examId, { keepOpen: true });
                    await loadQuestions(true);
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
                    await openExamDetail(examId, { keepOpen: true });
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
                    await openExamDetail(examId, { keepOpen: true });
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });

        content.querySelectorAll<HTMLElement>('.delete-attempt').forEach((button) => {
            button.addEventListener('click', async () => {
                const attemptId = button.dataset.id;
                if (!attemptId || !window.confirm('Delete this submission? It will move to Recently Deleted.')) {
                    return;
                }

                try {
                    await apiFetch(`/attempts/${attemptId}`, { method: 'DELETE' });
                    showToast('Submission moved to Recently Deleted.', 'success');
                    await openExamDetail(examId, { keepOpen: true });
                    await loadResults(true);
                    await loadAdminStats(true);
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });

        content.querySelector<HTMLButtonElement>('#assign-btn')?.addEventListener('click', async () => {
            const teacherIds = Array.from(
                content.querySelectorAll<HTMLInputElement>('.assign-teacher:checked'),
            ).map((input) => Number.parseInt(input.value, 10));
            const studentIds = Array.from(
                content.querySelectorAll<HTMLInputElement>('.assign-student:checked'),
            ).map((input) => Number.parseInt(input.value, 10));

            try {
                await apiFetch(`/exams/${examId}/assign`, {
                    method: 'POST',
                    body: JSON.stringify({ teacher_ids: teacherIds, student_ids: studentIds }),
                });
                showToast('Assignments updated.', 'success');
                await openExamDetail(examId, { keepOpen: true });
                await loadExams(true);
            } catch (error: any) {
                showToast(error.message, 'error');
            }
        });

        if (!keepOpen) {
            openModal('exam-detail-modal');
        }
    } catch (error: any) {
        if (!silent) {
            showToast(error.message, 'error');
        }
    }
}

async function loadUsers(silent = false) {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    try {
        const q = (document.getElementById('user-search-input') as HTMLInputElement)?.value?.trim();
        const roleFilter = (document.getElementById('user-role-filter') as HTMLSelectElement)?.value;
        let url = '/users/?limit=200';
        if (q) url += `&q=${encodeURIComponent(q)}`;
        if (roleFilter) url += `&role=${encodeURIComponent(roleFilter)}`;

        managedUsers = await apiFetch<any[]>(url);

        tbody.innerHTML = managedUsers
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
                            <div class="table-action-stack">
                                <div class="flex gap-xs" style="justify-content: flex-end; flex-wrap: wrap;">
                                    ${
                                        user.can_edit
                                            ? `<button class="icon-btn edit-user" data-id="${user.id}" title="Edit user">${ICON.edit}</button>`
                                            : ''
                                    }
                                    ${
                                        user.can_toggle_active
                                            ? `<button class="btn btn-ghost btn-sm toggle-user-access" data-id="${user.id}" data-next-active="${user.is_active ? 'false' : 'true'}">${
                                                  user.is_active ? 'Remove access' : 'Restore access'
                                              }</button>`
                                            : ''
                                    }
                                    ${
                                        user.can_delete
                                            ? `<button class="icon-btn danger delete-user" data-id="${user.id}" title="Delete user">${ICON.trash}</button>`
                                            : ''
                                    }
                                </div>
                                ${
                                    canManageUserEntry(user) || user.can_delete
                                        ? ''
                                        : `<span class="table-action-note">${escapeHtml(user.protected_reason || 'View only')}</span>`
                                }
                            </div>
                        </td>
                    </tr>
                `,
            )
            .join('');

        attachUserListeners();
    } catch (error: any) {
        if (!silent) {
            showToast(error.message, 'error');
        }
    }
}

function attachUserListeners() {
    document.querySelectorAll<HTMLElement>('.edit-user').forEach((button) => {
        button.addEventListener('click', () => {
            const userId = Number.parseInt(button.dataset.id || '', 10);
            const user = managedUsers.find((entry) => entry.id === userId);
            if (!user) return;
            openUserModal(user);
        });
    });

    document.querySelectorAll<HTMLElement>('.toggle-user-access').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            const nextActive = button.dataset.nextActive === 'true';
            if (!id) return;

            const prompt = nextActive
                ? 'Restore access for this user?'
                : 'Remove access for this user?';
            if (!window.confirm(prompt)) return;

            try {
                await apiFetch(`/users/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ is_active: nextActive }),
                });
                showToast(nextActive ? 'Access restored.' : 'Access removed.', 'success');
                await loadUsers(true);
                await loadAdminStats(true);
            } catch (error: any) {
                showToast(error.message, 'error');
            }
        });
    });

    document.querySelectorAll<HTMLElement>('.delete-user').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            if (!id || !window.confirm('Delete this user?')) return;

            try {
                await apiFetch(`/users/${id}`, { method: 'DELETE' });
                showToast('User moved to Recently Deleted.', 'success');
                await loadUsers(true);
                await loadAdminStats(true);
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
    syncUserRoleOptions(user?.role || 'student');

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
        await loadUsers(true);
        await loadAdminStats(true);
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

async function loadQuestionFolders() {
    if (!isStaffUser()) return [];
    questionFolders = await apiFetch<any[]>('/exams/question-folders');

    if (selectedQuestionFolderId && !questionFolders.some((folder) => folder.id === selectedQuestionFolderId)) {
        selectedQuestionFolderId = null;
    }

    return questionFolders;
}

async function selectQuestionFolder(folderId: number | null) {
    selectedQuestionFolderId = folderId;
    await loadQuestions(true);
}

function populateQuestionFolderSelect() {
    const folderSelect = document.getElementById('q-folder') as HTMLSelectElement | null;
    if (!folderSelect) return;

    const editableFolders = getEditableQuestionFolders();
    folderSelect.innerHTML = editableFolders
        .map(
            (folder) => `
                <option value="${folder.id}">
                    ${folder.name}${folder.access_level === 'shared' ? ' (Shared)' : ''}
                </option>
            `,
        )
        .join('');

    if (!editableFolders.length) {
        folderSelect.innerHTML = '<option value="">Create or own a folder first</option>';
    }
}

function renderQuestionFolderToolbar() {
    const toolbar = document.getElementById('question-folder-toolbar');
    if (!toolbar) return;

    if (!questionFolders.length) {
        toolbar.innerHTML = renderEmptyState(
            ICON.folder,
            'No folders yet',
            'Create your first question folder to organize a personal or shared question bank.',
        );
        return;
    }

    toolbar.innerHTML = `
        <div class="card" style="padding: 1rem; margin-bottom: 1rem;">
            <div class="section-title mb-1">Folders</div>
            <div class="trash-list-stack" style="max-height:280px; overflow-y:auto;">
                ${questionFolders.map((folder) => {
                    return `
                        <div
                            class="folder-card ${selectedQuestionFolderId === folder.id ? 'folder-active' : ''}"
                            data-folder-id="${folder.id}"
                            role="button"
                            tabindex="0"
                            aria-pressed="${selectedQuestionFolderId === folder.id}"
                            aria-label="Open question folder"
                        >
                            <div class="folder-card-icon">${ICON.folder}</div>
                            <div>
                                <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(folder.name)}</div>
                                <div class="helper-text" style="font-size:0.82rem;">
                                    ${folder.question_count || 0} questions
                                    • ${escapeHtml(getFolderAccessCopy(folder))}
                                    ${folder.shared_with?.length ? ` • Shared with ${folder.shared_with.length} examiner${folder.shared_with.length === 1 ? '' : 's'}` : ''}
                                </div>
                            </div>
                            <div class="folder-card-actions">
                                ${folder.can_share ? `<button class="icon-btn edit-folder" data-id="${folder.id}" title="Edit folder">${ICON.edit}</button>` : ''}
                                <button class="icon-btn ${selectedQuestionFolderId === folder.id ? 'btn-primary' : ''} folder-filter" data-folder="${folder.id}" title="Filter by folder" style="font-size:0.7rem;width:auto;padding:0 0.5rem;">${selectedQuestionFolderId === folder.id ? '✓' : 'Filter'}</button>
                                ${folder.can_delete ? `<button class="icon-btn danger delete-folder" data-id="${folder.id}" title="Delete folder">${ICON.trash}</button>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top:0.75rem;">
                <button class="btn btn-sm ${selectedQuestionFolderId === null ? 'btn-primary' : 'btn-ghost'} folder-filter" data-folder="">
                    Show all questions
                </button>
            </div>
        </div>
    `;

    toolbar.querySelectorAll<HTMLElement>('.folder-card[data-folder-id]').forEach((card) => {
        const activateFolder = async () => {
            const folderId = Number.parseInt(card.dataset.folderId || '', 10);
            if (Number.isNaN(folderId)) return;
            await selectQuestionFolder(folderId);
        };

        card.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.closest('.folder-card-actions')) return;
            void activateFolder();
        });

        card.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            void activateFolder();
        });
    });

    toolbar.querySelectorAll<HTMLElement>('.folder-filter').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const folderValue = button.dataset.folder;
            const folderId =
                folderValue && folderValue.trim() ? Number.parseInt(folderValue, 10) : null;
            void selectQuestionFolder(Number.isNaN(folderId as number) ? null : folderId);
        });
    });

    toolbar.querySelectorAll<HTMLElement>('.edit-folder').forEach((button) => {
        button.addEventListener('click', () => {
            const id = Number(button.dataset.id);
            const folder = questionFolders.find((f) => f.id === id);
            if (!folder) return;
            void openFolderEditModal(folder);
        });
    });

    toolbar.querySelectorAll<HTMLElement>('.delete-folder').forEach((button) => {
        button.addEventListener('click', async () => {
            const id = button.dataset.id;
            if (!id || !window.confirm('Move this folder and all its questions to Recently Deleted?')) return;
            try {
                await apiFetch(`/exams/question-folders/${id}`, { method: 'DELETE' });
                showToast('Folder moved to Recently Deleted.', 'success');
                selectedQuestionFolderId = null;
                await loadQuestions(true);
            } catch (error: any) {
                showToast(error.message, 'error');
            }
        });
    });
}

async function loadQuestions(silent = false) {
    const list = document.getElementById('questions-list');
    if (!list) return;

    try {
        await loadQuestionFolders();
        renderQuestionFolderToolbar();
        populateQuestionFolderSelect();

        const params = new URLSearchParams();
        const search = (document.getElementById('question-search-input') as HTMLInputElement | null)?.value?.trim();
        if (selectedQuestionFolderId) {
            params.set('folder_id', String(selectedQuestionFolderId));
        }
        if (search) {
            params.set('q', search);
        }
        const query = params.toString() ? `?${params.toString()}` : '';
        const questions = await apiFetch<any[]>(`/exams/questions${query}`);

        if (!questions.length) {
            list.innerHTML = renderEmptyState(
                'QB',
                'No questions yet',
                'Build your question bank here for reuse across exams and collaborator assignments.',
            );
            return;
        }

        list.innerHTML = questions
            .map(
                (question, index) => `
                    <div class="card question-card animate-in" style="animation-delay: ${index * 35}ms;">
                        <div class="question-card-header">
                            <div class="flex items-center gap-sm">
                                <span class="badge ${question.type === 'MCQ' ? 'badge-primary' : 'badge-purple'}">${question.type}</span>
                                <span class="chip">${question.marks} marks</span>
                                ${
                                    question.folder?.name
                                        ? `<span class="chip">${escapeHtml(question.folder.name)}</span>`
                                        : ''
                                }
                            </div>
                            <div class="question-card-actions">
                                ${
                                    question.can_edit
                                        ? `<button class="icon-btn edit-question" data-id="${question.id}" title="Edit question">${ICON.edit}</button>`
                                        : ''
                                }
                                ${
                                    question.can_delete
                                        ? `<button class="icon-btn danger delete-question" data-id="${question.id}" title="Delete question">${ICON.trash}</button>`
                                        : ''
                                }
                            </div>
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
                        <p class="helper-text mt-2">
                            ${escapeHtml(question.owner?.name || question.owner?.email || 'Personal bank')}
                            ${
                                question.folder ? ` • ${escapeHtml(getFolderAccessCopy(question.folder))}` : ''
                            }
                        </p>
                    </div>
                `,
            )
            .join('');

        document.querySelectorAll<HTMLElement>('.edit-question').forEach((button) => {
            button.addEventListener('click', () => {
                const id = Number(button.dataset.id);
                const question = questions.find((q: any) => q.id === id);
                if (!question) return;
                openQuestionEditModal(question);
            });
        });

        document.querySelectorAll<HTMLElement>('.delete-question').forEach((button) => {
            button.addEventListener('click', async () => {
                const id = button.dataset.id;
                if (!id || !window.confirm('Move this question to Recently Deleted?')) return;

                try {
                    await apiFetch(`/exams/questions/${id}`, { method: 'DELETE' });
                    showToast('Question moved to Recently Deleted.', 'success');
                    await loadQuestions(true);
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });
    } catch (error: any) {
        if (!silent) {
            showToast(error.message, 'error');
        }
        list.innerHTML = renderEmptyState(
            '!',
            'Question bank unavailable',
            error.message || 'Please try again in a moment.',
        );
    }
}

async function openFolderModal() {
    const title = document.getElementById('folder-modal-title');
    const submitButton = document.getElementById('folder-submit-btn');
    const name = document.getElementById('folder-name') as HTMLInputElement | null;
    const description = document.getElementById('folder-description') as HTMLTextAreaElement | null;

    if (title) title.textContent = 'Create Folder';
    if (submitButton) submitButton.textContent = 'Create Folder';
    if (name) name.value = '';
    if (description) description.value = '';
    await renderFolderShareOptions('folder-share-list');

    openModal('folder-modal');
}

async function handleFolderSubmit(event: Event) {
    event.preventDefault();

    const body = {
        name: (document.getElementById('folder-name') as HTMLInputElement).value,
        description: (document.getElementById('folder-description') as HTMLTextAreaElement).value,
        share_with_teacher_ids: getFolderShareSelections('folder-share-list'),
    };

    try {
        await apiFetch('/exams/question-folders', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        showToast('Folder created.', 'success');
        closeModal('folder-modal');
        await loadQuestions(true);
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

async function openQuestionModal() {
    await loadQuestionFolders();
    const editableFolders = getEditableQuestionFolders();

    if (!editableFolders.length) {
        showToast('Create or own a question folder before adding questions.', 'warning');
        void openFolderModal();
        return;
    }

    populateQuestionFolderSelect();

    const title = document.getElementById('question-modal-title');
    const type = document.getElementById('q-type') as HTMLSelectElement | null;
    const prompt = document.getElementById('q-prompt') as HTMLTextAreaElement | null;
    const marks = document.getElementById('q-marks') as HTMLInputElement | null;
    const correct = document.getElementById('q-correct') as HTMLInputElement | null;
    const folder = document.getElementById('q-folder') as HTMLSelectElement | null;

    if (title) title.textContent = 'Add Question';
    if (type) type.value = 'MCQ';
    if (prompt) prompt.value = '';
    if (marks) marks.value = '1';
    if (correct) correct.value = '';
    if (folder) {
        const preferredFolderId =
            (selectedQuestionFolderId && editableFolders.some((entry) => entry.id === selectedQuestionFolderId)
                ? selectedQuestionFolderId
                : null) || editableFolders[0]?.id;
        folder.value = preferredFolderId ? preferredFolderId.toString() : '';
    }

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
    const folderId = Number.parseInt((document.getElementById('q-folder') as HTMLSelectElement).value, 10);
    const body: any = {
        type,
        prompt: (document.getElementById('q-prompt') as HTMLTextAreaElement).value,
        marks: Number.parseInt((document.getElementById('q-marks') as HTMLInputElement).value, 10),
        folder_id: Number.isNaN(folderId) ? undefined : folderId,
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
        await loadQuestions(true);
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

function renderStudentResultsSummary(summary: any): string {
    const overview = summary?.overview || {};

    return `
        <section class="card report-hero animate-in">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Student Analytics</span>
                    <h3 class="panel-title">Your progress across submitted and evaluated exams</h3>
                </div>
                <p class="report-panel-copy">
                    This personal view updates automatically as new results are evaluated.
                </p>
            </div>

            <div class="report-kpi-grid compact">
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Attempts</span>
                    <strong class="report-kpi-value">${overview.attempt_count || 0}</strong>
                    <span class="report-kpi-note">${overview.evaluated_count || 0} evaluated</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Average Score</span>
                    <strong class="report-kpi-value">${formatPercent(overview.average_percentage)}</strong>
                    <span class="report-kpi-note">Best ${formatPercent(overview.best_percentage)}</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Flags</span>
                    <strong class="report-kpi-value">${overview.total_flags || 0}</strong>
                    <span class="report-kpi-note">Across all attempts</span>
                </div>
            </div>
        </section>
    `;
}

async function loadResults(silent = false) {
    const list = document.getElementById('results-list');
    const summary = document.getElementById('results-summary');
    if (!list || !summary) return;

    try {
        const studentSummaryPromise =
            currentUser.role === 'student'
                ? apiFetch<any>('/reports/student/me').catch(() => null)
                : Promise.resolve(null);
        const [attempts, studentSummary] = await Promise.all([
            apiFetch<any[]>('/attempts/'),
            studentSummaryPromise,
        ]);

        summary.innerHTML = studentSummary ? renderStudentResultsSummary(studentSummary) : '';

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
                    <div class="card card-interactive exam-card animate-in result-entry" data-attempt-id="${attempt.id}" style="cursor: pointer; animation-delay: ${index * 35}ms;">
                        <div class="exam-card-header">
                            <div>
                                <h3>${
                                    currentUser.role === 'student'
                                        ? `Attempt #${attempt.id}`
                                        : escapeHtml(
                                              attempt.student?.name ||
                                                  attempt.student?.email ||
                                                  `Attempt #${attempt.id}`,
                                          )
                                }</h3>
                                <p class="helper-text">
                                    Exam #${attempt.exam_id}
                                    ${
                                        attempt.result
                                            ? ` • Score ${attempt.result.total_score}/${attempt.result.max_score}`
                                            : ''
                                    }
                                </p>
                            </div>
                            <span class="badge ${getStatusBadgeClass(attempt.status)}">${attempt.status}</span>
                        </div>
                        <div class="exam-card-meta">
                            <span>${formatDateTimeIst(attempt.started_at)}</span>
                            <span>Open analytics</span>
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
        if (!silent) {
            showToast(error.message, 'error');
        }
        list.innerHTML = renderEmptyState(
            '!',
            'Results unavailable',
            error.message || 'Please try again in a moment.',
        );
    }
}

function formatPercent(value: number | null | undefined): string {
    const safeValue = Number.isFinite(value) ? Number(value) : 0;
    return `${safeValue.toFixed(1).replace(/\.0$/, '')}%`;
}

function formatValue(value: number | null | undefined): string {
    const safeValue = Number.isFinite(value) ? Number(value) : 0;
    return safeValue.toFixed(1).replace(/\.0$/, '');
}

function renderBarRows(
    items: Array<{ label: string; count: number }>,
    tone: 'blue' | 'green' | 'amber' | 'rose' = 'blue',
    emptyText = 'No data yet.',
): string {
    if (!items.length || items.every((item) => item.count === 0)) {
        return `<p class="helper-text">${emptyText}</p>`;
    }

    const maxValue = Math.max(...items.map((item) => item.count), 1);

    return `
        <div class="report-bars">
            ${items
                .map(
                    (item) => `
                        <div class="report-bar-row">
                            <div class="report-bar-head">
                                <span>${escapeHtml(item.label)}</span>
                                <span>${item.count}</span>
                            </div>
                            <div class="report-bar-track">
                                <div class="report-bar-fill ${tone}" style="width: ${(item.count / maxValue) * 100}%"></div>
                            </div>
                        </div>
                    `,
                )
                .join('')}
        </div>
    `;
}

function renderDonutCard(
    label: string,
    value: number | null | undefined,
    note: string,
    tone: 'blue' | 'green' | 'amber' | 'rose',
): string {
    const safeValue = Math.max(0, Math.min(100, Number.isFinite(value) ? Number(value) : 0));

    return `
        <div class="report-donut-card">
            <div class="report-donut ${tone}" style="--value:${safeValue}">
                <span>${formatPercent(safeValue)}</span>
            </div>
            <h4>${escapeHtml(label)}</h4>
            <p>${escapeHtml(note)}</p>
        </div>
    `;
}

function renderTimelineChart(
    timeline: Array<{ label: string; started: number; submitted: number; evaluated: number }>,
): string {
    if (!timeline.length) {
        return '<p class="helper-text">No recent activity yet.</p>';
    }

    const maxValue = Math.max(
        ...timeline.flatMap((item) => [item.started, item.submitted, item.evaluated]),
        1,
    );

    return `
        <div class="timeline-legend">
            <span><i class="legend-dot blue"></i>Started</span>
            <span><i class="legend-dot amber"></i>Submitted</span>
            <span><i class="legend-dot green"></i>Evaluated</span>
        </div>
        <div class="timeline-grid">
            ${timeline
                .map(
                    (item) => `
                        <div class="timeline-day">
                            <div class="timeline-day-bars">
                                <span class="timeline-bar blue" style="height:${(item.started / maxValue) * 100}%"></span>
                                <span class="timeline-bar amber" style="height:${(item.submitted / maxValue) * 100}%"></span>
                                <span class="timeline-bar green" style="height:${(item.evaluated / maxValue) * 100}%"></span>
                            </div>
                            <span class="timeline-day-label">${escapeHtml(item.label)}</span>
                        </div>
                    `,
                )
                .join('')}
        </div>
    `;
}

function renderTopExamsTable(topExams: Array<any>): string {
    if (!topExams.length) {
        return '<p class="helper-text">No exam analytics available yet.</p>';
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Exam</th>
                    <th>Attempts</th>
                    <th>Completion</th>
                    <th>Avg Score</th>
                </tr>
            </thead>
            <tbody>
                ${topExams
                    .map(
                        (exam) => `
                            <tr>
                                <td class="table-primary">${escapeHtml(exam.title)}</td>
                                <td>${exam.attempt_count}</td>
                                <td>${formatPercent(exam.completion_rate)}</td>
                                <td>${formatPercent(exam.average_percentage)}</td>
                            </tr>
                        `,
                    )
                    .join('')}
            </tbody>
        </table>
    `;
}

function renderQuestionInsights(questionInsights: Array<any>): string {
    if (!questionInsights.length) {
        return '<p class="helper-text">Question-level analytics will appear after candidates start submitting.</p>';
    }

    return `
        <div class="insight-list">
            ${questionInsights
                .slice(0, 4)
                .map(
                    (item) => `
                        <div class="insight-item">
                            <div class="insight-item-head">
                                <span class="badge ${item.type === 'MCQ' ? 'badge-primary' : 'badge-purple'}">${item.type}</span>
                                <span class="chip">${escapeHtml(item.difficulty)}</span>
                            </div>
                            <p class="text-sm">${escapeHtml(item.prompt)}</p>
                            <div class="insight-item-meta">
                                <span>Response ${formatPercent(item.response_rate)}</span>
                                ${
                                    item.type === 'MCQ'
                                        ? `<span>Correct ${formatPercent(item.correct_rate)}</span>`
                                        : `<span>Avg marks ${formatValue(item.average_awarded_marks)}/${formatValue(item.marks)}</span>`
                                }
                                <span>Blank ${item.blank_count}</span>
                            </div>
                        </div>
                    `,
                )
                .join('')}
        </div>
    `;
}

function renderLeaderboardTable(rows: Array<any>): string {
    if (!rows.length) {
        return '<p class="helper-text">Leaderboard data appears after attempts are submitted.</p>';
    }

    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Flags</th>
                </tr>
            </thead>
            <tbody>
                ${rows
                    .map(
                        (row) => `
                            <tr>
                                <td class="table-primary">${escapeHtml(row.student_name)}</td>
                                <td><span class="badge ${getStatusBadgeClass(row.status)}">${escapeHtml(row.status)}</span></td>
                                <td>${row.percentage !== null ? formatPercent(row.percentage) : '—'}</td>
                                <td>${row.violations}</td>
                            </tr>
                        `,
                    )
                    .join('')}
            </tbody>
        </table>
    `;
}

function renderProgressFunnel(stages: Array<{ label: string; count: number }>): string {
    return renderBarRows(stages, 'blue', 'No delivery funnel data yet.');
}

function renderReportsOverview(dashboard: any): string {
    const overview = dashboard.overview || dashboard;

    return `
        <section class="card report-hero animate-in">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Advanced Analytics</span>
                    <h3 class="panel-title">Operational view across exams, participation, and integrity</h3>
                </div>
                <p class="report-panel-copy">
                    Live activity, score quality, review backlog, and risk signals are summarized here so exam operations are easier to act on.
                </p>
            </div>

            <div class="report-kpi-grid">
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Average Score</span>
                    <strong class="report-kpi-value">${formatPercent(overview.average_percentage)}</strong>
                    <span class="report-kpi-note">${overview.evaluated_attempts} evaluated attempts</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${formatPercent(overview.participation_rate)}</strong>
                    <span class="report-kpi-note">${overview.total_attempts} attempts across assignments</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Alerts</span>
                    <strong class="report-kpi-value">${overview.integrity_alerts}</strong>
                    <span class="report-kpi-note">${overview.high_risk_attempts} high-risk attempts</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Pending Review</span>
                    <strong class="report-kpi-value">${overview.pending_evaluation}</strong>
                    <span class="report-kpi-note">${overview.active_attempts} currently in progress</span>
                </div>
            </div>
        </section>
    `;
}

function renderDashboardPanels(dashboard: any): string {
    const overview = dashboard.overview || dashboard;

    return `
        <section class="report-grid">
            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Delivery Health</h4>
                        <p class="report-panel-copy">Participation, quality, and active exam mix.</p>
                    </div>
                </div>
                <div class="report-visual-grid">
                    ${renderDonutCard('Participation rate', overview.participation_rate, `${overview.total_attempts} total attempts`, 'blue')}
                    ${renderDonutCard('Average score', overview.average_percentage, `${overview.evaluated_attempts} evaluated`, 'green')}
                    ${renderDonutCard('High-risk share', overview.total_attempts ? (overview.high_risk_attempts / overview.total_attempts) * 100 : 0, `${overview.high_risk_attempts} flagged attempts`, 'rose')}
                </div>
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Exam Status Mix</h4>
                        <p class="report-panel-copy">How the current exam portfolio is distributed.</p>
                    </div>
                </div>
                ${renderBarRows(dashboard.exam_status_breakdown || [], 'amber', 'No exam status data yet.')}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Attempt Flow</h4>
                        <p class="report-panel-copy">Current candidate progress through the lifecycle.</p>
                    </div>
                </div>
                ${renderBarRows(dashboard.attempt_status_breakdown || [], 'green', 'No attempt data yet.')}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Recent Activity</h4>
                        <p class="report-panel-copy">Started, submitted, and evaluated attempts over the last 7 days.</p>
                    </div>
                </div>
                ${renderTimelineChart(dashboard.activity_timeline || [])}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Integrity Signals</h4>
                        <p class="report-panel-copy">Violation type volume and risk concentration.</p>
                    </div>
                </div>
                <div class="report-split-grid">
                    <div>
                        <span class="section-title">Violation Types</span>
                        ${renderBarRows(dashboard.integrity_breakdown || [], 'rose', 'No integrity events recorded.')}
                    </div>
                    <div>
                        <span class="section-title">Risk Bands</span>
                        ${renderBarRows(dashboard.risk_distribution || [], 'amber', 'No risk distribution yet.')}
                    </div>
                </div>
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Top Exam Activity</h4>
                        <p class="report-panel-copy">Highest-volume exams ranked by usage and completion.</p>
                    </div>
                </div>
                ${renderTopExamsTable(dashboard.top_exams || [])}
            </article>
        </section>
    `;
}

function renderExamReport(report: any, index: number): string {
    const overview = report.overview || {};
    const exam = report.exam || {};

    return `
        <article class="card report-exam-card animate-in" style="animation-delay:${index * 45}ms;">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Exam Analytics</span>
                    <h3 class="card-title">${escapeHtml(exam.title || 'Exam')}</h3>
                    <p class="report-panel-copy">
                        ${exam.question_count || 0} questions • ${exam.duration_minutes || 0} minutes • ${exam.assigned_students || 0} assigned students • ${exam.teacher_count || 0} teachers
                    </p>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="badge ${getStatusBadgeClass(exam.status || 'DRAFT')}">${escapeHtml(exam.status || 'DRAFT')}</span>
                    <span class="chip">${exam.start_time ? formatDateTimeIst(exam.start_time) : 'No start time'}</span>
                </div>
            </div>

            <div class="report-kpi-grid compact">
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${formatPercent(overview.participation_rate)}</strong>
                    <span class="report-kpi-note">${overview.attempt_count || 0} started</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Completion</span>
                    <strong class="report-kpi-value">${formatPercent(overview.completion_rate)}</strong>
                    <span class="report-kpi-note">${overview.submitted_count || 0} submitted</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Average Score</span>
                    <strong class="report-kpi-value">${formatPercent(overview.average_percentage)}</strong>
                    <span class="report-kpi-note">Median ${formatPercent(overview.median_percentage)}</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Alerts</span>
                    <strong class="report-kpi-value">${overview.total_violations || 0}</strong>
                    <span class="report-kpi-note">${overview.high_risk_attempts || 0} high-risk attempts</span>
                </div>
            </div>

            <div class="report-detail-grid">
                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Progress Funnel</h4>
                        <p class="report-panel-copy">Assigned to evaluated candidate flow.</p>
                    </div>
                    ${renderProgressFunnel(report.progress_funnel || [])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Score Distribution</h4>
                        <p class="report-panel-copy">Percentage score bands for evaluated attempts.</p>
                    </div>
                    ${renderBarRows(report.score_distribution || [], 'green', 'No evaluated scores yet.')}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Question Insights</h4>
                        <p class="report-panel-copy">Hardest or lowest-response questions first.</p>
                    </div>
                    ${renderQuestionInsights(report.question_insights || [])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Leaderboard</h4>
                        <p class="report-panel-copy">Top evaluated candidates with flag counts.</p>
                    </div>
                    ${renderLeaderboardTable(report.leaderboard || [])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Integrity Breakdown</h4>
                        <p class="report-panel-copy">What kind of proctoring events were recorded.</p>
                    </div>
                    ${renderBarRows(report.proctoring_breakdown || [], 'rose', 'No proctoring events recorded.')}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Risk Distribution</h4>
                        <p class="report-panel-copy">Clean, flagged, and high-risk attempt mix.</p>
                    </div>
                    ${renderBarRows(report.risk_distribution || [], 'amber', 'No risk signals yet.')}
                </section>
            </div>
        </article>
    `;
}

async function loadReports(silent = false) {
    const content = document.getElementById('reports-content');
    if (!content) return;

    try {
        const [dashboard, exams] = await Promise.all([
            apiFetch<any>('/reports/dashboard'),
            apiFetch<any[]>('/exams/'),
        ]);

        if (!exams.length && !(dashboard.top_exams || []).length) {
            content.innerHTML = renderEmptyState(
                'RP',
                'No report data',
                'Reports will appear once exams and attempts exist.',
            );
            return;
        }

        const analyticsResults = await Promise.all(
            exams.map(async (exam) => {
                try {
                    return await apiFetch<any>(`/reports/exam/${exam.id}/analytics`);
                } catch {
                    return null;
                }
            }),
        );

        const reports = analyticsResults.filter(Boolean) as any[];
        reports.sort((left, right) => {
            const leftAttempts = left?.overview?.attempt_count || 0;
            const rightAttempts = right?.overview?.attempt_count || 0;
            if (leftAttempts !== rightAttempts) return rightAttempts - leftAttempts;
            return String(left?.exam?.title || '').localeCompare(String(right?.exam?.title || ''));
        });

        content.innerHTML = `
            <div class="reports-shell">
                ${renderReportsOverview(dashboard)}
                ${renderDashboardPanels(dashboard)}
                <section class="stack-list">
                    ${
                        reports.length
                            ? reports.map((report, index) => renderExamReport(report, index)).join('')
                            : renderEmptyState(
                                  ICON.detail,
                                  'Per-exam analytics unavailable',
                                  'The dashboard summary loaded, but detailed exam analytics could not be generated right now.',
                              )
                    }
                </section>
            </div>
        `;
    } catch (error: any) {
        if (!silent) {
            showToast(error.message, 'error');
        }
        content.innerHTML = renderEmptyState(
            '!',
            'Reports unavailable',
            error.message || 'Please try again in a moment.',
        );
    }
}

// ── Trash / Recently Deleted ───────────────────────────────────────────────────
async function refreshAfterTrashAction(entityType: string) {
    const refreshers: Array<Promise<unknown>> = [loadTrash(true)];

    if (entityType === 'user' && isStaffUser()) {
        refreshers.push(loadUsers(true), loadAdminStats(true));
    }

    if (entityType === 'exam') {
        refreshers.push(loadExams(true), loadResults(true));
        if (isStaffUser()) {
            refreshers.push(loadAdminStats(true), loadReports(true));
        }
        if (activeExamDetailId) {
            refreshers.push(openExamDetail(activeExamDetailId, { keepOpen: true, silent: true }));
        }
    }

    if (entityType === 'question' || entityType === 'folder') {
        if (isStaffUser()) {
            refreshers.push(loadQuestions(true));
        }
    }

    if (entityType === 'attempt') {
        refreshers.push(loadExams(true), loadResults(true));
        if (isStaffUser()) {
            refreshers.push(loadAdminStats(true));
        }
        if (activeExamDetailId) {
            refreshers.push(openExamDetail(activeExamDetailId, { keepOpen: true, silent: true }));
        }
    }

    await Promise.all(refreshers.map((task) => task.catch(() => undefined)));
}

async function loadTrash(silent = false) {
    const container = document.getElementById('trash-list');
    if (!container) return;

    try {
        const typeFilter = (document.getElementById('trash-type-filter') as HTMLSelectElement)?.value;
        const search = (document.getElementById('trash-search-input') as HTMLInputElement | null)?.value?.trim();
        const params = new URLSearchParams();
        if (typeFilter) params.set('entity_type', typeFilter);
        if (search) params.set('q', search);
        const url = params.toString() ? `/trash/?${params.toString()}` : '/trash/';

        const items = await apiFetch<any[]>(url);

        if (!items.length) {
            container.innerHTML = renderEmptyState(
                ICON.trash,
                'Nothing in trash',
                'Deleted exams, questions, folders, and users will appear here.',
            );
            return;
        }

        container.innerHTML = `<div class="trash-list-stack">
            ${items.map((item, index) => `
                <div class="trash-item animate-in" style="animation-delay:${index * 30}ms;">
                    <div class="trash-item-icon ${item.entity_type}">${
                        item.entity_type === 'exam' ? ICON.exam
                        : item.entity_type === 'question' ? ICON.question
                        : item.entity_type === 'folder' ? ICON.folder
                        : item.entity_type === 'attempt' ? ICON.detail
                        : item.entity_type === 'user' ? ICON.user
                        : ICON.trash
                    }</div>
                    <div class="trash-item-details">
                        <div style="font-weight:700;font-size:0.95rem;">${escapeHtml(item.label)}</div>
                        <div class="helper-text" style="font-size:0.82rem;">
                            <span class="badge badge-info" style="font-size:0.7rem;">${item.entity_type}</span>
                            &nbsp;Deleted ${formatDateTimeIst(item.deleted_at)}
                        </div>
                    </div>
                    <div class="trash-item-actions">
                        ${
                            item.can_restore
                                ? `<button class="icon-btn trash-restore" data-trash-id="${item.id}" data-entity-type="${item.entity_type}" title="Restore item">${ICON.restore}</button>`
                                : ''
                        }
                        ${
                            item.can_permanent_delete
                                ? `<button class="icon-btn danger trash-purge" data-trash-id="${item.id}" data-entity-type="${item.entity_type}" title="Permanently delete">${ICON.trash}</button>`
                                : ''
                        }
                        ${
                            item.can_restore || item.can_permanent_delete
                                ? ''
                                : '<span class="table-action-note">No actions available</span>'
                        }
                    </div>
                </div>
            `).join('')}
        </div>`;

        container.querySelectorAll<HTMLElement>('.trash-restore').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.trashId;
                const entityType = btn.dataset.entityType || '';
                if (!id) return;
                try {
                    const response = await apiFetch<any>(`/trash/${id}/restore`, { method: 'POST' });
                    showToast(response.message || 'Item restored successfully.', 'success');
                    await refreshAfterTrashAction(entityType);
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });

        container.querySelectorAll<HTMLElement>('.trash-purge').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.trashId;
                const entityType = btn.dataset.entityType || '';
                if (!id || !window.confirm('Permanently delete this item? This cannot be undone.')) return;
                try {
                    await apiFetch(`/trash/${id}/permanent`, { method: 'DELETE' });
                    showToast('Permanently deleted.', 'success');
                    await refreshAfterTrashAction(entityType);
                } catch (error: any) {
                    showToast(error.message, 'error');
                }
            });
        });
    } catch (error: any) {
        if (!silent) showToast(error.message, 'error');
        container.innerHTML = renderEmptyState('!', 'Unable to load trash', error.message || 'Please try again.');
    }
}

// ── Question edit modal ────────────────────────────────────────────────────────
function populateEditFolderSelect(selectedFolderId?: number | null) {
    const folderSelect = document.getElementById('eq-folder') as HTMLSelectElement | null;
    if (!folderSelect) return;
    const availableFolders = questionFolders.filter(
        (folder) => folder.can_edit || folder.id === selectedFolderId,
    );
    folderSelect.innerHTML = availableFolders
        .map(
            (folder) => `
                <option value="${folder.id}" ${folder.id === selectedFolderId ? 'selected' : ''}>
                    ${escapeHtml(folder.name)}${folder.can_edit ? '' : ' (Current folder)'}
                </option>
            `,
        )
        .join('');
}

function openQuestionEditModal(question: any) {
    const type = document.getElementById('eq-type') as HTMLSelectElement | null;
    const prompt = document.getElementById('eq-prompt') as HTMLTextAreaElement | null;
    const marks = document.getElementById('eq-marks') as HTMLInputElement | null;
    const correct = document.getElementById('eq-correct') as HTMLInputElement | null;
    const idInput = document.getElementById('eq-id') as HTMLInputElement | null;
    const mcqSection = document.getElementById('eq-mcq-section');

    if (idInput) idInput.value = String(question.id);
    if (type) type.value = question.type || 'MCQ';
    if (prompt) prompt.value = question.prompt || '';
    if (marks) marks.value = String(question.marks || 1);
    if (correct) correct.value = question.correct_option || '';

    if (mcqSection) mcqSection.style.display = question.type === 'MCQ' ? 'block' : 'none';

    const optionInputs = document.querySelectorAll<HTMLInputElement>('.eq-option');
    optionInputs.forEach((input, i) => {
        input.value = question.options?.[i] || '';
    });

    populateEditFolderSelect(question.folder_id);
    openModal('question-edit-modal');
}

async function handleQuestionEditSubmit(event: Event) {
    event.preventDefault();

    const id = (document.getElementById('eq-id') as HTMLInputElement).value;
    const type = (document.getElementById('eq-type') as HTMLSelectElement).value;
    const folderId = Number.parseInt((document.getElementById('eq-folder') as HTMLSelectElement).value, 10);
    const body: any = {
        type,
        prompt: (document.getElementById('eq-prompt') as HTMLTextAreaElement).value,
        marks: Number.parseInt((document.getElementById('eq-marks') as HTMLInputElement).value, 10),
        folder_id: Number.isNaN(folderId) ? null : folderId,
    };

    if (type === 'MCQ') {
        body.options = Array.from(document.querySelectorAll<HTMLInputElement>('.eq-option'))
            .map((input) => input.value.trim())
            .filter(Boolean);
        body.correct_option = (document.getElementById('eq-correct') as HTMLInputElement).value;
    }

    try {
        await apiFetch(`/exams/questions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
        showToast('Question updated.', 'success');
        closeModal('question-edit-modal');
        await loadQuestions(true);
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

// ── Folder edit modal ──────────────────────────────────────────────────────────
async function openFolderEditModal(folder: any) {
    const idInput = document.getElementById('ef-id') as HTMLInputElement | null;
    const name = document.getElementById('ef-name') as HTMLInputElement | null;
    const description = document.getElementById('ef-description') as HTMLTextAreaElement | null;

    if (idInput) idInput.value = String(folder.id);
    if (name) name.value = folder.name || '';
    if (description) description.value = folder.description || '';
    await renderFolderShareOptions(
        'folder-edit-share-list',
        (folder.shared_with || []).map((user: any) => user.id),
    );

    openModal('folder-edit-modal');
}

async function handleFolderEditSubmit(event: Event) {
    event.preventDefault();

    const id = (document.getElementById('ef-id') as HTMLInputElement).value;
    const body = {
        name: (document.getElementById('ef-name') as HTMLInputElement).value,
        description: (document.getElementById('ef-description') as HTMLTextAreaElement).value,
        share_with_teacher_ids: getFolderShareSelections('folder-edit-share-list'),
    };

    try {
        await apiFetch(`/exams/question-folders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
        showToast('Folder updated.', 'success');
        closeModal('folder-edit-modal');
        await loadQuestions(true);
    } catch (error: any) {
        showToast(error.message, 'error');
    }
}

void initDashboard();
