/* InHome Parent Playbook: Coach AI figure, progress store, quiz engine.
   One file, included on every page. No dependencies. */
(function () {
  'use strict';

  /* ---------------- store ---------------- */
  var KEY = 'inhome_pb';
  var CLASSES = ['2027', '2028', '2029', '2030', '2031'];
  var TOTAL = 9;
  var state = { cls: '', pos: '', done: {}, seen: {}, code: '' };
  var CODES = ['PARENTS26', 'KNIGHTS26', 'INHOME-DEMO'];
  function unlocked() { return CODES.indexOf((state.code || '').toUpperCase()) >= 0; }
  var REC = { '2027': 9, '2028': 3, '2029': 1, '2030': 1, '2031': 1 };
  var POSNAME = { qb: 'quarterback', skill: 'skill position', db: 'defensive back', lb: 'linebacker', ol: 'offensive lineman', dl: 'defensive lineman', k: 'specialist', ath: 'athlete' };
  var POSTIP = {
    qb: 'Quarterback is the hardest room in recruiting, so Module 2 has a lesson just on it, and full game film matters more for him than for anyone else.',
    skill: 'For a skill position, a season of track will move his profile more than any camp you can buy. Module 8 covers why.',
    db: 'The first thing a staff screens a defensive back for is whether he can flip his hips and run. Module 2 has the rest.',
    lb: 'For a linebacker they want to see him trigger downhill instead of waiting to see it. Module 2 covers what gets screened first.',
    ol: 'For a lineman, wrestling in the offseason does what no camp does: bend, leverage and hands. Module 8 covers it.',
    dl: 'For a defensive lineman it is get-off and hands, and wrestling in the offseason builds both. Modules 2 and 8.',
    k: 'Specialists are recruited on verified numbers and clean film more than anything else. Module 3 and Module 8 matter most.',
    ath: 'Until he settles on a position, Module 2 is the one to work: it is how a staff decides where he actually fits.'
  };
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || '{}'); if (s && typeof s === 'object') state = Object.assign(state, s); } catch (e) {}
    try {
      var p = new URLSearchParams(location.search).get('class');
      if (p && CLASSES.indexOf(p) >= 0 && p !== state.cls) { state.cls = p; save(); }
    } catch (e) {}
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function passedCount() { var n = 0; for (var k in state.done) if (state.done[k] && state.done[k].pass) n++; return n; }
  function nextModule() { for (var i = 1; i <= TOTAL; i++) if (!(state.done[i] && state.done[i].pass)) return i; return 0; }
  function totals() { var c = 0, t = 0; for (var k in state.done) { c += state.done[k].score || 0; t += state.done[k].total || 0; } return { c: c, t: t }; }
  load();

  var body = document.body;
  var PAGE = body.getAttribute('data-page') || 'other';
  var MOD = parseInt(body.getAttribute('data-module') || '0', 10);
  var MODTITLE = body.getAttribute('data-title') || '';

  /* ---------------- styles ---------------- */
  var css = '\
.ch-fab{position:fixed;right:18px;bottom:18px;z-index:900;display:flex;align-items:flex-end;gap:10px;font-family:Inter,system-ui,sans-serif}\
.ch-btn{width:62px;height:62px;border-radius:50%;background:var(--panel,#0D0D0F);border:1.5px solid var(--signal,#E5231D);box-shadow:0 10px 30px rgba(0,0,0,.5);cursor:pointer;padding:0;position:relative;transition:transform .15s}\
.ch-btn:hover{transform:translateY(-2px)}\
.ch-btn svg{width:100%;height:100%;display:block}\
.ch-btn .dot{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:var(--signal,#E5231D);border:2px solid var(--ink,#050506)}\
.ch-tease{max-width:260px;background:var(--bone,#EDEDEA);color:#111;border-radius:12px 12px 2px 12px;padding:12px 14px;font-size:14px;line-height:1.4;box-shadow:0 10px 30px rgba(0,0,0,.45);position:relative;animation:chIn .25s ease-out}\
.ch-tease b{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--signal,#E5231D);margin-bottom:4px}\
.ch-tease .x{position:absolute;top:4px;right:8px;border:0;background:none;font-size:16px;cursor:pointer;color:#777}\
@keyframes chIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\
.ch-panel{position:fixed;right:18px;bottom:92px;width:min(380px,calc(100vw - 36px));max-height:min(640px,calc(100vh - 120px));z-index:901;background:var(--panel,#0D0D0F);border:1px solid var(--line,rgba(237,237,234,.14));border-radius:4px;box-shadow:0 24px 60px rgba(0,0,0,.6);display:none;flex-direction:column;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:var(--bone,#EDEDEA)}\
.ch-panel.open{display:flex}\
.ch-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line,rgba(237,237,234,.14));background:var(--panel-2,#141417)}\
.ch-head .av{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--signal,#E5231D);flex:none;background:var(--ink,#050506)}\
.ch-head .av svg{width:100%;height:100%}\
.ch-head .t{font-family:var(--display,Anton,Impact,sans-serif);font-size:20px;letter-spacing:.03em;text-transform:uppercase;line-height:1}\
.ch-head .s{font-family:var(--mono,monospace);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute,#8E8E93);margin-top:5px}\
.ch-head .close{margin-left:auto;background:none;border:0;color:var(--mute,#8E8E93);font-size:20px;cursor:pointer}\
.ch-log{padding:14px 16px;overflow:auto;flex:1;display:flex;flex-direction:column;gap:10px}\
.ch-msg{font-size:14px;line-height:1.5;padding:10px 13px;border-radius:10px;white-space:pre-line;max-width:92%}\
.ch-msg.coach{background:var(--panel-2,#141417);border:1px solid var(--line,rgba(237,237,234,.14));border-top-left-radius:2px;align-self:flex-start}\
.ch-msg.me{background:var(--signal,#E5231D);color:#fff;border-top-right-radius:2px;align-self:flex-end}\
.ch-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px}\
.ch-chip{font-family:var(--mono,monospace);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--line,rgba(237,237,234,.14));background:none;color:var(--bone,#EDEDEA);padding:7px 10px;border-radius:2px;cursor:pointer;text-align:left}\
.ch-chip:hover{border-color:var(--bone,#EDEDEA)}\
.ch-cls{display:flex;align-items:center;gap:6px;padding:10px 16px;border-top:1px solid var(--line,rgba(237,237,234,.14));font-family:var(--mono,monospace);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute,#8E8E93)}\
.ch-cls button{font:inherit;color:inherit;background:none;border:1px solid var(--line,rgba(237,237,234,.14));padding:5px 7px;border-radius:2px;cursor:pointer}\
.ch-cls button.on{color:#fff;background:var(--signal,#E5231D);border-color:var(--signal,#E5231D)}\
.ch-ask{display:flex;gap:8px;padding:10px 16px 14px}\
.ch-ask input{flex:1;background:var(--ink,#050506);border:1px solid var(--line,rgba(237,237,234,.14));color:var(--bone,#EDEDEA);padding:10px 12px;border-radius:2px;font:inherit;font-size:14px}\
.ch-ask button{font-family:var(--mono,monospace);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;background:var(--signal,#E5231D);color:#fff;border:0;padding:0 14px;border-radius:2px;cursor:pointer}\
/* progress + quiz */\
.gate{margin:0 auto;max-width:720px;padding:0 var(--gut,24px)}.gate .box{background:var(--panel,#0D0D0F);border:1px solid var(--signal,#E5231D);border-radius:3px;padding:clamp(22px,3.4vw,34px);margin:30px 0 10px}.gate h3{font-family:var(--display,Anton,Impact,sans-serif);font-weight:400;font-size:30px;line-height:1.05;text-transform:uppercase;margin:10px 0 8px}.gate p{color:#C9C9C6;margin:0 0 16px;max-width:60ch}.gate form{display:flex;gap:8px;flex-wrap:wrap}.gate input{flex:1;min-width:200px;background:var(--ink,#050506);border:1px solid var(--line,rgba(237,237,234,.14));color:var(--bone,#EDEDEA);padding:12px 14px;border-radius:2px;font:inherit;font-size:16px;letter-spacing:.08em;text-transform:uppercase}.gate .err{color:var(--signal,#E5231D);font-size:14px;margin:10px 0 0;display:none}body.gated .lesson,body.gated .closing{filter:blur(6px);pointer-events:none;user-select:none;max-height:420px;overflow:hidden;position:relative}\
.pb-prog{margin-top:34px;background:var(--panel,#0D0D0F);border:1px solid var(--line,rgba(237,237,234,.14));border-radius:3px;padding:22px 24px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center}\
.pb-prog .bar{height:8px;background:var(--panel-2,#141417);border-radius:4px;overflow:hidden;margin-top:12px}\
.pb-prog .bar i{display:block;height:100%;width:0;background:var(--signal,#E5231D);transition:width .6s ease}\
.pb-prog .big{font-family:var(--display,Anton,Impact,sans-serif);font-size:34px;line-height:1;text-transform:uppercase}\
.pb-prog .score{font-family:var(--mono,monospace);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute,#8E8E93);margin-top:6px}\
@media (max-width:640px){.pb-prog{grid-template-columns:1fr}}\
.mod{position:relative}\
.mod .stamp{position:absolute;top:18px;right:18px;font-family:var(--mono,monospace);font-size:10px;letter-spacing:.16em;text-transform:uppercase;padding:5px 8px;border-radius:2px;border:1px solid var(--line,rgba(237,237,234,.14));color:var(--mute,#8E8E93)}\
.mod .stamp.done{color:#fff;background:var(--signal,#E5231D);border-color:var(--signal,#E5231D)}\
.mod .stamp.next{color:var(--bone,#EDEDEA);border-color:var(--bone,#EDEDEA)}\
.quiz{margin-top:44px;background:var(--panel,#0D0D0F);border:1px solid var(--line,rgba(237,237,234,.14));border-radius:3px;padding:clamp(22px,3.4vw,34px)}\
.quiz h3{font-family:var(--display,Anton,Impact,sans-serif);font-weight:400;font-size:30px;line-height:1.05;text-transform:uppercase;margin:10px 0 6px}\
.quiz .sub{color:var(--mute,#8E8E93);margin:0 0 6px;font-size:15px}\
.quiz .clsrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:14px 0 6px;font-family:var(--mono,monospace);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--mute,#8E8E93)}\
.quiz .clsrow button{font:inherit;color:inherit;background:none;border:1px solid var(--line,rgba(237,237,234,.14));padding:6px 8px;border-radius:2px;cursor:pointer}\
.quiz .clsrow button.on{color:#fff;background:var(--signal,#E5231D);border-color:var(--signal,#E5231D)}\
.qq{border-top:1px solid var(--line,rgba(237,237,234,.14));padding:22px 0}\
.qq[hidden]{display:none}\
.qq .n{font-family:var(--mono,monospace);font-size:11px;letter-spacing:.18em;color:var(--signal,#E5231D);font-weight:700}\
.qq p.q{font-size:17px;color:var(--bone,#EDEDEA);margin:8px 0 14px;max-width:68ch}\
.qq .opts{display:grid;gap:8px}\
.qq .opt{text-align:left;font:inherit;font-size:15px;color:#DADAD7;background:var(--ink,#050506);border:1px solid var(--line,rgba(237,237,234,.14));padding:12px 14px;border-radius:2px;cursor:pointer;display:flex;gap:12px;align-items:flex-start}\
.qq .opt .k{font-family:var(--mono,monospace);font-size:11px;color:var(--mute,#8E8E93);padding-top:3px;flex:none}\
.qq .opt:hover{border-color:var(--bone,#EDEDEA)}\
.qq.locked .opt{cursor:default}\
.qq.locked .opt:hover{border-color:var(--line,rgba(237,237,234,.14))}\
.qq .opt.right{border-color:#2FB36B;background:rgba(47,179,107,.12);color:#fff}\
.qq .opt.wrong{border-color:var(--signal,#E5231D);background:rgba(229,35,29,.12)}\
.qq .why{margin:12px 0 0;font-size:14.5px;color:#C9C9C6;max-width:68ch;border-left:2px solid var(--signal,#E5231D);padding-left:14px;display:none}\
.qq.locked .why{display:block}\
.qres{display:none;margin-top:22px;border-top:1px solid var(--line,rgba(237,237,234,.14));padding-top:22px}\
.qres.show{display:block}\
.qres .big{font-family:var(--display,Anton,Impact,sans-serif);font-size:clamp(34px,5vw,54px);line-height:1;text-transform:uppercase}\
.qres .big .red{color:var(--signal,#E5231D)}\
.qres p{color:#C9C9C6;margin:10px 0 0;max-width:62ch}\
.qres .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}\
.stampbig{display:inline-block;font-family:var(--mono,monospace);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#fff;background:var(--signal,#E5231D);padding:7px 10px;border-radius:2px;margin-bottom:10px}\
.finish{margin-top:34px;border:1px solid var(--signal,#E5231D);border-radius:3px;padding:clamp(22px,3.4vw,34px);display:none}\
.finish.show{display:block}\
';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------------- coach avatar ---------------- */
  var AV = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#0D0D0F"/>' +
    '<path d="M10 58c2-12 11-17 22-17s20 5 22 17" fill="#7A7A80"/>' +
    '<path d="M24 42c3 6 13 6 16 0l-3 16H27z" fill="#EDEDEA"/>' +
    '<path d="M28 46l4 12 4-12" fill="#6A6A70"/>' +
    '<circle cx="32" cy="28" r="10" fill="#EDEDEA"/>' +
    '<path d="M31 50c-6 0-10 2-12 7" stroke="#2A2A2E" stroke-width="1.5" fill="none"/>' +
    '<circle cx="19" cy="57" r="2.6" fill="#E5231D"/>' +
    '<ellipse cx="32" cy="23" rx="20" ry="4.5" fill="#D6B46A"/>' +
    '<path d="M22 23c0-9 4-13 10-13s10 4 10 13z" fill="#E3C47C"/>' +
    '<path d="M22 20.5h20v3.5H22z" fill="#E5231D"/>' +
    '<ellipse cx="32" cy="23" rx="20" ry="4.5" fill="none" stroke="#B89550" stroke-width=".8"/></svg>';


  /* ---------------- canned knowledge ---------------- */
  var QA = [
    { label: 'When can a coach call him?',
      a: 'For Division I football, coaches can start calling and texting him June 15 after his sophomore year. Face to face off campus opens January 1 of his junior year.\n\nBefore then the quiet is the rule, not a verdict on him. He can message coaches himself at any point, and they are allowed to write back.' },
    { label: 'Is this camp worth it?',
      a: 'One question: who is evaluating? If a position coach from a school he could actually play at is running his group, or it is one of the invite showcases where the people who make rankings are on the sideline, it is an evaluation and can be worth the money.\n\nIf it is a developmental camp, coaches teaching and nobody deciding, that fee is a full month of real training he keeps forever. Module 8 has the checklist.' },
    { label: 'What is a core course?',
      a: 'Division I wants 16 approved core courses: 4 English, 3 math at Algebra I or higher, 2 science, 1 more of those, 2 social science, and 4 more from any of those or a foreign language. 10 of the 16 have to be done before senior year starts.\n\nWhich of his courses count is specific to his school. Module 6 has the counselor questions, and the Eligibility Center makes the final call, not me.' },
    { label: 'Should I email coaches for him?',
      a: 'Straight answer: no. A message from a parent tells a staff something they did not want to know. He sends it, under his own name, short, with the film link at the top.\n\nYour job is the conditions: the tape is right, the grades are right, the profile is public, the phone gets answered. The Start page has his first message as a template.' },
    { label: 'Does he need an agent?',
      a: 'Almost certainly not yet. An agent earns a percentage of money he makes. A high school junior with no NIL deals has nothing for an agent to take a piece of, so anybody pushing one now is selling something else.\n\nA real one helps when there is an actual deal on the table, usually senior year or after he signs. Nobody can promise offers, and nobody should be contacting coaches for him.' },
    { label: 'What should I do next?',
      a: function () {
        var n = nextModule(), p = passedCount();
        if (!p) return 'Start with Module 1 and take the quiz at the bottom. Pass it and I will stamp the module and point you to the next one. If you want the module that matters most for his class right now, the Start page picks it.';
        if (n) return 'You have finished ' + p + ' of 9. Module ' + n + ' is next. Finish the deliverable from the last module first, the next one assumes it is done.';
        return 'You finished the whole Playbook. The next step is his twelve-month plan on the Start page, built for his class. If you want a trainer, the Lab USA network is available when you ask. Nothing in this course requires it.';
      } }
  ];

  /* ---------------- page lines ---------------- */
  function clsLabel() { return state.cls ? 'Class of ' + state.cls : 'Class not set'; }
  function teaseLine() {
    var p = passedCount(), n = nextModule();
    if (PAGE === 'module') {
      if (state.done[MOD] && state.done[MOD].pass) return 'You already passed this one with ' + state.done[MOD].score + ' of ' + state.done[MOD].total + '. ' + (n ? 'Module ' + n + ' is next.' : 'That was the last one.');
      return 'Module ' + MOD + '. Read it, watch what is there, then take the quiz at the bottom. I grade it for ' + (state.cls ? 'the class of ' + state.cls : 'his class') + '.';
    }
    if (PAGE === 'playbook') {
      if (!p) return 'Nine modules, a quiz after each. Start with Module 1, or let the Start page pick the one for his class.';
      if (n) return 'You have finished ' + p + ' of 9. Module ' + n + ' is up next.';
      return 'All nine done. Tell me when the deliverables are, and I will tell you what to do next.';
    }
    if (PAGE === 'start') return 'This page is built for his class. Pick the module and I will follow you in.';
    if (PAGE === 'parents') return 'Five minutes here and every answer I give is about your son, not a generic kid.';
    if (PAGE === 'schools') return 'Coach or AD? I can walk you through what every family in your program gets.';
    return 'Parents get recruited too. Want to see where your son actually stands? Start with the Playbook.';
  }

  /* ---------------- fab + panel ---------------- */
  var fab = document.createElement('div'); fab.className = 'ch-fab';
  var tease = document.createElement('div'); tease.className = 'ch-tease'; tease.style.display = 'none';
  var btn = document.createElement('button'); btn.className = 'ch-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Open Coach AI');
  btn.innerHTML = AV + '<span class="dot"></span>';
  fab.appendChild(tease); fab.appendChild(btn); body.appendChild(fab);

  var panel = document.createElement('div'); panel.className = 'ch-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Coach AI');
  panel.innerHTML = '<div class="ch-head"><div class="av">' + AV + '</div><div><div class="t">Coach AI</div><div class="s" id="ch-sub"></div></div><button class="close" type="button" aria-label="Close">&times;</button></div>' +
    '<div class="ch-log" id="ch-log"></div><div class="ch-chips" id="ch-chips"></div>' +
    '<div class="ch-cls" id="ch-cls"><span>His class</span></div>' +
    '<form class="ch-ask" id="ch-form"><input id="ch-in" type="text" placeholder="Ask Coach anything" autocomplete="off"><button type="submit">Ask</button></form>';
  body.appendChild(panel);

  var log = panel.querySelector('#ch-log'), chips = panel.querySelector('#ch-chips'), sub = panel.querySelector('#ch-sub'), clsRow = panel.querySelector('#ch-cls');
  function say(text, who) { var d = document.createElement('div'); d.className = 'ch-msg ' + (who || 'coach'); d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; }
  function refreshSub() { var p = passedCount(); sub.textContent = clsLabel() + ' · ' + p + ' of 9 modules' + (unlocked() ? '' : ' · preview'); }
  function buildCls() {
    clsRow.innerHTML = '<span>His class</span>';
    CLASSES.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = c; if (c === state.cls) b.className = 'on';
      b.addEventListener('click', function () { setClass(c); say('Got it. Class of ' + c + '. Quizzes and dates now follow that class.', 'coach'); });
      clsRow.appendChild(b);
    });
  }
  function setPos(p) { state.pos = p; save(); }
  function setClass(c) { state.cls = c; save(); buildCls(); refreshSub(); document.querySelectorAll('.quiz .clsrow button').forEach(function (b) { b.className = b.textContent === c ? 'on' : ''; }); applyClassFilter(); }
  QA.forEach(function (item) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ch-chip'; b.textContent = item.label;
    b.addEventListener('click', function () { say(item.label, 'me'); say(typeof item.a === 'function' ? item.a() : item.a, 'coach'); });
    chips.appendChild(b);
  });
  panel.querySelector('#ch-form').addEventListener('submit', function (e) {
    e.preventDefault(); var i = panel.querySelector('#ch-in'); var t = i.value.trim(); if (!t) return; i.value = '';
    say(t, 'me');
    say('Right now I answer from the Playbook, so pick one of the questions below and I will give you the real answer. Once your family is on a school code I take anything about his recruiting, and I remember who he is.', 'coach');
  });
  function openPanel(skipIntro) {
    panel.classList.add('open'); tease.style.display = 'none'; btn.querySelector('.dot').style.display = 'none';
    if (!log.children.length && skipIntro !== true) { say(teaseLine(), 'coach'); }
    try { sessionStorage.setItem('ch_open', '1'); } catch (e) {}
  }
  function closePanel() { panel.classList.remove('open'); try { sessionStorage.removeItem('ch_open'); } catch (e) {} }
  btn.addEventListener('click', function () { panel.classList.contains('open') ? closePanel() : openPanel(false); });
  panel.querySelector('.close').addEventListener('click', closePanel);
  buildCls(); refreshSub();

  // teaser once per page per session
  var teaseKey = 'ch_t_' + location.pathname;
  var seenTease = false; try { seenTease = !!sessionStorage.getItem(teaseKey); } catch (e) {}
  var wasOpen = false; try { wasOpen = !!sessionStorage.getItem('ch_open'); } catch (e) {}
  if (wasOpen) openPanel(true);
  else if (!seenTease) {
    setTimeout(function () {
      tease.innerHTML = '<b>Coach AI</b>' + teaseLine().replace(/&/g, '&amp;').replace(/</g, '&lt;') + '<button class="x" type="button" aria-label="Dismiss">&times;</button>';
      tease.style.display = 'block';
      tease.querySelector('.x').addEventListener('click', function (e) { e.stopPropagation(); tease.style.display = 'none'; });
      tease.addEventListener('click', openPanel);
      try { sessionStorage.setItem(teaseKey, '1'); } catch (e) {}
    }, 1800);
  }
  document.querySelectorAll('[data-open-coach]').forEach(function (el) { el.addEventListener('click', function (e) { e.preventDefault(); openPanel(); }); });

  /* ---------------- access gate (modules 2-9) ---------------- */
  if (PAGE === 'module' && MOD >= 2 && !unlocked()) {
    body.classList.add('gated');
    var first = document.querySelector('main .lesson');
    var g = document.createElement('div'); g.className = 'gate';
    g.innerHTML = '<div class="box"><p class="eyebrow">School code</p><h3>This module is for families on InHome</h3>' +
      '<p>The Parent Playbook is free for every football family at a school on the InHome High School license. Enter the code your head coach or athletic director gave you. Module 1 is open to everyone.</p>' +
      '<form id="gate-form"><input id="gate-in" type="text" placeholder="School code" autocomplete="off" autocapitalize="characters"><button class="btn" type="submit">Open the Playbook</button></form>' +
      '<p class="err" id="gate-err">That code is not on the list. Check it with your coach or AD, or <a href="/schools">ask us to bring InHome to your school</a>.</p>' +
      '<p class="fine" style="margin:16px 0 0">No code yet? <a href="/playbook/1">Start with Module 1</a>, it is open.</p></div>';
    if (first) first.parentNode.insertBefore(g, first);
    g.querySelector('#gate-form').addEventListener('submit', function (e) {
      e.preventDefault(); var v = g.querySelector('#gate-in').value.trim().toUpperCase();
      if (CODES.indexOf(v) >= 0) { state.code = v; save(); body.classList.remove('gated'); g.remove(); openPanel(true); say('Code accepted. Welcome in. Pick his class below if you have not, and I will grade the quizzes for his year.', 'coach'); }
      else { g.querySelector('#gate-err').style.display = 'block'; }
    });
  }

  /* ---------------- playbook index: progress ---------------- */
  if (PAGE === 'playbook') {
    var introSec = document.getElementById('intro-sec');
    var qs = document.getElementById('qstart');
    if (qs) {
      var yrs = document.getElementById('q-yrs'), posSel = document.getElementById('q-pos'), pick = state.cls;
      CLASSES.forEach(function (c) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Class of ' + c; if (c === pick) b.className = 'on';
        b.addEventListener('click', function () { pick = c; Array.prototype.forEach.call(yrs.children, function (x) { x.className = x === b ? 'on' : ''; }); });
        yrs.appendChild(b);
      });
      if (state.pos) posSel.value = state.pos;
      document.getElementById('q-go').addEventListener('click', function () {
        if (!pick) { yrs.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
        setClass(pick); setPos(posSel.value || '');
        if (introSec) introSec.style.display = 'none';
        render(); document.getElementById('course-sec').scrollIntoView({ behavior: 'smooth' });
        openPanel(true);
        var r = REC[state.cls] || 1;
        say('Class of ' + state.cls + (state.pos ? ', ' + POSNAME[state.pos] : '') + '. Got it.\n\nEverybody starts at Module 1, it is the one that resets what you think recruiting is. After that, Module ' + r + ' is the one that matters most for his year.' + (state.pos && POSTIP[state.pos] ? '\n\n' + POSTIP[state.pos] : ''), 'coach');
      });
      if (state.cls && introSec) introSec.style.display = 'none';
    }
    var prog = document.getElementById('pb-prog');
    function render() {
    var p = passedCount(), n = nextModule(), tt = totals();
    if (prog) {
      prog.innerHTML = '<div><p class="eyebrow">Your progress</p><div class="big">' + (p ? p + ' of 9 complete' : 'Ready to start') + '</div>' +
        '<div class="bar"><i style="width:' + Math.round(p / TOTAL * 100) + '%"></i></div>' +
        '<div class="score">' + (tt.t ? tt.c + ' of ' + tt.t + ' quiz answers right · ' : '') + clsLabel() + (state.pos ? ' · ' + POSNAME[state.pos] : '') + ' · <a href="#" id="pb-redo" style="color:inherit">change</a></div></div>' +
        '<div>' + (n ? '<a class="btn" href="/playbook/' + n + '">' + (p ? 'Continue: Module ' + n : 'Start Module 1') + '</a>' : '<a class="btn" href="/start">Build his 12-month plan</a>') + '</div>';
    }
    document.querySelectorAll('.mod[data-n]').forEach(function (card) {
      var k = card.getAttribute('data-n'); var d = state.done[k]; var s = document.createElement('span'); s.className = 'stamp';
      if (d && d.pass) { s.className += ' done'; s.textContent = 'Done · ' + d.score + '/' + d.total; }
      else if (parseInt(k, 10) === n) { s.className += ' next'; s.textContent = p ? 'Next up' : 'Start here'; }
      else s.textContent = 'Not started';
      var old = card.querySelector('.stamp'); if (old) old.remove();
      card.appendChild(s);
    });
    var redo = document.getElementById('pb-redo');
    if (redo) redo.addEventListener('click', function (e) { e.preventDefault(); if (introSec) { introSec.style.display = ''; introSec.scrollIntoView({ behavior: 'smooth' }); } });
    }
    render();
  }

  /* ---------------- module page: quiz ---------------- */
  var quizEl = document.getElementById('quiz');
  function applyClassFilter() {
    if (!quizEl) return;
    var shown = 0;
    quizEl.querySelectorAll('.qq').forEach(function (q) {
      var c = q.getAttribute('data-cls');
      var show = !c || !state.cls || c.split(',').indexOf(state.cls) >= 0;
      if (c && !state.cls) show = false; // class-specific questions wait for a class
      q.hidden = !show; if (show) { shown++; q.querySelector('.n').textContent = 'Question ' + shown; }
    });
    var note = quizEl.querySelector('.clsnote'); if (note) note.textContent = state.cls ? shown + ' questions for the class of ' + state.cls : 'Pick his class to add the questions that apply to his year.';
  }
  if (quizEl && PAGE === 'module') {
    var res = quizEl.querySelector('.qres');
    var row = quizEl.querySelector('.clsrow');
    CLASSES.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.textContent = c; if (c === state.cls) b.className = 'on'; b.addEventListener('click', function () { setClass(c); }); row.appendChild(b); });
    applyClassFilter();
    function grade() {
      var qs = Array.prototype.filter.call(quizEl.querySelectorAll('.qq'), function (q) { return !q.hidden; });
      var answered = qs.filter(function (q) { return q.classList.contains('locked'); });
      if (answered.length < qs.length) return;
      var score = qs.filter(function (q) { return q.getAttribute('data-ok') === '1'; }).length;
      var need = Math.ceil(qs.length * 0.7); var pass = score >= need;
      var prev = state.done[MOD];
      if (pass || !prev || !prev.pass) { state.done[MOD] = { score: score, total: qs.length, pass: pass || (prev && prev.pass) || false, ts: Date.now() }; save(); }
      refreshSub();
      var nxt = MOD < TOTAL ? MOD + 1 : 0;
      res.innerHTML = (pass ? '<span class="stampbig">Module ' + MOD + ' complete</span>' : '') +
        '<div class="big">' + score + ' <span class="red">of ' + qs.length + '</span></div>' +
        '<p>' + (pass ? (score === qs.length ? 'Clean sheet. ' : '') + 'That is a pass. Do the deliverable above before you move on; the next module assumes it is done.' : 'You need ' + need + ' to pass. Read the explanations under the ones you missed, then take it again.') + '</p>' +
        '<div class="row">' + (pass ? (nxt ? '<a class="btn" href="/playbook/' + nxt + '">Next: Module ' + nxt + '</a>' : '<a class="btn" href="/playbook">See the full Playbook</a>') : '<button class="btn" type="button" id="q-retry">Take it again</button>') + '<a class="btn ghost" href="/playbook">All modules</a></div>';
      res.classList.add('show'); res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      var r = res.querySelector('#q-retry'); if (r) r.addEventListener('click', function () {
        quizEl.querySelectorAll('.qq').forEach(function (q) { q.classList.remove('locked'); q.removeAttribute('data-ok'); q.querySelectorAll('.opt').forEach(function (o) { o.className = 'opt'; }); });
        res.classList.remove('show'); quizEl.scrollIntoView({ behavior: 'smooth' });
      });
      if (pass) { openPanel(true); say(nxt ? 'Module ' + MOD + ' stamped. ' + score + ' of ' + qs.length + '. Module ' + nxt + ' is next when the deliverable is done.' : 'That is all nine. Build his twelve-month plan on the Start page next.', 'coach'); }
      if (pass && passedCount() === TOTAL) { var f = document.getElementById('finish'); if (f) f.classList.add('show'); }
    }
    quizEl.querySelectorAll('.qq').forEach(function (q) {
      var ans = parseInt(q.getAttribute('data-a'), 10);
      q.querySelectorAll('.opt').forEach(function (o, i) {
        o.addEventListener('click', function () {
          if (q.classList.contains('locked')) return;
          q.classList.add('locked');
          var ok = i === ans; q.setAttribute('data-ok', ok ? '1' : '0');
          o.classList.add(ok ? 'right' : 'wrong');
          if (!ok) q.querySelectorAll('.opt')[ans].classList.add('right');
          grade();
        });
      });
    });
    if (state.done[MOD] && state.done[MOD].pass) { var f2 = document.getElementById('finish'); if (f2 && passedCount() === TOTAL) f2.classList.add('show'); }
  }

  window.InHome = { state: state, setClass: setClass, setPos: setPos, open: openPanel };
})();
