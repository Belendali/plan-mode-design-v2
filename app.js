/* Wanaka · Planner Mode — interactive restoration of Figma section "0723"
   File PWtgAaGdl6znpuQykrnIbb · node 45623:94837
   Frames: 01 Start Chat → 02 Simple Question → 03 Recommend Plan Mode → 04 Planner start */

const QUERY = location.search;   // the deep-link handler clears this later

// ── Script ────────────────────────────────────────────────────────
const IDEAS = [
  { icon: 'assets/ghost.svg',  text: 'Build a ghost running a midnight bakery', mod: 'idea--center' },
  { icon: 'assets/clover.svg', text: 'Build a narrative game about my grandma', mod: 'idea--narrow' },
  { icon: 'assets/car.svg',    text: 'Build a getaway driver outrunning cop cars through New York' },
];

// Icon/Asset/Game — six exported vector layers, placed per the Figma geometry.
const GAME_ICON = `
  <span class="ico-game">
    <i style="left:1.333px;top:4.333px;width:13.333px;height:9.333px"><img style="left:-.7px;top:-.7px;width:14.733px;height:10.733px" src="assets/game0.svg" alt=""></i>
    <i style="left:8.8px;top:6.667px;width:2px;height:2px"><img style="left:0;top:0;width:2px;height:2px" src="assets/game1.svg" alt=""></i>
    <i style="left:11.2px;top:9.067px;width:2px;height:2px"><img style="left:0;top:0;width:2px;height:2px" src="assets/game1.svg" alt=""></i>
    <i style="left:4px;top:9px;width:3.333px;height:0"><img style="left:-.7px;top:-.7px;width:4.733px;height:1.4px" src="assets/game2.svg" alt=""></i>
    <i style="left:8px;top:2.333px;width:0;height:2px"><img style="left:-.7px;top:-.7px;width:1.4px;height:3.4px" src="assets/game3.svg" alt=""></i>
    <i style="left:5.667px;top:7.333px;width:0;height:3.333px"><img style="left:-.7px;top:-.7px;width:1.4px;height:4.733px" src="assets/game4.svg" alt=""></i>
  </span>`;

const SEED = 'I want a getaway driver outrunning cop racing game in New York city.';

// Each question: the agent line that opens it, and the options.
// `ack` is the agent's acknowledgement, keyed by the chosen option.
const QUESTIONS = [
  {
    ask: 'A racing game in New York — nice. Three quick things. Racing against rivals, or the clock?',
    options: ['Against rivals', 'Time trial, just me'],
    ack: {
      'Against rivals': 'Rivals it is. Every good race needs someone to beat.',
      'Time trial, just me': 'Just you and the clock. Nothing to blame but your own line.',
    },
  },
  {
    ask: 'Day or night in the city?',
    options: ['Night — neon and rain', 'Golden hour'],
    ack: {
      'Night — neon and rain': 'Night. The city does its best work after dark.',
      'Golden hour': 'Golden hour. Long shadows and low sun in the mirrors.',
    },
  },
  {
    ask: 'Last one — how does someone win?',
    options: ['Most coins collected', 'First one to the bridge'],
    ack: {
      'Most coins collected': 'Coins it is. Greed makes people take bad corners.',
      'First one to the bridge': 'A finish line. Simple, and impossible to argue with.',
    },
  },
];

const PITCH = {
  title: 'Whoa! This deserves a crew.',
  body: "I'll plan it, then each Wana takes a pass — you check their work.",
  cta: 'Try Crew mode',
  decline: 'Not this time',
  note: 'Free once — only counts if it ships.',
  roster: [
    { name: 'Developer', gif: 'assets/wana-dev.gif' },
    { name: 'Artist',    gif: 'assets/wana-artist.gif' },
    { name: 'Tester',    gif: 'assets/wana-tester.gif' },
  ],
};

const PLAN = {
  head: 'Alright! Your Getaway Driver plan is ready.',
  title: 'Getaway Drive Version 1.0',
  desc: 'One driver, five cop cars, and the longest night in New York.',
  stats: [
    { icon: 'assets/checklist.svg', label: '8 steps' },
    { icon: 'assets/range.png', label: '320~560', flip: true },
    { icon: 'assets/play.svg', label: 'Playable in ~10min' },
  ],
  replies: [
    { text: 'Start building!', go: true },
    { text: 'I want to change something...' },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Shell ─────────────────────────────────────────────────────────
const stage = document.getElementById('stage');
stage.innerHTML = `
  <button class="trialflag" id="trial-flag" title="Demo control — flips the free-run state">
    <i></i><span>Free run <b>available</b></span>
  </button>
  <div class="panel">
    <div class="panel__glow"><img src="assets/bg-ellipses.svg" alt=""></div>

    <div class="chatinfo chatinfo--top">
      <div class="chatinfo__name"><span>NYC Getaway Drive</span><img src="assets/chevron.svg" alt=""></div>
      <div class="chatinfo__rule"></div>
      <div class="chatinfo__stats">
        <div class="coins"><img src="assets/coin.png" alt=""><b>320</b></div>
        <div class="upgrade"><img src="assets/crown.svg" alt="">Upgrade</div>
      </div>
    </div>

    <div class="log__fade-top"></div>
    <div class="log" id="log"></div>

    <img class="perch" id="perch" src="assets/cat-think.png" alt="" style="opacity:0">

    <div class="composer-wrap">
      <div class="composer-head"><span>Wanaka 1.0 Lite</span><i></i></div>
      <div class="composer">
        <textarea class="composer__input" id="input" placeholder="Ask, plan, build anything..."></textarea>
        <div class="composer__row">
          <div class="composer__tools">
            <button class="iconbtn"><img class="glyph" src="assets/plus.svg" alt=""></button>
            <button class="iconbtn"><img src="assets/scissors.svg" alt=""></button>
          </div>
          <button class="send is-disabled" id="send" aria-label="Send"><span class="send__glyph" id="send-glyph"></span></button>
        </div>
      </div>
    </div>

    <div class="plannerbtn" id="plannerbtn">
      <span>Crew</span>
      <div class="switch" id="switch"><i></i></div>
    </div>
  </div>
`;

const GLYPH = {
  send: '<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M9 15V3M9 3L4 8M9 3l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  stop: '<svg viewBox="0 0 18 18" aria-hidden="true"><rect x="3" y="3" width="12" height="12" rx="3" fill="currentColor"/></svg>',
};

document.getElementById('trial-flag').onclick = () => trial.toggle();

const log = document.getElementById('log');
const perch = document.getElementById('perch');
const input = document.getElementById('input');
const switchEl = document.getElementById('switch');
const sendEl = document.getElementById('send');
const sendGlyph = document.getElementById('send-glyph');

// disabled → nothing to send · send → something typed · busy → the crew is working
function setSend(state) {
  sendEl.className = 'send is-' + state;
  sendGlyph.innerHTML = state === 'busy' ? GLYPH.stop : GLYPH.send;
  sendEl.setAttribute('aria-label', state === 'busy' ? 'Stop' : 'Send');
}
setSend('disabled');

const setPerch = (who) => {
  perch.src = who === 'plan' ? 'assets/cat-plan.gif' : 'assets/cat-think.png';
  perch.classList.toggle('is-think', who !== 'plan');
  perch.style.opacity = '1';
};

const scrollDown = () => { log.scrollTop = log.scrollHeight; };
const push = (node) => { log.appendChild(node); scrollDown(); return node; };

// ── Screens ───────────────────────────────────────────────────────
let busy = false;

function screenStart() {
  log.innerHTML = '';
  perch.style.opacity = '0';
  switchEl.classList.remove('is-on');
  input.value = '';

  const ideas = el('div', 'ideas');
  ideas.innerHTML = `
    <div class="ideas__head">
      <div class="ideabubble">
        <p>Try writing down your ideas now, and I’ll help you generate them~</p>
        <img class="ideabubble__tail" src="assets/tail.svg" alt="">
      </div>
      <img class="ideas__cat" src="assets/cat-think.png" alt="">
    </div>
    <div class="ideas__list"></div>
  `;
  const list = ideas.querySelector('.ideas__list');
  IDEAS.forEach((idea, i) => {
    const b = el('button', 'idea ' + (idea.mod || ''), `<img src="${idea.icon}" alt=""><span>${idea.text}</span>`);
    b.onclick = () => runConversation(i === 2 ? SEED : idea.text);
    list.appendChild(b);
  });

  // The idea list is centred in the panel, not part of the scrolling log.
  document.querySelector('.panel').appendChild(ideas);
  ideas.id = 'ideas';
}

function clearStart() {
  const ideas = document.getElementById('ideas');
  if (ideas) ideas.remove();
}

async function runConversation(seed) {
  if (busy) return;
  busy = true;
  clearStart();
  log.innerHTML = '';

  push(el('div', 'msg msg--user', seed));
  setPerch('think');
  await wait(700);

  for (const q of QUESTIONS) {
    push(el('div', 'msg msg--agent', q.ask));
    const choice = await askOptions(q.options);
    push(el('div', 'msg msg--user', choice));
    await wait(600);
    push(el('div', 'msg msg--agent', q.ack[choice]));
    await wait(500);
  }

  await wait(300);
  screenPitch();
  busy = false;
}

function askOptions(options) {
  return new Promise((resolve) => {
    const wrap = push(el('div', 'options'));
    options.forEach((text) => {
      const b = el('button', 'option', text);
      b.onclick = () => { wrap.remove(); resolve(text); };
      wrap.appendChild(b);
    });
    scrollDown();
  });
}

function screenPitch() {
  perch.style.opacity = '0'; // the big planner cat carries this moment on its own
  const scrim = el('div', 'pitch__scrim');
  scrim.id = 'pitch-scrim';
  document.querySelector('.panel').appendChild(scrim);
  const pitch = el('div', 'pitch');
  pitch.innerHTML = `
    <img class="pitch__cat" src="assets/cat-plan.gif" alt="">
    <div class="pitch__card">
      <div class="pitch__copy">
        <h3>${PITCH.title}</h3>
        <p>${PITCH.body}</p>
      </div>
      <div class="roster">
        ${PITCH.roster.map((r) => `
          <div class="roster__member">
            <span class="roster__face"><img src="${r.gif}" alt=""></span>
            <span class="roster__name">${r.name}</span>
          </div>`).join('')}
      </div>
      <div class="pitch__cta">
        <button class="btn-white">${PITCH.cta}</button>
        <button class="btn-quiet">${PITCH.decline}</button>
        <p class="pitch__note">${PITCH.note}</p>
      </div>
    </div>
  `;
  pitch.querySelector('.btn-white').onclick = () => screenPlanning(pitch);
  pitch.querySelector('.btn-quiet').onclick = () => declineCrew(pitch);
  document.querySelector('.panel').appendChild(pitch);
}

// Declining costs nothing: the offer stays reachable from the switch.
function dismissPitch(pitch) {
  const scrim = document.getElementById('pitch-scrim');
  if (scrim) scrim.remove();
  if (!pitch) return;
  pitch.classList.add('is-leaving');
  setTimeout(() => pitch.remove(), 420);
}

function declineCrew(pitch) {
  dismissPitch(pitch);
  push(el('div', 'msg msg--user', PITCH.decline));
  setTimeout(() => {
    push(el('div', 'msg msg--agent', "Sure — say the word if you change your mind."));
    document.getElementById('plannerbtn').classList.add('has-new');
  }, 500);
}

async function screenPlanning(pitch) {
  if (busy) return;
  busy = true;

  // Hiring the planner IS turning Planner mode on — flip the switch first, on its
  // own beat, so the user sees where the mode they just bought actually lives.
  const btn = document.getElementById('plannerbtn');
  switchEl.classList.add('is-on');
  btn.classList.remove('has-new');
  btn.classList.add('is-flash');
  setTimeout(() => btn.classList.remove('is-flash'), 1400);
  dismissPitch(pitch);          // slides back down, handing the composer back
  await wait(pitch ? 560 : 0);
  setPerch('plan');

  push(el('div', 'joined', 'Crew assembled'));
  await wait(500);
  const think = push(el('div', 'thinking',
    '<p>Cool! Wait for a moment, I am planning the whole game for you...</p><span class="spinner"></span>'));
  await wait(2600);
  think.remove();
  screenPlan();
  busy = false;
}

function screenPlan() {
  push(el('div', 'planhead', PLAN.head));

  const plan = el('div', 'plan');
  plan.innerHTML = `
    <img class="plan__confetti" src="assets/confetti.gif" alt="">
    <div class="plan__shots">
      <div class="plan__shot plan__shot--a"><img src="assets/card-a.jpg" alt=""></div>
      <div class="plan__shot plan__shot--b"><img src="assets/card-b.jpg" alt=""></div>
      <div class="tag tag--a">Version 1.0</div>
      <div class="tag tag--b">Final Version</div>
    </div>
    <div class="plan__body">
      <p class="plan__title">${PLAN.title}</p>
      <p class="plan__desc">${PLAN.desc}</p>
      <div class="plan__stats">
        ${PLAN.stats.map((s) => `
          <div class="stat"><img class="${s.flip ? 'flip' : ''}" src="${s.icon}" alt="">${s.label}</div>
        `).join('')}
      </div>
    </div>
  `;
  plan.classList.add('is-openable');
  plan.title = 'Open the full plan';
  plan.onclick = (e) => { if (!e.target.closest('.reply')) openPlanDoc(); };
  push(plan);

  setTimeout(openPlanDoc, 700);

  const replies = el('div', 'replies');
  PLAN.replies.forEach((r) => {
    const b = el('button', 'reply' + (r.go ? ' reply--go' : ''), r.text);
    b.onclick = () => {
      replies.remove();
      push(el('div', 'msg msg--user', r.text));
      if (r.go) {
        setTimeout(startBuild, 400);
      } else {
        setTimeout(() => push(el('div', 'msg msg--agent',
          'Sure — which part? The night, the cops, or how you win?')), 600);
      }
    };
    replies.appendChild(b);
  });
  push(replies);
}

// The plan is free to read. Building is what costs — so that is where the
// wall goes, once the user has seen what they'd be paying for.
function startBuild() {
  const doc = document.getElementById('plan-doc');
  if (doc) {
    doc.classList.remove('is-on');
    document.getElementById('stage').classList.remove('has-overlay');
    setTimeout(() => doc.remove(), 320);
  }
  if (trial.spent) { openPaywall(() => setTimeout(screenBuildParallel, 300)); return; }
  screenBuildParallel();
}

// ── Build phase ───────────────────────────────────────────────────
// Same shape as the onboarding demo's Studio step: the Planner hands the plan
// to the crew, and each Wana takes a turn on the game in the viewport.
const CREW = [
  {
    key: 'dev', name: 'Developer Wana', role: 'Logic', gif: 'assets/wana-dev.gif',
    working: 'Wiring the core loop',
    status: 'Wiring the core loop…',
    lines: ['Developer Wana: reading Game Plan 1.0…',
            'Core loop wired: drive · outrun · coin score ✓'],
    ready: 'Core loop is in — drive, outrun, coin score',
    review: "Core loop's in — drive, outrun, coin score. Take it for a spin: does it play the way you pictured? Tell me what to change, or say go and I'll hand over to the Artist.",
    again: "Had another pass at it. Better? Say go when you're happy.",
    revising: 'Reworking the loop',
    recap: 'Core loop wired: drive · outrun · coin score ✓',
  },
  {
    key: 'art', name: 'Artist Wana', role: 'Art', gif: 'assets/wana-artist.gif',
    working: 'Painting the city & the rain',
    status: 'Painting the night city…',
    lines: ['Artist Wana: mixing the palette…',
            'World dressed: Night NY — neon and rain ✓'],
    ready: 'Night NY is dressed — neon and rain',
    review: "I've dressed the city — night, neon, wet streets. How does it look to you? Anything you want different, tell me. Otherwise say go and I'll pass it to Tester.",
    again: 'Repainted it. Closer to what you had in mind?',
    revising: 'Repainting the street',
    recap: 'World dressed: Night NY — neon and rain ✓',
  },
  {
    key: 'test', name: 'Tester Wana', role: 'Playtest', gif: 'assets/wana-tester.gif',
    working: 'Driving it start to finish',
    status: 'Running the fun check…',
    lines: ['Tester Wana: first run started…',
            'Start → chase → escape: all good ✓'],
    ready: 'Full run passed — start → chase → escape',
    review: "I drove it start to finish and it holds up. Last look before we call it version 1 — anything feel off? Otherwise say go.",
    again: 'Ran it again. Any better?',
    revising: 'Re-running the chase',
    recap: 'Start → chase → escape: all good ✓',
  },
];

// Words that read as "carry on" rather than "change this".
const GO_WORDS = /^(go|ok|okay|yes|y|sure|next|continue|carry on|looks good|lgtm|nice|perfect|👍|好|可以|继续|没问题)\b/i;

const BUILD_PROMPT = 'Build my Getaway Drive game from Game Plan 1.0. Twist: the cops learn your route.';

// Grey blockout the Developer works on, before the Artist dresses it.
function wireframeSVG() {
  const towers = [];
  for (let i = 0; i < 14; i++) {
    const side = i % 2;                     // 0 = left kerb, 1 = right kerb
    const d = 0.1 + (i % 7) / 8;            // distance down the road
    const w = 60 + (i % 4) * 46;
    const h = 150 + ((i * 37) % 320);
    const x = side ? 640 + d * 420 : 400 - d * 420 - w;
    const y = 470 - h * (1 - d * 0.55);
    towers.push(`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w}" height="${h.toFixed(0)}"
      fill="rgba(255,255,255,.028)" stroke="rgba(255,255,255,.20)" stroke-width="1.4"/>`);
  }
  const lanes = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 9, y = 470 + t * t * 540;
    lanes.push(`<rect x="${(545 - t * 30).toFixed(0)}" y="${y.toFixed(0)}" width="${(10 + t * 34).toFixed(0)}"
      height="${(18 + t * 60).toFixed(0)}" fill="rgba(255,255,255,.22)"/>`);
  }
  return `<svg viewBox="0 0 1090 992" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <rect width="1090" height="992" fill="#14141c"/>
    <path d="M400 470 L640 470 L1090 992 L0 992 Z" fill="rgba(255,255,255,.045)"/>
    <line x1="0" y1="470" x2="1090" y2="470" stroke="rgba(255,255,255,.28)" stroke-width="1.4"/>
    ${towers.join('')}
    ${lanes.join('')}
    <rect x="590" y="690" width="152" height="88" rx="8"
      fill="rgba(20,20,28,.92)" stroke="rgba(255,255,255,.55)" stroke-width="2"/>
    <rect x="618" y="664" width="96" height="34" rx="6"
      fill="rgba(20,20,28,.92)" stroke="rgba(255,255,255,.4)" stroke-width="1.6"/>
    <text x="666" y="818" text-anchor="middle" fill="rgba(255,255,255,.45)"
      font-family="monospace" font-size="15" letter-spacing="2">PLAYER</text>
    <rect x="300" y="626" width="104" height="60" rx="6"
      fill="rgba(20,20,28,.92)" stroke="rgba(255,255,255,.32)" stroke-width="1.6"/>
    <text x="352" y="712" text-anchor="middle" fill="rgba(255,255,255,.32)"
      font-family="monospace" font-size="13" letter-spacing="2">COP</text>
  </svg>`;
}

// ── Getaway Drive — the game the crew is actually building ────────
// Same perspective as the blockout: horizon at y=470, road centre x=520.
const ROAD_Y = 470, ROAD_CX = 520, ROAD_H = 522;
const depthY = (p) => ROAD_Y + ROAD_H * p;
const halfW = (p) => 120 + 545 * p;
const rnd = (i) => { const x = Math.sin(i * 127.1 + 0.7) * 43758.5453; return x - Math.floor(x); };

function skyline() {
  // Far silhouette, with one spire standing in for the Empire State.
  const pts = [];
  let x = -20;
  for (let i = 0; x < 1110; i++) {
    const w = 44 + rnd(i) * 90;
    const h = 70 + rnd(i + 40) * 210;
    pts.push(`M${x} 470 L${x} ${(470 - h).toFixed(0)} L${(x + w).toFixed(0)} ${(470 - h).toFixed(0)} L${(x + w).toFixed(0)} 470 Z`);
    x += w + 6;
  }
  const spire = `<path d="M600 470 L600 190 L614 150 L622 96 L630 150 L644 190 L644 470 Z" fill="#1B1A3C"/>
    <rect x="619" y="60" width="6" height="40" fill="#1B1A3C"/>
    <circle cx="622" cy="58" r="5" fill="#FFE9A8" opacity=".9"/>`;
  return `<g opacity=".85"><path d="${pts.join(' ')}" fill="#141330"/>${spire}</g>`;
}

function tower(i, side, p) {
  const w = 46 + rnd(i) * 90 + p * 300;
  const h = 130 + rnd(i + 11) * 250 + p * 880;
  const base = depthY(p);
  const edge = ROAD_CX + (side ? 1 : -1) * halfW(p);
  const x = side ? edge + 10 + rnd(i + 3) * 40 : edge - 10 - w - rnd(i + 3) * 40;
  const top = base - h;
  const body = `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="3" fill="#221B3E"/>`;
  const shade = `<rect x="${(side ? x : x + w * 0.66).toFixed(0)}" y="${top.toFixed(0)}" width="${(w * 0.34).toFixed(0)}" height="${h.toFixed(0)}" fill="#171232" opacity=".8"/>`;
  // Window grid — warm and cyan, some dark.
  const cols = Math.max(2, Math.round(w / (16 + p * 34)));
  const rows = Math.max(3, Math.round(h / (24 + p * 52)));
  const cw = w / cols, ch = h / rows;
  const win = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = rnd(i * 97 + r * 13 + c * 7);
      if (k < 0.42) continue;
      const col = k > 0.9 ? '#7FE9FF' : '#FFD98A';
      win.push(`<rect x="${(x + c * cw + cw * 0.24).toFixed(1)}" y="${(top + r * ch + ch * 0.22).toFixed(1)}"
        width="${(cw * 0.5).toFixed(1)}" height="${(ch * 0.44).toFixed(1)}" fill="${col}" opacity="${(0.35 + k * 0.5).toFixed(2)}"/>`);
    }
  }
  return body + shade + win.join('');
}

