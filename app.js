(function(){
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const store = { get(k,d){ try{ const v = localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };
const S = { lv:1, si:0, ui:0, units:[], placed:[], mist:0, flash:0, ext:0, step:0, stepFlash:0, stepMist:0, scores:Array(20).fill(0), team:0, snd:true, done:false, tk:0, lock:false, away:-1, hole:-1 };
const SAYFIX = { 'sv.jazm.hadhf_illa':'حذف حرف العلة', 'sv.amr.hadhf_illa':'حذف حرف العلة' };
const sayOf = id => SAYFIX[id] || PIECES[id].say;
function parse(u){ let out=''; u.a.forEach((id,i)=>{ const p=PIECES[id]; out += (i? (/^st\.(raf|nasb|jazm)_bi$/.test(u.a[i-1])?'':' '):'') + sayOf(id); }); return out; }
const tabOf = id => { const g = PIECES[id].grp; return g==='vb'?'v':g==='hf'?'h':'n'; };
const levelList = () => SENTENCES.filter(s=>s.lv===S.lv);
let CUSTOM = [];

/* ومضات: أسئلة توجيهية لكل وظيفة */
const Q = {
 'raf.mubtada':'عمّ نتحدث؟ اسم نبدأ به الجملة الاسمية.','raf.khabar':'ما الذي يكمل المعنى مع المبتدأ ويخبرنا عنه؟','raf.fail':'من الذي قام بالفعل؟','raf.naib':'الفعل مبني للمجهول: من الذي حلّ محل الفاعل؟',
 'raf.mubtada2':'اسم ثانٍ بعد المبتدأ الأول، وله خبر خاص به.','raf.khabar_m2':'ما الذي يخبرنا عن المبتدأ الثاني؟','raf.ism_nasikh':'اسم جاء بعد كان أو إحدى أخواتها.','raf.khabar_harf':'خبر جاء بعد اسم الحرف الناسخ (إنّ وأخواتها).',
 'raf.nat':'كلمة تصف الاسم الذي قبلها وتتبعه في الرفع.','raf.tawkid_manawi':'لفظ مثل (كل، نفس، عين) يؤكد الكلمة قبله.','raf.matuf':'اسم بعد حرف عطف.','raf.badal':'اسم يأتي بدلًا من الاسم قبله.',
 'nasb.maful_bih':'ما الذي وقع عليه فعل الفاعل؟','nasb.maful_bih2':'الفعل يطلب مفعولين: هذا هو الثاني.','nasb.maful_mutlaq':'مصدر يؤكد الفعل أو يبيّن نوعه أو عدده.','nasb.maful_ajlih':'لماذا حدث الفعل؟ مصدر يبيّن السبب.',
 'nasb.zarf_zaman':'متى حدث الفعل؟','nasb.zarf_makan':'أين حدث الفعل؟','nasb.hal':'كيف كان صاحب الحال وقت الفعل؟','nasb.tamyiz':'اسم يزيل الإبهام عمّا قبله.','nasb.ism_harf':'اسم جاء بعد إنّ أو إحدى أخواتها.','nasb.khabar_fil':'خبر جاء بعد كان أو إحدى أخواتها.',
 'nasb.nat':'يصف اسمًا منصوبًا قبله.','nasb.tawkid_manawi':'لفظ يؤكد الاسم المنصوب قبله.','nasb.matuf':'اسم بعد حرف عطف.','nasb.badal':'اسم بدل من منصوب قبله.',
 'jarr.ism_majrur':'اسم جاء بعد حرف جر.','jarr.mudaf_ilayh':'اسم جاء بعد اسم آخر فأتمّ معناه (إضافة).','jarr.nat':'يصف اسمًا مجرورًا قبله.','jarr.tawkid_manawi':'لفظ يؤكد الاسم المجرور قبله.','jarr.matuf':'اسم بعد حرف عطف.','jarr.badal':'اسم بدل من مجرور قبله.','jarr.tamyiz':'يزيل الإبهام ويكون مجرورًا.',
 'mb.ishara':'اسم يشير إلى شيء (هذا، هذه، ذلك...).','mb.mawsul':'اسم يحتاج إلى جملة تُتمّ معناه (الذي، التي...).','mb.shart':'اسم يربط بين فعل الشرط وجوابه.','mb.mattasil':'ضمير متصل بآخر كلمة قبله.','mb.munfasil':'ضمير يقف وحده (هو، هي، أنا...).','mb.mustatir':'ضمير غير ظاهر في اللفظ.','mb.istifham':'اسم نسأل به (مَن، ماذا، متى...).','mb.zarf':'ظرف مبني لا تتغير حركته.','mb.taajjub':'اسم نتعجب به (ما أجمل...!).',
 'vb.madi':'فعل يدل على حدث وقع وانتهى.','vb.mudari':'فعل يدل على حدث يقع الآن أو بعد قليل، ويبدأ بأحد أحرف (أنيت).','vb.amr':'فعل يطلب حدوث شيء بعد زمن التكلم.',
 'hf.nasikh':'حرف يدخل على الجملة الاسمية فينسخ حكمها.','hf.atf':'حرف يربط كلمة بكلمة.','hf.jarr':'حرف يجرّ الاسم بعده.','hf.nasb':'حرف ينصب الفعل المضارع بعده.','hf.jazm':'حرف يجزم الفعل المضارع بعده.','hf.istifham':'حرف نسأل به.','hf.kaffa':'«ما» الزائدة تكفّ إنَّ وأخواتها عن العمل (إنما، كأنما).','hf.hasr':'حرف يحصر الحكم فيما بعده (إلا).','hf.nafi':'حرف ينفي حدوث الفعل (لا، لن، لم، ما).','hf.shart':'حرف يربط الشرط بجوابه (إن).','hf.rabit':'حرف (الفاء) يربط جواب الشرط بأداة الشرط حين لا يصلح الجواب أن يكون شرطًا.' };
function stepText(u, k){
  const id = u.a[k], p = PIECES[id];
  if (k===0) return Q[id] || 'فكّروا: ما نوع الكلمة، وما وظيفتها في الجملة؟';
  if (p.cls==='st' && /^hd\./.test(id)) return 'اسم معرب: انظروا إلى حالة الكلمة (رفع أو نصب أو جر) وطابقوها مع عمود الوظيفة.';
  if (id==='st.mahal') return 'اسم مبني لا تتغير حركته، فنقول: مبني في محل ...';
  if (/^st\.(raf|nasb|jazm)_bi$/.test(id)) return 'الفعل المضارع معرب: هل هو مرفوع أم منصوب أم مجزوم؟ انظروا إلى ما قبله.';
  if (/^st\.(madi|amr|mudari_mabni)$/.test(id)) return 'هذا الفعل مبني: نقول مبني على ...';
  if (id==='hf.mabni') return 'الحرف دائمًا مبني.';
  if (id==='hf.nomahal') return 'الحرف لا محل له من الإعراب.';
  if (/^sg\.mahal\./.test(id)) return 'ما موقع الكلمة من الإعراب لو كانت معربة: رفع أم نصب أم جر؟';
  if (/^sv\./.test(id)) return 'حال الفعل: ' + C_LABEL[u.c] + '. طابقوه مع القطعة الصفراء.';
  if (/^sg\./.test(id)) return 'نوع الكلمة: ' + M_LABEL[u.m] + '. طابقوه مع القطعة الصفراء.';
  if (/^(raf|nasb|jarr)\./.test(id)) return 'ما وظيفة هذه الكلمة بعد أن عرفنا حالتها؟';
  return 'تأمّلوا القطع المضيئة.';
}

/* ---------- بناء لوحة القطع ---------- */
const pbtn = (id, extra='') => `<button class="pc ${PIECES[id].cls} btn-p ${extra}" data-id="${id}">${PIECES[id].label}</button>`;
function signCells(arr, prefix){ return arr.map(s=>`<div class="signcell"><div class="clue">${s[3]}</div>${pbtn(prefix+s[0])}</div>`).join(''); }
function buildTray(){
  const col = (list,g)=>`<div style="display:flex;flex-direction:column;gap:.4rem">${list.map(f=>pbtn(g+'.'+f[0],'sm')).join('')}</div>`;
  const nameGrp = (title,g,list,two) => `<div class="grp" data-g="${g}" style="flex:${two?2:1.6} 1 ${two?'26':'20'}rem"><div class="gt">${title}</div>${two?`<div class="cols2">${col(list.slice(0,8),g)}${col(list.slice(8),g)}</div>`:col(list,g)}${pbtn('hd.'+g)}<div class="signs">${signCells(NOUN_SIGNS[g],'sg.'+g+'.')}</div></div>`;
  const mb = ['ishara','mawsul','shart','mattasil','munfasil','mustatir','istifham','zarf','taajjub'].map(k=>pbtn('mb.'+k,'sm')).join('');
  $('#sn').innerHTML = nameGrp('المرفوعات','raf',FN_RAF,true) + nameGrp('المنصوبات','nasb',FN_NASB,true) + nameGrp('المجرورات','jarr',FN_JARR,false)
    + `<div class="grp" data-g="mb"><div class="gt">الأسماء المبنية</div><div style="display:flex;flex-direction:column;gap:.4rem">${mb}</div>${pbtn('st.mahal')}<div class="signs">${['raf','nasb','jarr'].map(c=>pbtn('sg.mahal.'+c)).join('')}</div></div>`;
  const vs = (g)=>VERB_SIGNS[g].map(s=>`<div class="vrow"><div class="clue">${s[2]}</div>${pbtn('sv.'+g+'.'+s[0])}</div>`).join('');
  const pres = ['raf','nasb','jazm'].map(g=>`<div class="signcell" data-st="${g}" style="gap:.4rem">${pbtn('st.'+g+'_bi')}${vs(g)}</div>`).join('');
  $('#sv').innerHTML = `<div class="vblock" data-g="mudari" style="flex:2 1 32rem"><div class="gt">الفعل المضارع</div>${pbtn('vb.mudari')}<div class="vgrid" style="grid-template-columns:repeat(3,1fr)">${pres}</div><div data-st="mabni">${pbtn('st.mudari_mabni')}<div class="vgrid">${vs('mudari_mabni')}</div></div></div>
   <div class="vblock" data-g="madi"><div class="gt">الفعل الماضي</div>${pbtn('vb.madi')}${pbtn('st.madi')}<div class="vgrid">${vs('madi')}</div></div>
   <div class="vblock" data-g="amr"><div class="gt">فعل الأمر</div>${pbtn('vb.amr')}${pbtn('st.amr')}<div class="vgrid">${vs('amr')}</div></div>`;
  $('#sh').innerHTML = `<div class="vblock" style="max-width:34rem"><div class="gt">الحرف</div><div class="hgrid">${['nasikh','atf','jarr','nasb','jazm','istifham','nafi','shart','rabit','kaffa','hasr'].map(k=>pbtn('hf.'+k)).join('')}</div>${pbtn('hf.mabni')}${pbtn('hf.nomahal','sm')}</div>`;
}
function showTab(t){ $$('#tabs button').forEach(b=>b.setAttribute('aria-selected', b.dataset.t===t)); ['n','v','h'].forEach(k=>$('#s'+k).classList.toggle('on',k===t)); }

/* ---------- اللعبة ---------- */
const CFG = { system:'solo', mode:'normal', n:2, names:[], timeSel:'auto', timeCus:60, turn:30 };
['الألف','الباء','التاء','الثاء','الجيم','الحاء','الخاء','الدال','الذال','الراء','الزاي','السين','الشين','الصاد','الضاد','الطاء','الظاء','العين','الغين','الفاء'].forEach(n=>CFG.names.push('فريق '+n));
const isTeams = () => CFG.system==='teams';
const nT = () => isTeams() ? CFG.n : 1;
const teamColor = i => `hsl(${(i*47+8)%360} 70% 42%)`;
const esc = t => String(t).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CASE_WORD = { raf:'مرفوع', nasb:'منصوب', jarr:'مجرور' };
const fmt = s => String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
function dirText(u){ const a = u.a, f = a[0];
  if (/^(raf|nasb|jarr)\./.test(f)) return 'اسم معرب ' + CASE_WORD[f.split('.')[0]];
  if (f.startsWith('mb.')) return 'اسم مبني: ' + PIECES[f].label;
  if (f==='vb.madi') return 'فعل ماضٍ'; if (f==='vb.amr') return 'فعل أمر';
  if (f==='vb.mudari'){ const st = a[1]; return 'فعل مضارع ' + (st==='st.raf_bi'?'مرفوع':st==='st.nasb_bi'?'منصوب':st==='st.jazm_bi'?'مجزوم':'مبني'); }
  return PIECES[f].label; }
function beginnerTab(){ if (CFG.mode==='beginner' && !S.done && S.units[S.ui]){ const u = S.units[S.ui]; trayFilter(u); showTab(tabOf(u.a[Math.min(S.placed[S.ui],u.a.length-1)])); } else trayFilter(null); }

/* المؤقت */
const T = { on:false, ready:false, left:0, base:0, t0:0, h:null, last:-1, scope:'' };
function autoSecs(){ const n = S.units.reduce((a,u)=>a+u.a.length,0); return Math.max(30, Math.round((15+5*n)/5)*5); }
function chosenSecs(){ return CFG.timeSel==='auto' ? autoSecs() : CFG.timeSel==='cus' ? Math.max(10, Math.min(900, +CFG.timeCus||60)) : +CFG.timeSel; }
function timerStart(secs, scope){ clearInterval(T.h); Object.assign(T,{on:true,ready:false,scope,base:secs,left:secs,t0:performance.now(),last:-1}); T.h = setInterval(timerTick,200); drawTimer(); }
function timerStop(){ clearInterval(T.h); T.on = false; T.ready = false; drawTimer(); }
function timerTick(){ if (!T.on) return; T.left = Math.max(0, T.base - (performance.now()-T.t0)/1000); const sec = Math.ceil(T.left);
  if (sec!==T.last){ T.last = sec; if (sec<=10 && sec>0) beep('tick'); drawTimer(); } if (T.left<=0) timeUp(); }
function drawTimer(){ const box = $('#tm'), show = T.on || T.ready; box.hidden = !show; if (!show) return;
  const s = Math.ceil(T.on ? T.left : T.base); $('#tmT').textContent = fmt(s); $('#tmB').style.width = (T.on ? T.left/T.base*100 : 100) + '%';
  box.classList.toggle('warn', T.on && T.left<=10); $('#bStart').style.display = T.ready && !T.on ? '' : 'none'; $('#bExt').style.display = T.on ? '' : 'none'; }
function timeUp(){ beep('buzz');
  if (T.scope==='turn'){ const old = S.team; S.team = (S.team+1)%CFG.n; render(); setHint(`انتهى وقت ${CFG.names[old]}! الدور الآن على ${CFG.names[S.team]}.`); timerStart(CFG.turn,'turn'); }
  else { cancelFx(); S.done = true; timerStop(); render(); showResult(true); } }
function extendTime(){ if (!T.on || S.done) return; T.base += ADM.extS; T.last = -1; award(-ADM.pts.ext); S.ext++; beep('ok'); setHint(`أُضيفت ${ADM.extS} ثانية وخُصمت ${ADM.pts.ext} نقاط.`); drawTimer(); }

function award(d){ const i = S.team; S.scores[i] = Math.max(0, S.scores[i]+d); renderTeams();
  const el = document.querySelector(`.team[data-t="${i}"]`); if (el && d){ const f = document.createElement('span'); f.className = 'delta ' + (d>0?'p':'m'); f.textContent = (d>0?'+':'−') + Math.abs(d); el.appendChild(f); setTimeout(()=>f.remove(),1100); } }

/* ---- الحركة: الكلمة تنزل للمنضدة وتُعرب ثم تعود إلى مكانها في الجملة ---- */
function after(ms, fn){ const tk = S.tk; setTimeout(()=>{ if (tk===S.tk) fn(); }, ms); }
const RM = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
function cancelFx(){ S.tk++; S.lock = false; $$('.wflight').forEach(e=>e.remove()); }
const unitSpan = i => document.querySelector(`#sent .u[data-ui="${i}"]`);
function flyWord(fromEl, toEl, text, up, cb){
  if (!fromEl || !toEl || RM()){ cb(); return; }
  const a = fromEl.getBoundingClientRect(), fs = getComputedStyle(toEl).fontSize, b0 = toEl.getBoundingClientRect();
  const s = Math.max(.25, Math.min(2.2, a.height/Math.max(1,b0.height))), D = Math.round(520*SP()), tk = S.tk;
  const ac = [a.left+a.width/2, a.top+a.height/2], mid = up ? -50 : -70;
  const gs = [[1,0,false],[.28,70,true],[.16,140,true],[.08,210,true]].map(([op,delay,tr])=>{
    const g = document.createElement('div'); g.className = 'wflight' + (up?' up':'') + (tr?' trail':''); g.textContent = text; g.style.cssText = `left:0;top:0;font-size:${fs};opacity:${op}`; document.body.appendChild(g); return {g,delay}; });
  const t0 = performance.now(); fx('whoosh');
  const ease = t => { const c1 = 1.1, c3 = c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); };
  const frame = now => {
    if (tk !== S.tk){ gs.forEach(o=>o.g.remove()); return; }
    const b = toEl.getBoundingClientRect(); let done = true;
    gs.forEach((o,n)=>{ const t = Math.max(0, Math.min(1, (now-t0-o.delay)/D)); if (t<1) done = false;
      const e = ease(t), k = 1-e, bc = [b.left+b.width/2, b.top+b.height/2];
      const x = bc[0] + (ac[0]-bc[0])*k, y = bc[1] + (ac[1]-bc[1])*k + mid*Math.sin(Math.PI*t)*(1-t*.3);
      const sc = 1 + (s-1)*k + .12*Math.sin(Math.PI*t), rot = (up?5:3)*Math.sin(Math.PI*t) + (up?0:-4)*k;
      o.g.style.width = b.width+'px'; o.g.style.height = b.height+'px';
      o.g.style.transform = `translate(${x-b.width/2}px,${y-b.height/2}px) scale(${sc}) rotate(${rot}deg)`; });
    if (done){ gs.forEach(o=>o.g.remove()); cb(); } else requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
function popUnit(i){ const s = unitSpan(i); if (s) s.classList.add('upop'); }
function revealPiece(b){ const fh = $('#fixed').getBoundingClientRect().bottom, r = b.getBoundingClientRect();
  if (r.top < fh+8) window.scrollBy({top:r.top-fh-14,behavior:'smooth'}); else if (r.bottom > innerHeight-8) window.scrollBy({top:r.bottom-innerHeight+14,behavior:'smooth'}); }

/* ---------- اللعبة ---------- */
function load(si){
  cancelFx(); timerStop(); trayFilter(null);
  if (!levelList().length){ S.units=[]; S.placed=[]; S.done=false; $('#sNo').textContent='لا توجد جمل'; $('#sent').innerHTML='<div class="empty">لا توجد جمل بعد. اضغط «+ جملتي» لإضافة جملة وإعرابها.</div>'; $('#bcard').textContent=''; $('#bcard').style.visibility='hidden'; $('#chain').innerHTML=''; $('#compose').textContent=''; renderTeams(); return; }
  S.si = Math.max(0, Math.min(levelList().length-1, si)); S.ui = 0; S.mist = 0; S.flash = 0; S.ext = 0; S.done = false; S.units = [];
  levelList()[S.si].words.forEach((w,wi)=>w.forEach((u,k)=>S.units.push(Object.assign({wi,k,full:w.map(x=>x.t).join('')},u))));
  S.placed = S.units.map(()=>0); S.step = 0; S.stepFlash = 0; S.stepMist = 0; S.away = -1; S.hole = -1; S.lock = true; $('#faBox').hidden = true; $('#chain').classList.remove('collapse');
  if (CFG.mode==='timed'){ T.ready = true; T.base = chosenSecs(); drawTimer(); }
  render(); { const se = $('#sent'); se.classList.add('fresh'); clearTimeout(load.ft); load.ft = setTimeout(()=>se.classList.remove('fresh'),1100); }
  setHint(CFG.mode==='timed' ? 'اضغطوا «ابدأ التحدي» ليبدأ العدّ التنازلي.' : CFG.mode==='beginner' ? 'وضع المبتدئين: تظهر لكم الخانة المناسبة للكلمة فقط، فاملؤوا الحكم والعلامة الإعرابية.' : 'الومضة تلمّح لكم بالقطعة المناسبة، وكل ومضة تخصم نقاطًا.');
  startUnit();
}
function startUnit(){
  if (S.done || S.ui >= S.units.length) return;
  S.away = -1; S.hole = -1; S.lock = true; $('#chain').classList.remove('collapse'); render();
  const u = S.units[S.ui], tk = S.tk;
  after(Math.round(240*SP()), ()=>{ const span = unitSpan(S.ui), card = $('#bcard'); S.hole = S.ui; if (span) span.classList.add('hole');
    flyWord(span, card, u.t, false, ()=>{ if (tk!==S.tk) return; S.away = S.ui; S.lock = false; if (CFG.mode==='beginner' && S.placed[S.ui]===0 && /^vb\./.test(u.a[0])) S.placed[S.ui] = 1; renderBench(); card.classList.remove('land'); void card.offsetWidth; card.classList.add('land');
      beginnerTab(); if (isTeams() && CFG.turn>0 && CFG.mode!=='timed') timerStart(CFG.turn,'turn'); }); });
}
function render(){
  const sent = levelList()[S.si]; $('#sNo').textContent = `الجملة ${S.si+1} من ${levelList().length}`;
  const n = sent.words.length; $('#sent').style.setProperty('--sw', (n<=5?3:n<=7?2.6:n<=9?2.2:1.9) + 'rem');
  const beg = CFG.mode==='beginner';
  $('#sent').innerHTML = sent.words.map((w,wi)=>{
    const units = S.units.filter(u=>u.wi===wi), idx = units.map(u=>S.units.indexOf(u));
    const txt = units.map((u,k)=>{ const i = idx[k], c = i<S.ui ? ' done' : (i===S.ui && !S.done ? ' cur' : ''); return `<span class="u${c}${i===S.hole?' hole':''}" data-ui="${i}">${u.t}</span>`; }).join('');
    const subs = units.map((u,k)=>{ const i = idx[k]; return ''; }).join('');
    return `<div class="sw" style="--i:${wi}"><div class="swt">${txt}</div><div class="subs">${subs}</div></div>`; }).join('');
  renderBench(); $('#fl').textContent = S.stepFlash ? `(${S.stepFlash}/3)` : ''; renderTeams();
}
function renderBench(){
  const u = S.units[S.ui], card = $('#bcard'), ch = $('#chain');
  if (!u || S.done){ card.textContent = ''; card.style.visibility = 'hidden'; ch.innerHTML = ''; $('#compose').textContent = ''; $('#bdir').textContent = ''; return; }
  const on = S.away === S.ui, k = S.placed[S.ui];
  card.textContent = u.t; card.style.visibility = on ? '' : 'hidden';
  let h = ''; if (on){ const n = CFG.mode==='timed' ? k+1 : u.a.length;
    for (let s=0; s<n; s++) h += s<k ? `<div class="slot"><span class="pc ${PIECES[u.a[s]].cls}${s===k-1?' new':''}" style="display:flex;align-items:center;justify-content:center">${PIECES[u.a[s]].label}</span></div>` : `<div class="slot${s===k?' open':''}" data-slot="${S.ui}.${s}"></div>`; }
  ch.innerHTML = h;
  $('#compose').textContent = on && k && CFG.mode!=='beginner' ? parse({a:u.a.slice(0,k)}) + (k<u.a.length ? ' …' : '') : '';
  $('#bdir').textContent = '';
}
function renderTeams(){ const n = nT(), box = $('#teams'); box.className = 'teams' + (n>6?' many':'');
  box.innerHTML = Array.from({length:n},(_,i)=>`<div class="team${S.team===i?' on':''}" style="--c:${teamColor(i)}" data-t="${i}"><i></i><span class="nm">${isTeams()?esc(CFG.names[i]):'نقاطكم'}</span><b>${S.scores[i]}</b><button class="pm" data-pm="${i}.1" aria-label="زيادة">+</button><button class="pm" data-pm="${i}.-1" aria-label="إنقاص">−</button></div>`).join(''); }
function setHint(t){ $('#hint').textContent = t; }
function clearFx(){ $$('.glow,.strong,.shake').forEach(e=>e.classList.remove('glow','strong','shake')); $$('#tabs .flash').forEach(e=>e.classList.remove('flash')); }

function tap(id, btn){
  if (S.done || S.lock || S.away !== S.ui) return;
  if (CFG.mode==='timed' && !T.on){ setHint('اضغطوا «ابدأ التحدي» أولًا.'); return; }
  const u = S.units[S.ui], k = S.placed[S.ui], want = u.a[k];
  clearFx(); beep(id===want?'ok':'bad');
  if (id !== want){ S.mist++; S.stepMist++; award(-ADM.pts.bad); btn.classList.add('shake'); setTimeout(()=>btn.classList.remove('shake'),450);
    if (S.stepMist>=2 && S.stepFlash===0){ setHint('ومضة مجانية: ' + stepText(u,k)); flashTab(tabOf(want)); } else setHint('ليست هذه القطعة المناسبة، فكّروا مرة أخرى.'); return; }
  award(ADM.pts.ok); S.lock = true;
  fly(btn, k, ()=>{ S.placed[S.ui]++; S.step = S.placed[S.ui]; S.stepFlash = 0; S.stepMist = 0;
    if (S.placed[S.ui] >= u.a.length){ renderBench(); finishUnit(u); } else { S.lock = false; renderBench(); $('#fl').textContent = ''; setHint('أحسنتم! ما القطعة التالية؟'); beginnerTab(); } });
}
function fly(btn, k, cb){
  const slot = document.querySelector(`[data-slot="${S.ui}.${k}"]`);
  if (!slot || !btn.animate || RM()){ cb(); return; }
  const a = btn.getBoundingClientRect(), b = slot.getBoundingClientRect(), c = btn.cloneNode(true);
  c.className = btn.className + ' fly'; c.style.cssText = `left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px;margin:0`;
  document.body.appendChild(c);
  const an = c.animate([{transform:'translate(0,0)'},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(${b.width/a.width},${b.height/a.height})`}],{duration:Math.round(260*SP()),easing:'cubic-bezier(.3,.8,.3,1)'});
  an.onfinish = ()=>{ c.remove(); fx('pop'); cb(); };
}
function finishUnit(u){
  const i = S.ui, last = i+1 >= S.units.length;
  setHint(`«${u.t}» ${parse(u)}`); S.lock = true; fx('zing');
  if (T.on && (T.scope==='turn' || last)){ if (last && CFG.mode==='timed'){ const bonus = Math.floor(T.left/5); if (bonus) award(bonus); } timerStop(); }
  if (isTeams()) S.team = (S.team+1)%CFG.n; renderTeams();
  after(Math.round(750*SP()), ()=>{ $('#chain').classList.add('collapse');
    after(Math.round(180*SP()), ()=>{ const card = $('#bcard'), span = unitSpan(i), tk = S.tk; card.style.visibility = 'hidden'; $('#compose').textContent = '';
      flyWord(card, span, u.t, true, ()=>{ if (tk!==S.tk) return; S.hole = -1; S.ui = i+1; S.step = 0; S.away = -1; S.lock = false;
        if (last){ S.done = true; render(); popUnit(i); beep('win'); confetti(); after(900, ()=>showResult(false)); }
        else { startUnit(); popUnit(i); } }); }); });
}

function useFlash(){
  if (S.done || S.lock || S.away !== S.ui) return; if (CFG.mode==='timed' && !T.on){ setHint('اضغطوا «ابدأ التحدي» أولًا.'); return; }
  const u = S.units[S.ui], k = S.placed[S.ui], want = u.a[k];
  clearFx(); S.stepFlash = Math.min(3, S.stepFlash+1); const f = S.stepFlash, cost = f*ADM.pts.flash; award(-cost); S.flash += cost;
  setHint('ومضة: ' + stepText(u,k)); flashTab(tabOf(want));
  if (f===2){ const pool = $$('#s'+tabOf(want)+' .btn-p').filter(b=>b.dataset.id!==want && PIECES[b.dataset.id].cls===PIECES[want].cls).sort(()=>Math.random()-.5).slice(0,2);
    [...pool, $(`.btn-p[data-id="${want}"]`)].forEach(b=>b&&b.classList.add('glow')); showTab(tabOf(want)); }
  if (f===3){ showTab(tabOf(want)); const b = $(`.btn-p[data-id="${want}"]`); b.classList.add('strong'); revealPiece(b); }
  $('#fl').textContent = `(${S.stepFlash}/3)`;
}
function flashTab(t){ const b = $(`#tabs button[data-t="${t}"]`); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); }

/* ---------- النتيجة والتفصيل ---------- */
function showResult(timeout){
  const sent = levelList()[S.si], bad = S.mist + S.flash + S.ext, stars = timeout ? 0 : bad===0 ? 3 : bad<=6 ? 2 : 1;
  $('#mT').textContent = timeout ? 'انتهى الوقت!' : 'أحسنتم!';
  $('#mS').textContent = '★'.repeat(stars) + '☆'.repeat(3-stars);
  let i = 0, h = sent.words.map(w=>w.map(u=>{ const ok = i++ < S.ui; return `<div><b>${u.t}</b> : ${ok ? parse(u) : '— (لم يكتمل)'}</div>`; }).join('')).join('');
  if (sent.meaning) h += `<div><b>المغزى</b> : ${sent.meaning}</div>`;
  if (isTeams()){ const r = Array.from({length:CFG.n},(_,k)=>[CFG.names[k],S.scores[k]]).sort((a,b)=>b[1]-a[1]); h += `<div><b>المتصدر</b> : ${esc(r[0][0])} (${r[0][1]} نقطة)</div>`; }
  $('#mR').innerHTML = h; $('#mNext').style.display = S.si < levelList().length-1 ? '' : 'none';
  $('#modal').classList.add('on'); $('#mNext').focus();
}
/* ---------- الإعراب التفصيلي والفائدة النحوية لكل الجمل ---------- */
const FAIDA = {
 'raf.naib':'نائب الفاعل يحلّ محل الفاعل بعد حذفه مع الفعل المبني للمجهول، ويُعرب مرفوعًا مثله.',
 'nasb.ism_harf':'إنَّ وأخواتها حروف ناسخة تنصب المبتدأ ويسمى اسمها، وترفع الخبر ويسمى خبرها.',
 'raf.khabar_harf':'إنَّ وأخواتها حروف ناسخة تنصب المبتدأ ويسمى اسمها، وترفع الخبر ويسمى خبرها.',
 'raf.ism_nasikh':'كان وأخواتها أفعال ناسخة ترفع المبتدأ ويسمى اسمها، وتنصب الخبر ويسمى خبرها.',
 'nasb.khabar_fil':'كان وأخواتها أفعال ناسخة ترفع المبتدأ ويسمى اسمها، وتنصب الخبر ويسمى خبرها.',
 'nasb.maful_bih2':'بعض الأفعال تنصب مفعولين، مثل: منح، وأعطى، وكسا؛ الأول من يأخذ الشيء، والثاني الشيء الممنوح.',
 'nasb.maful_mutlaq':'المفعول المطلق مصدر منصوب يؤكد الفعل أو يبيّن نوعه أو عدده.',
 'nasb.maful_ajlih':'المفعول لأجله مصدر منصوب يبيّن سبب وقوع الفعل، ويجيب عن السؤال: لماذا؟',
 'nasb.hal':'الحال اسم منصوب يبيّن هيئة صاحبه وقت حدوث الفعل، ويجيب عن السؤال: كيف؟',
 'nasb.tamyiz':'التمييز اسم نكرة منصوب يزيل الإبهام عمّا قبله.',
 'raf.mubtada2':'قد يكون خبر المبتدأ الأول جملة اسمية مكوّنة من مبتدأ ثانٍ وخبره.',
 'raf.tawkid_manawi':'التوكيد المعنوي يكون بألفاظ مثل: نفس، وعين، وكل، وجميع، ويتبع المؤكَّد في إعرابه.',
 'raf.tawkid_lafzi':'التوكيد اللفظي يكون بتكرار اللفظ نفسه، ويتبع المؤكَّد في إعرابه.',
 'raf.badal':'البدل اسم يأتي بعد اسم آخر ليوضحه، ويتبعه في إعرابه.',
 'raf.nat':'النعت (الصفة) يبيّن صفة من صفات الاسم قبله، ويتبعه في الرفع أو النصب أو الجر.',
 'raf.matuf':'المعطوف اسم يأتي بعد حرف عطف، ويتبع المعطوف عليه في إعرابه.',
 'sv.raf.thubut':'الأفعال الخمسة تُرفع بثبوت النون، وتُنصب وتُجزم بحذفها.',
 'sv.nasb.hadhf_noon':'الأفعال الخمسة تُرفع بثبوت النون، وتُنصب وتُجزم بحذفها.',
 'sv.jazm.hadhf_noon':'الأفعال الخمسة تُرفع بثبوت النون، وتُنصب وتُجزم بحذفها.',
 'sv.jazm.hadhf_illa':'الفعل المضارع المعتل الآخر يُجزم بحذف حرف العلة، مثل: لم يسعَ.',
 'sv.raf.damma_mq':'الفعل المضارع المعتل الآخر يُرفع بضمة مقدرة لا تظهر على آخره؛ للتعذر أو للثقل.',
 'sg.nasb.fatha_mq':'الاسم المضاف إلى ياء المتكلم تُقدَّر علامة إعرابه على ما قبل الياء؛ لاشتغال المحل بحركة المناسبة.',
 'sg.jarr.kasra_mq':'الاسم المضاف إلى ياء المتكلم تُقدَّر علامة إعرابه على ما قبل الياء؛ لاشتغال المحل بحركة المناسبة.',
 'sg.raf.damma_mq':'الاسم المضاف إلى ياء المتكلم تُقدَّر علامة إعرابه على ما قبل الياء؛ لاشتغال المحل بحركة المناسبة.',
 'hf.nasikh':'الحروف الناسخة (إنَّ وأخواتها) مبنية لا محل لها من الإعراب، وتدخل على الجملة الاسمية.',
 'hf.nasb':'حروف النصب مثل: أن، ولن، وكي، تنصب الفعل المضارع بعدها.',
 'hf.jazm':'حروف الجزم مثل: لم، ولمّا، ولا الناهية، تجزم الفعل المضارع بعدها.',
 'hf.kaffa':'ما الكافة حرف زائد يكفّ إنَّ وأخواتها عن العمل، فتدخل على الجملة الفعلية (إنما، كأنما).',
 'hf.hasr':'أداة الحصر (إلا) حرف مبني لا محل له، وتقصر الحكم على ما بعدها.',
 'hf.nafi':'حرف النفي (لا، لن، لم، ما) ينفي حدوث الفعل، وهو مبني لا محل له من الإعراب.',
 'hf.shart':'حرف الشرط (إنْ) يربط فعل الشرط بجوابه ويجزمهما، وهو مبني لا محل له من الإعراب.',
 'hf.rabit':'الفاء الرابطة تربط جواب الشرط بأداة الشرط إذا كان الجواب لا يصلح أن يكون فعل شرط.',
 'mb.taajjub':'اسم التعجب (ما) مبني في محل رفع مبتدأ، وبعده فعل التعجب (ما أجملَ!).',
 'hf.istifham':'حرف الاستفهام (هل، الهمزة) مبني لا محل له من الإعراب، ويُسأل به.',
 'hf.atf':'حروف العطف مثل: الواو، والفاء، وثم، وأو، تربط كلمة بكلمة وتجعل لهما الإعراب نفسه.',
 'mb.shart':'اسم الشرط يربط بين فعل الشرط وجوابه، ويجزمهما إذا كان من أدوات الشرط الجازمة.',
 'mb.mawsul':'الاسم الموصول يحتاج إلى جملة الصلة لتوضّح معناه، وجملة الصلة لا محل لها من الإعراب.',
 'mb.ishara':'اسم الإشارة مبني، ويُعرب بحسب موقعه في الجملة بعبارة «في محل ...».',
 'mb.istifham':'اسم الاستفهام مبني، ويُعرب بحسب موقعه في الجملة بعبارة «في محل ...».',
 'mb.zarf':'الظرف المبني مثل (إذا) لا تتغير حركة آخره، ويُعرب مبنيًّا في محل نصب.',
 'nasb.zarf_zaman':'ظرف الزمان اسم منصوب يدل على وقت حدوث الفعل، ويجيب عن السؤال: متى؟',
 'nasb.zarf_makan':'ظرف المكان اسم منصوب يدل على مكان حدوث الفعل، ويجيب عن السؤال: أين؟',
 'jarr.mudaf_ilayh':'المضاف إليه اسم مجرور يأتي بعد المضاف ويتمم معناه، وعلامة جره الأصلية الكسرة.',
 'jarr.ism_majrur':'الاسم الذي يأتي بعد حرف الجر مجرور، وعلامة جره الأصلية الكسرة.',
 'hf.jarr':'حرف الجر مبني لا محل له من الإعراب، ويجرّ الاسم الذي بعده.',
 'nasb.maful_bih':'المفعول به اسم منصوب يدل على من وقع عليه فعل الفاعل.',
 'raf.fail':'الفاعل اسم مرفوع يدل على من قام بالفعل، ويأتي بعد الفعل.',
 'raf.khabar':'الخبر ما يتمم معنى المبتدأ ويخبرنا عنه، وهو مرفوع.',
 'raf.mubtada':'المبتدأ اسم مرفوع تبدأ به الجملة الاسمية، ويحتاج إلى خبر.',
 'vb.amr':'فعل الأمر مبني دائمًا، ويدل على طلب حدوث شيء بعد زمن التكلم.',
 'vb.madi':'الفعل الماضي مبني دائمًا: على الفتح، أو على السكون مع ضمائر الرفع المتحركة، أو على الضم مع واو الجماعة.',
 'vb.mudari':'الفعل المضارع معرب ما لم تتصل به نون التوكيد أو نون النسوة، فيُبنى.',
 'mb.mattasil':'الضمير المتصل لا يأتي في أول الكلام ولا بعد (إلا)، ويكون في محل رفع أو نصب أو جر.',
 'mb.munfasil':'الضمير المنفصل يقف وحده في الجملة، ويكون في محل رفع أو نصب.'
};
const FKEYS = Object.keys(FAIDA);
const wordOf = (sent,u) => { const w = sent.words.find(x=>x.includes(u)); return w ? w.map(x=>x.t).join('') : u.t; };
function getFaida(sent){
  if (sent.faida) return sent.faida;
  const units = sent.words.reduce((a,w)=>a.concat(w),[]);
  for (const key of FKEYS){ const u = units.find(x=>x.a.includes(key)); if (u) return FAIDA[key] + ` ومثاله في جملتنا: «${wordOf(sent,u)}».`; }
  return 'أعربوا كل كلمة بحسب موقعها، ثم اقرؤوا الجملة كاملة لتتأكدوا من سلامة المعنى.';
}
function getDetail(sent){ return sent.detail || sent.words.reduce((a,w)=>a.concat(w.map(u=>[u.t, parse(u)+'.'])),[]); }
function openDetail(){ const sent = levelList()[S.si]; if (!sent) return;
  $('#dS').textContent = sent.words.map(w=>w.map(u=>u.t).join('')).join(' ') + '.'; $('#dM').textContent = sent.meaning ? 'المغزى: ' + sent.meaning : '';
  $('#dL').innerHTML = getDetail(sent).map(d=>`<li><b>${d[0]}:</b> ${d[1]}</li>`).join(''); $('#dF').hidden = true; $('#dF').textContent = ''; $('#det').classList.add('on'); }
function toggleFaida(box){ const sent = levelList()[S.si]; if (!sent) return; box.hidden = !box.hidden; box.innerHTML = '<span></span><button class="fx" type="button">إغلاق ✕</button>'; box.firstChild.textContent = 'لمحة إعرابية: ' + getFaida(sent); box.querySelector('.fx').onclick = ()=>{ box.hidden = true; }; }

/* ---------- صوت وفرح ---------- */
let AC; function beep(k){ if(!S.snd) return; try{ AC = AC || new (window.AudioContext||window.webkitAudioContext)();
  const seqs = { ok:[[660,.08],[880,.1]], bad:[[180,.2]], tick:[[1200,.04]], buzz:[[140,.25],[110,.35]], start:[[440,.08],[587,.08],[880,.18]], win:[[523,.1],[659,.1],[784,.1],[1047,.12],[1319,.3]] };
  const seq = seqs[k] || seqs.ok; let t = AC.currentTime;
  seq.forEach(([f,d])=>{ const o = AC.createOscillator(), g = AC.createGain(); o.type = (k==='bad'||k==='buzz')?'sawtooth':k==='tick'?'square':'triangle'; o.frequency.value = f; g.gain.setValueAtTime(k==='tick'?.05:.12,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+d); t += d; }); }catch(e){} }
function confetti(){ const c = $('#conf'), x = c.getContext('2d'); if (matchMedia('(prefers-reduced-motion:reduce)').matches) return; c.width = innerWidth; c.height = innerHeight;
  const cols = ['#ffd23f','#25b4f5','#e8573d','#0f9d8a','#8d5cf6'], P = Array.from({length:140},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,vx:(Math.random()-.5)*3,vy:2+Math.random()*4,s:6+Math.random()*8,c:cols[Math.random()*5|0],r:Math.random()*6}));
  let n = 0; (function f(){ x.clearRect(0,0,c.width,c.height); P.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.r+=.1; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); x.restore(); }); if (++n<150) requestAnimationFrame(f); else x.clearRect(0,0,c.width,c.height); })(); }

/* ---------- الأحداث ---------- */
buildTray(); showTab('n');
document.addEventListener('click', e=>{
  const pb = e.target.closest('.btn-p'); if (pb && pb.dataset.id){ tap(pb.dataset.id, pb); return; }
  const tb = e.target.closest('#tabs button'); if (tb){ showTab(tb.dataset.t); return; }
  const lb = e.target.closest('#lvseg button'); if (lb){ S.lv = +lb.dataset.lv; fx('whoosh'); $$('#lvseg button').forEach(b=>b.setAttribute('aria-pressed', b===lb)); load(0); return; }
  const tm = e.target.closest('.team'); if (tm){ const pm = e.target.closest('.pm'); if (pm){ const [i,d] = pm.dataset.pm.split('.').map(Number); S.scores[i] = Math.max(0, S.scores[i]+d); } else S.team = +tm.dataset.t; renderTeams(); }
});
$('#bFlash').onclick = useFlash;
$('#bPrev').onclick = ()=>load(S.si-1); $('#bNext').onclick = ()=>load(S.si+1); $('#bReset').onclick = ()=>load(S.si);
$('#mNext').onclick = ()=>{ $('#modal').classList.remove('on'); load(S.si+1); }; $('#mAgain').onclick = ()=>{ $('#modal').classList.remove('on'); load(S.si); }; $('#mClose').onclick = ()=>$('#modal').classList.remove('on');
$('#bSnd').onclick = e=>{ S.snd = !S.snd; e.currentTarget.setAttribute('aria-pressed', S.snd); };
function syncSet(){
  $$('#set .seg').forEach(sg=>[...sg.children].forEach(b=>b.setAttribute('aria-pressed', CFG[sg.dataset.k]===b.dataset.v)));
  $('#oTeams').style.display = isTeams()?'':'none'; $('#oTimed').style.display = CFG.mode==='timed'?'':'none'; $('#oTurn').style.display = isTeams() && CFG.mode!=='timed' ? '' : 'none';
  $('#nTeams').value = CFG.n; $('#tSel').value = CFG.timeSel; $('#tCus').style.display = CFG.timeSel==='cus' ? '' : 'none'; $('#tCus').value = CFG.timeCus; $('#tTurn').value = String(CFG.turn);
  $('#tNames').innerHTML = Array.from({length:CFG.n},(_,i)=>`<input data-ti="${i}" value="${esc(CFG.names[i])}" aria-label="اسم الفريق ${i+1}" maxlength="24" style="border-inline-start:6px solid ${teamColor(i)}">`).join(''); }
$('#bSet').onclick = ()=>{ syncSet(); $('#set').classList.add('on'); };
$('#set').addEventListener('click', e=>{ const b = e.target.closest('.seg button'); if (!b) return; CFG[b.parentElement.dataset.k] = b.dataset.v; syncSet(); });
$('#nTeams').oninput = e=>{ CFG.n = Math.max(2, Math.min(20, +e.target.value || 2)); const f = document.activeElement; $('#tNames').innerHTML = Array.from({length:CFG.n},(_,i)=>`<input data-ti="${i}" value="${esc(CFG.names[i])}" aria-label="اسم الفريق ${i+1}" maxlength="24" style="border-inline-start:6px solid ${teamColor(i)}">`).join(''); };
$('#tNames').oninput = e=>{ const i = e.target.dataset.ti; if (i!==undefined) CFG.names[+i] = e.target.value || ('فريق ' + (+i+1)); };
$('#tSel').onchange = e=>{ CFG.timeSel = e.target.value; syncSet(); }; $('#tCus').oninput = e=>{ CFG.timeCus = +e.target.value; };
$('#tTurn').onchange = e=>{ CFG.turn = +e.target.value; };
$('#setOk').onclick = ()=>{ $('#set').classList.remove('on'); S.scores.fill(0); S.team = 0; load(S.si); beep('start'); };
$('#bStart').onclick = ()=>{ timerStart(T.base,'sentence'); beep('start'); setHint('انطلقوا! أعربوا الجملة قبل انتهاء الوقت.'); };
$('#bExt').onclick = extendTime;
$('#bDet').onclick = openDetail; $('#dClose').onclick = ()=>$('#det').classList.remove('on'); $('#dFa').onclick = ()=>toggleFaida($('#dF'));
$('#bFa').onclick = ()=>toggleFaida($('#faBox'));
let zoom = +store.get('ebr-zoom',1) || 1; const applyZoom = ()=>{ document.documentElement.style.setProperty('--zoom', zoom); store.set('ebr-zoom', zoom); };
$('#bZm').onclick = ()=>{ zoom = Math.min(1.5, +(zoom+.1).toFixed(2)); applyZoom(); }; $('#bZl').onclick = ()=>{ zoom = Math.max(.7, +(zoom-.1).toFixed(2)); applyZoom(); }; applyZoom();
$('#bTheme').onclick = ()=>{ const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme==='dark' : matchMedia('(prefers-color-scheme:dark)').matches; r.dataset.theme = dark?'light':'dark'; store.set('ebr-theme', r.dataset.theme); };
const th = store.get('ebr-theme',''); if (th) document.documentElement.dataset.theme = th;
$('#bFs').onclick = ()=>{ try{ document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(()=>{}); }catch(e){} };
document.addEventListener('keydown', e=>{ if (e.key==='Escape'){ $('#modal').classList.remove('on'); $('#ed').classList.remove('on'); $('#set').classList.remove('on'); $('#det').classList.remove('on'); $('#adm').classList.remove('on'); $('#stx').classList.remove('on'); } });

/* ---------- ورشة الجمل ---------- */
const GROUPS = { raf:['المرفوعات',FN_RAF], nasb:['المنصوبات',FN_NASB], jarr:['المجرورات',FN_JARR] };
const CASE_AR = { raf:'الرفع', nasb:'النصب', jarr:'الجر' };
const KINDS = [['ishara','اسم إشارة'],['mawsul','اسم موصول'],['shart','اسم شرط'],['mattasil','ضمير متصل'],['munfasil','ضمير منفصل'],['mustatir','ضمير مستتر'],['istifham','اسم استفهام'],['zarf','ظرف'],['taajjub','اسم تعجب']];
const HKS = [['nasikh','حرف ناسخ'],['atf','حرف عطف'],['jarr','حرف جر'],['nasb','حرف نصب'],['jazm','حرف جزم'],['istifham','حرف استفهام'],['nafi','حرف نفي'],['shart','حرف شرط'],['rabit','حرف رابط للجواب'],['kaffa','ما الكافة'],['hasr','حرف حصر']];
const TYPES = [['noun','اسم معرب'],['mabni','اسم مبني'],['madi','فعل ماضٍ'],['mudari','فعل مضارع'],['amr','فعل أمر'],['harf','حرف']];
const opt = (v,l,sel) => `<option value="${v}"${v===sel?' selected':''}>${l}</option>`;
const fnOpts = (sel,only) => Object.keys(GROUPS).filter(g=>!only||g===only).map(g=>`<optgroup label="${GROUPS[g][0]}">${GROUPS[g][1].map(f=>opt(g+'.'+f[0], f[2]||f[1], sel)).join('')}</optgroup>`).join('');
const vkey = u => u.type==='madi'?'madi':u.type==='amr'?'amr':(u.mode==='mabni'?'mudari_mabni':u.mode);
const expNoun = (g,m) => (NOUN_SIGNS[g].find(s=>s[2].includes(m))||[])[0];
const expVerb = (k,c) => VERB_SIGNS[k].find(s=>s[3].includes(c));
let E = [];
function fixUnit(u){
  if (u.type==='noun'){ const g = u.fn.split('.')[0]; u.sign = expNoun(g,u.m) || NOUN_SIGNS[g][0][0]; }
  if (u.type==='madi'||u.type==='mudari'||u.type==='amr'){ const k = vkey(u), e = expVerb(k,u.c); u.sg = (e||VERB_SIGNS[k][0])[0]; }
}
function newUnit(t){ const u = {t,type:'noun',fn:'raf.mubtada',m:'mufrad',kind:'mattasil',cs:'raf',mfn:'raf.mubtada',mode:'raf',c:'sahih',hk:'jarr'}; fixUnit(u); return u; }
function unitData(u){
  if (u.type==='noun'){ const g = u.fn.split('.')[0]; return {t:u.t, m:u.m, a:[u.fn,'hd.'+g,'sg.'+g+'.'+u.sign]}; }
  if (u.type==='mabni'){ const a = ['mb.'+u.kind,'st.mahal','sg.mahal.'+u.cs]; if (u.kind!=='zarf' && u.mfn) a.push(u.mfn); return {t:u.t,a}; }
  if (u.type==='harf') return {t:u.t, a:['hf.'+u.hk,'hf.mabni','hf.nomahal']};
  const k = vkey(u), st = u.type==='madi'?'st.madi':u.type==='amr'?'st.amr':(u.mode==='mabni'?'st.mudari_mabni':'st.'+u.mode+'_bi');
  return {t:u.t, c:u.c, a:['vb.'+(u.type==='mudari'?'mudari':u.type), st, 'sv.'+k+'.'+u.sg]};
}
function reviewAll(){
  const has = f => E.some(u=>f(u)), fnOf = u => u.type==='noun'?u.fn.split('.')[1]:(u.type==='mabni'&&u.kind!=='zarf'?(u.mfn||'').split('.')[1]:'');
  return E.map((u,i)=>{
    const er=[], wn=[], pv = E[i-1];
    if (u.type==='noun'){ const g = u.fn.split('.')[0], sg = PIECES['sg.'+g+'.'+u.sign];
      if (!sg || !sg.ok.includes(u.m)){ er.push(`علامة ${CASE_AR[g]} لـ«${M_LABEL[u.m]}» هي ${PIECES['sg.'+g+'.'+expNoun(g,u.m)].label} وليست ${sg?sg.label:'غير محددة'}.`); } }
    if (u.type==='madi'||u.type==='mudari'||u.type==='amr'){ const k = vkey(u), sg = PIECES['sv.'+k+'.'+u.sg], e = expVerb(k,u.c);
      if (!e) er.push(`حال الفعل («${C_LABEL[u.c]}») لا تناسب هذه الحالة الإعرابية. اختر حالة أخرى.`);
      else if (!sg || !sg.ok.includes(u.c)) er.push(`الفعل «${C_LABEL[u.c]}» علامته ${e[1]} وليست ${sg?sg.label:'غير محددة'}.`); }
    if (u.type==='mabni' && u.kind!=='zarf' && u.mfn && u.mfn.split('.')[0]!==u.cs) er.push('وظيفة الاسم المبني يجب أن تناسب محله من الإعراب.');
    const f = fnOf(u), anyVerb = has(x=>['madi','mudari','amr'].includes(x.type));
    if (['fail','naib','maful_bih','maful_mutlaq','maful_ajlih','hal','ism_nasikh','khabar_fil'].includes(f) && !anyVerb) wn.push('هذه الوظيفة تحتاج فعلًا في الجملة.');
    if (['khabar'].includes(f) && !has(x=>fnOf(x)==='mubtada')) wn.push('الخبر يحتاج مبتدأً في الجملة.');
    if (['khabar_harf','ism_harf'].includes(f) && !has(x=>x.type==='harf'&&x.hk==='nasikh')) wn.push('هذه الوظيفة تحتاج حرفًا ناسخًا (إنّ وأخواتها).');
    if (f==='mubtada2' && !has(x=>fnOf(x)==='mubtada')) wn.push('المبتدأ الثاني يحتاج مبتدأً أول.');
    if (f==='khabar_m2' && !has(x=>fnOf(x)==='mubtada2')) wn.push('خبر المبتدأ الثاني يحتاج مبتدأً ثانيًا.');
    if (f==='maful_bih2' && !has(x=>fnOf(x)==='maful_bih')) wn.push('المفعول به الثاني يحتاج مفعولًا به أول.');
    if (f==='ism_majrur' && !(pv && pv.type==='harf' && pv.hk==='jarr')) wn.push('الاسم المجرور يأتي بعد حرف جر.');
    if (f==='mudaf_ilayh' && !(i>0 && ['noun','mabni'].includes(pv.type))) wn.push('المضاف إليه يأتي بعد اسم.');
    if (['nat','nat2','tawkid_manawi','tawkid_lafzi','badal'].includes(f) && !(i>0 && ['noun','mabni'].includes(pv.type))) wn.push('هذه الوظيفة تتبع اسمًا قبلها.');
    if (f==='matuf' && !(i>0 && pv.type==='harf' && pv.hk==='atf')) wn.push('المعطوف يأتي بعد حرف عطف.');
    if (u.type==='mudari'){
      if (u.mode==='nasb' && !(pv && pv.type==='harf' && pv.hk==='nasb')) wn.push('المضارع المنصوب يسبقه حرف نصب.');
      if (u.mode==='jazm' && !(pv && pv.type==='harf' && pv.hk==='jazm') && !has(x=>x.type==='mabni'&&x.kind==='shart')) wn.push('المضارع المجزوم يسبقه حرف جزم أو اسم شرط.');
      if (u.mode==='raf' && pv && pv.type==='harf' && ['nasb','jazm'].includes(pv.hk)) wn.push('قبله حرف ينصب أو يجزم، فهل هو مرفوع حقًا؟');
    }
    return {er,wn,parse:parse(unitData(u))};
  });
}
function ctrlHtml(u,i){
  const sel = (f,list,val,label)=>`<label>${label}<select data-i="${i}" data-f="${f}">${list.map(x=>opt(x[0],x[1],val)).join('')}</select></label>`;
  let h = sel('type',TYPES,u.type,'نوع الكلمة');
  if (u.type==='noun'){ const g = u.fn.split('.')[0];
    h += `<label>الوظيفة<select data-i="${i}" data-f="fn">${fnOpts(u.fn)}</select></label>` + sel('m',Object.keys(M_LABEL).map(k=>[k,M_LABEL[k]]),u.m,'صورة الكلمة') + sel('sign',NOUN_SIGNS[g].map(s=>[s[0],s[1]]),u.sign,'العلامة'); }
  if (u.type==='mabni'){ h += sel('kind',KINDS,u.kind,'نوعه') + sel('cs',[['raf','رفع'],['nasb','نصب'],['jarr','جر']],u.cs,'في محل');
    if (u.kind!=='zarf') h += `<label>وظيفته<select data-i="${i}" data-f="mfn">${fnOpts(u.mfn,u.cs)}</select></label>`; }
  if (u.type==='harf') h += sel('hk',HKS,u.hk,'نوع الحرف');
  if (['madi','mudari','amr'].includes(u.type)){ const k = vkey(u);
    if (u.type==='mudari') h += sel('mode',[['raf','مرفوع'],['nasb','منصوب'],['jazm','مجزوم'],['mabni','مبني']],u.mode,'حالته');
    h += sel('c',Object.keys(C_LABEL).map(x=>[x,C_LABEL[x]]),u.c,'حال الفعل') + sel('sg',VERB_SIGNS[k].map(s=>[s[0],s[1]]),u.sg,'العلامة'); }
  return h;
}
function edRender(){
  const R = reviewAll();
  $('#edRows').innerHTML = E.map((u,i)=>`<div class="urow"><div class="uw">${u.t}</div><div class="ctrls">${ctrlHtml(u,i)}</div><div class="ust">${R[i].er.map(x=>`<div class="er">✖ ${x}</div>`).join('')}${R[i].wn.map(x=>`<div class="wn">⚠ ${x}</div>`).join('')}${R[i].er.length?'':`<div class="ok">✔ ${u.t} : ${R[i].parse}</div>`}</div></div>`).join('');
  const nErr = R.reduce((a,r)=>a+r.er.length,0), nWn = R.reduce((a,r)=>a+r.wn.length,0);
  $('#edSum').innerHTML = E.length ? `<div>${nErr?`✖ ${nErr} خطأ يجب تصحيحه`:'✔ إعراب كل الكلمات مطابق لقواعد اللوحة'}${nWn?` — ⚠ ${nWn} تنبيه للمراجعة`:''}</div>` : '';
  $('#edSave').style.display = E.length && !nErr ? '' : 'none';
}
$('#edClose').onclick = ()=>$('#ed').classList.remove('on');
$('#edSplit').onclick = ()=>{ const txt = $('#edIn').value.trim(); if (!txt){ E=[]; edRender(); return; }
  E = []; txt.split(/\s+/).forEach((w,wi)=>w.split('|').filter(Boolean).forEach(p=>{ const u = newUnit(p); u.w = wi; E.push(u); })); edRender(); };
$('#edRows').addEventListener('change', e=>{ const t = e.target; if (!t.dataset.f) return; const u = E[+t.dataset.i], f = t.dataset.f; u[f] = t.value;
  if (f==='type'){ if (u.type==='mudari'){ u.mode='raf'; u.c='sahih'; } else u.c = 'sahih'; if (u.type==='madi') u.c='sahih'; }
  if (f==='mode'){ u.c = u.mode==='mabni' ? 'niswa' : 'sahih'; }
  if (f==='cs'){ u.mfn = (GROUPS[u.cs][1][0] ? u.cs+'.'+GROUPS[u.cs][1][0][0] : ''); }
  if (['type','fn','m','mode','c'].includes(f)) fixUnit(u);
  edRender(); });

/* =====================================================================
   الواجهة الرئيسية + إعدادات المبتكر + الموسيقى + وضع المبتدئين الجديد
   ===================================================================== */
const IMG = { logo:'__GLOGO__', dev:'__LOGO__', photo:'__PHOTO__' };
const ADM0 = ()=>({ title:'عبرميتو', sub:'العب • تعلّم • اكتشف', creator:'أ. عبد الرازق العواضي', role:'مبتكر اللعبة', credit:'', logo:'', photo:'', c1:'', c2:'', c3:'', pin:'', pts:{ok:3,bad:1,flash:1,ext:3}, extS:15, spd:.8, teams:2, music:'mystic', over:{}, hidden:[] });
let ADM = (()=>{ const d = ADM0(); try{ const v = JSON.parse(store.get('ebr-adm','{}'))||{}; Object.assign(d, v); d.pts = Object.assign(ADM0().pts, v.pts||{}); }catch(e){} return d; })();
const saveAdm = ()=>store.set('ebr-adm', JSON.stringify(ADM));
const SP = ()=>(+ADM.spd||1);
const LVN = { 1:'ابتدائي', 2:'إعدادي', 3:'ثانوي', 4:'جملي', 5:'أمثلة الأكاديمية' };
const LVD = { 1:'أساسيات الإعراب بجمل قصيرة', 2:'شرط ونواسخ وأفعال خمسة وتراكيب أوسع', 3:'تراكيب متقدمة وأساليب نحوية', 4:'الجمل التي كتبتموها وأعربتموها', 5:'جمل متقدمة من أكاديمية النحو' };
const txtOf = s => s.words.map(w=>w.map(u=>u.t).join('')).join(' ');

/* ---- الجمل: الأصلية + تعديلات المبتكر + جمل المستخدم ---- */
const BASE = SENTENCES.slice().filter(s=>s.lv!==4).map(s=>{ s._k = s.lv + '|' + txtOf(s); return s; });
function rebuild(){ const out = []; BASE.forEach(s=>{ if (ADM.hidden.includes(s._k)) return; const ov = ADM.over[s._k]; out.push(ov ? Object.assign({}, s, ov, {_k:s._k}) : s); });
  CUSTOM.forEach(s=>out.push(Object.assign({}, s, {_c:true}))); SENTENCES.length = 0; out.forEach(s=>SENTENCES.push(s)); }
function persist(){ store.set('ebr-custom', JSON.stringify(CUSTOM)); }
try{ const v = JSON.parse(store.get('ebr-custom','[]')); if (Array.isArray(v)) CUSTOM = v.filter(s=>s&&s.words&&s.words.every(w=>w.every(u=>u.a&&u.a.every(id=>PIECES[id])))); }catch(e){}
rebuild();
const countLv = lv => SENTENCES.filter(s=>s.lv===lv).length;

/* ---- المؤثرات والموسيقى ---- */
let MG = null, NB = null;
const mctx = ()=>{ AC = AC || new (window.AudioContext||window.webkitAudioContext)(); return AC; };
function musInit(){ const c = mctx(); if (MG) return; MG = c.createGain(); MG.gain.value = 0; const cp = c.createDynamicsCompressor(); MG.connect(cp); cp.connect(c.destination);
  const len = c.sampleRate*.5, b = c.createBuffer(1,len,c.sampleRate), d = b.getChannelData(0); for (let i=0;i<len;i++) d[i] = Math.random()*2-1; NB = b; }
const MUS = { on:false, vol:0, h:null };
const musStart=()=>{}, musStop=()=>{}, setMus=()=>{};
function fx(k){ if (!S.snd) return; try{ const c = mctx(); if (c.state==='suspended') c.resume(); musInit(); const t = c.currentTime;
  if (k==='whoosh'){ const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = NB; f.type = 'bandpass'; f.Q.value = 1.1; f.frequency.setValueAtTime(260,t); f.frequency.exponentialRampToValueAtTime(3400,t+.2);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.26,t+.07); g.gain.exponentialRampToValueAtTime(.001,t+.24); s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); s.stop(t+.28); }
  else if (k==='pop'){ const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(480,t); o.frequency.exponentialRampToValueAtTime(900,t+.08); g.gain.setValueAtTime(.16,t); g.gain.exponentialRampToValueAtTime(.001,t+.12); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+.14); }
  else if (k==='zing'){ [784,988,1319,1568].forEach((f,i)=>{ const o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(.0001,t+i*.055); g.gain.exponentialRampToValueAtTime(.13,t+i*.055+.01); g.gain.exponentialRampToValueAtTime(.001,t+i*.055+.16); o.connect(g); g.connect(c.destination); o.start(t+i*.055); o.stop(t+i*.055+.18); }); }
 }catch(e){} }

