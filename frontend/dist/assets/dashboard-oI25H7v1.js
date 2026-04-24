import{r as xe,a as l,g as ke,e as u,c as j,f as Ie}from"./utils-Cy5h_Jmk.js";import{a as m}from"./api-DHohslqf.js";let y=null,z=null,ae=null;const _e=["exams","results","users","questions","reports","trash"],Se=1e4;let P="exams",T=null,K=null,N=[],se=[],I=null,W=null,Z=null,ee=null,J=null;const Be="oeps-exam-access:",g={edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',detail:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',restore:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>',folder:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',exam:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',question:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',user:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',statExams:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',statLive:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1.5"/><path d="M8.8 15.2a4.5 4.5 0 0 1 0-6.4"/><path d="M15.2 15.2a4.5 4.5 0 0 0 0-6.4"/><path d="M5.8 18.2a8.7 8.7 0 0 1 0-12.4"/><path d="M18.2 18.2a8.7 8.7 0 0 0 0-12.4"/></svg>',statAttempts:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4.5h6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',statReview:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><circle cx="11" cy="14" r="2.6"/><path d="m13 16 2.4 2.4"/></svg>'};function qe(e,t){return e instanceof Error&&e.message?e.message:e&&typeof e=="object"&&"message"in e&&typeof e.message=="string"?String(e.message):t}function E(){return(y==null?void 0:y.role)==="admin"||(y==null?void 0:y.role)==="examiner"}function de(){return(y==null?void 0:y.role)==="admin"}function Le(e){return!!(e!=null&&e.can_edit||e!=null&&e.can_remove_access)}function le(e){const t=document.getElementById(e);return t?Array.from(t.querySelectorAll('input[type="checkbox"]:checked')).map(a=>Number.parseInt(a.value,10)):[]}function ce(){return N.filter(e=>e.can_edit)}function Ae(e){return`${Be}${e}`}function Te(e,t){sessionStorage.setItem(Ae(e),t)}function Me(e){if(!e)return"";const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const a=t.getTimezoneOffset()*6e4;return new Date(t.getTime()-a).toISOString().slice(0,16)}function Ne(e){if(!e)return null;const t=new Date(e);return Number.isNaN(t.getTime())?null:t.toISOString()}function Ce(e,t){return t!=="IN_PROGRESS"||typeof e!="number"?"—":Ie(e)}function ue(e){return e.access_level==="owner"?"You own this bank":e.access_level==="admin"?"Admin access":"Shared with you"}function me(e){const t=document.getElementById("user-role-input"),a=document.getElementById("user-role-option-admin");if(!t||!a)return;const s=de();a.disabled=!s,a.hidden=!s,!s&&(e==="admin"||t.value==="admin")?t.value="examiner":e&&(t.value=e)}async function De(){return(await m("/users/?role=examiner&limit=200")).filter(t=>t.id!==(y==null?void 0:y.id))}async function pe(e,t=[]){const a=document.getElementById(e);if(!a)return;const s=await De();if(!s.length){a.innerHTML='<p class="helper-text">No other examiners are available to share with right now.</p>';return}const n=new Set(t);a.innerHTML=s.map(i=>`
                <label class="assignment-option">
                    <input
                        type="checkbox"
                        value="${i.id}"
                        ${n.has(i.id)?"checked":""}
                    >
                    <div>
                        <strong>${u(i.name||i.email)}</strong>
                        <p class="helper-text">${u(i.email)}${i.is_active?"":" • Inactive"}</p>
                    </div>
                </label>
            `).join("")}function S(e,t,a){return`
        <div class="empty-state">
            <div class="empty-state-icon">${e}</div>
            <div class="empty-state-title">${u(t)}</div>
            <div class="empty-state-desc">${u(a)}</div>
        </div>
    `}function ve(){const e=Array.from(document.querySelectorAll(".modal-overlay")).some(t=>t.classList.contains("active"));document.body.classList.toggle("modal-open",e)}function D(e){var t;(t=document.getElementById(e))==null||t.classList.add("active"),ve()}function A(e){var t;(t=document.getElementById(e))==null||t.classList.remove("active"),e==="exam-detail-modal"&&(T=null),e==="exam-start-modal"&&(J=null),ve()}function Re(){const e=y.name||y.email,t=document.getElementById("user-name"),a=document.getElementById("user-role"),s=document.getElementById("user-avatar");if(t&&(t.textContent=e),a&&(a.textContent=y.role.charAt(0).toUpperCase()+y.role.slice(1)),s){const n=ke(y.name,y.email);s.innerHTML=`<span style="font-weight:800;font-size:0.9rem;letter-spacing:-0.03em;">${n}</span>`}}function Pe(){K&&window.clearInterval(K),K=window.setInterval(()=>{U(!0)},Se)}async function U(e=!1){E()&&await C(e),P==="exams"&&await G(e),P==="results"&&await X(e),P==="users"&&E()&&await F(e),P==="questions"&&E()&&await q(e),P==="reports"&&E()&&await $e(e),P==="trash"&&E()&&await Y(e);const t=document.getElementById("exam-detail-modal");T&&(t!=null&&t.classList.contains("active"))&&await L(T,{keepOpen:!0,silent:e})}function Fe(){document.querySelectorAll(".nav-link[data-view]").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const a=e.dataset.view;a&&Oe(a)})})}async function Oe(e){P=e,document.querySelectorAll(".nav-link[data-view]").forEach(t=>{t.classList.toggle("active",t.dataset.view===e)}),_e.forEach(t=>{var a;(a=document.getElementById(`view-${t}`))==null||a.classList.toggle("hidden",t!==e)}),await U(!1)}function He(){var e,t,a,s,n,i,c,o,r,p,d,v,$,b,O,V,Q,w;document.querySelectorAll("[data-close-modal]").forEach(x=>{x.addEventListener("click",()=>{const B=x.dataset.closeModal;B&&A(B)})}),document.querySelectorAll(".modal-overlay").forEach(x=>{x.addEventListener("click",B=>{B.target===x&&A(x.id)})}),document.addEventListener("keydown",x=>{x.key==="Escape"&&document.querySelectorAll(".modal-overlay.active").forEach(B=>{A(B.id)})}),(e=document.getElementById("create-exam-btn"))==null||e.addEventListener("click",()=>he()),(t=document.getElementById("create-user-btn"))==null||t.addEventListener("click",()=>ge()),(a=document.getElementById("create-question-btn"))==null||a.addEventListener("click",()=>void tt()),(s=document.getElementById("create-folder-btn"))==null||s.addEventListener("click",()=>void be()),(n=document.getElementById("exam-form"))==null||n.addEventListener("submit",ze),(i=document.getElementById("exam-start-form"))==null||i.addEventListener("submit",Ve),(c=document.getElementById("user-form"))==null||c.addEventListener("submit",We),(o=document.getElementById("question-form"))==null||o.addEventListener("submit",at),(r=document.getElementById("folder-form"))==null||r.addEventListener("submit",et),(p=document.getElementById("question-edit-form"))==null||p.addEventListener("submit",vt),(d=document.getElementById("folder-edit-form"))==null||d.addEventListener("submit",gt),(v=document.getElementById("q-type"))==null||v.addEventListener("change",x=>{const B=x.target.value,R=document.getElementById("mcq-options-section");R&&(R.style.display=B==="MCQ"?"block":"none")}),($=document.getElementById("eq-type"))==null||$.addEventListener("change",x=>{const B=x.target.value,R=document.getElementById("eq-mcq-section");R&&(R.style.display=B==="MCQ"?"block":"none")}),(b=document.getElementById("user-search-input"))==null||b.addEventListener("input",()=>{W&&clearTimeout(W),W=setTimeout(()=>void F(!0),300)}),(O=document.getElementById("user-role-filter"))==null||O.addEventListener("change",()=>void F(!0)),(V=document.getElementById("question-search-input"))==null||V.addEventListener("input",()=>{Z&&clearTimeout(Z),Z=setTimeout(()=>void q(!0),300)}),(Q=document.getElementById("trash-type-filter"))==null||Q.addEventListener("change",()=>void Y(!0)),(w=document.getElementById("trash-search-input"))==null||w.addEventListener("input",()=>{ee&&clearTimeout(ee),ee=setTimeout(()=>void Y(!0),300)})}async function Qe(){var e,t,a,s,n,i;(e=document.getElementById("logout-btn"))==null||e.addEventListener("click",()=>{xe(),window.location.href="/"});try{y=await m("/users/me"),Re(),Fe(),He(),E()&&((t=document.getElementById("staff-nav"))==null||t.classList.remove("hidden"),(a=document.getElementById("admin-controls"))==null||a.classList.remove("hidden"),(s=document.getElementById("trash-nav-wrap"))==null||s.classList.remove("hidden"),(n=document.getElementById("admin-nav"))==null||n.classList.remove("hidden")),de()||(i=document.getElementById("trash-user-option"))==null||i.remove(),me(),await U(!1),Pe()}catch(c){l(c.message||"Failed to load the dashboard.","error");const o=document.getElementById("exam-list");o&&(o.innerHTML=S("!","Unable to load dashboard","Please refresh the page or try again in a moment."))}}async function C(e=!1){if(E())try{const t=await m("/reports/dashboard"),a=t.overview||t,s=document.getElementById("stats-bar");if(!s)return;s.classList.remove("hidden"),s.innerHTML=`
            <div class="stat-card blue animate-in">
                <div class="stat-card-icon">${g.statExams}</div>
                <div class="stat-card-value">${a.total_exams}</div>
                <div class="stat-card-label">Visible Exams</div>
            </div>
            <div class="stat-card green animate-in" style="animation-delay: 40ms;">
                <div class="stat-card-icon">${g.statLive}</div>
                <div class="stat-card-value">${a.live_exams}</div>
                <div class="stat-card-label">Live Exams</div>
            </div>
            <div class="stat-card amber animate-in" style="animation-delay: 80ms;">
                <div class="stat-card-icon">${g.statAttempts}</div>
                <div class="stat-card-value">${a.total_attempts}</div>
                <div class="stat-card-label">Attempts</div>
            </div>
            <div class="stat-card rose animate-in" style="animation-delay: 120ms;">
                <div class="stat-card-icon">${g.statReview}</div>
                <div class="stat-card-value">${a.pending_evaluation}</div>
                <div class="stat-card-label">Pending Review</div>
            </div>
        `}catch(t){e||l(t.message||"Failed to load dashboard stats.","error")}}async function G(e=!1){const t=document.getElementById("exam-list");if(t)try{const a=await m("/exams/");if(t.innerHTML="",!a.length){t.innerHTML=S("EX","No exams yet",E()?"Create your first exam or wait for a collaborator to assign one.":"Assigned exams will appear here when they are ready.");return}a.forEach((s,n)=>{var p,d,v,$,b;const i=document.createElement("div");i.className="card card-interactive exam-card animate-in",i.style.animationDelay=`${n*45}ms`;const c=s.start_time?`Starts ${new Date(s.start_time).toLocaleString()}`:"No fixed start time",o=s.requires_password?"Password protected":"Password required",r=E()?`
                    <span>${((p=s.teacher_assignments)==null?void 0:p.length)||0} teachers</span>
                    <span>${((d=s.assignments)==null?void 0:d.length)||0} students</span>
                `:"";i.innerHTML=`
                <div class="exam-card-header">
                    <div>
                        <h3>${u(s.title)}</h3>
                        <p class="helper-text">${u(s.instructions||"No instructions added yet.")}</p>
                    </div>
                    <span class="badge ${j(s.status)}">${u(s.status)}</span>
                </div>
                <div class="exam-card-meta">
                    <span>${s.duration_minutes} min</span>
                    <span>${s.question_count||((v=s.questions)==null?void 0:v.length)||0} questions</span>
                    ${r}
                </div>
                <div class="helper-text">
                    ${u(c)} • ${u(o)}
                </div>
                ${E()?`
                            <div class="helper-text">
                                Created by ${u((($=s.creator)==null?void 0:$.name)||((b=s.creator)==null?void 0:b.email)||"Team")}
                            </div>
                        `:""}
                <div class="exam-card-actions">
                    ${E()?`
                                <div class="flex gap-xs">
                                    ${s.can_manage_schedule?`<button class="icon-btn edit-exam" data-id="${s.id}" title="Edit schedule">${g.edit}</button>`:""}
                                    <button class="icon-btn detail-exam" data-id="${s.id}" title="Open details">${g.detail}</button>
                                    <button class="icon-btn danger delete-exam" data-id="${s.id}" title="Delete exam">${g.trash}</button>
                                </div>
                            `:'<div class="helper-text">Assigned exam</div>'}
                    <button class="btn btn-primary btn-sm start-btn" data-id="${s.id}" data-title="${u(s.title)}">
                        ${y.role==="student"?"Start exam":"View details"}
                    </button>
                </div>
            `,t.appendChild(i)}),je()}catch(a){e||l(a.message||"Unable to load exams.","error"),t.innerHTML.trim()||(t.innerHTML=S("!","Unable to load exams",a.message||"Please try again in a moment."))}}function je(){document.querySelectorAll(".start-btn").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id;if(t){if(y.role==="student"){Ue({id:Number.parseInt(t,10),title:e.dataset.title||"this exam"});return}await L(Number.parseInt(t,10))}})}),document.querySelectorAll(".edit-exam").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id;if(t)try{const a=await m(`/exams/${t}`);he(a)}catch(a){l(a.message,"error")}})}),document.querySelectorAll(".delete-exam").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id;if(!(!t||!window.confirm("Delete this exam?")))try{await m(`/exams/${t}`,{method:"DELETE"}),l("Exam deleted.","success"),await U(!0)}catch(a){l(a.message,"error")}})}),document.querySelectorAll(".detail-exam").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.id;t&&L(Number.parseInt(t,10))})})}function Ue(e){J={examId:e.id,title:e.title};const t=document.getElementById("exam-start-modal-title"),a=document.getElementById("exam-start-modal-copy"),s=document.getElementById("exam-start-password");t&&(t.textContent=`Open ${e.title}`),a&&(a.textContent="Enter the exam password to start or resume your attempt. The password itself is only verified on the server."),s&&(s.value="",s.focus()),D("exam-start-modal")}async function Ve(e){if(e.preventDefault(),!J){l("Select an exam first.","error");return}const t=document.getElementById("exam-start-password"),a=(t==null?void 0:t.value)||"";if(!a.trim()){l("Enter the exam password to continue.","warning"),t==null||t.focus();return}try{const s=await m(`/attempts/${J.examId}/start`,{method:"POST",body:JSON.stringify({password:a})});if(A("exam-start-modal"),s.status==="IN_PROGRESS"){if(!s.exam_access_token)throw new Error("Exam access could not be established. Please try again.");Te(s.id,s.exam_access_token),window.location.href=`/exam.html?attempt_id=${s.id}`;return}window.location.href=`/result.html?attempt_id=${s.id}`}catch(s){l(s.message,"error"),t==null||t.focus(),t==null||t.select()}}function he(e){var d;z=e?e.id:null;const t=document.getElementById("exam-modal-title"),a=document.getElementById("exam-submit-btn"),s=document.getElementById("exam-title"),n=document.getElementById("exam-instructions"),i=document.getElementById("exam-duration"),c=document.getElementById("exam-start-time"),o=document.getElementById("exam-status"),r=document.getElementById("exam-password"),p=document.getElementById("exam-password-help");t&&(t.textContent=e?"Edit Exam":"Create Exam"),a&&(a.textContent=e?"Save Changes":"Create Exam"),s&&(s.value=(e==null?void 0:e.title)||""),n&&(n.value=(e==null?void 0:e.instructions)||""),i&&(i.value=((d=e==null?void 0:e.duration_minutes)==null?void 0:d.toString())||"60"),c&&(c.value=Me(e==null?void 0:e.start_time)),o&&(o.value=(e==null?void 0:e.status)||"DRAFT"),r&&(r.value="",r.required=!e||!(e!=null&&e.requires_password),r.placeholder=e?"Leave blank to keep the current exam password":"Enter exam password"),p&&(p.textContent=e?e!=null&&e.requires_password?"Only the assigned examiner or an admin can change the exam password. Leave this blank to keep the current password.":"This exam does not have a password yet. Set one now so students can open it securely.":"Students must enter this password before they can open the exam."),D("exam-modal")}async function ze(e){e.preventDefault();const t={title:document.getElementById("exam-title").value,instructions:document.getElementById("exam-instructions").value,duration_minutes:Number.parseInt(document.getElementById("exam-duration").value,10),start_time:Ne(document.getElementById("exam-start-time").value),status:document.getElementById("exam-status").value},a=document.getElementById("exam-password").value.trim();if(!z&&!a){l("Exam password is required before students can start the exam.","warning");return}a&&(t.password=a);try{z?(await m(`/exams/${z}`,{method:"PUT",body:JSON.stringify(t)}),l("Exam updated.","success")):(await m("/exams/",{method:"POST",body:JSON.stringify(t)}),l("Exam created.","success")),A("exam-modal"),await U(!0)}catch(s){l(s.message,"error")}}function Je(e,t){return t.length?t.map(a=>{var s,n,i;return`
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <span class="text-sm">${u(a.prompt.substring(0,110))}</span>
                        <span class="helper-text">
                            ${u(((s=a.folder)==null?void 0:s.name)||"Unfiled")} • ${u(((n=a.owner)==null?void 0:n.name)||((i=a.owner)==null?void 0:i.email)||"Shared bank")}
                        </span>
                    </div>
                    <button class="btn btn-primary btn-sm add-q-to-exam" data-exam="${e}" data-qid="${a.id}">
                        Add
                    </button>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No additional accessible questions available.</p>'}function Ge(e,t,a){return a?`
            <div class="card" style="padding: 1rem; border: 1px dashed var(--border-color);">
                <div class="section-title mb-1">Question bank unavailable</div>
                <p class="helper-text">${u(a)}</p>
            </div>
        `:Je(e,t)}function ne(e,t,a){return e.length?`
        <div class="assignment-grid">
            ${e.map(s=>`
                        <label class="assignment-option">
                            <input
                                type="checkbox"
                                class="assign-${a}"
                                value="${s.id}"
                                ${t.has(s.id)?"checked":""}
                            >
                            <div>
                                <strong>${u(s.name||s.email)}</strong>
                                <p class="helper-text">${u(s.email)}</p>
                            </div>
                        </label>
                    `).join("")}
        </div>
    `:`<p class="text-sm text-muted">No ${a}s available.</p>`}function Xe(e){var t;return(t=e.questions)!=null&&t.length?e.questions.map(a=>{var n;const s=a.question||a;return`
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <div class="flex items-center gap-sm">
                            <span class="badge badge-info">${s.type||"MCQ"}</span>
                            <span class="chip">${s.marks||1} marks</span>
                            ${(n=s.folder)!=null&&n.name?`<span class="chip">${u(s.folder.name)}</span>`:""}
                        </div>
                        <span class="text-sm">${u((s.prompt||"").substring(0,110))}</span>
                    </div>
                    <button class="icon-btn danger remove-q" data-exam="${e.id}" data-qid="${a.question_id}" title="Remove question">
                        ×
                    </button>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No questions added yet.</p>'}function Ye(e){return e.length?`
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
                ${e.map(t=>{var a,s;return`
                            <tr>
                                <td class="table-primary">${u(((a=t.student)==null?void 0:a.name)||((s=t.student)==null?void 0:s.email)||`Student #${t.student_id}`)}</td>
                                <td><span class="badge ${j(t.status)}">${t.status}</span></td>
                                <td class="text-sm">${new Date(t.started_at).toLocaleString()}</td>
                                <td class="text-sm">${Ce(t.remaining_seconds,t.status)}</td>
                                <td>
                                    ${t.result?`${t.result.total_score}/${t.result.max_score}`:"—"}
                                </td>
                                <td>
                                    <div class="flex gap-xs">
                                        ${t.status==="SUBMITTED"?`<button class="btn btn-sm btn-success evaluate-btn" data-id="${t.id}">Evaluate</button>`:""}
                                        ${t.status==="SUBMITTED"||t.status==="EVALUATED"?`<a class="btn btn-ghost btn-sm" href="/result.html?attempt_id=${t.id}">Open report</a>`:'<span class="text-sm text-muted">In progress</span>'}
                                        <button class="btn btn-ghost btn-sm delete-attempt" data-id="${t.id}">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `}).join("")}
            </tbody>
        </table>
    `:S("AT","No attempts yet","Attempts will appear here once students start.")}async function L(e,t={}){var n,i;const{keepOpen:a=!1,silent:s=!1}=t;try{T=e;const[c,o,r,p,d]=await Promise.allSettled([m(`/exams/${e}`),m("/exams/questions"),m(`/attempts/exam/${e}`),m("/users/?role=examiner"),m("/users/?role=student")]);if(c.status!=="fulfilled")throw c.reason;const v=c.value,$=o.status==="fulfilled"?o.value:[],b=r.status==="fulfilled"?r.value:[],O=p.status==="fulfilled"?p.value:[],V=d.status==="fulfilled"?d.value:[],Q=o.status==="rejected"?qe(o.reason,"The question bank could not be loaded for this exam right now."):null,w=document.getElementById("exam-detail-content"),x=document.getElementById("exam-detail-title");if(!w||!x)return;x.textContent=v.title;const B=new Set((v.teacher_assignments||[]).map(h=>h.teacher_id)),R=new Set((v.assignments||[]).map(h=>h.student_id)),Ee=(v.questions||[]).map(h=>h.question_id),we=Q?[]:$.filter(h=>!Ee.includes(h.id));w.innerHTML=`
            <div class="tabs">
                <button class="tab active" data-tab="questions">Questions (${((n=v.questions)==null?void 0:n.length)||0})</button>
                <button class="tab" data-tab="attempts">Attempts (${b.length})</button>
                <button class="tab" data-tab="assign">Assignments</button>
            </div>

            <div id="tab-questions">
                ${Xe(v)}
                <div class="detail-divider"></div>
                <div class="section-title mb-1">Add From Question Bank</div>
                ${Ge(e,we,Q)}
            </div>

            <div id="tab-attempts" class="hidden">
                ${Ye(b)}
            </div>

            <div id="tab-assign" class="hidden">
                <div class="stack-list">
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Teachers</div>
                        <p class="helper-text mb-2">
                            Assigned teachers can see this exam, manage questions, and review attempts.
                        </p>
                        ${ne(O,B,"teacher")}
                    </div>
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Students</div>
                        <p class="helper-text mb-2">
                            Assigned students will see the exam on their dashboard once it becomes available.
                        </p>
                        ${ne(V,R,"student")}
                    </div>
                    <div class="flex items-center justify-between gap-sm">
                        <p class="helper-text">Question folders used in this exam will be shared to assigned teachers automatically.</p>
                        <button class="btn btn-primary" id="assign-btn">Save assignments</button>
                    </div>
                </div>
            </div>
        `,w.querySelectorAll(".tab").forEach(h=>{h.addEventListener("click",()=>{w.querySelectorAll(".tab").forEach(f=>f.classList.remove("active")),h.classList.add("active");const k=h.dataset.tab;["questions","attempts","assign"].forEach(f=>{var H;(H=w.querySelector(`#tab-${f}`))==null||H.classList.toggle("hidden",f!==k)})})}),w.querySelectorAll(".add-q-to-exam").forEach(h=>{h.addEventListener("click",async()=>{const k=h.dataset.exam,f=h.dataset.qid;if(!(!k||!f))try{await m(`/exams/${k}/questions/${f}`,{method:"POST"}),l("Question added to exam.","success"),await L(e,{keepOpen:!0}),await q(!0)}catch(H){l(H.message,"error")}})}),w.querySelectorAll(".remove-q").forEach(h=>{h.addEventListener("click",async()=>{const k=h.dataset.exam,f=h.dataset.qid;if(!(!k||!f))try{await m(`/exams/${k}/questions/${f}`,{method:"DELETE"}),l("Question removed from exam.","success"),await L(e,{keepOpen:!0})}catch(H){l(H.message,"error")}})}),w.querySelectorAll(".evaluate-btn").forEach(h=>{h.addEventListener("click",async()=>{const k=h.dataset.id;if(k)try{const f=await m(`/attempts/${k}/evaluate`,{method:"POST"});l(`Evaluated: ${f.score}/${f.max_score}`,"success"),await L(e,{keepOpen:!0})}catch(f){l(f.message,"error")}})}),w.querySelectorAll(".delete-attempt").forEach(h=>{h.addEventListener("click",async()=>{const k=h.dataset.id;if(!(!k||!window.confirm("Delete this submission? It will move to Recently Deleted.")))try{await m(`/attempts/${k}`,{method:"DELETE"}),l("Submission moved to Recently Deleted.","success"),await L(e,{keepOpen:!0}),await X(!0),await C(!0)}catch(f){l(f.message,"error")}})}),(i=w.querySelector("#assign-btn"))==null||i.addEventListener("click",async()=>{const h=Array.from(w.querySelectorAll(".assign-teacher:checked")).map(f=>Number.parseInt(f.value,10)),k=Array.from(w.querySelectorAll(".assign-student:checked")).map(f=>Number.parseInt(f.value,10));try{await m(`/exams/${e}/assign`,{method:"POST",body:JSON.stringify({teacher_ids:h,student_ids:k})}),l("Assignments updated.","success"),await L(e,{keepOpen:!0}),await G(!0)}catch(f){l(f.message,"error")}}),a||D("exam-detail-modal")}catch(c){s||l(c.message,"error")}}async function F(e=!1){var a,s,n;const t=document.getElementById("users-tbody");if(t)try{const i=(s=(a=document.getElementById("user-search-input"))==null?void 0:a.value)==null?void 0:s.trim(),c=(n=document.getElementById("user-role-filter"))==null?void 0:n.value;let o="/users/?limit=200";i&&(o+=`&q=${encodeURIComponent(i)}`),c&&(o+=`&role=${encodeURIComponent(c)}`),se=await m(o),t.innerHTML=se.map(r=>`
                    <tr>
                        <td class="table-primary">${u(r.name||"—")}</td>
                        <td>${u(r.email)}</td>
                        <td>
                            <span class="badge ${r.role==="admin"?"badge-danger":r.role==="examiner"?"badge-warning":"badge-info"}">${r.role}</span>
                        </td>
                        <td>
                            <span class="badge ${r.is_active?"badge-success":"badge-danger"}">
                                ${r.is_active?"Active":"Inactive"}
                            </span>
                        </td>
                        <td style="text-align: right;">
                            <div class="table-action-stack">
                                <div class="flex gap-xs" style="justify-content: flex-end; flex-wrap: wrap;">
                                    ${r.can_edit?`<button class="icon-btn edit-user" data-id="${r.id}" title="Edit user">${g.edit}</button>`:""}
                                    ${r.can_toggle_active?`<button class="btn btn-ghost btn-sm toggle-user-access" data-id="${r.id}" data-next-active="${r.is_active?"false":"true"}">${r.is_active?"Remove access":"Restore access"}</button>`:""}
                                    ${r.can_delete?`<button class="icon-btn danger delete-user" data-id="${r.id}" title="Delete user">${g.trash}</button>`:""}
                                </div>
                                ${Le(r)||r.can_delete?"":`<span class="table-action-note">${u(r.protected_reason||"View only")}</span>`}
                            </div>
                        </td>
                    </tr>
                `).join(""),Ke()}catch(i){e||l(i.message,"error")}}function Ke(){document.querySelectorAll(".edit-user").forEach(e=>{e.addEventListener("click",()=>{const t=Number.parseInt(e.dataset.id||"",10),a=se.find(s=>s.id===t);a&&ge(a)})}),document.querySelectorAll(".toggle-user-access").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id,a=e.dataset.nextActive==="true";if(!t)return;const s=a?"Restore access for this user?":"Remove access for this user?";if(window.confirm(s))try{await m(`/users/${t}`,{method:"PUT",body:JSON.stringify({is_active:a})}),l(a?"Access restored.":"Access removed.","success"),await F(!0),await C(!0)}catch(n){l(n.message,"error")}})}),document.querySelectorAll(".delete-user").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id;if(!(!t||!window.confirm("Delete this user?")))try{await m(`/users/${t}`,{method:"DELETE"}),l("User moved to Recently Deleted.","success"),await F(!0),await C(!0)}catch(a){l(a.message,"error")}})})}function ge(e){ae=e?e.id:null;const t=document.getElementById("user-modal-title"),a=document.getElementById("user-submit-btn"),s=document.getElementById("user-name-input"),n=document.getElementById("user-email-input"),i=document.getElementById("user-password-input"),c=document.getElementById("user-role-input");t&&(t.textContent=e?"Edit User":"Add User"),a&&(a.textContent=e?"Save Changes":"Add User"),s&&(s.value=(e==null?void 0:e.name)||""),n&&(n.value=(e==null?void 0:e.email)||""),i&&(i.value="",i.required=!e),c&&(c.value=(e==null?void 0:e.role)||"student"),me((e==null?void 0:e.role)||"student"),D("user-modal")}async function We(e){e.preventDefault();const t={name:document.getElementById("user-name-input").value,email:document.getElementById("user-email-input").value,role:document.getElementById("user-role-input").value},a=document.getElementById("user-password-input").value;a&&(t.password=a);try{if(ae)await m(`/users/${ae}`,{method:"PUT",body:JSON.stringify(t)}),l("User updated.","success");else{if(!a){l("Password required for a new user.","warning");return}await m("/users/",{method:"POST",body:JSON.stringify(t)}),l("User created.","success")}A("user-modal"),await F(!0),await C(!0)}catch(s){l(s.message,"error")}}async function fe(){return E()?(N=await m("/exams/question-folders"),I&&!N.some(e=>e.id===I)&&(I=null),N):[]}async function re(e){I=e,await q(!0)}function ye(){const e=document.getElementById("q-folder");if(!e)return;const t=ce();e.innerHTML=t.map(a=>`
                <option value="${a.id}">
                    ${a.name}${a.access_level==="shared"?" (Shared)":""}
                </option>
            `).join(""),t.length||(e.innerHTML='<option value="">Create or own a folder first</option>')}function Ze(){const e=document.getElementById("question-folder-toolbar");if(e){if(!N.length){e.innerHTML=S(g.folder,"No folders yet","Create your first question folder to organize a personal or shared question bank.");return}e.innerHTML=`
        <div class="card" style="padding: 1rem; margin-bottom: 1rem;">
            <div class="section-title mb-1">Folders</div>
            <div class="trash-list-stack" style="max-height:280px; overflow-y:auto;">
                ${N.map(t=>{var a;return`
                        <div
                            class="folder-card ${I===t.id?"folder-active":""}"
                            data-folder-id="${t.id}"
                            role="button"
                            tabindex="0"
                            aria-pressed="${I===t.id}"
                            aria-label="Open question folder"
                        >
                            <div class="folder-card-icon">${g.folder}</div>
                            <div>
                                <div style="font-weight:700;font-size:0.95rem;">${u(t.name)}</div>
                                <div class="helper-text" style="font-size:0.82rem;">
                                    ${t.question_count||0} questions
                                    • ${u(ue(t))}
                                    ${(a=t.shared_with)!=null&&a.length?` • Shared with ${t.shared_with.length} examiner${t.shared_with.length===1?"":"s"}`:""}
                                </div>
                            </div>
                            <div class="folder-card-actions">
                                ${t.can_share?`<button class="icon-btn edit-folder" data-id="${t.id}" title="Edit folder">${g.edit}</button>`:""}
                                <button class="icon-btn ${I===t.id?"btn-primary":""} folder-filter" data-folder="${t.id}" title="Filter by folder" style="font-size:0.7rem;width:auto;padding:0 0.5rem;">${I===t.id?"✓":"Filter"}</button>
                                ${t.can_delete?`<button class="icon-btn danger delete-folder" data-id="${t.id}" title="Delete folder">${g.trash}</button>`:""}
                            </div>
                        </div>
                    `}).join("")}
            </div>
            <div style="margin-top:0.75rem;">
                <button class="btn btn-sm ${I===null?"btn-primary":"btn-ghost"} folder-filter" data-folder="">
                    Show all questions
                </button>
            </div>
        </div>
    `,e.querySelectorAll(".folder-card[data-folder-id]").forEach(t=>{const a=async()=>{const s=Number.parseInt(t.dataset.folderId||"",10);Number.isNaN(s)||await re(s)};t.addEventListener("click",s=>{s.target.closest(".folder-card-actions")||a()}),t.addEventListener("keydown",s=>{s.key!=="Enter"&&s.key!==" "||(s.preventDefault(),a())})}),e.querySelectorAll(".folder-filter").forEach(t=>{t.addEventListener("click",a=>{a.stopPropagation();const s=t.dataset.folder,n=s&&s.trim()?Number.parseInt(s,10):null;re(Number.isNaN(n)?null:n)})}),e.querySelectorAll(".edit-folder").forEach(t=>{t.addEventListener("click",()=>{const a=Number(t.dataset.id),s=N.find(n=>n.id===a);s&&ht(s)})}),e.querySelectorAll(".delete-folder").forEach(t=>{t.addEventListener("click",async()=>{const a=t.dataset.id;if(!(!a||!window.confirm("Move this folder and all its questions to Recently Deleted?")))try{await m(`/exams/question-folders/${a}`,{method:"DELETE"}),l("Folder moved to Recently Deleted.","success"),I=null,await q(!0)}catch(s){l(s.message,"error")}})})}}async function q(e=!1){var a,s;const t=document.getElementById("questions-list");if(t)try{await fe(),Ze(),ye();const n=new URLSearchParams,i=(s=(a=document.getElementById("question-search-input"))==null?void 0:a.value)==null?void 0:s.trim();I&&n.set("folder_id",String(I)),i&&n.set("q",i);const c=n.toString()?`?${n.toString()}`:"",o=await m(`/exams/questions${c}`);if(!o.length){t.innerHTML=S("QB","No questions yet","Build your question bank here for reuse across exams and collaborator assignments.");return}t.innerHTML=o.map((r,p)=>{var d,v,$,b;return`
                    <div class="card question-card animate-in" style="animation-delay: ${p*35}ms;">
                        <div class="question-card-header">
                            <div class="flex items-center gap-sm">
                                <span class="badge ${r.type==="MCQ"?"badge-primary":"badge-purple"}">${r.type}</span>
                                <span class="chip">${r.marks} marks</span>
                                ${(d=r.folder)!=null&&d.name?`<span class="chip">${u(r.folder.name)}</span>`:""}
                            </div>
                            <div class="question-card-actions">
                                ${r.can_edit?`<button class="icon-btn edit-question" data-id="${r.id}" title="Edit question">${g.edit}</button>`:""}
                                ${r.can_delete?`<button class="icon-btn danger delete-question" data-id="${r.id}" title="Delete question">${g.trash}</button>`:""}
                            </div>
                        </div>
                        <p class="text-sm">${u(r.prompt)}</p>
                        ${(v=r.options)!=null&&v.length?`
                                    <div class="flex gap-xs mt-2" style="flex-wrap: wrap;">
                                        ${r.options.map(O=>`<span class="chip">${u(O)}</span>`).join("")}
                                    </div>
                                `:""}
                        <p class="helper-text mt-2">
                            ${u((($=r.owner)==null?void 0:$.name)||((b=r.owner)==null?void 0:b.email)||"Personal bank")}
                            ${r.folder?` • ${u(ue(r.folder))}`:""}
                        </p>
                    </div>
                `}).join(""),document.querySelectorAll(".edit-question").forEach(r=>{r.addEventListener("click",()=>{const p=Number(r.dataset.id),d=o.find(v=>v.id===p);d&&pt(d)})}),document.querySelectorAll(".delete-question").forEach(r=>{r.addEventListener("click",async()=>{const p=r.dataset.id;if(!(!p||!window.confirm("Move this question to Recently Deleted?")))try{await m(`/exams/questions/${p}`,{method:"DELETE"}),l("Question moved to Recently Deleted.","success"),await q(!0)}catch(d){l(d.message,"error")}})})}catch(n){e||l(n.message,"error"),t.innerHTML=S("!","Question bank unavailable",n.message||"Please try again in a moment.")}}async function be(){const e=document.getElementById("folder-modal-title"),t=document.getElementById("folder-submit-btn"),a=document.getElementById("folder-name"),s=document.getElementById("folder-description");e&&(e.textContent="Create Folder"),t&&(t.textContent="Create Folder"),a&&(a.value=""),s&&(s.value=""),await pe("folder-share-list"),D("folder-modal")}async function et(e){e.preventDefault();const t={name:document.getElementById("folder-name").value,description:document.getElementById("folder-description").value,share_with_teacher_ids:le("folder-share-list")};try{await m("/exams/question-folders",{method:"POST",body:JSON.stringify(t)}),l("Folder created.","success"),A("folder-modal"),await q(!0)}catch(a){l(a.message,"error")}}async function tt(){var r;await fe();const e=ce();if(!e.length){l("Create or own a question folder before adding questions.","warning"),be();return}ye();const t=document.getElementById("question-modal-title"),a=document.getElementById("q-type"),s=document.getElementById("q-prompt"),n=document.getElementById("q-marks"),i=document.getElementById("q-correct"),c=document.getElementById("q-folder");if(t&&(t.textContent="Add Question"),a&&(a.value="MCQ"),s&&(s.value=""),n&&(n.value="1"),i&&(i.value=""),c){const p=(I&&e.some(d=>d.id===I)?I:null)||((r=e[0])==null?void 0:r.id);c.value=p?p.toString():""}document.querySelectorAll(".mcq-option").forEach(p=>{p.value=""});const o=document.getElementById("mcq-options-section");o&&(o.style.display="block"),D("question-modal")}async function at(e){e.preventDefault();const t=document.getElementById("q-type").value,a=Number.parseInt(document.getElementById("q-folder").value,10),s={type:t,prompt:document.getElementById("q-prompt").value,marks:Number.parseInt(document.getElementById("q-marks").value,10),folder_id:Number.isNaN(a)?void 0:a};t==="MCQ"&&(s.options=Array.from(document.querySelectorAll(".mcq-option")).map(n=>n.value.trim()).filter(Boolean),s.correct_option=document.getElementById("q-correct").value);try{await m("/exams/questions",{method:"POST",body:JSON.stringify(s)}),l("Question created.","success"),A("question-modal"),await q(!0)}catch(n){l(n.message,"error")}}function st(e){const t=(e==null?void 0:e.overview)||{};return`
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
                    <strong class="report-kpi-value">${t.attempt_count||0}</strong>
                    <span class="report-kpi-note">${t.evaluated_count||0} evaluated</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Average Score</span>
                    <strong class="report-kpi-value">${_(t.average_percentage)}</strong>
                    <span class="report-kpi-note">Best ${_(t.best_percentage)}</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Flags</span>
                    <strong class="report-kpi-value">${t.total_flags||0}</strong>
                    <span class="report-kpi-note">Across all attempts</span>
                </div>
            </div>
        </section>
    `}async function X(e=!1){const t=document.getElementById("results-list"),a=document.getElementById("results-summary");if(!(!t||!a))try{const s=y.role==="student"?m("/reports/student/me").catch(()=>null):Promise.resolve(null),[n,i]=await Promise.all([m("/attempts/"),s]);a.innerHTML=i?st(i):"";const c=n.filter(o=>o.status==="SUBMITTED"||o.status==="EVALUATED");if(!c.length){t.innerHTML=S("RS","No results yet","Completed exam attempts will show up here.");return}t.innerHTML=c.map((o,r)=>{var p,d;return`
                    <div class="card card-interactive exam-card animate-in result-entry" data-attempt-id="${o.id}" style="cursor: pointer; animation-delay: ${r*35}ms;">
                        <div class="exam-card-header">
                            <div>
                                <h3>${y.role==="student"?`Attempt #${o.id}`:u(((p=o.student)==null?void 0:p.name)||((d=o.student)==null?void 0:d.email)||`Attempt #${o.id}`)}</h3>
                                <p class="helper-text">
                                    Exam #${o.exam_id}
                                    ${o.result?` • Score ${o.result.total_score}/${o.result.max_score}`:""}
                                </p>
                            </div>
                            <span class="badge ${j(o.status)}">${o.status}</span>
                        </div>
                        <div class="exam-card-meta">
                            <span>${new Date(o.started_at).toLocaleString()}</span>
                            <span>Open analytics</span>
                        </div>
                    </div>
                `}).join(""),document.querySelectorAll(".result-entry").forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.attemptId;r&&(window.location.href=`/result.html?attempt_id=${r}`)})})}catch(s){e||l(s.message,"error"),t.innerHTML=S("!","Results unavailable",s.message||"Please try again in a moment.")}}function _(e){return`${(Number.isFinite(e)?Number(e):0).toFixed(1).replace(/\.0$/,"")}%`}function ie(e){return(Number.isFinite(e)?Number(e):0).toFixed(1).replace(/\.0$/,"")}function M(e,t="blue",a="No data yet."){if(!e.length||e.every(n=>n.count===0))return`<p class="helper-text">${a}</p>`;const s=Math.max(...e.map(n=>n.count),1);return`
        <div class="report-bars">
            ${e.map(n=>`
                        <div class="report-bar-row">
                            <div class="report-bar-head">
                                <span>${u(n.label)}</span>
                                <span>${n.count}</span>
                            </div>
                            <div class="report-bar-track">
                                <div class="report-bar-fill ${t}" style="width: ${n.count/s*100}%"></div>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `}function te(e,t,a,s){const n=Math.max(0,Math.min(100,Number.isFinite(t)?Number(t):0));return`
        <div class="report-donut-card">
            <div class="report-donut ${s}" style="--value:${n}">
                <span>${_(n)}</span>
            </div>
            <h4>${u(e)}</h4>
            <p>${u(a)}</p>
        </div>
    `}function nt(e){if(!e.length)return'<p class="helper-text">No recent activity yet.</p>';const t=Math.max(...e.flatMap(a=>[a.started,a.submitted,a.evaluated]),1);return`
        <div class="timeline-legend">
            <span><i class="legend-dot blue"></i>Started</span>
            <span><i class="legend-dot amber"></i>Submitted</span>
            <span><i class="legend-dot green"></i>Evaluated</span>
        </div>
        <div class="timeline-grid">
            ${e.map(a=>`
                        <div class="timeline-day">
                            <div class="timeline-day-bars">
                                <span class="timeline-bar blue" style="height:${a.started/t*100}%"></span>
                                <span class="timeline-bar amber" style="height:${a.submitted/t*100}%"></span>
                                <span class="timeline-bar green" style="height:${a.evaluated/t*100}%"></span>
                            </div>
                            <span class="timeline-day-label">${u(a.label)}</span>
                        </div>
                    `).join("")}
        </div>
    `}function rt(e){return e.length?`
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
                ${e.map(t=>`
                            <tr>
                                <td class="table-primary">${u(t.title)}</td>
                                <td>${t.attempt_count}</td>
                                <td>${_(t.completion_rate)}</td>
                                <td>${_(t.average_percentage)}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">No exam analytics available yet.</p>'}function it(e){return e.length?`
        <div class="insight-list">
            ${e.slice(0,4).map(t=>`
                        <div class="insight-item">
                            <div class="insight-item-head">
                                <span class="badge ${t.type==="MCQ"?"badge-primary":"badge-purple"}">${t.type}</span>
                                <span class="chip">${u(t.difficulty)}</span>
                            </div>
                            <p class="text-sm">${u(t.prompt)}</p>
                            <div class="insight-item-meta">
                                <span>Response ${_(t.response_rate)}</span>
                                ${t.type==="MCQ"?`<span>Correct ${_(t.correct_rate)}</span>`:`<span>Avg marks ${ie(t.average_awarded_marks)}/${ie(t.marks)}</span>`}
                                <span>Blank ${t.blank_count}</span>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `:'<p class="helper-text">Question-level analytics will appear after candidates start submitting.</p>'}function ot(e){return e.length?`
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
                ${e.map(t=>`
                            <tr>
                                <td class="table-primary">${u(t.student_name)}</td>
                                <td><span class="badge ${j(t.status)}">${u(t.status)}</span></td>
                                <td>${t.percentage!==null?_(t.percentage):"—"}</td>
                                <td>${t.violations}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">Leaderboard data appears after attempts are submitted.</p>'}function dt(e){return M(e,"blue","No delivery funnel data yet.")}function lt(e){const t=e.overview||e;return`
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
                    <strong class="report-kpi-value">${_(t.average_percentage)}</strong>
                    <span class="report-kpi-note">${t.evaluated_attempts} evaluated attempts</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${_(t.participation_rate)}</strong>
                    <span class="report-kpi-note">${t.total_attempts} attempts across assignments</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Alerts</span>
                    <strong class="report-kpi-value">${t.integrity_alerts}</strong>
                    <span class="report-kpi-note">${t.high_risk_attempts} high-risk attempts</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Pending Review</span>
                    <strong class="report-kpi-value">${t.pending_evaluation}</strong>
                    <span class="report-kpi-note">${t.active_attempts} currently in progress</span>
                </div>
            </div>
        </section>
    `}function ct(e){const t=e.overview||e;return`
        <section class="report-grid">
            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Delivery Health</h4>
                        <p class="report-panel-copy">Participation, quality, and active exam mix.</p>
                    </div>
                </div>
                <div class="report-visual-grid">
                    ${te("Participation rate",t.participation_rate,`${t.total_attempts} total attempts`,"blue")}
                    ${te("Average score",t.average_percentage,`${t.evaluated_attempts} evaluated`,"green")}
                    ${te("High-risk share",t.total_attempts?t.high_risk_attempts/t.total_attempts*100:0,`${t.high_risk_attempts} flagged attempts`,"rose")}
                </div>
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Exam Status Mix</h4>
                        <p class="report-panel-copy">How the current exam portfolio is distributed.</p>
                    </div>
                </div>
                ${M(e.exam_status_breakdown||[],"amber","No exam status data yet.")}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Attempt Flow</h4>
                        <p class="report-panel-copy">Current candidate progress through the lifecycle.</p>
                    </div>
                </div>
                ${M(e.attempt_status_breakdown||[],"green","No attempt data yet.")}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Recent Activity</h4>
                        <p class="report-panel-copy">Started, submitted, and evaluated attempts over the last 7 days.</p>
                    </div>
                </div>
                ${nt(e.activity_timeline||[])}
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
                        ${M(e.integrity_breakdown||[],"rose","No integrity events recorded.")}
                    </div>
                    <div>
                        <span class="section-title">Risk Bands</span>
                        ${M(e.risk_distribution||[],"amber","No risk distribution yet.")}
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
                ${rt(e.top_exams||[])}
            </article>
        </section>
    `}function ut(e,t){const a=e.overview||{},s=e.exam||{};return`
        <article class="card report-exam-card animate-in" style="animation-delay:${t*45}ms;">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Exam Analytics</span>
                    <h3 class="card-title">${u(s.title||"Exam")}</h3>
                    <p class="report-panel-copy">
                        ${s.question_count||0} questions • ${s.duration_minutes||0} minutes • ${s.assigned_students||0} assigned students • ${s.teacher_count||0} teachers
                    </p>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="badge ${j(s.status||"DRAFT")}">${u(s.status||"DRAFT")}</span>
                    <span class="chip">${s.start_time?new Date(s.start_time).toLocaleString():"No start time"}</span>
                </div>
            </div>

            <div class="report-kpi-grid compact">
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${_(a.participation_rate)}</strong>
                    <span class="report-kpi-note">${a.attempt_count||0} started</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Completion</span>
                    <strong class="report-kpi-value">${_(a.completion_rate)}</strong>
                    <span class="report-kpi-note">${a.submitted_count||0} submitted</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Average Score</span>
                    <strong class="report-kpi-value">${_(a.average_percentage)}</strong>
                    <span class="report-kpi-note">Median ${_(a.median_percentage)}</span>
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
                    ${dt(e.progress_funnel||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Score Distribution</h4>
                        <p class="report-panel-copy">Percentage score bands for evaluated attempts.</p>
                    </div>
                    ${M(e.score_distribution||[],"green","No evaluated scores yet.")}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Question Insights</h4>
                        <p class="report-panel-copy">Hardest or lowest-response questions first.</p>
                    </div>
                    ${it(e.question_insights||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Leaderboard</h4>
                        <p class="report-panel-copy">Top evaluated candidates with flag counts.</p>
                    </div>
                    ${ot(e.leaderboard||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Integrity Breakdown</h4>
                        <p class="report-panel-copy">What kind of proctoring events were recorded.</p>
                    </div>
                    ${M(e.proctoring_breakdown||[],"rose","No proctoring events recorded.")}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Risk Distribution</h4>
                        <p class="report-panel-copy">Clean, flagged, and high-risk attempt mix.</p>
                    </div>
                    ${M(e.risk_distribution||[],"amber","No risk signals yet.")}
                </section>
            </div>
        </article>
    `}async function $e(e=!1){const t=document.getElementById("reports-content");if(t)try{const[a,s]=await Promise.all([m("/reports/dashboard"),m("/exams/")]);if(!s.length&&!(a.top_exams||[]).length){t.innerHTML=S("RP","No report data","Reports will appear once exams and attempts exist.");return}const i=(await Promise.all(s.map(async c=>{try{return await m(`/reports/exam/${c.id}/analytics`)}catch{return null}}))).filter(Boolean);i.sort((c,o)=>{var d,v,$,b;const r=((d=c==null?void 0:c.overview)==null?void 0:d.attempt_count)||0,p=((v=o==null?void 0:o.overview)==null?void 0:v.attempt_count)||0;return r!==p?p-r:String((($=c==null?void 0:c.exam)==null?void 0:$.title)||"").localeCompare(String(((b=o==null?void 0:o.exam)==null?void 0:b.title)||""))}),t.innerHTML=`
            <div class="reports-shell">
                ${lt(a)}
                ${ct(a)}
                <section class="stack-list">
                    ${i.length?i.map((c,o)=>ut(c,o)).join(""):S(g.detail,"Per-exam analytics unavailable","The dashboard summary loaded, but detailed exam analytics could not be generated right now.")}
                </section>
            </div>
        `}catch(a){e||l(a.message,"error"),t.innerHTML=S("!","Reports unavailable",a.message||"Please try again in a moment.")}}async function oe(e){const t=[Y(!0)];e==="user"&&E()&&t.push(F(!0),C(!0)),e==="exam"&&(t.push(G(!0),X(!0)),E()&&t.push(C(!0),$e(!0)),T&&t.push(L(T,{keepOpen:!0,silent:!0}))),(e==="question"||e==="folder")&&E()&&t.push(q(!0)),e==="attempt"&&(t.push(G(!0),X(!0)),E()&&t.push(C(!0)),T&&t.push(L(T,{keepOpen:!0,silent:!0}))),await Promise.all(t.map(a=>a.catch(()=>{})))}async function Y(e=!1){var a,s,n;const t=document.getElementById("trash-list");if(t)try{const i=(a=document.getElementById("trash-type-filter"))==null?void 0:a.value,c=(n=(s=document.getElementById("trash-search-input"))==null?void 0:s.value)==null?void 0:n.trim(),o=new URLSearchParams;i&&o.set("entity_type",i),c&&o.set("q",c);const r=o.toString()?`/trash/?${o.toString()}`:"/trash/",p=await m(r);if(!p.length){t.innerHTML=S(g.trash,"Nothing in trash","Deleted exams, questions, folders, and users will appear here.");return}t.innerHTML=`<div class="trash-list-stack">
            ${p.map((d,v)=>`
                <div class="trash-item animate-in" style="animation-delay:${v*30}ms;">
                    <div class="trash-item-icon ${d.entity_type}">${d.entity_type==="exam"?g.exam:d.entity_type==="question"?g.question:d.entity_type==="folder"?g.folder:d.entity_type==="attempt"?g.detail:d.entity_type==="user"?g.user:g.trash}</div>
                    <div class="trash-item-details">
                        <div style="font-weight:700;font-size:0.95rem;">${u(d.label)}</div>
                        <div class="helper-text" style="font-size:0.82rem;">
                            <span class="badge badge-info" style="font-size:0.7rem;">${d.entity_type}</span>
                            &nbsp;Deleted ${new Date(d.deleted_at).toLocaleString()}
                        </div>
                    </div>
                    <div class="trash-item-actions">
                        ${d.can_restore?`<button class="icon-btn trash-restore" data-trash-id="${d.id}" data-entity-type="${d.entity_type}" title="Restore item">${g.restore}</button>`:""}
                        ${d.can_permanent_delete?`<button class="icon-btn danger trash-purge" data-trash-id="${d.id}" data-entity-type="${d.entity_type}" title="Permanently delete">${g.trash}</button>`:""}
                        ${d.can_restore||d.can_permanent_delete?"":'<span class="table-action-note">No actions available</span>'}
                    </div>
                </div>
            `).join("")}
        </div>`,t.querySelectorAll(".trash-restore").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.trashId,$=d.dataset.entityType||"";if(v)try{const b=await m(`/trash/${v}/restore`,{method:"POST"});l(b.message||"Item restored successfully.","success"),await oe($)}catch(b){l(b.message,"error")}})}),t.querySelectorAll(".trash-purge").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.trashId,$=d.dataset.entityType||"";if(!(!v||!window.confirm("Permanently delete this item? This cannot be undone.")))try{await m(`/trash/${v}/permanent`,{method:"DELETE"}),l("Permanently deleted.","success"),await oe($)}catch(b){l(b.message,"error")}})})}catch(i){e||l(i.message,"error"),t.innerHTML=S("!","Unable to load trash",i.message||"Please try again.")}}function mt(e){const t=document.getElementById("eq-folder");if(!t)return;const a=N.filter(s=>s.can_edit||s.id===e);t.innerHTML=a.map(s=>`
                <option value="${s.id}" ${s.id===e?"selected":""}>
                    ${u(s.name)}${s.can_edit?"":" (Current folder)"}
                </option>
            `).join("")}function pt(e){const t=document.getElementById("eq-type"),a=document.getElementById("eq-prompt"),s=document.getElementById("eq-marks"),n=document.getElementById("eq-correct"),i=document.getElementById("eq-id"),c=document.getElementById("eq-mcq-section");i&&(i.value=String(e.id)),t&&(t.value=e.type||"MCQ"),a&&(a.value=e.prompt||""),s&&(s.value=String(e.marks||1)),n&&(n.value=e.correct_option||""),c&&(c.style.display=e.type==="MCQ"?"block":"none"),document.querySelectorAll(".eq-option").forEach((r,p)=>{var d;r.value=((d=e.options)==null?void 0:d[p])||""}),mt(e.folder_id),D("question-edit-modal")}async function vt(e){e.preventDefault();const t=document.getElementById("eq-id").value,a=document.getElementById("eq-type").value,s=Number.parseInt(document.getElementById("eq-folder").value,10),n={type:a,prompt:document.getElementById("eq-prompt").value,marks:Number.parseInt(document.getElementById("eq-marks").value,10),folder_id:Number.isNaN(s)?null:s};a==="MCQ"&&(n.options=Array.from(document.querySelectorAll(".eq-option")).map(i=>i.value.trim()).filter(Boolean),n.correct_option=document.getElementById("eq-correct").value);try{await m(`/exams/questions/${t}`,{method:"PUT",body:JSON.stringify(n)}),l("Question updated.","success"),A("question-edit-modal"),await q(!0)}catch(i){l(i.message,"error")}}async function ht(e){const t=document.getElementById("ef-id"),a=document.getElementById("ef-name"),s=document.getElementById("ef-description");t&&(t.value=String(e.id)),a&&(a.value=e.name||""),s&&(s.value=e.description||""),await pe("folder-edit-share-list",(e.shared_with||[]).map(n=>n.id)),D("folder-edit-modal")}async function gt(e){e.preventDefault();const t=document.getElementById("ef-id").value,a={name:document.getElementById("ef-name").value,description:document.getElementById("ef-description").value,share_with_teacher_ids:le("folder-edit-share-list")};try{await m(`/exams/question-folders/${t}`,{method:"PUT",body:JSON.stringify(a)}),l("Folder updated.","success"),A("folder-edit-modal"),await q(!0)}catch(s){l(s.message,"error")}}Qe();