function citySVG() {
  const DEPTHS = [0.02, 0.07, 0.14, 0.24, 0.38, 0.56, 0.8];
  const towers = [];
  DEPTHS.forEach((p, i) => { towers.push(tower(i * 2, 0, p)); towers.push(tower(i * 2 + 1, 1, p)); });

  const stars = Array.from({ length: 34 }, (_, i) =>
    `<circle class="gd-star" style="animation-delay:${(rnd(i + 60) * 4).toFixed(2)}s"
      cx="${(rnd(i) * 1090).toFixed(0)}" cy="${(rnd(i + 20) * 320).toFixed(0)}"
      r="${(1 + rnd(i + 30) * 1.6).toFixed(1)}" fill="#fff"/>`).join('');

  // Centre line — static, placed by depth so the still reads correctly.
  const dashes = [0.04, 0.12, 0.23, 0.37, 0.55, 0.78].map((p) => {
    const y = depthY(p), w = 7 + 30 * p, h = 16 + 78 * p;
    return `<rect x="${(ROAD_CX - w / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"
      rx="${(w / 3).toFixed(1)}" fill="#F4F2E8" opacity="${(0.5 + p * 0.45).toFixed(2)}"/>`;
  }).join('');

  // Coins in the right-hand lane — the win condition, visible in the still.
  const coins = [0.1, 0.22, 0.37, 0.56].map((p) => {
    const y = depthY(p), s = 0.5 + 2.4 * p;
    const x = ROAD_CX + halfW(p) * 0.42;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})">
      <circle r="16" fill="url(#gdCoinGlow)"/>
      <ellipse rx="8" ry="9.5" fill="#FFC83D"/><ellipse rx="3" ry="8" fill="#FFE9A8"/>
    </g>`;
  }).join('');

  // Speed streaks — pure motion, deliberately absent from the frozen still.
  const streaks = Array.from({ length: 5 }, (_, i) =>
    `<rect class="gd-streak" style="animation-delay:${(-i * 0.42).toFixed(2)}s" x="-2" y="0" width="4" height="26" rx="2"
      fill="#FFF" opacity=".5" transform="translate(${(ROAD_CX + (i - 2) * 44)} ${ROAD_Y})"/>`).join('');

  const rain = Array.from({ length: 54 }, (_, i) => {
    const x = rnd(i) * 1200 - 60, y = rnd(i + 5) * 1040;
    return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})">
      <line class="gd-rain" style="animation-delay:${(-rnd(i + 3) * 1.1).toFixed(2)}s;animation-duration:${(0.7 + rnd(i + 9) * 0.5).toFixed(2)}s"
        x1="0" y1="-28" x2="-11" y2="14" stroke="#CFE6FF" stroke-width="1.4" opacity=".42"/></g>`;
  }).join('');

  const lamps = [0.1, 0.3, 0.6].map((p, i) => {
    const y = depthY(p), e = halfW(p), s = 0.4 + p * 1.4;
    return [0, 1].map((side) => {
      const x = ROAD_CX + (side ? 1 : -1) * (e + 16);
      return `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${(side ? -s : s).toFixed(2)} ${s.toFixed(2)})">
        <path d="M40 -150 L74 -4 L6 -4 Z" fill="url(#gdLampCone)" opacity=".38"/>
        <rect x="-4" y="-152" width="8" height="152" rx="3" fill="#2A2440"/>
        <path d="M-4 -152 q0 -24 28 -24 h14 v11 h-14 q-17 0 -17 13 z" fill="#2A2440"/>
        <ellipse cx="38" cy="-160" rx="10" ry="6" fill="#FFE9A8"/>
        <ellipse cx="38" cy="-160" rx="26" ry="16" fill="url(#gdCoinGlow)" opacity=".45"/>
      </g>`;
    }).join('');
  }).join('');

  return `<svg viewBox="0 0 1090 992" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gdSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#070617"/><stop offset=".5" stop-color="#1C1340"/>
        <stop offset=".84" stop-color="#552150"/><stop offset="1" stop-color="#93375C"/>
      </linearGradient>
      <linearGradient id="gdRoad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2A2140"/><stop offset="1" stop-color="#0C0A16"/>
      </linearGradient>
      <linearGradient id="gdLampCone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFE9A8" stop-opacity=".6"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="gdMoon"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="gdCoinGlow"><stop offset="0" stop-color="#FFC83D" stop-opacity=".85"/><stop offset="1" stop-color="#FFC83D" stop-opacity="0"/></radialGradient>
      <radialGradient id="gdTail"><stop offset="0" stop-color="#FF2E4D" stop-opacity=".95"/><stop offset="1" stop-color="#FF2E4D" stop-opacity="0"/></radialGradient>
      <radialGradient id="gdHaze"><stop offset="0" stop-color="#FF7BB0" stop-opacity=".55"/><stop offset="1" stop-color="#FF7BB0" stop-opacity="0"/></radialGradient>
      <clipPath id="gdRoadClip"><path d="M${ROAD_CX - 120} ${ROAD_Y} L${ROAD_CX + 120} ${ROAD_Y} L${ROAD_CX + 665} 992 L${ROAD_CX - 665} 992 Z"/></clipPath>
    </defs>

    <rect width="1090" height="992" fill="url(#gdSky)"/>
    ${stars}
    <circle cx="505" cy="132" r="120" fill="url(#gdMoon)"/>
    <circle cx="505" cy="132" r="46" fill="#FFF3D6"/>
    <circle cx="488" cy="118" r="10" fill="#EFE2C0"/><circle cx="521" cy="150" r="6" fill="#EFE2C0"/>
    ${skyline()}
    <ellipse cx="520" cy="470" rx="440" ry="130" fill="url(#gdHaze)"/>
    <rect x="0" y="470" width="1090" height="522" fill="#150F2C"/>
    ${towers.join('')}

    <path d="M${ROAD_CX - 120} ${ROAD_Y} L${ROAD_CX + 120} ${ROAD_Y} L${ROAD_CX + 665} 992 L${ROAD_CX - 665} 992 Z" fill="url(#gdRoad)"/>
    <path d="M${ROAD_CX - 124} ${ROAD_Y} L${ROAD_CX - 120} ${ROAD_Y} L${ROAD_CX - 665} 992 L${ROAD_CX - 692} 992 Z" fill="#4A3A66" opacity=".7"/>
    <path d="M${ROAD_CX + 120} ${ROAD_Y} L${ROAD_CX + 124} ${ROAD_Y} L${ROAD_CX + 692} 992 L${ROAD_CX + 665} 992 Z" fill="#4A3A66" opacity=".7"/>
    <g clip-path="url(#gdRoadClip)">
      <path d="M300 992 L508 470 L514 470 L372 992 Z" fill="#FFD98A" opacity=".13"/>
      <path d="M812 992 L530 470 L536 470 L876 992 Z" fill="#7FE9FF" opacity=".11"/>
      <path d="M640 992 L518 470 L522 470 L676 992 Z" fill="#FF7BB0" opacity=".12"/>
      ${streaks}
    </g>
    ${dashes}
    ${lamps}
    ${coins}

    <g class="gd-cop">
      <ellipse cx="0" cy="46" rx="66" ry="10" fill="#000" opacity=".45"/>
      <rect x="-58" y="-16" width="116" height="52" rx="12" fill="#1B1B26"/>
      <rect x="-40" y="-40" width="80" height="30" rx="9" fill="#242433"/>
      <rect x="-33" y="-34" width="66" height="18" rx="5" fill="#3B3B55" opacity=".8"/>
      <rect x="-26" y="-52" width="52" height="12" rx="5" fill="#141420"/>
      <rect class="gd-flash-b" x="-26" y="-52" width="24" height="12" rx="5" fill="#3B82F6"/>
      <rect class="gd-flash-r" x="2" y="-52" width="24" height="12" rx="5" fill="#EF4444"/>
      <ellipse cx="-14" cy="-46" rx="42" ry="26" fill="#3B82F6" opacity=".22"/>
      <ellipse cx="14" cy="-46" rx="42" ry="26" fill="#EF4444" opacity=".22"/>
      <rect x="-52" y="18" width="18" height="9" rx="4" fill="#FF6B6B"/>
      <rect x="34" y="18" width="18" height="9" rx="4" fill="#FF6B6B"/>
    </g>

    <g class="gd-player">
      <ellipse cx="0" cy="92" rx="128" ry="18" fill="#000" opacity=".5"/>
      <ellipse cx="-92" cy="24" rx="74" ry="48" fill="url(#gdTail)" opacity=".6"/>
      <ellipse cx="92" cy="24" rx="74" ry="48" fill="url(#gdTail)" opacity=".6"/>
      <rect x="-118" y="-24" width="236" height="104" rx="22" fill="#15141C"/>
      <rect x="-86" y="-74" width="172" height="60" rx="16" fill="#1D1C27"/>
      <rect x="-72" y="-64" width="144" height="38" rx="10" fill="#3A3952" opacity=".75"/>
      <rect x="-118" y="4" width="236" height="16" rx="8" fill="#0E0D14" opacity=".7"/>
      <rect x="-104" y="8" width="72" height="16" rx="8" fill="#FF2E4D"/>
      <rect x="32" y="8" width="72" height="16" rx="8" fill="#FF2E4D"/>
      <rect x="-30" y="44" width="60" height="20" rx="5" fill="#F2C94C"/>
      <rect x="-24" y="49" width="48" height="10" rx="2" fill="#8A6D1F" opacity=".55"/>
      <rect x="-134" y="46" width="26" height="34" rx="8" fill="#0B0A10"/>
      <rect x="108" y="46" width="26" height="34" rx="8" fill="#0B0A10"/>
    </g>

    <g clip-path="url(#gdRoadClip)" opacity=".4">
      <ellipse cx="660" cy="905" rx="160" ry="28" fill="#FF2E4D" opacity=".32"/>
    </g>
    ${rain}
  </svg>`;
}

