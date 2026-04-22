import { apiFetch } from './api';

const urlParams = new URLSearchParams(window.location.search);
const attemptId = urlParams.get('attempt_id');

async function initResult() {
    if (!attemptId) {
        window.location.href = '/dashboard.html';
        return;
    }

    try {
        const attempt = await apiFetch<any>(`/attempts/${attemptId}`);
        const exam = await apiFetch<any>(`/exams/${attempt.exam_id}`);

        const loading = document.getElementById('loading');
        const content = document.getElementById('result-content');
        const score = document.getElementById('score');
        const maxScore = document.getElementById('max-score');
        const badge = document.getElementById('status-badge');
        const message = document.getElementById('publish-message');
        const progress = document.getElementById('score-progress');
        const icon = document.getElementById('result-icon');

        if (!loading || !content || !score || !maxScore || !badge || !message || !progress || !icon) {
            return;
        }

        window.setTimeout(() => {
            loading.classList.add('hidden');
            content.classList.remove('hidden');

            if (attempt.status === 'EVALUATED' && attempt.result) {
                const totalScore = attempt.result.total_score;
                const maximumScore = attempt.result.max_score || 0;
                const percentage = maximumScore > 0 ? (totalScore / maximumScore) * 100 : 0;

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
                message.textContent = `You have completed ${exam.title}.`;

                if (percentage >= 90) icon.textContent = '★';
                else if (percentage >= 70) icon.textContent = '✓';
                else if (percentage >= 50) icon.textContent = '•';
                else icon.textContent = '…';
            } else if (attempt.status === 'SUBMITTED') {
                score.textContent = '—';
                maxScore.textContent = '—';
                badge.textContent = 'SUBMITTED';
                badge.className = 'badge badge-info';
                message.textContent =
                    'Your exam has been submitted. Results will appear after evaluation.';
                icon.textContent = '⌛';
            } else {
                window.location.href = `/exam.html?attempt_id=${attemptId}`;
            }
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

void initResult();
