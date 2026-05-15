/* ============================================================
   TravelNest – Travel Mood
   Ambient sound engine (Web Audio API) + Destination Tracker
   Depends on: data.js (DESTINATIONS constant)
   ============================================================ */
'use strict';

/* ============================================================
   AMBIENT SOUND ENGINE
   ============================================================ */
const SoundEngine = (() => {
  let ctx        = null;
  let master     = null;
  let nodes      = [];
  let session    = 0; // incremented on each play(); used to cancel stale timeouts

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function makeWhiteNoise(audioCtx, secs) {
    const size   = audioCtx.sampleRate * (secs || 4);
    const buf    = audioCtx.createBuffer(2, size, audioCtx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop   = true;
    return src;
  }

  function makePinkNoise(audioCtx) {
    const size = audioCtx.sampleRate * 4;
    const buf  = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
    const d    = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop   = true;
    return src;
  }

  function stopAll() {
    session++;
    nodes.forEach(n => { try { n.stop(); } catch {} });
    nodes = [];
    if (master && ctx) {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      setTimeout(() => { try { master.disconnect(); } catch {} master = null; }, 400);
    }
  }

  function makeMaster(audioCtx, vol) {
    master = audioCtx.createGain();
    master.gain.setValueAtTime(0, audioCtx.currentTime);
    master.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 1.2);
    master.connect(audioCtx.destination);
  }

  function playBeach(audioCtx, vol) {
    makeMaster(audioCtx, vol);

    const noise  = makeWhiteNoise(audioCtx);
    const lpf    = audioCtx.createBiquadFilter();
    lpf.type     = 'lowpass';
    lpf.frequency.value = 520;
    lpf.Q.value  = 0.4;

    const ng     = audioCtx.createGain();
    ng.gain.value = 0.5;

    // LFO creates wave rhythm
    const lfo    = audioCtx.createOscillator();
    lfo.type     = 'sine';
    lfo.frequency.value = 0.09;
    const lfog   = audioCtx.createGain();
    lfog.gain.value = 0.28;
    lfo.connect(lfog);
    lfog.connect(ng.gain);

    noise.connect(lpf);
    lpf.connect(ng);
    ng.connect(master);
    noise.start(); lfo.start();
    nodes.push(noise, lfo);
  }

  function playForest(audioCtx, vol, sid) {
    makeMaster(audioCtx, vol);

    // Wind base
    const wind  = makePinkNoise(audioCtx);
    const wf    = audioCtx.createBiquadFilter();
    wf.type     = 'bandpass';
    wf.frequency.value = 280;
    wf.Q.value  = 0.6;
    const wg    = audioCtx.createGain();
    wg.gain.value = 0.35;

    wind.connect(wf); wf.connect(wg); wg.connect(master);
    wind.start();
    nodes.push(wind);

    // Rustling high-freq noise
    const rustle = makeWhiteNoise(audioCtx);
    const rf     = audioCtx.createBiquadFilter();
    rf.type      = 'highpass';
    rf.frequency.value = 2200;
    const rg     = audioCtx.createGain();
    rg.gain.value = 0.12;
    const rlfo   = audioCtx.createOscillator();
    rlfo.frequency.value = 0.35;
    const rlg    = audioCtx.createGain();
    rlg.gain.value = 0.08;
    rlfo.connect(rlg); rlg.connect(rg.gain);

    rustle.connect(rf); rf.connect(rg); rg.connect(master);
    rustle.start(); rlfo.start();
    nodes.push(rustle, rlfo);

    // Bird chirps
    scheduleBirds(audioCtx, sid);
  }

  function scheduleBirds(audioCtx, sid) {
    const chirp = () => {
      if (session !== sid || !master) return;
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();
      osc.frequency.value = 1800 + Math.random() * 2400;
      osc.type = 'sine';
      env.gain.setValueAtTime(0, audioCtx.currentTime);
      env.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 0.02);
      env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.18);
      osc.connect(env); env.connect(master);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
      setTimeout(chirp, 2200 + Math.random() * 5000);
    };
    setTimeout(chirp, 1500 + Math.random() * 2000);
  }

  function playCity(audioCtx, vol, sid) {
    makeMaster(audioCtx, vol);

    // Traffic rumble
    const rumble = makeWhiteNoise(audioCtx);
    const rlf    = audioCtx.createBiquadFilter();
    rlf.type     = 'lowpass';
    rlf.frequency.value = 180;
    const rg     = audioCtx.createGain();
    rg.gain.value = 0.45;
    rumble.connect(rlf); rlf.connect(rg); rg.connect(master);
    rumble.start();
    nodes.push(rumble);

    // Urban mid noise
    const urban  = makeWhiteNoise(audioCtx);
    const uf     = audioCtx.createBiquadFilter();
    uf.type      = 'bandpass';
    uf.frequency.value = 700;
    uf.Q.value   = 0.9;
    const ug     = audioCtx.createGain();
    ug.gain.value = 0.18;
    urban.connect(uf); uf.connect(ug); ug.connect(master);
    urban.start();
    nodes.push(urban);

    // Occasional horn
    scheduleHorns(audioCtx, sid);
  }

  function scheduleHorns(audioCtx, sid) {
    const honk = () => {
      if (session !== sid || !master) return;
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();
      osc.frequency.value = 180 + Math.random() * 220;
      osc.type = 'sawtooth';
      const dur = 0.4 + Math.random() * 0.6;
      env.gain.setValueAtTime(0, audioCtx.currentTime);
      env.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.08);
      env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
      osc.connect(env); env.connect(master);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + dur + 0.1);
      setTimeout(honk, 6000 + Math.random() * 12000);
    };
    setTimeout(honk, 4000 + Math.random() * 6000);
  }

  return {
    play(type, vol) {
      stopAll();
      const audioCtx = getCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const sid = session;
      const v   = vol ?? 0.45;
      if (type === 'beach')  playBeach(audioCtx, v);
      else if (type === 'forest') playForest(audioCtx, v, sid);
      else if (type === 'city')   playCity(audioCtx, v, sid);
    },
    stop: stopAll,
    setVolume(v) {
      if (master && ctx) master.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
    },
  };
})();

