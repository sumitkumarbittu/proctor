import{r as M,a as d,g as D,e as y,b as $}from"./utils-CF-FJpsQ.js";import{a as r}from"./api-eNSiWK_x.js";let v=null,I=null,B=null;const U=["exams","results","users","questions","reports"];function g(t,e,a){return`
        <div class="empty-state">
            <div class="empty-state-icon">${t}</div>
            <div class="empty-state-title">${e}</div>
            <div class="empty-state-desc">${a}</div>
        </div>
    `}function A(){const t=Array.from(document.querySelectorAll(".modal-overlay")).some(e=>e.classList.contains("active"));document.body.classList.toggle("modal-open",t)}async function N(){var t,e,a;(t=document.getElementById("logout-btn"))==null||t.addEventListener("click",()=>{M(),window.location.href="/"});try{v=await r("/users/me"),C(),_(),P(),(v.role==="admin"||v.role==="examiner")&&((e=document.getElementById("admin-nav"))==null||e.classList.remove("hidden"),(a=document.getElementById("admin-controls"))==null||a.classList.remove("hidden"),x()),await w()}catch(s){d(s.message||"Failed to load the dashboard.","error");const n=document.getElementById("exam-list");n&&(n.innerHTML=g("!","Unable to load dashboard","Please refresh the page or try again in a moment."))}}function C(){const t=v.name||v.email,e=document.getElementById("user-name"),a=document.getElementById("user-role"),s=document.getElementById("user-avatar");e&&(e.textContent=t),a&&(a.textContent=v.role),s&&(s.textContent=D(v.name,v.email))}function _(){document.querySelectorAll(".nav-link[data-view]").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const a=t.dataset.view;a&&Q(a)})})}function Q(t){document.querySelectorAll(".nav-link[data-view]").forEach(e=>{e.classList.toggle("active",e.dataset.view===t)}),U.forEach(e=>{var a;(a=document.getElementById(`view-${e}`))==null||a.classList.toggle("hidden",e!==t)}),t==="exams"&&w(),t==="results"&&z(),t==="users"&&L(),t==="questions"&&S(),t==="reports"&&G()}function P(){var t,e,a,s,n,i,l;document.querySelectorAll("[data-close-modal]").forEach(m=>{m.addEventListener("click",()=>{const p=m.dataset.closeModal;p&&h(p)})}),document.querySelectorAll(".modal-overlay").forEach(m=>{m.addEventListener("click",p=>{p.target===m&&h(m.id)})}),document.addEventListener("keydown",m=>{m.key==="Escape"&&document.querySelectorAll(".modal-overlay.active").forEach(p=>{h(p.id)})}),(t=document.getElementById("create-exam-btn"))==null||t.addEventListener("click",()=>T()),(e=document.getElementById("create-user-btn"))==null||e.addEventListener("click",()=>k()),(a=document.getElementById("create-question-btn"))==null||a.addEventListener("click",()=>F()),(s=document.getElementById("exam-form"))==null||s.addEventListener("submit",R),(n=document.getElementById("user-form"))==null||n.addEventListener("submit",J),(i=document.getElementById("question-form"))==null||i.addEventListener("submit",X),(l=document.getElementById("q-type"))==null||l.addEventListener("change",m=>{const p=m.target.value,f=document.getElementById("mcq-options-section");f&&(f.style.display=p==="MCQ"?"block":"none")})}function q(t){var e;(e=document.getElementById(t))==null||e.classList.add("active"),A()}function h(t){var e;(e=document.getElementById(t))==null||e.classList.remove("active"),A()}async function x(){try{const t=await r("/reports/dashboard"),e=document.getElementById("stats-bar");if(!e)return;e.classList.remove("hidden"),e.innerHTML=`
            <div class="stat-card blue animate-in">
                <div class="stat-card-icon">EX</div>
                <div class="stat-card-value">${t.total_exams}</div>
                <div class="stat-card-label">Total Exams</div>
            </div>
            <div class="stat-card green animate-in" style="animation-delay: 40ms;">
                <div class="stat-card-icon">US</div>
                <div class="stat-card-value">${t.total_users}</div>
                <div class="stat-card-label">Users</div>
            </div>
            <div class="stat-card amber animate-in" style="animation-delay: 80ms;">
                <div class="stat-card-icon">AT</div>
                <div class="stat-card-value">${t.total_attempts}</div>
                <div class="stat-card-label">Attempts</div>
            </div>
            <div class="stat-card rose animate-in" style="animation-delay: 120ms;">
                <div class="stat-card-icon">RV</div>
                <div class="stat-card-value">${t.pending_evaluation}</div>
                <div class="stat-card-label">Pending Review</div>
            </div>
        `}catch{}}async function w(){const t=document.getElementById("exam-list");if(t)try{const e=await r("/exams/");if(t.innerHTML="",!e.length){t.innerHTML=g("EX","No exams yet","Create your first exam or wait for an assignment to appear here.");return}e.forEach((a,s)=>{var l;const n=document.createElement("div");n.className="card card-interactive exam-card animate-in",n.style.animationDelay=`${s*50}ms`;const i=v.role!=="student";n.innerHTML=`
                <div class="exam-card-header">
                    <div>
                        <h3>${y(a.title)}</h3>
                        <p class="helper-text">${y(a.instructions||"No instructions added yet.")}</p>
                    </div>
                    <span class="badge ${$(a.status)}">${a.status}</span>
                </div>
                <div class="exam-card-meta">
                    <span>${a.duration_minutes} min</span>
                    <span>${((l=a.questions)==null?void 0:l.length)||0} questions</span>
                </div>
                <div class="exam-card-actions">
                    ${i?`
                                <div class="flex gap-xs">
                                    <button class="icon-btn edit-exam" data-id="${a.id}" title="Edit exam">✎</button>
                                    <button class="icon-btn detail-exam" data-id="${a.id}" title="Open details">⋯</button>
                                    <button class="icon-btn danger delete-exam" data-id="${a.id}" title="Delete exam">×</button>
                                </div>
                            `:'<div class="helper-text">Assigned exam</div>'}
                    <button class="btn btn-primary btn-sm start-btn" data-id="${a.id}">
                        ${v.role==="student"?"Start exam":"View details"}
                    </button>
                </div>
            `,t.appendChild(n)}),H()}catch(e){t.innerHTML=g("!","Unable to load exams",e.message||"Please try again in a moment.")}}function H(){document.querySelectorAll(".start-btn").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(e){if(v.role==="student"){try{const a=await r(`/attempts/${e}/start`,{method:"POST"});window.location.href=`/exam.html?attempt_id=${a.id}`}catch(a){d(a.message,"error")}return}b(Number.parseInt(e,10))}})}),document.querySelectorAll(".edit-exam").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(e)try{const a=await r(`/exams/${e}`);T(a)}catch(a){d(a.message,"error")}})}),document.querySelectorAll(".delete-exam").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(!(!e||!window.confirm("Delete this exam?")))try{await r(`/exams/${e}`,{method:"DELETE"}),d("Exam deleted.","success"),await w(),await x()}catch(a){d(a.message,"error")}})}),document.querySelectorAll(".detail-exam").forEach(t=>{t.addEventListener("click",()=>{const e=t.dataset.id;e&&b(Number.parseInt(e,10))})})}function T(t){var m;I=t?t.id:null;const e=document.getElementById("exam-modal-title"),a=document.getElementById("exam-submit-btn"),s=document.getElementById("exam-title"),n=document.getElementById("exam-instructions"),i=document.getElementById("exam-duration"),l=document.getElementById("exam-status");e&&(e.textContent=t?"Edit Exam":"Create Exam"),a&&(a.textContent=t?"Save Changes":"Create Exam"),s&&(s.value=(t==null?void 0:t.title)||""),n&&(n.value=(t==null?void 0:t.instructions)||""),i&&(i.value=((m=t==null?void 0:t.duration_minutes)==null?void 0:m.toString())||"60"),l&&(l.value=(t==null?void 0:t.status)||"DRAFT"),q("exam-modal")}async function R(t){t.preventDefault();const e={title:document.getElementById("exam-title").value,instructions:document.getElementById("exam-instructions").value,duration_minutes:Number.parseInt(document.getElementById("exam-duration").value,10),status:document.getElementById("exam-status").value};try{I?(await r(`/exams/${I}`,{method:"PUT",body:JSON.stringify(e)}),d("Exam updated.","success")):(await r("/exams/",{method:"POST",body:JSON.stringify(e)}),d("Exam created.","success")),h("exam-modal"),await w(),await x()}catch(a){d(a.message,"error")}}async function b(t){var e;try{const[a,s,n]=await Promise.all([r(`/exams/${t}`),r("/exams/questions").catch(()=>[]),r(`/attempts/exam/${t}`).catch(()=>[])]),i=document.getElementById("exam-detail-content"),l=document.getElementById("exam-detail-title");if(!i||!l)return;l.textContent=a.title;const m=(a.questions||[]).map(o=>o.question_id),p=s.filter(o=>!m.includes(o.id));i.innerHTML=`
            <div class="tabs">
                <button class="tab active" data-tab="questions">Questions (${((e=a.questions)==null?void 0:e.length)||0})</button>
                <button class="tab" data-tab="attempts">Attempts (${n.length})</button>
                <button class="tab" data-tab="assign">Assign</button>
            </div>

            <div id="tab-questions">
                ${O(a)}
                <div class="detail-divider"></div>
                <div class="section-title mb-1">Add From Question Bank</div>
                ${p.length?p.map(o=>`
                                    <div class="detail-row">
                                        <span class="text-sm">${y(o.prompt.substring(0,90))}</span>
                                        <button class="btn btn-primary btn-sm add-q-to-exam" data-exam="${t}" data-qid="${o.id}">
                                            Add
                                        </button>
                                    </div>
                                `).join(""):'<p class="text-sm text-muted">No additional questions available.</p>'}
            </div>

            <div id="tab-attempts" class="hidden">${j(n)}</div>

            <div id="tab-assign" class="hidden">
                <p class="text-sm text-muted mb-2">Enter student IDs as a comma-separated list.</p>
                <div class="assign-row">
                    <input type="text" id="assign-ids" class="input" placeholder="1, 2, 3">
                    <button class="btn btn-primary" id="assign-btn">Assign</button>
                </div>
            </div>
        `,i.querySelectorAll(".tab").forEach(o=>{o.addEventListener("click",()=>{i.querySelectorAll(".tab").forEach(c=>c.classList.remove("active")),o.classList.add("active");const u=o.dataset.tab;["questions","attempts","assign"].forEach(c=>{var E;(E=document.getElementById(`tab-${c}`))==null||E.classList.toggle("hidden",c!==u)})})}),i.querySelectorAll(".add-q-to-exam").forEach(o=>{o.addEventListener("click",async()=>{const u=o.dataset.exam,c=o.dataset.qid;if(!(!u||!c))try{await r(`/exams/${u}/questions/${c}`,{method:"POST"}),d("Question added to exam.","success"),await b(t)}catch(E){d(E.message,"error")}})}),i.querySelectorAll(".remove-q").forEach(o=>{o.addEventListener("click",async()=>{const u=o.dataset.exam,c=o.dataset.qid;if(!(!u||!c))try{await r(`/exams/${u}/questions/${c}`,{method:"DELETE"}),d("Question removed from exam.","success"),await b(t)}catch(E){d(E.message,"error")}})}),i.querySelectorAll(".evaluate-btn").forEach(o=>{o.addEventListener("click",async()=>{const u=o.dataset.id;if(u)try{const c=await r(`/attempts/${u}/evaluate`,{method:"POST"});d(`Evaluated: ${c.score}/${c.max_score}`,"success"),await b(t)}catch(c){d(c.message,"error")}})});const f=i.querySelector("#assign-btn");f==null||f.addEventListener("click",async()=>{const o=i.querySelector("#assign-ids"),u=(o==null?void 0:o.value.split(",").map(c=>Number.parseInt(c.trim(),10)).filter(c=>!Number.isNaN(c)))||[];if(!u.length){d("Enter at least one valid student ID.","warning");return}try{await r(`/exams/${t}/assign`,{method:"POST",body:JSON.stringify({student_ids:u})}),d("Students assigned.","success")}catch(c){d(c.message,"error")}}),q("exam-detail-modal")}catch(a){d(a.message,"error")}}function O(t){var e;return(e=t.questions)!=null&&e.length?t.questions.map(a=>{const s=a.question||a;return`
                <div class="detail-row">
                    <div class="flex items-center gap-sm">
                        <span class="badge badge-info">${s.type||"MCQ"}</span>
                        <span class="text-sm">${y((s.prompt||"").substring(0,80))}</span>
                    </div>
                    <div class="flex items-center gap-sm">
                        <span class="chip">${s.marks||1} marks</span>
                        <button class="icon-btn danger remove-q" data-exam="${t.id}" data-qid="${a.question_id}" title="Remove question">
                            ×
                        </button>
                    </div>
                </div>
            `}).join(""):'<p class="text-sm text-muted">No questions added yet.</p>'}function j(t){return t.length?`
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${t.map(e=>`
                            <tr>
                                <td>#${e.id}</td>
                                <td><span class="badge ${$(e.status)}">${e.status}</span></td>
                                <td class="text-sm">${new Date(e.started_at).toLocaleString()}</td>
                                <td>
                                    ${e.status==="SUBMITTED"?`<button class="btn btn-sm btn-success evaluate-btn" data-id="${e.id}">Evaluate</button>`:e.status==="EVALUATED"?'<span class="text-sm text-muted">Done</span>':'<span class="text-sm text-muted">In progress</span>'}
                                </td>
                            </tr>
                        `).join("")}
            </tbody>
        </table>
    `:g("AT","No attempts yet","Attempts will appear here once students start.")}async function L(){const t=document.getElementById("users-tbody");if(t)try{const e=await r("/users/");t.innerHTML=e.map(a=>`
                    <tr>
                        <td class="table-primary">${y(a.name||"—")}</td>
                        <td>${y(a.email)}</td>
                        <td>
                            <span class="badge ${a.role==="admin"?"badge-danger":a.role==="examiner"?"badge-warning":"badge-info"}">${a.role}</span>
                        </td>
                        <td>
                            <span class="badge ${a.is_active?"badge-success":"badge-danger"}">
                                ${a.is_active?"Active":"Inactive"}
                            </span>
                        </td>
                        <td style="text-align: right;">
                            <div class="flex gap-xs" style="justify-content: flex-end;">
                                <button class="icon-btn edit-user" data-id="${a.id}" data-name="${encodeURIComponent(a.name||"")}" data-email="${encodeURIComponent(a.email)}" data-role="${a.role}" title="Edit user">
                                    ✎
                                </button>
                                ${a.id!==v.id?`<button class="icon-btn danger delete-user" data-id="${a.id}" title="Delete user">×</button>`:""}
                            </div>
                        </td>
                    </tr>
                `).join(""),V()}catch(e){d(e.message,"error")}}function V(){document.querySelectorAll(".edit-user").forEach(t=>{t.addEventListener("click",()=>{k({id:Number.parseInt(t.dataset.id||"",10),name:decodeURIComponent(t.dataset.name||""),email:decodeURIComponent(t.dataset.email||""),role:t.dataset.role})})}),document.querySelectorAll(".delete-user").forEach(t=>{t.addEventListener("click",async()=>{const e=t.dataset.id;if(!(!e||!window.confirm("Delete this user?")))try{await r(`/users/${e}`,{method:"DELETE"}),d("User deleted.","success"),await L(),await x()}catch(a){d(a.message,"error")}})})}function k(t){B=t?t.id:null;const e=document.getElementById("user-modal-title"),a=document.getElementById("user-submit-btn"),s=document.getElementById("user-name-input"),n=document.getElementById("user-email-input"),i=document.getElementById("user-password-input"),l=document.getElementById("user-role-input");e&&(e.textContent=t?"Edit User":"Add User"),a&&(a.textContent=t?"Save Changes":"Add User"),s&&(s.value=(t==null?void 0:t.name)||""),n&&(n.value=(t==null?void 0:t.email)||""),i&&(i.value="",i.required=!t),l&&(l.value=(t==null?void 0:t.role)||"student"),q("user-modal")}async function J(t){t.preventDefault();const e={name:document.getElementById("user-name-input").value,email:document.getElementById("user-email-input").value,role:document.getElementById("user-role-input").value},a=document.getElementById("user-password-input").value;a&&(e.password=a);try{if(B)await r(`/users/${B}`,{method:"PUT",body:JSON.stringify(e)}),d("User updated.","success");else{if(!a){d("Password required for a new user.","warning");return}await r("/users/",{method:"POST",body:JSON.stringify(e)}),d("User created.","success")}h("user-modal"),await L(),await x()}catch(s){d(s.message,"error")}}async function S(){const t=document.getElementById("questions-list");if(t)try{const e=await r("/exams/questions");if(!e.length){t.innerHTML=g("QB","No questions yet","Build your question bank here for reuse across exams.");return}t.innerHTML=e.map((a,s)=>{var n;return`
                    <div class="card question-card animate-in" style="animation-delay: ${s*40}ms;">
                        <div class="question-card-header">
                            <div class="flex items-center gap-sm">
                                <span class="badge ${a.type==="MCQ"?"badge-primary":"badge-purple"}">${a.type}</span>
                                <span class="chip">${a.marks} marks</span>
                            </div>
                            <button class="icon-btn danger delete-question" data-id="${a.id}" title="Delete question">×</button>
                        </div>
                        <p class="text-sm">${y(a.prompt)}</p>
                        ${(n=a.options)!=null&&n.length?`
                                    <div class="flex gap-xs mt-2" style="flex-wrap: wrap;">
                                        ${a.options.map(i=>`<span class="chip">${y(i)}</span>`).join("")}
                                    </div>
                                `:""}
                    </div>
                `}).join(""),document.querySelectorAll(".delete-question").forEach(a=>{a.addEventListener("click",async()=>{const s=a.dataset.id;if(!(!s||!window.confirm("Delete this question?")))try{await r(`/exams/questions/${s}`,{method:"DELETE"}),d("Question deleted.","success"),await S()}catch(n){d(n.message,"error")}})})}catch(e){d(e.message,"error")}}function F(){const t=document.getElementById("question-modal-title"),e=document.getElementById("q-type"),a=document.getElementById("q-prompt"),s=document.getElementById("q-marks"),n=document.getElementById("q-correct");t&&(t.textContent="Add Question"),e&&(e.value="MCQ"),a&&(a.value=""),s&&(s.value="1"),n&&(n.value=""),document.querySelectorAll(".mcq-option").forEach(l=>{l.value=""});const i=document.getElementById("mcq-options-section");i&&(i.style.display="block"),q("question-modal")}async function X(t){t.preventDefault();const e=document.getElementById("q-type").value,a={type:e,prompt:document.getElementById("q-prompt").value,marks:Number.parseInt(document.getElementById("q-marks").value,10)};e==="MCQ"&&(a.options=Array.from(document.querySelectorAll(".mcq-option")).map(s=>s.value.trim()).filter(Boolean),a.correct_option=document.getElementById("q-correct").value);try{await r("/exams/questions",{method:"POST",body:JSON.stringify(a)}),d("Question created.","success"),h("question-modal"),await S()}catch(s){d(s.message,"error")}}async function z(){const t=document.getElementById("results-list");if(t)try{const a=(await r("/attempts/")).filter(s=>s.status==="SUBMITTED"||s.status==="EVALUATED");if(!a.length){t.innerHTML=g("RS","No results yet","Completed exam attempts will show up here.");return}t.innerHTML=a.map((s,n)=>`
                    <div class="card card-interactive exam-card animate-in result-entry" data-attempt-id="${s.id}" style="cursor: pointer; animation-delay: ${n*40}ms;">
                        <div class="exam-card-header">
                            <div>
                                <h3>Attempt #${s.id}</h3>
                                <p class="helper-text">Exam #${s.exam_id}</p>
                            </div>
                            <span class="badge ${$(s.status)}">${s.status}</span>
                        </div>
                        <div class="exam-card-meta">
                            <span>${new Date(s.started_at).toLocaleDateString()}</span>
                            <span>Open result details</span>
                        </div>
                    </div>
                `).join(""),document.querySelectorAll(".result-entry").forEach(s=>{s.addEventListener("click",()=>{const n=s.dataset.attemptId;n&&(window.location.href=`/result.html?attempt_id=${n}`)})})}catch(e){d(e.message,"error")}}async function G(){const t=document.getElementById("reports-content");if(t)try{const e=await r("/exams/");if(!e.length){t.innerHTML=g("RP","No report data","Reports will appear once exams and attempts exist.");return}const s=(await Promise.all(e.map(async n=>{try{const i=await r(`/reports/exam/${n.id}/summary`);return{exam:n,report:i}}catch{return null}}))).filter(Boolean);if(!s.length){t.innerHTML=g("RP","Reports unavailable","Summary data could not be loaded right now.");return}t.innerHTML=s.map(({exam:n,report:i})=>`
                    <div class="card view-panel animate-in">
                        <div class="main-header">
                            <div class="flex flex-col gap-xs">
                                <span class="section-title">Summary</span>
                                <h3 class="card-title">${y(n.title)}</h3>
                            </div>
                            <span class="badge ${$(n.status)}">${n.status}</span>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-card blue">
                                <div class="stat-card-value">${i.total_attempts}</div>
                                <div class="stat-card-label">Attempts</div>
                            </div>
                            <div class="stat-card green">
                                <div class="stat-card-value">${i.average_score}</div>
                                <div class="stat-card-label">Average Score</div>
                            </div>
                            <div class="stat-card amber">
                                <div class="stat-card-value">${i.total_submitted}</div>
                                <div class="stat-card-label">Submitted</div>
                            </div>
                            <div class="stat-card rose">
                                <div class="stat-card-value">${i.total_proctoring_violations}</div>
                                <div class="stat-card-label">Violations</div>
                            </div>
                        </div>
                    </div>
                `).join("")}catch(e){d(e.message,"error")}}N();
