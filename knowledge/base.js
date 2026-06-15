/* =========================================================
   OnePoint Smart Home — AI Knowledge Base
   Loaded into every /api/ask call as system-prompt context.
   Keep this file updated as pricing and specs change.
   ========================================================= */

const KNOWLEDGE_BASE = `
# OnePoint Smart Home — Knowledge Base
Platform: UAE-based smart home design, advisory, and BOQ service.
Policy: 100% brand-neutral. No brand pays for placement. Prices in AED (indicative, vary by supplier and project scope).

---

## 1. LIGHTING — FIXTURE TYPES & SPECS

### Room Lux Targets (UAE residential)
| Room              | Lux Target | Notes                              |
|-------------------|------------|------------------------------------|
| Living room       | 200–300    | Dimmable to 50 lux for evening     |
| Dining            | 250–350    | Pendant over table adds focus      |
| Master bedroom    | 100–150    | Ambient; task lighting at desk     |
| Kids bedroom      | 150–200    | Brighter for study tasks           |
| Kitchen           | 300–500    | Work surfaces need 400+            |
| Bathroom          | 150–250    | Mirror zone 300 lux minimum        |
| Study / home office | 300–400  | Reduce glare, CRI >90 preferred    |
| Corridor / lobby  | 80–150     | Motion-triggered dimming works well|
| Outdoor / entrance| 50–100     | PIR or dusk-to-dawn control        |

### Colour Temperature (CCT) Guide
- 2700 K — warm white, living/bedroom, relaxing feel
- 3000 K — soft white, most popular for UAE villas (warm but cleaner)
- 4000 K — neutral white, kitchens, bathrooms, offices
- 5000–6500 K — cool/daylight, utility, garages, some commercial

### CRI (Colour Rendering Index)
- CRI ≥ 80: acceptable for general areas
- CRI ≥ 90: recommended for kitchens, bathrooms, art areas, retail
- CRI ≥ 95: premium — fashion retail, high-end residential feature walls

### Fixture Types & Indicative Pricing (AED per fixture, supply only)
| Fixture            | Economy     | Standard    | Premium      | Typical Use              |
|--------------------|-------------|-------------|--------------|--------------------------|
| Recessed downlight | 50–120      | 120–280     | 280–700+     | Bedrooms, corridors, halls|
| Surface/oyster     | 80–180      | 180–350     | 350–600      | Low ceilings, utility    |
| Track light        | 150–300     | 300–600     | 600–1,500+   | Kitchens, accent, retail |
| Pendant            | 200–600     | 600–1,800   | 1,800–8,000+ | Dining, feature, stairwell|
| Strip light (per m)| 40–80       | 80–180      | 180–400      | Coving, under-cabinet    |
| Panel light        | 80–200      | 200–450     | 450–900      | Offices, utility         |

### Lumen Formula
Required lumens = Room area (m²) × Lux target ÷ Efficacy (lm/W)
- Economy LED: 60–75 lm/W
- Standard LED: 75–95 lm/W
- Premium LED: 100–130 lm/W

Example: 20m² living room at 250 lux with standard LED (85 lm/W) = 20 × 250 / 85 = ~59W total, roughly 6 × 10W downlights.

### Dimming
- Trailing-edge dimmer: correct for most LED drivers
- DALI: digital dimming, 0–100%, flicker-free, used in bus systems
- 0–10V: commercial drivers
- Never use leading-edge (triac) dimmers with LED without checking driver compatibility.

---

## 2. LIGHTING CONTROL — THREE TIERS

### Tier 1: Smart Switches (Basic)
- What: Wi-Fi smart switches/dimmers replace existing switches
- Wiring: None — fits existing wiring
- Scenes: Per-switch schedules only
- Voice: Often (brand-dependent)
- Best for: Rentals, finished homes, single rooms
- Price: AED 600–1,200 per point (supply + fit)
- Hub not required for basic on/off; hub needed for scenes

### Tier 2: Smart Switches + Scenes
- What: Zigbee/Wi-Fi switches linked via a hub for scenes, voice, schedules
- Wiring: None — fits existing wiring
- Scenes: Cross-device (lights + curtains + AC together)
- Voice: Yes (Alexa, Google Home, Apple HomeKit)
- Best for: Most retrofits, apartments, mid-range villas
- Price: AED 1,200–2,200 per point + hub AED 800–1,500

### Tier 3: Full Bus System (DALI/KNX)
- What: Dedicated DALI or KNX bus wired to a central processor
- Wiring: Bus cable to every point — first-fix only
- Scenes: Whole-building, fastest response, fully programmable
- Voice: Yes + wall keypads
- Best for: Villas, new builds, premium integration
- Price: AED 2,500–5,000 per point + processor + programming AED 12,000–30,000

---

## 3. AV & ENTERTAINMENT — THREE TIERS

### Tier 1: Wireless Speakers
- Price: AED 800–2,000 per zone
- Wiring: None (power only)
- Control: App + voice per speaker
- Best for: Apartments, rentals, single rooms

### Tier 2: Multi-Room Wired Audio
- Price: AED 2,500–5,000 per zone + amplifier/hub AED 3,000–8,000
- Wiring: Speaker cable to each zone (first-fix or accessible ceiling)
- Control: App, voice, keypads — synced playback
- Scenes: "Movie night" dims lights + starts audio
- Best for: Most villas (living, dining, bedrooms, outdoor)

### Tier 3: Full AV Distribution + Cinema
- Price: AED 5,000–12,000 per zone + AV rack + processor AED 15,000–40,000
- Wiring: Speaker + HDMI to every zone and rack (first-fix only)
- Control: App, voice, touch panels — whole-home routing
- Best for: Large villas, dedicated cinema rooms, premium integration

---

## 4. CLIMATE / HVAC — THREE TIERS

### Tier 1: Smart Thermostats
- Price: AED 800–1,800 per AC zone
- Wiring: None — fits existing AC wiring
- Control: App + schedules
- Best for: Apartments, single/few AC units

### Tier 2: Zoned Smart Control
- Price: AED 1,800–3,500 per zone + hub AED 1,000–2,500
- Sensors: Occupancy/door sensors per zone
- Scenes: Curtains close + AC adjusts before peak heat
- Best for: Most villas with multiple AC zones

### Tier 3: Full BMS/VRF Integration
- Price: AED 3,500–7,000 per zone + BMS gateway + programming AED 10,000–25,000
- Wiring: Damper actuator + BMS bus — first-fix only
- Control: Whole-home zoning, energy reporting, synced with curtains + lighting
- Best for: Large villas, commercial, ducted central AC systems

---

## 5. CCTV & SECURITY — THREE TIERS

### Tier 1: Wi-Fi Cameras (DIY)
- Price: AED 300–700 per camera
- Wiring: None (power + Wi-Fi)
- Storage: Cloud subscription (typically AED 20–80/month)
- Best for: Apartments, rentals, single entry points

### Tier 2: PoE Cameras + NVR
- Price: AED 700–1,500 per camera + NVR AED 1,500–3,500
- Wiring: PoE cable to each camera (first-fix or accessible ceiling)
- Storage: Local NVR — no subscription
- Scenes: Motion at night triggers lights
- Best for: Most villas — perimeter + key internal areas

### Tier 3: Full Security + Access Control
- Price: AED 1,200–2,500 per camera + access control + alarm panel AED 8,000–20,000
- Includes: Cameras, smart locks, door/window sensors, alarm panel, video intercom
- Control: App + NVR + alarm panel
- Best for: Villas wanting cameras, access control, and alarm in one system

---

## 6. CURTAINS & BLINDS — THREE TIERS

### Tier 1: Plug-and-Play Motors
- Price: AED 800–1,600 per window
- Wiring: None (rechargeable or plug-in)
- Control: App + remote
- Automation: Per-track schedules only
- Best for: Rentals, finished homes, a few windows

### Tier 2: Wired Motors + Scenes
- Price: AED 1,600–2,800 per window + hub/sensor AED 800–2,000
- Wiring: Motor power to each track (first-fix or accessible ceiling)
- Scenes: Curtains close + lights dim for movie night; open with sunrise
- Best for: Most villas — most or all windows

### Tier 3: Bus-Integrated Control
- Price: AED 2,800–4,500 per window + bus module + processor AED 5,000–12,000
- Wiring: Motor + bus cable to every track (first-fix only)
- Scenes: Whole-building sync with lighting + AC
- Best for: Villas/new builds with full lighting + AC + curtain integration

---

## 7. WHOLE-HOME BUDGET ESTIMATES (INDICATIVE)

| Home Size   | Economy Package | Standard Package | Premium Package |
|-------------|-----------------|------------------|-----------------|
| 1BHK flat   | AED 25,000–45,000 | AED 45,000–80,000 | AED 80,000–150,000 |
| 2BHK flat   | AED 40,000–70,000 | AED 70,000–130,000 | AED 130,000–250,000 |
| 3BHK villa  | AED 80,000–140,000 | AED 140,000–260,000 | AED 260,000–500,000 |
| 4–5BHK villa| AED 150,000–280,000| AED 280,000–500,000 | AED 500,000–1,200,000|

Economy = smart switches + Wi-Fi cameras + smart thermostats + plug-and-play curtain motors
Standard = smart switches + scenes hub + PoE cameras + zoned HVAC + wired curtains + multi-room audio
Premium = DALI/KNX bus + full security + BMS HVAC + bus-integrated curtains + full AV distribution

---

## 8. RETROFIT vs NEW BUILD

| Factor              | Retrofit (finished home)         | New Build / First Fix              |
|---------------------|----------------------------------|-------------------------------------|
| Lighting control    | Wi-Fi/Zigbee switches only       | All tiers possible (DALI/KNX)      |
| AV                  | Wireless speakers only           | In-ceiling wired speakers          |
| HVAC                | Smart thermostats only           | Full BMS/VRF zoning                |
| CCTV                | Wi-Fi cameras only               | PoE wired cameras                  |
| Curtains            | Plug-and-play motors             | Wired motors + bus integration     |
| Lighting fixtures   | Surface, pendant, track only     | Recessed downlights (ceiling open) |
| Cost impact         | Higher per point (surface runs)  | Lower per point (in-wall)          |

---

## 9. COMMON QUESTIONS & ANSWERS

Q: How many downlights do I need?
A: Use the lumen formula: Area × lux target ÷ fixture lumens per fitting. For a 20m² living room with 250 lux target and 800-lumen downlights: 20 × 250 / 800 = 6.25, so 6–7 downlights. Add task lighting for reading areas.

Q: Warm white or cool white for a living room?
A: 2700–3000 K for living areas. 3000 K is the most popular in UAE villas — warm enough to feel residential but clean enough for modern interiors. Avoid 5000 K+ in living/bedrooms.

Q: Can I add smart home to a finished villa without breaking walls?
A: Yes, but your tier choices are limited to Wi-Fi/Zigbee devices. You can get smart switches, app-controlled curtain motors, smart thermostats, Wi-Fi cameras, and wireless speakers — all without cabling. For the tightest integration (scenes, whole-home control), wired systems during first fix are better.

Q: Which automation brand is best?
A: Depends on your build stage, budget, and integration needs. For new builds wanting whole-home control: KNX or Crestron (premium), Lutron (mid-premium), DALI with a scenes hub (mid). For retrofits: Philips Hue, Shelly, Sonoff (economy–mid), Fibaro, Somfy (mid–premium). We don't sell any brand — we recommend what fits your project.

Q: What does a 3BHK villa smart home cost in Dubai?
A: Indicatively AED 140,000–260,000 for a standard package (smart switches + scenes, wired cameras, zoned HVAC, wired curtains, multi-room audio). Economy package starts around AED 80,000. Premium (DALI/KNX bus + full AV) runs AED 260,000–500,000+. These are supply + fit estimates; exact pricing requires a design review and BOQ.

Q: What is DALI?
A: Digital Addressable Lighting Interface — an industry-standard protocol for professional lighting control. Every DALI driver has a unique address; the controller can dim each fixture individually, assign it to any group, and change groups in software without rewiring. Used in commercial and premium residential lighting control.

Q: What is KNX?
A: A wired building automation standard used in premium residential and commercial. A KNX bus cable runs to every switch, sensor, and actuator. All devices are programmable in ETS software. Very reliable, very expandable, but must be planned during first fix.

Q: How long does a design pack take?
A: 7 days from receipt of your floor plan and a brief call. The pack includes a lighting layout, BOQ with fixture types and quantities, control strategy, and indicative budget per system.

---

## 10. SERVICE OVERVIEW

Design & BOQ service:
- Upload floor plan → 30-min brief call → 7-day turnaround
- Deliverables: room-by-room lighting layout, fixture schedule, control strategy, indicative BOQ, contractor brief
- Brand-neutral: we specify by performance tier, not brand name
- Price: quoted per project (flat fee, not commission)

Knowledge hub:
- Free guides on lux levels, CCT, dimming, smart home tiers
- No signup required
- Brand comparisons are independent

BOQ philosophy:
- Quantities derived from room schedule and design intent
- Prices are indicative AED ranges from UAE general market
- Site confirmation by installing contractor is required for final quantities

---

## 11. UAE MARKET CONTEXT

- VAT: 5% applies to all supply and installation in UAE
- Import duties on lighting fixtures and smart home equipment: 5% typically
- Brands widely available in UAE: Philips, Osram, Havells, Schneider, Lutron, Somfy, Legrand, ABB, Siemens (KNX), Hikvision, Dahua, Sonos, Samsung
- Premium brands available through specialist distributors: Crestron, Savant, Control4, Lutron RadioRA3, Ajax (security)
- Labour rates (installation): AED 80–150/hour for electricians; specialist automation programmers AED 200–400/hour
- Dubai building code: lighting design must comply with Green Building Regulations (minimum energy efficiency requirements)

---

## 12. UAE LIGHTING SUPPLIERS & BRAND ECOSYSTEM

### UAE Lighting Brand Ecosystem

**Premium / Professional LED brands active in UAE market:**
| Brand               | Tier       | Category                          | Notes                                                  |
|---------------------|------------|-----------------------------------|--------------------------------------------------------|
| OSRAM               | Premium    | Professional LED fixtures         | Commercial & architectural; widely used in UAE hospitality and government projects |
| LEDVANCE            | Standard–Premium | General LED lighting        | Strong in residential + commercial; good DALI driver range |
| ERCO                | Premium    | Architectural / museum lighting   | High-end accent, facade, hospitality, museum; tight beam optics |
| Philips/Signify     | Standard–Premium | Full LED range              | Widest product range; Hue for residential smart lighting |
| Havells             | Economy–Standard | General LED               | Widely stocked; strong value proposition for bulk residential |
| NVC Lighting        | Economy–Standard | Commercial LED            | Popular in UAE fit-outs; good panel and downlight range |

**Lighting segments and what professionals specify:**
- **Construction & development** — OSRAM/LEDVANCE/Philips for commercial; ERCO for feature and facade; Havells/NVC for economy fit-out
- **Hospitality (hotels, restaurants, lounges)** — mood/colour lighting, ERCO for accent, LEDVANCE/Osram for back-of-house; DALI control universal for dimming scenes
- **Healthcare** — CRI 90+ mandatory; flicker-free drivers; Philips Healthcare or OSRAM professional ranges
- **Education** — 300–500 lux, CRI 80+, glare-controlled; panel lights dominant; smart controls for energy saving
- **Government/public** — sustainable retrofit; LED streetlight replacement; energy-efficiency mandated by UAE Green Building Regulations

**UAE ELV & Building Systems brand intelligence:**
| Category                | Common brands in UAE market              | Notes                                    |
|-------------------------|------------------------------------------|------------------------------------------|
| KNX building automation | Siemens, ABB, Schneider Electric, Legrand | All KNX-certified; Siemens dominant for commercial |
| Fire detection          | Olympia Electronics, Protec, Notifier, Bosch | UAE Civil Defence approval required for all fire systems |
| Security/CCTV           | Hikvision, Dahua, Axis (premium)         | SIRA (Security Industry Regulatory Agency) approval required in Dubai |
| UPS / critical power    | Borri, APC, Eaton                        | Needed for AV racks, NVR, smart home processors |
| Intercom / access       | Comelit, 2N, HID, Suprema               | Common in UAE villa and commercial projects |

**UAE compliance notes for ELV projects:**
- Fire detection systems: must be Civil Defence Approved (contractor + products)
- Security/CCTV in Dubai: SIRA approval required for security systems companies
- Green Building Regulations (Dubai): minimum efficacy and energy targets for lighting in new builds
- DEWA/ADDC compliance: electrical first-fix inspection before ceiling close-in

### Other Key UAE Lighting & Automation Distributors/Brands
- **Philips Lighting (Signify)** — widely available across all retail + trade channels; Hue for residential smart lighting
- **Havells** — budget–mid tier; widely stocked in UAE electrical wholesale
- **Legrand** — wiring devices, KNX modules, data infrastructure; strong in UAE commercial
- **Schneider Electric** — KNX, DALI control gear, electrical distribution panels
- **ABB** — KNX certified; high-end switches (Busch-Jaeger, Busch-free@home) and building automation
- **Somfy** — motorised curtains/blinds; leading curtain motor brand in UAE
- **Lutron** — premium lighting control (RadioRA3, Homeworks); requires certified dealer; benchmark for dimming
- **Hikvision / Dahua** — dominant CCTV brands in UAE; widely available through security distributors
- **Samsung (SmartThings)** — available through Samsung UAE; appliance + lighting automation hub
- **Sonos** — distributed audio; available through AV retailers in UAE

### Buying Channels in UAE
- **Electrical wholesale / trade** — OSRAM, LEDVANCE, Havells, Siemens, Schneider available through trade distributors; B2B, no walk-in retail
- **Lighting showrooms** — Tradeline and similar for premium residential fixtures
- **Consumer retail** — ACE Hardware / Carrefour / Lulu for Philips Hue, Samsung, basic Wi-Fi devices
- **Online (Amazon UAE / Noon)** — Tier 1 smart switches, cameras, wireless speakers, budget fixtures
- **Specialist AV/automation dealers** — Crestron, Savant, Lutron Homeworks, Control4 require a certified dealer for supply and programming

---

## 13. SMART HOME & LIGHTING CONTROL BRAND INTELLIGENCE

This section contains verified intelligence on the leading smart home and lighting control platforms. Data sourced from official brand websites (June 2026). Brand-neutral — no commercial relationship with any brand listed.

---

### LUTRON (Lighting Control — Premium to Ultra-Premium)
**Origin:** Founded 1961, Coopersburg PA, USA. Industry benchmark for dimming quality.

**Product tiers:**
| Product Line     | Tier           | Wiring       | Best For                                   |
|------------------|----------------|--------------|--------------------------------------------|
| Homeworks QSX    | Ultra-premium  | Wired + RF   | Luxury estates, villas, custom programming |
| RadioRA3         | Premium        | RF wireless  | Whole-home mid-large residential           |
| Caseta Wireless  | Standard       | RF wireless  | Single-room or DIY smart lighting          |
| Serena Shades    | Premium        | Motorized    | Integrated smart shading                   |

**Protocols:** DALI, 0-10V, Clear Connect (proprietary RF — engineered interference-free on 434 MHz).
**Dimming quality:** 0.1% smooth dimming, flicker-free, silent — the industry reference standard.
**Voice integration:** Amazon Alexa, Google Assistant, Apple HomeKit, Siri.
**3rd-party integration:** Crestron, Control4, Savant, Siemens, Apple HomeKit, Google Home.
**Dealer model:** Homeworks QSX and RadioRA3 require a certified Lutron dealer for design, supply, and programming. Caseta is DIY/retail.
**UAE:** Available through authorized Lutron dealers. Widely specified in UAE luxury villas and hospitality.

---

### SIGNIFY / PHILIPS LIGHTING (Full-Spectrum Lighting — Economy to Premium)
**Origin:** Eindhoven, Netherlands. World's largest lighting company. Philips lighting brand licenses held by Signify.

**Brands under Signify umbrella:**
| Brand              | Segment                  | Notes                                                                   |
|--------------------|--------------------------|-------------------------------------------------------------------------|
| Philips (Professional) | B2B fixtures & drivers | Full range — indoor, outdoor, LED lamps, tubes; strong in UAE trade channel |
| Philips Hue        | Residential IoT          | Color + White Ambiance; Zigbee/Wi-Fi; UAE retail widely available       |
| Dynalite           | Commercial/Hospitality control | Scene-based DALI/DMX lighting control; widely specified in UAE hotels |
| Interact           | Commercial IoT           | Cloud-based connected lighting: occupancy sensors, energy management    |
| Colour Kinetics    | Architectural/entertainment | Dynamic RGB architectural lighting for facades, hospitality, stadia   |

**Dynalite detail:** Philips Dynalite is a scene-based lighting control system used in UAE hotels and commercial buildings. Supports DALI, DMX, dry-contact. Programs preset scenes (Welcome, Meeting, Presentation, Evening). Integrates with BMS and HVAC. Commonly specified by M&E consultants for 4–5 star hotels.

**UAE availability:** Trade distributor (professional range), ACE Hardware / Amazon UAE / Noon (Hue consumer range).

---

### CONTROL4 (Smart Home Automation — Mid to Premium)
**Origin:** Salt Lake City, USA. Parent: ADI Global (formerly Snap One).
**Current platform:** Control4 X4 OS (2025/2026) + Control4 OS3 legacy app.

**What it does:** Whole-home automation OS — unified control of lighting, AV, HVAC, security, shades, locks, intercom, and pools from one interface.

**Key features:**
- **25,000+ third-party device integrations** — broadest compatibility ecosystem of any residential platform
- **Scenes:** Good Morning, Away, Welcome, Cooking, Entertain, Goodnight — multi-device orchestration with one tap
- **Voice:** Amazon Alexa, Google Assistant, Apple HomeKit (with CarPlay, Apple Widgets, Siri)
- **Interfaces:** T5 touchscreen (wall-mount or portable), keypads, switches/dimmers, Control4 app (iOS + Android)
- **Subscriptions:** Control4 Connect (remote access + voice), Assist/Assist Premium (remote dealer support), Luma Insights (AI security alerts for human/vehicle/package detection)

**Lighting integrations Control4 supports:** Lutron, Dynalite, KNX, Deako, Leviton, iLight, Colorbeam, Rako, Fibaro, Philips.
**Other integrations:** Hikvision, Axis cameras; Honeywell, Ecobee, Nest HVAC; Somfy, Hunter Douglas shades; Yale, Schlage, August locks; Sonos audio.
**Tier:** Premium residential and small-to-mid commercial.
**Dealer model:** Professional certified integrator required for installation and programming.
**UAE:** Sold through certified Control4 integrators. Well established in UAE residential and hospitality.

---

### SAVANT (Smart Home Automation — Ultra-Premium)
**Origin:** Founded 2005, Massachusetts, USA. Parent company of GE Lighting (since 2020).

**Platform highlights:**
- Single app (iOS/Android) controls lighting, climate, entertainment, security, and energy
- **Savant Power System:** smart panel modules, battery backup, whole-home energy management — notable differentiator vs. Crestron/Control4
- **GE Proseo:** professional-grade smart lighting and shading line (2025) — designed for Savant integration

**Interfaces:**
| Interface           | Description                                            |
|---------------------|--------------------------------------------------------|
| Savant App          | iOS/Android — primary control interface                |
| Pro Remote X2       | 3.1" aluminum-chassis touchscreen remote               |
| Touch Panels        | 5" and 8" wall-mount touch panels                      |
| Metropolitan keypad | Architectural engraved keypad                          |
| Echo keypad         | Minimalist flush-mount keypad                          |
| Ascend keypad       | Mid-tier scene keypad                                  |

**Voice:** Amazon Alexa, Google Assistant, Apple Siri — first whole-home automation brand with native Siri integration.
**Audio:** Savant Music — whole-house audio distribution, lossless audio, Spotify/Deezer/streaming services.
**Scenes:** "Movie Night", "Good Morning", "Dinner Party" — cross-system scenes across all subsystems.
**Tier:** Ultra-premium residential. Positioned above Control4 and Crestron on price.
**Dealer model:** Requires authorized Savant dealer for supply, design, and commissioning.
**UAE relevance:** Specified in ultra-luxury villas and penthouses; priced for high-net-worth residential only.

---

### CRESTRON (Smart Home + Commercial Automation — Premium to Enterprise)
**Origin:** Rockleigh, NJ, USA. Established 1969. Dual focus: residential (Crestron Home OS) and commercial/enterprise.
**Current residential platform:** Crestron Home OS 4.10 (March 2026).

**Residential products:**
| Product                  | Description                                                          |
|--------------------------|----------------------------------------------------------------------|
| Horizon Keypads          | New (2026) — brushed metal finishes (brass, black), tactile response |
| Cameo Keypads            | Flush-mount, custom engraving, multiple colors/textures              |
| Cevo Mini Remote         | Ergonomic handheld, voice control, guided-touch for low-light        |
| Crestron Home OS 4.10    | Latest firmware — expanded system size, new keypad partner support   |
| DIN-DLI module (OS 4.9)  | DALI DT8 tunable white support (Jan 2026)                            |
| SolarSync photosensor    | Circadian lighting — replicates natural daylight cycle indoors       |
| Zūm Lighting             | Flexible commercial lighting control (separate from Home OS)         |

**DMF PhaseX integration (2025):** Crestron partnered with DMF to integrate PhaseX — transmits DMX control signals over existing AC power cables. Benefits: 0.1% dimming, tunable white, no rewiring needed for retrofit, soft zone programming without opening ceilings. Artafex 2 and Artafex 4 fixture lines supported.

**3rd-party integrations confirmed:** Lutron (shades), Philips Hue, Sony/Samsung/LG TVs, Sonos, BACnet HVAC, Yale locks, Hikvision/Dahua cameras, Ecobee, Origin Acoustics speakers, Somfy shades.

**Commercial/enterprise:** Crestron DM (Digital Media) AV matrix switching, 80 Series touch screens, Microsoft Teams certified rooms, enterprise-scale AV-over-IP. Used in corporate offices, universities, government.

**Tier:** Premium residential + enterprise commercial. Wider commercial portfolio than Control4 or Savant.
**Dealer model:** Certified Crestron dealer required for residential. Certified programmer for commercial.
**UAE relevance:** Strong commercial/enterprise presence in UAE (government, corporate). Residential specified in high-end villas and hospitality.

---

### EELECTRON (KNX Building Automation — Premium)
**Origin:** Italian manufacturer, 30+ years in KNX. ISO 9001 + ISO 14001 certified. Made in Italy.
**Scale:** 36,000+ hotel room installations globally; active in 90+ countries.

**Product ranges:**
| Range          | Key Products                                               | Primary Sector        |
|----------------|------------------------------------------------------------|-----------------------|
| OL-U           | Mechanical KNX switches, capacitive RGB bar                | Residential, Hospitality |
| 9025           | KNX transponder/card reader, BLE beacon, KNX Secure        | Hospitality (hotel rooms) |
| 3025           | Room control interface                                      | Hospitality, Commercial |
| EELECTA        | Premium capacitive touch switches                          | Residential, High-end |
| SINCHRONICITY  | Synchronized multi-channel lighting                        | Residential, Hospitality |
| Multi.sensor   | Presence + environment sensing                             | Commercial, Healthcare |
| XXTER          | KNX controller/gateway                                     | All sectors           |
| PAIROT         | KNX voice assistant                                        | Residential           |

**Device categories:** Actuators (DIN rail, valve), Climate & Lighting Control (dimmers, climate), Presence Sensors (DALI + KNX), DALI gateways, Thermostats, Capacitive and Mechanical switches, Touch Panels (IP + KNX), Gateways, Energy meters.
**KNX Secure:** Eelectron is KNX Secure certified — encrypted communication for security-sensitive projects.
**Hospitality speciality:** 9025 series handles hotel room access (card reader), BLE mobile key, and integrates room automation (lights, HVAC, curtains, DND sign) all on one KNX backbone.
**Sectors:** Residential, Hospitality, Commercial building, Healthcare.
**UAE relevance:** Good fit for UAE hotel and luxury residential KNX projects. Positioned between Siemens (commercial) and Schneider (mid-tier) for hospitality-focused KNX.

---

### SIEMENS DESIGO (Commercial Building Automation — Enterprise)
**Origin:** Siemens Smart Infrastructure, Germany. Global building technology leader.

**Platform overview:**
| Product          | Scale                  | Use Case                                                         |
|------------------|------------------------|------------------------------------------------------------------|
| Desigo CC        | Large-scale            | Building management platform — HVAC, lighting, fire, energy, security unified |
| Desigo Optic     | Small-to-medium        | Simplified BMS for smaller commercial buildings                  |

**Key capabilities:** Operational efficiency, energy efficiency, carbon footprint reporting, fire safety integration, KNX-compatible, BACnet and LonWorks interoperability.
**What Desigo CC integrates:** HVAC (Siemens VAV/fan coil controllers), lighting (DALI, KNX), fire detection (Cerberus FIT/PRO), access control, energy metering.
**UAE relevance:** Siemens is dominant in large UAE commercial and government buildings (government towers, airports, hospitals, malls). Less common in pure residential. Specified by M&E consultants and main contractors, not typically by interior fit-out teams.
**Dealer model:** Siemens Solution Partner ecosystem; engineering-led procurement, not retail.

---

### BRAND SELECTION GUIDE — When to Recommend Each Platform

| Scenario                                          | Recommended Platform(s)              |
|---------------------------------------------------|--------------------------------------|
| UAE luxury villa, budget AED 150k+, full integration | Crestron Home or Savant            |
| UAE luxury villa, budget AED 50–150k             | Control4 or Crestron Home            |
| Hospitality (hotel rooms, 4–5 star)              | Eelectron KNX, Dynalite (Signify), Lutron Homeworks |
| Commercial office / mixed-use tower              | Siemens Desigo, KNX (Siemens/ABB/Schneider) |
| Lighting-only control, no full smart home        | Lutron RadioRA3 or Caseta, Dynalite  |
| Consumer / DIY smart lighting                    | Philips Hue, Samsung SmartThings     |
| KNX residential project with Italian finish      | Eelectron + ABB switches             |

`;


module.exports = { KNOWLEDGE_BASE };
