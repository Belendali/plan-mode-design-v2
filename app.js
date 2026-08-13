/* Wanaka · Planner Mode — interactive restoration of Figma section "0723"
   File PWtgAaGdl6znpuQykrnIbb · node 45623:94837
   Frames: 01 Start Chat → 02 Simple Question → 03 Recommend Plan Mode → 04 Planner start */

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
  <div class="studio"></div>
  <div class="chrome"></div>
  <div class="panel">
    <div class="panel__glow"><img src="assets/bg-ellipses.svg" alt=""></div>

    <div class="topbar">
      <div class="seg">
        <button class="seg__btn is-active"><img src="assets/build.svg" alt="">Build</button>
        <button class="seg__btn">${GAME_ICON}Preview</button>
      </div>
      <div class="publish"><img src="assets/publish.svg" alt="">publish</div>
    </div>

    <div class="chatinfo">
      <div class="chatinfo__name"><span>Chat name Chat...</span><img src="assets/chevron.svg" alt=""></div>
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
          <button class="send" id="send"><img src="assets/send-circle.svg" alt=""><span class="send__stop"></span></button>
        </div>
      </div>
    </div>

    <div class="plannerbtn" id="plannerbtn">
      <span>Crew</span>
      <div class="switch" id="switch"><i></i></div>
    </div>
  </div>
`;

const log = document.getElementById('log');
const perch = document.getElementById('perch');
const input = document.getElementById('input');
const switchEl = document.getElementById('switch');

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
  push(pitch);
}

// Declining costs nothing: the offer stays reachable from the switch.
function declineCrew(pitch) {
  pitch.remove();
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
  btn.classList.add('is-flash');
  setTimeout(() => btn.classList.remove('is-flash'), 1400);
  await wait(pitch ? 620 : 0);

  if (pitch) pitch.remove();
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
  push(plan);

  const replies = el('div', 'replies');
  PLAN.replies.forEach((r) => {
    const b = el('button', 'reply' + (r.go ? ' reply--go' : ''), r.text);
    b.onclick = () => {
      replies.remove();
      push(el('div', 'msg msg--user', r.text));
      if (r.go) {
        setTimeout(() => screenBuild(), 700);
      } else {
        setTimeout(() => push(el('div', 'msg msg--agent',
          'Sure — which part? The night, the cops, or how you win?')), 600);
      }
    };
    replies.appendChild(b);
  });
  push(replies);
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
    review: "Developer Wana finished the core loop — drive, outrun, coin score. Take a look: does it play the way you pictured? Tell me what to change, or say go and I'll bring the Artist in.",
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
    review: 'Artist Wana dressed the city — night, neon, wet streets. Have a look: anything you want different? Tell me here, or say go.',
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
    review: "Tester Wana drove it start to finish and it holds up. Last check before I call it version 1 — anything to fix? Otherwise say go.",
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
    <div class="build__wire">${wireframeSVG()}</div>
    <div class="build__hud">
      <div class="hud hud--time"><small>TIME</small>02:45</div>
      <div class="hud hud--coin"><img src="assets/coin.png" alt="">128</div>
    </div>
    <div class="build__status" id="build-status">Setting the stage…</div>
    <div class="miniplan" id="miniplan">
      <div class="miniplan__title">GAME PLAN 1.0</div>
      ${CREW.map((c) => `
        <div class="agent is-idle" id="ms-${c.key}">
          <span class="agent__face"><img src="${c.gif}" alt=""></span>
          <span class="agent__text">
            <span class="agent__name">${c.name}</span>
            <span class="agent__doing" id="doing-${c.key}">Waiting</span>
          </span>
          <span class="agent__state" id="state-${c.key}"></span>
        </div>`).join('')}
      <button class="miniplan__try" id="mini-try">▶&nbsp;&nbsp;Try demo</button>
    </div>
  `;
  document.getElementById('stage').appendChild(build);
  // ?clean — hide the overlaid UI so the viewport can be captured as a plate
  if (location.search.includes('clean')) build.classList.add('is-clean');
  requestAnimationFrame(() => build.classList.add('is-on'));
  document.getElementById('mini-try').onclick = tryDemo;
  return build;
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

async function screenBuild() {
  busy = true;
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
    await review(c);
    setAgent(c.key, 'done', c.ready);
  }

  setStatus('Your first playable is ready 🎉', true);
  document.getElementById('mini-try').classList.add('is-shown');
  readLine('First playable ready ✓');
  plannerSay("That's version 1 — give it a drive.");
  input.placeholder = 'Tell Wana what to change…';
  busy = false;
}

// Blocks until the user says continue. Free text is treated as a change request:
// the agent does a revision pass and asks again.
function review(c, again) {
  return new Promise((resolve) => {
    const ask = plannerSay(again
      ? `Updated — ${c.name} had another pass. Better? Say go when you're happy.`
      : c.review);
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
        ask.classList.remove('crewmsg--planner');
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
    text: "Version 1 is yours. Want anything changed? Tell me here and I'll update the plan, or send the right Wana back in.",
  });
  recaps.forEach((r, i) => setTimeout(() => {
    push(el('div', 'crewmsg' + (r.planner ? ' crewmsg--planner' : ''),
      `<span class="crewmsg__avatar"><img src="${r.gif}" alt=""></span>
       <span><strong>${r.name}</strong>${r.text}</span>`));
  }, 250 + i * (window.__fast ? 120 : 550)));
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
  if (awaitingReview) {
    if (GO_WORDS.test(v)) awaitingReview.go(v);
    else awaitingReview.change(v);
    return;
  }
  runConversation(v);
};
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

// ?plate=a|b|c — freeze the viewport at one build state, UI hidden, no transitions.
// Used to export capture plates for the Figma frames.
const plate = (location.search.match(/plate=([abc])/) || [])[1];
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
