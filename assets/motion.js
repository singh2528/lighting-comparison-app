/* =========================================================
   OnePoint Smart Home — site-wide motion helpers
   1) Scroll-reveal: .in-view on .reveal elements
   2) 3D tilt: pointer-driven rotateX/Y on .tilt-card
   3) Cursor orb: glowing orb that lags behind the cursor
   4) Click ripple: expanding ring on every click
   5) Hero particles: canvas particle network injected into
      every section.hero (skips heroes that already have a
      canvas child — e.g. Three.js on index.html)
   6) Ambient glow orbs: soft blurred colour blobs in heroes
   All effects skip on prefers-reduced-motion.
   Include on every page: <script src="assets/motion.js"></script>
   ========================================================= */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touchOnly = window.matchMedia &&
    window.matchMedia('(hover: none)').matches;

  /* ─────────────────────────────────────────────────────────
     1. Scroll reveal
     ───────────────────────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { revealIO.observe(el); });
    }
  }

  /* ─────────────────────────────────────────────────────────
     2. 3D tilt on hover
     ───────────────────────────────────────────────────────── */
  if (!reduceMotion) {
    var tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
        card.style.setProperty('--ry', ((x - 0.5) * 10).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     3. Cursor glow orb (desktop only, skips touch devices)
     ───────────────────────────────────────────────────────── */
  if (!reduceMotion && !touchOnly) {
    var orb = document.createElement('div');
    orb.className = 'cursor-orb';
    document.body.appendChild(orb);

    var cx = -600, cy = -600, tx = -600, ty = -600;

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });

    (function tickOrb() {
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      /* offset by half the orb size (260px) to centre it */
      orb.style.transform = 'translate(' + (cx - 260) + 'px,' + (cy - 260) + 'px)';
      requestAnimationFrame(tickOrb);
    }());

    /* ─── 4. Click ripple ─── */
    document.addEventListener('click', function (e) {
      var r = document.createElement('div');
      r.className = 'cursor-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top  = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 700);
    });
  }

  /* ─────────────────────────────────────────────────────────
     5. Hero particle network + 6. Ambient glow orbs
     ───────────────────────────────────────────────────────── */
  if (!reduceMotion) {
    var heroes = document.querySelectorAll('section.hero');

    heroes.forEach(function (hero) {
      /* Skip if a canvas already exists (e.g. Three.js on index.html) */
      if (hero.querySelector('canvas')) return;

      /* Make hero a positioning context */
      var pos = window.getComputedStyle(hero).position;
      if (pos === 'static') hero.style.position = 'relative';

      /* ── Ambient glow orbs ── */
      var orb1 = document.createElement('div');
      orb1.className = 'hero-glow-orb cyan';
      orb1.style.cssText = 'width:420px;height:420px;top:-120px;left:-80px;animation-delay:0s;';

      var orb2 = document.createElement('div');
      orb2.className = 'hero-glow-orb gold';
      orb2.style.cssText = 'width:320px;height:320px;bottom:-100px;right:8%;animation-delay:-5s;';

      hero.insertBefore(orb1, hero.firstChild);
      hero.insertBefore(orb2, hero.firstChild);

      /* ── Particle canvas ── */
      var canvas = document.createElement('canvas');
      canvas.className = 'hero-particles';
      hero.insertBefore(canvas, hero.firstChild);

      var ctx    = canvas.getContext('2d');
      var W = 0, H = 0;
      var NODE_COUNT = 32;
      var MAX_DIST   = 155;
      var nodes = [];

      function resize() {
        W = canvas.width  = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });

      /* Build nodes */
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x:    Math.random() * (W || 800),
          y:    Math.random() * (H || 400),
          vx:   (Math.random() - 0.5) * 0.30,
          vy:   (Math.random() - 0.5) * 0.30,
          r:    Math.random() * 1.8 + 1.2,
          gold: i % 6 === 0,   /* ~1 in 6 nodes are warm gold */
          hub:  i % 9 === 0    /* ~1 in 9 nodes are larger "hub" nodes */
        });
      }

      /* Draw loop */
      (function draw() {
        ctx.clearRect(0, 0, W, H);

        /* Connection lines between nearby nodes */
        for (var i = 0; i < nodes.length; i++) {
          for (var j = i + 1; j < nodes.length; j++) {
            var dx   = nodes[i].x - nodes[j].x;
            var dy   = nodes[i].y - nodes[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAX_DIST) {
              var alpha = (1 - dist / MAX_DIST) * 0.22;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = 'rgba(0, 212, 255, ' + alpha.toFixed(3) + ')';
              ctx.lineWidth   = 0.7;
              ctx.stroke();
            }
          }
        }

        /* Nodes */
        nodes.forEach(function (n) {
          var baseR  = n.hub ? n.r * 2.2 : n.r;
          var color  = n.gold ? '201, 162, 90' : '0, 212, 255';
          var glowR  = baseR * 3.5;

          /* Outer glow */
          var grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
          grd.addColorStop(0,   'rgba(' + color + ', 0.12)');
          grd.addColorStop(1,   'rgba(' + color + ', 0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          /* Core dot */
          ctx.beginPath();
          ctx.arc(n.x, n.y, baseR, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + color + ', 0.75)';
          ctx.fill();

          /* Move */
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > W) n.vx *= -1;
          if (n.y < 0 || n.y > H) n.vy *= -1;
        });

        requestAnimationFrame(draw);
      }());
    });
  }

  /* ─────────────────────────────────────────────────────────
     7. Electric cursor trail — glowing lightning tail that
        follows the mouse and fades to nothing
     ───────────────────────────────────────────────────────── */
  if (!reduceMotion && !touchOnly) {

    var eCanvas = document.createElement('canvas');
    eCanvas.style.cssText = [
      'position:fixed', 'inset:0', 'width:100%', 'height:100%',
      'z-index:9997', 'pointer-events:none', 'will-change:transform'
    ].join(';');
    document.body.appendChild(eCanvas);
    var eCtx = eCanvas.getContext('2d');

    function resizeE() {
      eCanvas.width  = window.innerWidth;
      eCanvas.height = window.innerHeight;
    }
    resizeE();
    window.addEventListener('resize', resizeE, { passive: true });

    var ePts  = [];        /* { x, y, t, jx, jy } */
    var LIFE  = 600;       /* ms until a point vanishes */
    var MAX   = 48;        /* max stored points */
    var eX = -1, eY = -1;

    window.addEventListener('mousemove', function (e) {
      var dx = e.clientX - eX, dy = e.clientY - eY;
      if (dx * dx + dy * dy < 9) return;   /* ignore tiny movements */
      eX = e.clientX; eY = e.clientY;
      ePts.push({
        x:  eX, y: eY,
        t:  Date.now(),
        jx: (Math.random() - 0.5) * 5,    /* frozen electric jitter */
        jy: (Math.random() - 0.5) * 5
      });
      if (ePts.length > MAX) ePts.shift();
    }, { passive: true });

    function drawElectric() {
      var now = Date.now();
      eCtx.clearRect(0, 0, eCanvas.width, eCanvas.height);

      /* drop dead points */
      while (ePts.length && now - ePts[0].t > LIFE) ePts.shift();
      if (ePts.length < 2) { requestAnimationFrame(drawElectric); return; }

      /* ── draw each segment ── */
      for (var i = 1; i < ePts.length; i++) {
        var a = ePts[i - 1], b = ePts[i];
        var ageA = 1 - (now - a.t) / LIFE;
        var ageB = 1 - (now - b.t) / LIFE;
        var alpha = (ageA + ageB) * 0.5;

        /* jittered midpoint gives the lightning kink */
        var mx = (a.x + b.x) * 0.5 + b.jx;
        var my = (a.y + b.y) * 0.5 + b.jy;

        /* --- outer glow (wide, soft) --- */
        eCtx.beginPath();
        eCtx.moveTo(a.x, a.y);
        eCtx.quadraticCurveTo(mx, my, b.x, b.y);
        eCtx.strokeStyle = 'rgba(0,212,255,' + (alpha * 0.18).toFixed(3) + ')';
        eCtx.lineWidth   = 9;
        eCtx.lineCap     = 'round';
        eCtx.shadowBlur  = 18;
        eCtx.shadowColor = '#00d4ff';
        eCtx.stroke();

        /* --- mid glow --- */
        eCtx.beginPath();
        eCtx.moveTo(a.x, a.y);
        eCtx.quadraticCurveTo(mx, my, b.x, b.y);
        eCtx.strokeStyle = 'rgba(0,212,255,' + (alpha * 0.45).toFixed(3) + ')';
        eCtx.lineWidth   = 3;
        eCtx.shadowBlur  = 8;
        eCtx.stroke();

        /* --- bright core --- */
        eCtx.beginPath();
        eCtx.moveTo(a.x, a.y);
        eCtx.quadraticCurveTo(mx, my, b.x, b.y);
        eCtx.strokeStyle = 'rgba(200,242,255,' + (alpha * 0.80).toFixed(3) + ')';
        eCtx.lineWidth   = 1;
        eCtx.shadowBlur  = 4;
        eCtx.stroke();

        /* --- random spark branches off midpoint --- */
        if (ageB > 0.55 && Math.random() < 0.30) {
          var segLen = Math.sqrt(
            (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)
          ) || 1;
          /* perpendicular unit vector */
          var nx = -(b.y - a.y) / segLen;
          var ny =  (b.x - a.x) / segLen;
          var side    = Math.random() > 0.5 ? 1 : -1;
          var sLen    = segLen * (0.25 + Math.random() * 0.45);
          var sparkX2 = mx + nx * side * sLen + (Math.random() - 0.5) * 4;
          var sparkY2 = my + ny * side * sLen + (Math.random() - 0.5) * 4;

          eCtx.beginPath();
          eCtx.moveTo(mx, my);
          eCtx.lineTo(sparkX2, sparkY2);
          eCtx.strokeStyle = 'rgba(0,212,255,' + (ageB * 0.5).toFixed(3) + ')';
          eCtx.lineWidth   = 0.9;
          eCtx.shadowBlur  = 6;
          eCtx.stroke();
        }
      }

      /* --- bright dot at the live cursor tip --- */
      var tip = ePts[ePts.length - 1];
      if (tip && now - tip.t < 120) {
        eCtx.beginPath();
        eCtx.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2);
        eCtx.fillStyle   = 'rgba(220,248,255,0.95)';
        eCtx.shadowBlur  = 20;
        eCtx.shadowColor = '#00d4ff';
        eCtx.fill();
      }

      eCtx.shadowBlur = 0;
      requestAnimationFrame(drawElectric);
    }

    requestAnimationFrame(drawElectric);
  }

}());
