// OnePoint Smart Home — Instant Lighting Guide calculator
// Lumen method: fixtures = (lux x area_m2) / (lumens_per_fixture x utilization_factor x maintenance_factor)
// Lux levels are general residential benchmarks (IS 3646 direction + standard
// residential lighting practice). CCT: warm 2700-3000K for relax/sleep spaces,
// neutral/cool 3500-4500K for task-heavy spaces (kitchen counters, study, grooming).
// These are indicative defaults for light-coloured walls/ceiling — the full design
// service verifies against the actual floor plan, finishes and daylight.

(function () {
  const ROOM_DATA = {
    living:   { label: 'Living room',        lux: 150, cct: '2700-3000K (warm white)',     dim: true,  note: 'Layer with accent/cove lighting for evenings; dimming recommended.' },
    bedroom:  { label: 'Bedroom',             lux: 100, cct: '2700K (warm white)',          dim: true,  note: 'Add a dedicated reading light (~300 lux) near the bed head.' },
    kids:     { label: 'Kids room',           lux: 200, cct: '3000-4000K (warm-neutral)',   dim: true,  note: 'Brighter for study/play; dimming helps for bedtime.' },
    kitchen:  { label: 'Kitchen',             lux: 300, cct: '4000K (cool white)',          dim: false, note: 'Add focused task lighting (400-500 lux) under cabinets over counters.' },
    dining:   { label: 'Dining',              lux: 150, cct: '2700-3000K (warm white)',     dim: true,  note: 'Pendant or focused light over the table; dimming sets the mood.' },
    bathroom: { label: 'Bathroom',            lux: 200, cct: '3000-4000K (neutral white)',  dim: false, note: 'Add brighter task lighting (~300 lux) at the mirror for grooming.' },
    study:    { label: 'Study / Home office', lux: 300, cct: '4000K (cool white)',          dim: false, note: 'Cooler light supports focus; position to avoid screen glare.' },
    hallway:  { label: 'Hallway / Passage',   lux: 100, cct: '3000K (warm-neutral)',        dim: false, note: 'Motion-sensor switching saves energy in passages.' },
    balcony:  { label: 'Balcony / Outdoor',   lux: 75,  cct: '3000K (warm white)',          dim: false, note: 'Use IP-rated (outdoor-safe) fixtures.' },
    pooja:    { label: 'Pooja room',          lux: 150, cct: '2700-3000K (warm white)',     dim: true,  note: 'Soft, warm and dimmable for rituals.' },
  };

  // Decorative lighting add-ons: optional per room. These don't change the
  // fixture-count maths (which covers functional/ambient lighting only) —
  // they're surfaced as extra design notes per room.
  const DECOR_DATA = {
    chandelier: { label: 'Chandelier / statement pendant', note: 'Use as a focal point over dining tables, entry foyers or living room seating; put on its own dimmer.' },
    pendant:    { label: 'Pendant lights',                 note: 'Good over kitchen islands, breakfast counters or bedside tables; hang ~30-36" above the work surface.' },
    wall:       { label: 'Wall sconces / wall lights',     note: 'Adds layered ambient light and softens shadows; wire to a separate dimmable circuit.' },
    cove:       { label: 'Cove / false-ceiling LED strip', note: 'Indirect perimeter glow for ambience; use RGBW/tunable-white strips if you want scene automation.' },
    accent:     { label: 'Accent spotlights (art / display)', note: 'Narrow-beam spots to highlight artwork, niches or display units; works well on motion or scene-based automation.' },
  };

  // General fixture quality tiers — helps customers understand what
  // changes (and what doesn't) as they move up the price ladder, without
  // pinning to specific SKUs/prices that go stale quickly. Brand names are
  // indicative examples of where each brand's mainstream range usually
  // sits, not an endorsement or live price list.
  const BRAND_TIERS = [
    {
      tier: 'Economy',
      priceLevel: '$',
      cri: 'CRI 70-80',
      efficacy: '80-95 lm/W',
      driver: 'Basic driver, limited surge protection',
      dimming: 'Often non-dimmable, or basic TRIAC only',
      warranty: '~1 year',
      examples: ['Opple (value range)', 'Arrco', 'Generic/OEM imports (common via Dubai trading suppliers)'],
      priceRange: 'AED 150-250 per downlight (supply + install, ballpark)',
      bestFor: 'Budget-driven fit-outs, stores, utility and back-of-house areas.',
    },
    {
      tier: 'Standard',
      priceLevel: '$$',
      cri: 'CRI 80+',
      efficacy: '90-110 lm/W',
      driver: 'Better-quality driver, surge-protected (~2.5kV)',
      dimming: 'TRIAC and 0-10V dimmable options available',
      warranty: '~2 years',
      examples: ['Havells', 'NVC Lighting', 'Opple (Pro range)'],
      priceRange: 'AED 250-400 per downlight (supply + install, ballpark)',
      bestFor: 'Most residential rooms — living areas, bedrooms, kitchens, dining.',
    },
    {
      tier: 'Premium',
      priceLevel: '$$$',
      cri: 'CRI 90+',
      efficacy: '100-130 lm/W',
      driver: 'High-grade driver, DALI/0-10V ready, longer-rated lifespan',
      dimming: 'DALI, 0-10V and tunable-white (adjustable CCT) options',
      warranty: '3-5 years',
      examples: ['Philips/Signify professional range', 'Osram/LEDVANCE', 'FSL (commercial range)'],
      priceRange: 'AED 400-700+ per downlight (supply + install, ballpark)',
      bestFor: 'Feature rooms, colour-critical spaces, and projects integrating with DALI/KNX smart-home systems.',
    },
  ];

  // Lighting control / automation tiers. "key" matches the value of the
  // per-room #roomControl select. Cost figures are rough, general UAE
  // market indications (not Harman-specific quotes) — meant to set
  // expectations on scale, not to be quoted directly.
  const CONTROL_TIERS = [
    {
      key: 'basic',
      tier: 'Basic switches',
      priceLevel: '$',
      description: 'Conventional wall switches and dimmers on standard wiring — manual, room-by-room control.',
      automation: 'Manual on/off only (optional plug-in or wall dimmer)',
      typicalCost: 'Included in standard electrical wiring — no separate automation budget',
      examples: ['Standard wall switches/dimmers (any electrical brand)'],
      bestFor: 'Budget fit-outs, rental units, back-of-house and utility areas.',
    },
    {
      key: 'smart',
      tier: 'Smart switches & scenes',
      priceLevel: '$$',
      description: 'Wi-Fi/Zigbee smart switches and dimmers added to existing wiring — app and voice control, schedules and basic scenes.',
      automation: 'App + voice control (Alexa/Google), schedules, simple scenes',
      typicalCost: 'Roughly AED 5,000-35,000 per apartment, depending on size and number of points',
      examples: ['Retrofit Wi-Fi/Zigbee smart switches', 'Smart plugs and dimmer modules'],
      bestFor: 'Apartments and renovations wanting app/voice control without rewiring.',
    },
    {
      key: 'full',
      tier: 'Full automation (DALI / KNX-based systems)',
      priceLevel: '$$$',
      description: 'Centrally programmed lighting (often with curtains/AC/AV) on a dedicated bus, with keypads and processors designed in from first fix.',
      automation: 'Full scene control, scheduling, integration with curtains/HVAC/AV/security',
      typicalCost: 'From ~AED 25,000 (2BR apartment) up to AED 60,000-200,000+ for a full villa',
      examples: ['Dedicated DALI/KNX control bus with branded keypads & processors', 'Centralised scene programming across lighting, curtains and AC', 'Single integrated system spanning lighting, AV and security'],
      bestFor: 'Villas and premium apartments designing automation in from the start, or a single integrated system across lighting/curtains/AV.',
    },
  ];

  const SQFT_TO_SQM = 0.0929;
  const MAINTENANCE_FACTOR = 0.8;   // LED, normal residential cleaning cycle

  // Fixture wattage/lumens scale with the room's target lux level — low-lux
  // spaces (hallways, bedrooms) typically use smaller ~7W downlights, while
  // high-lux task spaces (kitchens, study) use brighter ~15W fixtures.
  // ~90 lm/W efficacy, in line with common residential LED downlights.
  const FIXTURE_OPTIONS = [
    { maxLux: 100, watts: 7,  lumens: 650 },
    { maxLux: 150, watts: 9,  lumens: 800 },
    { maxLux: 200, watts: 12, lumens: 1100 },
    { maxLux: Infinity, watts: 15, lumens: 1400 },
  ];

  function fixtureFor(lux) {
    return FIXTURE_OPTIONS.find(function (o) { return lux <= o.maxLux; });
  }

  // Utilization factor drops as ceiling height increases (room cavity grows,
  // less of the emitted light reaches the working plane).
  function utilizationFactor(ceilingFt) {
    if (ceilingFt <= 9) return 0.6;
    if (ceilingFt === 10) return 0.55;
    if (ceilingFt === 11) return 0.5;
    return 0.45; // 12ft+ / double height
  }

  const rooms = [];
  let resultsShown = false;

  const roomTypeEl = document.getElementById('roomType');
  const roomAreaEl = document.getElementById('roomArea');
  const ceilingEl = document.getElementById('ceiling');
  const addBtn = document.getElementById('addRoom');
  const showResultsBtn = document.getElementById('showResults');
  const roomListEl = document.getElementById('roomList');
  const resultsEl = document.getElementById('results');
  const decorChecks = document.querySelectorAll('.decorCheck');
  const roomMoodEl = document.getElementById('roomMood');
  const roomControlEl = document.getElementById('roomControl');

  // Local/offline fallback for mood-based suggestions, used when the
  // /api/mood AI proxy isn't available (not deployed yet, or page opened
  // via file://). Keyword groups map free-text mood descriptions to a
  // couple of short, practical lighting/automation tips each.
  const MOOD_KEYWORDS = [
    { keys: ['cozy', 'cosy', 'romantic', 'intimate', 'date'],
      suggestions: [
        'Use warm 2700K light and keep the main fixtures on a dimmer set low in the evening.',
        'Add a small accent or pendant light for a softer, more intimate glow than overhead lighting alone.',
      ] },
    { keys: ['bright', 'energetic', 'active', 'morning', 'workout', 'exercise'],
      suggestions: [
        'Add a "daylight" scene at 4000-5000K and full brightness for an energising start to the day.',
        'A smart switch/scene button lets you jump straight to full brightness without dimming up gradually.',
      ] },
    { keys: ['relax', 'calm', 'soothing', 'peaceful', 'sleep', 'night'],
      suggestions: [
        'Set a warm, low-brightness "night" scene (around 10-20%) for winding down before bed.',
        'Avoid cool white light in the evening — stick to 2700K to support a relaxed mood.',
      ] },
    { keys: ['focus', 'productive', 'work', 'study', 'concentration', 'office'],
      suggestions: [
        'Use cooler 4000K light at full brightness during work hours to support focus and alertness.',
        'Position task lighting (desk lamp) to avoid glare and shadows on your work surface.',
      ] },
    { keys: ['festive', 'party', 'celebration', 'guest'],
      suggestions: [
        'Add a colour-changing accent or strip light for a festive scene that can switch with the occasion.',
        'Set up a "party" scene that brightens accent lighting while dimming the main downlights slightly.',
      ] },
    { keys: ['minimal', 'minimalist', 'modern', 'clean', 'simple'],
      suggestions: [
        'Keep fixtures recessed and uniform — avoid mixing too many CCTs for a clean, minimal look.',
        'A single dimmer scene (bright/medium/low) keeps the room flexible without visual clutter.',
      ] },
    { keys: ['luxury', 'elegant', 'premium', 'rich', 'opulent'],
      suggestions: [
        'Layer cove/indirect lighting with the main downlights for a richer, higher-end look.',
        'A statement chandelier or pendant on its own dimmer adds a premium focal point.',
      ] },
    { keys: ['dramatic', 'moody', 'cinematic', 'dark', 'theatre', 'theater', 'movie'],
      suggestions: [
        'Use accent spotlights on a separate circuit so the main lights can be dimmed very low or off.',
        'Consider a tunable-white or RGBW strip for a cinematic colour wash behind the TV/screen.',
      ] },
  ];

  // Colour-temperature-specific phrases ("warm white", "cool white",
  // plain "white light", etc.). Checked first-match-wins (in this order)
  // so a phrase like "warm white light" only matches the warm-white
  // group, not also the generic "white light" one.
  const CCT_KEYWORDS = [
    { keys: ['warm white', 'warm light', 'warm glow', 'yellow light', 'yellowish light', 'golden light'],
      suggestions: [
        'For a warm-white feel, use 2700-3000K fixtures throughout this room.',
        'Pair warm white with a dimmer so the room can flex from functional brightness to a soft evening glow.',
      ] },
    { keys: ['cool white', 'daylight white', 'daylight', 'bright white', 'crisp white', 'blue-white', 'cold light'],
      suggestions: [
        'For a cool/daylight-white feel, use 4000-5000K fixtures — this reads brighter and more energising.',
        'Keep all fixtures in this room the same cool CCT; mixing warm and cool tones in one space looks patchy.',
      ] },
    { keys: ['white light', 'white lighting', 'just white', 'plain white', 'neutral white'],
      suggestions: [
        '"White light" usually means neutral white — use 3500-4000K fixtures as a balanced middle ground.',
        'If you want a more specific feel, try "warm white" (2700K, cozy) or "cool/daylight white" (5000K, energising) instead.',
      ] },
  ];

  function localMoodSuggestions(moodText, roomType) {
    const text = (moodText || '').toLowerCase();
    let matched = [];

    const cctGroup = CCT_KEYWORDS.find(function (group) {
      return group.keys.some(function (k) { return text.indexOf(k) !== -1; });
    });
    if (cctGroup) matched = matched.concat(cctGroup.suggestions);

    MOOD_KEYWORDS.forEach(function (group) {
      if (group.keys.some(function (k) { return text.indexOf(k) !== -1; })) {
        matched = matched.concat(group.suggestions);
      }
    });
    if (matched.length === 0) {
      matched = [
        'Add a dimmer or smart scene so this room can shift between bright daily use and a softer evening feel.',
        'Layer in a warm accent light (lamp, strip or wall light) for extra depth beyond the main ceiling fixtures.',
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

  function renderRoomList() {
    roomListEl.innerHTML = '';
    rooms.forEach((room, i) => {
      const item = document.createElement('div');
      item.className = 'room-item';
      const decorTags = room.decor.length
        ? '<small class="decor-tags">+ ' + room.decor.map(function (k) { return DECOR_DATA[k].label; }).join(', ') + '</small>'
        : '';
      item.innerHTML =
        '<span>' + ROOM_DATA[room.type].label + ' — ' + room.area + ' sq ft, ' + room.ceiling + ' ft ceiling' + decorTags + '</span>' +
        '<button type="button" class="room-remove" data-i="' + i + '" aria-label="Remove room">&times;</button>';
      roomListEl.appendChild(item);
    });
    roomListEl.querySelectorAll('.room-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        rooms.splice(Number(btn.dataset.i), 1);
        renderRoomList();
        // Keep results in sync once they've been shown at least once.
        if (resultsShown) renderResults();
      });
    });
  }

  function renderResults() {
    if (rooms.length === 0) {
      resultsEl.innerHTML = '<p class="disclaimer">Add a room on the left, then click "Show results".</p>';
      return;
    }

    let totalFixtures = 0;
    let totalWatts = 0;

    const cards = rooms.map(function (room, i) {
      const r = calcRoom(room);
      totalFixtures += r.fixtures;
      totalWatts += r.wattage;
      const decorBlock = room.decor.length
        ? '<div class="decor-block">' +
            '<h4>Decorative lighting</h4>' +
            '<ul>' + room.decor.map(function (k) {
              const d = DECOR_DATA[k];
              return '<li><b>' + d.label + ':</b> ' + d.note + '</li>';
            }).join('') + '</ul>' +
          '</div>'
        : '';
      const moodBlock = room.mood ? renderMoodBlock(room, i) : '';
      const controlTier = CONTROL_TIERS.find(function (t) { return t.key === (room.control || 'basic'); }) || CONTROL_TIERS[0];
      return '' +
        '<div class="card">' +
          '<h3>' + r.data.label + ' <small>(' + room.area + ' sq ft)</small></h3>' +
          '<p><b>Recommended light level:</b> ' + r.lux + ' lux</p>' +
          '<p><b>Approx. fixtures needed:</b> ' + r.fixtures + ' x ~' + r.fixtureWatts + 'W LED downlights (~' + r.wattage + 'W total)</p>' +
          '<p><b>Colour temperature:</b> ' + r.data.cct + '</p>' +
          '<p><b>Dimming:</b> ' + (r.data.dim ? 'Recommended' : 'Optional') + '</p>' +
          '<p><b>Lighting control:</b> ' + controlTier.tier + ' — ' + controlTier.automation + '</p>' +
          '<p class="disclaimer">' + r.data.note + '</p>' +
          decorBlock +
          moodBlock +
        '</div>';
    }).join('');

    const totalCard = rooms.length > 1
      ? '<div class="card">' +
          '<h3>Whole-home summary</h3>' +
          '<p><b>Total rooms:</b> ' + rooms.length + '</p>' +
          '<p><b>Total fixtures (approx.):</b> ' + totalFixtures + '</p>' +
          '<p><b>Total lighting load (approx.):</b> ' + totalWatts + 'W</p>' +
        '</div>'
      : '';

    resultsEl.innerHTML = cards + totalCard + renderBrandTierBlock() + renderControlTierBlock();

    // Kick off (or re-trigger) AI mood lookups for any room that has a
    // mood description but no cached result yet.
    rooms.forEach(function (room, i) {
      if (room.mood && !room.moodResult && !room.moodLoading) {
        fetchMoodSuggestions(room, i);
      }
    });
  }

  // Renders the shared "Fixture brand & quality tiers" comparison card shown
  // once after the per-room results. General positioning guide (not live
  // pricing) so customers know what changes as they move up the budget —
  // CRI, efficacy, driver quality, dimming support and warranty.
  function renderBrandTierBlock() {
    const rows = [
      { label: 'Typical CRI', key: 'cri' },
      { label: 'Efficacy', key: 'efficacy' },
      { label: 'Driver quality', key: 'driver' },
      { label: 'Dimming support', key: 'dimming' },
      { label: 'Typical warranty', key: 'warranty' },
      { label: 'Indicative cost (installed)', key: 'priceRange' },
      { label: 'Example brands', key: 'examples' },
      { label: 'Best for', key: 'bestFor' },
    ];

    const headerCells = BRAND_TIERS.map(function (t) {
      return '<th>' + t.tier + ' <span class="price-level">' + t.priceLevel + '</span></th>';
    }).join('');

    const bodyRows = rows.map(function (row) {
      const cells = BRAND_TIERS.map(function (t) {
        const val = t[row.key];
        const content = Array.isArray(val) ? val.join(', ') : val;
        return '<td>' + content + '</td>';
      }).join('');
      return '<tr><th scope="row">' + row.label + '</th>' + cells + '</tr>';
    }).join('');

    return '' +
      '<div class="card brand-tier-card">' +
        '<h3>Fixture brand &amp; quality tiers</h3>' +
        '<p class="disclaimer">A general guide to what changes as you move up the price ladder. Brand names are examples of where each maker\'s mainstream range usually sits in the UAE market, not a live price list — confirm exact specs, pricing and current stock with UAE distributors before ordering. Cost figures are ballpark per-fixture estimates for budgeting only, not a quote.</p>' +
        '<div class="brand-tier-table">' +
          '<table>' +
            '<thead><tr><th scope="col"></th>' + headerCells + '</tr></thead>' +
            '<tbody>' + bodyRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  // Renders the shared "Lighting control & automation" comparison card,
  // shown once after the brand/quality tier card. Same table pattern as
  // renderBrandTierBlock(), driven by CONTROL_TIERS.
  function renderControlTierBlock() {
    const rows = [
      { label: 'What it gives you', key: 'description' },
      { label: 'Automation level', key: 'automation' },
      { label: 'Typical cost', key: 'typicalCost' },
      { label: 'Example brands/products', key: 'examples' },
      { label: 'Best for', key: 'bestFor' },
    ];

    const headerCells = CONTROL_TIERS.map(function (t) {
      return '<th>' + t.tier + ' <span class="price-level">' + t.priceLevel + '</span></th>';
    }).join('');

    const bodyRows = rows.map(function (row) {
      const cells = CONTROL_TIERS.map(function (t) {
        const val = t[row.key];
        const content = Array.isArray(val) ? val.join(', ') : val;
        return '<td>' + content + '</td>';
      }).join('');
      return '<tr><th scope="row">' + row.label + '</th>' + cells + '</tr>';
    }).join('');

    return '' +
      '<div class="card brand-tier-card control-tier-card">' +
        '<h3>Lighting control &amp; automation options</h3>' +
        '<p class="disclaimer">Each room above is shown with its selected control level. This table compares the options if you want to mix tiers room-by-room, or upgrade later. Cost figures are rough, general estimates for budgeting — Harman will provide a firm quote based on your actual scope.</p>' +
        '<div class="brand-tier-table">' +
          '<table>' +
            '<thead><tr><th scope="col"></th>' + headerCells + '</tr></thead>' +
            '<tbody>' + bodyRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  // Renders the "Mood-based suggestions" block for a room's result card.
  // Shows cached suggestions if we have them, otherwise a loading placeholder
  // while fetchMoodSuggestions() resolves (AI or local fallback).
  function renderMoodBlock(room, i) {
    if (room.moodResult) {
      return '<div class="mood-block">' +
          '<h4>Mood-based suggestions</h4>' +
          '<ul>' + room.moodResult.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>' +
        '</div>';
    }
    return '<div class="mood-block loading" id="mood-' + i + '">Thinking about your mood &hellip;</div>';
  }

  // Tries the AI-powered /api/mood endpoint (Vercel serverless function);
  // falls back to the local keyword-based suggestions if the endpoint is
  // unavailable (not deployed yet, offline, or page opened via file://).
  function fetchMoodSuggestions(room, i) {
    room.moodLoading = true;

    if (typeof fetch !== 'function') {
      room.moodResult = localMoodSuggestions(room.mood, room.type);
      room.moodLoading = false;
      setTimeout(renderResults, 0);
      return;
    }

    const data = ROOM_DATA[room.type];
    const payload = {
      roomType: room.type,
      roomLabel: data.label,
      area: room.area,
      ceiling: room.ceiling,
      lux: data.lux,
      cct: data.cct,
      mood: room.mood,
    };

    fetch('/api/mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('mood API error');
        return res.json();
      })
      .then(function (json) {
        room.moodResult = (json && Array.isArray(json.suggestions) && json.suggestions.length)
          ? json.suggestions
          : localMoodSuggestions(room.mood, room.type);
        room.moodLoading = false;
        renderResults();
      })
      .catch(function () {
        room.moodResult = localMoodSuggestions(room.mood, room.type);
        room.moodLoading = false;
        renderResults();
      });
  }

  function flagAreaError() {
    roomAreaEl.focus();
    roomAreaEl.style.borderColor = '#e04848';
    setTimeout(function () { roomAreaEl.style.borderColor = ''; }, 1200);
  }

  // Reads the current form fields and pushes a room onto `rooms`.
  // Returns true if a room was added, false if the area is invalid
  // (and flags the field). Does nothing (returns true) if the area
  // field is simply empty, so callers can treat "nothing typed" as OK.
  function addCurrentRoomFromForm() {
    if (!roomAreaEl.value) return true;

    const type = roomTypeEl.value;
    const area = parseFloat(roomAreaEl.value);
    const ceiling = parseInt(ceilingEl.value, 10);

    if (!area || area < 15 || area > 2000) {
      flagAreaError();
      return false;
    }

    const decor = Array.prototype.filter.call(decorChecks, function (c) { return c.checked; })
      .map(function (c) { return c.value; });

    const mood = roomMoodEl ? roomMoodEl.value.trim() : '';
    const control = roomControlEl ? roomControlEl.value : 'basic';

    rooms.push({ type: type, area: area, ceiling: ceiling, decor: decor, mood: mood, moodResult: null, moodLoading: false, control: control });
    roomAreaEl.value = '';
    roomAreaEl.focus();
    Array.prototype.forEach.call(decorChecks, function (c) { c.checked = false; });
    if (roomMoodEl) roomMoodEl.value = '';
    renderRoomList();
    return true;
  }

  addBtn.addEventListener('click', function () {
    if (!roomAreaEl.value) {
      // "+ Add room" with nothing typed is the one case that should
      // still show the validation error (matches old behaviour).
      flagAreaError();
      return;
    }
    if (addCurrentRoomFromForm() && resultsShown) renderResults();
  });

  showResultsBtn.addEventListener('click', function () {
    // Let "Show results" work even if the user typed an area but never
    // clicked "+ Add room" — add it for them first.
    if (!addCurrentRoomFromForm()) return;

    if (rooms.length === 0) {
      flagAreaError();
      return;
    }

    resultsShown = true;
    renderResults();
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  renderRoomList();
  renderResults();
})();
