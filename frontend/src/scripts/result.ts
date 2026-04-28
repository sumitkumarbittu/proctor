import { apiFetch } from './api';
import { escapeHtml, formatDateTimeIst, getStatusBadgeClass } from './utils';

const urlParams = new URLSearchParams(window.location.search);
const attemptId = urlParams.get('attempt_id');

function formatPercent(value: number | null | undefined): string {
    const safeValue = Number.isFinite(value) ? Number(value) : 0;
    return `${safeValue.toFixed(1).replace(/\.0$/, '')}%`;
}

function formatValue(value: number | null | undefined): string {
    const safeValue = Number.isFinite(value) ? Number(value) : 0;
    return safeValue.toFixed(1).replace(/\.0$/, '');
}

function getPerformanceTone(percentage: number) {
    if (percentage >= 80) return 'Strong';
    if (percentage >= 50) return 'Developing';
    return 'Needs review';
}

function getRiskClass(riskBand: string) {
    if (riskBand === 'High risk') return 'badge-danger';
    if (riskBand === 'Flagged') return 'badge-warning';
    return 'badge-success';
}

function animateValue(element: HTMLElement, start: number, end: number, duration: number) {
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;

        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = progress * (end - start) + start;
        element.textContent = value.toFixed(1).replace(/\.0$/, '');

        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };

    window.requestAnimationFrame(step);
}

function renderPerformanceRows(items: Array<{ label: string; count: number }>) {
    if (!items.length) {
        return '<p class="helper-text">Performance details will appear here after submission.</p>';
    }

    const maxValue = Math.max(...items.map((item) => item.count), 1);
    return `
        <div class="report-bars mt-2">
            ${items
                .map(
                    (item) => `
                        <div class="report-bar-row">
                            <div class="report-bar-head">
                                <span>${escapeHtml(item.label)}</span>
                                <span>${item.count}</span>
                            </div>
                            <div class="report-bar-track">
                                <div class="report-bar-fill blue" style="width: ${(item.count / maxValue) * 100}%"></div>
                            </div>
                        </div>
                    `,
                )
                .join('')}
        </div>
    `;
}

