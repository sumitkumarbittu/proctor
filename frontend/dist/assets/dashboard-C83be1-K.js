import{r as $e,a as l,g as Ee,e as p,b as O}from"./utils-CzWt7XIS.js";import{a as u}from"./api-B4dv8x94.js";let y=null,Z=null,ee=null;const we=["exams","results","users","questions","reports","trash"],xe=1e4;let P="exams",T=null,X=null,N=[],te=[],I=null,Y=null,W=null,G=null;const f={edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',detail:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',restore:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>',folder:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',exam:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',question:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',user:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'};function E(){return(y==null?void 0:y.role)==="admin"||(y==null?void 0:y.role)==="examiner"}function ie(){return(y==null?void 0:y.role)==="admin"}function ke(t){return!!(t!=null&&t.can_edit||t!=null&&t.can_remove_access)}function re(t){const e=document.getElementById(t);return e?Array.from(e.querySelectorAll('input[type="checkbox"]:checked')).map(a=>Number.parseInt(a.value,10)):[]}function oe(){return N.filter(t=>t.can_edit)}function de(t){return t.access_level==="owner"?"You own this bank":t.access_level==="admin"?"Admin access":"Shared with you"}function le(t){const e=document.getElementById("user-role-input"),a=document.getElementById("user-role-option-admin");if(!e||!a)return;const s=ie();a.disabled=!s,a.hidden=!s,!s&&(t==="admin"||e.value==="admin")?e.value="examiner":t&&(e.value=t)}async function Ie(){return(await u("/users/?role=examiner&limit=200")).filter(e=>e.id!==(y==null?void 0:y.id))}async function ce(t,e=[]){const a=document.getElementById(t);if(!a)return;const s=await Ie();if(!s.length){a.innerHTML='<p class="helper-text">No other examiners are available to share with right now.</p>';return}const n=new Set(e);a.innerHTML=s.map(r=>`
                <label class="assignment-option">
                    <input
                        type="checkbox"
                        value="${r.id}"
                        ${n.has(r.id)?"checked":""}
                    >
                    <div>
                        <strong>${p(r.name||r.email)}</strong>
                        <p class="helper-text">${p(r.email)}${r.is_active?"":" • Inactive"}</p>
                    </div>
                </label>
            `).join("")}function S(t,e,a){return`
        <div class="empty-state">
            <div class="empty-state-icon">${t}</div>
            <div class="empty-state-title">${p(e)}</div>
            <div class="empty-state-desc">${p(a)}</div>
        </div>
    `}function ue(){const t=Array.from(document.querySelectorAll(".modal-overlay")).some(e=>e.classList.contains("active"));document.body.classList.toggle("modal-open",t)}function R(t){var e;(e=document.getElementById(t))==null||e.classList.add("active"),ue()}function A(t){var e;(e=document.getElementById(t))==null||e.classList.remove("active"),t==="exam-detail-modal"&&(T=null),ue()}function _e(){const t=y.name||y.email,e=document.getElementById("user-name"),a=document.getElementById("user-role"),s=document.getElementById("user-avatar");if(e&&(e.textContent=t),a&&(a.textContent=y.role.charAt(0).toUpperCase()+y.role.slice(1)),s){const n=Ee(y.name,y.email);s.innerHTML=`<span style="font-weight:800;font-size:0.9rem;letter-spacing:-0.03em;">${n}</span>`}}function Se(){X&&window.clearInterval(X),X=window.setInterval(()=>{U(!0)},xe)}async function U(t=!1){E()&&await C(t),P==="exams"&&await V(t),P==="results"&&await z(t),P==="users"&&E()&&await F(t),P==="questions"&&E()&&await B(t),P==="reports"&&E()&&await ye(t),P==="trash"&&E()&&await J(t);const e=document.getElementById("exam-detail-modal");T&&(e!=null&&e.classList.contains("active"))&&await L(T,{keepOpen:!0,silent:t})}function qe(){document.querySelectorAll(".nav-link[data-view]").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const a=t.dataset.view;a&&Be(a)})})}async function Be(t){P=t,document.querySelectorAll(".nav-link[data-view]").forEach(e=>{e.classList.toggle("active",e.dataset.view===t)}),we.forEach(e=>{var a;(a=document.getElementById(`view-${e}`))==null||a.classList.toggle("hidden",e!==t)}),await U(!1)}function Le(){var t,e,a,s,n,r,c,o,i,m,d,v,b,$,H,j,w;document.querySelectorAll("[data-close-modal]").forEach(x=>{x.addEventListener("click",()=>{const q=x.dataset.closeModal;q&&A(q)})}),document.querySelectorAll(".modal-overlay").forEach(x=>{x.addEventListener("click",q=>{q.target===x&&A(x.id)})}),document.addEventListener("keydown",x=>{x.key==="Escape"&&document.querySelectorAll(".modal-overlay.active").forEach(q=>{A(q.id)})}),(t=document.getElementById("create-exam-btn"))==null||t.addEventListener("click",()=>pe()),(e=document.getElementById("create-user-btn"))==null||e.addEventListener("click",()=>me()),(a=document.getElementById("create-question-btn"))==null||a.addEventListener("click",()=>void Qe()),(s=document.getElementById("create-folder-btn"))==null||s.addEventListener("click",()=>void ge()),(n=document.getElementById("exam-form"))==null||n.addEventListener("submit",Me),(r=document.getElementById("user-form"))==null||r.addEventListener("submit",Fe),(c=document.getElementById("question-form"))==null||c.addEventListener("submit",Oe),(o=document.getElementById("folder-form"))==null||o.addEventListener("submit",He),(i=document.getElementById("question-edit-form"))==null||i.addEventListener("submit",et),(m=document.getElementById("folder-edit-form"))==null||m.addEventListener("submit",at),(d=document.getElementById("q-type"))==null||d.addEventListener("change",x=>{const q=x.target.value,D=document.getElementById("mcq-options-section");D&&(D.style.display=q==="MCQ"?"block":"none")}),(v=document.getElementById("eq-type"))==null||v.addEventListener("change",x=>{const q=x.target.value,D=document.getElementById("eq-mcq-section");D&&(D.style.display=q==="MCQ"?"block":"none")}),(b=document.getElementById("user-search-input"))==null||b.addEventListener("input",()=>{Y&&clearTimeout(Y),Y=setTimeout(()=>void F(!0),300)}),($=document.getElementById("user-role-filter"))==null||$.addEventListener("change",()=>void F(!0)),(H=document.getElementById("question-search-input"))==null||H.addEventListener("input",()=>{W&&clearTimeout(W),W=setTimeout(()=>void B(!0),300)}),(j=document.getElementById("trash-type-filter"))==null||j.addEventListener("change",()=>void J(!0)),(w=document.getElementById("trash-search-input"))==null||w.addEventListener("input",()=>{G&&clearTimeout(G),G=setTimeout(()=>void J(!0),300)})}async function Ae(){var t,e,a,s,n,r;(t=document.getElementById("logout-btn"))==null||t.addEventListener("click",()=>{$e(),window.location.href="/"});try{y=await u("/users/me"),_e(),qe(),Le(),E()&&((e=document.getElementById("staff-nav"))==null||e.classList.remove("hidden"),(a=document.getElementById("admin-controls"))==null||a.classList.remove("hidden"),(s=document.getElementById("trash-nav-wrap"))==null||s.classList.remove("hidden"),(n=document.getElementById("admin-nav"))==null||n.classList.remove("hidden")),ie()||(r=document.getElementById("trash-user-option"))==null||r.remove(),le(),await U(!1),Se()}catch(c){l(c.message||"Failed to load the dashboard.","error");const o=document.getElementById("exam-list");o&&(o.innerHTML=S("!","Unable to load dashboard","Please refresh the page or try again in a moment."))}}async function C(t=!1){if(E())try{const e=await u("/reports/dashboard"),a=e.overview||e,s=document.getElementById("stats-bar");if(!s)return;s.classList.remove("hidden"),s.innerHTML=`
            <div class="stat-card blue animate-in">
                <div class="stat-card-icon">EX</div>
                <div class="stat-card-value">${a.total_exams}</div>
                <div class="stat-card-label">Visible Exams</div>
            </div>
            <div class="stat-card green animate-in" style="animation-delay: 40ms;">
                <div class="stat-card-icon">LV</div>
                <div class="stat-card-value">${a.live_exams}</div>
                <div class="stat-card-label">Live Exams</div>
            </div>
            <div class="stat-card amber animate-in" style="animation-delay: 80ms;">
                <div class="stat-card-icon">AT</div>
                <div class="stat-card-value">${a.total_attempts}</div>
                <div class="stat-card-label">Attempts</div>
            </div>
            <div class="stat-card rose animate-in" style="animation-delay: 120ms;">
                <div class="stat-card-icon">RV</div>
                <div class="stat-card-value">${a.pending_evaluation}</div>
                <div class="stat-card-label">Pending Review</div>
            </div>
        `}catch(e){t||l(e.message||"Failed to load dashboard stats.","error")}}async function V(t=!1){const e=document.getElementById("exam-list");if(e)try{const a=await u("/exams/");if(e.innerHTML="",!a.length){e.innerHTML=S("EX","No exams yet",E()?"Create your first exam or wait for a collaborator to assign one.":"Assigned exams will appear here when they are ready.");return}a.forEach((s,n)=>{var o,i,m,d,v,b;const r=document.createElement("div");r.className="card card-interactive exam-card animate-in",r.style.animationDelay=`${n*45}ms`;const c=E()?`
                    <span>${((o=s.teacher_assignments)==null?void 0:o.length)||0} teachers</span>
                    <span>${((i=s.assignments)==null?void 0:i.length)||0} students</span>
                `:`<span>${((m=s.questions)==null?void 0:m.length)||0} questions</span>`;r.innerHTML=`
                <div class="exam-card-header">
                    <div>
                        <h3>${p(s.title)}</h3>
                        <p class="helper-text">${p(s.instructions||"No instructions added yet.")}</p>
                    </div>
                    <span class="badge ${O(s.status)}">${p(s.status)}</span>
                </div>
                <div class="exam-card-meta">
                    <span>${s.duration_minutes} min</span>
                    <span>${((d=s.questions)==null?void 0:d.length)||0} questions</span>
                    ${c}
                </div>
                ${E()?`
                            <div class="helper-text">
                                Created by ${p(((v=s.creator)==null?void 0:v.name)||((b=s.creator)==null?void 0:b.email)||"Team")}
                            </div>
                        `:""}
                <div class="exam-card-actions">
                    ${E()?`
                                <div class="flex gap-xs">
                                    <button class="icon-btn edit-exam" data-id="${s.id}" title="Edit exam">${f.edit}</button>
                                    <button class="icon-btn detail-exam" data-id="${s.id}" title="Open details">${f.detail}</button>
                                    <button class="icon-btn danger delete-exam" data-id="${s.id}" title="Delete exam">${f.trash}</button>
                                </div>
                            `:'<div class="helper-text">Assigned exam</div>'}
                    <button class="btn btn-primary btn-sm start-btn" data-id="${s.id}">
                        ${y.role==="student"?"Start exam":"View details"}
                    </button>
                </div>
            `,e.appendChild(r)}),Te()}catch(a){t||l(a.message||"Unable to load exams.","error"),e.innerHTML.trim()||(e.innerHTML=S("!","Unable to load exams",a.message||"Please try again in a moment."))}}function Te(){document.querySelectorAll(".start-btn").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(e){if(y.role==="student"){try{const a=await u(`/attempts/${e}/start`,{method:"POST"});window.location.href=`/exam.html?attempt_id=${a.id}`}catch(a){l(a.message,"error")}return}await L(Number.parseInt(e,10))}})}),document.querySelectorAll(".edit-exam").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(e)try{const a=await u(`/exams/${e}`);pe(a)}catch(a){l(a.message,"error")}})}),document.querySelectorAll(".delete-exam").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(!(!e||!window.confirm("Delete this exam?")))try{await u(`/exams/${e}`,{method:"DELETE"}),l("Exam deleted.","success"),await U(!0)}catch(a){l(a.message,"error")}})}),document.querySelectorAll(".detail-exam").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.id;e&&L(Number.parseInt(e,10))})})}function pe(t){var o;Z=t?t.id:null;const e=document.getElementById("exam-modal-title"),a=document.getElementById("exam-submit-btn"),s=document.getElementById("exam-title"),n=document.getElementById("exam-instructions"),r=document.getElementById("exam-duration"),c=document.getElementById("exam-status");e&&(e.textContent=t?"Edit Exam":"Create Exam"),a&&(a.textContent=t?"Save Changes":"Create Exam"),s&&(s.value=(t==null?void 0:t.title)||""),n&&(n.value=(t==null?void 0:t.instructions)||""),r&&(r.value=((o=t==null?void 0:t.duration_minutes)==null?void 0:o.toString())||"60"),c&&(c.value=(t==null?void 0:t.status)||"DRAFT"),R("exam-modal")}async function Me(t){t.preventDefault();const e={title:document.getElementById("exam-title").value,instructions:document.getElementById("exam-instructions").value,duration_minutes:Number.parseInt(document.getElementById("exam-duration").value,10),status:document.getElementById("exam-status").value};try{Z?(await u(`/exams/${Z}`,{method:"PUT",body:JSON.stringify(e)}),l("Exam updated.","success")):(await u("/exams/",{method:"POST",body:JSON.stringify(e)}),l("Exam created.","success")),A("exam-modal"),await U(!0)}catch(a){l(a.message,"error")}}function Ne(t,e){return e.length?e.map(a=>{var s,n,r;return`
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <span class="text-sm">${p(a.prompt.substring(0,110))}</span>
                        <span class="helper-text">
                            ${p(((s=a.folder)==null?void 0:s.name)||"Unfiled")} • ${p(((n=a.owner)==null?void 0:n.name)||((r=a.owner)==null?void 0:r.email)||"Shared bank")}
                        </span>
                    </div>
                    <button class="btn btn-primary btn-sm add-q-to-exam" data-exam="${t}" data-qid="${a.id}">
                        Add
                    </button>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No additional accessible questions available.</p>'}function ae(t,e,a){return t.length?`
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
                                <strong>${p(s.name||s.email)}</strong>
                                <p class="helper-text">${p(s.email)}</p>
                            </div>
                        </label>
                    `).join("")}
        </div>
    `:`<p class="text-sm text-muted">No ${a}s available.</p>`}function Ce(t){var e;return(e=t.questions)!=null&&e.length?t.questions.map(a=>{var n;const s=a.question||a;return`
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <div class="flex items-center gap-sm">
                            <span class="badge badge-info">${s.type||"MCQ"}</span>
                            <span class="chip">${s.marks||1} marks</span>
                            ${(n=s.folder)!=null&&n.name?`<span class="chip">${p(s.folder.name)}</span>`:""}
                        </div>
                        <span class="text-sm">${p((s.prompt||"").substring(0,110))}</span>
                    </div>
                    <button class="icon-btn danger remove-q" data-exam="${t.id}" data-qid="${a.question_id}" title="Remove question">
                        ×
                    </button>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No questions added yet.</p>'}function De(t){return t.length?`
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
                                <td class="table-primary">${p(((a=e.student)==null?void 0:a.name)||((s=e.student)==null?void 0:s.email)||`Student #${e.student_id}`)}</td>
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
    `:S("AT","No attempts yet","Attempts will appear here once students start.")}async function L(t,e={}){var n,r;const{keepOpen:a=!1,silent:s=!1}=e;try{T=t;const c=u(`/exams/${t}`),o=u("/exams/questions").catch(()=>[]),i=u(`/attempts/exam/${t}`).catch(()=>[]),m=u("/users/?role=examiner").catch(()=>[]),d=u("/users/?role=student").catch(()=>[]),[v,b,$,H,j]=await Promise.all([c,o,i,m,d]),w=document.getElementById("exam-detail-content"),x=document.getElementById("exam-detail-title");if(!w||!x)return;x.textContent=v.title;const q=new Set((v.teacher_assignments||[]).map(h=>h.teacher_id)),D=new Set((v.assignments||[]).map(h=>h.student_id)),fe=(v.questions||[]).map(h=>h.question_id),be=b.filter(h=>!fe.includes(h.id));w.innerHTML=`
            <div class="tabs">
                <button class="tab active" data-tab="questions">Questions (${((n=v.questions)==null?void 0:n.length)||0})</button>
                <button class="tab" data-tab="attempts">Attempts (${$.length})</button>
                <button class="tab" data-tab="assign">Assignments</button>
            </div>

            <div id="tab-questions">
                ${Ce(v)}
                <div class="detail-divider"></div>
                <div class="section-title mb-1">Add From Question Bank</div>
                ${Ne(t,be)}
            </div>

            <div id="tab-attempts" class="hidden">
                ${De($)}
            </div>

            <div id="tab-assign" class="hidden">
                <div class="stack-list">
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Teachers</div>
                        <p class="helper-text mb-2">
                            Assigned teachers can see this exam, manage questions, and review attempts.
                        </p>
                        ${ae(H,q,"teacher")}
                    </div>
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Students</div>
                        <p class="helper-text mb-2">
                            Assigned students will see the exam on their dashboard once it becomes available.
                        </p>
                        ${ae(j,D,"student")}
                    </div>
                    <div class="flex items-center justify-between gap-sm">
                        <p class="helper-text">Question folders used in this exam will be shared to assigned teachers automatically.</p>
                        <button class="btn btn-primary" id="assign-btn">Save assignments</button>
                    </div>
                </div>
            </div>
        `,w.querySelectorAll(".tab").forEach(h=>{h.addEventListener("click",()=>{w.querySelectorAll(".tab").forEach(g=>g.classList.remove("active")),h.classList.add("active");const k=h.dataset.tab;["questions","attempts","assign"].forEach(g=>{var Q;(Q=w.querySelector(`#tab-${g}`))==null||Q.classList.toggle("hidden",g!==k)})})}),w.querySelectorAll(".add-q-to-exam").forEach(h=>{h.addEventListener("click",async()=>{const k=h.dataset.exam,g=h.dataset.qid;if(!(!k||!g))try{await u(`/exams/${k}/questions/${g}`,{method:"POST"}),l("Question added to exam.","success"),await L(t,{keepOpen:!0}),await B(!0)}catch(Q){l(Q.message,"error")}})}),w.querySelectorAll(".remove-q").forEach(h=>{h.addEventListener("click",async()=>{const k=h.dataset.exam,g=h.dataset.qid;if(!(!k||!g))try{await u(`/exams/${k}/questions/${g}`,{method:"DELETE"}),l("Question removed from exam.","success"),await L(t,{keepOpen:!0})}catch(Q){l(Q.message,"error")}})}),w.querySelectorAll(".evaluate-btn").forEach(h=>{h.addEventListener("click",async()=>{const k=h.dataset.id;if(k)try{const g=await u(`/attempts/${k}/evaluate`,{method:"POST"});l(`Evaluated: ${g.score}/${g.max_score}`,"success"),await L(t,{keepOpen:!0})}catch(g){l(g.message,"error")}})}),w.querySelectorAll(".delete-attempt").forEach(h=>{h.addEventListener("click",async()=>{const k=h.dataset.id;if(!(!k||!window.confirm("Delete this submission? It will move to Recently Deleted.")))try{await u(`/attempts/${k}`,{method:"DELETE"}),l("Submission moved to Recently Deleted.","success"),await L(t,{keepOpen:!0}),await z(!0),await C(!0)}catch(g){l(g.message,"error")}})}),(r=w.querySelector("#assign-btn"))==null||r.addEventListener("click",async()=>{const h=Array.from(w.querySelectorAll(".assign-teacher:checked")).map(g=>Number.parseInt(g.value,10)),k=Array.from(w.querySelectorAll(".assign-student:checked")).map(g=>Number.parseInt(g.value,10));try{await u(`/exams/${t}/assign`,{method:"POST",body:JSON.stringify({teacher_ids:h,student_ids:k})}),l("Assignments updated.","success"),await L(t,{keepOpen:!0}),await V(!0)}catch(g){l(g.message,"error")}}),a||R("exam-detail-modal")}catch(c){s||l(c.message,"error")}}async function F(t=!1){var a,s,n;const e=document.getElementById("users-tbody");if(e)try{const r=(s=(a=document.getElementById("user-search-input"))==null?void 0:a.value)==null?void 0:s.trim(),c=(n=document.getElementById("user-role-filter"))==null?void 0:n.value;let o="/users/?limit=200";r&&(o+=`&q=${encodeURIComponent(r)}`),c&&(o+=`&role=${encodeURIComponent(c)}`),te=await u(o),e.innerHTML=te.map(i=>`
                    <tr>
                        <td class="table-primary">${p(i.name||"—")}</td>
                        <td>${p(i.email)}</td>
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
                                    ${i.can_edit?`<button class="icon-btn edit-user" data-id="${i.id}" title="Edit user">${f.edit}</button>`:""}
                                    ${i.can_toggle_active?`<button class="btn btn-ghost btn-sm toggle-user-access" data-id="${i.id}" data-next-active="${i.is_active?"false":"true"}">${i.is_active?"Remove access":"Restore access"}</button>`:""}
                                    ${i.can_delete?`<button class="icon-btn danger delete-user" data-id="${i.id}" title="Delete user">${f.trash}</button>`:""}
                                </div>
                                ${ke(i)||i.can_delete?"":`<span class="table-action-note">${p(i.protected_reason||"View only")}</span>`}
                            </div>
                        </td>
                    </tr>
                `).join(""),Pe()}catch(r){t||l(r.message,"error")}}function Pe(){document.querySelectorAll(".edit-user").forEach(t=>{t.addEventListener("click",()=>{const e=Number.parseInt(t.dataset.id||"",10),a=te.find(s=>s.id===e);a&&me(a)})}),document.querySelectorAll(".toggle-user-access").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id,a=t.dataset.nextActive==="true";if(!e)return;const s=a?"Restore access for this user?":"Remove access for this user?";if(window.confirm(s))try{await u(`/users/${e}`,{method:"PUT",body:JSON.stringify({is_active:a})}),l(a?"Access restored.":"Access removed.","success"),await F(!0),await C(!0)}catch(n){l(n.message,"error")}})}),document.querySelectorAll(".delete-user").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(!(!e||!window.confirm("Delete this user?")))try{await u(`/users/${e}`,{method:"DELETE"}),l("User moved to Recently Deleted.","success"),await F(!0),await C(!0)}catch(a){l(a.message,"error")}})})}function me(t){ee=t?t.id:null;const e=document.getElementById("user-modal-title"),a=document.getElementById("user-submit-btn"),s=document.getElementById("user-name-input"),n=document.getElementById("user-email-input"),r=document.getElementById("user-password-input"),c=document.getElementById("user-role-input");e&&(e.textContent=t?"Edit User":"Add User"),a&&(a.textContent=t?"Save Changes":"Add User"),s&&(s.value=(t==null?void 0:t.name)||""),n&&(n.value=(t==null?void 0:t.email)||""),r&&(r.value="",r.required=!t),c&&(c.value=(t==null?void 0:t.role)||"student"),le((t==null?void 0:t.role)||"student"),R("user-modal")}async function Fe(t){t.preventDefault();const e={name:document.getElementById("user-name-input").value,email:document.getElementById("user-email-input").value,role:document.getElementById("user-role-input").value},a=document.getElementById("user-password-input").value;a&&(e.password=a);try{if(ee)await u(`/users/${ee}`,{method:"PUT",body:JSON.stringify(e)}),l("User updated.","success");else{if(!a){l("Password required for a new user.","warning");return}await u("/users/",{method:"POST",body:JSON.stringify(e)}),l("User created.","success")}A("user-modal"),await F(!0),await C(!0)}catch(s){l(s.message,"error")}}async function ve(){return E()?(N=await u("/exams/question-folders"),I&&!N.some(t=>t.id===I)&&(I=null),N):[]}function he(){const t=document.getElementById("q-folder");if(!t)return;const e=oe();t.innerHTML=e.map(a=>`
                <option value="${a.id}">
                    ${a.name}${a.access_level==="shared"?" (Shared)":""}
                </option>
            `).join(""),e.length||(t.innerHTML='<option value="">Create or own a folder first</option>')}function Re(){const t=document.getElementById("question-folder-toolbar");if(t){if(!N.length){t.innerHTML=S(f.folder,"No folders yet","Create your first question folder to organize a personal or shared question bank.");return}t.innerHTML=`
        <div class="card" style="padding: 1rem; margin-bottom: 1rem;">
            <div class="section-title mb-1">Folders</div>
            <div class="trash-list-stack" style="max-height:280px; overflow-y:auto;">
                ${N.map(e=>{var a;return`
                        <div class="folder-card ${I===e.id?"folder-active":""}" data-folder-id="${e.id}">
                            <div class="folder-card-icon">${f.folder}</div>
                            <div>
                                <div style="font-weight:700;font-size:0.95rem;">${p(e.name)}</div>
                                <div class="helper-text" style="font-size:0.82rem;">
                                    ${e.question_count||0} questions
                                    • ${p(de(e))}
                                    ${(a=e.shared_with)!=null&&a.length?` • Shared with ${e.shared_with.length} examiner${e.shared_with.length===1?"":"s"}`:""}
                                </div>
                            </div>
                            <div class="folder-card-actions">
                                ${e.can_share?`<button class="icon-btn edit-folder" data-id="${e.id}" title="Edit folder">${f.edit}</button>`:""}
                                <button class="icon-btn ${I===e.id?"btn-primary":""} folder-filter" data-folder="${e.id}" title="Filter by folder" style="font-size:0.7rem;width:auto;padding:0 0.5rem;">${I===e.id?"✓":"Filter"}</button>
                                ${e.can_delete?`<button class="icon-btn danger delete-folder" data-id="${e.id}" title="Delete folder">${f.trash}</button>`:""}
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
    `,t.querySelectorAll(".folder-filter").forEach(e=>{e.addEventListener("click",async()=>{const a=e.dataset.folder;I=a&&a.trim()?Number.parseInt(a,10):null,await B(!0)})}),t.querySelectorAll(".edit-folder").forEach(e=>{e.addEventListener("click",()=>{const a=Number(e.dataset.id),s=N.find(n=>n.id===a);s&&tt(s)})}),t.querySelectorAll(".delete-folder").forEach(e=>{e.addEventListener("click",async()=>{const a=e.dataset.id;if(!(!a||!window.confirm("Move this folder and all its questions to Recently Deleted?")))try{await u(`/exams/question-folders/${a}`,{method:"DELETE"}),l("Folder moved to Recently Deleted.","success"),I=null,await B(!0)}catch(s){l(s.message,"error")}})})}}async function B(t=!1){var a,s;const e=document.getElementById("questions-list");if(e)try{await ve(),Re(),he();const n=new URLSearchParams,r=(s=(a=document.getElementById("question-search-input"))==null?void 0:a.value)==null?void 0:s.trim();I&&n.set("folder_id",String(I)),r&&n.set("q",r);const c=n.toString()?`?${n.toString()}`:"",o=await u(`/exams/questions${c}`);if(!o.length){e.innerHTML=S("QB","No questions yet","Build your question bank here for reuse across exams and collaborator assignments.");return}e.innerHTML=o.map((i,m)=>{var d,v,b,$;return`
                    <div class="card question-card animate-in" style="animation-delay: ${m*35}ms;">
                        <div class="question-card-header">
                            <div class="flex items-center gap-sm">
                                <span class="badge ${i.type==="MCQ"?"badge-primary":"badge-purple"}">${i.type}</span>
                                <span class="chip">${i.marks} marks</span>
                                ${(d=i.folder)!=null&&d.name?`<span class="chip">${p(i.folder.name)}</span>`:""}
                            </div>
                            <div class="question-card-actions">
                                ${i.can_edit?`<button class="icon-btn edit-question" data-id="${i.id}" title="Edit question">${f.edit}</button>`:""}
                                ${i.can_delete?`<button class="icon-btn danger delete-question" data-id="${i.id}" title="Delete question">${f.trash}</button>`:""}
                            </div>
                        </div>
                        <p class="text-sm">${p(i.prompt)}</p>
                        ${(v=i.options)!=null&&v.length?`
                                    <div class="flex gap-xs mt-2" style="flex-wrap: wrap;">
                                        ${i.options.map(H=>`<span class="chip">${p(H)}</span>`).join("")}
                                    </div>
                                `:""}
                        <p class="helper-text mt-2">
                            ${p(((b=i.owner)==null?void 0:b.name)||(($=i.owner)==null?void 0:$.email)||"Personal bank")}
                            ${i.folder?` • ${p(de(i.folder))}`:""}
                        </p>
                    </div>
                `}).join(""),document.querySelectorAll(".edit-question").forEach(i=>{i.addEventListener("click",()=>{const m=Number(i.dataset.id),d=o.find(v=>v.id===m);d&&Ze(d)})}),document.querySelectorAll(".delete-question").forEach(i=>{i.addEventListener("click",async()=>{const m=i.dataset.id;if(!(!m||!window.confirm("Move this question to Recently Deleted?")))try{await u(`/exams/questions/${m}`,{method:"DELETE"}),l("Question moved to Recently Deleted.","success"),await B(!0)}catch(d){l(d.message,"error")}})})}catch(n){t||l(n.message,"error"),e.innerHTML=S("!","Question bank unavailable",n.message||"Please try again in a moment.")}}async function ge(){const t=document.getElementById("folder-modal-title"),e=document.getElementById("folder-submit-btn"),a=document.getElementById("folder-name"),s=document.getElementById("folder-description");t&&(t.textContent="Create Folder"),e&&(e.textContent="Create Folder"),a&&(a.value=""),s&&(s.value=""),await ce("folder-share-list"),R("folder-modal")}async function He(t){t.preventDefault();const e={name:document.getElementById("folder-name").value,description:document.getElementById("folder-description").value,share_with_teacher_ids:re("folder-share-list")};try{await u("/exams/question-folders",{method:"POST",body:JSON.stringify(e)}),l("Folder created.","success"),A("folder-modal"),await B(!0)}catch(a){l(a.message,"error")}}async function Qe(){var i;await ve();const t=oe();if(!t.length){l("Create or own a question folder before adding questions.","warning"),ge();return}he();const e=document.getElementById("question-modal-title"),a=document.getElementById("q-type"),s=document.getElementById("q-prompt"),n=document.getElementById("q-marks"),r=document.getElementById("q-correct"),c=document.getElementById("q-folder");if(e&&(e.textContent="Add Question"),a&&(a.value="MCQ"),s&&(s.value=""),n&&(n.value="1"),r&&(r.value=""),c){const m=(I&&t.some(d=>d.id===I)?I:null)||((i=t[0])==null?void 0:i.id);c.value=m?m.toString():""}document.querySelectorAll(".mcq-option").forEach(m=>{m.value=""});const o=document.getElementById("mcq-options-section");o&&(o.style.display="block"),R("question-modal")}async function Oe(t){t.preventDefault();const e=document.getElementById("q-type").value,a=Number.parseInt(document.getElementById("q-folder").value,10),s={type:e,prompt:document.getElementById("q-prompt").value,marks:Number.parseInt(document.getElementById("q-marks").value,10),folder_id:Number.isNaN(a)?void 0:a};e==="MCQ"&&(s.options=Array.from(document.querySelectorAll(".mcq-option")).map(n=>n.value.trim()).filter(Boolean),s.correct_option=document.getElementById("q-correct").value);try{await u("/exams/questions",{method:"POST",body:JSON.stringify(s)}),l("Question created.","success"),A("question-modal"),await B(!0)}catch(n){l(n.message,"error")}}function Ue(t){const e=(t==null?void 0:t.overview)||{};return`
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
                    <strong class="report-kpi-value">${_(e.average_percentage)}</strong>
                    <span class="report-kpi-note">Best ${_(e.best_percentage)}</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Flags</span>
                    <strong class="report-kpi-value">${e.total_flags||0}</strong>
                    <span class="report-kpi-note">Across all attempts</span>
                </div>
            </div>
        </section>
    `}async function z(t=!1){const e=document.getElementById("results-list"),a=document.getElementById("results-summary");if(!(!e||!a))try{const s=y.role==="student"?u("/reports/student/me").catch(()=>null):Promise.resolve(null),[n,r]=await Promise.all([u("/attempts/"),s]);a.innerHTML=r?Ue(r):"";const c=n.filter(o=>o.status==="SUBMITTED"||o.status==="EVALUATED");if(!c.length){e.innerHTML=S("RS","No results yet","Completed exam attempts will show up here.");return}e.innerHTML=c.map((o,i)=>{var m,d;return`
                    <div class="card card-interactive exam-card animate-in result-entry" data-attempt-id="${o.id}" style="cursor: pointer; animation-delay: ${i*35}ms;">
                        <div class="exam-card-header">
                            <div>
                                <h3>${y.role==="student"?`Attempt #${o.id}`:p(((m=o.student)==null?void 0:m.name)||((d=o.student)==null?void 0:d.email)||`Attempt #${o.id}`)}</h3>
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
                `}).join(""),document.querySelectorAll(".result-entry").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.attemptId;i&&(window.location.href=`/result.html?attempt_id=${i}`)})})}catch(s){t||l(s.message,"error"),e.innerHTML=S("!","Results unavailable",s.message||"Please try again in a moment.")}}function _(t){return`${(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}%`}function se(t){return(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}function M(t,e="blue",a="No data yet."){if(!t.length||t.every(n=>n.count===0))return`<p class="helper-text">${a}</p>`;const s=Math.max(...t.map(n=>n.count),1);return`
        <div class="report-bars">
            ${t.map(n=>`
                        <div class="report-bar-row">
                            <div class="report-bar-head">
                                <span>${p(n.label)}</span>
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
                <span>${_(n)}</span>
            </div>
            <h4>${p(t)}</h4>
            <p>${p(a)}</p>
        </div>
    `}function je(t){if(!t.length)return'<p class="helper-text">No recent activity yet.</p>';const e=Math.max(...t.flatMap(a=>[a.started,a.submitted,a.evaluated]),1);return`
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
                            <span class="timeline-day-label">${p(a.label)}</span>
                        </div>
                    `).join("")}
        </div>
    `}function Ve(t){return t.length?`
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
                                <td class="table-primary">${p(e.title)}</td>
                                <td>${e.attempt_count}</td>
                                <td>${_(e.completion_rate)}</td>
                                <td>${_(e.average_percentage)}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">No exam analytics available yet.</p>'}function ze(t){return t.length?`
        <div class="insight-list">
            ${t.slice(0,4).map(e=>`
                        <div class="insight-item">
                            <div class="insight-item-head">
                                <span class="badge ${e.type==="MCQ"?"badge-primary":"badge-purple"}">${e.type}</span>
                                <span class="chip">${p(e.difficulty)}</span>
                            </div>
                            <p class="text-sm">${p(e.prompt)}</p>
                            <div class="insight-item-meta">
                                <span>Response ${_(e.response_rate)}</span>
                                ${e.type==="MCQ"?`<span>Correct ${_(e.correct_rate)}</span>`:`<span>Avg marks ${se(e.average_awarded_marks)}/${se(e.marks)}</span>`}
                                <span>Blank ${e.blank_count}</span>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `:'<p class="helper-text">Question-level analytics will appear after candidates start submitting.</p>'}function Je(t){return t.length?`
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
                                <td class="table-primary">${p(e.student_name)}</td>
                                <td><span class="badge ${O(e.status)}">${p(e.status)}</span></td>
                                <td>${e.percentage!==null?_(e.percentage):"—"}</td>
                                <td>${e.violations}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">Leaderboard data appears after attempts are submitted.</p>'}function Xe(t){return M(t,"blue","No delivery funnel data yet.")}function Ye(t){const e=t.overview||t;return`
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
                    <strong class="report-kpi-value">${_(e.average_percentage)}</strong>
                    <span class="report-kpi-note">${e.evaluated_attempts} evaluated attempts</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${_(e.participation_rate)}</strong>
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
    `}function We(t){const e=t.overview||t;return`
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
                ${M(t.exam_status_breakdown||[],"amber","No exam status data yet.")}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Attempt Flow</h4>
                        <p class="report-panel-copy">Current candidate progress through the lifecycle.</p>
                    </div>
                </div>
                ${M(t.attempt_status_breakdown||[],"green","No attempt data yet.")}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Recent Activity</h4>
                        <p class="report-panel-copy">Started, submitted, and evaluated attempts over the last 7 days.</p>
                    </div>
                </div>
                ${je(t.activity_timeline||[])}
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
                        ${M(t.integrity_breakdown||[],"rose","No integrity events recorded.")}
                    </div>
                    <div>
                        <span class="section-title">Risk Bands</span>
                        ${M(t.risk_distribution||[],"amber","No risk distribution yet.")}
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
                ${Ve(t.top_exams||[])}
            </article>
        </section>
    `}function Ge(t,e){const a=t.overview||{},s=t.exam||{};return`
        <article class="card report-exam-card animate-in" style="animation-delay:${e*45}ms;">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Exam Analytics</span>
                    <h3 class="card-title">${p(s.title||"Exam")}</h3>
                    <p class="report-panel-copy">
                        ${s.question_count||0} questions • ${s.duration_minutes||0} minutes • ${s.assigned_students||0} assigned students • ${s.teacher_count||0} teachers
                    </p>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="badge ${O(s.status||"DRAFT")}">${p(s.status||"DRAFT")}</span>
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
                    ${Xe(t.progress_funnel||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Score Distribution</h4>
                        <p class="report-panel-copy">Percentage score bands for evaluated attempts.</p>
                    </div>
                    ${M(t.score_distribution||[],"green","No evaluated scores yet.")}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Question Insights</h4>
                        <p class="report-panel-copy">Hardest or lowest-response questions first.</p>
                    </div>
                    ${ze(t.question_insights||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Leaderboard</h4>
                        <p class="report-panel-copy">Top evaluated candidates with flag counts.</p>
                    </div>
                    ${Je(t.leaderboard||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Integrity Breakdown</h4>
                        <p class="report-panel-copy">What kind of proctoring events were recorded.</p>
                    </div>
                    ${M(t.proctoring_breakdown||[],"rose","No proctoring events recorded.")}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Risk Distribution</h4>
                        <p class="report-panel-copy">Clean, flagged, and high-risk attempt mix.</p>
                    </div>
                    ${M(t.risk_distribution||[],"amber","No risk signals yet.")}
                </section>
            </div>
        </article>
    `}async function ye(t=!1){const e=document.getElementById("reports-content");if(e)try{const[a,s]=await Promise.all([u("/reports/dashboard"),u("/exams/")]);if(!s.length&&!(a.top_exams||[]).length){e.innerHTML=S("RP","No report data","Reports will appear once exams and attempts exist.");return}const r=(await Promise.all(s.map(async c=>{try{return await u(`/reports/exam/${c.id}/analytics`)}catch{return null}}))).filter(Boolean);r.sort((c,o)=>{var d,v,b,$;const i=((d=c==null?void 0:c.overview)==null?void 0:d.attempt_count)||0,m=((v=o==null?void 0:o.overview)==null?void 0:v.attempt_count)||0;return i!==m?m-i:String(((b=c==null?void 0:c.exam)==null?void 0:b.title)||"").localeCompare(String((($=o==null?void 0:o.exam)==null?void 0:$.title)||""))}),e.innerHTML=`
            <div class="reports-shell">
                ${Ye(a)}
                ${We(a)}
                <section class="stack-list">
                    ${r.length?r.map((c,o)=>Ge(c,o)).join(""):S(f.detail,"Per-exam analytics unavailable","The dashboard summary loaded, but detailed exam analytics could not be generated right now.")}
                </section>
            </div>
        `}catch(a){t||l(a.message,"error"),e.innerHTML=S("!","Reports unavailable",a.message||"Please try again in a moment.")}}async function ne(t){const e=[J(!0)];t==="user"&&E()&&e.push(F(!0),C(!0)),t==="exam"&&(e.push(V(!0),z(!0)),E()&&e.push(C(!0),ye(!0)),T&&e.push(L(T,{keepOpen:!0,silent:!0}))),(t==="question"||t==="folder")&&E()&&e.push(B(!0)),t==="attempt"&&(e.push(V(!0),z(!0)),E()&&e.push(C(!0)),T&&e.push(L(T,{keepOpen:!0,silent:!0}))),await Promise.all(e.map(a=>a.catch(()=>{})))}async function J(t=!1){var a,s,n;const e=document.getElementById("trash-list");if(e)try{const r=(a=document.getElementById("trash-type-filter"))==null?void 0:a.value,c=(n=(s=document.getElementById("trash-search-input"))==null?void 0:s.value)==null?void 0:n.trim(),o=new URLSearchParams;r&&o.set("entity_type",r),c&&o.set("q",c);const i=o.toString()?`/trash/?${o.toString()}`:"/trash/",m=await u(i);if(!m.length){e.innerHTML=S(f.trash,"Nothing in trash","Deleted exams, questions, folders, and users will appear here.");return}e.innerHTML=`<div class="trash-list-stack">
            ${m.map((d,v)=>`
                <div class="trash-item animate-in" style="animation-delay:${v*30}ms;">
                    <div class="trash-item-icon ${d.entity_type}">${d.entity_type==="exam"?f.exam:d.entity_type==="question"?f.question:d.entity_type==="folder"?f.folder:d.entity_type==="attempt"?f.detail:d.entity_type==="user"?f.user:f.trash}</div>
                    <div class="trash-item-details">
                        <div style="font-weight:700;font-size:0.95rem;">${p(d.label)}</div>
                        <div class="helper-text" style="font-size:0.82rem;">
                            <span class="badge badge-info" style="font-size:0.7rem;">${d.entity_type}</span>
                            &nbsp;Deleted ${new Date(d.deleted_at).toLocaleString()}
                        </div>
                    </div>
                    <div class="trash-item-actions">
                        ${d.can_restore?`<button class="icon-btn trash-restore" data-trash-id="${d.id}" data-entity-type="${d.entity_type}" title="Restore item">${f.restore}</button>`:""}
                        ${d.can_permanent_delete?`<button class="icon-btn danger trash-purge" data-trash-id="${d.id}" data-entity-type="${d.entity_type}" title="Permanently delete">${f.trash}</button>`:""}
                        ${d.can_restore||d.can_permanent_delete?"":'<span class="table-action-note">No actions available</span>'}
                    </div>
                </div>
            `).join("")}
        </div>`,e.querySelectorAll(".trash-restore").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.trashId,b=d.dataset.entityType||"";if(v)try{const $=await u(`/trash/${v}/restore`,{method:"POST"});l($.message||"Item restored successfully.","success"),await ne(b)}catch($){l($.message,"error")}})}),e.querySelectorAll(".trash-purge").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.trashId,b=d.dataset.entityType||"";if(!(!v||!window.confirm("Permanently delete this item? This cannot be undone.")))try{await u(`/trash/${v}/permanent`,{method:"DELETE"}),l("Permanently deleted.","success"),await ne(b)}catch($){l($.message,"error")}})})}catch(r){t||l(r.message,"error"),e.innerHTML=S("!","Unable to load trash",r.message||"Please try again.")}}function Ke(t){const e=document.getElementById("eq-folder");if(!e)return;const a=N.filter(s=>s.can_edit||s.id===t);e.innerHTML=a.map(s=>`
                <option value="${s.id}" ${s.id===t?"selected":""}>
                    ${p(s.name)}${s.can_edit?"":" (Current folder)"}
                </option>
            `).join("")}function Ze(t){const e=document.getElementById("eq-type"),a=document.getElementById("eq-prompt"),s=document.getElementById("eq-marks"),n=document.getElementById("eq-correct"),r=document.getElementById("eq-id"),c=document.getElementById("eq-mcq-section");r&&(r.value=String(t.id)),e&&(e.value=t.type||"MCQ"),a&&(a.value=t.prompt||""),s&&(s.value=String(t.marks||1)),n&&(n.value=t.correct_option||""),c&&(c.style.display=t.type==="MCQ"?"block":"none"),document.querySelectorAll(".eq-option").forEach((i,m)=>{var d;i.value=((d=t.options)==null?void 0:d[m])||""}),Ke(t.folder_id),R("question-edit-modal")}async function et(t){t.preventDefault();const e=document.getElementById("eq-id").value,a=document.getElementById("eq-type").value,s=Number.parseInt(document.getElementById("eq-folder").value,10),n={type:a,prompt:document.getElementById("eq-prompt").value,marks:Number.parseInt(document.getElementById("eq-marks").value,10),folder_id:Number.isNaN(s)?null:s};a==="MCQ"&&(n.options=Array.from(document.querySelectorAll(".eq-option")).map(r=>r.value.trim()).filter(Boolean),n.correct_option=document.getElementById("eq-correct").value);try{await u(`/exams/questions/${e}`,{method:"PUT",body:JSON.stringify(n)}),l("Question updated.","success"),A("question-edit-modal"),await B(!0)}catch(r){l(r.message,"error")}}async function tt(t){const e=document.getElementById("ef-id"),a=document.getElementById("ef-name"),s=document.getElementById("ef-description");e&&(e.value=String(t.id)),a&&(a.value=t.name||""),s&&(s.value=t.description||""),await ce("folder-edit-share-list",(t.shared_with||[]).map(n=>n.id)),R("folder-edit-modal")}async function at(t){t.preventDefault();const e=document.getElementById("ef-id").value,a={name:document.getElementById("ef-name").value,description:document.getElementById("ef-description").value,share_with_teacher_ids:re("folder-edit-share-list")};try{await u(`/exams/question-folders/${e}`,{method:"PUT",body:JSON.stringify(a)}),l("Folder updated.","success"),A("folder-edit-modal"),await B(!0)}catch(s){l(s.message,"error")}}Ae();