function mountBuild() {
  let build = document.getElementById('build');
  if (build) build.remove();
  build = el('div', 'build');
  build.id = 'build';
  build.innerHTML = `
    <div class="build__art">${citySVG()}</div>
    <div class="build__ds build__ds--sky">${desertSky()}</div>
    <div class="build__ds build__ds--light">${desertLight()}</div>
    <div class="build__ds build__ds--terrain">${desertTerrain()}</div>
    <div class="build__ds build__ds--road">${desertRoad()}</div>
    <div class="build__wire">${wireframeSVG()}</div>
    <div class="build__hud">
      <div class="hud hud--time"><small>TIME</small>02:45</div>
      <div class="hud hud--coin"><img src="assets/coin.png" alt="">128</div>
    </div>
    <div class="build__status" id="build-status">Setting the stage…</div>
    <div class="miniplan" id="miniplan">
      <div class="miniplan__title">TASK FOR V1.0</div>
      ${CREW.map((c) => `
        <div class="agent is-idle" id="ms-${c.key}">
          <span class="agent__face"><img src="${c.gif}" alt=""></span>
          <span class="agent__text">
            <span class="agent__name">${c.name}</span>
            <span class="agent__doing" id="doing-${c.key}">Waiting</span>
          </span>
          <span class="agent__state" id="state-${c.key}"></span>
        </div>`).join('')}
      <div class="subtasks" id="subtasks" hidden></div>
      <button class="miniplan__try" id="mini-try">▶&nbsp;&nbsp;Try demo</button>
    </div>
  `;
  (document.getElementById('pv-game') || document.getElementById('stage')).appendChild(build);
  // ?clean — hide the overlaid UI so the viewport can be captured as a plate
  if (QUERY.includes('clean')) build.classList.add('is-clean');
  build.classList.add('is-on');
  document.getElementById('mini-try').onclick = tryDemo;
  return build;
}

// The panel opens a nested checklist while a Wana works a job, so the pass
// reads as a sequence rather than one unexplained jump.
function openSubtasks(owner, steps) {
  const box = document.getElementById('subtasks');
  if (!box) return null;
  box.hidden = false;
  box.innerHTML = `
    <div class="subtasks__head"><i></i>${owner}</div>
    ${steps.map((t, i) => `
      <div class="subtask" id="st-${i}"><span class="subtask__dot"></span><span>${t}</span></div>`).join('')}
  `;
  return box;
}
function setSubtask(i, state) {
  const row = document.getElementById('st-' + i);
  if (row) row.className = 'subtask is-' + state;
}
function closeSubtasks() {
  const box = document.getElementById('subtasks');
  if (box) { box.hidden = true; box.innerHTML = ''; }
}

// state: 'idle' | 'working' | 'review' | 'done'
function setAgent(key, state, doing) {
  const row = document.getElementById(`ms-${key}`);
  if (!row) return;
  row.className = 'agent is-' + state;
  if (doing != null) document.getElementById(`doing-${key}`).textContent = doing;
}
function setStatus(label, done) {
  const s = document.getElementById('build-status');
  if (!s) return;
  s.textContent = label;
  s.classList.toggle('is-done', !!done);
}

const readLine = (txt) => push(el('div', 'readline', `<i>✓</i><span>${txt}</span>`));

let awaitingReview = null;   // { resolve, agent } while the user is checking a step

function plannerSay(msg) {
  return push(el('div', 'crewmsg crewmsg--planner',
    `<span class="crewmsg__avatar"><img src="assets/wana-plan.gif" alt=""></span>
     <span><strong>Planner Wana</strong>${msg}</span>`));
}
function agentSay(c, msg) {
  return push(el('div', 'crewmsg',
    `<span class="crewmsg__avatar"><img src="${c.gif}" alt=""></span>
     <span><strong>${c.name}</strong>${msg}</span>`));
}

// Planner takes the floor while everyone else stands by.
async function screenPlanningStage() {
  const st = el('div', 'planning');
  st.id = 'planning';
  st.innerHTML = `
    <div class="planning__card">
      <span class="planning__halo"></span>
      <img class="planning__cat" src="assets/crew-planner.webp" alt="">
      <div class="planning__body">
        <p class="planning__who">Planner Wana</p>
        <p class="planning__what">Writing Game Plan <b>1.0</b><span class="dots"><i></i><i></i><i></i></span></p>
        <ul class="planning__lines">
          <li>Core loop · drive, outrun, collect</li>
          <li>Scene · one night-time block grid</li>
          <li>Art direction · three palettes</li>
          <li>Dev stages · code, art, playtest, launch</li>
        </ul>
        <div class="planning__bar"><i></i></div>
      </div>
    </div>`;
  setTimeout(() => st.querySelectorAll('.planning__lines li').forEach((li, i) =>
    setTimeout(() => li.classList.add('is-in'), 320 + i * 520)), 0);
  document.getElementById('stage').appendChild(st);
  setMember('planner', 'working', 'planning');
  const think = push(el('div', 'thinking',
    '<p>Give me a moment — I\'m laying out the whole build.</p><span class="spinner"></span>'));
  await wait(3200);
  think.remove();
  st.remove();
  setMember('planner', 'done', 'plan ready');
  screenPlan();
}

async function screenBuild() {
  busy = true;
  setSend('busy');
  clearStart();
  log.innerHTML = '';
  perch.style.opacity = '0';
  switchEl.classList.add('is-on');
  awaitingReview = null;

  push(el('div', 'msg msg--user', BUILD_PROMPT));
  const build = mountBuild();
  const PHASE = window.__fast ? 400 : 2600;

  for (let i = 0; i < CREW.length; i++) {
    const c = CREW[i];
    setAgent(c.key, 'working', c.working + '…');
    setStatus(c.status, false);
    input.placeholder = 'Click Stop to cancel…';

    readLine(c.lines[0]);
    if (c.key === 'art') setTimeout(() => build.classList.add('is-art'), PHASE * 0.35);
    if (c.key === 'test') setTimeout(() => build.classList.add('is-test'), PHASE * 0.25);
    await wait(PHASE);
    readLine(c.lines[1]);
    await wait(400);

    // ── hand back to the user ──
    setAgent(c.key, 'review', 'Waiting for your check');
    setStatus(c.ready + ' — your call', false);
    setSend(input.value.trim() ? 'send' : 'disabled');
    await review(c);
    setSend('busy');
    setAgent(c.key, 'done', c.ready);
  }

  setStatus('Your first playable is ready 🎉', true);
  document.getElementById('mini-try').classList.add('is-shown');
  readLine('First playable ready ✓');
  plannerSay("That's version 1 — give it a drive.");
  input.placeholder = 'Tell Wana what to change…';
  setSend(input.value.trim() ? 'send' : 'disabled');
  busy = false;
}

// Blocks until the user says continue. Free text is treated as a change request:
// the agent does a revision pass and asks again.
function review(c, again) {
  return new Promise((resolve) => {
    // the Wana who did the work is the one who asks about it
    const ask = agentSay(c, again ? c.again : c.review);
    const chip = push(el('div', 'replies',
      '<button class="reply reply--go">Looks good — continue</button>'));
    input.placeholder = 'Tell Wana what to change, or say “go”…';

    const finish = (note) => {
      awaitingReview = null;
      chip.remove();
      push(el('div', 'msg msg--user', note || 'Looks good — continue'));
      resolve();
    };
    chip.querySelector('button').onclick = () => finish();

    awaitingReview = {
      agent: c,
      go: finish,
      change: async (note) => {
        awaitingReview = null;
        chip.remove();
        push(el('div', 'msg msg--user', note));
        setAgent(c.key, 'working', c.revising + '…');
        setStatus(c.revising + '…', false);
        input.placeholder = 'Click Stop to cancel…';
        await wait(500);
        agentSay(c, `On it — ${note.replace(/[.!]$/, '')}.`);
        await wait(window.__fast ? 300 : 1600);
        readLine(`${c.name}: updated ✓`);
        setAgent(c.key, 'review', 'Waiting for your check');
        setStatus(c.ready + ' — your call', false);
        await wait(300);
        review(c, true).then(resolve);   // ask again with the fresh version
      },
    };
  });
}

function tryDemo() {
  const mp = document.getElementById('miniplan');
  if (mp) mp.classList.add('is-hidden');
  const st = document.getElementById('build-status');
  if (st) st.classList.add('is-hidden');
  const b = document.getElementById('build');
  if (b) b.classList.add('is-play');
  input.placeholder = 'Tell Wana what to change…';

  const recaps = CREW.map((c) => ({ gif: c.gif, name: c.name, text: c.recap }));
  recaps.push({
    gif: 'assets/wana-plan.gif', name: 'Planner Wana', planner: true,
    text: "Go give it a drive. Anything you want changed once you've played it, just say so — @ me and I'll rework the plan, or @ whoever owns that bit and they'll fix it directly.",
  });
  recaps.forEach((r, i) => setTimeout(() => {
    push(el('div', 'crewmsg' + (r.planner ? ' crewmsg--planner' : ''),
      `<span class="crewmsg__avatar"><img src="${r.gif}" alt=""></span>
       <span><strong>${r.name}</strong>${r.text}</span>`));
  }, 250 + i * (window.__fast ? 120 : 550)));
  setTimeout(mentionTip, 250 + recaps.length * (window.__fast ? 120 : 550) + 400);
}

// Jump straight to the finished build (director shortcut, no review gates).
function buildDone() {
  clearStart();
  log.innerHTML = '';
  perch.style.opacity = '0';
  switchEl.classList.add('is-on');
  awaitingReview = null;
  busy = false;
  push(el('div', 'msg msg--user', BUILD_PROMPT));
  const build = mountBuild();
  build.classList.add('is-art', 'is-test');
  CREW.forEach((c) => {
    setAgent(c.key, 'done', c.ready);
    readLine(c.lines[0]);
    readLine(c.lines[1]);
  });
  setStatus('Your first playable is ready 🎉', true);
  document.getElementById('mini-try').classList.add('is-shown');
  readLine('First playable ready ✓');
  return build;
}

function unmountBuild() {
  const b = document.getElementById('build');
  if (b) b.remove();
  input.placeholder = 'Ask, plan, build anything...';
}

// ── Composer input ────────────────────────────────────────────────
document.getElementById('send').onclick = () => {
  const v = input.value.trim();
  if (!v) return;
  input.value = '';
  setSend('disabled');
  if (parseMention(v)) { runMention(v); return; }
  if (awaitingReview) {
    if (GO_WORDS.test(v)) awaitingReview.go(v);
    else awaitingReview.change(v);
    return;
  }
  runConversation(v);
};
input.addEventListener('input', () => {
  if (!sendEl.classList.contains('is-busy')) setSend(input.value.trim() ? 'send' : 'disabled');
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('send').click(); }
});
document.getElementById('plannerbtn').onclick = () => {
  if (busy) return;
  switchEl.classList.toggle('is-on');
};

// ── Step map — no on-screen control, only #step1…#step7 deep links ─
const STEPS = [
  ['01 Start', () => { busy = false; screenStart(); }],
  ['02 Question', () => { busy = false; clearStart(); log.innerHTML = ''; runConversation(SEED); }],
  ['03 Pitch', () => {
    busy = false; clearStart(); log.innerHTML = '';
    switchEl.classList.remove('is-on');
    setPerch('think');
    push(el('div', 'msg msg--user', SEED));
    QUESTIONS.forEach((q, i) => {
      push(el('div', 'msg msg--agent', q.ask));
      const pick = q.options[0];
      push(el('div', 'msg msg--user', pick));
      push(el('div', 'msg msg--agent', q.ack[pick]));
    });
    screenPitch();
  }],
  ['04 Planning', () => { busy = false; clearStart(); log.innerHTML = ''; screenPlanning(null); }],
  ['05 Plan ready', () => {
    busy = false; clearStart(); log.innerHTML = '';
    switchEl.classList.add('is-on');
    setPerch('plan');
    push(el('div', 'joined', 'Crew assembled'));
    screenPlan();
  }],
  ['06 Crew builds', () => { clearStart(); screenBuild(); }],
  ['07 Try demo', () => { buildDone(); tryDemo(); }],
];

// ── Fit stage to viewport ─────────────────────────────────────────
function fit() {
  const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  stage.style.transform = `scale(${s})`;
  const m = -(1 - s) / 2;
  stage.style.margin = `${m * 1080}px ${m * 1920}px`;
}
window.addEventListener('resize', fit);
fit();

screenStart();

// ── Game Dev Plan document ────────────────────────────────────────
// Structure mirrors the real director plan payload; content is this demo's game.
const PLAN_DOC = {
  title: 'Getaway Drive',
  tagline: 'One driver, five cop cars, and the longest night in New York.',
  version: 'v1',
  overview: [
    ['Genre', '3D Driving / Chase'],
    ['Session', '3 min'],
    ['Complexity', 'M'],
    ['Budget', '320~560 credits · ~10 min'],
  ],
  verbs: ['drive', 'outrun', 'collect'],
  progression: 'You drive a compact night-time Manhattan grid while cop cars close in. Coins are scattered along the streets; grabbing them raises your score, and the cops learn your route as the run goes on. Escaping the district ends the run and shows your take.',
  winlose: 'Win: escape the district with the cops off your tail. Lose: they box you in before you clear the last block.',
  art: [
    { name: 'Neon Night City', key: 'neon_night', on: true,
      colors: ['#0D0D1A', '#FF2D78', '#00F5D4', '#FFE620', '#7B2FBE'],
      note: 'Dark city after midnight; neon storefronts and glowing coins on a deep indigo skybox.' },
    { name: 'Low-Poly Cartoon', key: 'lowpoly_cartoon', on: false,
      colors: ['#F7C948', '#E84855', '#3A86FF', '#2EC4B6', '#1B1B2F'],
      note: 'Chunky low-poly blocks and cars with flat cel-shading on a clean daylit sky.' },
    { name: 'Pastel Daylight', key: 'pastel_day', on: false,
      colors: ['#FAF3DD', '#C8E6C9', '#F48FB1', '#81D4FA', '#FFB74D'],
      note: 'Soft pastels, rounded assets and a warm golden-hour haze — light and approachable.' },
  ],
  scenes: [
    ['#0', 'Night Streets', 'The only scene — driveable block grid, coin pickups, cop AI, HUD and results overlay.', '—'],
  ],
  stages: [
    { key: 'dev', owner: 'Developer Wana', gif: 'assets/wana-dev.gif', label: 'Code',
      body: 'Arcade kinematic car on a compact night city grid, five pursuing cop cars that learn your route, coins along the streets, escape condition, results screen and restart. Full HUD — speed, timer, coins.',
      depends: 'No prerequisites, ready to start',
      accept: ['Car steers with a snappy arcade feel on city roads',
               'Coins increment the counter and play a pickup SFX',
               'Cops re-route toward you as the run goes on',
               'Clearing the district shows WIN; getting boxed in shows FAIL'] },
    { key: 'art', owner: 'Artist Wana', gif: 'assets/wana-artist.gif', label: 'Art',
      body: 'Replace the blockout with the chosen palette: real car and cop models, lit storefronts, wet-road reflections, sky preset and lighting grade. Readability pass so coins stay visible at speed.',
      depends: 'code → art',
      accept: ['The grid reads as a recognisable night Manhattan block',
               'Player and cop cars are proper models, not boxes',
               'Coins stay legible against neon at full speed',
               'Lighting and sky match the chosen palette'] },
    { key: 'test', owner: 'Tester Wana', gif: 'assets/wana-tester.gif', label: 'Playtest',
      body: 'Drive it start to finish. Check the chase stays tense without being unfair, and that a full run fits the three-minute session.',
      depends: 'art → playtest',
      accept: ['A full run completes inside 3 minutes',
               'The chase is escapable but never trivial',
               'Start → chase → escape holds up across five runs'] },
  ],
  risks: [
    ['Cop pursuit that "learns your route" can turn unfair fast', 'Cap how much they adapt per lap and always leave one open exit'],
    ['Coins can land inside geometry on a dense grid', 'Spawn along the road centreline from sampled waypoints instead of at random'],
  ],
  degrade: ['Drop from five cop cars to three if the chase costs too much budget',
            'Reuse catalog street props if generated ones read poorly at speed'],
};

