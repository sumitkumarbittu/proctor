import{r as we,a as l,g as xe,e as u,b as O}from"./utils-CxMppg6e.js";import{a as p}from"./api-BtGJAk0a.js";let b=null,Z=null,ee=null;const ke=["exams","results","users","questions","reports","trash"],Ie=1e4;let D="exams",A=null,Y=null,M=[],te=[],k=null,W=null,X=null,G=null;const y={edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',detail:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',restore:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>',folder:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',exam:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',question:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',user:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',statExams:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',statLive:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1.5"/><path d="M8.8 15.2a4.5 4.5 0 0 1 0-6.4"/><path d="M15.2 15.2a4.5 4.5 0 0 0 0-6.4"/><path d="M5.8 18.2a8.7 8.7 0 0 1 0-12.4"/><path d="M18.2 18.2a8.7 8.7 0 0 0 0-12.4"/></svg>',statAttempts:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4.5h6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',statReview:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><circle cx="11" cy="14" r="2.6"/><path d="m13 16 2.4 2.4"/></svg>'};function _e(t,e){return t instanceof Error&&t.message?t.message:t&&typeof t=="object"&&"message"in t&&typeof t.message=="string"?String(t.message):e}function w(){return(b==null?void 0:b.role)==="admin"||(b==null?void 0:b.role)==="examiner"}function re(){return(b==null?void 0:b.role)==="admin"}function Se(t){return!!(t!=null&&t.can_edit||t!=null&&t.can_remove_access)}function oe(t){const e=document.getElementById(t);return e?Array.from(e.querySelectorAll('input[type="checkbox"]:checked')).map(a=>Number.parseInt(a.value,10)):[]}function de(){return M.filter(t=>t.can_edit)}function le(t){return t.access_level==="owner"?"You own this bank":t.access_level==="admin"?"Admin access":"Shared with you"}function ce(t){const e=document.getElementById("user-role-input"),a=document.getElementById("user-role-option-admin");if(!e||!a)return;const s=re();a.disabled=!s,a.hidden=!s,!s&&(t==="admin"||e.value==="admin")?e.value="examiner":t&&(e.value=t)}async function qe(){return(await p("/users/?role=examiner&limit=200")).filter(e=>e.id!==(b==null?void 0:b.id))}async function ue(t,e=[]){const a=document.getElementById(t);if(!a)return;const s=await qe();if(!s.length){a.innerHTML='<p class="helper-text">No other examiners are available to share with right now.</p>';return}const n=new Set(e);a.innerHTML=s.map(r=>`
                <label class="assignment-option">
                    <input
                        type="checkbox"
                        value="${r.id}"
                        ${n.has(r.id)?"checked":""}
                    >
                    <div>
                        <strong>${u(r.name||r.email)}</strong>
                        <p class="helper-text">${u(r.email)}${r.is_active?"":" • Inactive"}</p>
                    </div>
                </label>
            `).join("")}function _(t,e,a){return`
        <div class="empty-state">
            <div class="empty-state-icon">${t}</div>
            <div class="empty-state-title">${u(e)}</div>
            <div class="empty-state-desc">${u(a)}</div>
        </div>
    `}function pe(){const t=Array.from(document.querySelectorAll(".modal-overlay")).some(e=>e.classList.contains("active"));document.body.classList.toggle("modal-open",t)}function P(t){var e;(e=document.getElementById(t))==null||e.classList.add("active"),pe()}function L(t){var e;(e=document.getElementById(t))==null||e.classList.remove("active"),t==="exam-detail-modal"&&(A=null),pe()}function Be(){const t=b.name||b.email,e=document.getElementById("user-name"),a=document.getElementById("user-role"),s=document.getElementById("user-avatar");if(e&&(e.textContent=t),a&&(a.textContent=b.role.charAt(0).toUpperCase()+b.role.slice(1)),s){const n=xe(b.name,b.email);s.innerHTML=`<span style="font-weight:800;font-size:0.9rem;letter-spacing:-0.03em;">${n}</span>`}}function Le(){Y&&window.clearInterval(Y),Y=window.setInterval(()=>{j(!0)},Ie)}async function j(t=!1){w()&&await N(t),D==="exams"&&await V(t),D==="results"&&await z(t),D==="users"&&w()&&await R(t),D==="questions"&&w()&&await q(t),D==="reports"&&w()&&await fe(t),D==="trash"&&w()&&await J(t);const e=document.getElementById("exam-detail-modal");A&&(e!=null&&e.classList.contains("active"))&&await B(A,{keepOpen:!0,silent:t})}function Ae(){document.querySelectorAll(".nav-link[data-view]").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const a=t.dataset.view;a&&Te(a)})})}async function Te(t){D=t,document.querySelectorAll(".nav-link[data-view]").forEach(e=>{e.classList.toggle("active",e.dataset.view===t)}),ke.forEach(e=>{var a;(a=document.getElementById(`view-${e}`))==null||a.classList.toggle("hidden",e!==t)}),await j(!1)}function Me(){var t,e,a,s,n,r,c,o,i,m,d,v,$,E,F,U,Q;document.querySelectorAll("[data-close-modal]").forEach(g=>{g.addEventListener("click",()=>{const S=g.dataset.closeModal;S&&L(S)})}),document.querySelectorAll(".modal-overlay").forEach(g=>{g.addEventListener("click",S=>{S.target===g&&L(g.id)})}),document.addEventListener("keydown",g=>{g.key==="Escape"&&document.querySelectorAll(".modal-overlay.active").forEach(S=>{L(S.id)})}),(t=document.getElementById("create-exam-btn"))==null||t.addEventListener("click",()=>me()),(e=document.getElementById("create-user-btn"))==null||e.addEventListener("click",()=>ve()),(a=document.getElementById("create-question-btn"))==null||a.addEventListener("click",()=>void Ve()),(s=document.getElementById("create-folder-btn"))==null||s.addEventListener("click",()=>void ye()),(n=document.getElementById("exam-form"))==null||n.addEventListener("submit",De),(r=document.getElementById("user-form"))==null||r.addEventListener("submit",Oe),(c=document.getElementById("question-form"))==null||c.addEventListener("submit",ze),(o=document.getElementById("folder-form"))==null||o.addEventListener("submit",Ue),(i=document.getElementById("question-edit-form"))==null||i.addEventListener("submit",nt),(m=document.getElementById("folder-edit-form"))==null||m.addEventListener("submit",rt),(d=document.getElementById("q-type"))==null||d.addEventListener("change",g=>{const S=g.target.value,C=document.getElementById("mcq-options-section");C&&(C.style.display=S==="MCQ"?"block":"none")}),(v=document.getElementById("eq-type"))==null||v.addEventListener("change",g=>{const S=g.target.value,C=document.getElementById("eq-mcq-section");C&&(C.style.display=S==="MCQ"?"block":"none")}),($=document.getElementById("user-search-input"))==null||$.addEventListener("input",()=>{W&&clearTimeout(W),W=setTimeout(()=>void R(!0),300)}),(E=document.getElementById("user-role-filter"))==null||E.addEventListener("change",()=>void R(!0)),(F=document.getElementById("question-search-input"))==null||F.addEventListener("input",()=>{X&&clearTimeout(X),X=setTimeout(()=>void q(!0),300)}),(U=document.getElementById("trash-type-filter"))==null||U.addEventListener("change",()=>void J(!0)),(Q=document.getElementById("trash-search-input"))==null||Q.addEventListener("input",()=>{G&&clearTimeout(G),G=setTimeout(()=>void J(!0),300)})}async function Ne(){var t,e,a,s,n,r;(t=document.getElementById("logout-btn"))==null||t.addEventListener("click",()=>{we(),window.location.href="/"});try{b=await p("/users/me"),Be(),Ae(),Me(),w()&&((e=document.getElementById("staff-nav"))==null||e.classList.remove("hidden"),(a=document.getElementById("admin-controls"))==null||a.classList.remove("hidden"),(s=document.getElementById("trash-nav-wrap"))==null||s.classList.remove("hidden"),(n=document.getElementById("admin-nav"))==null||n.classList.remove("hidden")),re()||(r=document.getElementById("trash-user-option"))==null||r.remove(),ce(),await j(!1),Le()}catch(c){l(c.message||"Failed to load the dashboard.","error");const o=document.getElementById("exam-list");o&&(o.innerHTML=_("!","Unable to load dashboard","Please refresh the page or try again in a moment."))}}async function N(t=!1){if(w())try{const e=await p("/reports/dashboard"),a=e.overview||e,s=document.getElementById("stats-bar");if(!s)return;s.classList.remove("hidden"),s.innerHTML=`
            <div class="stat-card blue animate-in">
                <div class="stat-card-icon">${y.statExams}</div>
                <div class="stat-card-value">${a.total_exams}</div>
                <div class="stat-card-label">Visible Exams</div>
            </div>
            <div class="stat-card green animate-in" style="animation-delay: 40ms;">
                <div class="stat-card-icon">${y.statLive}</div>
                <div class="stat-card-value">${a.live_exams}</div>
                <div class="stat-card-label">Live Exams</div>
            </div>
            <div class="stat-card amber animate-in" style="animation-delay: 80ms;">
                <div class="stat-card-icon">${y.statAttempts}</div>
                <div class="stat-card-value">${a.total_attempts}</div>
                <div class="stat-card-label">Attempts</div>
            </div>
            <div class="stat-card rose animate-in" style="animation-delay: 120ms;">
                <div class="stat-card-icon">${y.statReview}</div>
                <div class="stat-card-value">${a.pending_evaluation}</div>
                <div class="stat-card-label">Pending Review</div>
            </div>
        `}catch(e){t||l(e.message||"Failed to load dashboard stats.","error")}}async function V(t=!1){const e=document.getElementById("exam-list");if(e)try{const a=await p("/exams/");if(e.innerHTML="",!a.length){e.innerHTML=_("EX","No exams yet",w()?"Create your first exam or wait for a collaborator to assign one.":"Assigned exams will appear here when they are ready.");return}a.forEach((s,n)=>{var o,i,m,d,v,$;const r=document.createElement("div");r.className="card card-interactive exam-card animate-in",r.style.animationDelay=`${n*45}ms`;const c=w()?`
                    <span>${((o=s.teacher_assignments)==null?void 0:o.length)||0} teachers</span>
                    <span>${((i=s.assignments)==null?void 0:i.length)||0} students</span>
                `:`<span>${((m=s.questions)==null?void 0:m.length)||0} questions</span>`;r.innerHTML=`
                <div class="exam-card-header">
                    <div>
                        <h3>${u(s.title)}</h3>
                        <p class="helper-text">${u(s.instructions||"No instructions added yet.")}</p>
                    </div>
                    <span class="badge ${O(s.status)}">${u(s.status)}</span>
                </div>
                <div class="exam-card-meta">
                    <span>${s.duration_minutes} min</span>
                    <span>${((d=s.questions)==null?void 0:d.length)||0} questions</span>
                    ${c}
                </div>
                ${w()?`
                            <div class="helper-text">
                                Created by ${u(((v=s.creator)==null?void 0:v.name)||(($=s.creator)==null?void 0:$.email)||"Team")}
                            </div>
                        `:""}
                <div class="exam-card-actions">
                    ${w()?`
                                <div class="flex gap-xs">
                                    <button class="icon-btn edit-exam" data-id="${s.id}" title="Edit exam">${y.edit}</button>
                                    <button class="icon-btn detail-exam" data-id="${s.id}" title="Open details">${y.detail}</button>
                                    <button class="icon-btn danger delete-exam" data-id="${s.id}" title="Delete exam">${y.trash}</button>
                                </div>
                            `:'<div class="helper-text">Assigned exam</div>'}
                    <button class="btn btn-primary btn-sm start-btn" data-id="${s.id}">
                        ${b.role==="student"?"Start exam":"View details"}
                    </button>
                </div>
            `,e.appendChild(r)}),Ce()}catch(a){t||l(a.message||"Unable to load exams.","error"),e.innerHTML.trim()||(e.innerHTML=_("!","Unable to load exams",a.message||"Please try again in a moment."))}}function Ce(){document.querySelectorAll(".start-btn").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(e){if(b.role==="student"){try{const a=await p(`/attempts/${e}/start`,{method:"POST"});window.location.href=`/exam.html?attempt_id=${a.id}`}catch(a){l(a.message,"error")}return}await B(Number.parseInt(e,10))}})}),document.querySelectorAll(".edit-exam").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(e)try{const a=await p(`/exams/${e}`);me(a)}catch(a){l(a.message,"error")}})}),document.querySelectorAll(".delete-exam").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(!(!e||!window.confirm("Delete this exam?")))try{await p(`/exams/${e}`,{method:"DELETE"}),l("Exam deleted.","success"),await j(!0)}catch(a){l(a.message,"error")}})}),document.querySelectorAll(".detail-exam").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.id;e&&B(Number.parseInt(e,10))})})}function me(t){var o;Z=t?t.id:null;const e=document.getElementById("exam-modal-title"),a=document.getElementById("exam-submit-btn"),s=document.getElementById("exam-title"),n=document.getElementById("exam-instructions"),r=document.getElementById("exam-duration"),c=document.getElementById("exam-status");e&&(e.textContent=t?"Edit Exam":"Create Exam"),a&&(a.textContent=t?"Save Changes":"Create Exam"),s&&(s.value=(t==null?void 0:t.title)||""),n&&(n.value=(t==null?void 0:t.instructions)||""),r&&(r.value=((o=t==null?void 0:t.duration_minutes)==null?void 0:o.toString())||"60"),c&&(c.value=(t==null?void 0:t.status)||"DRAFT"),P("exam-modal")}async function De(t){t.preventDefault();const e={title:document.getElementById("exam-title").value,instructions:document.getElementById("exam-instructions").value,duration_minutes:Number.parseInt(document.getElementById("exam-duration").value,10),status:document.getElementById("exam-status").value};try{Z?(await p(`/exams/${Z}`,{method:"PUT",body:JSON.stringify(e)}),l("Exam updated.","success")):(await p("/exams/",{method:"POST",body:JSON.stringify(e)}),l("Exam created.","success")),L("exam-modal"),await j(!0)}catch(a){l(a.message,"error")}}function Re(t,e){return e.length?e.map(a=>{var s,n,r;return`
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <span class="text-sm">${u(a.prompt.substring(0,110))}</span>
                        <span class="helper-text">
                            ${u(((s=a.folder)==null?void 0:s.name)||"Unfiled")} • ${u(((n=a.owner)==null?void 0:n.name)||((r=a.owner)==null?void 0:r.email)||"Shared bank")}
                        </span>
                    </div>
                    <button class="btn btn-primary btn-sm add-q-to-exam" data-exam="${t}" data-qid="${a.id}">
                        Add
                    </button>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No additional accessible questions available.</p>'}function Pe(t,e,a){return a?`
            <div class="card" style="padding: 1rem; border: 1px dashed var(--border-color);">
                <div class="section-title mb-1">Question bank unavailable</div>
                <p class="helper-text">${u(a)}</p>
            </div>
        `:Re(t,e)}function ae(t,e,a){return t.length?`
        <div class="assignment-grid">
            ${t.map(s=>`
                        <label class="assignment-option">
                            <input
                                type="checkbox"
                                class="assign-${a}"
                                value="${s.id}"
                                ${e.has(s.id)?"checked":""}
                            >
                            <div>
                                <strong>${u(s.name||s.email)}</strong>
                                <p class="helper-text">${u(s.email)}</p>
                            </div>
                        </label>
                    `).join("")}
        </div>
    `:`<p class="text-sm text-muted">No ${a}s available.</p>`}function Fe(t){var e;return(e=t.questions)!=null&&e.length?t.questions.map(a=>{var n;const s=a.question||a;return`
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <div class="flex items-center gap-sm">
                            <span class="badge badge-info">${s.type||"MCQ"}</span>
                            <span class="chip">${s.marks||1} marks</span>
                            ${(n=s.folder)!=null&&n.name?`<span class="chip">${u(s.folder.name)}</span>`:""}
                        </div>
                        <span class="text-sm">${u((s.prompt||"").substring(0,110))}</span>
                    </div>
                    <button class="icon-btn danger remove-q" data-exam="${t.id}" data-qid="${a.question_id}" title="Remove question">
                        ×
                    </button>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No questions added yet.</p>'}function He(t){return t.length?`
        <table class="data-table">
            <thead>
                <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Score</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${t.map(e=>{var a,s;return`
                            <tr>
                                <td class="table-primary">${u(((a=e.student)==null?void 0:a.name)||((s=e.student)==null?void 0:s.email)||`Student #${e.student_id}`)}</td>
                                <td><span class="badge ${O(e.status)}">${e.status}</span></td>
                                <td class="text-sm">${new Date(e.started_at).toLocaleString()}</td>
                                <td>
                                    ${e.result?`${e.result.total_score}/${e.result.max_score}`:"—"}
                                </td>
                                <td>
                                    <div class="flex gap-xs">
                                        ${e.status==="SUBMITTED"?`<button class="btn btn-sm btn-success evaluate-btn" data-id="${e.id}">Evaluate</button>`:""}
                                        ${e.status==="SUBMITTED"||e.status==="EVALUATED"?`<a class="btn btn-ghost btn-sm" href="/result.html?attempt_id=${e.id}">Open report</a>`:'<span class="text-sm text-muted">In progress</span>'}
                                        <button class="btn btn-ghost btn-sm delete-attempt" data-id="${e.id}">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `}).join("")}
            </tbody>
        </table>
    `:_("AT","No attempts yet","Attempts will appear here once students start.")}async function B(t,e={}){var n,r;const{keepOpen:a=!1,silent:s=!1}=e;try{A=t;const[c,o,i,m,d]=await Promise.allSettled([p(`/exams/${t}`),p("/exams/questions"),p(`/attempts/exam/${t}`),p("/users/?role=examiner"),p("/users/?role=student")]);if(c.status!=="fulfilled")throw c.reason;const v=c.value,$=o.status==="fulfilled"?o.value:[],E=i.status==="fulfilled"?i.value:[],F=m.status==="fulfilled"?m.value:[],U=d.status==="fulfilled"?d.value:[],Q=o.status==="rejected"?_e(o.reason,"The question bank could not be loaded for this exam right now."):null,g=document.getElementById("exam-detail-content"),S=document.getElementById("exam-detail-title");if(!g||!S)return;S.textContent=v.title;const C=new Set((v.teacher_assignments||[]).map(h=>h.teacher_id)),be=new Set((v.assignments||[]).map(h=>h.student_id)),$e=(v.questions||[]).map(h=>h.question_id),Ee=Q?[]:$.filter(h=>!$e.includes(h.id));g.innerHTML=`
            <div class="tabs">
                <button class="tab active" data-tab="questions">Questions (${((n=v.questions)==null?void 0:n.length)||0})</button>
                <button class="tab" data-tab="attempts">Attempts (${E.length})</button>
                <button class="tab" data-tab="assign">Assignments</button>
            </div>

            <div id="tab-questions">
                ${Fe(v)}
                <div class="detail-divider"></div>
                <div class="section-title mb-1">Add From Question Bank</div>
                ${Pe(t,Ee,Q)}
            </div>

            <div id="tab-attempts" class="hidden">
                ${He(E)}
            </div>

            <div id="tab-assign" class="hidden">
                <div class="stack-list">
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Teachers</div>
                        <p class="helper-text mb-2">
                            Assigned teachers can see this exam, manage questions, and review attempts.
                        </p>
                        ${ae(F,C,"teacher")}
                    </div>
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Students</div>
                        <p class="helper-text mb-2">
                            Assigned students will see the exam on their dashboard once it becomes available.
                        </p>
                        ${ae(U,be,"student")}
                    </div>
                    <div class="flex items-center justify-between gap-sm">
                        <p class="helper-text">Question folders used in this exam will be shared to assigned teachers automatically.</p>
                        <button class="btn btn-primary" id="assign-btn">Save assignments</button>
                    </div>
                </div>
            </div>
        `,g.querySelectorAll(".tab").forEach(h=>{h.addEventListener("click",()=>{g.querySelectorAll(".tab").forEach(f=>f.classList.remove("active")),h.classList.add("active");const x=h.dataset.tab;["questions","attempts","assign"].forEach(f=>{var H;(H=g.querySelector(`#tab-${f}`))==null||H.classList.toggle("hidden",f!==x)})})}),g.querySelectorAll(".add-q-to-exam").forEach(h=>{h.addEventListener("click",async()=>{const x=h.dataset.exam,f=h.dataset.qid;if(!(!x||!f))try{await p(`/exams/${x}/questions/${f}`,{method:"POST"}),l("Question added to exam.","success"),await B(t,{keepOpen:!0}),await q(!0)}catch(H){l(H.message,"error")}})}),g.querySelectorAll(".remove-q").forEach(h=>{h.addEventListener("click",async()=>{const x=h.dataset.exam,f=h.dataset.qid;if(!(!x||!f))try{await p(`/exams/${x}/questions/${f}`,{method:"DELETE"}),l("Question removed from exam.","success"),await B(t,{keepOpen:!0})}catch(H){l(H.message,"error")}})}),g.querySelectorAll(".evaluate-btn").forEach(h=>{h.addEventListener("click",async()=>{const x=h.dataset.id;if(x)try{const f=await p(`/attempts/${x}/evaluate`,{method:"POST"});l(`Evaluated: ${f.score}/${f.max_score}`,"success"),await B(t,{keepOpen:!0})}catch(f){l(f.message,"error")}})}),g.querySelectorAll(".delete-attempt").forEach(h=>{h.addEventListener("click",async()=>{const x=h.dataset.id;if(!(!x||!window.confirm("Delete this submission? It will move to Recently Deleted.")))try{await p(`/attempts/${x}`,{method:"DELETE"}),l("Submission moved to Recently Deleted.","success"),await B(t,{keepOpen:!0}),await z(!0),await N(!0)}catch(f){l(f.message,"error")}})}),(r=g.querySelector("#assign-btn"))==null||r.addEventListener("click",async()=>{const h=Array.from(g.querySelectorAll(".assign-teacher:checked")).map(f=>Number.parseInt(f.value,10)),x=Array.from(g.querySelectorAll(".assign-student:checked")).map(f=>Number.parseInt(f.value,10));try{await p(`/exams/${t}/assign`,{method:"POST",body:JSON.stringify({teacher_ids:h,student_ids:x})}),l("Assignments updated.","success"),await B(t,{keepOpen:!0}),await V(!0)}catch(f){l(f.message,"error")}}),a||P("exam-detail-modal")}catch(c){s||l(c.message,"error")}}async function R(t=!1){var a,s,n;const e=document.getElementById("users-tbody");if(e)try{const r=(s=(a=document.getElementById("user-search-input"))==null?void 0:a.value)==null?void 0:s.trim(),c=(n=document.getElementById("user-role-filter"))==null?void 0:n.value;let o="/users/?limit=200";r&&(o+=`&q=${encodeURIComponent(r)}`),c&&(o+=`&role=${encodeURIComponent(c)}`),te=await p(o),e.innerHTML=te.map(i=>`
                    <tr>
                        <td class="table-primary">${u(i.name||"—")}</td>
                        <td>${u(i.email)}</td>
                        <td>
                            <span class="badge ${i.role==="admin"?"badge-danger":i.role==="examiner"?"badge-warning":"badge-info"}">${i.role}</span>
                        </td>
                        <td>
                            <span class="badge ${i.is_active?"badge-success":"badge-danger"}">
                                ${i.is_active?"Active":"Inactive"}
                            </span>
                        </td>
                        <td style="text-align: right;">
                            <div class="table-action-stack">
                                <div class="flex gap-xs" style="justify-content: flex-end; flex-wrap: wrap;">
                                    ${i.can_edit?`<button class="icon-btn edit-user" data-id="${i.id}" title="Edit user">${y.edit}</button>`:""}
                                    ${i.can_toggle_active?`<button class="btn btn-ghost btn-sm toggle-user-access" data-id="${i.id}" data-next-active="${i.is_active?"false":"true"}">${i.is_active?"Remove access":"Restore access"}</button>`:""}
                                    ${i.can_delete?`<button class="icon-btn danger delete-user" data-id="${i.id}" title="Delete user">${y.trash}</button>`:""}
                                </div>
                                ${Se(i)||i.can_delete?"":`<span class="table-action-note">${u(i.protected_reason||"View only")}</span>`}
                            </div>
                        </td>
                    </tr>
                `).join(""),Qe()}catch(r){t||l(r.message,"error")}}function Qe(){document.querySelectorAll(".edit-user").forEach(t=>{t.addEventListener("click",()=>{const e=Number.parseInt(t.dataset.id||"",10),a=te.find(s=>s.id===e);a&&ve(a)})}),document.querySelectorAll(".toggle-user-access").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id,a=t.dataset.nextActive==="true";if(!e)return;const s=a?"Restore access for this user?":"Remove access for this user?";if(window.confirm(s))try{await p(`/users/${e}`,{method:"PUT",body:JSON.stringify({is_active:a})}),l(a?"Access restored.":"Access removed.","success"),await R(!0),await N(!0)}catch(n){l(n.message,"error")}})}),document.querySelectorAll(".delete-user").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(!(!e||!window.confirm("Delete this user?")))try{await p(`/users/${e}`,{method:"DELETE"}),l("User moved to Recently Deleted.","success"),await R(!0),await N(!0)}catch(a){l(a.message,"error")}})})}function ve(t){ee=t?t.id:null;const e=document.getElementById("user-modal-title"),a=document.getElementById("user-submit-btn"),s=document.getElementById("user-name-input"),n=document.getElementById("user-email-input"),r=document.getElementById("user-password-input"),c=document.getElementById("user-role-input");e&&(e.textContent=t?"Edit User":"Add User"),a&&(a.textContent=t?"Save Changes":"Add User"),s&&(s.value=(t==null?void 0:t.name)||""),n&&(n.value=(t==null?void 0:t.email)||""),r&&(r.value="",r.required=!t),c&&(c.value=(t==null?void 0:t.role)||"student"),ce((t==null?void 0:t.role)||"student"),P("user-modal")}async function Oe(t){t.preventDefault();const e={name:document.getElementById("user-name-input").value,email:document.getElementById("user-email-input").value,role:document.getElementById("user-role-input").value},a=document.getElementById("user-password-input").value;a&&(e.password=a);try{if(ee)await p(`/users/${ee}`,{method:"PUT",body:JSON.stringify(e)}),l("User updated.","success");else{if(!a){l("Password required for a new user.","warning");return}await p("/users/",{method:"POST",body:JSON.stringify(e)}),l("User created.","success")}L("user-modal"),await R(!0),await N(!0)}catch(s){l(s.message,"error")}}async function he(){return w()?(M=await p("/exams/question-folders"),k&&!M.some(t=>t.id===k)&&(k=null),M):[]}async function se(t){k=t,await q(!0)}function ge(){const t=document.getElementById("q-folder");if(!t)return;const e=de();t.innerHTML=e.map(a=>`
                <option value="${a.id}">
                    ${a.name}${a.access_level==="shared"?" (Shared)":""}
                </option>
            `).join(""),e.length||(t.innerHTML='<option value="">Create or own a folder first</option>')}function je(){const t=document.getElementById("question-folder-toolbar");if(t){if(!M.length){t.innerHTML=_(y.folder,"No folders yet","Create your first question folder to organize a personal or shared question bank.");return}t.innerHTML=`
        <div class="card" style="padding: 1rem; margin-bottom: 1rem;">
            <div class="section-title mb-1">Folders</div>
            <div class="trash-list-stack" style="max-height:280px; overflow-y:auto;">
                ${M.map(e=>{var a;return`
                        <div
                            class="folder-card ${k===e.id?"folder-active":""}"
                            data-folder-id="${e.id}"
                            role="button"
                            tabindex="0"
                            aria-pressed="${k===e.id}"
                            aria-label="Open question folder"
                        >
                            <div class="folder-card-icon">${y.folder}</div>
                            <div>
                                <div style="font-weight:700;font-size:0.95rem;">${u(e.name)}</div>
                                <div class="helper-text" style="font-size:0.82rem;">
                                    ${e.question_count||0} questions
                                    • ${u(le(e))}
                                    ${(a=e.shared_with)!=null&&a.length?` • Shared with ${e.shared_with.length} examiner${e.shared_with.length===1?"":"s"}`:""}
                                </div>
                            </div>
                            <div class="folder-card-actions">
                                ${e.can_share?`<button class="icon-btn edit-folder" data-id="${e.id}" title="Edit folder">${y.edit}</button>`:""}
                                <button class="icon-btn ${k===e.id?"btn-primary":""} folder-filter" data-folder="${e.id}" title="Filter by folder" style="font-size:0.7rem;width:auto;padding:0 0.5rem;">${k===e.id?"✓":"Filter"}</button>
                                ${e.can_delete?`<button class="icon-btn danger delete-folder" data-id="${e.id}" title="Delete folder">${y.trash}</button>`:""}
                            </div>
                        </div>
                    `}).join("")}
            </div>
            <div style="margin-top:0.75rem;">
                <button class="btn btn-sm ${k===null?"btn-primary":"btn-ghost"} folder-filter" data-folder="">
                    Show all questions
                </button>
            </div>
        </div>
    `,t.querySelectorAll(".folder-card[data-folder-id]").forEach(e=>{const a=async()=>{const s=Number.parseInt(e.dataset.folderId||"",10);Number.isNaN(s)||await se(s)};e.addEventListener("click",s=>{s.target.closest(".folder-card-actions")||a()}),e.addEventListener("keydown",s=>{s.key!=="Enter"&&s.key!==" "||(s.preventDefault(),a())})}),t.querySelectorAll(".folder-filter").forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation();const s=e.dataset.folder,n=s&&s.trim()?Number.parseInt(s,10):null;se(Number.isNaN(n)?null:n)})}),t.querySelectorAll(".edit-folder").forEach(e=>{e.addEventListener("click",()=>{const a=Number(e.dataset.id),s=M.find(n=>n.id===a);s&&it(s)})}),t.querySelectorAll(".delete-folder").forEach(e=>{e.addEventListener("click",async()=>{const a=e.dataset.id;if(!(!a||!window.confirm("Move this folder and all its questions to Recently Deleted?")))try{await p(`/exams/question-folders/${a}`,{method:"DELETE"}),l("Folder moved to Recently Deleted.","success"),k=null,await q(!0)}catch(s){l(s.message,"error")}})})}}async function q(t=!1){var a,s;const e=document.getElementById("questions-list");if(e)try{await he(),je(),ge();const n=new URLSearchParams,r=(s=(a=document.getElementById("question-search-input"))==null?void 0:a.value)==null?void 0:s.trim();k&&n.set("folder_id",String(k)),r&&n.set("q",r);const c=n.toString()?`?${n.toString()}`:"",o=await p(`/exams/questions${c}`);if(!o.length){e.innerHTML=_("QB","No questions yet","Build your question bank here for reuse across exams and collaborator assignments.");return}e.innerHTML=o.map((i,m)=>{var d,v,$,E;return`
                    <div class="card question-card animate-in" style="animation-delay: ${m*35}ms;">
                        <div class="question-card-header">
                            <div class="flex items-center gap-sm">
                                <span class="badge ${i.type==="MCQ"?"badge-primary":"badge-purple"}">${i.type}</span>
                                <span class="chip">${i.marks} marks</span>
                                ${(d=i.folder)!=null&&d.name?`<span class="chip">${u(i.folder.name)}</span>`:""}
                            </div>
                            <div class="question-card-actions">
                                ${i.can_edit?`<button class="icon-btn edit-question" data-id="${i.id}" title="Edit question">${y.edit}</button>`:""}
                                ${i.can_delete?`<button class="icon-btn danger delete-question" data-id="${i.id}" title="Delete question">${y.trash}</button>`:""}
                            </div>
                        </div>
                        <p class="text-sm">${u(i.prompt)}</p>
                        ${(v=i.options)!=null&&v.length?`
                                    <div class="flex gap-xs mt-2" style="flex-wrap: wrap;">
                                        ${i.options.map(F=>`<span class="chip">${u(F)}</span>`).join("")}
                                    </div>
                                `:""}
                        <p class="helper-text mt-2">
                            ${u((($=i.owner)==null?void 0:$.name)||((E=i.owner)==null?void 0:E.email)||"Personal bank")}
                            ${i.folder?` • ${u(le(i.folder))}`:""}
                        </p>
                    </div>
                `}).join(""),document.querySelectorAll(".edit-question").forEach(i=>{i.addEventListener("click",()=>{const m=Number(i.dataset.id),d=o.find(v=>v.id===m);d&&st(d)})}),document.querySelectorAll(".delete-question").forEach(i=>{i.addEventListener("click",async()=>{const m=i.dataset.id;if(!(!m||!window.confirm("Move this question to Recently Deleted?")))try{await p(`/exams/questions/${m}`,{method:"DELETE"}),l("Question moved to Recently Deleted.","success"),await q(!0)}catch(d){l(d.message,"error")}})})}catch(n){t||l(n.message,"error"),e.innerHTML=_("!","Question bank unavailable",n.message||"Please try again in a moment.")}}async function ye(){const t=document.getElementById("folder-modal-title"),e=document.getElementById("folder-submit-btn"),a=document.getElementById("folder-name"),s=document.getElementById("folder-description");t&&(t.textContent="Create Folder"),e&&(e.textContent="Create Folder"),a&&(a.value=""),s&&(s.value=""),await ue("folder-share-list"),P("folder-modal")}async function Ue(t){t.preventDefault();const e={name:document.getElementById("folder-name").value,description:document.getElementById("folder-description").value,share_with_teacher_ids:oe("folder-share-list")};try{await p("/exams/question-folders",{method:"POST",body:JSON.stringify(e)}),l("Folder created.","success"),L("folder-modal"),await q(!0)}catch(a){l(a.message,"error")}}async function Ve(){var i;await he();const t=de();if(!t.length){l("Create or own a question folder before adding questions.","warning"),ye();return}ge();const e=document.getElementById("question-modal-title"),a=document.getElementById("q-type"),s=document.getElementById("q-prompt"),n=document.getElementById("q-marks"),r=document.getElementById("q-correct"),c=document.getElementById("q-folder");if(e&&(e.textContent="Add Question"),a&&(a.value="MCQ"),s&&(s.value=""),n&&(n.value="1"),r&&(r.value=""),c){const m=(k&&t.some(d=>d.id===k)?k:null)||((i=t[0])==null?void 0:i.id);c.value=m?m.toString():""}document.querySelectorAll(".mcq-option").forEach(m=>{m.value=""});const o=document.getElementById("mcq-options-section");o&&(o.style.display="block"),P("question-modal")}async function ze(t){t.preventDefault();const e=document.getElementById("q-type").value,a=Number.parseInt(document.getElementById("q-folder").value,10),s={type:e,prompt:document.getElementById("q-prompt").value,marks:Number.parseInt(document.getElementById("q-marks").value,10),folder_id:Number.isNaN(a)?void 0:a};e==="MCQ"&&(s.options=Array.from(document.querySelectorAll(".mcq-option")).map(n=>n.value.trim()).filter(Boolean),s.correct_option=document.getElementById("q-correct").value);try{await p("/exams/questions",{method:"POST",body:JSON.stringify(s)}),l("Question created.","success"),L("question-modal"),await q(!0)}catch(n){l(n.message,"error")}}function Je(t){const e=(t==null?void 0:t.overview)||{};return`
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
                    <strong class="report-kpi-value">${e.attempt_count||0}</strong>
                    <span class="report-kpi-note">${e.evaluated_count||0} evaluated</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Average Score</span>
                    <strong class="report-kpi-value">${I(e.average_percentage)}</strong>
                    <span class="report-kpi-note">Best ${I(e.best_percentage)}</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Flags</span>
                    <strong class="report-kpi-value">${e.total_flags||0}</strong>
                    <span class="report-kpi-note">Across all attempts</span>
                </div>
            </div>
        </section>
    `}async function z(t=!1){const e=document.getElementById("results-list"),a=document.getElementById("results-summary");if(!(!e||!a))try{const s=b.role==="student"?p("/reports/student/me").catch(()=>null):Promise.resolve(null),[n,r]=await Promise.all([p("/attempts/"),s]);a.innerHTML=r?Je(r):"";const c=n.filter(o=>o.status==="SUBMITTED"||o.status==="EVALUATED");if(!c.length){e.innerHTML=_("RS","No results yet","Completed exam attempts will show up here.");return}e.innerHTML=c.map((o,i)=>{var m,d;return`
                    <div class="card card-interactive exam-card animate-in result-entry" data-attempt-id="${o.id}" style="cursor: pointer; animation-delay: ${i*35}ms;">
                        <div class="exam-card-header">
                            <div>
                                <h3>${b.role==="student"?`Attempt #${o.id}`:u(((m=o.student)==null?void 0:m.name)||((d=o.student)==null?void 0:d.email)||`Attempt #${o.id}`)}</h3>
                                <p class="helper-text">
                                    Exam #${o.exam_id}
                                    ${o.result?` • Score ${o.result.total_score}/${o.result.max_score}`:""}
                                </p>
                            </div>
                            <span class="badge ${O(o.status)}">${o.status}</span>
                        </div>
                        <div class="exam-card-meta">
                            <span>${new Date(o.started_at).toLocaleString()}</span>
                            <span>Open analytics</span>
                        </div>
                    </div>
                `}).join(""),document.querySelectorAll(".result-entry").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.attemptId;i&&(window.location.href=`/result.html?attempt_id=${i}`)})})}catch(s){t||l(s.message,"error"),e.innerHTML=_("!","Results unavailable",s.message||"Please try again in a moment.")}}function I(t){return`${(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}%`}function ne(t){return(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}function T(t,e="blue",a="No data yet."){if(!t.length||t.every(n=>n.count===0))return`<p class="helper-text">${a}</p>`;const s=Math.max(...t.map(n=>n.count),1);return`
        <div class="report-bars">
            ${t.map(n=>`
                        <div class="report-bar-row">
                            <div class="report-bar-head">
                                <span>${u(n.label)}</span>
                                <span>${n.count}</span>
                            </div>
                            <div class="report-bar-track">
                                <div class="report-bar-fill ${e}" style="width: ${n.count/s*100}%"></div>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `}function K(t,e,a,s){const n=Math.max(0,Math.min(100,Number.isFinite(e)?Number(e):0));return`
        <div class="report-donut-card">
            <div class="report-donut ${s}" style="--value:${n}">
                <span>${I(n)}</span>
            </div>
            <h4>${u(t)}</h4>
            <p>${u(a)}</p>
        </div>
    `}function Ye(t){if(!t.length)return'<p class="helper-text">No recent activity yet.</p>';const e=Math.max(...t.flatMap(a=>[a.started,a.submitted,a.evaluated]),1);return`
        <div class="timeline-legend">
            <span><i class="legend-dot blue"></i>Started</span>
            <span><i class="legend-dot amber"></i>Submitted</span>
            <span><i class="legend-dot green"></i>Evaluated</span>
        </div>
        <div class="timeline-grid">
            ${t.map(a=>`
                        <div class="timeline-day">
                            <div class="timeline-day-bars">
                                <span class="timeline-bar blue" style="height:${a.started/e*100}%"></span>
                                <span class="timeline-bar amber" style="height:${a.submitted/e*100}%"></span>
                                <span class="timeline-bar green" style="height:${a.evaluated/e*100}%"></span>
                            </div>
                            <span class="timeline-day-label">${u(a.label)}</span>
                        </div>
                    `).join("")}
        </div>
    `}function We(t){return t.length?`
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
                ${t.map(e=>`
                            <tr>
                                <td class="table-primary">${u(e.title)}</td>
                                <td>${e.attempt_count}</td>
                                <td>${I(e.completion_rate)}</td>
                                <td>${I(e.average_percentage)}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">No exam analytics available yet.</p>'}function Xe(t){return t.length?`
        <div class="insight-list">
            ${t.slice(0,4).map(e=>`
                        <div class="insight-item">
                            <div class="insight-item-head">
                                <span class="badge ${e.type==="MCQ"?"badge-primary":"badge-purple"}">${e.type}</span>
                                <span class="chip">${u(e.difficulty)}</span>
                            </div>
                            <p class="text-sm">${u(e.prompt)}</p>
                            <div class="insight-item-meta">
                                <span>Response ${I(e.response_rate)}</span>
                                ${e.type==="MCQ"?`<span>Correct ${I(e.correct_rate)}</span>`:`<span>Avg marks ${ne(e.average_awarded_marks)}/${ne(e.marks)}</span>`}
                                <span>Blank ${e.blank_count}</span>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `:'<p class="helper-text">Question-level analytics will appear after candidates start submitting.</p>'}function Ge(t){return t.length?`
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
                ${t.map(e=>`
                            <tr>
                                <td class="table-primary">${u(e.student_name)}</td>
                                <td><span class="badge ${O(e.status)}">${u(e.status)}</span></td>
                                <td>${e.percentage!==null?I(e.percentage):"—"}</td>
                                <td>${e.violations}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">Leaderboard data appears after attempts are submitted.</p>'}function Ke(t){return T(t,"blue","No delivery funnel data yet.")}function Ze(t){const e=t.overview||t;return`
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
                    <strong class="report-kpi-value">${I(e.average_percentage)}</strong>
                    <span class="report-kpi-note">${e.evaluated_attempts} evaluated attempts</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${I(e.participation_rate)}</strong>
                    <span class="report-kpi-note">${e.total_attempts} attempts across assignments</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Alerts</span>
                    <strong class="report-kpi-value">${e.integrity_alerts}</strong>
                    <span class="report-kpi-note">${e.high_risk_attempts} high-risk attempts</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Pending Review</span>
                    <strong class="report-kpi-value">${e.pending_evaluation}</strong>
                    <span class="report-kpi-note">${e.active_attempts} currently in progress</span>
                </div>
            </div>
        </section>
    `}function et(t){const e=t.overview||t;return`
        <section class="report-grid">
            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Delivery Health</h4>
                        <p class="report-panel-copy">Participation, quality, and active exam mix.</p>
                    </div>
                </div>
                <div class="report-visual-grid">
                    ${K("Participation rate",e.participation_rate,`${e.total_attempts} total attempts`,"blue")}
                    ${K("Average score",e.average_percentage,`${e.evaluated_attempts} evaluated`,"green")}
                    ${K("High-risk share",e.total_attempts?e.high_risk_attempts/e.total_attempts*100:0,`${e.high_risk_attempts} flagged attempts`,"rose")}
                </div>
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Exam Status Mix</h4>
                        <p class="report-panel-copy">How the current exam portfolio is distributed.</p>
                    </div>
                </div>
                ${T(t.exam_status_breakdown||[],"amber","No exam status data yet.")}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Attempt Flow</h4>
                        <p class="report-panel-copy">Current candidate progress through the lifecycle.</p>
                    </div>
                </div>
                ${T(t.attempt_status_breakdown||[],"green","No attempt data yet.")}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Recent Activity</h4>
                        <p class="report-panel-copy">Started, submitted, and evaluated attempts over the last 7 days.</p>
                    </div>
                </div>
                ${Ye(t.activity_timeline||[])}
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
                        ${T(t.integrity_breakdown||[],"rose","No integrity events recorded.")}
                    </div>
                    <div>
                        <span class="section-title">Risk Bands</span>
                        ${T(t.risk_distribution||[],"amber","No risk distribution yet.")}
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
                ${We(t.top_exams||[])}
            </article>
        </section>
    `}function tt(t,e){const a=t.overview||{},s=t.exam||{};return`
        <article class="card report-exam-card animate-in" style="animation-delay:${e*45}ms;">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Exam Analytics</span>
                    <h3 class="card-title">${u(s.title||"Exam")}</h3>
                    <p class="report-panel-copy">
                        ${s.question_count||0} questions • ${s.duration_minutes||0} minutes • ${s.assigned_students||0} assigned students • ${s.teacher_count||0} teachers
                    </p>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="badge ${O(s.status||"DRAFT")}">${u(s.status||"DRAFT")}</span>
                    <span class="chip">${s.start_time?new Date(s.start_time).toLocaleString():"No start time"}</span>
                </div>
            </div>

            <div class="report-kpi-grid compact">
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${I(a.participation_rate)}</strong>
                    <span class="report-kpi-note">${a.attempt_count||0} started</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Completion</span>
                    <strong class="report-kpi-value">${I(a.completion_rate)}</strong>
                    <span class="report-kpi-note">${a.submitted_count||0} submitted</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Average Score</span>
                    <strong class="report-kpi-value">${I(a.average_percentage)}</strong>
                    <span class="report-kpi-note">Median ${I(a.median_percentage)}</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Alerts</span>
                    <strong class="report-kpi-value">${a.total_violations||0}</strong>
                    <span class="report-kpi-note">${a.high_risk_attempts||0} high-risk attempts</span>
                </div>
            </div>

            <div class="report-detail-grid">
                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Progress Funnel</h4>
                        <p class="report-panel-copy">Assigned to evaluated candidate flow.</p>
                    </div>
                    ${Ke(t.progress_funnel||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Score Distribution</h4>
                        <p class="report-panel-copy">Percentage score bands for evaluated attempts.</p>
                    </div>
                    ${T(t.score_distribution||[],"green","No evaluated scores yet.")}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Question Insights</h4>
                        <p class="report-panel-copy">Hardest or lowest-response questions first.</p>
                    </div>
                    ${Xe(t.question_insights||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Leaderboard</h4>
                        <p class="report-panel-copy">Top evaluated candidates with flag counts.</p>
                    </div>
                    ${Ge(t.leaderboard||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Integrity Breakdown</h4>
                        <p class="report-panel-copy">What kind of proctoring events were recorded.</p>
                    </div>
                    ${T(t.proctoring_breakdown||[],"rose","No proctoring events recorded.")}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Risk Distribution</h4>
                        <p class="report-panel-copy">Clean, flagged, and high-risk attempt mix.</p>
                    </div>
                    ${T(t.risk_distribution||[],"amber","No risk signals yet.")}
                </section>
            </div>
        </article>
    `}async function fe(t=!1){const e=document.getElementById("reports-content");if(e)try{const[a,s]=await Promise.all([p("/reports/dashboard"),p("/exams/")]);if(!s.length&&!(a.top_exams||[]).length){e.innerHTML=_("RP","No report data","Reports will appear once exams and attempts exist.");return}const r=(await Promise.all(s.map(async c=>{try{return await p(`/reports/exam/${c.id}/analytics`)}catch{return null}}))).filter(Boolean);r.sort((c,o)=>{var d,v,$,E;const i=((d=c==null?void 0:c.overview)==null?void 0:d.attempt_count)||0,m=((v=o==null?void 0:o.overview)==null?void 0:v.attempt_count)||0;return i!==m?m-i:String((($=c==null?void 0:c.exam)==null?void 0:$.title)||"").localeCompare(String(((E=o==null?void 0:o.exam)==null?void 0:E.title)||""))}),e.innerHTML=`
            <div class="reports-shell">
                ${Ze(a)}
                ${et(a)}
                <section class="stack-list">
                    ${r.length?r.map((c,o)=>tt(c,o)).join(""):_(y.detail,"Per-exam analytics unavailable","The dashboard summary loaded, but detailed exam analytics could not be generated right now.")}
                </section>
            </div>
        `}catch(a){t||l(a.message,"error"),e.innerHTML=_("!","Reports unavailable",a.message||"Please try again in a moment.")}}async function ie(t){const e=[J(!0)];t==="user"&&w()&&e.push(R(!0),N(!0)),t==="exam"&&(e.push(V(!0),z(!0)),w()&&e.push(N(!0),fe(!0)),A&&e.push(B(A,{keepOpen:!0,silent:!0}))),(t==="question"||t==="folder")&&w()&&e.push(q(!0)),t==="attempt"&&(e.push(V(!0),z(!0)),w()&&e.push(N(!0)),A&&e.push(B(A,{keepOpen:!0,silent:!0}))),await Promise.all(e.map(a=>a.catch(()=>{})))}async function J(t=!1){var a,s,n;const e=document.getElementById("trash-list");if(e)try{const r=(a=document.getElementById("trash-type-filter"))==null?void 0:a.value,c=(n=(s=document.getElementById("trash-search-input"))==null?void 0:s.value)==null?void 0:n.trim(),o=new URLSearchParams;r&&o.set("entity_type",r),c&&o.set("q",c);const i=o.toString()?`/trash/?${o.toString()}`:"/trash/",m=await p(i);if(!m.length){e.innerHTML=_(y.trash,"Nothing in trash","Deleted exams, questions, folders, and users will appear here.");return}e.innerHTML=`<div class="trash-list-stack">
            ${m.map((d,v)=>`
                <div class="trash-item animate-in" style="animation-delay:${v*30}ms;">
                    <div class="trash-item-icon ${d.entity_type}">${d.entity_type==="exam"?y.exam:d.entity_type==="question"?y.question:d.entity_type==="folder"?y.folder:d.entity_type==="attempt"?y.detail:d.entity_type==="user"?y.user:y.trash}</div>
                    <div class="trash-item-details">
                        <div style="font-weight:700;font-size:0.95rem;">${u(d.label)}</div>
                        <div class="helper-text" style="font-size:0.82rem;">
                            <span class="badge badge-info" style="font-size:0.7rem;">${d.entity_type}</span>
                            &nbsp;Deleted ${new Date(d.deleted_at).toLocaleString()}
                        </div>
                    </div>
                    <div class="trash-item-actions">
                        ${d.can_restore?`<button class="icon-btn trash-restore" data-trash-id="${d.id}" data-entity-type="${d.entity_type}" title="Restore item">${y.restore}</button>`:""}
                        ${d.can_permanent_delete?`<button class="icon-btn danger trash-purge" data-trash-id="${d.id}" data-entity-type="${d.entity_type}" title="Permanently delete">${y.trash}</button>`:""}
                        ${d.can_restore||d.can_permanent_delete?"":'<span class="table-action-note">No actions available</span>'}
                    </div>
                </div>
            `).join("")}
        </div>`,e.querySelectorAll(".trash-restore").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.trashId,$=d.dataset.entityType||"";if(v)try{const E=await p(`/trash/${v}/restore`,{method:"POST"});l(E.message||"Item restored successfully.","success"),await ie($)}catch(E){l(E.message,"error")}})}),e.querySelectorAll(".trash-purge").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.trashId,$=d.dataset.entityType||"";if(!(!v||!window.confirm("Permanently delete this item? This cannot be undone.")))try{await p(`/trash/${v}/permanent`,{method:"DELETE"}),l("Permanently deleted.","success"),await ie($)}catch(E){l(E.message,"error")}})})}catch(r){t||l(r.message,"error"),e.innerHTML=_("!","Unable to load trash",r.message||"Please try again.")}}function at(t){const e=document.getElementById("eq-folder");if(!e)return;const a=M.filter(s=>s.can_edit||s.id===t);e.innerHTML=a.map(s=>`
                <option value="${s.id}" ${s.id===t?"selected":""}>
                    ${u(s.name)}${s.can_edit?"":" (Current folder)"}
                </option>
            `).join("")}function st(t){const e=document.getElementById("eq-type"),a=document.getElementById("eq-prompt"),s=document.getElementById("eq-marks"),n=document.getElementById("eq-correct"),r=document.getElementById("eq-id"),c=document.getElementById("eq-mcq-section");r&&(r.value=String(t.id)),e&&(e.value=t.type||"MCQ"),a&&(a.value=t.prompt||""),s&&(s.value=String(t.marks||1)),n&&(n.value=t.correct_option||""),c&&(c.style.display=t.type==="MCQ"?"block":"none"),document.querySelectorAll(".eq-option").forEach((i,m)=>{var d;i.value=((d=t.options)==null?void 0:d[m])||""}),at(t.folder_id),P("question-edit-modal")}async function nt(t){t.preventDefault();const e=document.getElementById("eq-id").value,a=document.getElementById("eq-type").value,s=Number.parseInt(document.getElementById("eq-folder").value,10),n={type:a,prompt:document.getElementById("eq-prompt").value,marks:Number.parseInt(document.getElementById("eq-marks").value,10),folder_id:Number.isNaN(s)?null:s};a==="MCQ"&&(n.options=Array.from(document.querySelectorAll(".eq-option")).map(r=>r.value.trim()).filter(Boolean),n.correct_option=document.getElementById("eq-correct").value);try{await p(`/exams/questions/${e}`,{method:"PUT",body:JSON.stringify(n)}),l("Question updated.","success"),L("question-edit-modal"),await q(!0)}catch(r){l(r.message,"error")}}async function it(t){const e=document.getElementById("ef-id"),a=document.getElementById("ef-name"),s=document.getElementById("ef-description");e&&(e.value=String(t.id)),a&&(a.value=t.name||""),s&&(s.value=t.description||""),await ue("folder-edit-share-list",(t.shared_with||[]).map(n=>n.id)),P("folder-edit-modal")}async function rt(t){t.preventDefault();const e=document.getElementById("ef-id").value,a={name:document.getElementById("ef-name").value,description:document.getElementById("ef-description").value,share_with_teacher_ids:oe("folder-edit-share-list")};try{await p(`/exams/question-folders/${e}`,{method:"PUT",body:JSON.stringify(a)}),l("Folder updated.","success"),L("folder-edit-modal"),await q(!0)}catch(s){l(s.message,"error")}}Ne();