/* ---- تطبيق الهوية والألوان ---- */
function applyAdm(){
  const r = document.documentElement, T = (id,v)=>{ const e = $('#'+id); if (e) e.textContent = v; };
  T('gTitle', ADM.title); document.title = ADM.title; T('gSub', ADM.sub); T('hCreator', ADM.creator); T('gBy', ADM.creator);
  T('hCredit', ADM.credit || '');
  $('#hLogo').src = ADM.logo || IMG.logo; $('#hDev').src = IMG.dev; $('#gPhoto').src = ADM.photo || IMG.photo;
  [['--purple',ADM.c1],['--navy',ADM.c2],['--gold',ADM.c3],['--hp',ADM.c1],['--hn',ADM.c2]].forEach(([k,v])=>v ? r.style.setProperty(k,v) : r.style.removeProperty(k));
  const n = $('#set .note'); if (n) n.textContent = `الأرصدة: كل قطعة صحيحة +${ADM.pts.ok}، والخطأ −${ADM.pts.bad}، والومضة −${ADM.pts.flash} ثم −${2*ADM.pts.flash} ثم −${3*ADM.pts.flash}، وإطالة الوقت −${ADM.pts.ext}.`;
}

/* ---- الواجهة الرئيسية ---- */
const hs = { lv:1 };
(function letters(){ const L = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'; $('#hLet').innerHTML = Array.from({length:16},(_,i)=>`<i style="--x:${(i*6.4+Math.random()*4)|0}%;--s:${3+Math.random()*5}rem;--d:${18+Math.random()*16}s;--dl:${-Math.random()*30}s">${L[(i*5+3)%L.length]}</i>`).join(''); })();
function buildHomeLv(){ $('#hLv').innerHTML = [1,2,3,4,5].map(l=>`<button class="h-lv" data-lv="${l}" aria-pressed="${hs.lv===l}"><span><b>${LVN[l]}</b><small>${LVD[l]}</small></span><i>${countLv(l)} جملة</i></button>`).join(''); }
function namesHtml(box, n){ box.innerHTML = Array.from({length:n},(_,i)=>`<input type="text" data-ti="${i}" value="${esc(CFG.names[i])}" aria-label="اسم الفريق ${i+1}" maxlength="24" style="border-inline-start:6px solid ${teamColor(i)}">`).join(''); }
function syncHome(){
  buildHomeLv(); homeSummary();
  $$('#hSys button').forEach(b=>b.setAttribute('aria-pressed', CFG.system===b.dataset.v)); $$('#hMode button').forEach(b=>b.setAttribute('aria-pressed', CFG.mode===b.dataset.v));
  $('#hTeams').hidden = !isTeams(); $('#hTimed').hidden = CFG.mode!=='timed'; $('#hN').value = CFG.n; namesHtml($('#hNames'), CFG.n); $('#hTurn').value = String(CFG.turn);
  $('#hTime').value = CFG.timeSel; $('#hTimeCus').hidden = CFG.timeSel!=='cus'; $('#hTimeCus').value = CFG.timeCus;
  $('#hSnd').setAttribute('aria-pressed', S.snd); $('#hSnd').textContent = S.snd?'تشغيل':'إيقاف';
  const dark = document.documentElement.dataset.theme==='dark'; $$('#hTheme button').forEach(b=>b.setAttribute('aria-pressed', (b.dataset.v==='dark')===dark));
}
function showHome(){ const h = $('#home'); timerStop(); cancelFx(); syncHome(); h.hidden = false; void h.offsetWidth; h.classList.remove('out'); document.body.classList.add('homing'); fx('whoosh'); }
function startGame(){
  S.lv = hs.lv; $$('#lvseg button').forEach(b=>b.setAttribute('aria-pressed', +b.dataset.lv===S.lv)); S.scores.fill(0); S.team = 0; syncSet();
  const h = $('#home'); h.classList.add('out'); fx('whoosh'); beep('start');
  const a = $('#app'); a.classList.remove('enter'); void a.offsetWidth; a.classList.add('enter'); load(0);
  setTimeout(()=>{ h.hidden = true; document.body.classList.remove('homing'); }, 520);
}
$('#home').addEventListener('click', e=>{
  const lv = e.target.closest('.h-lv'); if (lv){ hs.lv = +lv.dataset.lv; buildHomeLv(); fx('pop'); return; }
  const sy = e.target.closest('#hSys button'); if (sy){ CFG.system = sy.dataset.v; syncHome(); fx('pop'); return; }
  const md = e.target.closest('#hMode button'); if (md){ CFG.mode = md.dataset.v; syncHome(); fx('pop'); return; }
  const th = e.target.closest('#hTheme button'); if (th){ const v = th.dataset.v; document.documentElement.dataset.theme = v; store.set('ebr-theme', v); syncHome(); return; }
});
const MODEN = {normal:'عادي', timed:'تحدي الوقت', beginner:'وضع المبتدئين'};
function homeSummary(){ $('#hvLv').textContent = LVN[hs.lv]; $('#hvSys').textContent = isTeams() ? 'مسابقة · '+CFG.n+' فرق' : 'تمرين فردي'; $('#hvMode').textContent = MODEN[CFG.mode]; $('#hvOpt').textContent = (S.snd?'صوت':'بلا صوت')+' · '+(document.documentElement.dataset.theme==='dark'?'داكن':'فاتح'); }
function openPk(k){ $$('.pk').forEach(p=>p.hidden = true); $('#pk-'+k).hidden = false; fx('pop'); }
function closePk(){ $$('.pk').forEach(p=>p.hidden = true); homeSummary(); }
$('#home').addEventListener('click', e=>{
  const pb = e.target.closest('.h-pick'); if (pb){ syncHome(); openPk(pb.dataset.pk); return; }
  if (e.target.closest('.pk-ok') && !e.target.closest('#ownGo')){ closePk(); return; }
  if (e.target.classList.contains('pk')){ closePk(); return; }
  if (e.target.closest('.h-lv')) setTimeout(closePk,160);
  if (e.target.closest('#hMode button') && CFG.mode!=='timed') setTimeout(closePk,160);
  if (e.target.closest('#hSys button') && !isTeams()) setTimeout(closePk,160);
});
$('#hN').addEventListener('input', homeSummary);
$('#hN').oninput = e=>{ CFG.n = Math.max(2, Math.min(20, +e.target.value||2)); namesHtml($('#hNames'), CFG.n); };
$('#hNames').oninput = e=>{ const i = e.target.dataset.ti; if (i!==undefined) CFG.names[+i] = e.target.value || ('فريق ' + (+i+1)); };
$('#hTurn').onchange = e=>{ CFG.turn = +e.target.value; };
$('#hTime').onchange = e=>{ CFG.timeSel = e.target.value; $('#hTimeCus').hidden = CFG.timeSel!=='cus'; };
$('#hTimeCus').oninput = e=>{ CFG.timeCus = +e.target.value; };
$('#hSnd').onclick = ()=>{ S.snd = !S.snd; store.set('ebr-snd', S.snd?'1':'0'); $('#bSnd').setAttribute('aria-pressed', S.snd); syncHome(); };
$('#hZm').onclick = ()=>$('#bZm').click(); $('#hZl').onclick = ()=>$('#bZl').click();
$('#hStart').onclick = startGame;
$('#hEd').onclick = ()=>$('#bEd').click();
$('#bHome').onclick = showHome;
S.snd = store.get('ebr-snd','1')==='1'; $('#bSnd').setAttribute('aria-pressed', S.snd);
$('#bSnd').onclick = e=>{ S.snd = !S.snd; store.set('ebr-snd', S.snd?'1':'0'); e.currentTarget.setAttribute('aria-pressed', S.snd); };
if (!store.get('ebr-theme','')) document.documentElement.dataset.theme = 'dark';

/* ---- وضع المبتدئين: خانة الكلمة فقط ---- */
function trayFilter(u){
  $$('.tray .bh').forEach(e=>e.classList.remove('bh'));
  const act = CFG.mode==='beginner' && u && !S.done; $('.tray').classList.toggle('beg', !!act);
  if (!act) return;
  const a = u.a, f = a[0], t = tabOf(f);
  $$('#tabs button').forEach(b=>{ if (b.dataset.t!==t) b.classList.add('bh'); });
  if (t==='n'){ const gs = /^(raf|nasb|jarr)\./.test(f) ? [f.split('.')[0]] : ['mb'].concat(a[3] ? [a[3].split('.')[0]] : []); $$('#sn .grp').forEach(e=>{ if (!gs.includes(e.dataset.g)) e.classList.add('bh'); }); }
  if (t==='v'){ const g = f==='vb.madi'?'madi':f==='vb.amr'?'amr':'mudari'; $$('#sv .vblock').forEach(e=>{ if (e.dataset.g!==g) e.classList.add('bh'); });
    if (g==='mudari'){ const st = a[1], key = st==='st.mudari_mabni' ? 'mabni' : st.slice(3).replace('_bi',''); $$('#sv [data-st]').forEach(e=>{ if (e.dataset.st!==key) e.classList.add('bh'); }); }
    const pb = $(`#sv .btn-p[data-id="${f}"]`); if (pb) pb.classList.add('bh'); }
}

/* ---- لوحة تعديل اللعبة ---- */
let admOK = false;

/* ---- صلاحية المالك ---- */
const OWNER_HASH = '12b8859e96213fda406c78d46c316d635854a97ae6435f0d6d016a2e20276ad6';
let OWN = false;
async function sha(t){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }
function applyOwn(){ document.body.classList.toggle('own', OWN); $('#hLock').hidden = OWN || !!window.claude; }
(async()=>{ try{ if (window.claude && window.claude.use){ const u = await window.claude.use('user'); OWN = !!(u && await u.isOwner()); } else OWN = sessionStorage.getItem('ebr-own')==='1'; }catch(e){} applyOwn(); })();
$('#hLock').onclick = ()=>{ $('#ownPin').value = ''; $('#ownMsg').textContent = ''; openPk('own'); setTimeout(()=>$('#ownPin').focus(),50); };
$('#ownGo').onclick = async()=>{ let ok = false; try{ ok = (await sha($('#ownPin').value.trim())) === OWNER_HASH; }catch(e){} if (ok){ OWN = true; try{ sessionStorage.setItem('ebr-own','1'); }catch(e){} applyOwn(); closePk(); } else { $('#ownPin').value = ''; $('#ownMsg').textContent = 'الرمز غير صحيح'; } };
$('#ownPin').addEventListener('keydown', e=>{ if (e.key==='Enter') $('#ownGo').click(); });
function openAdm(){ if (!OWN) return; $('#adm').classList.add('on'); admOK = !ADM.pin; $('#admLock').hidden = admOK; $('#admBody').hidden = !admOK; if (admOK) fillAdm(); else { $('#admPin').value = ''; $('#admPin').focus(); } }
function fillAdm(){
  const v = (id,val)=>{ $('#'+id).value = val; };
  v('aTitle',ADM.title); v('aSub',ADM.sub); v('aCreator',ADM.creator); v('aRole',ADM.role); v('aCredit',ADM.credit||''); v('aPin',ADM.pin||'');
  $('#aLogoP').src = ADM.logo || IMG.logo; $('#aPhotoP').src = ADM.photo || IMG.photo;
  v('aC1',ADM.c1||'#5b34c9'); v('aC2',ADM.c2||'#1767a8'); v('aC3',ADM.c3||'#ffd23f');
  v('aOk',ADM.pts.ok); v('aBad',ADM.pts.bad); v('aFl',ADM.pts.flash); v('aExt',ADM.pts.ext); v('aExtS',ADM.extS); v('aSpd',String(ADM.spd)); v('aTeams',ADM.teams);
  admList();
}
function effLv(s){ return s.lv; }
function admList(){
  const rows = [];
  BASE.forEach(b=>{ const ov = ADM.over[b._k], s = ov ? Object.assign({}, b, ov) : b; rows.push({s, k:b._k, hid:ADM.hidden.includes(b._k)}); });
  CUSTOM.forEach((c,i)=>rows.push({s:c, ci:i}));
  $('#aList').innerHTML = [1,2,3,4,5].map(l=>{ const rs = rows.filter(r=>r.s.lv===l); if (!rs.length) return '';
    return `<div class="lvh">${LVN[l]} (${rs.length})</div>` + rs.map(r=>{ const id = r.k!==undefined ? 'data-k="'+esc(r.k)+'"' : 'data-ci="'+r.ci+'"';
      return `<div class="srow${r.hid?' hid':''}" ${id}><div class="t">${txtOf(r.s)}</div><div class="bt"><select data-a="lv">${[1,2,3,4,5].map(x=>opt(x,LVN[x],r.s.lv)).join('')}</select><button data-a="parse">تعديل الإعراب</button><button data-a="txt">المغزى واللمحة</button>${r.k!==undefined?`<button data-a="hide">${r.hid?'إظهار':'إخفاء'}</button>`:'<button data-a="del">حذف</button>'}</div></div>`; }).join(''); }).join('');
}
const rowRef = el => { const r = el.closest('.srow'); return r.dataset.k!==undefined ? {k:r.dataset.k} : {ci:+r.dataset.ci}; };
const sentOf = ref => ref.k!==undefined ? (()=>{ const b = BASE.find(x=>x._k===ref.k); return Object.assign({}, b, ADM.over[ref.k]||{}); })() : CUSTOM[ref.ci];
function setOver(ref, patch){ if (ref.k!==undefined) ADM.over[ref.k] = Object.assign(ADM.over[ref.k]||{}, patch); else Object.assign(CUSTOM[ref.ci], patch); }
function admRefresh(){ saveAdm(); persist(); rebuild(); admList(); buildHomeLv(); if ($('#home').hidden) load(Math.min(S.si, Math.max(0, levelList().length-1))); }
$('#aList').addEventListener('change', e=>{ if (e.target.dataset.a!=='lv') return; setOver(rowRef(e.target), {lv:+e.target.value}); admRefresh(); });
$('#aList').addEventListener('click', e=>{ const b = e.target.closest('button[data-a]'); if (!b) return; const ref = rowRef(b), a = b.dataset.a;
  if (a==='hide'){ const i = ADM.hidden.indexOf(ref.k); i<0 ? ADM.hidden.push(ref.k) : ADM.hidden.splice(i,1); admRefresh(); }
  if (a==='del'){ if (confirm('حذف هذه الجملة نهائيًا؟')){ CUSTOM.splice(ref.ci,1); admRefresh(); } }
  if (a==='parse') edOpen(sentOf(ref), ref);
  if (a==='txt') openStx(ref); });
let stxRef = null;
function openStx(ref){ stxRef = ref; const s = sentOf(ref); $('#xS').textContent = txtOf(s); $('#xM').value = s.meaning||''; $('#xF').value = s.faida||'';
  $('#xD').value = (s.detail||[]).map(d=>d[0]+': '+d[1]).join('\n'); $('#stx').classList.add('on'); }
$('#xOk').onclick = ()=>{ const det = $('#xD').value.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{ const i = l.indexOf(':'); return i<0 ? [l,''] : [l.slice(0,i).trim(), l.slice(i+1).trim()]; });
  setOver(stxRef, {meaning:$('#xM').value.trim()||undefined, faida:$('#xF').value.trim()||undefined, detail:det.length?det:null}); $('#stx').classList.remove('on'); admRefresh(); };
$('#xX').onclick = ()=>$('#stx').classList.remove('on');
$('#aTabs').addEventListener('click', e=>{ const b = e.target.closest('button'); if (!b) return; $$('#aTabs button').forEach(x=>x.setAttribute('aria-selected', x===b)); $$('.adm .ap').forEach(p=>p.classList.toggle('on', p.id==='ap-'+b.dataset.t)); });
function readImg(file, cb){ const fr = new FileReader(); fr.onload = ()=>{ const im = new Image(); im.onload = ()=>{ const s = Math.min(520/Math.max(im.width,im.height),1), c = document.createElement('canvas'); c.width = Math.round(im.width*s); c.height = Math.round(im.height*s); const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height); cb(c.toDataURL('image/jpeg',.86)); }; im.src = fr.result; }; fr.readAsDataURL(file); }
$('#aLogo').onchange = e=>{ const f = e.target.files[0]; if (f) readImg(f, d=>{ ADM.logo = d; $('#aLogoP').src = d; applyAdm(); saveAdm(); }); };
$('#aPhoto').onchange = e=>{ const f = e.target.files[0]; if (f) readImg(f, d=>{ ADM.photo = d; $('#aPhotoP').src = d; applyAdm(); saveAdm(); }); };
$('#aCReset').onclick = ()=>{ ADM.c1 = ADM.c2 = ADM.c3 = ''; applyAdm(); fillAdm(); saveAdm(); };
$('#admSave').onclick = ()=>{ const g = id=>$('#'+id).value, n = (id,d,lo,hi)=>Math.max(lo,Math.min(hi, isNaN(+g(id)) || g(id)==='' ? d : +g(id)));
  ADM.title = g('aTitle').trim()||'عبرميتو'; ADM.sub = g('aSub').trim(); ADM.creator = g('aCreator').trim()||'الأستاذ عبد الرازق العواضي'; ADM.role = g('aRole').trim(); ADM.credit = g('aCredit').trim(); ADM.pin = g('aPin').trim();
  const colr = (id,def)=>{ const v = g(id).toLowerCase(); return v===def ? '' : v; }; ADM.c1 = colr('aC1','#5b34c9'); ADM.c2 = colr('aC2','#1767a8'); ADM.c3 = colr('aC3','#ffd23f');
  ADM.pts = {ok:n('aOk',3,0,20), bad:n('aBad',1,0,20), flash:n('aFl',1,0,10), ext:n('aExt',3,0,20)}; ADM.extS = n('aExtS',15,5,120); ADM.spd = +g('aSpd'); ADM.teams = n('aTeams',2,2,20);
  CFG.n = ADM.teams; saveAdm(); applyAdm(); syncHome(); $('#adm').classList.remove('on'); };