function planDoc() {
  const d = PLAN_DOC;
  const wrap = el('div', 'doc');
  wrap.id = 'plan-doc';
  wrap.innerHTML = `
    <button class="doc__close" id="doc-close" aria-label="Close">✕</button>
    <div class="doc__scroll">
      <header class="doc__hero">
        <figure class="keyart">
          <img src="assets/game-cover.jpg" alt="">
          <figcaption>
            <span class="keyart__tag">Where it can get to</span>
            Keep building and this is the game at the end of the road.
          </figcaption>
          <span class="keyart__cue">Scroll for the full plan<i>⌄</i></span>
        </figure>
        <div class="firstcut">
          <figure class="firstcut__shot">
            <img src="assets/card-a.jpg" alt="">
          </figure>
          <div class="firstcut__copy">
            <span class="firstcut__tag">Version 1.0 · what this plan builds</span>
            <p>Ten minutes gets you a playable first cut — the loop works, the streets
               drive, the coins count. Everything after that is polish passes.</p>
          </div>
        </div>
        <div class="doc__title">
          <h1>${d.title}<span class="doc__ver">${d.version}</span></h1>
          <p>${d.tagline}</p>
        </div>
        <div class="stats">
          ${d.overview.map(([k, v]) => `<div class="stat"><span class="stat__k">${k}</span><span class="stat__v">${v}</span></div>`).join('')}
        </div>
      </header>

      <section class="doc__sec">
        <h2>Core loop</h2>
        <div class="verbs">${d.verbs.map((v) => `<span class="verb">${v}</span>`).join('')}</div>
        <p class="doc__p">${d.progression}</p>
        <p class="doc__p doc__p--rule">${d.winlose}</p>
      </section>

      <section class="doc__sec">
        <h2>Art direction</h2>
        <div class="styles">
          ${d.art.map((a) => `
            <div class="style${a.on ? ' is-on' : ''}">
              <div class="style__swatches">${a.colors.map((c) => `<i style="background:${c}"></i>`).join('')}</div>
              <div class="style__meta">
                <span class="style__name">${a.name}${a.on ? '<em>Selected</em>' : ''}</span>
                <span class="style__note">${a.note}</span>
              </div>
            </div>`).join('')}
        </div>
      </section>

      <section class="doc__sec">
        <h2>Dev stages</h2>
        <div class="stages">
          ${d.stages.map((s, i) => `
            <article class="stage">
              <div class="stage__head">
                <span class="stage__face"><img src="${s.gif}" alt=""></span>
                <span class="stage__who"><b>${s.owner}</b><em>${s.label} · ${s.depends}</em></span>
                <span class="stage__n">${i + 1}</span>
              </div>
              <p class="doc__p">${s.body}</p>
              <ul class="accept">${s.accept.map((a) => `<li>${a}</li>`).join('')}</ul>
            </article>`).join('')}
        </div>
      </section>

      <section class="doc__sec">
        <h2>Scenes</h2>
        <table class="grid">
          <thead><tr><th>#</th><th>Scene</th><th>Purpose</th><th>Depends on</th></tr></thead>
          <tbody>${d.scenes.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </section>

      <section class="doc__sec">
        <h2>Risks</h2>
        <div class="risks">
          ${d.risks.map(([r, m]) => `<div class="risk"><span class="risk__r">${r}</span><span class="risk__m">${m}</span></div>`).join('')}
        </div>
        <h3 class="doc__h3">If it runs long</h3>
        <ul class="accept accept--plain">${d.degrade.map((x) => `<li>${x}</li>`).join('')}</ul>
      </section>
    </div>
  `;
  const bar = el('div', 'doc__bar');
  bar.id = 'doc-bar';
  wrap.appendChild(bar);

  const stage = document.getElementById('stage');
  stage.appendChild(wrap);
  stage.classList.add('has-overlay');
  paintDocBar();
  requestAnimationFrame(() => wrap.classList.add('is-on'));
  const close = () => {
    wrap.classList.remove('is-on');
    stage.classList.remove('has-overlay');
    setTimeout(() => wrap.remove(), 320);
  };
  wrap.querySelector('#doc-close').onclick = close;
  return wrap;
}

// The plan is always free to read. What it costs is stated where the
// decision is made, so nobody gets surprised one click later.
function paintDocBar() {
  const bar = document.getElementById('doc-bar');
  if (!bar) return;
  bar.classList.toggle('is-locked', trial.spent);
  bar.innerHTML = trial.spent
    ? `<span class="doc__barnote doc__barnote--lock">
         <i class="lockdot"></i>Your free run is used — building this plan needs Pro.
       </span>
       <span class="doc__baracts">
         <button class="btn-quiet" id="doc-change">I want to change something</button>
         <button class="btn-brand" id="doc-approve">Upgrade to build</button>
       </span>`
    : `<span class="doc__barnote">Read the plan — you approve before anything gets built.</span>
       <span class="doc__baracts">
         <button class="btn-quiet" id="doc-change">I want to change something</button>
         <button class="btn-brand" id="doc-approve">Approve &amp; build</button>
       </span>`;
  const wrap = document.getElementById('plan-doc');
  const close = () => {
    wrap.classList.remove('is-on');
    document.getElementById('stage').classList.remove('has-overlay');
    setTimeout(() => wrap.remove(), 320);
  };
  bar.querySelector('#doc-change').onclick = close;
  bar.querySelector('#doc-approve').onclick = () => { close(); startBuild(); };
}

function openPlanDoc() {
  if (document.getElementById('plan-doc')) return;
  planDoc();
}

// ── Desert dusk — what @Artist swaps the world to ─────────────────
function dune(i, side, p) {
  const w = 260 + rnd(i) * 340 + p * 620;
  const h = 70 + rnd(i + 11) * 90 + p * 260;
  const base = depthY(p);
  const edge = ROAD_CX + (side ? 1 : -1) * halfW(p);
  const x = side ? edge - 40 + rnd(i + 3) * 40 : edge + 40 - w - rnd(i + 3) * 40;
  const shade = side ? '#6E3C22' : '#8A4E2C';
  return `<path d="M${x.toFixed(0)} ${base.toFixed(0)}
    q${(w * 0.28).toFixed(0)} ${(-h).toFixed(0)} ${(w * 0.55).toFixed(0)} ${(-h * 0.72).toFixed(0)}
    q${(w * 0.3).toFixed(0)} ${(h * 0.3).toFixed(0)} ${(w * 0.45).toFixed(0)} ${(h * 0.72).toFixed(0)} Z"
    fill="${shade}" opacity="${(0.75 + p * 0.25).toFixed(2)}"/>`;
}
function cactus(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-9" y="-96" width="18" height="96" rx="9" fill="#2F5D42"/>
    <rect x="-34" y="-74" width="14" height="44" rx="7" fill="#2F5D42"/>
    <rect x="-34" y="-74" width="14" height="14" rx="7" fill="#2F5D42"/>
    <rect x="20" y="-84" width="14" height="52" rx="7" fill="#2F5D42"/>
    <rect x="20" y="-84" width="14" height="14" rx="7" fill="#2F5D42"/>
    <ellipse cx="0" cy="4" rx="26" ry="6" fill="#000" opacity=".28"/>
  </g>`;
}
function dsDefs() { return `
  <defs>
    <linearGradient id="dsSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#160C30"/><stop offset=".4" stop-color="#5E2350"/>
      <stop offset=".74" stop-color="#B8452A"/><stop offset="1" stop-color="#D98443"/>
    </linearGradient>
    <linearGradient id="dsRoad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4A3122"/><stop offset="1" stop-color="#1C120D"/>
    </linearGradient>
    <radialGradient id="dsSun"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".9"/>
      <stop offset="1" stop-color="#FFB35C" stop-opacity="0"/></radialGradient>
    <radialGradient id="dsCoinGlow"><stop offset="0" stop-color="#FFC83D" stop-opacity=".85"/>
      <stop offset="1" stop-color="#FFC83D" stop-opacity="0"/></radialGradient>
    <radialGradient id="dsTail"><stop offset="0" stop-color="#FF2E4D" stop-opacity=".95"/>
      <stop offset="1" stop-color="#FF2E4D" stop-opacity="0"/></radialGradient>
  </defs>`; }
function DS_SVG(inner) {
  return `<svg viewBox="0 0 1090 992" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    ${dsDefs()}${inner}</svg>`;
}

// 1 · background
function desertSky() {
  return DS_SVG(`
    <rect width="1090" height="992" fill="url(#dsSky)"/>
    <rect x="0" y="470" width="1090" height="522" fill="#9C5F35"/>`);
}
// 2 · light
function desertLight() {
  return DS_SVG(`
    <circle cx="520" cy="470" r="170" fill="url(#dsSun)"/>
    <circle cx="520" cy="456" r="46" fill="#FFD98A"/>`);
}
// 3 · models
function desertTerrain() {
  const dunes = [0.03, 0.1, 0.2, 0.34, 0.52, 0.76]
    .map((p, i) => dune(i * 2, 0, p) + dune(i * 2 + 1, 1, p)).join('');
  const cacti = [[0.14, 0], [0.3, 1], [0.58, 0], [0.82, 1]].map(([p, side], i) => {
    const y = depthY(p), e = halfW(p);
    const x = ROAD_CX + (side ? 1 : -1) * (e + 40 + rnd(i) * 90);
    return cactus(x.toFixed(0), y.toFixed(0), (0.35 + p * 1.6).toFixed(2));
  }).join('');
  return DS_SVG(dunes + cacti);
}
// 4 · road, props and the cars back on it
function desertRoad() {
  const dashes = [0.04, 0.12, 0.23, 0.37, 0.55, 0.78].map((p) => {
    const y = depthY(p), w = 7 + 30 * p, h = 16 + 78 * p;
    return `<rect x="${(ROAD_CX - w / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}"
      height="${h.toFixed(1)}" rx="${(w / 3).toFixed(1)}" fill="#FFF3D6" opacity="${(0.5 + p * 0.4).toFixed(2)}"/>`;
  }).join('');
  const coins = [0.1, 0.22, 0.37, 0.56].map((p) => {
    const y = depthY(p), sc = 0.5 + 2.4 * p, x = ROAD_CX + halfW(p) * 0.42;
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(2)})">
      <circle r="16" fill="url(#dsCoinGlow)"/><ellipse rx="8" ry="9.5" fill="#FFC83D"/>
      <ellipse rx="3" ry="8" fill="#FFE9A8"/></g>`;
  }).join('');
  const dust = Array.from({ length: 26 }, (_, i) => {
    const x = rnd(i) * 1200 - 60, y = 470 + rnd(i + 5) * 520;
    return `<circle class="gd-dust" style="animation-delay:${(-rnd(i + 2) * 6).toFixed(2)}s"
      cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1.5 + rnd(i + 7) * 3).toFixed(1)}"
      fill="#FFE3B0" opacity=".35"/>`;
  }).join('');
  return DS_SVG(`
    <path d="M400 470 L640 470 L1185 992 L-145 992 Z" fill="url(#dsRoad)"/>
    <path d="M396 470 L400 470 L-145 992 L-172 992 Z" fill="#C08A55" opacity=".9"/>
    <path d="M640 470 L644 470 L1212 992 L1185 992 Z" fill="#C08A55" opacity=".9"/>
    ${dashes}${coins}
    <g class="gd-cop">
      <ellipse cx="0" cy="46" rx="66" ry="10" fill="#000" opacity=".4"/>
      <rect x="-58" y="-16" width="116" height="52" rx="12" fill="#241A16"/>
      <rect x="-40" y="-40" width="80" height="30" rx="9" fill="#2E211B"/>
      <rect x="-26" y="-52" width="52" height="12" rx="5" fill="#141420"/>
      <rect class="gd-flash-b" x="-26" y="-52" width="24" height="12" rx="5" fill="#3B82F6"/>
      <rect class="gd-flash-r" x="2" y="-52" width="24" height="12" rx="5" fill="#EF4444"/>
    </g>
    <g class="gd-player">
      <ellipse cx="0" cy="92" rx="128" ry="18" fill="#000" opacity=".4"/>
      <ellipse cx="-92" cy="24" rx="70" ry="46" fill="url(#dsTail)" opacity=".5"/>
      <ellipse cx="92" cy="24" rx="70" ry="46" fill="url(#dsTail)" opacity=".5"/>
      <rect x="-118" y="-24" width="236" height="104" rx="22" fill="#1D1712"/>
      <rect x="-86" y="-74" width="172" height="60" rx="16" fill="#2A211A"/>
      <rect x="-72" y="-64" width="144" height="38" rx="10" fill="#5A4433" opacity=".8"/>
      <rect x="-104" y="8" width="72" height="16" rx="8" fill="#FF2E4D"/>
      <rect x="32" y="8" width="72" height="16" rx="8" fill="#FF2E4D"/>
      <rect x="-30" y="44" width="60" height="20" rx="5" fill="#F2C94C"/>
      <rect x="-134" y="46" width="26" height="34" rx="8" fill="#0B0A10"/>
      <rect x="108" y="46" width="26" height="34" rx="8" fill="#0B0A10"/>
    </g>
    ${dust}`);
}

// ── @mentions ─────────────────────────────────────────────────────
const MENTIONS = { artist: 'art', developer: 'dev', dev: 'dev', tester: 'test' };

function parseMention(text) {
  const m = text.match(/^@(\w+)\s*(.*)$/);
  if (!m) return null;
  const key = MENTIONS[m[1].toLowerCase()];
  if (!key) return null;
  return { agent: CREW.find((c) => c.key === key), ask: m[2].trim() };
}

// Sending an agent in directly: they take the note, do the pass, and report back.
async function runMention(text) {
  const hit = parseMention(text);
  if (!hit) return false;
  const c = hit.agent;
  busy = true;
  setSend('busy');
  push(el('div', 'msg msg--user', text));
  const build = document.getElementById('build');

  const mp = document.getElementById('miniplan');
  if (mp) mp.classList.remove('is-hidden');
  const st = document.getElementById('build-status');
  if (st) st.classList.remove('is-hidden');

  await wait(500);
  setAgent(c.key, 'working', hit.ask || 'On it…');
  setStatus(`${c.name} is on it…`, false);
  agentSay(c, `On it — ${hit.ask || 'taking a look'}.`);
  await wait(900);

  const wantsDesert = /desert|沙漠|dune/i.test(hit.ask);
  const scene = document.getElementById('ed-scene');
  if (c.key === 'art' && wantsDesert && build) {
    const STEPS_ART = [
      { label: 'Swap the sky — night → desert dusk', cls: 'ds-sky',     line: 'Sky swapped: desert dusk ✓' },
      { label: 'Re-grade the light — low warm sun',  cls: 'ds-light',   line: 'Lighting re-graded: low sun ✓' },
      { label: 'Build the terrain — dunes & cacti',  cls: 'ds-terrain', line: 'Terrain built: dunes, cacti ✓' },
      { label: 'Repaint the road & props',           cls: 'ds-road',    line: 'Road repainted: sand and dust ✓' },
    ];
    openSubtasks('Artist Wana · reworking the world', STEPS_ART.map((x) => x.label));
    // the Studio locks up for a one-Wana rework exactly as it does for a full build
    showTab('studio');
    setGenerating(true, {
      label: 'Artist Wana is reworking the world — editing is locked',
      cards: [{
        key: 'artist', name: 'Artist Wana', stage: 'Rework · Desert dusk',
        steps: STEPS_ART.map((x) => x.label),
      }],
    });
    const soloCard = document.getElementById('mini-artist');
    const soloDoing = document.getElementById('mini-artist-doing');
    if (soloCard) soloCard.className = 'card is-working';
    for (let i = 0; i < STEPS_ART.length; i++) {
      setSubtask(i, 'running');
      deckStep('artist', i, 'running');
      if (soloDoing) soloDoing.textContent = STEPS_ART[i].label;
      setProgress('artist', Math.round((i / STEPS_ART.length) * 100));
      setStatus(STEPS_ART[i].label + '…', false);
      await wait(1100);
      build.classList.add('is-' + STEPS_ART[i].cls);
      if (scene) scene.classList.add('is-desert');   // the editor changes with the game
      await wait(1300);
      setSubtask(i, 'done');
      deckStep('artist', i, 'done');
      readLine(STEPS_ART[i].line);
    }
    setProgress('artist', 100);
    if (soloCard) soloCard.className = 'card is-done';
    if (soloDoing) soloDoing.textContent = 'Desert dusk is in';
    await wait(900);
    setGenerating(false);
    closeSubtasks();
    showTab('preview');
    setStatus('Desert dusk — your call', false);
    setAgent(c.key, 'done', 'Desert dusk is in');
    agentSay(c, 'Swapped New York for a desert at dusk — sky, light, terrain and road all redone. The chase reads better against the open sand.');
  } else {
    readLine(`${c.name}: ${hit.ask || 'pass'} ✓`);
    setAgent(c.key, 'done', hit.ask || 'Updated');
    agentSay(c, 'Done — take a look.');
  }
  input.placeholder = 'Tell Wana what to change…';
  setSend('disabled');
  busy = false;
  return true;
}

