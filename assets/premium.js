/* SHK Premium Motion Layer */
(() => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const installStyles = () => {
    if (document.getElementById('shkPremiumStyles')) return;
    const style = document.createElement('style');
    style.id = 'shkPremiumStyles';
    style.textContent = `
      :root{--shk-red:#8f2232;--shk-green:#355a45;--shk-gold:#c8a15a}
      body{overflow-x:hidden}
      body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:-1;opacity:.5;background:radial-gradient(circle at 12% 10%,rgba(200,161,90,.13),transparent 25%),radial-gradient(circle at 88% 28%,rgba(143,34,50,.08),transparent 27%),radial-gradient(circle at 72% 92%,rgba(53,90,69,.09),transparent 28%),linear-gradient(120deg,rgba(255,255,255,.5),transparent 45%);}
      .shk-scrollbar{position:fixed;top:0;left:0;width:100%;height:3px;z-index:9999;background:transparent;pointer-events:none}
      .shk-scrollbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--shk-red),var(--shk-gold),var(--shk-green));box-shadow:0 0 12px rgba(212,147,22,.45);transition:width .08s linear}
      nav{transition:background .35s ease,box-shadow .35s ease,transform .35s ease}
      nav.shk-scrolled{background:rgba(255,250,240,.93);box-shadow:0 13px 35px rgba(76,44,18,.12)}
      .shk-animated{opacity:0;transform:translateY(24px) scale(.985);transition:opacity .78s cubic-bezier(.2,.72,.2,1),transform .78s cubic-bezier(.2,.72,.2,1)}
      .shk-animated.shk-visible{opacity:1;transform:none}
      .shk-animated.shk-delay-1{transition-delay:.07s}.shk-animated.shk-delay-2{transition-delay:.14s}.shk-animated.shk-delay-3{transition-delay:.21s}.shk-animated.shk-delay-4{transition-delay:.28s}
      .tilt-card{transform-style:preserve-3d;will-change:transform}
      .shk-ripple{position:absolute;left:0;top:0;width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.42);pointer-events:none;transform:translate(-50%,-50%) scale(1);animation:shkRipple .62s ease-out forwards;mix-blend-mode:screen}
      .shk-lift{transition:transform .22s ease,box-shadow .22s ease,filter .22s ease}.card,.panel,.image-card,.photo-card,.food-card,.value-card,.story-panel,.closing-box,.item-card{border-color:rgba(200,161,90,.38)!important;box-shadow:0 14px 35px rgba(47,39,36,.07),0 2px 0 rgba(255,255,255,.72) inset}.card:hover,.panel:hover,.image-card:hover,.photo-card:hover,.food-card:hover,.value-card:hover,.story-panel:hover,.closing-box:hover,.item-card:hover{box-shadow:0 22px 48px rgba(47,39,36,.12),0 2px 0 rgba(255,255,255,.8) inset}
      .shk-lift:hover{filter:saturate(1.04)}
      .links a,.btn,.add,.primary,.secondary,.filter,.qty-btn,.remove-btn,.choice label,.payment-option label{position:relative;overflow:hidden}
      .links a:active,.btn:active,.add:active,.primary:active,.secondary:active,.filter:active,.qty-btn:active,.remove-btn:active,.choice label:active,.payment-option label:active{transform:scale(.97)}
      .shk-glint{position:absolute;inset:-20% auto -20% -42%;width:34%;transform:skewX(-18deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.34),transparent);pointer-events:none;opacity:0}
      .add:hover .shk-glint,.primary:hover .shk-glint,.btn:hover .shk-glint{animation:shkGlint 1.05s ease}
      .shk-orbit{animation:shkOrbit 12s ease-in-out infinite}.nav-logo,.hero-logo{filter:drop-shadow(0 12px 24px rgba(47,39,36,.12))}.nav-logo{transition:transform .35s ease,filter .35s ease}.nav-logo:hover{transform:translateY(-2px) scale(1.02);filter:drop-shadow(0 15px 28px rgba(200,161,90,.25))}.section-title{position:relative}.section-title::after{content:"";display:block;width:58px;height:3px;margin:13px auto 0;border-radius:9px;background:linear-gradient(90deg,#8f2232,#c8a15a,#355a45);transform-origin:center;animation:shkTitleLine 3.5s ease-in-out infinite}
      .shk-breathe{animation:shkBreathe 4.8s ease-in-out infinite}
      @keyframes shkRipple{to{opacity:0;transform:translate(-50%,-50%) scale(11)}}
      @keyframes shkGlint{0%{left:-42%;opacity:0}18%{opacity:1}100%{left:125%;opacity:0}}
      @keyframes shkOrbit{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(10px,-12px,0) rotate(1deg)}}
      @keyframes shkBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes shkTitleLine{0%,100%{transform:scaleX(.72);opacity:.72}50%{transform:scaleX(1.15);opacity:1}}
      @media (hover:none){.tilt-card{transform:none!important}}
      @media (max-width:650px){body::before{opacity:.18}.shk-scrollbar{height:2px}}
      @media (prefers-reduced-motion:reduce){
        .shk-animated{opacity:1!important;transform:none!important;transition:none!important}
        .shk-ripple,.shk-glint,.shk-orbit,.shk-breathe{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  };

  const addScrollBar = () => {
    if (document.querySelector('.shk-scrollbar')) return;
    const bar = document.createElement('div');
    bar.className = 'shk-scrollbar';
    bar.innerHTML = '<i></i>';
    document.body.appendChild(bar);
  };

  const updateScroll = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.max(0, Math.min(100, (window.scrollY / max) * 100));
    const fill = document.querySelector('.shk-scrollbar i');
    if (fill) fill.style.width = pct + '%';
    const nav = document.querySelector('nav');
    if (nav) nav.classList.toggle('shk-scrolled', window.scrollY > 10);
  };

  const prepare = (el, index) => {
    if (!(el instanceof HTMLElement) || el.dataset.shkPrepared) return;
    el.dataset.shkPrepared = '1';
    if (!reduce && !el.classList.contains('reveal') && !el.classList.contains('shk-animated')) {
      el.classList.add('shk-animated');
      if (index % 5) el.classList.add('shk-delay-' + Math.min(4, index % 5));
    } else if (reduce) {
      el.classList.add('shk-visible');
    }
  };

  const revealAll = () => {
    if (reduce || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.shk-animated').forEach(el => el.classList.add('shk-visible'));
      return;
    }
    const items = document.querySelectorAll('.shk-animated:not(.shk-observed)');
    if (!items.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('shk-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: .12, rootMargin: '0px 0px -35px 0px'});
    items.forEach(el => { el.classList.add('shk-observed'); io.observe(el); });
  };

  const prepareExisting = () => {
    const selectors = [
      'section','main > .wrap > *','.hero > .wrap > *','.card','.panel','.image-card','.photo-card',
      '.food-card','.value-card','.story-panel','.closing-box','.item-card','.summary-item',
      '.choice','.payment-option','.field'
    ].join(',');
    let index = 0;
    document.querySelectorAll(selectors).forEach(el => {
      if (el.matches('nav,footer,script,style')) return;
      prepare(el, index++);
      if (['card','photo-card','food-card','value-card','story-panel','closing-box','item-card','panel'].some(c => el.classList.contains(c))) {
        el.classList.add('tilt-card','shk-lift');
      }
    });
    revealAll();
  };

  const addButtonGlints = () => {
    document.querySelectorAll('.btn,.add,.primary,.secondary').forEach(el => {
      if (el.querySelector('.shk-glint')) return;
      const g = document.createElement('span');
      g.className = 'shk-glint';
      el.appendChild(g);
    });
  };

  const bindPointerTilt = () => {
    if (reduce || !window.matchMedia('(hover:hover)').matches) return;
    document.addEventListener('pointermove', e => {
      const el = e.target.closest && e.target.closest('.tilt-card');
      if (!el || !document.body.contains(el)) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      const rx = Math.max(-3.5, Math.min(3.5, -py * 6.5));
      const ry = Math.max(-3.5, Math.min(3.5, px * 6.5));
      el.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
    }, {passive:true});
    document.addEventListener('pointerover', e => {
      const el = e.target.closest && e.target.closest('.tilt-card');
      if (el) el.style.transition = 'transform .12s ease,box-shadow .25s ease';
    });
    document.addEventListener('pointerout', e => {
      const el = e.target.closest && e.target.closest('.tilt-card');
      if (!el || el.contains(e.relatedTarget)) return;
      el.style.transform = '';
      el.style.transition = '';
    });
  };

  const bindRipple = () => {
    document.addEventListener('pointerdown', e => {
      const target = e.target.closest && e.target.closest('button,.btn,.filter,.qty-btn,.remove-btn,.choice label,.payment-option label');
      if (!target || !document.body.contains(target)) return;
      const r = target.getBoundingClientRect();
      const ring = document.createElement('span');
      ring.className = 'shk-ripple';
      ring.style.left = (e.clientX - r.left) + 'px';
      ring.style.top = (e.clientY - r.top) + 'px';
      target.appendChild(ring);
      setTimeout(() => ring.remove(), 680);
    }, {passive:true});
  };

  const observeDom = () => {
    if (!('MutationObserver' in window)) return;
    const mo = new MutationObserver(mutations => {
      let changed = false;
      mutations.forEach(m => { if (m.addedNodes && m.addedNodes.length) changed = true; });
      if (!changed) return;
      requestAnimationFrame(() => {
        let index = 0;
        document.querySelectorAll('.card,.summary-item,.item-card,.panel,.image-card,.field,.choice,.payment-option,.food-card,.value-card,.story-panel,.closing-box').forEach(el => {
          prepare(el, index++);
          if (['card','summary-item','item-card','panel','food-card','value-card','story-panel','closing-box'].some(c => el.classList.contains(c))) el.classList.add('tilt-card','shk-lift');
        });
        addButtonGlints();
        revealAll();
      });
    });
    mo.observe(document.body, {childList:true, subtree:true});
  };

  window.SHK_PREMIUM_REFRESH = () => { prepareExisting(); addButtonGlints(); revealAll(); };\n\n  const init = () => {
    installStyles();
    addScrollBar();
    prepareExisting();
    addButtonGlints();
    bindPointerTilt();
    bindRipple();
    observeDom();
    updateScroll();
    window.addEventListener('scroll', updateScroll, {passive:true});
    window.addEventListener('resize', updateScroll, {passive:true});
    setTimeout(updateScroll, 150);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
