  /* ---------- parent profile form (shared by /parents, /schools, /playbook) ---------- */
  (function () {
    var form = document.getElementById('p-parent-form');
    if (!form) return;
    var PAGE = document.body.getAttribute('data-page') || '';
    var panel = document.getElementById('p-panel');
    var btn = document.getElementById('p-submit-btn');
    var status = document.getElementById('p-status');
    var noCode = document.getElementById('p-nocode');
    var codeIn = document.getElementById('p-code');
    var coachName = document.getElementById('p-coach');
    var coachPhone = document.getElementById('p-coachphone');
    var trainerPhone = document.getElementById('p-trainerphone');
    var coachConsent = document.getElementById('p-c-coach');
    var consentRow = coachConsent.closest('.check');
    var posIn = document.getElementById('p-pos');
    var onlyNoCode = form.parentNode.querySelectorAll('.nocode-only');
    document.getElementById('p-source').value = location.pathname;
    var PAID = PAGE === 'welcome';
    if (PAID) {
      // already purchased: the school code is irrelevant here
      var codeField = codeIn.closest('.field'); if (codeField) codeField.style.display = 'none';
      document.getElementById('p-path').value = 'purchase';
    }

    function needContactConsent() {
      return noCode.checked || (coachPhone.value.trim() !== '') || (trainerPhone.value.trim() !== '');
    }
    function syncConsent() {
      var need = needContactConsent();
      consentRow.hidden = !need;
      coachConsent.required = need;
      if (!need) coachConsent.checked = false;
    }
    function setMode() {
      var ind = noCode.checked;
      for (var i = 0; i < onlyNoCode.length; i++) onlyNoCode[i].hidden = !ind;
      coachName.required = ind; coachPhone.required = ind;
      codeIn.disabled = ind; if (ind) codeIn.value = '';
      document.getElementById('p-path').value = ind ? 'independent' : 'school';
      btn.textContent = ind ? 'Get my temporary code' : 'Set up his profile';
      syncConsent();
    }
    noCode.addEventListener('change', setMode);
    codeIn.addEventListener('input', function () { if (codeIn.value.trim() && noCode.checked) { noCode.checked = false; setMode(); } });
    coachPhone.addEventListener('input', syncConsent);
    trainerPhone.addEventListener('input', syncConsent);
    setMode();

    var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    function makeCode() {
      var body = '', sum = 0;
      for (var i = 0; i < 3; i++) { var c = ALPHA[Math.floor(Math.random() * ALPHA.length)]; body += c; sum += c.charCodeAt(0); }
      return 'FAM-' + body + ALPHA[sum % ALPHA.length];
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'status';
      var ind = noCode.checked;
      if (!PAID && !ind && !codeIn.value.trim()) {
        status.className = 'status err';
        status.textContent = 'Enter your school code, or tick the box to get a temporary one.';
        codeIn.focus(); return;
      }
      var issued = (ind && !PAID) ? makeCode() : '';
      document.getElementById('p-issued').value = issued;
      btn.disabled = true; btn.textContent = 'Sending...';
      var data = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          var grad = document.getElementById('p-grad').value;
          var pos = (posIn.value || '').trim();
          var cs = document.getElementById('p-city').value;
          var st = (cs.split(',').pop() || '').trim().slice(0, 2).toUpperCase();
          // remember class, position and (if issued) the code, for Coach AI, the quizzes and the gate
          try {
            var KEY = 'inhome_pb';
            var sv = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
            sv.cls = grad || sv.cls;
            if (pos) sv.pos = pos.toLowerCase();
            if (ind) { sv.code = issued; sv.codeIssued = Date.now(); }
            else { sv.code = codeIn.value.trim().toUpperCase(); sv.codeIssued = 0; }
            localStorage.setItem(KEY, JSON.stringify(sv));
          } catch (err) {}

          if (PAID) {
            window.location.href = '/start?class=' + encodeURIComponent(grad) + (st.length === 2 ? '&state=' + st : '');
          } else if (ind) {
            document.getElementById('p-bigcode').textContent = issued;
            var cn = coachName.value.trim(); if (cn) document.getElementById('p-coach-echo').textContent = 'Coach ' + cn.split(' ').pop();
            document.getElementById('p-done-school').hidden = true;
            document.getElementById('p-done-ind').hidden = false;
            document.getElementById('p-open').href = PAGE === 'playbook' ? '#course-sec' : '/playbook?class=' + encodeURIComponent(grad);
            panel.classList.add('is-done');
            panel.scrollIntoView({ block: 'center' });
          } else if (PAGE === 'playbook') {
            // stay on the Playbook: confirm and drop them at the modules
            var school = document.getElementById('p-done-school');
            if (school) school.innerHTML = '<p class="eyebrow">He is set</p><h3>Start with Module 1</h3><p>Coach AI now has his class and position, and the quizzes are set for the class of ' + (grad || 'his year') + '. The modules are right below.</p><div class="cta-row" style="margin-top:18px"><a class="btn" href="#course-sec">Go to the modules</a></div>';
            panel.classList.add('is-done');
            var csec = document.getElementById('course-sec');
            if (csec) csec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.location.href = '/start?class=' + encodeURIComponent(grad) + (st.length === 2 ? '&state=' + st : '');
          }
        }).catch(function () {
          btn.disabled = false; setMode();
          status.className = 'status err';
          status.textContent = 'That did not send. Email info@inhomerecruiting.com with his name and school and we will set him up by hand.';
        });
    });
  })();