// A tip is only useful next to the thing it unlocks.
function mentionTip() {
  const tip = push(el('div', 'tip',
    `<span class="tip__k">@</span>
     <span>Send a Wana in directly — type <b>@Artist</b>, <b>@Developer</b> or <b>@Tester</b>.</span>`));
  const chips = push(el('div', 'replies'));
  const b = el('button', 'reply reply--go', '@Artist make it a desert instead');
  b.onclick = () => { chips.remove(); tip.remove(); runMention('@Artist make it a desert instead'); };
  chips.appendChild(b);
}

// ── Free run state ────────────────────────────────────────────────
// One free crew run per account; it only spends once something ships.
const trial = {
  spent: QUERY.includes('spent'),
  toggle() { this.spent = !this.spent; paintTrial(); },
};
function paintTrial() {
  const el2 = document.getElementById('trial-flag');
  if (el2) {
    el2.classList.toggle('is-spent', trial.spent);
    el2.querySelector('b').textContent = trial.spent ? 'used' : 'available';
    paintDocBar();
    el2.title = trial.spent
      ? 'Demo control — free run is spent, so Approve & build hits the paywall'
      : 'Demo control — free run is available, so Approve & build goes straight to work';
  }
}

// ── Pricing ───────────────────────────────────────────────────────
const TIERS = [
  { key: 'free', name: 'FREE', price: '$0', per: 'forever', kicker: 'For trying Wanaka and shipping your first game.',
    note: 'No credit card required', credits: ['60', 'credits/ day'], cta: 'Current Plan', ctaKind: 'now',
    feats: ['Chat with agent in Wanaka 1.0 Lite', 'Generate image × 2', 'Generate 3D model × 1'] },
  { key: 'pro', name: 'PRO', price: '$19', per: '/month', kicker: 'For creators shipping real games regularly.',
    note: 'Billed monthly', credits: ['2,000', 'credits/ month'], cta: '⚡ Upgrade to Pro', ctaKind: 'pro',
    badge: 'Most popular',
    feats: ['Chat with agent in Wanaka 1.0 Pro', 'Generate image × 100', 'Generate 3D model × 40',
            'No watermark on exports', 'Exclusive feedback channel', 'More game exposure opportunities'] },
  { key: 'max', name: 'MAX', price: '$49', per: '/month', kicker: 'For pros and small teams going commercial.',
    note: 'Billed monthly', credits: ['6,000', 'credits/ month'], cta: '♛ Upgrade to Max', ctaKind: 'max',
    badge: 'Most Powerful',
    feats: ['Chat with agent in Wanaka 1.0 Pro', 'Generate image × 500', 'Generate 3D model × 150',
            'No watermark on exports', 'Exclusive feedback channel', 'More game exposure opportunities',
            'Opportunities to preview new features'] },
];

function openPaywall(onUpgrade) {
  if (document.getElementById('paywall')) return;
  const w = el('div', 'pay');
  w.id = 'paywall';
  w.innerHTML = `
    <div class="pay__bar">
      <button class="pay__back">← Back</button>
      <button class="pay__x" aria-label="Close">✕</button>
    </div>
    <div class="pay__scroll">
      <p class="pay__eyebrow">PRICING</p>
      <h1 class="pay__h">Plans that grow with your imagination</h1>
      <p class="pay__sub">Start free and make your first game today. Upgrade when your ideas get bigger.<br>
        Every plan runs on Wanaka Credits that power AI building and 3D generation.</p>
      <div class="cycle">
        <button class="cycle__b is-on">Monthly</button>
        <button class="cycle__b">Yearly</button>
        <span class="cycle__tag">2 months free</span>
      </div>
      <div class="tiers">
        ${TIERS.map((t) => `
          <div class="tier tier--${t.key}">
            ${t.badge ? `<span class="tier__badge">${t.badge}</span>` : ''}
            <h2 class="tier__name">${t.name}</h2>
            <p class="tier__kicker">${t.kicker}</p>
            <p class="tier__price"><b>${t.price}</b><span>${t.per}</span></p>
            <p class="tier__note">${t.note}</p>
            <p class="tier__credits"><b>${t.credits[0]}</b> ${t.credits[1]}</p>
            <button class="tier__cta tier__cta--${t.ctaKind}">${t.cta}</button>
            <ul class="tier__feats">${t.feats.map((f) => `<li>${f}</li>`).join('')}</ul>
          </div>`).join('')}
      </div>
    </div>
  `;
  const veil = el('div', 'pay__veil');
  veil.id = 'pay-veil';
  const stage = document.getElementById('stage');
  stage.appendChild(veil);
  stage.appendChild(w);
  stage.classList.add('has-overlay');
  requestAnimationFrame(() => { veil.classList.add('is-on'); w.classList.add('is-on'); });
  const close = () => {
    w.classList.remove('is-on'); veil.classList.remove('is-on');
    stage.classList.remove('has-overlay');
    setTimeout(() => { w.remove(); veil.remove(); }, 280);
  };
  w.querySelector('.pay__x').onclick = close;
  w.querySelector('.pay__back').onclick = close;
  veil.onclick = close;
  w.querySelectorAll('.tier__cta--pro, .tier__cta--max').forEach((b) => {
    b.onclick = () => { close(); trial.spent = false; paintTrial(); onUpgrade && onUpgrade(); };
  });
}



// ── The way in: wanaka.app → sign in → Studio ─────────────────────
const SITE = {
  nav: ['How it works', 'Templates', 'Community', 'Pricing'],
  headline: 'Build a playable 3D game with AI.',
  sub: 'Describe it, build it with AI, then share a browser link — no code required.',
  placeholder: 'Cozy city builder',
  seed: 'build a racing game in NYC for me',
  chips: ['Cozy city builder', 'Multiplayer obstacle course', 'Space survival adventure'],
};

function screenSite() {
  const old = document.getElementById('site');
  if (old) old.remove();
  const site = el('div', 'site');
  site.id = 'site';
  site.innerHTML = `
    <img class="site__art" src="assets/site-hero.jpg" alt="">
    <header class="site__header">
      <img class="site__logo" src="assets/logo.png" alt="Wanaka">
      <nav class="site__nav">${SITE.nav.map((n) => `<a href="#" onclick="return false">${n}</a>`).join('')}</nav>
      <span class="site__auth">
        <a class="site__signin" href="#" onclick="return false">Sign in</a>
        <button class="site__start">Start free</button>
      </span>
    </header>
    <div class="site__hero">
      <h1>${SITE.headline}</h1>
      <p>${SITE.sub}</p>
      <div class="siteinput">
        <textarea id="site-input" placeholder="${SITE.placeholder}">${SITE.seed}</textarea>
        <div class="siteinput__row">
          <button class="siteinput__plus" aria-label="Attach">+</button>
          <button class="siteinput__go" id="site-create">↑&nbsp; Create</button>
        </div>
      </div>
      <div class="sitechips">${SITE.chips.map((c) => `<button class="sitechip">${c}</button>`).join('')}</div>
    </div>
  `;
  document.getElementById('stage').appendChild(site);
  site.querySelectorAll('.sitechip').forEach((b) => {
    b.onclick = () => { document.getElementById('site-input').value = b.textContent; };
  });
  const go = () => {
    const ask = document.getElementById('site-input').value.trim() || SITE.seed;
    site.classList.add('is-leaving');
    setTimeout(() => site.remove(), 420);
    screenLogin(ask);
  };
  site.querySelector('#site-create').onclick = go;
  site.querySelector('.site__start').onclick = go;
  return site;
}

// The sign-in card floats over the Studio, so you can already see where you landed.
function screenLogin(ask) {
  const old = document.getElementById('login');
  if (old) old.remove();
  const w = el('div', 'login');
  w.id = 'login';
  w.innerHTML = `
    <div class="login__veil"></div>
    <div class="login__card">
      <img class="login__logo" src="assets/logo.png" alt="Wanaka">
      <h2>Welcome to Wanaka studio</h2>
      <p class="login__sub">Log in or sign up to continue</p>
      <button class="login__google">
        <span class="login__g">G</span> Continue with Google
      </button>
      <div class="login__or"><span>OR</span></div>
      <label class="login__label">Email</label>
      <input class="login__field" type="email" value="bella@wanaka.app" readonly>
      <label class="login__label">Password</label>
      <input class="login__field" type="password" value="••••••••••" readonly>
      <a class="login__forgot" href="#" onclick="return false">Forgot password?</a>
      <button class="login__submit" id="login-go">Log in</button>
      <p class="login__signup">Don’t have an account? <a href="#" onclick="return false">Sign up Now</a></p>
    </div>
  `;
  document.getElementById('stage').appendChild(w);
  const enter = () => {
    w.classList.add('is-leaving');
    setTimeout(() => w.remove(), 320);
    startOnboarding(ask);
  };
  w.querySelector('#login-go').onclick = enter;
  w.querySelector('.login__google').onclick = enter;
  return w;
}

// The brief arrives with the user; Wanaka walks them round before anyone works.
function startOnboarding(ask) {
  mountStudio();
  clearStart();
  log.innerHTML = '';
  perch.style.opacity = '0';
  push(el('div', 'msg msg--user', ask));
  setSend('disabled');
  input.placeholder = 'Ask, plan, build anything...';
  startTour(ask, () => afterTour(ask));
}

// Tour over: the crew is on the floor, Crew mode is on, Planner takes the brief.
async function afterTour(ask) {
  switchEl.classList.add('is-on');
  const btn = document.getElementById('plannerbtn');
  btn.classList.add('is-flash');
  setTimeout(() => btn.classList.remove('is-flash'), 1400);
  const chip = document.querySelector('.composer-head span');
  if (chip) chip.textContent = 'Wanaka 1.0 · Crew';
  unmountCrewStage();          // they showed their faces; now the stage clears

  push(el('div', 'joined', 'Crew assembled'));
  await wait(600);
  agentSay({ name: 'Planner Wana', gif: 'assets/crew-planner.webp' },
    "Right — a racing game in New York. That's enough for me to work with. Two quick things and I'll write the plan.");
  await wait(500);
  const q = { ask: 'Racing against rivals, or the clock?', options: ['Against rivals', 'Time trial, just me'] };
  push(el('div', 'msg msg--agent', q.ask));
  const pick = await askOptions(q.options);
  push(el('div', 'msg msg--user', pick));
  await wait(500);
  push(el('div', 'msg msg--agent', 'Night or day in the city?'));
  const when = await askOptions(['Night — neon and rain', 'Golden hour']);
  push(el('div', 'msg msg--user', when));
  await wait(600);
  screenPlanningStage();
}

// ── The crew on stage ─────────────────────────────────────────────
const CREW6 = [
  { key: 'planner',   name: 'Planner',   role: 'Plans the build' },
  { key: 'developer', name: 'Developer', role: 'Logic & code' },
  { key: 'artist',    name: 'Artist',    role: 'Look & feel' },
  { key: 'audio',     name: 'Audio',     role: 'Music & SFX' },
  { key: 'tester',    name: 'Tester',    role: 'Playtest' },
  { key: 'marketing', name: 'Marketing', role: 'Launch & reach' },
];

function mountCrewStage(only) {
  const existing = document.getElementById('crewstage');
  if (existing) existing.remove();
  const list = only ? CREW6.filter((c) => only.includes(c.key)) : CREW6;
  const s = el('div', 'crewstage');
  s.id = 'crewstage';
  s.innerHTML = list.map((c) => `
    <figure class="member" id="mem-${c.key}">
      <img src="assets/crew-${c.key}.webp" alt="">
      <figcaption><b>${c.name}</b><em>${c.role}</em></figcaption>
      <span class="member__bar"><i class="member__fill"></i></span>
      <span class="member__state">waiting</span>
    </figure>`).join('');
  (document.getElementById('crewfloor') || document.getElementById('stage')).appendChild(s);
  return s;
}
function setMember(key, state, label) {
  const m = document.getElementById('mem-' + key);
  if (m) {
    m.className = 'member is-' + state;
    const s = m.querySelector('.member__state');
    if (s) s.textContent = label || state;
  }
  const col = document.getElementById('col-' + key);
  if (col) col.className = 'col is-' + state;
  const d = document.getElementById('doing-' + key);
  if (d) d.textContent = label || state;
  const md = document.getElementById(`mini-${key}-doing`);
  if (md) md.textContent = label || state;
  const mini = document.getElementById('mini-' + key);
  if (mini) {
    mini.className = 'card is-' + state;
    const deck = document.getElementById('ed-crew');
    if (deck && deck._front) {
      if (state === 'review') deck._front(key);
      else if (!document.querySelector('.card.is-review')) deck._release();
    }
  }
}
function unmountCrewStage() {
  const s = document.getElementById('crewstage');
  if (s) s.remove();
}

// ── Wanaka's tour ─────────────────────────────────────────────────
const TOUR = [
  { cat: 'hello', focus: null, at: 'centre',
    copy: "Hi Bella — welcome to Wanaka Game Studio. Ready to bring that idea in and finally be the one who makes the game? Let me show you around first." },
  { cat: 'idle', focus: 'chat', at: 'left',
    copy: "Tell me what you want right here. I've got a whole crew of cat engineers to plan it out and walk you from nothing to something you can play." },
  { cat: 'idle', focus: 'edit', at: 'right',
    copy: "This whole left side is your canvas — edit the scene, keep your assets in order, and play the build right here. The crew fills it in, and you can take the wheel any time." },
  { cat: 'idle', focus: null, at: 'aside', crew: true,
    copy: "Now come meet my crew. Every one of them is a specialist, and they'll be with you the whole way." },
];
const FOCUS_RECT = {
  chat: [1401, 8, 513, 1064],
  edit: [8, 8, 1379, 1064],
};

function startTour(ask, done) {
  const t = el('div', 'tour');
  t.id = 'tour';
  t.innerHTML = `
    <div class="tour__hole" id="tour-hole"></div>
    <img class="tour__wana" id="tour-wana" src="assets/wana-hello.webp" alt="">
    <div class="tour__bubble" id="tour-bubble">
      <p id="tour-copy"></p>
      <div class="tour__foot">
        <span class="tour__dots" id="tour-dots"></span>
        <button class="tour__next" id="tour-next">Next</button>
      </div>
    </div>
  `;
  document.getElementById('stage').appendChild(t);

  const hole = t.querySelector('#tour-hole');
  const wana = t.querySelector('#tour-wana');
  const copy = t.querySelector('#tour-copy');
  const dots = t.querySelector('#tour-dots');
  const next = t.querySelector('#tour-next');
  let i = 0;

  const paint = () => {
    const s = TOUR[i];
    copy.textContent = s.copy;
    wana.src = 'assets/wana-' + s.cat + '.webp';
    t.className = 'tour is-' + s.at + (s.focus ? ' has-focus' : '');
    if (s.focus) {
      const [x, y, w, h] = FOCUS_RECT[s.focus];
      hole.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    } else {
      hole.style.cssText = '';          // let the collapsed default take over again
    }
    if (s.crew) {
      mountCrewStage().classList.add('is-lit');   // the crew has to be visible to be met
      t.classList.add('is-meet');
    }
    dots.innerHTML = TOUR.map((_, k) => `<i class="${k === i ? 'is-on' : ''}"></i>`).join('');
    next.textContent = i === TOUR.length - 1 ? "Let's go" : 'Next';
  };
  next.onclick = () => {
    if (i < TOUR.length - 1) { i++; paint(); return; }
    t.classList.add('is-leaving');
    setTimeout(() => t.remove(), 420);
    done && done();
  };
  paint();
  return t;
}

