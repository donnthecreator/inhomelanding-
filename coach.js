/* InHome Parent Playbook: Coach AI figure, progress store, quiz engine.
   One file, included on every page. No dependencies. */
(function () {
  'use strict';

  /* ---------------- store ---------------- */
  var KEY = 'inhome_pb';
  var CLASSES = ['2027', '2028', '2029', '2030', '2031'];
  var TOTAL = 9;
  var state = { cls: '', pos: '', done: {}, seen: {}, code: '', page: {} };
  var CODES = ['PARENTS26', 'KNIGHTS26', 'INHOME-DEMO', 'TEAMLAB'];
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', TEMP_DAYS = 30;
  function tempValid(code) {
    code = (code || '').toUpperCase();
    if (!/^FAM-[A-Z2-9]{4}$/.test(code)) return false;
    var b = code.slice(4, 7), sum = 0;
    for (var i = 0; i < 3; i++) sum += b.charCodeAt(i);
    if (ALPHA[sum % ALPHA.length] !== code.charAt(7)) return false;
    var issued = state.codeIssued || 0;
    return issued > 0 && (Date.now() - issued) < TEMP_DAYS * 86400000;
  }
  function unlocked() { var c = (state.code || '').toUpperCase(); return CODES.indexOf(c) >= 0 || tempValid(c) || !!state.paid; }
  var REC = { '2027': 9, '2028': 3, '2029': 1, '2030': 1, '2031': 1 };
  var POSNAME = { qb: 'quarterback', rb: 'running back', wr: 'wide receiver', te: 'tight end', ot: 'offensive tackle', og: 'guard', c: 'center', de: 'defensive end', edge: 'edge rusher', dt: 'defensive tackle', lb: 'linebacker', cb: 'cornerback', s: 'safety', k: 'kicker', p: 'punter', ls: 'long snapper', ath: 'athlete' };
  var POSTIP = {
    qb: 'Quarterback is the hardest room in recruiting, and full game film matters more for him than for anyone else. Module 2 has a lesson just on it.',
    rb: 'For a back they want contact balance and vision before they care about his 40. Module 2 covers what gets screened first, and a season of track still moves his game speed.',
    wr: 'For a receiver the question is whether he separates at the top of the route, not whether he catches the deep ball. A season of track does more for him than any camp.',
    te: 'Tight ends get graded twice, once as a blocker and once as a receiver, and the blocking tape is the one families forget to include.',
    ot: 'For a tackle it is feet and whether he bends at the knee instead of the waist. Wrestling in the offseason builds exactly that.',
    og: 'Guard play is leverage and hands in a phone booth. Wrestling does more for that than any lineman camp you can pay for.',
    c: 'A center is graded on the snap and the line calls before anything else, so get him on film making the calls. Wrestling builds the bend and the hands.',
    de: 'For a defensive end it is get-off and hands, and wrestling in the offseason builds both.',
    edge: 'For an edge rusher it is get-off, bend and hands. Wrestling builds all three, and the tape should show a counter move, not just one speed rush.',
    dt: 'Inside it is get-off, leverage and hands. Wrestling is the offseason sport that moves those, and Module 2 covers what gets screened first.',
    lb: 'For a linebacker they want to see him trigger downhill instead of waiting to see it. Module 2 covers what gets screened first.',
    cb: 'The first thing a staff checks on a corner is whether he can flip his hips and run. Tackling and ball skills come second.',
    s: 'Safeties are graded on range and angles, and on whether they can tackle in space. Get both on the tape.',
    k: 'Specialists are recruited on verified numbers and clean film more than anything else. Get to the camps where they actually measure.',
    p: 'Punters live on verified numbers: hang time, net, consistency on film. Camps that measure are worth more than camps that teach.',
    ls: 'Long snappers are recruited on verified snap times and clean, repeatable film. The camps that time him are the ones worth the money.',
    ath: 'Until he settles on a position, Module 2 is the one to work: it is how a staff decides where he actually fits.',
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
.pager{display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:space-between;padding-top:30px;padding-bottom:6px;border-top:1px solid var(--line,rgba(237,237,234,.14))}.pager[hidden]{display:none}.pager .pbar{display:flex;flex-direction:column;align-items:center;gap:9px;order:0}.pager .pcount{font-family:var(--mono,monospace);font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--mute,#8E8E93)}.pager .pdots{display:flex;gap:6px}.pager .pdot{width:26px;height:4px;border:0;border-radius:2px;background:rgba(237,237,234,.18);cursor:pointer;padding:0}.pager .pdot.seen{background:rgba(229,35,29,.5)}.pager .pdot.on{background:var(--signal,#E5231D)}.pager .btn:disabled{opacity:.3;cursor:default}.toc a.on{color:var(--signal,#E5231D)}@media (max-width:620px){.pager{gap:12px}.pager .pbar{order:-1;width:100%}.pager .btn{flex:1;justify-content:center;text-align:center}}.gate{margin:0 auto;max-width:720px;padding:0 var(--gut,24px)}.gate .box{background:var(--panel,#0D0D0F);border:1px solid var(--signal,#E5231D);border-radius:3px;padding:clamp(22px,3.4vw,34px);margin:30px 0 10px}.gate h3{font-family:var(--display,Anton,Impact,sans-serif);font-weight:400;font-size:30px;line-height:1.05;text-transform:uppercase;margin:10px 0 8px}.gate p{color:#C9C9C6;margin:0 0 16px;max-width:60ch}.gate form{display:flex;gap:8px;flex-wrap:wrap}.gate input{flex:1;min-width:200px;background:var(--ink,#050506);border:1px solid var(--line,rgba(237,237,234,.14));color:var(--bone,#EDEDEA);padding:12px 14px;border-radius:2px;font:inherit;font-size:16px;letter-spacing:.08em;text-transform:uppercase}.gate .err{color:var(--signal,#E5231D);font-size:14px;margin:10px 0 0;display:none}body.gated .lesson,body.gated .closing{filter:blur(6px);pointer-events:none;user-select:none;max-height:420px;overflow:hidden;position:relative}\
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
      a: 'It depends, and it is more subjective than the people selling representation make it sound, so be wary of a flat yes or no. An agent\'s value scales with the money actually on the table, and most high schoolers have nothing signed yet.\n\nWhen money does show up, know there are two different jobs, and plenty of NFL players carry a separate agent for each. A contract-centric agent negotiates the deal itself, the roster spot and the revenue share, across the table from a program\'s general manager. A brand-centric agent sources and negotiates NIL and endorsement deals. Different skill sets, often different people.\n\nMost position coaches will not have the revenue-share conversation with you; that is the GM\'s responsibility. Before anyone signs, line up two people: an attorney to review the contract, and an advisor who understands how a GM and an agent actually negotiate. And walk from anyone promising offers or charging a fee before a deal exists.' },
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

  /* ---------------- knowledge base for typed questions ---------------- */
  /* Keyword matched, not a language model. Every answer is written from the Playbook. */
  var KB = [
  { k: ['7v7', '7 on 7', '7-on-7', 'seven on seven', '7on7', 'pylon', 'ot7', 'battle tournament', 'passing league', 'club team'],
    a: "Nobody gets offered off 7-on-7. Staffs know it is no pads, no linemen and no pass rush, so it tells them nothing about the things they actually grade. That is the first thing to hold onto.\n\nWhat it is good for is competitive reps against real talent, if he is playing in the right events. The national circuits, Pylon, OT7 and the Battle tournaments, put him against the best skill players in the country every weekend. Two things come out of that. He gets better. And the top national 7-on-7 coaches have real relationships with college staffs, because so many of their past players went on to play at the next level; a call from one of them about your son carries weight.\n\nTwo cautions. First, for the spring, track and real training move a profile more than 7-on-7 does. A verified time in a sanctioned meet is a number a staff trusts; a 7-on-7 highlight is not. Second, do not confuse club 7-on-7 with the summer 7-on-7 his high school plays. The school version is him working with his own teammates on the playbook and it matters for the fall, which is where the film that gets him recruited comes from.\n\nAnd none of it applies to linemen. There are no linemen in 7-on-7. Wrestling is their spring." },

  { k: ['camp', 'showcase', 'combine', 'which camps', 'good camps', 'elite 11', 'the opening', 'rivals', 'under armour', 'under armor', 'polynesian', 'all american', 'exposure'],
    a: function () {
      var qb = state.pos === 'qb';
      var s = 'Ask one question of any camp before you pay: who is evaluating, by name and by program? That splits every camp into two kinds.\n\n' +
        'The ones that change recruiting:\n' +
        '1. A college\'s own camp. If he camps at a school, that staff evaluates him in person, and they are the people who can actually offer him. For most families this is the best money spent all year, and the schools on his target list should be the ones he camps at.\n' +
        '2. Invite showcases where evaluators and media stand on the sideline. The ones families ask about most are the Rivals Camp Series, Under Armour\'s camps, and Nike\'s The Opening regionals.\n';
      if (qb) {
        s += '3. For a quarterback specifically, Elite 11 regionals are the event that moves a QB, and the finals move him a lot. The Opening matters for him too.\n';
      } else {
        s += '3. Position-specific events where a real position coach works the group, rather than a field of 300 kids rotating through stations.\n';
      }
      s += '4. All-star and bowl combines, like the Polynesian Bowl combine in Las Vegas, which carry real evaluation weight for the players invited.\n\n' +
        'The ones that mostly do not: big-field developmental camps with no decision-makers, anything that sells a "national" ranking on the day, and 7-on-7 if you expect an offer out of it; ask me about 7-on-7 separately, it has its own answer.\n\n' +
        'Two things worth hearing. The price of one developmental camp is close to a month of real training he keeps forever. And before any camp, the offseason sport does more: track for skill positions, wrestling for the trenches. Module 8 is the whole lesson, and it is the one I would read first.';
      return s;
    } },

  { k: ['when can', 'call him', 'contact him', 'june 15', 'coaches call', 'reach out to him', 'talk to coaches', 'allowed to call', 'text him'],
    a: 'For Division I football, coaches may begin calling, texting and emailing him on June 15 after his sophomore year. Face-to-face contact off campus opens January 1 of his junior year.\n\nBefore those dates he is not being ignored, the rules simply do not allow it. He can message coaches himself at any point and they are allowed to write back. Module 5 has the full calendar, and the Start page shows the dates for his exact class.' },

  { k: ['dead period', 'quiet period', 'contact period', 'evaluation period', 'periods'],
    a: 'Four kinds of windows. A contact period allows in-person contact on and off campus. An evaluation period lets a coach watch him play or practice but not talk recruiting with him. A quiet period allows contact only on the college campus. A dead period allows no in-person contact anywhere.\n\nCalls, texts and film evaluation continue through all of them, including dead periods. A quiet calendar is not a quiet process. Module 5, Lesson 1.' },

  { k: ['official visit', 'unofficial visit', 'visit', 'gameday visit', 'game day'],
    a: 'An official visit is paid for by the program and the number he can take is limited. An unofficial visit is one you pay for and he can take as many as you can afford. Juniors can begin taking officials in the spring of junior year.\n\nOn either one, he is being evaluated the whole time, and so is your family. Walk a step behind him, let him answer the questions, and watch how the staff treats the people who are not recruits. Write your notes in the car, not in the building. Module 7 has the full lesson, and there is a video with it.' },

  { k: ['highlight', 'film', 'tape', 'hudl', 'how long should', 'video', 'clips'],
    a: 'Shorter than you think, and the order matters more than the length. A staff decides whether to keep watching inside the first few clips, so the opening clips have to answer the one thing his position gets judged on, not show the longest run.\n\nSpotlight him on every clip. No music, no montage intro, no clips against a 1-9 team. Make sure his profile carries his name, class, position, verified measurables and school, because staffs search by class and position.\n\nIf a school asks for full game film, that is a good sign, not a bad one. Module 4 is the rebuild.' },

  { k: ['email', 'dm', 'message coaches', 'reach out', 'who should contact', 'should i email', 'write to coaches'],
    a: 'He sends it, under his own name, not you. A message from a parent tells a staff something they did not want to know.\n\nKeep it short with the film link at the top. And know that most coach emails posted online go nowhere; the connection that works runs through his head coach or his trainer to someone on that staff. Ask his coach who he actually knows.\n\nYour job is the conditions: the tape is right, the grades are right, the profile is public, the phone gets answered. The Start page has his first message as a template, and templates for a visit post and an offer post.' },

  { k: ['core course', 'core classes', '16 core', 'eligibility center', 'ncaa clearinghouse', 'clearinghouse', 'academically eligible', 'qualifier'],
    a: 'Division I requires 16 approved core courses: 4 English, 3 math at Algebra I or higher, 2 science, 1 more of those, 2 social science, and 4 more from those or a foreign language. Ten of the sixteen have to be finished before senior year starts, and seven of those ten in English, math and science.\n\nApproved means approved for his specific high school, so the counselor and the NCAA Eligibility Center are the authorities, not me. Register with the Eligibility Center early and then finish the job by sending transcripts and scores; an incomplete file looks the same as an ineligible one at the moment it matters. Module 6, and it has the scripted counselor questions.' },

  { k: ['gpa', 'grades', 'transcript', 'act', 'sat', 'test score'],
    a: 'The number that counts is his core-course GPA, computed only from the approved courses, and it is usually lower than the GPA on his report card. Division I asks for 2.3 and Division II for 2.2.\n\nJunior year is the last comfortable fix, because ten of the sixteen core courses lock in before senior year. After graduation exactly one more core course can be used. Pull the transcript and check it against the approved list with his counselor this month, not next spring. Module 6.' },

  { k: ['agent', 'representation', 'advisor', 'marketing rep', 'commission', 'percentage'],
    a: 'Whether he needs one is subjective and depends on what is actually on the table, so treat a flat yes or no with suspicion. An agent\'s value scales with real money, and most high schoolers have none signed yet.\n\nWhen money does show up, there are two different jobs, and many NFL players keep a separate agent for each. A contract-centric agent negotiates the deal itself, the roster spot and the revenue share, sitting across from a program\'s general manager. A brand-centric agent sources and negotiates NIL and endorsement deals. Know that most position coaches will not have the revenue-share conversation with you, that is the GM\'s job, so the money is negotiated at a different level than the recruiting.\n\nOn fees, market norms not law: roughly 10 to 15 percent on a brand deal that came to him, 15 to 20 on one the rep sourced, and little, often 0 to 3, on collective or revenue-share money. A fee before a deal exists, one blended rate across everything, or a claim on his future pro earnings are the things to question.\n\nBefore he signs, line up two people: an attorney to review the contract, and an advisor who understands how a GM and an agent actually negotiate. Confirm anyone is registered as an athlete agent in your state. InHome is not an agent and this is not legal advice. Module 9.' },

  { k: ['nil', 'name image likeness', 'brand deal', 'endorsement', 'nil go', 'collective'],
    a: 'For a high school athlete, whether he can do NIL at all is set by your state high school athletic association, and it differs by state. Check with the association and his school before he signs anything.\n\nOnce he is a Division I athlete, third-party deals of $600 or more are reported through NIL Go, generally within five business days. Keep the paperwork from the first dollar. Module 9, Lesson 6.' },

  { k: ['revenue share', 'rev share', 'getting paid', 'pay him', 'how much money', 'cap'],
    a: 'Revenue share is the school paying him directly under the House settlement, and it is a different thing from a scholarship and from a roster spot. A program can offer any one of the three without the others, so when a coach says offer, ask which one he means.\n\nThe cap is school-wide, not per athlete, and it is split across every sport at that school: about $20.5 million in the first year and roughly $21.5 million for 2026-27. Football takes the largest share at most schools, but what any one player gets is a negotiation and the overwhelming majority of college football players receive none of it.\n\nIf there is a document, Module 9 walks through an example term sheet clause by clause: the renewal, the injury clause, and the clawback if he transfers. A lawyer in your state reads it before he signs.' },

  { k: ['scholarship', 'full ride', 'partial', 'pay for school', 'tuition', 'financial aid', 'equivalency', 'how many scholarships'],
    a: 'Two systems, and the difference matters more than the number. In a headcount system every scholarship is a full ride. In an equivalency system the program gets a total and cuts it into pieces across a much bigger roster, so a limit of 36 does not mean 36 players.\n\nSettlement schools no longer have sport-specific scholarship limits and cap the roster at 105. FCS traditionally splits 63. Division II splits 36. NAIA splits 24. Division III, the Ivy League and the Pioneer League give no athletic money at all and meet cost with academic and need-based aid, which is often larger than a partial elsewhere. Junior college rules vary by NJCAA division.\n\nWhen a coach says a percentage, ask percent of what, covering what, for how long, and compare what your family actually pays after everything is applied. Module 1, Lesson 4 has the full table.' },

  { k: ['walk on', 'walk-on', 'preferred walk', 'pwo'],
    a: 'The 105 cap changed this. The old model carried a large walk-on group on top of the scholarship players; a hard roster limit takes most of those spots off the board, so a walk-on spot is now a real roster spot somebody else is not getting.\n\nIf a preferred walk-on offer comes, the questions are the same as any other: where does he sit on the 105, what does it take to earn aid, and what happens to the spot if the room changes. Get the answer in writing. Module 9, Lesson 5.' },

  { k: ['transfer portal', 'portal', 'transfer'],
    a: 'When a position need opens, most staffs look at the portal first, because a transfer is a known quantity who can play now. That is the competition a high school player is actually up against, and it is why being evaluated early matters more than it used to.\n\nIt also means a spot that looked open in April can be filled in June. Programs that want him now are worth answering now. Module 1, Lesson 5.' },

  { k: ['juco', 'junior college', 'njcaa', 'prep school'],
    a: 'Junior college is two years of film, development and a second recruitment, and it has produced a long list of players who ended up at the highest level. It is a real path, not a fallback.\n\nThe aid rules vary by NJCAA division: Division I programs can cover tuition, fees, books, room and board, Division II is limited to tuition, fees and books, Division III gives no athletic aid, and California community colleges give none. Module 1 has the table.' },

  { k: ['d2', 'd3', 'naia', 'division ii', 'division iii', 'fcs', 'small school', 'lower level', 'which level'],
    a: 'Far more roster spots exist outside FBS than inside it, and none of those levels is a consolation prize. FCS is Division I with full scholarships and players drafted every year. Division II splits real athletic money and stacks it with academic aid. Division III gives no athletic money but often large academic packages. NAIA has its own scholarships, and some NAIA programs would beat FCS teams.\n\nThe mistake that costs families is not aiming at the wrong level, it is aiming at only one. Module 3 builds the target list: a few stretch schools, several that fit him today, and a few where he is already wanted.' },

  { k: ['track', 'wrestling', 'another sport', 'offseason', 'second sport', 'basketball'],
    a: 'Track for skill positions, wrestling for the trenches. A season of track changes a receiver or back\'s game speed in a way no camp does, and wrestling builds the bend, leverage and hand use an offensive or defensive lineman is graded on.\n\nBoth do more for a profile than most of what families pay for, and both give him a verified number or a result that travels. Module 8, Lesson 4.' },

  { k: ['verified', 'measurable', '40 time', 'forty', 'vertical', 'testing', 'laser', 'height', 'weight', 'hand size'],
    a: 'Verified means somebody other than your family measured it, at a real event, with a date and a source. A laser 40, a contact pad, a sanctioned meet, a camp that publishes results. A hand time on a phone is not a number and listing one costs credibility.\n\nStaffs also read the ten-yard split as closely as the full 40, because that is the burst football actually asks for. And a verified number below the band for his level is on the record, so if he is not ready, train first and test second. Module 3 has the bands, Module 8 has the lesson, and both have videos.' },

  { k: ['recruiting service', 'service', 'worth the money', 'scam', 'pay someone'],
    a: 'Three questions before any money changes hands. Who watches his film, by name? What can they do that he cannot do himself? Do they promise offers?\n\nAnyone promising offers is disqualified by the promise. Nobody can promise an offer, because only a program can make one. Module 8, Lesson 5.' },

  { k: ['stars', 'ranking', 'rated', 'rivals ranking', '247', 'three star', 'four star', 'unranked'],
    a: 'Rankings follow offers, not the other way round. A staff evaluates and offers, another one does, the sites notice the offers and rank him, and then more staffs notice the ranking.\n\nSo the way to get him ranked is to get him evaluated by people who make decisions. Paying to chase the ranking directly is paying for the scoreboard instead of the game. An unranked player with the right film is a normal thing, not a problem to solve. Module 2, Lesson 5.' },

  { k: ['offer', 'committable', 'what does an offer mean', 'got an offer'],
    a: 'The word carries less than it used to. It can mean a committable scholarship, or a roster spot with no money, or an invitation to keep talking. It can also mean revenue share, which is a third thing again.\n\nSo the follow-ups matter more than the word: Is it committable today? Is it a scholarship, and for how much? Is revenue share part of it, guaranteed or discretionary? What happens if he is injured or the head coach leaves? Written offers to a senior can be issued starting August 1 before senior year; before that it is a verbal. Module 9.' },

  { k: ['signing day', 'sign', 'national letter', 'letter of intent', 'signing window', 'december', 'february'],
    a: 'There is an early signing window in December and a regular period that opens in February. What he signs now is an athletics aid agreement rather than the old National Letter of Intent.\n\nBefore he signs anything, have the terms, the aid and what happens if the staff changes in writing. Coaching changes are the normal case, not the exception. Module 9 has the pre-commitment question list, and the dates for his class are on the Start page.' },

  { k: ['social media', 'twitter', 'instagram', 'post', 'tweet', 'followers'],
    a: 'Staffs read the whole timeline, and it gets read before a visit, not after. One post can end a recruitment, and background is a real part of the grade.\n\nUsed well it works for him: coaches follow recruits who visit a rival, so a visit post tells other staffs who is in on him, and the following he builds is what a brand looks at later. Tag the school, thank the coach by name, say what is next, keep it short. The Start page has the templates for a visit, a camp invite and an offer. Module 7, Lesson 4, and there is a video with it.' },

  { k: ['silence', 'not hearing', 'no contact', 'stopped talking', 'ghosted', 'no offers', 'nobody is recruiting', 'heard from', 'havent heard', "haven't heard", 'nobody has', 'no one has', 'no interest', 'ignoring', 'not interested'],
    a: 'Usually it means a staff is working a different player at that spot first, or the rules do not allow contact yet, or nobody has seen the film. Most of the reasons have nothing to do with him.\n\nThe response is the same either way: make sure the film is right and findable, make sure the transcript is clean, and widen the list to programs that fit him today rather than camping on the few that have not answered. Module 5, Lesson 4.' },

  { k: ['freshman', 'sophomore', 'eighth grade', '8th grade', 'how early', 'too early', 'start now'],
    a: 'There is no recruiting to do yet, and anyone telling you otherwise is selling something. What there is: a transcript to protect and a body to develop.\n\nEvery class he takes either counts toward his 16 core courses or it does not, and this is the cheapest time to get that right. Add the offseason sport, track or wrestling, and real training. Read Module 1 so the next four years make sense, then Module 6 so the grades never become the reason.' },

  { k: ['senior', 'late', 'no offers yet', 'running out of time'],
    a: 'The board outside FBS is still live, and so is junior college. FCS, D2, D3, NAIA and JUCO sign players late, and signing runs into the spring.\n\nThe work right now is narrow: get film in front of programs that fit him today, have his coach make calls to people he actually knows, and answer everyone who shows interest within the hour. Module 3 builds that list and Module 9 covers what the offers mean when they come.' },

  { k: ['position change', 'switch positions', 'what position', 'projects to'],
    a: 'Staffs recruit the player they project at 21, not the position on his jersey today. A high school quarterback who projects to safety, or a tight end who projects to tackle, is normal and is not a demotion.\n\nIf a staff is recruiting him at a different spot, that is information about what they see in his frame and his movement. Ask them directly what they project him at and why. Module 2 covers how a staff reads the whole player.' },

  { k: ['redshirt', 'playing time', 'play as a freshman'],
    a: 'Ask it directly on the visit: realistically, what does year one look like for him, and what does the depth chart at his position look like in two years? A staff that answers specifically is telling you something real, and a staff that will not is also telling you something.\n\nWith a 105-player cap every spot is accounted for, so where he sits on that number is a fair question to ask. Module 9, Lesson 5.' },

  { k: ['inhome', 'what is this', 'who are you', 'coach ai', 'are you real', 'the lab'],
    a: 'I am Coach AI, software rather than a person, and I answer from this course, the current calendar and the eligibility rules. I will tell you when a question belongs to your counselor, the Eligibility Center or a lawyer.\n\nInHome is a scouting and recruiting platform that college staffs use to evaluate players on film. We are not an agent, we do not represent athletes, and we never contact programs for a family. I will also never tell you a program is interested; only a program can say that.' },

  { k: ['injury', 'hurt', 'torn', 'surgery'],
    a: 'Two things to handle. On film, leave the season he was hurt in context rather than hiding it, and get current film up as soon as he is cleared. On paper, if there is a revenue-share or aid agreement in front of you, the injury clause is the one most families never read: ask whether money continues, whether it covers injuries outside team activity, and who performs the medical review.\n\nFor the recruiting itself, let his coach tell staffs directly what happened and what the timeline is. Staffs recruit through injuries all the time; they do not recruit through silence.' },

  { k: ['thank', 'thanks', 'appreciate it', 'helpful'],
    a: 'Any time. If you want the single most useful thing to do next, it is the deliverable at the end of whichever module you are in. That is the part that actually changes something.' },

  { k: ['hello', 'hi coach', 'hey coach', 'good morning', 'good evening', 'whats up', "what's up"],
    a: 'Hey. Ask me anything about his recruiting: camps, film, the calendar, core courses, scholarships, offers, agents. If you tell me his class and position I will answer for his year instead of in general.' }
  ];

  function kbFind(q) {
    var t = ' ' + q.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
    var best = null, bestScore = 0;
    KB.forEach(function (e) {
      var sc = 0;
      e.k.forEach(function (w) { if (t.indexOf(w) >= 0) sc += w.length + (w.indexOf(' ') > 0 ? 6 : 0); });
      if (sc > bestScore) { bestScore = sc; best = e; }
    });
    if (!best || bestScore < 3) return null;
    return typeof best.a === 'function' ? best.a() : best.a;
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
    var hit = kbFind(t);
    if (hit) { say(hit, 'coach'); return; }
    say('I do not have a good answer for that one yet. I can take camps, film, the calendar, visits, core courses and GPA, scholarships at each level, offers, revenue share, NIL, agents, the portal, junior college, social media, and what to do in each grade. Try one of those, or ask his head coach, who can reach us directly.', 'coach');
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
    g.innerHTML = '<div class="box"><p class="eyebrow">Access code</p><h3>This module is for families on InHome</h3>' +
      '<p>The full Parent Playbook is a $199 course. It is free for every football family at a school on the InHome High School license, and free for anyone we hand an access code. Enter the code your coach, AD, or an InHome trainer gave you. No code yet? <a href="/parents#setup">Set up his profile</a> and we will give you a temporary one on the spot.</p>' +
      '<form id="gate-form"><input id="gate-in" type="text" placeholder="School code" autocomplete="off" autocapitalize="characters"><button class="btn" type="submit">Open the Playbook</button></form>' +
      '<p class="err" id="gate-err">That code is not on the list, or a temporary code has expired. Check it with your coach or AD, or <a href="/parents#setup">get a temporary code here</a>.</p>' +
      '<div class="gate-buy"><p class="eyebrow quiet" style="margin:0 0 10px">No code, no school on InHome?</p>' +
      '<a class="btn" href="https://buy.stripe.com/9B63cwebPetX6F05qQ5os00">Get the full Playbook, $199</a>' +
      '<p class="fine" style="margin:12px 0 0">One time, lifetime access. Or <a href="/playbook/1">start with Module 1</a> free.</p></div></div>';
    if (first) first.parentNode.insertBefore(g, first);
    g.querySelector('#gate-form').addEventListener('submit', function (e) {
      e.preventDefault(); var v = g.querySelector('#gate-in').value.trim().toUpperCase();
      var isTemp = /^FAM-/.test(v);
      if (isTemp && !state.codeIssued) { state.codeIssued = Date.now(); }
      state.code = v;
      if (CODES.indexOf(v) >= 0 || tempValid(v)) { save(); body.classList.remove('gated'); g.remove(); openPanel(true); say('Code accepted. Welcome in. Pick his class below if you have not, and I will grade the quizzes for his year.', 'coach'); }
      else { state.code = ''; state.codeIssued = 0; g.querySelector('#gate-err').style.display = 'block'; }
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
        var plan = r === 1
          ? 'Start at Module 1. For his year it is also the one that matters most, so take your time with it.'
          : 'Everybody starts at Module 1, it is the one that resets what you think recruiting is. After that, Module ' + r + ' is the one that matters most for his year.';
        say('Class of ' + state.cls + (state.pos ? ', ' + POSNAME[state.pos] : '') + '. Got it.\n\n' + plan + (state.pos && POSTIP[state.pos] ? '\n\n' + POSTIP[state.pos] : ''), 'coach');
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

  /* ---------------- module pages: one lesson at a time ---------------- */
  if (PAGE === 'module' && !body.classList.contains('gated')) {
    var lessons = [].slice.call(document.querySelectorAll('main .lesson'));
    var closing = document.querySelector('main .closing');
    var tocLinks = [].slice.call(document.querySelectorAll('.toc a'));
    if (lessons.length && closing) {
      var N = lessons.length, cur = 0;
      var pager = document.createElement('div');
      pager.className = 'wrap pager';
      pager.innerHTML = '<button class="btn ghost" type="button" data-prev>Back</button>' +
        '<div class="pbar"><span class="pcount"></span><div class="pdots"></div></div>' +
        '<button class="btn" type="button" data-next></button>';
      closing.parentNode.insertBefore(pager, closing);
      var dots = pager.querySelector('.pdots');
      for (var d = 0; d < N; d++) {
        var s = document.createElement('button');
        s.type = 'button'; s.className = 'pdot'; s.setAttribute('aria-label', 'Lesson ' + (d + 1));
        (function (idx) { s.addEventListener('click', function () { go(idx); }); })(d);
        dots.appendChild(s);
      }
      var prevBtn = pager.querySelector('[data-prev]'), nextBtn = pager.querySelector('[data-next]');
      var countEl = pager.querySelector('.pcount');

      function go(i, noScroll) {
        cur = Math.max(0, Math.min(N, i));
        lessons.forEach(function (l, j) { l.hidden = j !== cur; });
        var last = cur >= N;
        closing.hidden = !last;
        pager.hidden = false;
        prevBtn.disabled = cur === 0;
        prevBtn.textContent = cur === 0 ? 'Back' : (cur >= N ? 'Back to lesson ' + N : 'Back');
        nextBtn.textContent = last ? 'Back to the lessons' : (cur === N - 1 ? 'Finish the module' : 'Next lesson');
        countEl.textContent = last ? 'Module ' + MOD + ' wrap-up' : 'Lesson ' + (cur + 1) + ' of ' + N;
        [].forEach.call(dots.children, function (x, j) { x.className = 'pdot' + (j === cur ? ' on' : (j < cur ? ' seen' : '')); });
        tocLinks.forEach(function (a, j) { a.className = j === cur ? 'on' : ''; });
        state.page[MOD] = cur; save();
        if (!noScroll) {
          var top = (last ? closing : lessons[cur]).getBoundingClientRect().top + window.pageYOffset - 76;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
        try { history.replaceState(null, '', last ? '#wrap-up' : '#l' + (cur + 1)); } catch (e) {}
      }
      nextBtn.addEventListener('click', function () { go(cur >= N ? 0 : cur + 1); });
      prevBtn.addEventListener('click', function () { go(cur - 1); });
      tocLinks.forEach(function (a, j) { a.addEventListener('click', function (e) { e.preventDefault(); go(j); }); });
      document.addEventListener('keydown', function (e) {
        if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
        if (e.key === 'ArrowRight') go(cur + 1);
        if (e.key === 'ArrowLeft') go(cur - 1);
      });
      window.addEventListener('hashchange', function () {
        var h = (location.hash || '').replace('#', '');
        if (h === 'wrap-up') go(N);
        else if (/^l\d+$/.test(h)) go(parseInt(h.slice(1), 10) - 1);
      });
      var start = 0, hash = (location.hash || '').replace('#', '');
      if (hash === 'wrap-up') start = N;
      else if (/^l\d+$/.test(hash)) start = parseInt(hash.slice(1), 10) - 1;
      else if (typeof state.page[MOD] === 'number') start = state.page[MOD];
      go(start, true);
    }
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
