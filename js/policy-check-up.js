/* The Paper Policy Test — front-end logic.
   The score shown here is for instant feedback; the backend recomputes it
   authoritatively when the lead is submitted. */

/* ---- config ---- */
var API_BASE = 'https://paper-policy-test-96909904794.us-central1.run.app';
var BOOKING_URL = 'https://calendar.app.google/6T8zFUT9GmAKhNEDA';

/* ---------------- data ---------------- */
const STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

const MANDATES = {
  "Ohio":    {date:"July 1, 2026", note:"Every public, community, and STEM district must have an AI policy on the books."},
  "Tennessee":{date:"in effect since March 2024", note:"District-level AI policy is already legally required."}
};

const QUESTIONS = [
  {tag:"Discipline alignment", text:"Has your student code of conduct been updated to address AI — not just your board policy?",
   hint:"A board policy that the code of conduct doesn't reflect can't actually be enforced in a classroom.",
   fixT:"Update the student code of conduct to reference AI", fixF:"Discipline cases hinge on the code of conduct, not the board policy. If AI isn't named there, consequences are unenforceable.", pri:"high"},
  {tag:"Vendor & data privacy", text:"Have you executed data processing agreements with the AI vendors your staff and students already use?",
   hint:"FERPA and COPPA obligations attach whether or not a DPA exists. Most districts are already using tools they haven't papered.",
   fixT:"Execute DPAs for tools already in use", fixF:"This is the single highest-liability gap. An un-papered vendor handling student data is a FERPA exposure waiting to surface.", pri:"high"},
  {tag:"Professional learning", text:"Have teachers had professional development on what your AI policy actually allows and prohibits?",
   hint:"Without PD, teachers default to the most restrictive reading — or ignore the policy entirely.",
   fixT:"Run policy-specific PD for teaching staff", fixF:"A policy no one was trained on becomes shadow practice. Teachers either over-restrict or quietly ignore it.", pri:"high"},
  {tag:"Oversight & review", text:"Is there a named owner and a scheduled date to review and update the policy?",
   hint:"AI changes faster than the board calendar. A policy with no review date is frozen the day it's adopted.",
   fixT:"Assign an owner and set an annual review date", fixF:"Without a named owner and a date, the policy ages out silently and no one is accountable for fixing it.", pri:"med"},
  {tag:"Community legitimacy", text:"Did families, teachers, and students give input before the policy was adopted?",
   hint:"Policies adopted without input are the ones that draw organized parent and union pushback later.",
   fixT:"Document or backfill community input", fixF:"Skipped input is where post-adoption controversy comes from. Districts that engaged first weather criticism; those that didn't reopen the fight.", pri:"med"},
  {tag:"Classroom clarity", text:"Can a teacher tell a student what AI use is allowed on a specific assignment today?",
   hint:"This is the test of whether the policy reaches the only place that matters to a student.",
   fixT:"Give teachers assignment-level guidance (e.g. a traffic-light model)", fixF:"If the rule can't be stated per assignment, the policy isn't operating in classrooms — which is the whole point.", pri:"high"},
  {tag:"Role coverage", text:"Does your policy address staff and administrator AI use — not only students?",
   hint:"Much of the real data-privacy risk lives in staff use: HR, finance, performance documents.",
   fixT:"Add staff and administrator provisions", fixF:"Student-only policies miss where adults create the most exposure — admin use of AI for records, evaluations, and decisions.", pri:"med"},
  {tag:"Approved tools", text:"Do staff have an approved-tools list, so they know which AI tools are cleared to use?",
   hint:"Without an approved list, every teacher is making their own procurement and privacy decision.",
   fixT:"Publish an approved-tools catalog", fixF:"No list means uncontrolled tool sprawl — each unvetted tool is a separate privacy and equity decision made without oversight.", pri:"med"},
  {tag:"Special education", text:"Does your policy give specific guardrails for AI in special education (IEPs, 504 plans)?",
   hint:"AI touching IEP and 504 content is among the highest-stakes, most-prohibited uses nationally.",
   fixT:"Add explicit SpEd / IEP guardrails", fixF:"IEP and 504 work is legally sensitive. Most leading policies prohibit AI here outright — silence is a serious gap.", pri:"high"},
  {tag:"Incident readiness", text:"If a deepfake or AI-cheating incident hit next week, would staff know the response steps?",
   hint:"Incidents are what put AI policy on the front page. Knowing the steps in advance is the difference between a process and a scramble.",
   fixT:"Build a one-page AI incident response procedure", fixF:"Incidents are the moment the public judges your policy. Without a procedure, a single deepfake becomes a crisis instead of a process.", pri:"med"}
];