$('#admX').onclick = $('#admX0').onclick = ()=>$('#adm').classList.remove('on');
$('#admUnlock').onclick = ()=>{ if ($('#admPin').value.trim()===ADM.pin){ admOK = true; $('#admLock').hidden = true; $('#admBody').hidden = false; fillAdm(); } else { $('#admPin').value = ''; $('#admPin').placeholder = 'رمز غير صحيح'; } };
$('#hAdm').onclick = openAdm;
$('#aNew').onclick = ()=>edOpen(null, null);
$('#aExp').onclick = ()=>{ const data = JSON.stringify({v:1, adm:ADM, custom:CUSTOM}, null, 1), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data],{type:'application/json'})); a.download = 'ebrameeto-backup.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); };
$('#aImp').onchange = e=>{ const f = e.target.files[0]; if (!f) return; const fr = new FileReader(); fr.onload = ()=>{ try{ const d = JSON.parse(fr.result); if (d.adm) ADM = Object.assign(ADM0(), d.adm, {pts:Object.assign(ADM0().pts,(d.adm||{}).pts||{})}); if (Array.isArray(d.custom)) CUSTOM = d.custom.filter(s=>s&&s.words&&s.words.every(w=>w.every(u=>u.a&&u.a.every(id=>PIECES[id])))); saveAdm(); persist(); rebuild(); applyAdm(); fillAdm(); syncHome(); alert('تم استيراد النسخة.'); }catch(err){ alert('ملف غير صالح.'); } }; fr.readAsText(f); };
$('#aReset').onclick = ()=>{ if (!confirm('سيُمسح كل تعديل وكل جملة أضفتموها. متابعة؟')) return; ADM = ADM0(); CUSTOM = []; saveAdm(); persist(); rebuild(); applyAdm(); fillAdm(); syncHome(); };

