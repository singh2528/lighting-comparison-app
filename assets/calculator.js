// OnePoint Smart Home — Instant Lighting Guide calculator
// Lumen method: fixtures = (lux x area_m2) / (lumens_per_fixture x utilization_factor x maintenance_factor)

(function () {
  const ROOM_DATA = {
    living:   { label: 'Living room',        lux: 150, cct: '2700-3000K (warm white)',     dim: true,  note: 'Layer with accent/cove lighting for evenings; dimming recommended.' },
    bedroom:  { label: 'Bedroom',            lux: 100, cct: '2700K (warm white)',           dim: true,  note: 'Add a dedicated reading light (~300 lux) near the bed head.' },
    kids:     { label: 'Kids room',          lux: 200, cct: '3000-4000K (warm-neutral)',    dim: true,  note: 'Brighter for study/play; dimming helps for bedtime.' },
    kitchen:  { label: 'Kitchen',            lux: 300, cct: '4000K (cool white)',           dim: false, note: 'Add focused task lighting (400-500 lux) under cabinets over counters.' },
    dining:   { label: 'Dining',             lux: 150, cct: '2700-3000K (warm white)',      dim: true,  note: 'Pendant or focused light over the table; dimming sets the mood.' },
    bathroom: { label: 'Bathroom',           lux: 200, cct: '3000-4000K (neutral white)',   dim: false, note: 'Add brighter task lighting (~300 lux) at the mirror for grooming.' },
    study:    { label: 'Study / Home office',lux: 300, cct: '4000K (cool white)',           dim: false, note: 'Cooler light supports focus; position to avoid screen glare.' },
    hallway:  { label: 'Hallway / Passage',  lux: 100, cct: '3000K (warm-neutral)',         dim: false, note: 'Motion-sensor switching saves energy in passages.' },
    balcony:  { label: 'Balcony / Outdoor',  lux: 75,  cct: '3000K (warm white)',           dim: false, note: 'Use IP-rated (outdoor-safe) fixtures.' },
    pooja:    { label: 'Pooja room',         lux: 150, cct: '2700-3000K (warm white)',      dim: true,  note: 'Soft, warm and dimmable for rituals.' },
  };

  const DECOR_DATA = {
    chandelier: { label: 'Chandelier / statement pendant', note: 'Use as a focal point; put on its own dimmer.' },
    pendant:    { label: 'Pendant lights',                 note: 'Good over kitchen islands or bedside tables; hang 30-36" above work surface.' },
    wall:       { label: 'Wall sconces / wall lights',     note: 'Adds layered ambient light and softens shadows; wire to a separate dimmable circuit.' },
    cove:       { label: 'Cove / false-ceiling LED strip', note: 'Indirect perimeter glow; use RGBW/tunable-white strips for scene automation.' },
    accent:     { label: 'Accent spotlights (art / display)', note: 'Narrow-beam spots; works well on motion or scene-based automation.' },
  };

  const BRAND_TIERS = [
    {
      tier: 'Economy', priceLevel: '$',
      cri: 'CRI 70–80', efficacy: '80–95 lm/W',
      driver: 'Basic driver, limited surge protection',
      dimming: 'Often non-dimmable, or basic TRIAC only',
      warranty: '~1 year',
      examples: ['Opple (value range)', 'Arrco', 'Generic/OEM imports'],
      priceRange: 'AED 150–250 / downlight installed',
      bestFor: 'Budget fit-outs, utility and back-of-house areas.',
    },
    {
      tier: 'Standard', priceLevel: '$$',
      cri: 'CRI 80+', efficacy: '90–110 lm/W',
      driver: 'Better driver, surge-protected (~2.5kV)',
      dimming: 'TRIAC and 0–10V dimmable options',
      warranty: '~2 years',
      examples: ['Havells', 'NVC Lighting', 'Opple (Pro range)'],
      priceRange: 'AED 250–400 / downlight installed',
      bestFor: 'Most residential rooms — living, bedrooms, kitchens.',
    },
    {
      tier: 'Premium', priceLevel: '$$$',
      cri: 'CRI 90+', efficacy: '100–130 lm/W',
      driver: 'High-grade driver, DALI/0–10V ready',
      dimming: 'DALI, 0–10V and tunable-white options',
      warranty: '3–5 years',
      examples: ['Philips/Signify professional', 'OSRAM/LEDVANCE', 'ERCO'],
      priceRange: 'AED 400–700+ / downlight installed',
      bestFor: 'Feature rooms, colour-critical spaces, DALI/KNX projects.',
    },
  ];

  const CONTROL_TIERS = [
    {
      key: 'basic', tier: 'Basic switches', priceLevel: '$',
      description: 'Conventional wall switches and dimmers — manual, room-by-room control.',
      automation: 'Manual on/off only (optional plug-in or wall dimmer)',
      typicalCost: 'Included in standard electrical wiring',
      examples: ['Standard wall switches/dimmers (any electrical brand)'],
      bestFor: 'Budget fit-outs, rental units, back-of-house areas.',
    },
    {
      key: 'smart', tier: 'Smart switches & scenes', priceLevel: '$$',
      description: 'Wi-Fi/Zigbee smart switches on existing wiring — app, voice control, schedules and scenes.',
      automation: 'App + voice (Alexa/Google), schedules, simple cross-room scenes',
      typicalCost: 'AED 5,000–35,000 per apartment depending on size',
      examples: ['Retrofit Wi-Fi/Zigbee smart switches', 'Smart plugs and dimmer modules'],
      bestFor: 'Apartments and renovations wanting app/voice without rewiring.',
    },
    {
      key: 'full', tier: 'Full automation (DALI/KNX)', priceLevel: '$$$',
      description: 'Dedicated bus system programmed centrally — full scene integration with curtains, AC and AV.',
      automation: 'Full scene control, scheduling, whole-building integration',
      typicalCost: 'AED 25,000 (2BR apt) to AED 60,000–200,000+ (full villa)',
      examples: ['DALI/KNX bus with keypads & processors', 'Lutron, Dynalite, Control4'],
      bestFor: 'Villas and premium apartments designing automation from first fix.',
    },
  ];

  const SQFT_TO_SQM = 0.0929;
  const MAINTENANCE_FACTOR = 0.8;

  const FIXTURE_OPTIONS = [
    { maxLux: 100, watts: 7,  lumens: 650 },
    { maxLux: 150, watts: 9,  lumens: 800 },
    { maxLux: 200, watts: 12, lumens: 1100 },
    { maxLux: Infinity, watts: 15, lumens: 1400 },
  ];

  function fixtureFor(lux) {
    return FIXTURE_OPTIONS.find(function (o) { return lux <= o.maxLux; });
  }

  function utilizationFactor(ceilingFt) {
    if (ceilingFt <= 9)  return 0.6;
    if (ceilingFt === 10) return 0.55;
    if (ceilingFt === 11) return 0.5;
    return 0.45;
  }

  const MOOD_KEYWORDS = [
    { keys: ['cozy', 'cosy', 'romantic', 'intimate', 'date'],
      suggestions: ['Use warm 2700K light and keep the main fixtures on a dimmer set low in the evening.', 'Add a small accent or pendant light for a softer, more intimate glow.'] },
    { keys: ['bright', 'energetic', 'active', 'morning', 'workout', 'exercise'],
      suggestions: ['Add a "daylight" scene at 4000-5000K and full brightness for an energising start.', 'A smart switch lets you jump straight to full brightness without dimming up gradually.'] },
    { keys: ['relax', 'calm', 'soothing', 'peaceful', 'sleep', 'night'],
      suggestions: ['Set a warm, low-brightness "night" scene (~10-20%) for winding down.', 'Avoid cool white light in the evening — stick to 2700K to support a relaxed mood.'] },
    { keys: ['focus', 'productive', 'work', 'study', 'concentration', 'office'],
      suggestions: ['Use cooler 4000K light at full brightness during work hours.', 'Position task lighting to avoid glare and shadows on your work surface.'] },
    { keys: ['festive', 'party', 'celebration', 'guest'],
      suggestions: ['Add a colour-changing accent for a festive scene.', 'Set up a "party" scene that brightens accent lighting while dimming the main downlights.'] },
    { keys: ['minimal', 'minimalist', 'modern', 'clean', 'simple'],
      suggestions: ['Keep fixtures recessed and uniform — avoid mixing CCTs.', 'A single dimmer scene (bright/medium/low) keeps the room flexible without clutter.'] },
    { keys: ['luxury', 'elegant', 'premium', 'rich', 'opulent'],
      suggestions: ['Layer cove/indirect lighting with the main downlights for a richer look.', 'A statement chandelier or pendant on its own dimmer adds a premium focal point.'] },
    { keys: ['dramatic', 'moody', 'cinematic', 'dark', 'theatre', 'theater', 'movie'],
      suggestions: ['Use accent spotlights on a separate circuit so the main lights can dim very low.', 'Consider a tunable-white or RGBW strip for a cinematic colour wash behind the TV.'] },
  ];

  const CCT_KEYWORDS = [
    { keys: ['warm white', 'warm light', 'warm glow', 'yellow light', 'golden light'],
      suggestions: ['Use 2700-3000K fixtures throughout this room.', 'Pair warm white with a dimmer for a soft evening glow.'] },
    { keys: ['cool white', 'daylight white', 'daylight', 'bright white', 'crisp white'],
      suggestions: ['Use 4000-5000K fixtures — reads brighter and more energising.', 'Keep all fixtures the same cool CCT; mixing warm and cool looks patchy.'] },
    { keys: ['white light', 'white lighting', 'neutral white'],
      suggestions: ['"Neutral white" — use 3500-4000K as a balanced middle ground.', 'Try "warm white" (2700K, cozy) or "cool/daylight" (5000K, energising) for a specific feel.'] },
  ];

  function localMoodSuggestions(moodText) {
    const text = (moodText || '').toLowerCase();
    let matched = [];
    const cctGroup = CCT_KEYWORDS.find(function (g) { return g.keys.some(function (k) { return text.indexOf(k) !== -1; }); });
    if (cctGroup) matched = matched.concat(cctGroup.suggestions);
    MOOD_KEYWORDS.forEach(function (g) {
      if (g.keys.some(function (k) { return text.indexOf(k) !== -1; })) matched = matched.concat(g.suggestions);
    });
    if (matched.length === 0) {
      matched = [
        'Add a dimmer so this room can shift between bright daily use and a softer evening feel.',
        'Layer in a warm accent light for extra depth beyond the main ceiling fixtures.',
      ];
    }
    return matched.slice(0, 4);
  }

  function calcRoom(room) {
    const data = ROOM_DATA[room.type];
    const areaM2 = room.area * SQFT_TO_SQM;
    const uf = utilizationFactor(room.ceiling);
    const requiredLumens = data.lux * areaM2;
    const fixture = fixtureFor(data.lux);
    const fixtures = Math.max(1, Math.ceil(requiredLumens / (fixture.lumens * uf * MAINTENANCE_FACTOR)));
    const wattage = fixtures * fixture.watts;
    return { data, areaM2, fixtures, wattage, lux: data.lux, fixtureWatts: fixture.watts };
  }

  const rooms = [];
  let resultsShown = false;

  const roomTypeEl     = document.getElementById('roomType');
  const roomAreaEl     = document.getElementById('roomArea');
  const ceilingEl      = document.getElementById('ceiling');
  const addBtn         = document.getElementById('addRoom');
  const showResultsBtn = document.getElementById('showResults');
  const roomListEl     = document.getElementById('roomList');
  const resultsEl      = document.getElementById('results');
  const decorChecks    = document.querySelectorAll('.decorCheck');
  const roomMoodEl     = document.getElementById('roomMood');
  const roomControlEl  = document.getElementById('roomControl');

  function renderRoomList() {
    roomListEl.innerHTML = '';
    rooms.forEach((room, i) => {
      const item = document.createElement('div');
      item.className = 'room-item';
      const decorTags = room.decor.length
        ? '<small class="decor-tags">+ ' + room.decor.map(function (k) { return DECOR_DATA[k].label; }).join(', ') + '</small>'
        : '';
      item.innerHTML =
        '<span>' + ROOM_DATA[room.type].label + ' — ' + room.area + ' sq ft, ' + room.ceiling + ' ft' + decorTags + '</span>' +
        '<button type="button" class="room-remove" data-i="' + i + '" aria-label="Remove room">&times;</button>';
      roomListEl.appendChild(item);
    });
    roomListEl.querySelectorAll('.room-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        rooms.splice(Number(btn.dataset.i), 1);
        renderRoomList();
        if (resultsShown) renderResults();
      });
    });
  }

  /* ── Helpers for premium result rendering ── */

  function cctPct(cctStr) {
    var m = cctStr.match(/(\d{4})/);
    if (!m) return 30;
    return Math.min(100, Math.max(0, Math.round((parseInt(m[1]) - 2700) / 3800 * 100)));
  }

  function renderFixtureDots(count) {
    var show = Math.min(count, 10);
    var html = '';
    for (var i = 0; i < show; i++) html += '<span class="res-dot"></span>';
    if (count > 10) html += '<span class="res-dot-extra">+' + (count - 10) + ' more</span>';
    return html;
  }

  function renderMoodBlock(room, i) {
    if (room.moodResult) {
      return '<div class="mood-block">' +
        '<h4>Mood suggestions</h4>' +
        '<ul>' + room.moodResult.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
        '</div>';
    }
    return '<div class="mood-block loading" id="mood-' + i + '">Thinking about your mood…</div>';
  }

  function renderRoomCard(room, r, i) {
    var cctPos = cctPct(r.data.cct);
    var controlTier = CONTROL_TIERS.find(function (t) { return t.key === (room.control || 'basic'); }) || CONTROL_TIERS[0];

    var decorHtml = room.decor.length
      ? '<div class="res-decor">' +
          room.decor.map(function (k) {
            var d = DECOR_DATA[k];
            return '<div class="res-decor-item"><strong>' + d.label + '</strong><span>' + d.note + '</span></div>';
          }).join('') +
        '</div>'
      : '';

    return '' +
      '<div class="res-card">' +
        '<div class="res-card-header">' +
          '<div class="res-room-name">' + r.data.label + '<small>' + room.area + ' sq ft · ' + room.ceiling + ' ft ceiling</small></div>' +
          '<div class="res-lux-badge">' + r.lux + ' lux</div>' +
        '</div>' +

        '<div class="res-cct-section">' +
          '<div class="res-cct-track"><div class="res-cct-needle" style="left:' + cctPos + '%"></div></div>' +
          '<div class="res-cct-labels"><span>Warm 2700K</span><span>Neutral 4000K</span><span>Cool 6500K</span></div>' +
          '<div class="res-cct-value">→ ' + r.data.cct + (r.data.dim ? ' · Dimmable recommended' : '') + '</div>' +
        '</div>' +

        '<div class="res-fixtures-section">' +
          '<div class="res-fixture-dots">' + renderFixtureDots(r.fixtures) + '</div>' +
          '<div class="res-fixture-text"><strong>' + r.fixtures + ' × ' + r.fixtureWatts + 'W</strong> LED downlights &middot; ~' + r.wattage + 'W total' +
            (r.data.dim ? ' &middot; <span class="res-dim-tag">Dimmable</span>' : '') + '</div>' +
        '</div>' +

        '<div class="res-details">' +
          '<div class="res-detail-row"><span class="res-detail-label">Control</span><span>' + controlTier.tier + '</span></div>' +
          '<div class="res-detail-row"><span class="res-detail-label">Note</span><span class="res-note-text">' + r.data.note + '</span></div>' +
        '</div>' +

        decorHtml +
        (room.mood ? renderMoodBlock(room, i) : '') +
      '</div>';
  }

  function renderSummaryCard(roomCount, totalFixtures, totalWatts) {
    var estMonthly = Math.round(totalWatts * 8 * 30 / 1000 * 0.38);
    return '' +
      '<div class="res-summary-card">' +
        '<div class="res-summary-title">Whole-home summary</div>' +
        '<div class="res-summary-stats">' +
          '<div class="res-stat"><div class="res-stat-num">' + roomCount + '</div><div class="res-stat-label">Rooms</div></div>' +
          '<div class="res-stat"><div class="res-stat-num">' + totalFixtures + '</div><div class="res-stat-label">Fixtures</div></div>' +
          '<div class="res-stat"><div class="res-stat-num">' + totalWatts + 'W</div><div class="res-stat-label">Total load</div></div>' +
          '<div class="res-stat"><div class="res-stat-num">~' + estMonthly + ' AED</div><div class="res-stat-label">Est. energy/mo*</div></div>' +
        '</div>' +
        '<p style="font-size:.65rem;color:rgba(180,208,245,.28);margin:12px 0 0;">*8 hrs/day at AED 0.38/kWh. Actual varies by usage.</p>' +
      '</div>';
  }

  function renderBrandTierBlock() {
    var cards = BRAND_TIERS.map(function (t, i) {
      var mid = i === 1 ? ' res-brand-mid' : '';
      return '<div class="res-brand-card' + mid + '">' +
        '<div class="res-brand-tier">' + t.tier + '<span class="res-price-level">' + t.priceLevel + '</span></div>' +
        '<div class="res-brand-price">' + t.priceRange + '</div>' +
        '<div class="res-brand-specs">' +
          '<div class="res-brand-spec"><span class="res-spec-label">CRI</span><span>' + t.cri + '</span></div>' +
          '<div class="res-brand-spec"><span class="res-spec-label">Efficacy</span><span>' + t.efficacy + '</span></div>' +
          '<div class="res-brand-spec"><span class="res-spec-label">Dimming</span><span>' + t.dimming + '</span></div>' +
          '<div class="res-brand-spec"><span class="res-spec-label">Warranty</span><span>' + t.warranty + '</span></div>' +
        '</div>' +
        '<div class="res-brand-brands">e.g. ' + (Array.isArray(t.examples) ? t.examples.join(', ') : t.examples) + '</div>' +
        '<div class="res-brand-best"><span class="res-spec-label">Best for</span> ' + t.bestFor + '</div>' +
        '</div>';
    }).join('');

    return '<div class="res-card res-tier-section">' +
      '<div class="res-tier-head"><div class="res-section-title">Fixture quality tiers</div>' +
        '<p class="disclaimer" style="margin:4px 0 0;">Brand names are examples; prices are ballpark supply+install.</p></div>' +
      '<div class="res-brand-cards">' + cards + '</div>' +
      '</div>';
  }

  function renderControlTierBlock() {
    var cards = CONTROL_TIERS.map(function (t, i) {
      var mid = i === 1 ? ' res-control-mid' : '';
      return '<div class="res-control-card' + mid + '">' +
        '<div class="res-control-tier">' + t.tier + '<span class="res-price-level">' + t.priceLevel + '</span></div>' +
        '<div class="res-control-cost">' + t.typicalCost + '</div>' +
        '<div class="res-control-desc">' + t.description + '</div>' +
        '<div class="res-control-best"><span class="res-spec-label">Best for: </span>' + t.bestFor + '</div>' +
        '</div>';
    }).join('');

    return '<div class="res-card res-tier-section">' +
      '<div class="res-tier-head"><div class="res-section-title">Lighting control options</div>' +
        '<p class="disclaimer" style="margin:4px 0 0;">General UAE estimates for budgeting only, not a firm quote.</p></div>' +
      '<div class="res-control-cards">' + cards + '</div>' +
      '</div>';
  }

  function renderResults() {
    if (rooms.length === 0) {
      resultsEl.innerHTML = '<p class="disclaimer">Add a room on the left, then click "Show results".</p>';
      return;
    }

    var totalFixtures = 0;
    var totalWatts    = 0;

    var cards = rooms.map(function (room, i) {
      var r = calcRoom(room);
      totalFixtures += r.fixtures;
      totalWatts    += r.wattage;
      return renderRoomCard(room, r, i);
    }).join('');

    var summaryCard = rooms.length > 1 ? renderSummaryCard(rooms.length, totalFixtures, totalWatts) : '';

    resultsEl.innerHTML =
      '<div class="res-animate">' +
        cards + summaryCard + renderBrandTierBlock() + renderControlTierBlock() +
      '</div>';

    rooms.forEach(function (room, i) {
      if (room.mood && !room.moodResult && !room.moodLoading) {
        fetchMoodSuggestions(room, i);
      }
    });
  }

  function fetchMoodSuggestions(room, i) {
    room.moodLoading = true;

    if (typeof fetch !== 'function') {
      room.moodResult  = localMoodSuggestions(room.mood);
      room.moodLoading = false;
      setTimeout(renderResults, 0);
      return;
    }

    const data    = ROOM_DATA[room.type];
    const payload = {
      roomType: room.type, roomLabel: data.label, area: room.area,
      ceiling: room.ceiling, lux: data.lux, cct: data.cct, mood: room.mood,
    };

    fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) { if (!res.ok) throw new Error('mood error'); return res.json(); })
      .then(function (json) {
        room.moodResult  = (json && Array.isArray(json.suggestions) && json.suggestions.length) ? json.suggestions : localMoodSuggestions(room.mood);
        room.moodLoading = false;
        renderResults();
      })
      .catch(function () {
        room.moodResult  = localMoodSuggestions(room.mood);
        room.moodLoading = false;
        renderResults();
      });
  }

  function flagAreaError() {
    roomAreaEl.focus();
    roomAreaEl.style.borderColor = '#e04848';
    setTimeout(function () { roomAreaEl.style.borderColor = ''; }, 1200);
  }

  function addCurrentRoomFromForm() {
    if (!roomAreaEl.value) return true;
    const type    = roomTypeEl.value;
    const area    = parseFloat(roomAreaEl.value);
    const ceiling = parseInt(ceilingEl.value, 10);
    if (!area || area < 15 || area > 2000) { flagAreaError(); return false; }
    const decor   = Array.prototype.filter.call(decorChecks, function (c) { return c.checked; }).map(function (c) { return c.value; });
    const mood    = roomMoodEl ? roomMoodEl.value.trim() : '';
    const control = roomControlEl ? roomControlEl.value : 'basic';
    rooms.push({ type, area, ceiling, decor, mood, moodResult: null, moodLoading: false, control });
    roomAreaEl.value = '';
    roomAreaEl.focus();
    Array.prototype.forEach.call(decorChecks, function (c) { c.checked = false; });
    if (roomMoodEl) roomMoodEl.value = '';
    renderRoomList();
    return true;
  }

  addBtn.addEventListener('click', function () {
    if (!roomAreaEl.value) { flagAreaError(); return; }
    if (addCurrentRoomFromForm() && resultsShown) renderResults();
  });

  showResultsBtn.addEventListener('click', function () {
    if (!addCurrentRoomFromForm()) return;
    if (rooms.length === 0) { flagAreaError(); return; }
    resultsShown = true;
    renderResults();
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  renderRoomList();
  renderResults();
})();