const ARCHETYPES = [
  {min:0,  max:25, name:"The Binder Policy",      tier:1, desc:"Your district did the hard part of adopting a policy — and then it went in a binder. On paper you're covered; in practice, almost none of it is operating yet. That's the most common place districts land, and the most fixable."},
  {min:26, max:50, name:"The Compliance Checkbox",tier:2, desc:"You've met the letter of the mandate, but the policy is living mostly in the document and not yet in classrooms, contracts, or conduct codes. You've cleared the bar that gets checked — not the one that protects you."},
  {min:51, max:75, name:"In Motion",              tier:3, desc:"Real implementation is underway — your policy is reaching some of the places that matter. A handful of specific gaps are now the difference between a policy that mostly works and one that fully holds up."},
  {min:76, max:100,name:"Living Policy",           tier:4, desc:"Your policy is doing what a policy is supposed to do: governing actual practice across classrooms, contracts, and conduct. You're in rare company. The work now is maintenance and the last few edges."}
];

/* ---------------- state ---------------- */
let st = { state:"", mandate:null, size:"", policy:"", answers:Array(QUESTIONS.length).fill(null), qi:0 };
const $ = (id) => document.getElementById(id);

/* ---------------- nav ---------------- */
function go(id){
  document.querySelectorAll('#ppt-app .screen').forEach(s=>s.classList.remove('active'));
  const target = $('s-'+id);
  target.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});

  // Shift focus to the new screen's heading to notify screen readers
  const heading = target.querySelector('h1, h2, .step, .eyebrow');
  if(heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}
function toast(msg){
  const t=$('toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(window._ppt_tt); window._ppt_tt=setTimeout(()=>t.classList.remove('show'),2600);
}

/* ---------------- qualify ---------------- */
(function initStates(){
  const sel=$('f-state');
  STATES.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;sel.appendChild(o);});
})();
function onState(){
  st.state=$('f-state').value;
  st.mandate=MANDATES[st.state]||null;
  const f=$('mandateFlag');
  if(st.mandate){
    f.innerHTML='<b>'+st.state+' has a mandate.</b> '+st.mandate.note+' Deadline: <b>'+st.mandate.date+'</b>. Adoption is step one — this test measures the rest.';
    f.classList.add('show');
  }else{ f.classList.remove('show'); }
  checkQualify();
}
function pickSize(btn,v){ st.size=v; segSel('seg-size',btn); checkQualify(); }
function pickPolicy(btn,v){ st.policy=v; segSel('seg-policy',btn); checkQualify(); }
function segSel(group,btn){
  document.querySelectorAll('#'+group+' button').forEach(b=>{ b.classList.remove('sel'); b.setAttribute('aria-pressed','false'); });
  btn.classList.add('sel'); btn.setAttribute('aria-pressed','true');
}
function checkQualify(){
  const ok = st.state && st.size && st.policy;
  const b=$('qualifyNext');
  b.disabled=!ok; b.style.opacity = ok?1:.5;
}

/* ---------------- diagnostic ---------------- */
function startDiagnostic(){ st.qi=0; renderQuestion(); go('diagnostic'); }
function renderQuestion(){
  const q=QUESTIONS[st.qi];
  $('qTag').textContent=q.tag;
  $('qText').textContent=q.text;
  $('qHint').textContent=q.hint;
  $('progCount').textContent='Question '+(st.qi+1)+' of '+QUESTIONS.length;
  $('progFill').style.width=(((st.qi)/QUESTIONS.length)*100)+'%';
  $('qBack').style.display = st.qi===0 ? 'none':'inline';
  document.querySelectorAll('#s-diagnostic .opt').forEach(o=>{
    const sel = st.answers[st.qi]===o.dataset.v;
    o.classList.toggle('sel', sel);
    o.setAttribute('aria-pressed', sel?'true':'false');
  });
}
function answer(v){
  st.answers[st.qi]=v;
  document.querySelectorAll('#s-diagnostic .opt').forEach(o=>{
    const sel = o.dataset.v===v;
    o.classList.toggle('sel', sel);
    o.setAttribute('aria-pressed', sel?'true':'false');
  });
  $('progFill').style.width=(((st.qi+1)/QUESTIONS.length)*100)+'%';
  setTimeout(()=>{
    if(st.qi < QUESTIONS.length-1){ st.qi++; renderQuestion(); }
    else { finish(); }
  },230);
}
function prevQuestion(){ if(st.qi>0){ st.qi--; renderQuestion(); } }