/* ---- محرر الجمل (إضافة وتعديل أي جملة) ---- */
let edRef = null;
function unitToEd(u,w){ const a = u.a, f = a[0], o = newUnit(u.t); o.w = w;
  if (/^(raf|nasb|jarr)\./.test(f)){ o.type = 'noun'; o.fn = f; o.m = u.m||o.m; o.sign = a[2].split('.')[2]; }
  else if (f.startsWith('mb.')){ o.type = 'mabni'; o.kind = f.slice(3); o.cs = a[2].split('.')[2]; o.mfn = a[3]||''; }
  else if (f.startsWith('hf.')){ o.type = 'harf'; o.hk = f.slice(3); }
  else { const t = f.slice(3); o.type = t; o.c = u.c||'sahih'; o.sg = a[2].split('.').slice(2).join('.'); if (t==='mudari'){ const st = a[1]; o.mode = st==='st.mudari_mabni' ? 'mabni' : st.slice(3).replace('_bi',''); } }
  return o; }
function edOpen(sent, ref){ edRef = ref; E = [];
  if (sent){ sent.words.forEach((w,wi)=>w.forEach(u=>E.push(unitToEd(u,wi)))); $('#edIn').value = sent.words.map(w=>w.map(u=>u.t).join('|')).join(' ');
    $('#edLv').value = String(sent.lv); $('#edMean').value = sent.meaning||''; $('#edFa').value = sent.faida||''; }
  else { $('#edIn').value = ''; $('#edMean').value = ''; $('#edFa').value = ''; $('#edLv').value = '4'; }
  edRender(); edSaved(); $('#ed').classList.add('on'); }
