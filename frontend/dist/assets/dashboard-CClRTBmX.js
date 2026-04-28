import{s as l,g as qe,e as u,t as Se,f as Be,a as J,c as G,d as Le}from"./utils-DKSetIlA.js";import{a as p}from"./api-CNE7ZS8Q.js";let b=null,j=null,ne=null;const Ae=["exams","results","users","questions","reports","trash"],Te=1e4;let H="exams",N=null,Z=null,C=[],re=[],k=null,ee=null,te=null,ae=null,z=null;const g={edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',detail:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',restore:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>',folder:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',exam:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',question:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',user:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',statExams:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',statLive:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1.5"/><path d="M8.8 15.2a4.5 4.5 0 0 1 0-6.4"/><path d="M15.2 15.2a4.5 4.5 0 0 0 0-6.4"/><path d="M5.8 18.2a8.7 8.7 0 0 1 0-12.4"/><path d="M18.2 18.2a8.7 8.7 0 0 0 0-12.4"/></svg>',statAttempts:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4.5h6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',statReview:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><circle cx="11" cy="14" r="2.6"/><path d="m13 16 2.4 2.4"/></svg>'};function Ne(e,t){return e instanceof Error&&e.message?e.message:e&&typeof e=="object"&&"message"in e&&typeof e.message=="string"?String(e.message):t}function w(){return(b==null?void 0:b.role)==="admin"||(b==null?void 0:b.role)==="examiner"}function ce(){return(b==null?void 0:b.role)==="admin"}function Me(e){return!!(e!=null&&e.can_edit||e!=null&&e.can_remove_access)}function ue(e){const t=document.getElementById(e);return t?Array.from(t.querySelectorAll('input[type="checkbox"]:checked')).map(a=>Number.parseInt(a.value,10)):[]}function pe(){return C.filter(e=>e.can_edit)}function Ce(e,t){return t!=="IN_PROGRESS"||typeof e!="number"?"—":Le(e)}function Pe(e){var t;return e.question_count||((t=e.questions)==null?void 0:t.length)||0}function me(e){return e.student_attempt_count||0}function ve(e){return e.student_attempt_status||""}function Re(e){const t=me(e),a=e.max_attempts_per_student||1;return t?ve(e)==="IN_PROGRESS"?"Resume exam":t>=a?"View Detail":"Start next attempt":"Start exam"}function De(e){const t=e.attempt_count||0,a=e.submitted_attempt_count||0,s=e.in_progress_attempt_count||0,n=e.evaluated_attempt_count||0;return t?`${s} active • ${a} pending review • ${n} evaluated`:"No attempts yet"}function he(e){return e.access_level==="owner"?"You own this bank":e.access_level==="admin"?"Admin access":"Shared with you"}function ge(e){const t=document.getElementById("user-role-input"),a=document.getElementById("user-role-option-admin");if(!t||!a)return;const s=ce();a.disabled=!s,a.hidden=!s,!s&&(e==="admin"||t.value==="admin")?t.value="examiner":e&&(t.value=e)}async function Fe(){return(await p("/users/?role=examiner&limit=200")).filter(t=>t.id!==(b==null?void 0:b.id))}async function fe(e,t=[]){const a=document.getElementById(e);if(!a)return;const s=await Fe();if(!s.length){a.innerHTML='<p class="helper-text">No other examiners are available to share with right now.</p>';return}const n=new Set(t);a.innerHTML=s.map(i=>`
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
            `).join("")}function q(e,t,a){return`
        <div class="empty-state">
            <div class="empty-state-icon">${e}</div>
            <div class="empty-state-title">${u(t)}</div>
            <div class="empty-state-desc">${u(a)}</div>
        </div>
    `}function ye(){const e=Array.from(document.querySelectorAll(".modal-overlay")).some(t=>t.classList.contains("active"));document.body.classList.toggle("modal-open",e)}function R(e){var t;(t=document.getElementById(e))==null||t.classList.add("active"),ye()}function A(e){var t;(t=document.getElementById(e))==null||t.classList.remove("active"),e==="exam-detail-modal"&&(N=null),e==="exam-start-modal"&&(z=null),ye()}function He(){const e=b.name||b.email,t=document.getElementById("user-name"),a=document.getElementById("user-role"),s=document.getElementById("user-avatar");if(t&&(t.textContent=e),a&&(a.textContent=b.role.charAt(0).toUpperCase()+b.role.slice(1)),s){const n=qe(b.name,b.email);s.innerHTML=`<span style="font-weight:800;font-size:0.9rem;letter-spacing:-0.03em;">${n}</span>`}}function Oe(){Z&&window.clearInterval(Z),Z=window.setInterval(()=>{Y(!0)},Te)}async function Y(e=!1){w()&&await P(e),H==="exams"&&await W(e),H==="results"&&await X(e),H==="users"&&w()&&await O(e),H==="questions"&&w()&&await B(e),H==="reports"&&w()&&await _e(e),H==="trash"&&w()&&await K(e);const t=document.getElementById("exam-detail-modal");N&&(t!=null&&t.classList.contains("active"))&&await L(N,{keepOpen:!0,silent:e})}function Qe(){document.querySelectorAll(".nav-link[data-view]").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const a=e.dataset.view;a&&je(a)})})}async function je(e){H=e,document.querySelectorAll(".nav-link[data-view]").forEach(t=>{t.classList.toggle("active",t.dataset.view===e)}),Ae.forEach(t=>{var a;(a=document.getElementById(`view-${t}`))==null||a.classList.toggle("hidden",t!==e)}),await Y(!1)}function Ue(){var e,t,a,s,n,i,c,o,r,m,d,v,$,f,T,D,U,E,V;document.querySelectorAll("[data-close-modal]").forEach(I=>{I.addEventListener("click",()=>{const S=I.dataset.closeModal;S&&A(S)})}),document.querySelectorAll(".modal-overlay").forEach(I=>{I.addEventListener("click",S=>{S.target===I&&A(I.id)})}),document.addEventListener("keydown",I=>{I.key==="Escape"&&document.querySelectorAll(".modal-overlay.active").forEach(S=>{A(S.id)})}),(e=document.getElementById("create-exam-btn"))==null||e.addEventListener("click",()=>be()),(t=document.getElementById("create-user-btn"))==null||t.addEventListener("click",()=>we()),(a=document.getElementById("create-question-btn"))==null||a.addEventListener("click",()=>void nt()),(s=document.getElementById("create-folder-btn"))==null||s.addEventListener("click",()=>void ke()),(n=document.getElementById("exam-form"))==null||n.addEventListener("submit",Ye),(i=document.getElementById("exam-password-required"))==null||i.addEventListener("change",$e),(c=document.getElementById("exam-start-form"))==null||c.addEventListener("submit",Ge),(o=document.getElementById("user-form"))==null||o.addEventListener("submit",tt),(r=document.getElementById("question-form"))==null||r.addEventListener("submit",rt),(m=document.getElementById("folder-form"))==null||m.addEventListener("submit",st),(d=document.getElementById("question-edit-form"))==null||d.addEventListener("submit",ft),(v=document.getElementById("folder-edit-form"))==null||v.addEventListener("submit",bt),($=document.getElementById("q-type"))==null||$.addEventListener("change",I=>{const S=I.target.value,F=document.getElementById("mcq-options-section");F&&(F.style.display=S==="MCQ"?"block":"none")}),(f=document.getElementById("eq-type"))==null||f.addEventListener("change",I=>{const S=I.target.value,F=document.getElementById("eq-mcq-section");F&&(F.style.display=S==="MCQ"?"block":"none")}),(T=document.getElementById("user-search-input"))==null||T.addEventListener("input",()=>{ee&&clearTimeout(ee),ee=setTimeout(()=>void O(!0),300)}),(D=document.getElementById("user-role-filter"))==null||D.addEventListener("change",()=>void O(!0)),(U=document.getElementById("question-search-input"))==null||U.addEventListener("input",()=>{te&&clearTimeout(te),te=setTimeout(()=>void B(!0),300)}),(E=document.getElementById("trash-type-filter"))==null||E.addEventListener("change",()=>void K(!0)),(V=document.getElementById("trash-search-input"))==null||V.addEventListener("input",()=>{ae&&clearTimeout(ae),ae=setTimeout(()=>void K(!0),300)})}async function Ve(){var e,t,a,s,n,i;(e=document.getElementById("logout-btn"))==null||e.addEventListener("click",async()=>{await p("/auth/logout",{method:"POST"}).catch(()=>null),window.location.href="/"});try{b=await p("/users/me"),He(),Qe(),Ue(),w()&&((t=document.getElementById("staff-nav"))==null||t.classList.remove("hidden"),(a=document.getElementById("admin-controls"))==null||a.classList.remove("hidden"),(s=document.getElementById("trash-nav-wrap"))==null||s.classList.remove("hidden"),(n=document.getElementById("admin-nav"))==null||n.classList.remove("hidden")),ce()||(i=document.getElementById("trash-user-option"))==null||i.remove(),ge(),await Y(!1),Oe()}catch(c){l(c.message||"Failed to load the dashboard.","error");const o=document.getElementById("exam-list");o&&(o.innerHTML=q("!","Unable to load dashboard","Please refresh the page or try again in a moment."))}}async function P(e=!1){if(w())try{const t=await p("/reports/dashboard"),a=t.overview||t,s=document.getElementById("stats-bar");if(!s)return;s.classList.remove("hidden"),s.innerHTML=`
            <div class="stat-card blue animate-in">
                <div class="stat-card-icon">${g.statExams}</div>
                <div class="stat-card-value">${a.total_exams}</div>
                <div class="stat-card-label">Visible Exams</div>
                <div class="stat-card-note">${a.draft_exams||0} drafts • ${a.closed_exams||0} closed</div>
            </div>
            <div class="stat-card green animate-in" style="animation-delay: 40ms;">
                <div class="stat-card-icon">${g.statLive}</div>
                <div class="stat-card-value">${a.live_exams}</div>
                <div class="stat-card-label">Live Exams</div>
                <div class="stat-card-note">${a.active_attempts||0} active attempts right now</div>
            </div>
            <div class="stat-card amber animate-in" style="animation-delay: 80ms;">
                <div class="stat-card-icon">${g.statAttempts}</div>
                <div class="stat-card-value">${a.total_attempts}</div>
                <div class="stat-card-label">Attempts</div>
                <div class="stat-card-note">${_(a.participation_rate)} participation</div>
            </div>
            <div class="stat-card rose animate-in" style="animation-delay: 120ms;">
                <div class="stat-card-icon">${g.statReview}</div>
                <div class="stat-card-value">${a.pending_evaluation}</div>
                <div class="stat-card-label">Pending Review</div>
                <div class="stat-card-note">${a.integrity_alerts||0} integrity alerts</div>
            </div>
        `}catch(t){e||l(t.message||"Failed to load dashboard stats.","error")}}async function W(e=!1){const t=document.getElementById("exam-list");if(t)try{const a=await p("/exams/");if(t.innerHTML="",!a.length){t.innerHTML=q("EX","No exams yet",w()?"Create your first exam or wait for a collaborator to assign one.":"Assigned exams will appear here when they are ready.");return}a.forEach((s,n)=>{var $,f,T,D;const i=document.createElement("div");i.className=`card card-interactive exam-card ${w()?"staff-exam-card":"student-exam-card"} animate-in`,i.style.animationDelay=`${n*45}ms`;const c=s.start_time?`Starts ${J(s.start_time)}`:"No fixed start time",o=s.password_required?s.requires_password?"Password protected":"Password setup needed":"No password",r=Pe(s),m=me(s),d=ve(s),v=s.max_attempts_per_student||1;i.innerHTML=`
                <div class="exam-card-header">
                    <div>
                        <h3>${u(s.title)}</h3>
                        ${w()?`<p class="helper-text">${u(s.instructions||"No instructions added yet.")}</p>`:""}
                    </div>
                    <span class="badge ${G(s.status)}">${u(s.status)}</span>
                </div>
                ${w()?`
                            <div class="exam-card-meta">
                                <span>${s.duration_minutes} min</span>
                                <span>${s.max_attempts_per_student||1} attempt${(s.max_attempts_per_student||1)===1?"":"s"}</span>
                                <span>${r} questions</span>
                                <span>${(($=s.teacher_assignments)==null?void 0:$.length)||0} teachers</span>
                                <span>${((f=s.assignments)==null?void 0:f.length)||0} students</span>
                            </div>
                            <div class="exam-detail-grid">
                                <div>
                                    <span>Schedule</span>
                                    <strong>${u(c)}</strong>
                                </div>
                                <div>
                                    <span>Attempts</span>
                                    <strong>${s.attempt_count||0}</strong>
                                </div>
                                <div>
                                    <span>Review</span>
                                    <strong>${s.submitted_attempt_count||0} pending</strong>
                                </div>
                                <div>
                                    <span>Security</span>
                                    <strong>${u(o)}</strong>
                                </div>
                            </div>
                            <div class="helper-text">
                                ${u(De(s))} • Created by ${u(((T=s.creator)==null?void 0:T.name)||((D=s.creator)==null?void 0:D.email)||"Team")}
                            </div>
                        `:`
                            <div class="student-exam-summary">
                                <div>
                                    <span>No. of questions</span>
                                    <strong>${r}</strong>
                                </div>
                                <div>
                                    <span>Attempt</span>
                                    <strong>${m}/${v}</strong>
                                    <small>${d?u(d):"Not started"}</small>
                                </div>
                            </div>
                        `}
                <div class="exam-card-actions">
                    ${w()?`
                                <div class="flex gap-xs">
                                    ${s.can_manage_schedule?`<button class="icon-btn edit-exam" data-id="${s.id}" title="Edit schedule">${g.edit}</button>`:""}
                                    <button class="icon-btn detail-exam" data-id="${s.id}" title="Open details">${g.detail}</button>
                                    <button class="icon-btn danger delete-exam" data-id="${s.id}" title="Delete exam">${g.trash}</button>
                                </div>
                            `:'<div class="helper-text">Assigned exam</div>'}
                    <button
                        class="btn btn-primary btn-sm start-btn"
                        data-id="${s.id}"
                        data-title="${u(s.title)}"
                        data-requires-password="${s.requires_password?"true":"false"}"
                        data-attempt-id="${s.student_attempt_id||""}"
                        data-attempt-status="${d}"
                        data-attempt-count="${m}"
                        data-attempt-max="${v}"
                    >
                        ${b.role==="student"?Re(s):"View details"}
                    </button>
                </div>
            `,t.appendChild(i)}),ze()}catch(a){e||l(a.message||"Unable to load exams.","error"),t.innerHTML.trim()||(t.innerHTML=q("!","Unable to load exams",a.message||"Please try again in a moment."))}}function ze(){document.querySelectorAll(".start-btn").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id;if(t){if(b.role==="student"){const a=e.dataset.attemptId,s=e.dataset.attemptStatus,n=Number.parseInt(e.dataset.attemptCount||"0",10),i=Number.parseInt(e.dataset.attemptMax||"1",10);if(a&&s!=="IN_PROGRESS"&&n>=i){window.location.href=`/result.html?attempt_id=${a}`;return}Je({id:Number.parseInt(t,10),title:e.dataset.title||"this exam",requiresPassword:e.dataset.requiresPassword==="true"});return}await L(Number.parseInt(t,10))}})}),document.querySelectorAll(".edit-exam").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id;if(t)try{const a=await p(`/exams/${t}`);be(a)}catch(a){l(a.message,"error")}})}),document.querySelectorAll(".delete-exam").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id;if(!(!t||!window.confirm("Delete this exam?")))try{await p(`/exams/${t}`,{method:"DELETE"}),l("Exam deleted.","success"),await Y(!0)}catch(a){l(a.message,"error")}})}),document.querySelectorAll(".detail-exam").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.id;t&&L(Number.parseInt(t,10))})})}function Je(e){z={examId:e.id,title:e.title,requiresPassword:e.requiresPassword};const t=document.getElementById("exam-start-modal-title"),a=document.getElementById("exam-start-modal-copy"),s=document.getElementById("exam-start-password"),n=document.getElementById("exam-start-password-group");t&&(t.textContent=`Open ${e.title}`),a&&(a.textContent=e.requiresPassword?"Enter the exam password to start or resume your attempt.":"This exam does not require a password. Continue to open your attempt."),s&&(s.value="",s.required=e.requiresPassword,s.disabled=!e.requiresPassword,e.requiresPassword&&s.focus()),n==null||n.classList.toggle("hidden",!e.requiresPassword),R("exam-start-modal")}async function Ge(e){if(e.preventDefault(),!z){l("Select an exam first.","error");return}const t=document.getElementById("exam-start-password"),a=(t==null?void 0:t.value)||"";if(z.requiresPassword&&!a.trim()){l("Enter the exam password to continue.","warning"),t==null||t.focus();return}try{const s=await p(`/attempts/${z.examId}/start`,{method:"POST",body:JSON.stringify({password:a})});if(A("exam-start-modal"),s.status==="IN_PROGRESS"){window.location.href=`/exam.html?attempt_id=${s.id}`;return}window.location.href=`/result.html?attempt_id=${s.id}`}catch(s){l(s.message,"error"),t==null||t.focus(),t==null||t.select()}}function be(e){var $,f;j=e?e.id:null;const t=document.getElementById("exam-modal-title"),a=document.getElementById("exam-submit-btn"),s=document.getElementById("exam-title"),n=document.getElementById("exam-instructions"),i=document.getElementById("exam-duration"),c=document.getElementById("exam-attempt-limit"),o=document.getElementById("exam-start-time"),r=document.getElementById("exam-status"),m=document.getElementById("exam-password-required"),d=document.getElementById("exam-password"),v=document.getElementById("exam-password-help");t&&(t.textContent=e?"Edit Exam":"Create Exam"),a&&(a.textContent=e?"Save Changes":"Create Exam"),s&&(s.value=(e==null?void 0:e.title)||""),n&&(n.value=(e==null?void 0:e.instructions)||""),i&&(i.value=(($=e==null?void 0:e.duration_minutes)==null?void 0:$.toString())||"60"),c&&(c.value=((f=e==null?void 0:e.max_attempts_per_student)==null?void 0:f.toString())||"1"),o&&(o.value=Se(e==null?void 0:e.start_time)),r&&(r.value=(e==null?void 0:e.status)||"DRAFT"),m&&(m.checked=e?!!(e!=null&&e.password_required):!0),d&&(d.value="",d.placeholder=e?"Leave blank to keep the current exam password":"Enter exam password"),v&&(v.textContent=e?e!=null&&e.password_required?"Only the assigned examiner or an admin can change the exam password. Leave this blank to keep the current password.":"Password protection is turned off for this exam.":"Students must enter this password before they can open the exam."),$e(),R("exam-modal")}function $e(){const e=document.getElementById("exam-password-required"),t=document.getElementById("exam-password"),a=document.getElementById("exam-password-help"),s=(e==null?void 0:e.checked)??!0;t&&(t.disabled=!s,t.required=s&&!j),a&&!s?a.textContent="Password protection is turned off for this exam.":a&&s&&!j&&(a.textContent="Students must enter this password before they can open the exam.")}async function Ye(e){e.preventDefault();const t={title:document.getElementById("exam-title").value,instructions:document.getElementById("exam-instructions").value,duration_minutes:Number.parseInt(document.getElementById("exam-duration").value,10),max_attempts_per_student:Number.parseInt(document.getElementById("exam-attempt-limit").value,10),password_required:document.getElementById("exam-password-required").checked,start_time:Be(document.getElementById("exam-start-time").value),status:document.getElementById("exam-status").value},a=document.getElementById("exam-password").value.trim();if(t.password_required&&!j&&!a){l("Exam password is required before students can start the exam.","warning");return}t.password_required&&a&&(t.password=a);try{j?(await p(`/exams/${j}`,{method:"PUT",body:JSON.stringify(t)}),l("Exam updated.","success")):(await p("/exams/",{method:"POST",body:JSON.stringify(t)}),l("Exam created.","success")),A("exam-modal"),await Y(!0)}catch(s){l(s.message,"error")}}function We(e,t){return t.length?t.map(a=>{var s,n,i;return`
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
            `}).join(""):'<p class="text-sm text-muted">No additional accessible questions available.</p>'}function Xe(e,t,a){return a?`
            <div class="card" style="padding: 1rem; border: 1px dashed var(--border-color);">
                <div class="section-title mb-1">Question bank unavailable</div>
                <p class="helper-text">${u(a)}</p>
            </div>
        `:We(e,t)}function ie(e,t,a){return e.length?`
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
    `:`<p class="text-sm text-muted">No ${a}s available.</p>`}function Ke(e){var t;return(t=e.questions)!=null&&t.length?e.questions.map(a=>{var n;const s=a.question||a;return`
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
            `}).join(""):'<p class="text-sm text-muted">No questions added yet.</p>'}function Ze(e){return e.length?`
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
                                <td><span class="badge ${G(t.status)}">${t.status}</span></td>
                                <td class="text-sm">${J(t.started_at)}</td>
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
    `:q("AT","No attempts yet","Attempts will appear here once students start.")}async function L(e,t={}){var n,i;const{keepOpen:a=!1,silent:s=!1}=t;try{N=e;const[c,o,r,m,d]=await Promise.allSettled([p(`/exams/${e}`),p("/exams/questions"),p(`/attempts/exam/${e}`),p("/users/?role=examiner"),p("/users/?role=student")]);if(c.status!=="fulfilled")throw c.reason;const v=c.value,$=o.status==="fulfilled"?o.value:[],f=r.status==="fulfilled"?r.value:[],T=m.status==="fulfilled"?m.value:[],D=d.status==="fulfilled"?d.value:[],U=o.status==="rejected"?Ne(o.reason,"The question bank could not be loaded for this exam right now."):null,E=document.getElementById("exam-detail-content"),V=document.getElementById("exam-detail-title");if(!E||!V)return;V.textContent=v.title;const I=new Set((v.teacher_assignments||[]).map(h=>h.teacher_id)),S=new Set((v.assignments||[]).map(h=>h.student_id)),F=(v.questions||[]).map(h=>h.question_id),Ie=U?[]:$.filter(h=>!F.includes(h.id));E.innerHTML=`
            <div class="tabs">
                <button class="tab active" data-tab="questions">Questions (${((n=v.questions)==null?void 0:n.length)||0})</button>
                <button class="tab" data-tab="attempts">Attempts (${f.length})</button>
                <button class="tab" data-tab="assign">Assignments</button>
            </div>

            <div id="tab-questions">
                ${Ke(v)}
                <div class="detail-divider"></div>
                <div class="section-title mb-1">Add From Question Bank</div>
                ${Xe(e,Ie,U)}
            </div>

            <div id="tab-attempts" class="hidden">
                ${Ze(f)}
            </div>

            <div id="tab-assign" class="hidden">
                <div class="stack-list">
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Teachers</div>
                        <p class="helper-text mb-2">
                            Assigned teachers can see this exam, manage questions, and review attempts.
                        </p>
                        ${ie(T,I,"teacher")}
                    </div>
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Students</div>
                        <p class="helper-text mb-2">
                            Assigned students will see the exam on their dashboard once it becomes available.
                        </p>
                        ${ie(D,S,"student")}
                    </div>
                    <div class="flex items-center justify-between gap-sm">
                        <p class="helper-text">Question folders used in this exam will be shared to assigned teachers automatically.</p>
                        <button class="btn btn-primary" id="assign-btn">Save assignments</button>
                    </div>
                </div>
            </div>
        `,E.querySelectorAll(".tab").forEach(h=>{h.addEventListener("click",()=>{E.querySelectorAll(".tab").forEach(y=>y.classList.remove("active")),h.classList.add("active");const x=h.dataset.tab;["questions","attempts","assign"].forEach(y=>{var Q;(Q=E.querySelector(`#tab-${y}`))==null||Q.classList.toggle("hidden",y!==x)})})}),E.querySelectorAll(".add-q-to-exam").forEach(h=>{h.addEventListener("click",async()=>{const x=h.dataset.exam,y=h.dataset.qid;if(!(!x||!y))try{await p(`/exams/${x}/questions/${y}`,{method:"POST"}),l("Question added to exam.","success"),await L(e,{keepOpen:!0}),await B(!0)}catch(Q){l(Q.message,"error")}})}),E.querySelectorAll(".remove-q").forEach(h=>{h.addEventListener("click",async()=>{const x=h.dataset.exam,y=h.dataset.qid;if(!(!x||!y))try{await p(`/exams/${x}/questions/${y}`,{method:"DELETE"}),l("Question removed from exam.","success"),await L(e,{keepOpen:!0})}catch(Q){l(Q.message,"error")}})}),E.querySelectorAll(".evaluate-btn").forEach(h=>{h.addEventListener("click",async()=>{const x=h.dataset.id;if(x)try{const y=await p(`/attempts/${x}/evaluate`,{method:"POST"});l(`Evaluated: ${y.score}/${y.max_score}`,"success"),await L(e,{keepOpen:!0})}catch(y){l(y.message,"error")}})}),E.querySelectorAll(".delete-attempt").forEach(h=>{h.addEventListener("click",async()=>{const x=h.dataset.id;if(!(!x||!window.confirm("Delete this submission? It will move to Recently Deleted.")))try{await p(`/attempts/${x}`,{method:"DELETE"}),l("Submission moved to Recently Deleted.","success"),await L(e,{keepOpen:!0}),await X(!0),await P(!0)}catch(y){l(y.message,"error")}})}),(i=E.querySelector("#assign-btn"))==null||i.addEventListener("click",async()=>{const h=Array.from(E.querySelectorAll(".assign-teacher:checked")).map(y=>Number.parseInt(y.value,10)),x=Array.from(E.querySelectorAll(".assign-student:checked")).map(y=>Number.parseInt(y.value,10));try{await p(`/exams/${e}/assign`,{method:"POST",body:JSON.stringify({teacher_ids:h,student_ids:x})}),l("Assignments updated.","success"),await L(e,{keepOpen:!0}),await W(!0)}catch(y){l(y.message,"error")}}),a||R("exam-detail-modal")}catch(c){s||l(c.message,"error")}}async function O(e=!1){var a,s,n;const t=document.getElementById("users-tbody");if(t)try{const i=(s=(a=document.getElementById("user-search-input"))==null?void 0:a.value)==null?void 0:s.trim(),c=(n=document.getElementById("user-role-filter"))==null?void 0:n.value;let o="/users/?limit=200";i&&(o+=`&q=${encodeURIComponent(i)}`),c&&(o+=`&role=${encodeURIComponent(c)}`),re=await p(o),t.innerHTML=re.map(r=>`
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
                                ${Me(r)||r.can_delete?"":`<span class="table-action-note">${u(r.protected_reason||"View only")}</span>`}
                            </div>
                        </td>
                    </tr>
                `).join(""),et()}catch(i){e||l(i.message,"error")}}function et(){document.querySelectorAll(".edit-user").forEach(e=>{e.addEventListener("click",()=>{const t=Number.parseInt(e.dataset.id||"",10),a=re.find(s=>s.id===t);a&&we(a)})}),document.querySelectorAll(".toggle-user-access").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id,a=e.dataset.nextActive==="true";if(!t)return;const s=a?"Restore access for this user?":"Remove access for this user?";if(window.confirm(s))try{await p(`/users/${t}`,{method:"PUT",body:JSON.stringify({is_active:a})}),l(a?"Access restored.":"Access removed.","success"),await O(!0),await P(!0)}catch(n){l(n.message,"error")}})}),document.querySelectorAll(".delete-user").forEach(e=>{e.addEventListener("click",async()=>{const t=e.dataset.id;if(!(!t||!window.confirm("Delete this user?")))try{await p(`/users/${t}`,{method:"DELETE"}),l("User moved to Recently Deleted.","success"),await O(!0),await P(!0)}catch(a){l(a.message,"error")}})})}function we(e){ne=e?e.id:null;const t=document.getElementById("user-modal-title"),a=document.getElementById("user-submit-btn"),s=document.getElementById("user-name-input"),n=document.getElementById("user-email-input"),i=document.getElementById("user-password-input"),c=document.getElementById("user-role-input");t&&(t.textContent=e?"Edit User":"Add User"),a&&(a.textContent=e?"Save Changes":"Add User"),s&&(s.value=(e==null?void 0:e.name)||""),n&&(n.value=(e==null?void 0:e.email)||""),i&&(i.value="",i.required=!e),c&&(c.value=(e==null?void 0:e.role)||"student"),ge((e==null?void 0:e.role)||"student"),R("user-modal")}async function tt(e){e.preventDefault();const t={name:document.getElementById("user-name-input").value,email:document.getElementById("user-email-input").value,role:document.getElementById("user-role-input").value},a=document.getElementById("user-password-input").value;a&&(t.password=a);try{if(ne)await p(`/users/${ne}`,{method:"PUT",body:JSON.stringify(t)}),l("User updated.","success");else{if(!a){l("Password required for a new user.","warning");return}await p("/users/",{method:"POST",body:JSON.stringify(t)}),l("User created.","success")}A("user-modal"),await O(!0),await P(!0)}catch(s){l(s.message,"error")}}async function Ee(){return w()?(C=await p("/exams/question-folders"),k&&!C.some(e=>e.id===k)&&(k=null),C):[]}async function oe(e){k=e,await B(!0)}function xe(){const e=document.getElementById("q-folder");if(!e)return;const t=pe();e.innerHTML=t.map(a=>`
                <option value="${a.id}">
                    ${a.name}${a.access_level==="shared"?" (Shared)":""}
                </option>
            `).join(""),t.length||(e.innerHTML='<option value="">Create or own a folder first</option>')}function at(){const e=document.getElementById("question-folder-toolbar");if(e){if(!C.length){e.innerHTML=q(g.folder,"No folders yet","Create your first question folder to organize a personal or shared question bank.");return}e.innerHTML=`
        <div class="card" style="padding: 1rem; margin-bottom: 1rem;">
            <div class="section-title mb-1">Folders</div>
            <div class="trash-list-stack" style="max-height:280px; overflow-y:auto;">
                ${C.map(t=>{var a;return`
                        <div
                            class="folder-card ${k===t.id?"folder-active":""}"
                            data-folder-id="${t.id}"
                            role="button"
                            tabindex="0"
                            aria-pressed="${k===t.id}"
                            aria-label="Open question folder"
                        >
                            <div class="folder-card-icon">${g.folder}</div>
                            <div>
                                <div style="font-weight:700;font-size:0.95rem;">${u(t.name)}</div>
                                <div class="helper-text" style="font-size:0.82rem;">
                                    ${t.question_count||0} questions
                                    • ${u(he(t))}
                                    ${(a=t.shared_with)!=null&&a.length?` • Shared with ${t.shared_with.length} examiner${t.shared_with.length===1?"":"s"}`:""}
                                </div>
                            </div>
                            <div class="folder-card-actions">
                                ${t.can_share?`<button class="icon-btn edit-folder" data-id="${t.id}" title="Edit folder">${g.edit}</button>`:""}
                                <button class="icon-btn ${k===t.id?"btn-primary":""} folder-filter" data-folder="${t.id}" title="Filter by folder" style="font-size:0.7rem;width:auto;padding:0 0.5rem;">${k===t.id?"✓":"Filter"}</button>
                                ${t.can_delete?`<button class="icon-btn danger delete-folder" data-id="${t.id}" title="Delete folder">${g.trash}</button>`:""}
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
    `,e.querySelectorAll(".folder-card[data-folder-id]").forEach(t=>{const a=async()=>{const s=Number.parseInt(t.dataset.folderId||"",10);Number.isNaN(s)||await oe(s)};t.addEventListener("click",s=>{s.target.closest(".folder-card-actions")||a()}),t.addEventListener("keydown",s=>{s.key!=="Enter"&&s.key!==" "||(s.preventDefault(),a())})}),e.querySelectorAll(".folder-filter").forEach(t=>{t.addEventListener("click",a=>{a.stopPropagation();const s=t.dataset.folder,n=s&&s.trim()?Number.parseInt(s,10):null;oe(Number.isNaN(n)?null:n)})}),e.querySelectorAll(".edit-folder").forEach(t=>{t.addEventListener("click",()=>{const a=Number(t.dataset.id),s=C.find(n=>n.id===a);s&&yt(s)})}),e.querySelectorAll(".delete-folder").forEach(t=>{t.addEventListener("click",async()=>{const a=t.dataset.id;if(!(!a||!window.confirm("Move this folder and all its questions to Recently Deleted?")))try{await p(`/exams/question-folders/${a}`,{method:"DELETE"}),l("Folder moved to Recently Deleted.","success"),k=null,await B(!0)}catch(s){l(s.message,"error")}})})}}async function B(e=!1){var a,s;const t=document.getElementById("questions-list");if(t)try{await Ee(),at(),xe();const n=new URLSearchParams,i=(s=(a=document.getElementById("question-search-input"))==null?void 0:a.value)==null?void 0:s.trim();k&&n.set("folder_id",String(k)),i&&n.set("q",i);const c=n.toString()?`?${n.toString()}`:"",o=await p(`/exams/questions${c}`);if(!o.length){t.innerHTML=q("QB","No questions yet","Build your question bank here for reuse across exams and collaborator assignments.");return}t.innerHTML=o.map((r,m)=>{var d,v,$,f;return`
                    <div class="card question-card animate-in" style="animation-delay: ${m*35}ms;">
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
                                        ${r.options.map(T=>`<span class="chip">${u(T)}</span>`).join("")}
                                    </div>
                                `:""}
                        <p class="helper-text mt-2">
                            ${u((($=r.owner)==null?void 0:$.name)||((f=r.owner)==null?void 0:f.email)||"Personal bank")}
                            ${r.folder?` • ${u(he(r.folder))}`:""}
                        </p>
                    </div>
                `}).join(""),document.querySelectorAll(".edit-question").forEach(r=>{r.addEventListener("click",()=>{const m=Number(r.dataset.id),d=o.find(v=>v.id===m);d&&gt(d)})}),document.querySelectorAll(".delete-question").forEach(r=>{r.addEventListener("click",async()=>{const m=r.dataset.id;if(!(!m||!window.confirm("Move this question to Recently Deleted?")))try{await p(`/exams/questions/${m}`,{method:"DELETE"}),l("Question moved to Recently Deleted.","success"),await B(!0)}catch(d){l(d.message,"error")}})})}catch(n){e||l(n.message,"error"),t.innerHTML=q("!","Question bank unavailable",n.message||"Please try again in a moment.")}}async function ke(){const e=document.getElementById("folder-modal-title"),t=document.getElementById("folder-submit-btn"),a=document.getElementById("folder-name"),s=document.getElementById("folder-description");e&&(e.textContent="Create Folder"),t&&(t.textContent="Create Folder"),a&&(a.value=""),s&&(s.value=""),await fe("folder-share-list"),R("folder-modal")}async function st(e){e.preventDefault();const t={name:document.getElementById("folder-name").value,description:document.getElementById("folder-description").value,share_with_teacher_ids:ue("folder-share-list")};try{await p("/exams/question-folders",{method:"POST",body:JSON.stringify(t)}),l("Folder created.","success"),A("folder-modal"),await B(!0)}catch(a){l(a.message,"error")}}async function nt(){var r;await Ee();const e=pe();if(!e.length){l("Create or own a question folder before adding questions.","warning"),ke();return}xe();const t=document.getElementById("question-modal-title"),a=document.getElementById("q-type"),s=document.getElementById("q-prompt"),n=document.getElementById("q-marks"),i=document.getElementById("q-correct"),c=document.getElementById("q-folder");if(t&&(t.textContent="Add Question"),a&&(a.value="MCQ"),s&&(s.value=""),n&&(n.value="1"),i&&(i.value=""),c){const m=(k&&e.some(d=>d.id===k)?k:null)||((r=e[0])==null?void 0:r.id);c.value=m?m.toString():""}document.querySelectorAll(".mcq-option").forEach(m=>{m.value=""});const o=document.getElementById("mcq-options-section");o&&(o.style.display="block"),R("question-modal")}async function rt(e){e.preventDefault();const t=document.getElementById("q-type").value,a=Number.parseInt(document.getElementById("q-folder").value,10),s={type:t,prompt:document.getElementById("q-prompt").value,marks:Number.parseInt(document.getElementById("q-marks").value,10),folder_id:Number.isNaN(a)?void 0:a};t==="MCQ"&&(s.options=Array.from(document.querySelectorAll(".mcq-option")).map(n=>n.value.trim()).filter(Boolean),s.correct_option=document.getElementById("q-correct").value);try{await p("/exams/questions",{method:"POST",body:JSON.stringify(s)}),l("Question created.","success"),A("question-modal"),await B(!0)}catch(n){l(n.message,"error")}}function it(e){const t=(e==null?void 0:e.overview)||{};return`
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
    `}async function X(e=!1){const t=document.getElementById("results-list"),a=document.getElementById("results-summary");if(!(!t||!a))try{const s=b.role==="student"?p("/reports/student/me").catch(()=>null):Promise.resolve(null),[n,i]=await Promise.all([p("/attempts/"),s]);a.innerHTML=i?it(i):"";const c=n.filter(o=>o.status==="SUBMITTED"||o.status==="EVALUATED");if(!c.length){t.innerHTML=q("RS","No results yet","Completed exam attempts will show up here.");return}t.innerHTML=c.map((o,r)=>{var m,d;return`
                    <div class="card card-interactive exam-card animate-in result-entry" data-attempt-id="${o.id}" style="cursor: pointer; animation-delay: ${r*35}ms;">
                        <div class="exam-card-header">
                            <div>
                                <h3>${b.role==="student"?`Attempt #${o.id}`:u(((m=o.student)==null?void 0:m.name)||((d=o.student)==null?void 0:d.email)||`Attempt #${o.id}`)}</h3>
                                <p class="helper-text">
                                    Exam #${o.exam_id}
                                    ${o.result?` • Score ${o.result.total_score}/${o.result.max_score}`:""}
                                </p>
                            </div>
                            <span class="badge ${G(o.status)}">${o.status}</span>
                        </div>
                        <div class="exam-card-meta">
                            <span>${J(o.started_at)}</span>
                            <span>Open analytics</span>
                        </div>
                    </div>
                `}).join(""),document.querySelectorAll(".result-entry").forEach(o=>{o.addEventListener("click",()=>{const r=o.dataset.attemptId;r&&(window.location.href=`/result.html?attempt_id=${r}`)})})}catch(s){e||l(s.message,"error"),t.innerHTML=q("!","Results unavailable",s.message||"Please try again in a moment.")}}function _(e){return`${(Number.isFinite(e)?Number(e):0).toFixed(1).replace(/\.0$/,"")}%`}function de(e){return(Number.isFinite(e)?Number(e):0).toFixed(1).replace(/\.0$/,"")}function M(e,t="blue",a="No data yet."){if(!e.length||e.every(n=>n.count===0))return`<p class="helper-text">${a}</p>`;const s=Math.max(...e.map(n=>n.count),1);return`
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
    `}function se(e,t,a,s){const n=Math.max(0,Math.min(100,Number.isFinite(t)?Number(t):0));return`
        <div class="report-donut-card">
            <div class="report-donut ${s}" style="--value:${n}">
                <span>${_(n)}</span>
            </div>
            <h4>${u(e)}</h4>
            <p>${u(a)}</p>
        </div>
    `}function ot(e){if(!e.length)return'<p class="helper-text">No recent activity yet.</p>';const t=Math.max(...e.flatMap(a=>[a.started,a.submitted,a.evaluated]),1);return`
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
    `}function dt(e){return e.length?`
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
    `:'<p class="helper-text">No exam analytics available yet.</p>'}function lt(e){return e.length?`
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
                                ${t.type==="MCQ"?`<span>Correct ${_(t.correct_rate)}</span>`:`<span>Avg marks ${de(t.average_awarded_marks)}/${de(t.marks)}</span>`}
                                <span>Blank ${t.blank_count}</span>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `:'<p class="helper-text">Question-level analytics will appear after candidates start submitting.</p>'}function ct(e){return e.length?`
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
                                <td><span class="badge ${G(t.status)}">${u(t.status)}</span></td>
                                <td>${t.percentage!==null?_(t.percentage):"—"}</td>
                                <td>${t.violations}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">Leaderboard data appears after attempts are submitted.</p>'}function ut(e){return M(e,"blue","No delivery funnel data yet.")}function pt(e){const t=e.overview||e;return`
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
    `}function mt(e){const t=e.overview||e;return`
        <section class="report-grid">
            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Delivery Health</h4>
                        <p class="report-panel-copy">Participation, quality, and active exam mix.</p>
                    </div>
                </div>
                <div class="report-visual-grid">
                    ${se("Participation rate",t.participation_rate,`${t.total_attempts} total attempts`,"blue")}
                    ${se("Average score",t.average_percentage,`${t.evaluated_attempts} evaluated`,"green")}
                    ${se("High-risk share",t.total_attempts?t.high_risk_attempts/t.total_attempts*100:0,`${t.high_risk_attempts} flagged attempts`,"rose")}
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
                ${ot(e.activity_timeline||[])}
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
                ${dt(e.top_exams||[])}
            </article>
        </section>
    `}function vt(e,t){const a=e.overview||{},s=e.exam||{};return`
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
                    <span class="badge ${G(s.status||"DRAFT")}">${u(s.status||"DRAFT")}</span>
                    <span class="chip">${s.start_time?J(s.start_time):"No start time"}</span>
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
                    ${ut(e.progress_funnel||[])}
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
                    ${lt(e.question_insights||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Leaderboard</h4>
                        <p class="report-panel-copy">Top evaluated candidates with flag counts.</p>
                    </div>
                    ${ct(e.leaderboard||[])}
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
    `}async function _e(e=!1){const t=document.getElementById("reports-content");if(t)try{const[a,s]=await Promise.all([p("/reports/dashboard"),p("/exams/")]);if(!s.length&&!(a.top_exams||[]).length){t.innerHTML=q("RP","No report data","Reports will appear once exams and attempts exist.");return}const i=(await Promise.all(s.map(async c=>{try{return await p(`/reports/exam/${c.id}/analytics`)}catch{return null}}))).filter(Boolean);i.sort((c,o)=>{var d,v,$,f;const r=((d=c==null?void 0:c.overview)==null?void 0:d.attempt_count)||0,m=((v=o==null?void 0:o.overview)==null?void 0:v.attempt_count)||0;return r!==m?m-r:String((($=c==null?void 0:c.exam)==null?void 0:$.title)||"").localeCompare(String(((f=o==null?void 0:o.exam)==null?void 0:f.title)||""))}),t.innerHTML=`
            <div class="reports-shell">
                ${pt(a)}
                ${mt(a)}
                <section class="stack-list">
                    ${i.length?i.map((c,o)=>vt(c,o)).join(""):q(g.detail,"Per-exam analytics unavailable","The dashboard summary loaded, but detailed exam analytics could not be generated right now.")}
                </section>
            </div>
        `}catch(a){e||l(a.message,"error"),t.innerHTML=q("!","Reports unavailable",a.message||"Please try again in a moment.")}}async function le(e){const t=[K(!0)];e==="user"&&w()&&t.push(O(!0),P(!0)),e==="exam"&&(t.push(W(!0),X(!0)),w()&&t.push(P(!0),_e(!0)),N&&t.push(L(N,{keepOpen:!0,silent:!0}))),(e==="question"||e==="folder")&&w()&&t.push(B(!0)),e==="attempt"&&(t.push(W(!0),X(!0)),w()&&t.push(P(!0)),N&&t.push(L(N,{keepOpen:!0,silent:!0}))),await Promise.all(t.map(a=>a.catch(()=>{})))}async function K(e=!1){var a,s,n;const t=document.getElementById("trash-list");if(t)try{const i=(a=document.getElementById("trash-type-filter"))==null?void 0:a.value,c=(n=(s=document.getElementById("trash-search-input"))==null?void 0:s.value)==null?void 0:n.trim(),o=new URLSearchParams;i&&o.set("entity_type",i),c&&o.set("q",c);const r=o.toString()?`/trash/?${o.toString()}`:"/trash/",m=await p(r);if(!m.length){t.innerHTML=q(g.trash,"Nothing in trash","Deleted exams, questions, folders, and users will appear here.");return}t.innerHTML=`<div class="trash-list-stack">
            ${m.map((d,v)=>`
                <div class="trash-item animate-in" style="animation-delay:${v*30}ms;">
                    <div class="trash-item-icon ${d.entity_type}">${d.entity_type==="exam"?g.exam:d.entity_type==="question"?g.question:d.entity_type==="folder"?g.folder:d.entity_type==="attempt"?g.detail:d.entity_type==="user"?g.user:g.trash}</div>
                    <div class="trash-item-details">
                        <div style="font-weight:700;font-size:0.95rem;">${u(d.label)}</div>
                        <div class="helper-text" style="font-size:0.82rem;">
                            <span class="badge badge-info" style="font-size:0.7rem;">${d.entity_type}</span>
                            &nbsp;Deleted ${J(d.deleted_at)}
                        </div>
                    </div>
                    <div class="trash-item-actions">
                        ${d.can_restore?`<button class="icon-btn trash-restore" data-trash-id="${d.id}" data-entity-type="${d.entity_type}" title="Restore item">${g.restore}</button>`:""}
                        ${d.can_permanent_delete?`<button class="icon-btn danger trash-purge" data-trash-id="${d.id}" data-entity-type="${d.entity_type}" title="Permanently delete">${g.trash}</button>`:""}
                        ${d.can_restore||d.can_permanent_delete?"":'<span class="table-action-note">No actions available</span>'}
                    </div>
                </div>
            `).join("")}
        </div>`,t.querySelectorAll(".trash-restore").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.trashId,$=d.dataset.entityType||"";if(v)try{const f=await p(`/trash/${v}/restore`,{method:"POST"});l(f.message||"Item restored successfully.","success"),await le($)}catch(f){l(f.message,"error")}})}),t.querySelectorAll(".trash-purge").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.trashId,$=d.dataset.entityType||"";if(!(!v||!window.confirm("Permanently delete this item? This cannot be undone.")))try{await p(`/trash/${v}/permanent`,{method:"DELETE"}),l("Permanently deleted.","success"),await le($)}catch(f){l(f.message,"error")}})})}catch(i){e||l(i.message,"error"),t.innerHTML=q("!","Unable to load trash",i.message||"Please try again.")}}function ht(e){const t=document.getElementById("eq-folder");if(!t)return;const a=C.filter(s=>s.can_edit||s.id===e);t.innerHTML=a.map(s=>`
                <option value="${s.id}" ${s.id===e?"selected":""}>
                    ${u(s.name)}${s.can_edit?"":" (Current folder)"}
                </option>
            `).join("")}function gt(e){const t=document.getElementById("eq-type"),a=document.getElementById("eq-prompt"),s=document.getElementById("eq-marks"),n=document.getElementById("eq-correct"),i=document.getElementById("eq-id"),c=document.getElementById("eq-mcq-section");i&&(i.value=String(e.id)),t&&(t.value=e.type||"MCQ"),a&&(a.value=e.prompt||""),s&&(s.value=String(e.marks||1)),n&&(n.value=e.correct_option||""),c&&(c.style.display=e.type==="MCQ"?"block":"none"),document.querySelectorAll(".eq-option").forEach((r,m)=>{var d;r.value=((d=e.options)==null?void 0:d[m])||""}),ht(e.folder_id),R("question-edit-modal")}async function ft(e){e.preventDefault();const t=document.getElementById("eq-id").value,a=document.getElementById("eq-type").value,s=Number.parseInt(document.getElementById("eq-folder").value,10),n={type:a,prompt:document.getElementById("eq-prompt").value,marks:Number.parseInt(document.getElementById("eq-marks").value,10),folder_id:Number.isNaN(s)?null:s};a==="MCQ"&&(n.options=Array.from(document.querySelectorAll(".eq-option")).map(i=>i.value.trim()).filter(Boolean),n.correct_option=document.getElementById("eq-correct").value);try{await p(`/exams/questions/${t}`,{method:"PUT",body:JSON.stringify(n)}),l("Question updated.","success"),A("question-edit-modal"),await B(!0)}catch(i){l(i.message,"error")}}async function yt(e){const t=document.getElementById("ef-id"),a=document.getElementById("ef-name"),s=document.getElementById("ef-description");t&&(t.value=String(e.id)),a&&(a.value=e.name||""),s&&(s.value=e.description||""),await fe("folder-edit-share-list",(e.shared_with||[]).map(n=>n.id)),R("folder-edit-modal")}async function bt(e){e.preventDefault();const t=document.getElementById("ef-id").value,a={name:document.getElementById("ef-name").value,description:document.getElementById("ef-description").value,share_with_teacher_ids:ue("folder-edit-share-list")};try{await p(`/exams/question-folders/${t}`,{method:"PUT",body:JSON.stringify(a)}),l("Folder updated.","success"),A("folder-edit-modal"),await B(!0)}catch(s){l(s.message,"error")}}Ve();