/* ---------------- scoring ---------------- */
function score(){
  let pts=0;
  st.answers.forEach(a=>{ if(a==='yes')pts+=1; else if(a==='unsure')pts+=0.25; });
  return Math.round((pts/QUESTIONS.length)*100);
}
function archetypeFor(p){ return ARCHETYPES.find(a=>p>=a.min&&p<=a.max)||ARCHETYPES[0]; }
function gapList(){
  const gaps=[];
  st.answers.forEach((a,i)=>{ if(a==='no'||a==='unsure'){ gaps.push({...QUESTIONS[i], ans:a}); } });
  gaps.sort((x,y)=> (x.pri==='high'?0:1)-(y.pri==='high'?0:1));
  return gaps;
}
function strongest(){
  for(let i=0;i<st.answers.length;i++){ if(st.answers[i]==='yes') return QUESTIONS[i].tag; }
  return "None yet";
}

/* ---------------- finish + reveal ---------------- */
function finish(){
  go('calculating');
  setTimeout(renderResult, 1500);
}
function renderResult(){
  const p=score();
  const arch=archetypeFor(p);
  $('archName').textContent=arch.name;
  $('archTier').textContent='Readiness Tier '+arch.tier+' of 4';
  $('archDesc').textContent=arch.desc;

  const adopted = st.policy==='adopted';
  $('paperVal').textContent = adopted?'Adopted':(st.policy==='progress'?'In progress':'Not started');
  $('paperTick').style.display = adopted?'inline':'none';

  go('result');
  requestAnimationFrame(()=>setTimeout(()=>{
    const paperPct = adopted?100:(st.policy==='progress'?55:15);
    $('paperBar').style.width=paperPct+'%';
    $('pracBar').style.width=p+'%';
    $('gapHatch').style.width=(paperPct-p>0?(paperPct-p):0)+'%';
    countUp($('pracVal'), p);
    const gl=$('gapLabel');
    const gap=Math.max(paperPct-p,0);
    gl.textContent = gap>0 ? ('That '+gap+'-point gap is your policy on paper that hasn’t reached practice yet.') : 'Paper and practice are aligned — the rare and right place to be.';
    gl.classList.add('show');
  },120));

  buildPreview();
}
function countUp(el,target){
  let cur=0; const step=Math.max(1,Math.round(target/28));
  const t=setInterval(()=>{ cur+=step; if(cur>=target){cur=target;clearInterval(t);} el.textContent=cur+'%'; },28);
}

/* ---------------- gate preview ---------------- */
function buildPreview(){
  const gaps=gapList();
  const host=$('previewGaps');
  const blur=$('previewBlur');
  host.innerHTML=''; blur.innerHTML='';
  gaps.slice(0,2).forEach((g,i)=>{ host.appendChild(gapRow(i+1,g)); });
  gaps.slice(2,5).forEach((g,i)=>{ const r=gapRow(i+3,g); blur.appendChild(r); });
  if(gaps.length===0){ host.innerHTML='<div class="gaprow"><div class="gt">No gaps flagged — your full report confirms a Living Policy.</div></div>'; }
}
function gapRow(n,g){
  const d=document.createElement('div'); d.className='gaprow';
  d.innerHTML='<span class="n">'+n+'</span><div><div class="gt">'+g.fixT+'</div><div class="gf">'+(g.ans==='unsure'?'Flagged: you weren’t sure. ':'')+g.fixF+'</div></div>';
  return d;
}

/* ---------------- submit gate ---------------- */
async function submitGate(){
  const name=$('g-name').value.trim();
  const email=$('g-email').value.trim();
  const district=$('g-dist').value.trim();
  if(!email || !email.includes('@')){ toast('Add a work email to unlock the report.'); return; }
  if(!name){ toast('Add your name so we can address your report.'); return; }
  if(!district){ toast('Add your district name.'); return; }

  const btn=$('gateSubmit');
  const label=btn.textContent;
  btn.disabled=true; btn.textContent='Sending…';

  try{
    const res = await fetch(API_BASE + '/api/v1/leads', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        name, email, district,
        state: st.state, size: st.size, policy: st.policy,
        answers: st.answers
      })
    });
    if(!res.ok){ throw new Error('HTTP '+res.status); }
    renderReport();
    go('report');
  }catch(err){
    console.error('Lead submit failed:', err);
    toast('Something went wrong sending your report. Please try again.');
    btn.disabled=false; btn.textContent=label;
    return;
  }
  btn.disabled=false; btn.textContent=label;
}

