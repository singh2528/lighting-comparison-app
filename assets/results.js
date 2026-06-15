/* =========================================================
   OnePoint Smart Home — results.js
   Premium result card + tier comparison rendering shared
   across all smart home sub-pages.

   Exposes window.OP with:
     renderResult(opts)          — animated result card in right panel
     updateTierHighlight(id,key) — highlights a tier card column
     initTierCards(tableId)      — converts dense table → 3 visual cards
   ========================================================= */

(function () {
  'use strict';

  window.OP = window.OP || {};

  /* ── Format AED ── */
  function fmtAed(n) {
    if (n >= 1000000) return 'AED ' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return 'AED ' + Math.round(n / 1000) + 'K';
    return 'AED ' + Math.round(n).toLocaleString('en-US');
  }

  /* ────────────────────────────────────────────────────────
     renderResult(opts)
     Renders the premium result card into opts.el.

     opts = {
       el           HTMLElement — container div (#avResults etc.)
       tierName     string      — "Wireless Speakers"
       units        number      — 5
       unitLabel    string      — "zones" | "cameras" | "windows" | "points"
       low          number      — budget lower bound
       high         number      — budget upper bound
       note         string      — advisory copy (HTML allowed)
       tiers        array       — all 3 tier objects for position indicator
         [ { key, name, lowPer, highPer, fixedLow, fixedHigh } ]
       selectedTier string      — key of the chosen tier
       noteIcon     string      — emoji prefix for note (default "💡")
     }
  ─────────────────────────────────────────────────────────── */
  window.OP.renderResult = function (opts) {
    var pts    = opts.units;
    var tiers  = opts.tiers;
    var icon   = opts.noteIcon || '💡';

    /* Scale the budget bar against overall max across all tiers */
    var allMax = 0;
    tiers.forEach(function (t) {
      var h = pts * t.highPer + t.fixedHigh;
      if (h > allMax) allMax = h;
    });
    var budgetPct = allMax ? Math.round((opts.high / allMax) * 90) : 60;
    budgetPct = Math.max(8, Math.min(90, budgetPct));

    /* Three position pills */
    var pillLabels = { basic: 'Economy', scenes: 'Mid-Range', full: 'Premium' };
    var pillsHtml = tiers.map(function (t) {
      var isSel = (t.key === opts.selectedTier);
      var cls   = 'op-pill' + (isSel ? ' op-pill--selected' : '');
      var price = fmtAed(Math.round(pts * t.lowPer + t.fixedLow));
      return (
        '<div class="' + cls + '">' +
          '<div class="op-pill-name">' + (pillLabels[t.key] || t.name) + '</div>' +
          '<div class="op-pill-price">' + price + '</div>' +
          '<div class="op-pill-dot"></div>' +
        '</div>'
      );
    }).join('');

    opts.el.innerHTML =
      '<div class="op-result-card">' +
        '<div class="op-rc-bar"></div>' +
        '<div class="op-rc-inner">' +

          /* ── Tier name ── */
          '<div>' +
            '<div class="op-rc-tier-badge">✦ Recommended Tier</div>' +
            '<h3 class="op-rc-name">' + opts.tierName + '</h3>' +
            '<span class="op-rc-units">≈ ' + pts + ' ' + opts.unitLabel + '</span>' +
          '</div>' +

          /* ── Budget range ── */
          '<div>' +
            '<div class="op-rc-label">Indicative Budget</div>' +
            '<div class="op-budget-wrap">' +
              '<div class="op-budget-values">' +
                '<span class="op-budget-low">'  + fmtAed(opts.low)  + '</span>' +
                '<span class="op-budget-sep">— to —</span>' +
                '<span class="op-budget-high">' + fmtAed(opts.high) + '</span>' +
              '</div>' +
              '<div class="op-budget-track">' +
                '<div class="op-budget-fill" style="--budget-pct:' + budgetPct + '%;"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* ── Position indicator ── */
          '<div>' +
            '<div class="op-rc-label">Where this sits</div>' +
            '<div class="op-position-pills">' + pillsHtml + '</div>' +
          '</div>' +

          /* ── Advisory note ── */
          '<div class="op-rc-note">' +
            '<div class="op-note-icon">' + icon + '</div>' +
            '<p>' + opts.note + '</p>' +
          '</div>' +

          /* ── CTA ── */
          '<a class="op-rc-cta" href="services.html#contact">Get a real design →</a>' +

        '</div>' +
      '</div>';
  };

  /* ────────────────────────────────────────────────────────
     initTierCards(tableId)
     Reads the comparison table and injects 3 premium cards
     below it, then hides the original table.
  ─────────────────────────────────────────────────────────── */
  window.OP.initTierCards = function (tableId) {
    var table = document.getElementById(tableId);
    if (!table) return;
    if (document.getElementById('op-tc-' + tableId)) return; /* already done */

    /* Column headers + tier keys */
    var headers  = [];
    var tierKeys = [];
    table.querySelectorAll('thead th[data-tier]').forEach(function (th) {
      headers.push(th.innerHTML.trim());
      tierKeys.push(th.getAttribute('data-tier'));
    });

    /* Row labels + per-tier cell data */
    var rowLabels = [];
    var rowData   = {};
    tierKeys.forEach(function (k) { rowData[k] = []; });

    table.querySelectorAll('tbody tr').forEach(function (tr) {
      var th = tr.querySelector('th');
      rowLabels.push(th ? th.textContent.trim() : '');
      tr.querySelectorAll('[data-tier]').forEach(function (td) {
        rowData[td.getAttribute('data-tier')].push(td.innerHTML.trim());
      });
    });

    /* Row layout: ..., n-2 = Best for, n-1 = Price */
    var tierIcons  = { basic: '⚡', scenes: '🎛️', full: '💎' };
    var badgeNames = { basic: 'Economy', scenes: 'Mid-Range', full: 'Premium' };

    var cardsHtml = '<div class="op-tier-cards" id="op-tc-' + tableId + '">';

    tierKeys.forEach(function (key, idx) {
      var rows     = rowData[key];
      var total    = rows.length;
      var priceRow = rows[total - 1] || '';
      var bestFor  = rows[total - 2] || '';
      var bodyRows = rows.slice(0, total - 2);

      var bodyHtml = '';
      bodyRows.forEach(function (val, ri) {
        bodyHtml +=
          '<div class="op-tc-row">' +
            '<span class="op-tc-row-label">' + (rowLabels[ri] || '') + '</span>' +
            '<span class="op-tc-row-val">'   + val + '</span>' +
          '</div>';
      });

      cardsHtml +=
        '<div class="op-tc" data-tier-key="' + key + '">' +
          '<div class="op-tc-head">' +
            '<div class="op-tc-badge-row">' +
              '<span class="op-tc-badge">' + tierIcons[key] + ' ' + (badgeNames[key] || '') + '</span>' +
              '<span class="op-tc-rec-tag">Recommended</span>' +
            '</div>' +
            '<h4 class="op-tc-title">' + headers[idx] + '</h4>' +
            '<span class="op-tc-price">' + priceRow + '</span>' +
          '</div>' +
          '<div class="op-tc-body">' +
            bodyHtml +
            '<div class="op-tc-best">Best for: ' + bestFor + '</div>' +
          '</div>' +
        '</div>';
    });

    cardsHtml += '</div>';

    /* Hide original table, inject cards */
    var container = table.closest('.brand-tier-table');
    if (container) {
      container.insertAdjacentHTML('afterend', cardsHtml);
      container.style.display = 'none';
    }
  };

  /* ────────────────────────────────────────────────────────
     updateTierHighlight(tableId, selectedKey)
     Adds/removes .op-tc--highlight to match the chosen tier.
  ─────────────────────────────────────────────────────────── */
  window.OP.updateTierHighlight = function (tableId, selectedKey) {
    var wrapper = document.getElementById('op-tc-' + tableId);
    if (!wrapper) return;
    wrapper.querySelectorAll('.op-tc').forEach(function (card) {
      if (card.getAttribute('data-tier-key') === selectedKey) {
        card.classList.add('op-tc--highlight');
      } else {
        card.classList.remove('op-tc--highlight');
      }
    });
  };

  /* ── Auto-init all known tables on DOMContentLoaded ── */
  document.addEventListener('DOMContentLoaded', function () {
    ['avTable', 'hvacTable', 'cctvTable', 'curtainsTable', 'lcTable'].forEach(function (id) {
      window.OP.initTierCards(id);
    });
  });

}());
