import{r as re,a as o,g as ie,e as c,b as N}from"./utils-BjHaNtKY.js";import{a as d}from"./api-BV8riEN3.js";let h=null,F=null,Q=null;const oe=["exams","results","users","questions","reports"],le=1e4;let A="exams",P=null,D=null,w=[],k=null;function x(){return(h==null?void 0:h.role)==="admin"||(h==null?void 0:h.role)==="examiner"}function $(t,e,a){return`
        <div class="empty-state">
            <div class="empty-state-icon">${t}</div>
            <div class="empty-state-title">${e}</div>
            <div class="empty-state-desc">${a}</div>
        </div>
    `}function J(){const t=Array.from(document.querySelectorAll(".modal-overlay")).some(e=>e.classList.contains("active"));document.body.classList.toggle("modal-open",t)}function M(t){var e;(e=document.getElementById(t))==null||e.classList.add("active"),J()}function q(t){var e;(e=document.getElementById(t))==null||e.classList.remove("active"),t==="exam-detail-modal"&&(P=null),J()}function de(){const t=h.name||h.email,e=document.getElementById("user-name"),a=document.getElementById("user-role"),s=document.getElementById("user-avatar");e&&(e.textContent=t),a&&(a.textContent=h.role),s&&(s.textContent=ie(h.name,h.email))}function ce(){D&&window.clearInterval(D),D=window.setInterval(()=>{C(!0)},le)}async function C(t=!1){x()&&await H(t),A==="exams"&&await z(t),A==="results"&&await _e(t),A==="users"&&h.role==="admin"&&await O(t),A==="questions"&&x()&&await L(t),A==="reports"&&x()&&await Pe(t);const e=document.getElementById("exam-detail-modal");P&&(e!=null&&e.classList.contains("active"))&&await _(P,{keepOpen:!0,silent:t})}function pe(){document.querySelectorAll(".nav-link[data-view]").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const a=t.dataset.view;a&&ue(a)})})}async function ue(t){A=t,document.querySelectorAll(".nav-link[data-view]").forEach(e=>{e.classList.toggle("active",e.dataset.view===t)}),oe.forEach(e=>{var a;(a=document.getElementById(`view-${e}`))==null||a.classList.toggle("hidden",e!==t)}),await C(!1)}function me(){var t,e,a,s,n,l,i,r,m;document.querySelectorAll("[data-close-modal]").forEach(p=>{p.addEventListener("click",()=>{const v=p.dataset.closeModal;v&&q(v)})}),document.querySelectorAll(".modal-overlay").forEach(p=>{p.addEventListener("click",v=>{v.target===p&&q(p.id)})}),document.addEventListener("keydown",p=>{p.key==="Escape"&&document.querySelectorAll(".modal-overlay.active").forEach(v=>{q(v.id)})}),(t=document.getElementById("create-exam-btn"))==null||t.addEventListener("click",()=>X()),(e=document.getElementById("create-user-btn"))==null||e.addEventListener("click",()=>W()),(a=document.getElementById("create-question-btn"))==null||a.addEventListener("click",()=>void ke()),(s=document.getElementById("create-folder-btn"))==null||s.addEventListener("click",()=>K()),(n=document.getElementById("exam-form"))==null||n.addEventListener("submit",he),(l=document.getElementById("user-form"))==null||l.addEventListener("submit",Ee),(i=document.getElementById("question-form"))==null||i.addEventListener("submit",Ie),(r=document.getElementById("folder-form"))==null||r.addEventListener("submit",we),(m=document.getElementById("q-type"))==null||m.addEventListener("change",p=>{const v=p.target.value,y=document.getElementById("mcq-options-section");y&&(y.style.display=v==="MCQ"?"block":"none")})}async function ve(){var t,e,a;(t=document.getElementById("logout-btn"))==null||t.addEventListener("click",()=>{re(),window.location.href="/"});try{h=await d("/users/me"),de(),pe(),me(),x()&&((e=document.getElementById("admin-nav"))==null||e.classList.remove("hidden"),(a=document.getElementById("admin-controls"))==null||a.classList.remove("hidden")),await C(!1),ce()}catch(s){o(s.message||"Failed to load the dashboard.","error");const n=document.getElementById("exam-list");n&&(n.innerHTML=$("!","Unable to load dashboard","Please refresh the page or try again in a moment."))}}async function H(t=!1){if(x())try{const e=await d("/reports/dashboard"),a=e.overview||e,s=document.getElementById("stats-bar");if(!s)return;s.classList.remove("hidden"),s.innerHTML=`
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
        `}catch(e){t||o(e.message||"Failed to load dashboard stats.","error")}}async function z(t=!1){const e=document.getElementById("exam-list");if(e)try{const a=await d("/exams/");if(e.innerHTML="",!a.length){e.innerHTML=$("EX","No exams yet",x()?"Create your first exam or wait for a collaborator to assign one.":"Assigned exams will appear here when they are ready.");return}a.forEach((s,n)=>{var r,m,p,v,y,S;const l=document.createElement("div");l.className="card card-interactive exam-card animate-in",l.style.animationDelay=`${n*45}ms`;const i=x()?`
                    <span>${((r=s.teacher_assignments)==null?void 0:r.length)||0} teachers</span>
                    <span>${((m=s.assignments)==null?void 0:m.length)||0} students</span>
                `:`<span>${((p=s.questions)==null?void 0:p.length)||0} questions</span>`;l.innerHTML=`
                <div class="exam-card-header">
                    <div>
                        <h3>${c(s.title)}</h3>
                        <p class="helper-text">${c(s.instructions||"No instructions added yet.")}</p>
                    </div>
                    <span class="badge ${N(s.status)}">${c(s.status)}</span>
                </div>
                <div class="exam-card-meta">
                    <span>${s.duration_minutes} min</span>
                    <span>${((v=s.questions)==null?void 0:v.length)||0} questions</span>
                    ${i}
                </div>
                ${x()?`
                            <div class="helper-text">
                                Created by ${c(((y=s.creator)==null?void 0:y.name)||((S=s.creator)==null?void 0:S.email)||"Team")}
                            </div>
                        `:""}
                <div class="exam-card-actions">
                    ${x()?`
                                <div class="flex gap-xs">
                                    <button class="icon-btn edit-exam" data-id="${s.id}" title="Edit exam">✎</button>
                                    <button class="icon-btn detail-exam" data-id="${s.id}" title="Open details">⋯</button>
                                    <button class="icon-btn danger delete-exam" data-id="${s.id}" title="Delete exam">×</button>
                                </div>
                            `:'<div class="helper-text">Assigned exam</div>'}
                    <button class="btn btn-primary btn-sm start-btn" data-id="${s.id}">
                        ${h.role==="student"?"Start exam":"View details"}
                    </button>
                </div>
            `,e.appendChild(l)}),ge()}catch(a){t||o(a.message||"Unable to load exams.","error"),e.innerHTML.trim()||(e.innerHTML=$("!","Unable to load exams",a.message||"Please try again in a moment."))}}function ge(){document.querySelectorAll(".start-btn").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(e){if(h.role==="student"){try{const a=await d(`/attempts/${e}/start`,{method:"POST"});window.location.href=`/exam.html?attempt_id=${a.id}`}catch(a){o(a.message,"error")}return}await _(Number.parseInt(e,10))}})}),document.querySelectorAll(".edit-exam").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(e)try{const a=await d(`/exams/${e}`);X(a)}catch(a){o(a.message,"error")}})}),document.querySelectorAll(".delete-exam").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(!(!e||!window.confirm("Delete this exam?")))try{await d(`/exams/${e}`,{method:"DELETE"}),o("Exam deleted.","success"),await C(!0)}catch(a){o(a.message,"error")}})}),document.querySelectorAll(".detail-exam").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.id;e&&_(Number.parseInt(e,10))})})}function X(t){var r;F=t?t.id:null;const e=document.getElementById("exam-modal-title"),a=document.getElementById("exam-submit-btn"),s=document.getElementById("exam-title"),n=document.getElementById("exam-instructions"),l=document.getElementById("exam-duration"),i=document.getElementById("exam-status");e&&(e.textContent=t?"Edit Exam":"Create Exam"),a&&(a.textContent=t?"Save Changes":"Create Exam"),s&&(s.value=(t==null?void 0:t.title)||""),n&&(n.value=(t==null?void 0:t.instructions)||""),l&&(l.value=((r=t==null?void 0:t.duration_minutes)==null?void 0:r.toString())||"60"),i&&(i.value=(t==null?void 0:t.status)||"DRAFT"),M("exam-modal")}async function he(t){t.preventDefault();const e={title:document.getElementById("exam-title").value,instructions:document.getElementById("exam-instructions").value,duration_minutes:Number.parseInt(document.getElementById("exam-duration").value,10),status:document.getElementById("exam-status").value};try{F?(await d(`/exams/${F}`,{method:"PUT",body:JSON.stringify(e)}),o("Exam updated.","success")):(await d("/exams/",{method:"POST",body:JSON.stringify(e)}),o("Exam created.","success")),q("exam-modal"),await C(!0)}catch(a){o(a.message,"error")}}function ye(t,e){return e.length?e.map(a=>{var s,n,l;return`
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <span class="text-sm">${c(a.prompt.substring(0,110))}</span>
                        <span class="helper-text">
                            ${c(((s=a.folder)==null?void 0:s.name)||"Unfiled")} • ${c(((n=a.owner)==null?void 0:n.name)||((l=a.owner)==null?void 0:l.email)||"Shared bank")}
                        </span>
                    </div>
                    <button class="btn btn-primary btn-sm add-q-to-exam" data-exam="${t}" data-qid="${a.id}">
                        Add
                    </button>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No additional accessible questions available.</p>'}function V(t,e,a){return t.length?`
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
                                <strong>${c(s.name||s.email)}</strong>
                                <p class="helper-text">${c(s.email)}</p>
                            </div>
                        </label>
                    `).join("")}
        </div>
    `:`<p class="text-sm text-muted">No ${a}s available.</p>`}function fe(t){var e;return(e=t.questions)!=null&&e.length?t.questions.map(a=>{var n;const s=a.question||a;return`
                <div class="detail-row">
                    <div class="flex flex-col gap-xs">
                        <div class="flex items-center gap-sm">
                            <span class="badge badge-info">${s.type||"MCQ"}</span>
                            <span class="chip">${s.marks||1} marks</span>
                            ${(n=s.folder)!=null&&n.name?`<span class="chip">${c(s.folder.name)}</span>`:""}
                        </div>
                        <span class="text-sm">${c((s.prompt||"").substring(0,110))}</span>
                    </div>
                    <button class="icon-btn danger remove-q" data-exam="${t.id}" data-qid="${a.question_id}" title="Remove question">
                        ×
                    </button>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No questions added yet.</p>'}function be(t){return t.length?`
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
                                <td class="table-primary">${c(((a=e.student)==null?void 0:a.name)||((s=e.student)==null?void 0:s.email)||`Student #${e.student_id}`)}</td>
                                <td><span class="badge ${N(e.status)}">${e.status}</span></td>
                                <td class="text-sm">${new Date(e.started_at).toLocaleString()}</td>
                                <td>
                                    ${e.result?`${e.result.total_score}/${e.result.max_score}`:"—"}
                                </td>
                                <td>
                                    <div class="flex gap-xs">
                                        ${e.status==="SUBMITTED"?`<button class="btn btn-sm btn-success evaluate-btn" data-id="${e.id}">Evaluate</button>`:""}
                                        ${e.status==="SUBMITTED"||e.status==="EVALUATED"?`<a class="btn btn-ghost btn-sm" href="/result.html?attempt_id=${e.id}">Open report</a>`:'<span class="text-sm text-muted">In progress</span>'}
                                    </div>
                                </td>
                            </tr>
                        `}).join("")}
            </tbody>
        </table>
    `:$("AT","No attempts yet","Attempts will appear here once students start.")}async function _(t,e={}){var n,l;const{keepOpen:a=!1,silent:s=!1}=e;try{P=t;const i=d(`/exams/${t}`),r=d("/exams/questions").catch(()=>[]),m=d(`/attempts/exam/${t}`).catch(()=>[]),p=d("/users/?role=examiner").catch(()=>[]),v=d("/users/?role=student").catch(()=>[]),[y,S,T,Z,ee]=await Promise.all([i,r,m,p,v]),E=document.getElementById("exam-detail-content"),U=document.getElementById("exam-detail-title");if(!E||!U)return;U.textContent=y.title;const te=new Set((y.teacher_assignments||[]).map(u=>u.teacher_id)),ae=new Set((y.assignments||[]).map(u=>u.student_id)),se=(y.questions||[]).map(u=>u.question_id),ne=S.filter(u=>!se.includes(u.id));E.innerHTML=`
            <div class="tabs">
                <button class="tab active" data-tab="questions">Questions (${((n=y.questions)==null?void 0:n.length)||0})</button>
                <button class="tab" data-tab="attempts">Attempts (${T.length})</button>
                <button class="tab" data-tab="assign">Assignments</button>
            </div>

            <div id="tab-questions">
                ${fe(y)}
                <div class="detail-divider"></div>
                <div class="section-title mb-1">Add From Question Bank</div>
                ${ye(t,ne)}
            </div>

            <div id="tab-attempts" class="hidden">
                ${be(T)}
            </div>

            <div id="tab-assign" class="hidden">
                <div class="stack-list">
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Teachers</div>
                        <p class="helper-text mb-2">
                            Assigned teachers can see this exam, manage questions, and review attempts.
                        </p>
                        ${V(Z,te,"teacher")}
                    </div>
                    <div class="card" style="padding: 1rem;">
                        <div class="section-title mb-1">Students</div>
                        <p class="helper-text mb-2">
                            Assigned students will see the exam on their dashboard once it becomes available.
                        </p>
                        ${V(ee,ae,"student")}
                    </div>
                    <div class="flex items-center justify-between gap-sm">
                        <p class="helper-text">Question folders used in this exam will be shared to assigned teachers automatically.</p>
                        <button class="btn btn-primary" id="assign-btn">Save assignments</button>
                    </div>
                </div>
            </div>
        `,E.querySelectorAll(".tab").forEach(u=>{u.addEventListener("click",()=>{E.querySelectorAll(".tab").forEach(g=>g.classList.remove("active")),u.classList.add("active");const b=u.dataset.tab;["questions","attempts","assign"].forEach(g=>{var B;(B=E.querySelector(`#tab-${g}`))==null||B.classList.toggle("hidden",g!==b)})})}),E.querySelectorAll(".add-q-to-exam").forEach(u=>{u.addEventListener("click",async()=>{const b=u.dataset.exam,g=u.dataset.qid;if(!(!b||!g))try{await d(`/exams/${b}/questions/${g}`,{method:"POST"}),o("Question added to exam.","success"),await _(t,{keepOpen:!0}),await L(!0)}catch(B){o(B.message,"error")}})}),E.querySelectorAll(".remove-q").forEach(u=>{u.addEventListener("click",async()=>{const b=u.dataset.exam,g=u.dataset.qid;if(!(!b||!g))try{await d(`/exams/${b}/questions/${g}`,{method:"DELETE"}),o("Question removed from exam.","success"),await _(t,{keepOpen:!0})}catch(B){o(B.message,"error")}})}),E.querySelectorAll(".evaluate-btn").forEach(u=>{u.addEventListener("click",async()=>{const b=u.dataset.id;if(b)try{const g=await d(`/attempts/${b}/evaluate`,{method:"POST"});o(`Evaluated: ${g.score}/${g.max_score}`,"success"),await _(t,{keepOpen:!0})}catch(g){o(g.message,"error")}})}),(l=E.querySelector("#assign-btn"))==null||l.addEventListener("click",async()=>{const u=Array.from(E.querySelectorAll(".assign-teacher:checked")).map(g=>Number.parseInt(g.value,10)),b=Array.from(E.querySelectorAll(".assign-student:checked")).map(g=>Number.parseInt(g.value,10));try{await d(`/exams/${t}/assign`,{method:"POST",body:JSON.stringify({teacher_ids:u,student_ids:b})}),o("Assignments updated.","success"),await _(t,{keepOpen:!0}),await z(!0)}catch(g){o(g.message,"error")}}),a||M("exam-detail-modal")}catch(i){s||o(i.message,"error")}}async function O(t=!1){const e=document.getElementById("users-tbody");if(e)try{const a=await d("/users/");e.innerHTML=a.map(s=>`
                    <tr>
                        <td class="table-primary">${c(s.name||"—")}</td>
                        <td>${c(s.email)}</td>
                        <td>
                            <span class="badge ${s.role==="admin"?"badge-danger":s.role==="examiner"?"badge-warning":"badge-info"}">${s.role}</span>
                        </td>
                        <td>
                            <span class="badge ${s.is_active?"badge-success":"badge-danger"}">
                                ${s.is_active?"Active":"Inactive"}
                            </span>
                        </td>
                        <td style="text-align: right;">
                            <div class="flex gap-xs" style="justify-content: flex-end;">
                                <button class="icon-btn edit-user" data-id="${s.id}" data-name="${encodeURIComponent(s.name||"")}" data-email="${encodeURIComponent(s.email)}" data-role="${s.role}" title="Edit user">
                                    ✎
                                </button>
                                ${s.id!==h.id?`<button class="icon-btn danger delete-user" data-id="${s.id}" title="Delete user">×</button>`:""}
                            </div>
                        </td>
                    </tr>
                `).join(""),$e()}catch(a){t||o(a.message,"error")}}function $e(){document.querySelectorAll(".edit-user").forEach(t=>{t.addEventListener("click",()=>{W({id:Number.parseInt(t.dataset.id||"",10),name:decodeURIComponent(t.dataset.name||""),email:decodeURIComponent(t.dataset.email||""),role:t.dataset.role})})}),document.querySelectorAll(".delete-user").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(!(!e||!window.confirm("Delete this user?")))try{await d(`/users/${e}`,{method:"DELETE"}),o("User deleted.","success"),await O(!0),await H(!0)}catch(a){o(a.message,"error")}})})}function W(t){Q=t?t.id:null;const e=document.getElementById("user-modal-title"),a=document.getElementById("user-submit-btn"),s=document.getElementById("user-name-input"),n=document.getElementById("user-email-input"),l=document.getElementById("user-password-input"),i=document.getElementById("user-role-input");e&&(e.textContent=t?"Edit User":"Add User"),a&&(a.textContent=t?"Save Changes":"Add User"),s&&(s.value=(t==null?void 0:t.name)||""),n&&(n.value=(t==null?void 0:t.email)||""),l&&(l.value="",l.required=!t),i&&(i.value=(t==null?void 0:t.role)||"student"),M("user-modal")}async function Ee(t){t.preventDefault();const e={name:document.getElementById("user-name-input").value,email:document.getElementById("user-email-input").value,role:document.getElementById("user-role-input").value},a=document.getElementById("user-password-input").value;a&&(e.password=a);try{if(Q)await d(`/users/${Q}`,{method:"PUT",body:JSON.stringify(e)}),o("User updated.","success");else{if(!a){o("Password required for a new user.","warning");return}await d("/users/",{method:"POST",body:JSON.stringify(e)}),o("User created.","success")}q("user-modal"),await O(!0),await H(!0)}catch(s){o(s.message,"error")}}async function Y(){return x()?(w=await d("/exams/question-folders"),k&&!w.some(t=>t.id===k)&&(k=null),w):[]}function G(){const t=document.getElementById("q-folder");t&&(t.innerHTML=w.map(e=>`
                <option value="${e.id}">
                    ${e.name}${e.access_level==="shared"?" (Shared)":""}
                </option>
            `).join(""),w.length||(t.innerHTML='<option value="">Create a folder first</option>'))}function xe(){const t=document.getElementById("question-folder-toolbar");if(t){if(!w.length){t.innerHTML=$("FD","No folders yet","Create your first question folder to organize a personal or shared question bank.");return}t.innerHTML=`
        <div class="card" style="padding: 1rem;">
            <div class="section-title mb-1">Folder Filter</div>
            <div class="flex gap-xs" style="flex-wrap: wrap;">
                <button class="btn btn-sm ${k===null?"btn-primary":"btn-ghost"} folder-filter" data-folder="">
                    All folders
                </button>
                ${w.map(e=>`
                            <button
                                class="btn btn-sm ${k===e.id?"btn-primary":"btn-ghost"} folder-filter"
                                data-folder="${e.id}"
                            >
                                ${c(e.name)}
                                ${e.access_level==="shared"?" • Shared":""}
                            </button>
                        `).join("")}
            </div>
        </div>
    `,t.querySelectorAll(".folder-filter").forEach(e=>{e.addEventListener("click",async()=>{const a=e.dataset.folder;k=a&&a.trim()?Number.parseInt(a,10):null,await L(!0)})})}}async function L(t=!1){const e=document.getElementById("questions-list");if(e)try{await Y(),xe(),G();const a=k?`?folder_id=${k}`:"",s=await d(`/exams/questions${a}`);if(!s.length){e.innerHTML=$("QB","No questions yet","Build your question bank here for reuse across exams and collaborator assignments.");return}e.innerHTML=s.map((n,l)=>{var i,r,m,p,v;return`
                    <div class="card question-card animate-in" style="animation-delay: ${l*35}ms;">
                        <div class="question-card-header">
                            <div class="flex items-center gap-sm">
                                <span class="badge ${n.type==="MCQ"?"badge-primary":"badge-purple"}">${n.type}</span>
                                <span class="chip">${n.marks} marks</span>
                                ${(i=n.folder)!=null&&i.name?`<span class="chip">${c(n.folder.name)}</span>`:""}
                            </div>
                            <button class="icon-btn danger delete-question" data-id="${n.id}" title="Delete question">×</button>
                        </div>
                        <p class="text-sm">${c(n.prompt)}</p>
                        ${(r=n.options)!=null&&r.length?`
                                    <div class="flex gap-xs mt-2" style="flex-wrap: wrap;">
                                        ${n.options.map(y=>`<span class="chip">${c(y)}</span>`).join("")}
                                    </div>
                                `:""}
                        <p class="helper-text mt-2">
                            ${c(((m=n.owner)==null?void 0:m.name)||((p=n.owner)==null?void 0:p.email)||"Personal bank")}
                            ${((v=n.folder)==null?void 0:v.access_level)==="shared"?" • Shared to you through a collaborator folder":""}
                        </p>
                    </div>
                `}).join(""),document.querySelectorAll(".delete-question").forEach(n=>{n.addEventListener("click",async()=>{const l=n.dataset.id;if(!(!l||!window.confirm("Delete this question?")))try{await d(`/exams/questions/${l}`,{method:"DELETE"}),o("Question deleted.","success"),await L(!0)}catch(i){o(i.message,"error")}})})}catch(a){t||o(a.message,"error"),e.innerHTML=$("!","Question bank unavailable",a.message||"Please try again in a moment.")}}function K(){const t=document.getElementById("folder-modal-title"),e=document.getElementById("folder-submit-btn"),a=document.getElementById("folder-name"),s=document.getElementById("folder-description");t&&(t.textContent="Create Folder"),e&&(e.textContent="Create Folder"),a&&(a.value=""),s&&(s.value=""),M("folder-modal")}async function we(t){t.preventDefault();const e={name:document.getElementById("folder-name").value,description:document.getElementById("folder-description").value};try{await d("/exams/question-folders",{method:"POST",body:JSON.stringify(e)}),o("Folder created.","success"),q("folder-modal"),await L(!0)}catch(a){o(a.message,"error")}}async function ke(){var r;if(await Y(),!w.length){o("Create a question folder before adding questions.","warning"),K();return}G();const t=document.getElementById("question-modal-title"),e=document.getElementById("q-type"),a=document.getElementById("q-prompt"),s=document.getElementById("q-marks"),n=document.getElementById("q-correct"),l=document.getElementById("q-folder");if(t&&(t.textContent="Add Question"),e&&(e.value="MCQ"),a&&(a.value=""),s&&(s.value="1"),n&&(n.value=""),l){const m=k||((r=w[0])==null?void 0:r.id);l.value=m?m.toString():""}document.querySelectorAll(".mcq-option").forEach(m=>{m.value=""});const i=document.getElementById("mcq-options-section");i&&(i.style.display="block"),M("question-modal")}async function Ie(t){t.preventDefault();const e=document.getElementById("q-type").value,a=Number.parseInt(document.getElementById("q-folder").value,10),s={type:e,prompt:document.getElementById("q-prompt").value,marks:Number.parseInt(document.getElementById("q-marks").value,10),folder_id:Number.isNaN(a)?void 0:a};e==="MCQ"&&(s.options=Array.from(document.querySelectorAll(".mcq-option")).map(n=>n.value.trim()).filter(Boolean),s.correct_option=document.getElementById("q-correct").value);try{await d("/exams/questions",{method:"POST",body:JSON.stringify(s)}),o("Question created.","success"),q("question-modal"),await L(!0)}catch(n){o(n.message,"error")}}function Se(t){const e=(t==null?void 0:t.overview)||{};return`
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
                    <strong class="report-kpi-value">${f(e.average_percentage)}</strong>
                    <span class="report-kpi-note">Best ${f(e.best_percentage)}</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Integrity Flags</span>
                    <strong class="report-kpi-value">${e.total_flags||0}</strong>
                    <span class="report-kpi-note">Across all attempts</span>
                </div>
            </div>
        </section>
    `}async function _e(t=!1){const e=document.getElementById("results-list"),a=document.getElementById("results-summary");if(!(!e||!a))try{const s=h.role==="student"?d("/reports/student/me").catch(()=>null):Promise.resolve(null),[n,l]=await Promise.all([d("/attempts/"),s]);a.innerHTML=l?Se(l):"";const i=n.filter(r=>r.status==="SUBMITTED"||r.status==="EVALUATED");if(!i.length){e.innerHTML=$("RS","No results yet","Completed exam attempts will show up here.");return}e.innerHTML=i.map((r,m)=>{var p,v;return`
                    <div class="card card-interactive exam-card animate-in result-entry" data-attempt-id="${r.id}" style="cursor: pointer; animation-delay: ${m*35}ms;">
                        <div class="exam-card-header">
                            <div>
                                <h3>${h.role==="student"?`Attempt #${r.id}`:c(((p=r.student)==null?void 0:p.name)||((v=r.student)==null?void 0:v.email)||`Attempt #${r.id}`)}</h3>
                                <p class="helper-text">
                                    Exam #${r.exam_id}
                                    ${r.result?` • Score ${r.result.total_score}/${r.result.max_score}`:""}
                                </p>
                            </div>
                            <span class="badge ${N(r.status)}">${r.status}</span>
                        </div>
                        <div class="exam-card-meta">
                            <span>${new Date(r.started_at).toLocaleString()}</span>
                            <span>Open analytics</span>
                        </div>
                    </div>
                `}).join(""),document.querySelectorAll(".result-entry").forEach(r=>{r.addEventListener("click",()=>{const m=r.dataset.attemptId;m&&(window.location.href=`/result.html?attempt_id=${m}`)})})}catch(s){t||o(s.message,"error"),e.innerHTML=$("!","Results unavailable",s.message||"Please try again in a moment.")}}function f(t){return`${(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}%`}function j(t){return(Number.isFinite(t)?Number(t):0).toFixed(1).replace(/\.0$/,"")}function I(t,e="blue",a="No data yet."){if(!t.length||t.every(n=>n.count===0))return`<p class="helper-text">${a}</p>`;const s=Math.max(...t.map(n=>n.count),1);return`
        <div class="report-bars">
            ${t.map(n=>`
                        <div class="report-bar-row">
                            <div class="report-bar-head">
                                <span>${c(n.label)}</span>
                                <span>${n.count}</span>
                            </div>
                            <div class="report-bar-track">
                                <div class="report-bar-fill ${e}" style="width: ${n.count/s*100}%"></div>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `}function R(t,e,a,s){const n=Math.max(0,Math.min(100,Number.isFinite(e)?Number(e):0));return`
        <div class="report-donut-card">
            <div class="report-donut ${s}" style="--value:${n}">
                <span>${f(n)}</span>
            </div>
            <h4>${c(t)}</h4>
            <p>${c(a)}</p>
        </div>
    `}function qe(t){if(!t.length)return'<p class="helper-text">No recent activity yet.</p>';const e=Math.max(...t.flatMap(a=>[a.started,a.submitted,a.evaluated]),1);return`
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
                            <span class="timeline-day-label">${c(a.label)}</span>
                        </div>
                    `).join("")}
        </div>
    `}function Be(t){return t.length?`
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
                                <td class="table-primary">${c(e.title)}</td>
                                <td>${e.attempt_count}</td>
                                <td>${f(e.completion_rate)}</td>
                                <td>${f(e.average_percentage)}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">No exam analytics available yet.</p>'}function Ae(t){return t.length?`
        <div class="insight-list">
            ${t.slice(0,4).map(e=>`
                        <div class="insight-item">
                            <div class="insight-item-head">
                                <span class="badge ${e.type==="MCQ"?"badge-primary":"badge-purple"}">${e.type}</span>
                                <span class="chip">${c(e.difficulty)}</span>
                            </div>
                            <p class="text-sm">${c(e.prompt)}</p>
                            <div class="insight-item-meta">
                                <span>Response ${f(e.response_rate)}</span>
                                ${e.type==="MCQ"?`<span>Correct ${f(e.correct_rate)}</span>`:`<span>Avg marks ${j(e.average_awarded_marks)}/${j(e.marks)}</span>`}
                                <span>Blank ${e.blank_count}</span>
                            </div>
                        </div>
                    `).join("")}
        </div>
    `:'<p class="helper-text">Question-level analytics will appear after candidates start submitting.</p>'}function Le(t){return t.length?`
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
                                <td class="table-primary">${c(e.student_name)}</td>
                                <td><span class="badge ${N(e.status)}">${c(e.status)}</span></td>
                                <td>${e.percentage!==null?f(e.percentage):"—"}</td>
                                <td>${e.violations}</td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:'<p class="helper-text">Leaderboard data appears after attempts are submitted.</p>'}function Te(t){return I(t,"blue","No delivery funnel data yet.")}function Ne(t){const e=t.overview||t;return`
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
                    <strong class="report-kpi-value">${f(e.average_percentage)}</strong>
                    <span class="report-kpi-note">${e.evaluated_attempts} evaluated attempts</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${f(e.participation_rate)}</strong>
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
    `}function Me(t){const e=t.overview||t;return`
        <section class="report-grid">
            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Delivery Health</h4>
                        <p class="report-panel-copy">Participation, quality, and active exam mix.</p>
                    </div>
                </div>
                <div class="report-visual-grid">
                    ${R("Participation rate",e.participation_rate,`${e.total_attempts} total attempts`,"blue")}
                    ${R("Average score",e.average_percentage,`${e.evaluated_attempts} evaluated`,"green")}
                    ${R("High-risk share",e.total_attempts?e.high_risk_attempts/e.total_attempts*100:0,`${e.high_risk_attempts} flagged attempts`,"rose")}
                </div>
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Exam Status Mix</h4>
                        <p class="report-panel-copy">How the current exam portfolio is distributed.</p>
                    </div>
                </div>
                ${I(t.exam_status_breakdown||[],"amber","No exam status data yet.")}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Attempt Flow</h4>
                        <p class="report-panel-copy">Current candidate progress through the lifecycle.</p>
                    </div>
                </div>
                ${I(t.attempt_status_breakdown||[],"green","No attempt data yet.")}
            </article>

            <article class="card report-panel">
                <div class="report-panel-header">
                    <div>
                        <h4 class="report-panel-title">Recent Activity</h4>
                        <p class="report-panel-copy">Started, submitted, and evaluated attempts over the last 7 days.</p>
                    </div>
                </div>
                ${qe(t.activity_timeline||[])}
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
                        ${I(t.integrity_breakdown||[],"rose","No integrity events recorded.")}
                    </div>
                    <div>
                        <span class="section-title">Risk Bands</span>
                        ${I(t.risk_distribution||[],"amber","No risk distribution yet.")}
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
                ${Be(t.top_exams||[])}
            </article>
        </section>
    `}function Ce(t,e){const a=t.overview||{},s=t.exam||{};return`
        <article class="card report-exam-card animate-in" style="animation-delay:${e*45}ms;">
            <div class="report-panel-header">
                <div>
                    <span class="section-title">Exam Analytics</span>
                    <h3 class="card-title">${c(s.title||"Exam")}</h3>
                    <p class="report-panel-copy">
                        ${s.question_count||0} questions • ${s.duration_minutes||0} minutes • ${s.assigned_students||0} assigned students • ${s.teacher_count||0} teachers
                    </p>
                </div>
                <div class="flex items-center gap-sm">
                    <span class="badge ${N(s.status||"DRAFT")}">${c(s.status||"DRAFT")}</span>
                    <span class="chip">${s.start_time?new Date(s.start_time).toLocaleString():"No start time"}</span>
                </div>
            </div>

            <div class="report-kpi-grid compact">
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Participation</span>
                    <strong class="report-kpi-value">${f(a.participation_rate)}</strong>
                    <span class="report-kpi-note">${a.attempt_count||0} started</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Completion</span>
                    <strong class="report-kpi-value">${f(a.completion_rate)}</strong>
                    <span class="report-kpi-note">${a.submitted_count||0} submitted</span>
                </div>
                <div class="report-kpi-card">
                    <span class="report-kpi-label">Average Score</span>
                    <strong class="report-kpi-value">${f(a.average_percentage)}</strong>
                    <span class="report-kpi-note">Median ${f(a.median_percentage)}</span>
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
                    ${Te(t.progress_funnel||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Score Distribution</h4>
                        <p class="report-panel-copy">Percentage score bands for evaluated attempts.</p>
                    </div>
                    ${I(t.score_distribution||[],"green","No evaluated scores yet.")}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Question Insights</h4>
                        <p class="report-panel-copy">Hardest or lowest-response questions first.</p>
                    </div>
                    ${Ae(t.question_insights||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Leaderboard</h4>
                        <p class="report-panel-copy">Top evaluated candidates with flag counts.</p>
                    </div>
                    ${Le(t.leaderboard||[])}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Integrity Breakdown</h4>
                        <p class="report-panel-copy">What kind of proctoring events were recorded.</p>
                    </div>
                    ${I(t.proctoring_breakdown||[],"rose","No proctoring events recorded.")}
                </section>

                <section class="report-subpanel">
                    <div class="report-subpanel-header">
                        <h4 class="report-panel-title">Risk Distribution</h4>
                        <p class="report-panel-copy">Clean, flagged, and high-risk attempt mix.</p>
                    </div>
                    ${I(t.risk_distribution||[],"amber","No risk signals yet.")}
                </section>
            </div>
        </article>
    `}async function Pe(t=!1){const e=document.getElementById("reports-content");if(e)try{const[a,s]=await Promise.all([d("/reports/dashboard"),d("/exams/")]);if(!s.length&&!(a.top_exams||[]).length){e.innerHTML=$("RP","No report data","Reports will appear once exams and attempts exist.");return}const l=(await Promise.all(s.map(async i=>{try{return await d(`/reports/exam/${i.id}/analytics`)}catch{return null}}))).filter(Boolean);l.sort((i,r)=>{var v,y,S,T;const m=((v=i==null?void 0:i.overview)==null?void 0:v.attempt_count)||0,p=((y=r==null?void 0:r.overview)==null?void 0:y.attempt_count)||0;return m!==p?p-m:String(((S=i==null?void 0:i.exam)==null?void 0:S.title)||"").localeCompare(String(((T=r==null?void 0:r.exam)==null?void 0:T.title)||""))}),e.innerHTML=`
            <div class="reports-shell">
                ${Ne(a)}
                ${Me(a)}
                <section class="stack-list">
                    ${l.length?l.map((i,r)=>Ce(i,r)).join(""):$("RP","Per-exam analytics unavailable","The dashboard summary loaded, but detailed exam analytics could not be generated right now.")}
                </section>
            </div>
        `}catch(a){t||o(a.message,"error"),e.innerHTML=$("!","Reports unavailable",a.message||"Please try again in a moment.")}}ve();
