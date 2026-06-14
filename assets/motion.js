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

}());
