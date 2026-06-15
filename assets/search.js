/* =========================================================
   OnePoint Smart Home — search.js
   Handles the AI search bar on every page.
   Calls /api/ask → renders premium card in #answerPanel.
   ========================================================= */

(function () {
  'use strict';

  var form  = document.getElementById('askForm');
  var input = document.getElementById('askInput');
  var panel = document.getElementById('answerPanel');
  if (!form || !input || !panel) return;

  /* ── Chips auto-fill the search bar ── */
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.textContent.trim();
      input.focus();
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
  });

  /* ── Inline markdown formatting ── */
  function inlineFormat(t) {
    return t
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,     '<em>$1</em>')
      .replace(/`([^`]+)`/g,     '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank">$1</a>');
  }

  /* ── Table rows → styled HTML table ── */
  function buildTable(rows) {
    var sepIdx = -1;
    for (var s = 0; s < rows.length; s++) {
      if (/^\|[\s\-:|\s]+\|$/.test(rows[s].trim())) { sepIdx = s; break; }
    }
    var headRows = sepIdx > 0 ? rows.slice(0, sepIdx) : [];
    var bodyRows = sepIdx >= 0 ? rows.slice(sepIdx + 1) : rows;

    function makeRow(r, tag) {
      var cells = r.replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); });
      return '<tr>' + cells.map(function (c) {
        return '<' + tag + '>' + inlineFormat(c) + '</' + tag + '>';
      }).join('') + '</tr>';
    }

    var html = '<div class="ap-table-wrap"><table>';
    if (headRows.length) {
      html += '<thead>' + headRows.map(function (r) { return makeRow(r, 'th'); }).join('') + '</thead>';
    }
    html += '<tbody>' + bodyRows.map(function (r) { return makeRow(r, 'td'); }).join('') + '</tbody>';
    return html + '</table></div>';
  }

  /* ── Markdown → structured HTML ── */
  function mdToHtml(raw) {
    var lines = raw.split('\n');
    var out   = [];
    var i     = 0;

    while (i < lines.length) {
      var line = lines[i];

      /* fenced code block — skip */
      if (/^```/.test(line)) {
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) i++;
        i++;
        continue;
      }

      /* table */
      if (/^\|/.test(line)) {
        var tbl = [];
        while (i < lines.length && /^\|/.test(lines[i])) { tbl.push(lines[i]); i++; }
        out.push(buildTable(tbl));
        continue;
      }

      /* heading */
      if (/^#{1,3}\s+/.test(line)) {
        out.push('<div class="ap-h">' + inlineFormat(line.replace(/^#{1,3}\s+/, '')) + '</div>');
        i++;
        continue;
      }

      /* unordered list */
      if (/^[-*]\s+/.test(line)) {
        var items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          items.push('<li>' + inlineFormat(lines[i].replace(/^[-*]\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ul class="ap-list">' + items.join('') + '</ul>');
        continue;
      }

      /* numbered list */
      if (/^\d+\.\s+/.test(line)) {
        var nitems = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          nitems.push('<li>' + inlineFormat(lines[i].replace(/^\d+\.\s+/, '')) + '</li>');
          i++;
        }
        out.push('<ul class="ap-list">' + nitems.join('') + '</ul>');
        continue;
      }

      /* blank line */
      if (!line.trim()) { i++; continue; }

      /* paragraph */
      var para = [];
      while (i < lines.length && lines[i].trim() &&
             !/^[|#`]/.test(lines[i]) &&
             !/^[-*]\s/.test(lines[i]) &&
             !/^\d+\.\s/.test(lines[i])) {
        para.push(inlineFormat(lines[i]));
        i++;
      }
      if (para.length) out.push('<p>' + para.join('<br>') + '</p>');
    }

    return out.join('');
  }

  /* ── Format number with unit label ── */
  function fmtNum(val, unit) {
    if (unit === 'AED') {
      if (val >= 1000000) return 'AED ' + (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000)    return 'AED ' + Math.round(val / 1000) + 'K';
      return 'AED ' + val;
    }
    return val + (unit ? ' ' + unit : '');
  }

  /* ── Horizontal bar chart ── */
  function renderBarChart(v) {
    var items = v.items || [];
    if (!items.length) return '';
    var max = Math.max.apply(null, items.map(function (x) { return x.value || 0; }));
    if (!max) return '';

    var bars = items.map(function (item) {
      var pct = Math.round((item.value / max) * 84);
      return '<div class="ap-bar-row">' +
        '<span class="ap-bar-label">' + item.label + '</span>' +
        '<div class="ap-bar-track"><div class="ap-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="ap-bar-val">' + fmtNum(item.value, v.unit) + '</span>' +
        '</div>';
    }).join('');

    return '<div class="ap-chart">' +
      (v.title ? '<div class="ap-chart-title">' + v.title + '</div>' : '') +
      bars + '</div>';
  }

  /* ── 3-tier comparison cards ── */
  function renderTiers(v) {
    var items = v.items || [];
    if (!items.length) return '';

    var cards = items.map(function (t, idx) {
      var mid = idx === 1 ? ' ap-tier--mid' : '';
      return '<div class="ap-tier' + mid + '">' +
        '<div class="ap-tier-label">' + t.label + '</div>' +
        '<div class="ap-tier-range">' + (t.range || '') + '</div>' +
        '<div class="ap-tier-tag">' + (t.tag || '') + '</div>' +
        '</div>';
    }).join('');

    return '<div class="ap-tiers">' +
      (v.title ? '<div class="ap-chart-title">' + v.title + '</div>' : '') +
      '<div class="ap-tier-row">' + cards + '</div>' +
      '</div>';
  }

  /* ── Dispatch visual renderer by type ── */
  function renderVisual(v) {
    if (!v || !v.type) return '';
    if (v.type === 'bar')  return renderBarChart(v);
    if (v.type === 'tier') return renderTiers(v);
    return '';
  }

  /* ── AI spark icon SVG ── */
  var AI_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"' +
    ' style="width:12px;height:12px;flex-shrink:0;">' +
    '<circle cx="12" cy="12" r="3"/>' +
    '<path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83' +
    'M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>';

  /* ── Build the card shell ── */
  function buildCard(opts) {
    var barClass = 'ap-bar' + (opts.animBar ? ' ap-bar--anim' : '');
    var barStyle = opts.barStyle ? ' style="' + opts.barStyle + '"' : '';
    return '<div class="ap-card">' +
      '<div class="' + barClass + '"' + barStyle + '></div>' +
      '<div class="ap-header">' + (opts.header || '') + '</div>' +
      '<div class="ap-body">'   + (opts.body   || '') + '</div>' +
      (opts.footer ? '<div class="ap-footer">' + opts.footer + '</div>' : '') +
      '</div>';
  }

  /* ── Show full AI answer ── */
  function showAnswer(textHtml, visual, hasWebSearch) {
    var webBadge = hasWebSearch
      ? '<span class="ap-web-badge">&#127760; Live web results</span>'
      : '';
    var visualHtml = renderVisual(visual);

    panel.innerHTML = buildCard({
      header: '<span class="ap-label">' + AI_ICON + ' AI Advisor</span>' + webBadge,
      body:   textHtml + (visualHtml ? '<div class="ap-visual">' + visualHtml + '</div>' : ''),
      footer: '<span class="ap-powered">Powered by Claude AI · Prices are indicative</span>' +
              '<a class="ap-cta" href="services.html#contact">Get a real design →</a>'
    });

    panel.classList.add('show');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Loading skeleton ── */
  function showLoading() {
    panel.innerHTML = buildCard({
      animBar: true,
      header:  '<span class="ap-label">' + AI_ICON + ' AI Advisor</span>',
      body:    '<span class="ap-thinking" id="apDots">Thinking</span>'
    });
    panel.classList.add('show');

    var dots  = panel.querySelector('#apDots');
    var count = 0;
    return setInterval(function () {
      count = (count + 1) % 4;
      if (dots) dots.textContent = 'Thinking' + '.'.repeat(count);
    }, 400);
  }

  /* ── Error state ── */
  function showError(msg) {
    panel.innerHTML = buildCard({
      barStyle: 'background:rgba(255,80,80,.55);',
      header:   '<span class="ap-label">' + AI_ICON + ' AI Advisor</span>',
      body:     '<span class="ap-error">⚠ ' + msg + '</span>'
    });
    panel.classList.add('show');
  }

  /* ── Form submit ── */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var question = (input.value || '').trim();
    if (!question) return;

    var loadTimer = showLoading();

    try {
      var res = await fetch('/api/ask', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ question: question })
      });

      clearInterval(loadTimer);

      if (!res.ok) {
        var errData = await res.json().catch(function () { return {}; });
        showError(errData.error || 'Something went wrong. Please try again.');
        return;
      }

      var data = await res.json();
      if (data.error) { showError(data.error); return; }

      showAnswer(mdToHtml(data.answer), data.visual || null, data.hasWebSearch);

    } catch (err) {
      clearInterval(loadTimer);
      showError('Could not reach the AI advisor. Check your connection and try again.');
    }
  });

}());
