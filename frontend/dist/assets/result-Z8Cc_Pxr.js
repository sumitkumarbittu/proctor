import{c as A,e as n,a as S}from"./utils-DKSetIlA.js";import{a as $}from"./api-CNE7ZS8Q.js";const M=new URLSearchParams(window.location.search),m=M.get("attempt_id");function f(t){return`${(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}%`}function u(t){return(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}function L(t){return t>=80?"Strong":t>=50?"Developing":"Needs review"}function N(t){return t==="High risk"?"badge-danger":t==="Flagged"?"badge-warning":"badge-success"}function V(t,e,r,s){let l=null;const v=d=>{l||(l=d);const c=Math.min((d-l)/s,1),i=c*(r-e)+e;t.textContent=i.toFixed(1).replace(/\.0$/,""),c<1&&window.requestAnimationFrame(v)};window.requestAnimationFrame(v)}function q(t){if(!t.length)return'<p class="helper-text">Performance details will appear here after submission.</p>';const e=Math.max(...t.map(r=>r.count),1);return`
        <div class="report-bars mt-2">
            ${t.map(r=>`
                        <div class="report-bar-row">
                            <div class="report-bar-head">
                                <span>${n(r.label)}</span>
                                <span>${r.count}</span>
                            </div>
                            <div class="report-bar-track">
                                <div class="report-bar-fill blue" style="width: ${r.count/e*100}%"></div>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `}function P(t){if(!t.length)return`
            <div class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <span class="section-title">Integrity Signals</span>
                        <h3 class="report-panel-title">No proctoring events recorded</h3>
                    </div>
                </div>
            </div>
        `;const e=Math.max(...t.map(r=>r.count),1);return`
        <div class="card report-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Integrity Signals</span>
                    <h3 class="report-panel-title">Recorded proctoring events</h3>
                </div>
            </div>
            <div class="report-bars">
                ${t.map(r=>`
                            <div class="report-bar-row">
                                <div class="report-bar-head">
                                    <span>${n(r.label)}</span>
                                    <span>${r.count}</span>
                                </div>
                                <div class="report-bar-track">
                                    <div class="report-bar-fill rose" style="width: ${r.count/e*100}%"></div>
                                </div>
                            </div>
                        `).join("")}
            </div>
        </div>
    `}function F(t){return t.length?`
        <div class="card report-panel result-detail-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Question Breakdown</span>
                    <h3 class="report-panel-title">Per-question evaluation</h3>
                </div>
            </div>
            <div class="result-question-list">
                ${t.map(e=>{const r=e.is_answered?e.is_correct===!0?"Correct":e.is_correct===!1?"Answered":"Submitted":"Blank",s=e.is_answered?e.is_correct===!0?"badge-success":e.is_correct===!1?"badge-warning":"badge-info":"badge-danger";return`
                            <article class="result-question-card">
                                <div class="result-question-head">
                                    <div>
                                        <span class="section-title">Q${e.order} • ${n(e.type)}</span>
                                        <h4>${n(e.prompt)}</h4>
                                    </div>
                                    <span class="badge ${s}">${r}</span>
                                </div>
                                <div class="result-question-score">
                                    <strong>${u(e.marks_awarded)}/${u(e.marks)}</strong>
                                    <div class="report-bar-track">
                                        <div class="report-bar-fill blue" style="width:${Math.min(100,Math.max(0,e.percentage_awarded||0))}%"></div>
                                    </div>
                                </div>
                                <div class="result-answer-grid">
                                    <div>
                                        <span>Your answer</span>
                                        <p>${e.answer?n(e.answer):"No answer recorded."}</p>
                                    </div>
                                    ${e.correct_option?`<div><span>Correct answer</span><p>${n(e.correct_option)}</p></div>`:""}
                                </div>
                            </article>
                        `}).join("")}
            </div>
        </div>
    `:""}function R(t){return t!=null&&t.length?`
        <div class="card report-panel result-detail-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Integrity Timeline</span>
                    <h3 class="report-panel-title">Recorded proctoring events</h3>
                </div>
                <span class="badge badge-warning">${t.length} events</span>
            </div>
            <div class="result-event-list">
                ${t.map(e=>`
                            <div class="result-event-row">
                                <div>
                                    <strong>${n(e.type||"Event")}</strong>
                                    <p class="helper-text">${e.created_at?S(e.created_at):"Time unavailable"}</p>
                                </div>
                                <span class="badge ${e.severity==="CRITICAL"?"badge-danger":"badge-warning"}">${n(e.severity||"WARNING")}</span>
                            </div>
                        `).join("")}
            </div>
        </div>
    `:`
            <div class="card report-panel result-detail-panel">
                <span class="section-title">Integrity Timeline</span>
                <h3 class="report-panel-title">No proctoring events recorded</h3>
                <p class="helper-text mt-1">The attempt did not record focus, fullscreen, camera, or context warnings.</p>
            </div>
        `}async function D(){if(!m){window.location.href="/dashboard.html";return}try{const t=$(`/attempts/${m}`),[e,r,s]=await Promise.all([t,t.then(a=>$(`/exams/${a.exam_id}`)),$(`/reports/attempt/${m}/analytics`).catch(()=>null)]),l=document.getElementById("loading"),v=document.getElementById("result-content"),d=document.getElementById("score"),c=document.getElementById("max-score"),i=document.getElementById("status-badge"),g=document.getElementById("publish-message"),b=document.getElementById("score-progress"),p=document.getElementById("result-icon"),_=document.getElementById("result-kpis"),w=document.getElementById("result-performance"),x=document.getElementById("result-breakdown");if(!l||!v||!d||!c||!i||!g||!b||!p||!_||!w||!x)return;window.setTimeout(()=>{var y,C,E,I,T,B;if(l.classList.add("hidden"),v.classList.remove("hidden"),e.status==="IN_PROGRESS"){window.location.href=`/exam.html?attempt_id=${m}`;return}const a=(s==null?void 0:s.overview)||{},k=e.status==="EVALUATED"?((y=s==null?void 0:s.overview)==null?void 0:y.score)??((C=e.result)==null?void 0:C.total_score)??0:0,h=e.status==="EVALUATED"?((E=s==null?void 0:s.overview)==null?void 0:E.max_score)??((I=e.result)==null?void 0:I.max_score)??0:0,o=e.status==="EVALUATED"?((T=s==null?void 0:s.overview)==null?void 0:T.percentage)??(h>0?k/h*100:0):0;e.status==="EVALUATED"?(V(d,0,k,900),c.textContent=h.toString(),window.setTimeout(()=>{b.style.width=`${Math.min(100,Math.max(0,o))}%`,b.style.background=o>=80?"var(--gradient-success)":o<=40?"var(--gradient-danger)":"var(--gradient-primary)"},100),i.textContent="EVALUATED",i.className="badge badge-success",g.textContent=`${L(o)} performance in ${r.title}.`,o>=90?p.textContent="★":o>=70?p.textContent="✓":o>=50?p.textContent="•":p.textContent="…"):(d.textContent="—",c.textContent="—",i.textContent=e.status,i.className=`badge ${A(e.status)}`,g.textContent="Your exam has been submitted. Full scoring will appear after evaluation.",p.textContent="⌛"),_.innerHTML=s?`
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Score</span>
                        <strong class="report-kpi-value">${f(a.percentage)}</strong>
                        <span class="report-kpi-note">${u(a.score)}/${u(a.max_score)} marks</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Completion</span>
                        <strong class="report-kpi-value">${f(a.response_rate)}</strong>
                        <span class="report-kpi-note">${a.answered_count||0}/${a.total_question_count||0} answered</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Time Spent</span>
                        <strong class="report-kpi-value">${a.time_spent_minutes!==null&&a.time_spent_minutes!==void 0?`${u(a.time_spent_minutes)}m`:"In progress"}</strong>
                        <span class="report-kpi-note">${((B=s.exam)==null?void 0:B.duration_minutes)||0} minute exam</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Integrity</span>
                        <strong class="report-kpi-value">${a.total_violations||0}</strong>
                        <span class="badge ${N(a.risk_band||"Clean")}">${n(a.risk_band||"Clean")}</span>
                    </div>
                `:"",w.innerHTML=s?`
                    <div class="result-summary-grid">
                        <div class="card report-panel result-detail-panel">
                            <span class="section-title">Evaluation</span>
                            <h3 class="report-panel-title">Answer quality</h3>
                            ${q(s.performance_breakdown||[])}
                        </div>
                        <div class="card report-panel result-detail-panel">
                            <span class="section-title">Question Mix</span>
                            <h3 class="report-panel-title">Scoring profile</h3>
                            <div class="result-mini-grid mt-2">
                                <div><span>MCQ accuracy</span><strong>${f(a.mcq_accuracy)}</strong></div>
                                <div><span>Correct MCQs</span><strong>${a.correct_count||0}/${a.total_mcqs||0}</strong></div>
                                <div><span>Subjective avg</span><strong>${u(a.average_subjective_marks)}</strong></div>
                                <div><span>Blank</span><strong>${a.blank_count||0}</strong></div>
                            </div>
                        </div>
                    </div>
                    ${P(s.integrity_breakdown||[])}
                `:"",x.innerHTML=s?`
                    ${F(s.question_breakdown||[])}
                    ${R(s.proctor_events||[])}
                `:""},500)}catch{const t=document.getElementById("loading");t&&(t.innerHTML=`
                <div class="empty-state">
                    <div class="empty-state-icon">!</div>
                    <div class="empty-state-title">Failed to load results</div>
                    <div class="empty-state-desc">Please return to the dashboard and try again.</div>
                    <a href="/dashboard.html" class="btn btn-primary mt-3">Back to dashboard</a>
                </div>
            `)}}D();
