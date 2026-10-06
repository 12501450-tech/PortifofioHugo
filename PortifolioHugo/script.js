(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- THEME TOGGLE ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeToggle');
  var iconMoon = document.getElementById('iconMoon');
  var iconSun = document.getElementById('iconSun');

  function applyTheme(t){
    if(t === 'light'){ root.setAttribute('data-theme','light'); }
    else { root.removeAttribute('data-theme'); }
    var isLight = t === 'light';
    iconMoon.style.display = isLight ? 'none' : 'block';
    iconSun.style.display = isLight ? 'block' : 'none';
    themeBtn.setAttribute('aria-pressed', String(!isLight));
  }

  try{
    var saved = localStorage.getItem('hgb-theme');
    applyTheme(saved || 'dark');
  }catch(e){ applyTheme('dark'); }

  themeBtn.addEventListener('click', function(){
    var isLight = root.getAttribute('data-theme') === 'light';
    var next = isLight ? 'dark' : 'light';
    applyTheme(next);
    try{ localStorage.setItem('hgb-theme', next); }catch(e){}
  });

  /* ---------- TYPING EFFECT (JS interaction 1) ---------- */
  var phrases = ['estudante de informatica', 'futuro dev front-end', 'em busca de um estagio'];
  var typingEl = document.getElementById('typingText');
  if(reduceMotion){
    typingEl.textContent = phrases[0];
  } else {
    var pIndex = 0, cIndex = 0, deleting = false;
    function tick(){
      var full = phrases[pIndex];
      if(!deleting){
        cIndex++;
        typingEl.textContent = full.slice(0, cIndex);
        if(cIndex === full.length){ deleting = true; setTimeout(tick, 1400); return; }
      } else {
        cIndex--;
        typingEl.textContent = full.slice(0, cIndex);
        if(cIndex === 0){ deleting = false; pIndex = (pIndex + 1) % phrases.length; }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  /* ---------- SCROLL REVEAL (JS interaction 2) ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if(reduceMotion || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* ---------- MODAL SYSTEM ---------- */
  var backdrop = document.getElementById('modalBackdrop');
  var modalContent = document.getElementById('modalContent');
  var modalClose = document.getElementById('modalClose');
  var lastFocused = null;

  var modalData = {
    'project-hbg': {
      title: 'HBG — Concessionária de carros premium',
      body: '<p>Site institucional de uma concessionária fictícia de carros de luxo, com página inicial apresentando os destaques e uma página secundária de modelos. Desenvolvido em HTML e CSS, praticando estruturação de layout e navegação entre páginas.</p>',
      links: [
        { label: 'Ver site publicado', href: 'https://12501450-tech.github.io/AtividadeHugoGebauer/' },
        { label: 'Ver código no GitHub', href: 'https://github.com/12501450-tech/AtividadeHugoGebauer' }
      ]
    },
    'form-success': {
      title: 'Formulário validado',
      body: '<p>Seus dados passaram por todas as validações do formulário. Este site ainda não está conectado a um serviço de envio de e-mail, então nenhuma mensagem real foi enviada — mas é aqui que ela apareceria pronta para ir.</p>',
      links: []
    }
  };

  function openModal(key){
    var data = modalData[key];
    if(!data) return;
    var linksHtml = data.links.map(function(l){
      return '<a class="btn" href="' + l.href + '" target="_blank" rel="noopener">' + l.label + '</a>';
    }).join('');
    modalContent.innerHTML =
      '<div class="m-bar"><span></span><span></span><span></span></div>' +
      '<div class="m-body"><h3 id="modalTitle">' + data.title + '</h3>' + data.body +
      (linksHtml ? '<div class="modal-links">' + linksHtml + '</div>' : '') + '</div>';
    lastFocused = document.activeElement;
    backdrop.classList.add('open');
    modalClose.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    if(lastFocused){ lastFocused.focus(); }
  }

  document.querySelectorAll('[data-modal]').forEach(function(btn){
    btn.addEventListener('click', function(){ openModal(btn.getAttribute('data-modal')); });
  });
  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', function(e){ if(e.target === backdrop){ closeModal(); } });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && backdrop.classList.contains('open')){ closeModal(); } });

  /* ---------- FORM: MASKS + VALIDATION ---------- */
  var nomeInput = document.getElementById('nome');
  var telInput = document.getElementById('telefone');
  var emailInput = document.getElementById('email');
  var msgInput = document.getElementById('mensagem');
  var form = document.getElementById('contactForm');

  nomeInput.addEventListener('input', function(){
    this.value = this.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
  });

  telInput.addEventListener('input', function(){
    var v = this.value.replace(/\D/g, '').slice(0, 11);
    if(v.length > 10){
      v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if(v.length > 6){
      v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if(v.length > 2){
      v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    } else if(v.length > 0){
      v = v.replace(/(\d{0,2})/, '($1');
    }
    this.value = v.trim().replace(/-$/, '').replace(/\)\s*$/, ') ');
  });

  function setError(input, msg){
    var field = input.closest('.field');
    var err = field.querySelector('.err');
    if(msg){ field.classList.add('has-err'); err.textContent = msg; }
    else { field.classList.remove('has-err'); err.textContent = ''; }
    return !msg;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var ok = true;

    ok = setError(nomeInput, nomeInput.value.trim().length < 3 ? 'Digite seu nome completo.' : '') && ok;

    var telDigits = telInput.value.replace(/\D/g, '');
    ok = setError(telInput, telDigits.length < 10 ? 'Telefone incompleto. Ex: (31) 91234-5678' : '') && ok;

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    ok = setError(emailInput, !emailOk ? 'Digite um e-mail válido.' : '') && ok;

    ok = setError(msgInput, msgInput.value.trim().length < 10 ? 'Escreva uma mensagem um pouco mais detalhada.' : '') && ok;

    if(ok){
      openModal('form-success');
      form.reset();
    }
  });
})();