function renderIntegrityRows(items: Array<{ label: string; count: number }>) {
    if (!items.length) {
        return `
            <div class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <span class="section-title">Integrity Signals</span>
                        <h3 class="report-panel-title">No proctoring events recorded</h3>
                    </div>
                </div>
            </div>
        `;
    }

    const maxValue = Math.max(...items.map((item) => item.count), 1);
    return `
        <div class="card report-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Integrity Signals</span>
                    <h3 class="report-panel-title">Recorded proctoring events</h3>
                </div>
            </div>
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
                                    <div class="report-bar-fill rose" style="width: ${(item.count / maxValue) * 100}%"></div>
                                </div>
                            </div>
                        `,
                    )
                    .join('')}
            </div>
        </div>
    `;
}

function renderQuestionBreakdown(rows: any[]) {
    if (!rows.length) {
        return '';
    }

    return `
        <div class="card report-panel result-detail-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Question Breakdown</span>
                    <h3 class="report-panel-title">Per-question evaluation</h3>
                </div>
            </div>
            <div class="result-question-list">
                ${rows
                    .map((row) => {
                        const statusCopy = row.is_answered
                            ? row.is_correct === true
                                ? 'Correct'
                                : row.is_correct === false
                                  ? 'Answered'
                                  : 'Submitted'
                            : 'Blank';
                        const statusClass = row.is_answered
                            ? row.is_correct === true
                                ? 'badge-success'
                                : row.is_correct === false
                                  ? 'badge-warning'
                                  : 'badge-info'
                            : 'badge-danger';
                        return `
                            <article class="result-question-card">
                                <div class="result-question-head">
                                    <div>
                                        <span class="section-title">Q${row.order} • ${escapeHtml(row.type)}</span>
                                        <h4>${escapeHtml(row.prompt)}</h4>
                                    </div>
                                    <span class="badge ${statusClass}">${statusCopy}</span>
                                </div>
                                <div class="result-question-score">
                                    <strong>${formatValue(row.marks_awarded)}/${formatValue(row.marks)}</strong>
                                    <div class="report-bar-track">
                                        <div class="report-bar-fill blue" style="width:${Math.min(
                                            100,
                                            Math.max(0, row.percentage_awarded || 0),
                                        )}%"></div>
                                    </div>
                                </div>
                                <div class="result-answer-grid">
                                    <div>
                                        <span>Your answer</span>
                                        <p>${row.answer ? escapeHtml(row.answer) : 'No answer recorded.'}</p>
                                    </div>
                                    ${
                                        row.correct_option
                                            ? `<div><span>Correct answer</span><p>${escapeHtml(row.correct_option)}</p></div>`
                                            : ''
                                    }
                                </div>
                            </article>
                        `;
                    })
                    .join('')}
            </div>
        </div>
    `;
}

function renderProctorEvents(events: any[]) {
    if (!events?.length) {
        return `
            <div class="card report-panel result-detail-panel">
                <span class="section-title">Integrity Timeline</span>
                <h3 class="report-panel-title">No proctoring events recorded</h3>
                <p class="helper-text mt-1">The attempt did not record focus, fullscreen, camera, or context warnings.</p>
            </div>
        `;
    }

    return `
        <div class="card report-panel result-detail-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Integrity Timeline</span>
                    <h3 class="report-panel-title">Recorded proctoring events</h3>
                </div>
                <span class="badge badge-warning">${events.length} events</span>
            </div>
            <div class="result-event-list">
                ${events
                    .map(
                        (event) => `
                            <div class="result-event-row">
                                <div>
                                    <strong>${escapeHtml(event.type || 'Event')}</strong>
                                    <p class="helper-text">${event.created_at ? formatDateTimeIst(event.created_at) : 'Time unavailable'}</p>
                                </div>
                                <span class="badge ${event.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}">${escapeHtml(
                                    event.severity || 'WARNING',
                                )}</span>
                            </div>
                        `,
                    )
                    .join('')}
            </div>
        </div>
    `;
}

async function initResult() {
    if (!attemptId) {
        window.location.href = '/dashboard.html';
        return;
    }

    try {
        const attemptPromise = apiFetch<any>(`/attempts/${attemptId}`);
        const [attempt, exam, analytics] = await Promise.all([
            attemptPromise,
            attemptPromise.then((response) => apiFetch<any>(`/exams/${response.exam_id}`)),
            apiFetch<any>(`/reports/attempt/${attemptId}/analytics`).catch(() => null),
        ]);

        const loading = document.getElementById('loading');
        const content = document.getElementById('result-content');
        const score = document.getElementById('score');
        const maxScore = document.getElementById('max-score');
        const badge = document.getElementById('status-badge');
        const message = document.getElementById('publish-message');
        const progress = document.getElementById('score-progress');
        const icon = document.getElementById('result-icon');
        const kpis = document.getElementById('result-kpis');
        const performance = document.getElementById('result-performance');
        const breakdown = document.getElementById('result-breakdown');

        if (
            !loading ||
            !content ||
            !score ||
            !maxScore ||
            !badge ||
            !message ||
            !progress ||
            !icon ||
            !kpis ||
            !performance ||
            !breakdown
        ) {
            return;
        }

        window.setTimeout(() => {
            loading.classList.add('hidden');
            content.classList.remove('hidden');

            if (attempt.status === 'IN_PROGRESS') {
                window.location.href = `/exam.html?attempt_id=${attemptId}`;
                return;
            }

            const overview = analytics?.overview || {};
            const totalScore =
                attempt.status === 'EVALUATED'
                    ? analytics?.overview?.score ?? attempt.result?.total_score ?? 0
                    : 0;
            const maximumScore =
                attempt.status === 'EVALUATED'
                    ? analytics?.overview?.max_score ?? attempt.result?.max_score ?? 0
                    : 0;
            const percentage =
                attempt.status === 'EVALUATED'
                    ? analytics?.overview?.percentage ??
                      (maximumScore > 0 ? (totalScore / maximumScore) * 100 : 0)
                    : 0;

            if (attempt.status === 'EVALUATED') {
                animateValue(score, 0, totalScore, 900);
                maxScore.textContent = maximumScore.toString();

                window.setTimeout(() => {
                    progress.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
                    progress.style.background =
                        percentage >= 80
                            ? 'var(--gradient-success)'
                            : percentage <= 40
                              ? 'var(--gradient-danger)'
                              : 'var(--gradient-primary)';
                }, 100);

                badge.textContent = 'EVALUATED';
                badge.className = 'badge badge-success';
                message.textContent = `${getPerformanceTone(percentage)} performance in ${exam.title}.`;

                if (percentage >= 90) icon.textContent = '★';
                else if (percentage >= 70) icon.textContent = '✓';
                else if (percentage >= 50) icon.textContent = '•';
                else icon.textContent = '…';
            } else {
                score.textContent = '—';
                maxScore.textContent = '—';
                badge.textContent = attempt.status;
                badge.className = `badge ${getStatusBadgeClass(attempt.status)}`;
                message.textContent =
                    'Your exam has been submitted. Full scoring will appear after evaluation.';
                icon.textContent = '⌛';
            }

            kpis.innerHTML = analytics
                ? `
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Score</span>
                        <strong class="report-kpi-value">${formatPercent(overview.percentage)}</strong>
                        <span class="report-kpi-note">${formatValue(overview.score)}/${formatValue(overview.max_score)} marks</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Completion</span>
                        <strong class="report-kpi-value">${formatPercent(overview.response_rate)}</strong>
                        <span class="report-kpi-note">${overview.answered_count || 0}/${overview.total_question_count || 0} answered</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Time Spent</span>
                        <strong class="report-kpi-value">${
                            overview.time_spent_minutes !== null &&
                            overview.time_spent_minutes !== undefined
                                ? `${formatValue(overview.time_spent_minutes)}m`
                                : 'In progress'
                        }</strong>
                        <span class="report-kpi-note">${analytics.exam?.duration_minutes || 0} minute exam</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Integrity</span>
                        <strong class="report-kpi-value">${overview.total_violations || 0}</strong>
                        <span class="badge ${getRiskClass(overview.risk_band || 'Clean')}">${escapeHtml(overview.risk_band || 'Clean')}</span>
                    </div>
                `
                : '';

            performance.innerHTML = analytics
                ? `
                    <div class="result-summary-grid">
                        <div class="card report-panel result-detail-panel">
                            <span class="section-title">Evaluation</span>
                            <h3 class="report-panel-title">Answer quality</h3>
                            ${renderPerformanceRows(analytics.performance_breakdown || [])}
                        </div>
                        <div class="card report-panel result-detail-panel">
                            <span class="section-title">Question Mix</span>
                            <h3 class="report-panel-title">Scoring profile</h3>
                            <div class="result-mini-grid mt-2">
                                <div><span>MCQ accuracy</span><strong>${formatPercent(overview.mcq_accuracy)}</strong></div>
                                <div><span>Correct MCQs</span><strong>${overview.correct_count || 0}/${overview.total_mcqs || 0}</strong></div>
                                <div><span>Subjective avg</span><strong>${formatValue(overview.average_subjective_marks)}</strong></div>
                                <div><span>Blank</span><strong>${overview.blank_count || 0}</strong></div>
                            </div>
                        </div>
                    </div>
                    ${renderIntegrityRows(analytics.integrity_breakdown || [])}
                `
                : '';

            breakdown.innerHTML = analytics
                ? `
                    ${renderQuestionBreakdown(analytics.question_breakdown || [])}
                    ${renderProctorEvents(analytics.proctor_events || [])}
                `
                : '';
        }, 500);
    } catch {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">!</div>
                    <div class="empty-state-title">Failed to load results</div>
                    <div class="empty-state-desc">Please return to the dashboard and try again.</div>
                    <a href="/dashboard.html" class="btn btn-primary mt-3">Back to dashboard</a>
                </div>
            `;
        }
    }
}

void initResult();
