/* =========================================================
   OnePoint Smart Home — search.js
   Handles the AI search bar on every page.
   Calls /api/ask → renders answer in #answerPanel.
   ========================================================= */

(function () {
  'use strict';

  var form   = document.getElementById('askForm');
  var input  = document.getElementById('askInput');
  var panel  = document.getElementById('answerPanel');
  if (!form || !input || !panel) return;

  /* ── Chips auto-fill the search bar ── */
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.textContent.trim();
      input.focus();
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
  });

  /* ── Lightweight Markdown → HTML (bold, links, line breaks, lists) ── */
  function mdToHtml(text) {
    return text
      /* fenced code blocks (skip — just strip them) */
      .replace(/```[\s\S]*?```/g, '')
      /* headings → bold paragraph */
      .replace(/^#{1,3}\s+(.+)$/gm, '<strong>$1</strong>')
      /* **bold** */
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      /* *italic* */
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      /* [text](url) links */
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent);text-decoration:underline;" target="_self">$1</a>')
      /* table rows (simple — strip pipes, make each row a line) */
      .replace(/^\|(.+)\|$/gm, function (_, row) {
        var cells = row.split('|').map(function (c) { return c.trim(); });
        return '<span style="display:block;font-family:monospace;font-size:.82rem;opacity:.85;">' + cells.join('  ·  ') + '</span>';
      })
      /* separator rows in tables */
      .replace(/^\|[-| :]+\|$/gm, '')
      /* unordered list items */
      .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
      /* wrap consecutive <li> in <ul> */
      .replace(/(<li>.*<\/li>\n?)+/g, function (match) {
        return '<ul style="margin:8px 0 8px 18px;padding:0;">' + match + '</ul>';
      })
      /* double line break → paragraph break */
      .replace(/\n{2,}/g, '</p><p>')
      /* single line break → <br> */
      .replace(/\n/g, '<br>')
      /* wrap in paragraph */
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      /* clean up empty paragraphs */
      .replace(/<p>\s*<\/p>/g, '');
  }

  /* ── Show answer panel ── */
  function showAnswer(html, hasWebSearch) {
    var badge = hasWebSearch
      ? '<span style="font-size:.72rem;color:var(--accent);border:1px solid rgba(0,212,255,.3);border-radius:999px;padding:2px 9px;margin-bottom:10px;display:inline-block;">🌐 Includes live web results</span><br>'
      : '';
    panel.innerHTML = badge + html;
    panel.classList.add('show');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ── Show loading state ── */
  function showLoading() {
    panel.innerHTML =
      '<span style="color:var(--accent);font-size:.9rem;">' +
      '<span class="loading-dots">Thinking</span>' +
      '</span>';
    panel.classList.add('show');

    /* animated dots */
    var dots = panel.querySelector('.loading-dots');
    var count = 0;
    return setInterval(function () {
      count = (count + 1) % 4;
      dots.textContent = 'Thinking' + '.'.repeat(count);
    }, 400);
  }

  /* ── Show error ── */
  function showError(msg) {
    panel.innerHTML = '<span style="color:rgba(255,100,100,.85);font-size:.9rem;">⚠ ' + msg + '</span>';
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question })
      });

      clearInterval(loadTimer);

      if (!res.ok) {
        var errData = await res.json().catch(function () { return {}; });
        showError(errData.error || 'Something went wrong. Please try again.');
        return;
      }

      var data = await res.json();
      if (data.error) {
        showError(data.error);
        return;
      }

      showAnswer(mdToHtml(data.answer), data.hasWebSearch);

    } catch (err) {
      clearInterval(loadTimer);
      showError('Could not reach the AI advisor. Check your connection and try again.');
    }
  });

}());