$('#bEd').onclick = ()=>{ if (OWN) edOpen(null,null); };
function edSaved(){ $('#edSaved').innerHTML = CUSTOM.length ? CUSTOM.map((s,i)=>`<span>${txtOf(s)}<button data-del="${i}" aria-label="حذف">×</button></span>`).join('') : '<small>لا توجد جمل مضافة بعد.</small>'; }
$('#edSave').onclick = ()=>{ const R = reviewAll(); if (R.some(r=>r.er.length)) return;
  const words = []; E.forEach(u=>{ (words[u.w] = words[u.w]||[]).push(unitData(u)); });
  const lv = +$('#edLv').value, meaning = $('#edMean').value.trim()||undefined, faida = $('#edFa').value.trim()||undefined, ws = words.filter(Boolean);
  if (edRef && edRef.k!==undefined){ ADM.over[edRef.k] = Object.assign(ADM.over[edRef.k]||{}, {lv, words:ws, meaning, faida, detail:null}); }
  else if (edRef){ const old = CUSTOM[edRef.ci]; CUSTOM[edRef.ci] = {lv, words:ws, meaning, faida, detail:null}; }
  else CUSTOM.push({lv, words:ws, meaning, faida});
  saveAdm(); persist(); rebuild(); $('#ed').classList.remove('on'); admList(); buildHomeLv();
  S.lv = lv; $$('#lvseg button').forEach(b=>b.setAttribute('aria-pressed', +b.dataset.lv===lv)); hs.lv = lv;
  if ($('#home').hidden){ const i = levelList().findIndex(s=>txtOf(s)===ws.map(w=>w.map(u=>u.t).join('')).join(' ')); load(Math.max(0,i)); } };
$('#edSaved').addEventListener('click', e=>{ const d = e.target.dataset.del; if (d===undefined) return; CUSTOM.splice(+d,1); persist(); rebuild(); edSaved(); admList(); buildHomeLv(); if (S.lv===4 && $('#home').hidden) load(0); });
window.__EBR = { unitToEd, unitData, BASE, newUnit, fixUnit };

applyAdm(); CFG.n = ADM.teams; syncHome(); syncSet();
document.body.classList.add('homing');

load(0);
})();
