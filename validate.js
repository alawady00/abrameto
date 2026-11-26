const D = require('./data.js'); const { PIECES, SENTENCES } = D; let err = 0;
const bad = m => { console.log('ERR', m); err++; };
SENTENCES.forEach((s, i) => s.words.forEach(w => w.forEach(u => {
  const a = u.a, id = `#${i} ${u.t}`;
  a.forEach(p => { if (!PIECES[p]) bad(id + ' missing ' + p); });
  const f = a[0];
  if (/^(raf|nasb|jarr)\./.test(f)) {            // اسم معرب
    const g = f.split('.')[0];
    if (a[1] !== 'hd.' + g) bad(id + ' header mismatch');
    const sg = PIECES[a[2]];
    if (!sg || sg.grp !== g) bad(id + ' sign group');
    else if (!sg.ok.includes(u.m)) bad(id + ` sign ${a[2]} vs morph ${u.m}`);
    if (a.length !== 3) bad(id + ' len');
  } else if (f.startsWith('mb.')) {
    if (a[1] !== 'st.mahal' || !a[2].startsWith('sg.mahal.')) bad(id + ' mabni chain');
    const c = a[2].split('.')[2]; if (a[3] && !a[3].startsWith(c + '.')) bad(id + ' mahal case vs function');
  } else if (f.startsWith('vb.')) {
    const k = f.split('.')[1], sg = PIECES[a[2]];
    const grp = a[2].split('.')[1];
    const exp = { madi: 'madi', mudari: null, amr: 'amr' }[k];
    if (k !== 'mudari' && grp !== exp) bad(id + ' verb sign grp');
    if (k === 'mudari') {
      const st = a[1];
      const ok = (st === 'st.raf_bi' && grp === 'raf') || (st === 'st.nasb_bi' && grp === 'nasb') || (st === 'st.jazm_bi' && grp === 'jazm') || (st === 'st.mudari_mabni' && grp === 'mudari_mabni');
      if (!ok) bad(id + ' mudari state/sign');
    }
    if (!sg.ok.includes(u.c)) bad(id + ` verb cond ${u.c} vs ${a[2]}`);
  } else if (f.startsWith('hf.')) { if (a.join() !== [f, 'hf.mabni', 'hf.nomahal'].join()) bad(id + ' harf'); }
  else bad(id + ' unknown');
})));
console.log('sentences', SENTENCES.length, 'pieces', Object.keys(PIECES).length, err ? 'ERRORS ' + err : 'ALL VALID');
process.exit(err ? 1 : 0);