/* ---------------- full report ---------------- */
function renderReport(){
  const p=score();
  const arch=archetypeFor(p);
  const gaps=gapList();
  $('reportTitle').textContent=arch.name;
  $('rPrac').textContent=p+'%';
  $('rStrong').textContent=strongest();
  $('rGapCount').textContent=gaps.length;

  const sizeLabel={small:'small',mid:'mid-size',large:'large'}[st.size]||'';
  const avg = {small:38,mid:44,large:51}[st.size]||42;
  const cmp=$('rCmp');
  const delta=p-avg;
  cmp.textContent = (delta>=0?'+':'')+delta+' vs. '+sizeLabel+' districts (avg '+avg+'%)*';

  const mb=$('mandateBox');
  if(st.mandate){
    mb.style.display='block';
    $('mandateTitle').textContent=st.state+' requires a policy — '+st.mandate.date+'.';
    $('mandateBody').textContent='Adopting the policy satisfies the letter of the requirement. Everything this test measures — vendor agreements, code-of-conduct updates, teacher training — is what actually protects the district once the policy is on the books.';
  } else { mb.style.display='none'; }

  const host=$('fixList'); host.innerHTML='';
  if(gaps.length===0){
    host.innerHTML='<div class="fixitem"><div><div class="ft">No open gaps.</div><div class="ff">Your report confirms implementation across all ten checkpoints. We’d focus on annual review and edge cases.</div></div></div>';
  } else {
    gaps.forEach(g=>{
      const d=document.createElement('div'); d.className='fixitem';
      d.innerHTML='<span class="pri '+(g.pri==='high'?'high':'med')+'">'+(g.pri==='high'?'High':'Medium')+'</span>'
        +'<div><div class="ft">'+g.fixT+'</div><div class="ff">'+g.fixF+'</div></div>';
      host.appendChild(d);
    });
  }

  const head=$('bookHead'), body=$('bookBody');
  if(p<=25){ head.textContent="You're not behind — you're at step one."; body.textContent="Adoption was the easy part. Closing these gaps is where districts get stuck. We do it in one board cycle."; }
  else if(p<=50){ head.textContent="You've cleared the checkbox. Now close the gap."; body.textContent="You've met the mandate on paper. Let's turn it into practice your community and your lawyers can stand behind."; }
  else if(p<=75){ head.textContent="You're close. Let's finish it."; body.textContent="A few specific gaps separate you from a policy that fully holds up. A short review will prioritize them."; }
  else { head.textContent="You're ahead. Let's keep it that way."; body.textContent="You're in rare company. A light annual review keeps your policy living as AI and the law keep moving."; }
}

function openBooking(){ window.open(BOOKING_URL, '_blank', 'noopener'); }

function restart(){
  st={ state:"", mandate:null, size:"", policy:"", answers:Array(QUESTIONS.length).fill(null), qi:0 };
  $('f-state').value="";
  $('mandateFlag').classList.remove('show');
  document.querySelectorAll('#ppt-app .seg button').forEach(b=>{ b.classList.remove('sel'); b.setAttribute('aria-pressed','false'); });
  $('g-name').value=''; $('g-email').value=''; $('g-dist').value='';
  checkQualify();
  go('landing');
}

/* ---------------- event wiring ---------------- */
document.querySelectorAll('#ppt-app [data-go]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.go)));
document.querySelectorAll('#seg-size button').forEach(b=>b.addEventListener('click',()=>pickSize(b,b.dataset.size)));
document.querySelectorAll('#seg-policy button').forEach(b=>b.addEventListener('click',()=>pickPolicy(b,b.dataset.policy)));
document.querySelectorAll('#s-diagnostic .opt').forEach(o=>o.addEventListener('click',()=>answer(o.dataset.v)));
$('f-state').addEventListener('change', onState);
document.querySelector('[data-start]').addEventListener('click', startDiagnostic);
document.querySelector('[data-prev]').addEventListener('click', prevQuestion);
document.querySelector('[data-submit]').addEventListener('click', submitGate);
document.querySelector('[data-book]').addEventListener('click', openBooking);
document.querySelectorAll('#ppt-app [data-restart]').forEach(el=>el.addEventListener('click', restart));