// ── Everyone works at once ────────────────────────────────────────
// Different jobs take different lengths; a Wana that needs a decision stops
// and asks in chat while the rest keep going.
const JOBS = [
  { key: 'developer', name: 'Developer Wana', start: 0, tick: 3400,
    steps: ['Blocking out the streets', 'Wiring drive · outrun', 'Coin scoring + HUD', 'Escape condition'],
    checkAt: 2,
    check: "Core loop's in — drive, outrun, coin score. Should the cops learn your route, or stay dumb and fast?",
    options: ['Let them learn', 'Dumb and fast'],
    done: 'Core loop wired' },
  { key: 'artist', name: 'Artist Wana', start: 600, tick: 3200,
    steps: ['Sky & lighting', 'Buildings and road', 'Wet-road reflections', 'Neon pass'],
    checkAt: 1,
    check: "I've mocked the city two ways. Neon night, or golden hour?",
    options: ['Neon night', 'Golden hour'],
    done: 'Night NY dressed' },
  { key: 'audio', name: 'Audio Wana', start: 400, tick: 2900,
    steps: ['Engine loop', 'Pickup SFX', 'Siren layer', 'Night city bed'],
    done: 'Sound in' },
  { key: 'tester', name: 'Tester Wana', start: 3000, tick: 3600,
    steps: ['First drive', 'Chase balance', 'Full run start → escape'],
    done: 'Run holds up' },
  { key: 'marketing', name: 'Marketing Wana', start: 4200, tick: 3500,
    steps: ['Naming it', 'Cover art', 'Store blurb'],
    done: 'Getaway Drive · ready to share' },
];

function crewSay(job, msg, options) {
  const row = el('div', 'crewmsg');
  row.innerHTML = `<span class="crewmsg__avatar"><img src="assets/crew-${job.key}.webp" alt=""></span>
    <span><strong>${job.name}</strong>${msg}</span>`;
  return push(row);
}

function askAgent(job) {
  return new Promise((resolve) => {
    crewSay(job, job.check);
    const wrap = push(el('div', 'replies'));
    job.options.forEach((text, i) => {
      const b = el('button', 'reply' + (i === 0 ? ' reply--go' : ''), text);
      b.onclick = () => {
        wrap.remove();
        push(el('div', 'msg msg--user', text));
        resolve(text);
      };
      wrap.appendChild(b);
    });
    scrollDown();
  });
}

async function runJob(job, build) {
  const n = job.steps.length;
  await wait(job.start);
  for (let i = 0; i < n; i++) {
    setMember(job.key, 'working', job.steps[i]);
    setTask(job.key, i, 'running');
    setProgress(job.key, Math.round((i / n) * 100));
    await wait(job.tick);
    if (job.checkAt === i) {
      setMember(job.key, 'review', 'needs your call');
      setTask(job.key, i, 'review');
      setProgress(job.key, Math.round(((i + 1) / n) * 100));
      const pick = await askAgent(job);
      if (job.key === 'artist' && /golden/i.test(pick) && build) build.classList.add('is-golden');
      if (job.key === 'developer') job.twist = pick;
      setMember(job.key, 'working', job.steps[i]);
    }
    setTask(job.key, i, 'done');
  }
  setProgress(job.key, 100);
  setMember(job.key, 'done', job.done);
}

function setProgress(key, pct) {
  const bar = document.querySelector(`#mem-${key} .member__fill`);
  if (bar) bar.style.width = pct + '%';
  const f = document.getElementById('fill-' + key);
  if (f) f.style.width = pct + '%';
  const d2 = document.getElementById('deckfill-' + key);
  if (d2) d2.style.width = pct + '%';
}

async function screenBuildParallel() {
  busy = true;
  setSend('busy');
  clearStart();
  log.innerHTML = '';
  perch.style.opacity = '0';
  switchEl.classList.add('is-on');
  input.placeholder = 'Click Stop to cancel…';

  const first = !document.getElementById('studio')?.classList.contains('is-built');
  mountStudio();
  const build = mountBuild();
  build.classList.add('is-art');
  setGenerating(true);
  const sub = document.getElementById('crew-sub');
  if (sub) sub.textContent = "Five Wanas working at once. They'll stop and ask if they need a call.";
  JOBS.forEach((j) => { setMember(j.key, 'idle', 'waiting'); setProgress(j.key, 0); });
  paintOverall();
  // nothing to play yet on the first run, so take them to the work
  if (first) showTab('tasks');
  // the crew on the floor replaces the little side panel entirely
  const mp = document.getElementById('miniplan');
  if (mp) mp.remove();
  const bs = document.getElementById('build-status');
  if (bs) bs.remove();
  // the Tasks board carries the crew now — no second row of cats

  push(el('div', 'msg msg--user', BUILD_PROMPT));
  await wait(500);
  agentSay({ name: 'Planner Wana', gif: 'assets/crew-planner.webp' },
    "All five are on it at once. I'll only interrupt you when someone genuinely needs a call.");

  await Promise.all(JOBS.map((j) => runJob(j, build)));

  build.classList.add('is-test');
  const sub2 = document.getElementById('crew-sub');
  if (sub2) sub2.textContent = 'Version 1.0 shipped. Everything below is what each of them delivered.';
  await wait(900);
  setGenerating(false);
  markBuilt();
  await wait(400);
  const sum = el('div', 'summary');
  sum.innerHTML = `
    <div class="summary__head">Version 1.0 is built</div>
    ${JOBS.map((j) => `
      <div class="summary__row">
        <span class="summary__who"><img src="assets/crew-${j.key}.webp" alt="">${j.name.replace(' Wana', '')}</span>
        <span class="summary__what">${j.done}</span>
        <button class="summary__reply" data-k="${j.key}">Reply</button>
      </div>`).join('')}
  `;
  push(sum);
  sum.querySelectorAll('.summary__reply').forEach((b) => {
    b.onclick = () => {
      const j = JOBS.find((x) => x.key === b.dataset.k);
      input.value = '@' + j.key + ' ';
      input.focus();
      setSend('send');
    };
  });
  agentSay({ name: 'Planner Wana', gif: 'assets/crew-planner.webp' },
    'Give it a drive. Want any one of them to take another pass? Hit Reply next to their name, or @ them here.');
  input.placeholder = 'Tell a Wana what to change…';
  setSend('disabled');
  busy = false;
}




// ── Studio shell ──────────────────────────────────────────────────
// Five full-height views behind one tab bar. Nothing here is a screenshot.
const TABS = [
  { key: 'studio', label: 'Studio', icon: '◍' },
  { key: 'tasks',  label: 'Tasks',  icon: '☰' },
  { key: 'assets', label: 'Assets', icon: '▦' },
  { key: 'code',   label: 'Code',   icon: '‹›' },
];

const ASSETS_LIB = [
  { group: '3D Models', by: 'Artist', items: [
    ['Player car', 'ready', 'car'], ['Cop car ×5', 'ready', 'cop'], ['Block · brownstone', 'ready', 'block-a'],
    ['Block · storefront', 'ready', 'block-b'], ['Street props', 'building', 'props'], ['Coin pickup', 'ready', 'coin'] ] },
  { group: 'Materials & Sky', by: 'Artist', items: [
    ['Wet asphalt', 'ready', 'asphalt'], ['Neon signage', 'ready', 'neon'],
    ['Night sky preset', 'ready', 'sky'], ['Rain particles', 'building', 'props'] ] },
  { group: 'Audio', by: 'Audio', items: [
    ['Engine loop', 'ready', 'audio-a'], ['Coin pickup SFX', 'ready', 'audio-b'],
    ['Siren layer', 'ready', 'audio-c'], ['Night city bed', 'building', 'audio-d'] ] },
  { group: 'UI', by: 'Artist', items: [
    ['HUD · speed', 'ready', 'ui-a'], ['HUD · timer', 'ready', 'ui-b'], ['Results screen', 'queued', 'ui-c'] ] },
];

const CODE_TREE = ['game.config.ts', 'scenes/NightStreets.ts', 'systems/Drive.ts',
                   'systems/Pursuit.ts', 'systems/Pickups.ts', 'ui/Hud.ts'];
const CODE_LINES = [
  ['kw', 'export function'], ['fn', ' createPursuit'], ['pn', '(cops'], ['op', ': '], ['ty', 'Cop[]'], ['pn', ', player'], ['op', ': '], ['ty', 'Car'], ['pn', ') {'],
];

const EMPTY = {
  preview: ['▷', 'Nothing to play yet',
    'Tell Wana what you want to make. When the crew finishes a build, it lands here and you can drive it.'],
  assets: ['▦', 'No assets yet',
    'Every model, material and sound the crew makes for your game will show up here.'],
  code: ['‹›', 'No code yet',
    'Developer Wana writes the game logic. Once there is a build, the files open here.'],
  studio: ['◍', 'Empty scene',
    'This is your scene. The crew fills it in — and you can move anything they place.'],
};
function emptyState(key) {
  const [icon, title, body] = EMPTY[key];
  return `<div class="empty"><span class="empty__i">${icon}</span>
    <h3>${title}</h3><p>${body}</p></div>`;
}
// Flips every view from "nothing here" to the finished build.
// A playable build unlocks the Preview tab — it has nothing to show before that.
function markBuilt() {
  const s = document.getElementById('studio');
  if (!s) return;
  s.classList.add('is-built');
  const nav = document.getElementById('tabs');
  if (!nav.querySelector('[data-tab="preview"]')) {
    const b = el('button', 'tab tab--new', '<i>▷</i>Preview');
    b.dataset.tab = 'preview';
    b.onclick = () => showTab('preview');
    nav.insertBefore(b, nav.firstChild);
  }
  mountPreviewGame();
  wirePreview();
  showTab('preview');
}

// The plan has stages; each stage shows the Wanas executing it.
const STAGES = [
  { key: 'code',    n: '01', name: 'Code',     note: 'Make it playable',      crew: ['developer'] },
  { key: 'art',     name: 'Art & Sound', n: '02', note: 'Make it look and sound like something', crew: ['artist', 'audio'] },
  { key: 'test',    n: '03', name: 'Playtest', note: 'Make sure it is fun',   crew: ['tester'] },
  { key: 'launch',  n: '04', name: 'Launch',   note: 'Make it shareable',     crew: ['marketing'] },
];
function stageState(st) {
  const tasks = st.crew.flatMap((k) => {
    const j = JOBS.find((x) => x.key === k);
    return j ? j.steps.map((_, i) => document.getElementById(`task-${k}-${i}`)) : [];
  }).filter(Boolean);
  if (!tasks.length) return ['queued', 0];
  const done = tasks.filter((t) => t.classList.contains('is-done')).length;
  const live = tasks.some((t) => t.classList.contains('is-running') || t.classList.contains('is-review'));
  const pct = Math.round((done / tasks.length) * 100);
  return [done === tasks.length ? 'done' : (live || done ? 'active' : 'queued'), pct];
}
function paintStages() {
  STAGES.forEach((st) => {
    const [state, pct] = stageState(st);
    const chip = document.getElementById('stg-' + st.key);
    if (chip) chip.className = 'stage-chip is-' + state;
    const grp = document.getElementById('grp-' + st.key);
    if (grp) grp.className = 'grp is-' + state;
    const f = document.getElementById('stgfill-' + st.key);
    if (f) f.style.width = pct + '%';
    const p = document.getElementById('stgpct-' + st.key);
    if (p) p.textContent = pct + '%';
  });
}

function tasksView() {
  return `
    <div class="pane pane--tasks">
      <div class="pane__head pane__head--crew">
        <div>
          <h2>Tasks</h2>
          <p id="crew-sub">Game Plan 1.0 · queued. The crew starts once you approve it.</p>
        </div>
        <div class="overall">
          <div class="overall__bar"><i id="overall-fill"></i></div>
          <span class="overall__txt" id="overall-txt">0 of 18 done</span>
        </div>
      </div>
      <div class="stepper">
        ${STAGES.map((st) => `
          <div class="stage-chip is-queued" id="stg-${st.key}">
            <span class="stage-chip__n">${st.n}</span>
            <span class="stage-chip__t"><b>${st.name}</b><em>${st.note}</em></span>
            <span class="stage-chip__pct" id="stgpct-${st.key}">0%</span>
            <span class="stage-chip__bar"><i id="stgfill-${st.key}"></i></span>
          </div>`).join('')}
      </div>
      <div class="stages">
        ${STAGES.map((st) => `
          <section class="grp is-queued" id="grp-${st.key}">
            <header class="grp__head"><span class="grp__n">${st.n}</span><h3>${st.name}</h3></header>
            <div class="grp__cols">
              ${st.crew.map((k) => {
                const j = JOBS.find((x) => x.key === k);
                return `
                <div class="col is-idle" id="col-${k}">
                  <header class="col__head">
                    <span class="col__face"><img src="assets/crew-${k}.webp" alt=""></span>
                    <span class="col__who"><b>${j.name.replace(' Wana', '')}</b>
                      <em id="doing-${k}">waiting</em></span>
                  </header>
                  <div class="col__bar"><i class="col__fill" id="fill-${k}"></i></div>
                  <div class="col__tasks">
                    ${j.steps.map((t, i) => `
                      <div class="task" id="task-${k}-${i}">
                        <span class="task__dot"></span><span>${t}</span></div>`).join('')}
                  </div>
                </div>`; }).join('')}
            </div>
          </section>`).join('')}
      </div>
    </div>`;
}

// The Studio stays visible and keeps updating; it just stops taking edits.
function setGenerating(on, opts) {
  const o = opts || {};
  const ed = document.querySelector('.ed');
  const s = document.getElementById('studio');
  if (!ed || !s) return;
  ed.classList.toggle('is-locked', on);
  // the scene is worth watching while it fills, so it leaves its empty state early
  s.classList.toggle('is-generating', on);
  s.querySelector('.tab[data-tab="tasks"]').classList.toggle('is-live', on);
  let bar = document.getElementById('ed-gen');
  if (on && !bar) {
    bar = el('div', 'ed__gen');
    bar.id = 'ed-gen';
    bar.innerHTML = `
      <i class="breath"></i>
      <span>${o.label || 'Crew is building — editing is locked'}</span>
      ${o.cards ? '' : `<b id="ed-gen-count">0 of 18</b>
      <button id="ed-gen-go">View tasks →</button>`}`;
    ed.querySelector('.ed__vp').appendChild(bar);
    bar.querySelector('#ed-gen-go')?.addEventListener('click', () => showTab('tasks'));
    ed.querySelector('.ed__vp').appendChild(crewDeck(o.cards));
  }
  if (!on) {
    document.getElementById('ed-gen')?.remove();
    document.getElementById('ed-crew')?.remove();
  }
}