/* ── Sound button UI ───────────────────────────────────────── */
const soundBtns  = document.querySelectorAll('.sound-btn');
const volSlider  = document.getElementById('volSlider');
const volVal     = document.getElementById('volVal');
const audioNote  = document.getElementById('audioNotice');

let currentSound = null;
audioNote.style.display = 'block';

soundBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.sound;
    audioNote.style.display = 'none';

    if (currentSound === type) {
      // Toggle off
      SoundEngine.stop();
      currentSound = null;
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      soundBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentSound = type;
      SoundEngine.play(type, volSlider.value / 100 * 0.8);
    }
  });
});

volSlider.addEventListener('input', () => {
  const v = volSlider.value;
  volVal.textContent = `${v}%`;
  SoundEngine.setVolume((v / 100) * 0.8);
});

/* ============================================================
   DESTINATION TRACKER
   ============================================================ */
const TRACKER_KEY = 'tn_tracker';

function getState() {
  try { return JSON.parse(localStorage.getItem(TRACKER_KEY)) || {}; } catch { return {}; }
}

function saveState(state) {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(state));
}

let activeFilter = 'all';

function renderTracker() {
  const state   = getState();
  const listEl  = document.getElementById('trackerList');
  const statV   = document.getElementById('statVisited');
  const statP   = document.getElementById('statPlanned');
  const statPct = document.getElementById('statPct');

  let visited = 0, planned = 0;
  DESTINATIONS.forEach(d => {
    if (state[d.id] === 'visited') visited++;
    if (state[d.id] === 'planned') planned++;
  });

  statV.textContent   = visited;
  statP.textContent   = planned;
  statPct.textContent = Math.round((visited / DESTINATIONS.length) * 100) + '%';

  const filtered = DESTINATIONS.filter(d => {
    if (activeFilter === 'visited') return state[d.id] === 'visited';
    if (activeFilter === 'planned') return state[d.id] === 'planned';
    return true;
  });

  listEl.innerHTML = filtered.map(d => {
    const sv = state[d.id] === 'visited';
    const sp = state[d.id] === 'planned';
    return `
      <li class="tracker-item${sv ? ' is-visited' : sp ? ' is-planned' : ''}" data-id="${d.id}">
        <div class="ti-thumb" style="background-image:url('${d.image}')" role="img" aria-label="${d.name}"></div>
        <div>
          <div class="ti-name">${d.name}</div>
          <div class="ti-country">${d.country}</div>
        </div>
        <div class="ti-actions">
          <button class="ti-btn btn-visited${sv ? ' on' : ''}" data-action="visited" data-id="${d.id}" aria-pressed="${sv}">
            ${sv ? '✓ Visited' : 'Visited'}
          </button>
          <button class="ti-btn btn-planned${sp ? ' on' : ''}" data-action="planned" data-id="${d.id}" aria-pressed="${sp}">
            ${sp ? '📌 Planned' : 'Planned'}
          </button>
        </div>
      </li>`;
  }).join('');

  if (filtered.length === 0) {
    listEl.innerHTML = '<li style="padding:.5rem 0;font-size:.87rem;color:var(--text-light);font-style:italic;">No destinations in this category yet.</li>';
  }

  // Button events
  listEl.querySelectorAll('.ti-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id     = btn.dataset.id;
      const action = btn.dataset.action;
      const state  = getState();

      state[id] = (state[id] === action) ? null : action;
      if (!state[id]) delete state[id];
      saveState(state);
      renderTracker();
    });
  });
}

// Filter tabs
document.querySelectorAll('.tracker-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tracker-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    renderTracker();
  });
});

renderTracker();
