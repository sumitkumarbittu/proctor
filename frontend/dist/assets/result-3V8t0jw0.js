import{b as S,e as o}from"./utils-CzWt7XIS.js";import{a as f}from"./api-B4dv8x94.js";const T=new URLSearchParams(window.location.search),u=T.get("attempt_id");function B(t){return`${(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}%`}function v(t){return(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}function V(t,e,a,s){let i=null;const m=d=>{i||(i=d);const c=Math.min((d-i)/s,1),n=c*(a-e)+e;t.textContent=n.toFixed(1).replace(/\.0$/,""),c<1&&window.requestAnimationFrame(m)};window.requestAnimationFrame(m)}function L(t){if(!t.length)return'<p class="helper-text">Performance details will appear here after submission.</p>';const e=Math.max(...t.map(a=>a.count),1);return`
        <div class="card report-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Attempt Analytics</span>
                    <h3 class="report-panel-title">Answer quality and completion</h3>
                </div>
            </div>
            <div class="report-bars">
                ${t.map(a=>`
                            <div class="report-bar-row">
                                <div class="report-bar-head">
                                    <span>${o(a.label)}</span>
                                    <span>${a.count}</span>
                                </div>
                                <div class="report-bar-track">
                                    <div class="report-bar-fill blue" style="width: ${a.count/e*100}%"></div>
                                </div>
                            </div>
                        `).join("")}
            </div>
        </div>
    `}function F(t){if(!t.length)return`
            <div class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <span class="section-title">Integrity Signals</span>
                        <h3 class="report-panel-title">No proctoring events recorded</h3>
                    </div>
                </div>
            </div>
        `;const e=Math.max(...t.map(a=>a.count),1);return`
        <div class="card report-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Integrity Signals</span>
                    <h3 class="report-panel-title">Recorded proctoring events</h3>
                </div>
            </div>
            <div class="report-bars">
                ${t.map(a=>`
                            <div class="report-bar-row">
                                <div class="report-bar-head">
                                    <span>${o(a.label)}</span>
                                    <span>${a.count}</span>
                                </div>
                                <div class="report-bar-track">
                                    <div class="report-bar-fill rose" style="width: ${a.count/e*100}%"></div>
                                </div>
                            </div>
                        `).join("")}
            </div>
        </div>
    `}function M(t){return t.length?`
        <div class="card report-panel">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Question Breakdown</span>
                    <h3 class="report-panel-title">Per-question response summary</h3>
                </div>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Question</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map(e=>`
                                <tr>
                                    <td class="table-primary">
                                        Q${e.order} • ${o(e.type)}
                                        <div class="helper-text">${o(e.prompt)}</div>
                                    </td>
                                    <td>
                                        <span class="badge ${e.is_answered?e.is_correct===!0?"badge-success":e.is_correct===!1?"badge-warning":"badge-info":"badge-danger"}">
                                            ${e.is_answered?e.is_correct===!0?"Correct":e.is_correct===!1?"Answered":"Submitted":"Blank"}
                                        </span>
                                    </td>
                                    <td>${v(e.marks_awarded)}/${v(e.marks)}</td>
                                    <td>
                                        ${e.correct_option?`<div class="helper-text">Correct: ${o(e.correct_option)}</div>`:""}
                                        ${e.answer?`<div class="helper-text">Your answer: ${o(e.answer)}</div>`:'<div class="helper-text">No answer recorded.</div>'}
                                    </td>
                                </tr>
                            `).join("")}
                </tbody>
            </table>
        </div>
    `:""}async function P(){if(!u){window.location.href="/dashboard.html";return}try{const t=f(`/attempts/${u}`),[e,a,s]=await Promise.all([t,t.then(r=>f(`/exams/${r.exam_id}`)),f(`/reports/attempt/${u}/analytics`).catch(()=>null)]),i=document.getElementById("loading"),m=document.getElementById("result-content"),d=document.getElementById("score"),c=document.getElementById("max-score"),n=document.getElementById("status-badge"),g=document.getElementById("publish-message"),h=document.getElementById("score-progress"),l=document.getElementById("result-icon"),$=document.getElementById("result-kpis"),x=document.getElementById("result-performance"),k=document.getElementById("result-breakdown");if(!i||!m||!d||!c||!n||!g||!h||!l||!$||!x||!k)return;window.setTimeout(()=>{var _,y,E,A,C,I;if(i.classList.add("hidden"),m.classList.remove("hidden"),e.status==="IN_PROGRESS"){window.location.href=`/exam.html?attempt_id=${u}`;return}const r=(s==null?void 0:s.overview)||{},w=e.status==="EVALUATED"?((_=s==null?void 0:s.overview)==null?void 0:_.score)??((y=e.result)==null?void 0:y.total_score)??0:0,b=e.status==="EVALUATED"?((E=s==null?void 0:s.overview)==null?void 0:E.max_score)??((A=e.result)==null?void 0:A.max_score)??0:0,p=e.status==="EVALUATED"?((C=s==null?void 0:s.overview)==null?void 0:C.percentage)??(b>0?w/b*100:0):0;e.status==="EVALUATED"?(V(d,0,w,900),c.textContent=b.toString(),window.setTimeout(()=>{h.style.width=`${Math.min(100,Math.max(0,p))}%`,h.style.background=p>=80?"var(--gradient-success)":p<=40?"var(--gradient-danger)":"var(--gradient-primary)"},100),n.textContent="EVALUATED",n.className="badge badge-success",g.textContent=`You have completed ${a.title}.`,p>=90?l.textContent="★":p>=70?l.textContent="✓":p>=50?l.textContent="•":l.textContent="…"):(d.textContent="—",c.textContent="—",n.textContent=e.status,n.className=`badge ${S(e.status)}`,g.textContent="Your exam has been submitted. Full scoring will appear after evaluation.",l.textContent="⌛"),$.innerHTML=s?`
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Answered</span>
                        <strong class="report-kpi-value">${r.answered_count||0}</strong>
                        <span class="report-kpi-note">${B(r.response_rate)} response rate</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Flags</span>
                        <strong class="report-kpi-value">${r.total_violations||0}</strong>
                        <span class="report-kpi-note">${o(r.risk_band||"Clean")}</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">Time Spent</span>
                        <strong class="report-kpi-value">${r.time_spent_minutes!==null&&r.time_spent_minutes!==void 0?`${v(r.time_spent_minutes)}m`:"In progress"}</strong>
                        <span class="report-kpi-note">${((I=s.exam)==null?void 0:I.duration_minutes)||0} minute exam</span>
                    </div>
                    <div class="report-kpi-card">
                        <span class="report-kpi-label">MCQ Accuracy</span>
                        <strong class="report-kpi-value">${B(r.mcq_accuracy)}</strong>
                        <span class="report-kpi-note">Subjective avg ${v(r.average_subjective_marks)}</span>
                    </div>
                `:"",x.innerHTML=s?`
                    ${L(s.performance_breakdown||[])}
                    ${F(s.integrity_breakdown||[])}
                `:"",k.innerHTML=s?M(s.question_breakdown||[]):""},500)}catch{const t=document.getElementById("loading");t&&(t.innerHTML=`
                <div class="empty-state">
                    <div class="empty-state-icon">!</div>
                    <div class="empty-state-title">Failed to load results</div>
                    <div class="empty-state-desc">Please return to the dashboard and try again.</div>
                    <a href="/dashboard.html" class="btn btn-primary mt-3">Back to dashboard</a>
                </div>
            `)}}P();