// One Wana at a time, on a veil over the scene — swipe or let it rotate.
function crewDeck(cards) {
  const list = cards || JOBS.map((j) => ({
    key: j.key, name: j.name, steps: j.steps,
    stage: (STAGES.find((st) => st.crew.includes(j.key)) || {}).name || 'Build',
  }));
  const deck = el('div', 'deck' + (list.length < 2 ? ' is-solo' : ''));
  deck.id = 'ed-crew';
  deck.innerHTML = `
    <button class="deck__nav deck__nav--prev" aria-label="Previous">‹</button>
    <div class="deck__win"><div class="deck__track" id="deck-track">
      ${list.map((j) => `
        <article class="card" id="mini-${j.key}">
          <span class="card__face"><img src="assets/crew-${j.key}.webp" alt=""></span>
          <b>${j.name}</b>
          <span class="card__stage">${j.stage}</span>
          <ol class="card__steps">
            ${j.steps.map((t, k) => `<li id="tick-${j.key}-${k}"><i></i>${t}</li>`).join('')}
          </ol>
          <em id="mini-${j.key}-doing">waiting</em>
          <span class="card__bar"><i id="deckfill-${j.key}"></i></span>
          <button class="card__cta">Confirm the next step →</button>
        </article>`).join('')}
    </div></div>
    <button class="deck__nav deck__nav--next" aria-label="Next">›</button>
    <div class="deck__dots" id="deck-dots">
      ${list.map((_, i) => `<i class="${i ? '' : 'is-on'}"></i>`).join('')}
    </div>`;
  const track = deck.querySelector('#deck-track');
  let at = 0;
  const go = (n) => {
    const cards = track.children;
    at = (n + cards.length) % cards.length;
    track.style.transform = `translateX(${-at * 100}%)`;
    deck.querySelectorAll('#deck-dots i').forEach((d, i) => d.classList.toggle('is-on', i === at));
  };
  // Auto-advance every 10s, unless someone is waiting on an answer.
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; };
  const play = (ms) => { stop(); if (!deck._hold) timer = setInterval(() => go(at + 1), ms || 10000); };
  const step = (n) => { go(n); play(14000); };
  deck.querySelector('.deck__nav--prev').onclick = () => step(at - 1);
  deck.querySelector('.deck__nav--next').onclick = () => step(at + 1);
  deck.querySelectorAll('#deck-dots i').forEach((d, i) => { d.onclick = () => step(i); });
  deck.addEventListener('mouseenter', stop);
  deck.addEventListener('mouseleave', () => play());
  // Whoever needs a call cuts to the front and holds there until you answer.
  deck._front = (key) => {
    const card = document.getElementById('mini-' + key);
    if (!card) return;
    deck._hold = true;
    stop();
    track.prepend(card);
    go(0);
  };
  deck._release = () => { deck._hold = false; play(); };
  deck.querySelectorAll('.card__cta').forEach((b) => {
    b.onclick = () => {
      const chips = document.querySelector('.replies');
      if (!chips) return;
      chips.scrollIntoView({ block: 'center', behavior: 'smooth' });
      chips.classList.add('is-flag');
      setTimeout(() => chips.classList.remove('is-flag'), 1600);
    };
  });
  play();
  return deck;
}

// Objects land in the scene as the work lands.
// Each finished task lands something in the scene you can actually see arrive.
const SPAWN = {
  developer: [
    ['Road mesh', 'mesh', 'road'], ['Player car', 'mesh', 'car'],
    ['Coin ×24', 'mesh', 'coins'], ['Escape trigger', 'group', ''],
  ],
  artist: [
    ['Night sky', 'light', 'sky'], ['City blocks ×6', 'mesh', 'blocks'],
    ['Wet asphalt', 'mesh', 'asphalt'], ['Neon + street lamps', 'light', 'lights'],
  ],
  audio: [['Engine source', 'group', ''], ['Pickup SFX', 'group', ''],
          ['Siren source', 'group', ''], ['Ambience bed', 'group', '']],
  tester: [['Test route', 'group', 'lane'], ['Balance probe', 'group', ''], ['Run recorder', 'group', '']],
  marketing: [['Title card', 'group', ''], ['Cover shot', 'group', ''], ['Store copy', 'group', '']],
};
const SCENE_STAGGER = { blocks: '.sc-block', lights: '.sc-lamp', coins: '.sc-coin' };
function sceneApply(evt) {
  const svg = document.getElementById('ed-scene');
  if (!svg || !evt) return;
  svg.classList.add('has-' + evt);
  if (SCENE_STAGGER[evt]) {
    svg.querySelectorAll(SCENE_STAGGER[evt]).forEach((n, k) =>
      setTimeout(() => n.classList.add('is-in'), k * 190));
  }
  const light = document.getElementById('insp-light');
  if (evt === 'lights' && light) light.textContent = 'night + lamps';
}
function studioSpawn(key, i) {
  const tree = document.querySelector('.ed__tree');
  const item = (SPAWN[key] || [])[i];
  if (!item || !tree) return;
  const b = el('button', 'node ' + item[1] + ' is-new', `<i></i>${item[0]}`);
  b.style.paddingLeft = '22px';
  tree.appendChild(b);
  sceneApply(item[2]);
  const n = tree.querySelectorAll('.node').length - 1;
  const c1 = document.getElementById('ed-count'); if (c1) c1.textContent = n + ' objects';
  const c2 = document.getElementById('insp-count'); if (c2) c2.textContent = n;
  const nm = document.getElementById('insp-name'); if (nm) nm.textContent = item[0];
}

function mountStudio() {
  let s = document.getElementById('studio');
  if (s) return s;
  s = el('div', 'studio2');
  s.id = 'studio';
  s.innerHTML = `
    <header class="topbar2">
      <img class="topbar2__logo" src="assets/logo.png" alt="Wanaka">
      <div class="scenes">
        <button class="scene is-on">Scene 1</button>
        <button class="scene scene--add" title="Add a scene">+</button>
      </div>
      <span class="topbar2__rule"></span>
      <nav class="tabs" id="tabs">
        ${TABS.map((t) => `<button class="tab" data-tab="${t.key}"><i>${t.icon}</i>${t.label}</button>`).join('')}
      </nav>
      <div class="topbar2__right">
        <button class="topbar2__publish">↗ publish</button>
      </div>
    </header>
    <div class="views" id="views">
      <section class="view view--studio" data-view="studio">
        ${emptyState('studio')}<div class="built">${studioView()}</div></section>
      <section class="view view--assets" data-view="assets">
        ${emptyState('assets')}<div class="built">${assetsView()}</div></section>
      <section class="view view--code" data-view="code">
        ${emptyState('code')}<div class="built">${codeView()}</div></section>
      <section class="view view--tasks" data-view="tasks">${tasksView()}</section>
      <section class="view view--preview" data-view="preview">${previewView()}</section>
    </div>
  `;
  document.getElementById('stage').insertBefore(s, document.querySelector('.panel'));
  s.querySelectorAll('.tab').forEach((b) => { b.onclick = () => showTab(b.dataset.tab); });
  showTab('studio');
  return s;
}

function showTab(key) {
  const s = document.getElementById('studio');
  if (!s) return;
  s.querySelectorAll('.tab').forEach((b) => b.classList.toggle('is-on', b.dataset.tab === key));
  s.querySelectorAll('.view').forEach((v) => v.classList.toggle('is-on', v.dataset.view === key));
}

function assetsView() {
  return `
    <div class="pane">
      <div class="pane__head">
        <h2>Assets</h2>
        <p>Everything Artist and Audio have made for this build.</p>
      </div>
      <div class="lib">
        ${ASSETS_LIB.map((g) => `
          <section class="lib__group">
            <header><h3>${g.group}</h3><span class="lib__by">
              <img src="assets/crew-${g.by.toLowerCase()}.webp" alt="">${g.by} Wana</span></header>
            <div class="lib__grid">
              ${g.items.map(([n, st, th]) => `
                <article class="asset is-${st}">
                  <div class="asset__thumb" style="background-image:url('assets/thumb-${th}.jpg')"></div>
                  <span class="asset__name">${n}</span>
                  <span class="asset__state">${st}</span>
                </article>`).join('')}
            </div>
          </section>`).join('')}
      </div>
    </div>`;
}

function codeView() {
  return `
    <div class="pane pane--code">
      <aside class="tree">
        <h3>Project</h3>
        ${CODE_TREE.map((f, i) => `<button class="tree__f${i === 3 ? ' is-on' : ''}">${f}</button>`).join('')}
      </aside>
      <div class="editor">
        <header class="editor__tab">systems/Pursuit.ts<span class="editor__by">
          <img src="assets/crew-developer.webp" alt="">Developer Wana</span></header>
        <pre class="code"><code><span class="ln"></span><span class="c">// cops learn the route you keep taking</span>
<span class="ln"></span><span class="kw">export function</span> <span class="fn">createPursuit</span>(cops<span class="op">:</span> <span class="ty">Cop</span>[], player<span class="op">:</span> <span class="ty">Car</span>) {
<span class="ln"></span>  <span class="kw">const</span> memory <span class="op">=</span> <span class="kw">new</span> <span class="ty">RouteMemory</span>(<span class="nu">12</span>)

<span class="ln"></span>  <span class="kw">return</span> <span class="fn">tick</span>(dt<span class="op">:</span> <span class="ty">number</span>) <span class="op">=&gt;</span> {
<span class="ln"></span>    memory.<span class="fn">sample</span>(player.position)
<span class="ln"></span>    <span class="kw">for</span> (<span class="kw">const</span> cop <span class="kw">of</span> cops) {
<span class="ln"></span>      <span class="kw">const</span> guess <span class="op">=</span> memory.<span class="fn">predict</span>(cop.lookahead)
<span class="ln"></span>      cop.<span class="fn">steerToward</span>(guess, dt)
<span class="ln"></span>    }
<span class="ln"></span>  }
<span class="ln"></span>}</code></pre>
      </div>
    </div>`;
}

function previewView() {
  return `
    <div class="pane pane--preview">
      <header class="pv__bar">
        <span class="pv__title">Game preview</span>
        <span class="pv__tools">
          <button title="Sound">🔊</button><button title="Screenshot">⛶</button>
          <button title="Reload">⟳</button><button title="Open">↗</button><button title="Fullscreen">⤢</button>
        </span>
      </header>
      <div class="pv__frame" id="pv-frame">
        <div class="pv__game" id="pv-game"></div>
        ${previewHud()}
        <div class="pv__menu">
          <h1>Getaway Drive</h1>
          <p>Outrun five cop cars through a neon Manhattan — grab every coin before they box you in.</p>
          <button class="pv__play">Play</button>
          <button class="pv__quit">Quit</button>
        </div>
        <span class="pv__made">GAME MADE ON <b>WANAKA</b></span>
      </div>
      <footer class="pv__keys">
        <span>WASD / Arrows — Drive</span><span>Shift — Boost</span>
        <span>Space — Handbrake</span><span>Esc — Pause</span>
      </footer>
    </div>`;
}

function crewView() {
  return `
    <div class="pane pane--crew">
      <div class="pane__head pane__head--crew">
        <div>
          <h2>Crew</h2>
          <p id="crew-sub">The office — who is on what, and what is still open.</p>
        </div>
        <div class="overall">
          <div class="overall__bar"><i id="overall-fill"></i></div>
          <span class="overall__txt" id="overall-txt">0 of 0 done</span>
        </div>
      </div>
      <div class="crewwrap">
        <aside class="tasks" id="tasks"></aside>
        <div class="office">
          <div class="office__room"></div>
          <div class="crewfloor" id="crewfloor"></div>
        </div>
      </div>
    </div>`;
}

// The task list mirrors the jobs, so the Crew room answers "what's left?"
function mountTasks() {
  const box = document.getElementById('tasks');
  if (!box) return;
  box.innerHTML = '<h3>Board · version 1.0</h3>' + JOBS.map((j) =>
    j.steps.map((st, i) => `<div class="task" id="task-${j.key}-${i}">
        <span class="task__dot"></span><span>${st}</span></div>`).join('')).join('');
}
function setTask(key, i, state) {
  const t = document.getElementById(`task-${key}-${i}`);
  if (t) t.className = 'task is-' + state;
  deckStep(key, i, state);
  if (state === 'done') studioSpawn(key, i);
  const c = document.getElementById('ed-gen-count');
  paintOverall();
  paintStages();
  const txt = document.getElementById('overall-txt');
  if (c && txt) c.textContent = txt.textContent.replace(' done', '').split(' · ')[0];
}
function deckStep(key, i, state) {
  const tick = document.getElementById(`tick-${key}-${i}`);
  if (!tick) return;
  tick.className = 'is-' + state;
  if (state === 'running') tick.scrollIntoView({ block: 'nearest' });
}
// one line that answers "how far along is this build?"
function paintOverall() {
  const all = document.querySelectorAll('.task');
  if (!all.length) return;
  const done = document.querySelectorAll('.task.is-done').length;
  const ask = document.querySelectorAll('.task.is-review').length;
  const fill = document.getElementById('overall-fill');
  const txt = document.getElementById('overall-txt');
  if (fill) fill.style.width = Math.round((done / all.length) * 100) + '%';
  if (txt) txt.textContent = `${done} of ${all.length} done` + (ask ? ` · ${ask} waiting on you` : '');
}
function mountPreviewGame() {
  const g = document.getElementById('pv-game');
  if (g && !g.innerHTML) g.innerHTML = previewGameSVG();
}
// Play hides the menu and lets the numbers run.
function wirePreview() {
  const frame = document.getElementById('pv-frame');
  if (!frame) return;
  const play = frame.parentElement.querySelector('.pv__play');
  if (play) play.onclick = () => {
    frame.classList.add('is-playing');
    let t = 165, coins = 128;
    clearInterval(window.__pvTimer);
    window.__pvTimer = setInterval(() => {
      t = Math.max(0, t - 1);
      if (Math.random() > 0.55) coins += 4;
      const m = String(Math.floor(t / 60)).padStart(2, '0');
      const sec = String(t % 60).padStart(2, '0');
      const el1 = document.getElementById('pv-time'); if (el1) el1.textContent = `${m}:${sec}`;
      const el2 = document.getElementById('pv-coins'); if (el2) el2.textContent = coins;
      const el3 = document.getElementById('pv-mph');
      if (el3) el3.textContent = 62 + Math.round(Math.random() * 14);
    }, 1000);
  };
}




// ── Studio — the scene editor ─────────────────────────────────────
const OUTLINER = [
  ['Scene 1', 'root', 0],
  ['Streets', 'group', 1], ['Block A · brownstone', 'mesh', 2], ['Block B · storefront', 'mesh', 2],
  ['Road mesh', 'mesh', 2], ['Sidewalk props', 'group', 2],
  ['Actors', 'group', 1], ['Player car', 'mesh sel', 2], ['Cop car ×5', 'group', 2],
  ['Pickups', 'group', 1], ['Coin ×24', 'mesh', 2],
  ['Lighting', 'group', 1], ['Night sky', 'light', 2], ['Street lamps ×12', 'light', 2],
  ['Camera · chase', 'cam', 1],
];

function studioView() {
  const grid = Array.from({ length: 24 }, (_, i) =>
    `<line x1="-200" y1="${i * 44}" x2="1200" y2="${i * 44}"/>`).join('') +
    Array.from({ length: 30 }, (_, i) => `<line x1="${i * 40 - 100}" y1="0" x2="${i * 40 - 100}" y2="1000"/>`).join('');

  // every block is authored up front and revealed as the crew makes it
  const blocks = [
    [110, 470, 150, 210], [300, 440, 120, 300], [470, 425, 130, 250],
    [660, 435, 140, 285], [850, 455, 125, 225], [1010, 470, 150, 195],
  ].map(([x, y, w, h], i) => `
    <g class="sc-block" id="sc-block-${i}">
      <path class="sc-face-l" d="M${x} ${y} L${x + w * .55} ${y - 26} L${x + w * .55} ${y - 26 + h} L${x} ${y + h} Z"/>
      <path class="sc-face-r" d="M${x + w * .55} ${y - 26} L${x + w} ${y} L${x + w} ${y + h} L${x + w * .55} ${y - 26 + h} Z"/>
      <path class="sc-face-t" d="M${x} ${y} L${x + w * .55} ${y - 26} L${x + w} ${y} L${x + w * .45} ${y + 24} Z"/>
      <g class="sc-win">
        ${Array.from({ length: 10 }, (_, k) => `<rect x="${x + 14 + (k % 2) * 34}" y="${y + 34 + Math.floor(k / 2) * 40}"
          width="20" height="14" rx="2"/>`).join('')}
      </g>
    </g>`).join('');

  const lamps = [230, 560, 900].map((x, i) => `
    <g class="sc-lamp" id="sc-lamp-${i}" transform="translate(${x} 700)">
      <rect x="-4" y="-150" width="8" height="150" rx="3"/>
      <path d="M-4 -150 q0 -22 26 -22 h12 v10 h-12 q-16 0 -16 12 z"/>
      <ellipse class="sc-bulb" cx="36" cy="-160" rx="10" ry="6"/>
      <path class="sc-cone" d="M36 -156 L86 -10 L-14 -10 Z"/>
    </g>`).join('');

  const coins = [[420, 640], [560, 600], [700, 655], [840, 610]].map(([x, y], i) => `
    <g class="sc-coin" id="sc-coin-${i}" transform="translate(${x} ${y})">
      <ellipse rx="11" ry="14"/><ellipse class="sc-coin-hi" rx="4" ry="12"/></g>`).join('');

  return `
    <div class="ed">
      <aside class="ed__tree">
        <h3>Outliner</h3>
        <div id="ed-tree-base">
          <button class="node root"><i></i>Scene 1</button>
        </div>
      </aside>
      <div class="ed__vp">
        <div class="ed__tools">
          <button class="is-on" title="Select">✥</button><button title="Move">✛</button>
          <button title="Rotate">⟳</button><button title="Scale">⤢</button>
          <span class="ed__sep"></span>
          <button title="Snap">⌗</button><button title="Local space">◲</button>
        </div>
        <svg class="ed__grid" id="ed-scene" viewBox="0 0 1100 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="scSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#0B0A18"/><stop offset=".62" stop-color="#2A1A46"/>
              <stop offset="1" stop-color="#7E3057"/>
            </linearGradient>
            <linearGradient id="scRoad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#2A2140"/><stop offset="1" stop-color="#0D0B16"/>
            </linearGradient>
            <linearGradient id="scFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#0B0A10"/><stop offset="1" stop-color="#0B0A10" stop-opacity="0"/>
            </linearGradient>
            <radialGradient id="scLamp"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".5"/>
              <stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>
            <linearGradient id="scDusk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#160C30"/><stop offset=".45" stop-color="#5E2350"/>
              <stop offset=".78" stop-color="#B8452A"/><stop offset="1" stop-color="#D98443"/>
            </linearGradient>
            <radialGradient id="scSun"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".85"/>
              <stop offset="1" stop-color="#FFB35C" stop-opacity="0"/></radialGradient>
          </defs>

          <rect class="sc-sky" width="1100" height="900" fill="url(#scSky)"/>
          <g class="sc-desert">
            <rect width="1100" height="900" fill="url(#scDusk)"/>
            <circle cx="550" cy="470" r="180" fill="url(#scSun)"/>
            <circle cx="550" cy="452" r="46" fill="#FFD98A"/>
            <rect x="0" y="470" width="1100" height="430" fill="#9C5F35"/>
            <path d="M-40 470 q180 -110 380 -54 q170 48 300 12 q180 -50 500 40 L1140 900 L-40 900 Z" fill="#7A431F" opacity=".9"/>
            <path d="M-40 560 q240 -90 470 -20 q200 60 380 -6 q140 -50 330 26 L1140 900 L-40 900 Z" fill="#A3603A" opacity=".95"/>
            ${[[160, 690, 1], [880, 660, .85], [1010, 730, 1.1]].map(([x, y, k]) => `
              <g transform="translate(${x} ${y}) scale(${k})">
                <rect x="-11" y="-112" width="22" height="112" rx="11" fill="#2F5D42"/>
                <rect x="-40" y="-86" width="16" height="52" rx="8" fill="#2F5D42"/>
                <rect x="-40" y="-86" width="16" height="16" rx="8" fill="#2F5D42"/>
                <rect x="24" y="-98" width="16" height="60" rx="8" fill="#2F5D42"/>
                <rect x="24" y="-98" width="16" height="16" rx="8" fill="#2F5D42"/>
              </g>`).join('')}
          </g>
          <g class="sc-grid">${grid}</g>
          <rect width="1100" height="330" fill="url(#scFade)"/>

          <path class="sc-road" d="M430 470 L670 470 L1180 900 L-80 900 Z" fill="url(#scRoad)"/>
          <g class="sc-lane">
            ${[0.06, 0.2, 0.38, 0.6, 0.86].map((p) => {
              const y = 470 + 430 * p, w = 8 + 26 * p, h = 18 + 66 * p;
              return `<rect x="${550 - w / 2}" y="${y}" width="${w}" height="${h}" rx="${w / 3}"/>`;
            }).join('')}
          </g>

          ${blocks}
          ${lamps}
          ${coins}

          <g class="sc-car" id="sc-car" transform="translate(550 760)">
            <ellipse cx="0" cy="60" rx="98" ry="14" fill="#000" opacity=".45"/>
            <rect x="-86" y="-18" width="172" height="76" rx="17" fill="#15141C"/>
            <rect x="-62" y="-54" width="124" height="44" rx="12" fill="#1D1C27"/>
            <rect x="-52" y="-46" width="104" height="28" rx="8" fill="#3A3952" opacity=".78"/>
            <rect class="sc-tail" x="-76" y="4" width="52" height="12" rx="6"/>
            <rect class="sc-tail" x="24" y="4" width="52" height="12" rx="6"/>
            <rect x="-22" y="32" width="44" height="15" rx="4" fill="#F2C94C"/>
          </g>

          <g class="ed__spawned"></g>
          <g class="ed__giz" id="ed-giz" transform="translate(550 740)">
            <line x1="0" y1="0" x2="120" y2="30" class="gx"/><polygon points="120,22 142,30 120,38" class="gx-f"/>
            <line x1="0" y1="0" x2="0" y2="-108" class="gy"/><polygon points="-8,-108 0,-130 8,-108" class="gy-f"/>
            <line x1="0" y1="0" x2="-114" y2="28" class="gz"/><polygon points="-114,20 -136,28 -114,36" class="gz-f"/>
            <circle r="6" class="gc"/>
          </g>
        </svg>
        <div class="ed__inspector">
          <h3 id="insp-name">Scene 1</h3>
          <div class="prop"><span>Position</span><b>0.00</b><b>0.00</b><b>0.00</b></div>
          <div class="prop"><span>Rotation</span><b>0.00</b><b>0.00</b><b>0.00</b></div>
          <div class="prop"><span>Scale</span><b>1.00</b><b>1.00</b><b>1.00</b></div>
          <div class="prop prop--pick"><span>Objects</span><em id="insp-count">0</em></div>
          <div class="prop prop--pick"><span>Lighting</span><em id="insp-light">none</em></div>
        </div>
        <div class="ed__hud"><span>Perspective</span><span>·</span><span id="ed-count">0 objects</span><span>·</span><span>60 fps</span></div>
      </div>
    </div>`;
}

// ── PR — what Marketing shipped ───────────────────────────────────
function prView() {
  return `
    <div class="pane pane--pr">
      <div class="pane__head">
        <h2>PR</h2>
        <p>Everything Marketing Wana made to put this in front of people.</p>
      </div>
      <div class="pr">
        <figure class="pr__cover">
          <img src="assets/game-cover.jpg" alt="">
          <figcaption>Key art · 1920×1080<span>ready</span></figcaption>
        </figure>
        <div class="pr__side">
          <section class="pr__card">
            <h3>Store copy</h3>
            <p class="pr__title">Getaway Drive</p>
            <p class="pr__blurb">Outrun five cop cars through a neon Manhattan. Grab every coin
              before they box you in — the longer you run, the better they learn your route.</p>
            <span class="pr__tags"><i>Arcade</i><i>Driving</i><i>Single player</i><i>3 min runs</i></span>
          </section>
          <section class="pr__card">
            <h3>Ready to share</h3>
            <div class="pr__row"><span>Browser link</span><em>wanaka.app/g/getaway-drive</em></div>
            <div class="pr__row"><span>Thumbnail</span><em>1280×720 · exported</em></div>
            <div class="pr__row"><span>Trailer clip</span><em>12s · queued</em></div>
            <button class="pr__publish">↗ Publish to Community</button>
          </section>
        </div>
      </div>
    </div>`;
}




// ── Preview — the game actually running ───────────────────────────
// Everything streams out from the vanishing point, so the car reads as moving.
function previewGameSVG() {
  const run = (cls, dx, dy, delay, dur, extra = '') =>
    `style="--dx:${dx}px;--dy:${dy}px;animation-delay:${delay}s;animation-duration:${dur}s;${extra}"`;

  const towers = [];
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1;
    const w = 90 + rnd(i) * 70, h = 150 + rnd(i + 9) * 210;
    const lit = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) {
      if (rnd(i * 31 + r * 7 + c) < .45) continue;
      lit.push(`<rect x="${18 + c * (w / 3.4)}" y="${16 + r * (h / 9)}" width="${w / 6}" height="${h / 16}"
        fill="${rnd(i + r + c) > .82 ? '#7FE9FF' : '#FFD98A'}" opacity=".75"/>`);
    }
    towers.push(`<g class="pv-bld" ${run('', side * (330 + rnd(i + 3) * 260), 230 + rnd(i + 5) * 90,
      -(i * 0.42), 5.6)}>
      <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="3" fill="#221B3E"/>
      <rect x="${-w / 2}" y="${-h}" width="${w * .3}" height="${h}" fill="#181233" opacity=".8"/>
      <g transform="translate(${-w / 2} ${-h})">${lit.join('')}</g></g>`);
  }
  const dashes = Array.from({ length: 9 }, (_, i) =>
    `<rect class="pv-dash" ${run('', 0, 470, -(i * 0.24), 2.2)} x="-6" y="0" width="12" height="26" rx="5" fill="#F4F2E8"/>`).join('');
  const coins = Array.from({ length: 6 }, (_, i) =>
    `<g class="pv-coin" ${run('', (i % 2 ? 1 : -1) * (60 + rnd(i) * 130), 430, -(i * 0.72), 4.3)}>
       <circle r="16" fill="url(#pvGlow)"/><ellipse rx="9" ry="11" fill="#FFC83D"/>
       <ellipse rx="3.4" ry="9" fill="#FFE9A8"/></g>`).join('');
  const streaks = Array.from({ length: 7 }, (_, i) =>
    `<rect class="pv-streak" ${run('', (i - 3) * 150, 520, -(i * 0.17), 1.1)} x="-2" y="0" width="4" height="34" rx="2" fill="#fff" opacity=".45"/>`).join('');

  return `<svg viewBox="0 0 1090 760" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pvSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#070617"/><stop offset=".55" stop-color="#22164A"/>
        <stop offset=".9" stop-color="#7A2A55"/><stop offset="1" stop-color="#A8385F"/>
      </linearGradient>
      <linearGradient id="pvRoad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2A2140"/><stop offset="1" stop-color="#0B0913"/>
      </linearGradient>
      <radialGradient id="pvGlow"><stop offset="0" stop-color="#FFC83D" stop-opacity=".85"/>
        <stop offset="1" stop-color="#FFC83D" stop-opacity="0"/></radialGradient>
      <radialGradient id="pvHaze"><stop offset="0" stop-color="#FF7BB0" stop-opacity=".5"/>
        <stop offset="1" stop-color="#FF7BB0" stop-opacity="0"/></radialGradient>
      <radialGradient id="pvTail"><stop offset="0" stop-color="#FF2E4D" stop-opacity=".95"/>
        <stop offset="1" stop-color="#FF2E4D" stop-opacity="0"/></radialGradient>
      <clipPath id="pvClip"><rect width="1090" height="760"/></clipPath>
    </defs>
    <g clip-path="url(#pvClip)">
      <rect width="1090" height="760" fill="url(#pvSky)"/>
      <rect x="0" y="330" width="1090" height="430" fill="#100C22"/>
      <g transform="translate(545 330)">${towers.join('')}</g>
      <ellipse cx="545" cy="330" rx="420" ry="120" fill="url(#pvHaze)"/>
      <path d="M455 330 L635 330 L1180 760 L-90 760 Z" fill="url(#pvRoad)"/>
      <g transform="translate(545 330)">${dashes}${streaks}${coins}</g>

      <g class="pv-car" transform="translate(545 620)">
        <ellipse cx="0" cy="86" rx="150" ry="20" fill="#000" opacity=".5"/>
        <ellipse cx="-104" cy="26" rx="80" ry="50" fill="url(#pvTail)" opacity=".65"/>
        <ellipse cx="104" cy="26" rx="80" ry="50" fill="url(#pvTail)" opacity=".65"/>
        <rect x="-132" y="-26" width="264" height="112" rx="24" fill="#15141C"/>
        <rect x="-96" y="-80" width="192" height="64" rx="17" fill="#1D1C27"/>
        <rect x="-80" y="-69" width="160" height="41" rx="11" fill="#3A3952" opacity=".78"/>
        <rect x="-132" y="4" width="264" height="17" rx="8" fill="#0E0D14" opacity=".7"/>
        <rect x="-116" y="8" width="80" height="17" rx="8" fill="#FF2E4D"/>
        <rect x="36" y="8" width="80" height="17" rx="8" fill="#FF2E4D"/>
        <rect x="-34" y="46" width="68" height="22" rx="6" fill="#F2C94C"/>
        <rect x="-150" y="48" width="28" height="38" rx="9" fill="#0B0A10"/>
        <rect x="122" y="48" width="28" height="38" rx="9" fill="#0B0A10"/>
      </g>
    </g>
  </svg>`;
}

function previewHud() {
  return `
    <div class="hud2">
      <div class="hud2__l"><span class="hud2__k">TIME</span><b id="pv-time">02:45</b></div>
      <div class="hud2__c"><span class="hud2__k">COINS</span><b id="pv-coins">128</b><i>/ 240</i></div>
      <div class="hud2__r"><b id="pv-mph">68</b><span class="hud2__k">MPH</span></div>
    </div>
    <div class="hud2__cops"><span>COPS</span><i></i><i></i><i></i><i class="off"></i><i class="off"></i></div>`;
}


/* ──────────────────────────────────────────────────────────────────
   Boot. Everything below runs last on purpose: the screens above are
   function declarations (hoisted), but their data tables are `const`,
   so any entry point that touches them has to come after the whole
   file has evaluated.
   ────────────────────────────────────────────────────────────────── */
paintTrial();

// ?build — jump straight to the parallel build (review / capture)
if (QUERY.includes('build')) {
  clearStart();
  screenBuildParallel();
}
if (QUERY.includes('studio')) {
  mountStudio();
  const t = (QUERY.match(/tab=(\w+)/) || [])[1];
  if (t) {
    markBuilt();
    // a snapshot mid-build, so every state is visible at once
    setMember('developer', 'done', 'Core loop wired');   setProgress('developer', 100);
    setMember('artist', 'working', 'Neon pass');          setProgress('artist', 72);
    setMember('audio', 'review', 'needs your call');      setProgress('audio', 55);
    setMember('tester', 'working', 'Chase balance');      setProgress('tester', 40);
    setMember('marketing', 'idle', 'waiting');            setProgress('marketing', 0);
    JOBS.forEach((j) => j.steps.forEach((_, i) => {
      const st = j.key === 'developer' ? 'done'
        : (j.key === 'artist' && i < 3) || (j.key === 'audio' && i < 2) || (j.key === 'tester' && i < 1) ? 'done'
        : (j.key === 'artist' && i === 3) || (j.key === 'tester' && i === 1) ? 'running'
        : j.key === 'audio' && i === 2 ? 'review' : '';
      if (st) setTask(j.key, i, st);
    }));
    showTab(t);
  }
}

// ?pay — jump straight to the pricing modal (review / capture)
if (QUERY.includes('pay')) {
  STEPS[4][1]();
  setTimeout(() => openPaywall(), 120);
}

// ?doc — jump straight to the opened plan document (review / capture)
if (QUERY.includes('doc')) {
  STEPS[4][1]();
  setTimeout(openPlanDoc, 60);
}

// ?plate=a|b|c — freeze the viewport at one build state, UI hidden, no transitions.
// Used to export capture plates for the Figma frames.
const plate = (QUERY.match(/plate=([abc])/) || [])[1];
if (plate) {
  clearStart();
  log.innerHTML = '';
  const b = mountBuild();
  b.classList.add('is-clean', 'is-frozen');
  if (plate !== 'a') b.classList.add('is-art');
  if (plate === 'c') b.classList.add('is-test');
}

// One-shot deep links for review: #step1 … #step7
const jump = parseInt((location.hash.match(/^#step(\d)$/) || [])[1], 10);
if (jump >= 1 && jump <= STEPS.length) {
  history.replaceState(null, '', location.pathname);
  if (jump < 6) unmountBuild();
  STEPS[jump - 1][1]();
}

// ?site / #site — start from wanaka.app, the way a new user arrives
// ?login jumps straight to the sign-in card over the Studio
if (QUERY.includes('site') || location.hash === '#site') {
  clearStart();
  if (QUERY.includes('login')) screenLogin(SITE.seed);
  else screenSite();
}
