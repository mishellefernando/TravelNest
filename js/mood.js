'use strict';

let SoundEngine = (function () {
  let audioContext = null;
  let masterGain = null;
  let activeNodes = [];
  let sessionId = 0; // incremented on each play(); used to cancel stale sound events

  function getAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }

  function createGain(audioCtx, value) {
    let gain = audioCtx.createGain();
    gain.gain.setValueAtTime(value, audioCtx.currentTime);
    return gain;
  }

  function createFilter(audioCtx, type, frequency, q) {
    let filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    if (q !== undefined) {
      filter.Q.value = q;
    }
    return filter;
  }

  function createOscillator(audioCtx, type, frequency) {
    let osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    return osc;
  }

  function makeWhiteNoise(audioCtx, durationSeconds) {
    let size = audioCtx.sampleRate * (durationSeconds || 4);
    let buffer = audioCtx.createBuffer(2, size, audioCtx.sampleRate);

    for (let channel = 0; channel < 2; channel += 1) {
      let data = buffer.getChannelData(channel);
      for (let i = 0; i < size; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    let source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  function makePinkNoise(audioCtx) {
    let size = audioCtx.sampleRate * 4;
    let buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
    let data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < size; i += 1) {
      let white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    let source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  function stopAllSounds() {
    sessionId += 1;
    for (let i = 0; i < activeNodes.length; i += 1) {
      try {
        activeNodes[i].stop();
      } catch (error) {
        // ignore errors from nodes that have already stopped
      }
    }
    activeNodes = [];

    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.2);
      setTimeout(function () {
        try {
          masterGain.disconnect();
        } catch (error) {
          // ignore disconnect error
        }
        masterGain = null;
      }, 400);
    }
  }

  function startMasterGain(audioCtx, volume) {
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 1.2);
    masterGain.connect(audioCtx.destination);
  }

  function playBeach(audioCtx, volume) {
    startMasterGain(audioCtx, volume);

    let noise = makeWhiteNoise(audioCtx);
    let filter = createFilter(audioCtx, 'lowpass', 520, 0.4);
    let noiseGain = createGain(audioCtx, 0.5);
    let lfo = createOscillator(audioCtx, 'sine', 0.09);
    let lfoGain = createGain(audioCtx, 0.28);

    lfo.connect(lfoGain);
    lfoGain.connect(noiseGain.gain);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);

    noise.start();
    lfo.start();
    activeNodes.push(noise, lfo);
  }

  function playForest(audioCtx, volume, sid) {
    startMasterGain(audioCtx, volume);

    let wind = makePinkNoise(audioCtx);
    let windFilter = createFilter(audioCtx, 'bandpass', 280, 0.6);
    let windGain = createGain(audioCtx, 0.35);
    wind.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    wind.start();
    activeNodes.push(wind);

    let rustle = makeWhiteNoise(audioCtx);
    let rustleFilter = createFilter(audioCtx, 'highpass', 2200);
    let rustleGain = createGain(audioCtx, 0.12);
    let rustleLfo = createOscillator(audioCtx, 'sine', 0.35);
    let rustleLfoGain = createGain(audioCtx, 0.08);

    rustleLfo.connect(rustleLfoGain);
    rustleLfoGain.connect(rustleGain.gain);
    rustle.connect(rustleFilter);
    rustleFilter.connect(rustleGain);
    rustleGain.connect(masterGain);

    rustle.start();
    rustleLfo.start();
    activeNodes.push(rustle, rustleLfo);

    scheduleBirds(audioCtx, sid);
  }

  function scheduleBirds(audioCtx, sid) {
    function createBirdSound() {
      if (sessionId !== sid || !masterGain) {
        return;
      }

      let osc = createOscillator(audioCtx, 'sine', 1800 + Math.random() * 2400);
      let env = createGain(audioCtx, 0);
      env.gain.setValueAtTime(0, audioCtx.currentTime);
      env.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 0.02);
      env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.18);
      osc.connect(env);
      env.connect(masterGain);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.25);
      setTimeout(createBirdSound, 2200 + Math.random() * 5000);
    }

    setTimeout(createBirdSound, 1500 + Math.random() * 2000);
  }

  function playCity(audioCtx, volume, sid) {
    startMasterGain(audioCtx, volume);

    let rumble = makeWhiteNoise(audioCtx);
    let rumbleFilter = createFilter(audioCtx, 'lowpass', 180);
    let rumbleGain = createGain(audioCtx, 0.45);
    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(masterGain);
    rumble.start();
    activeNodes.push(rumble);

    let urban = makeWhiteNoise(audioCtx);
    let urbanFilter = createFilter(audioCtx, 'bandpass', 700, 0.9);
    let urbanGain = createGain(audioCtx, 0.18);
    urban.connect(urbanFilter);
    urbanFilter.connect(urbanGain);
    urbanGain.connect(masterGain);
    urban.start();
    activeNodes.push(urban);

    scheduleHorns(audioCtx, sid);
  }

  function scheduleHorns(audioCtx, sid) {
    function createHorn() {
      if (sessionId !== sid || !masterGain) {
        return;
      }

      let osc = createOscillator(audioCtx, 'sawtooth', 180 + Math.random() * 220);
      let env = createGain(audioCtx, 0);
      let duration = 0.4 + Math.random() * 0.6;
      env.gain.setValueAtTime(0, audioCtx.currentTime);
      env.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.08);
      env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
      osc.connect(env);
      env.connect(masterGain);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration + 0.1);
      setTimeout(createHorn, 6000 + Math.random() * 12000);
    }

    setTimeout(createHorn, 4000 + Math.random() * 6000);
  }

  function playSound(type, volume) {
    stopAllSounds();
    let audioCtx = getAudioContext();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    let sid = sessionId;
    let volumeLevel = volume !== undefined ? volume : 0.45;

    if (type === 'beach') {
      playBeach(audioCtx, volumeLevel);
    } else if (type === 'forest') {
      playForest(audioCtx, volumeLevel, sid);
    } else if (type === 'city') {
      playCity(audioCtx, volumeLevel, sid);
    }
  }

  function setVolume(volume) {
    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
    }
  }

  return {
    play: playSound,
    stop: stopAllSounds,
    setVolume: setVolume,
  };
})();

let soundButtons = document.querySelectorAll('.sound-btn');
let volumeSlider = document.getElementById('volSlider');
let volumeLabel = document.getElementById('volVal');
let audioNotice = document.getElementById('audioNotice');
let currentSound = null;

if (audioNotice) {
  audioNotice.style.display = 'block';
}

function setButtonActive(button, isActive) {
  if (isActive) {
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
  } else {
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
  }
}

function handleSoundButtonClick(event) {
  let button = event.currentTarget;
  let soundType = button.dataset.sound;

  if (audioNotice) {
    audioNotice.style.display = 'none';
  }

  if (currentSound === soundType) {
    SoundEngine.stop();
    currentSound = null;
    setButtonActive(button, false);
    return;
  }

  for (let i = 0; i < soundButtons.length; i += 1) {
    setButtonActive(soundButtons[i], false);
  }

  setButtonActive(button, true);
  currentSound = soundType;

  let volumeValue = 0.45;
  if (volumeSlider) {
    volumeValue = (volumeSlider.value / 100) * 0.8;
  }
  SoundEngine.play(soundType, volumeValue);
}

for (let i = 0; i < soundButtons.length; i += 1) {
  soundButtons[i].addEventListener('click', handleSoundButtonClick);
}

function handleVolumeChange() {
  if (!volumeSlider || !volumeLabel) {
    return;
  }

  let value = volumeSlider.value;
  volumeLabel.textContent = value + '%';
  SoundEngine.setVolume((value / 100) * 0.8);
}

if (volumeSlider) {
  volumeSlider.addEventListener('input', handleVolumeChange);
}

/* ============================================================
   DESTINATION TRACKER
   ============================================================ */
let TRACKER_KEY = 'tn_tracker';
let activeFilter = 'all';

function getTrackerState() {
  try {
    let saved = localStorage.getItem(TRACKER_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    return {};
  }
}

function saveTrackerState(state) {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(state));
}

function renderTracker() {
  let state = getTrackerState();
  let listEl = document.getElementById('trackerList');
  let statVisited = document.getElementById('statVisited');
  let statPlanned = document.getElementById('statPlanned');
  let statPercent = document.getElementById('statPct');

  if (!listEl || !statVisited || !statPlanned || !statPercent) {
    return;
  }

  let visitedCount = 0;
  let plannedCount = 0;

  for (let i = 0; i < DESTINATIONS.length; i += 1) {
    let destination = DESTINATIONS[i];
    if (state[destination.id] === 'visited') {
      visitedCount += 1;
    }
    if (state[destination.id] === 'planned') {
      plannedCount += 1;
    }
  }

  statVisited.textContent = visitedCount;
  statPlanned.textContent = plannedCount;
  statPercent.textContent = Math.round((visitedCount / DESTINATIONS.length) * 100) + '%';

  let filteredDestinations = [];
  for (let j = 0; j < DESTINATIONS.length; j += 1) {
    let dest = DESTINATIONS[j];
    if (activeFilter === 'visited' && state[dest.id] !== 'visited') {
      continue;
    }
    if (activeFilter === 'planned' && state[dest.id] !== 'planned') {
      continue;
    }
    filteredDestinations.push(dest);
  }

  if (filteredDestinations.length === 0) {
    listEl.innerHTML = '<li style="padding:.5rem 0;font-size:.87rem;color:let(--text-light);font-style:italic;">No destinations in this category yet.</li>';
  } else {
    listEl.innerHTML = '';
    for (let k = 0; k < filteredDestinations.length; k += 1) {
      let item = filteredDestinations[k];
      let visited = state[item.id] === 'visited';
      let planned = state[item.id] === 'planned';

      let li = document.createElement('li');
      li.className = 'tracker-item' + (visited ? ' is-visited' : planned ? ' is-planned' : '');
      li.dataset.id = item.id;

      let thumb = document.createElement('div');
      thumb.className = 'ti-thumb';
      thumb.style.backgroundImage = 'url(\'' + item.image + '\')';
      thumb.setAttribute('role', 'img');
      thumb.setAttribute('aria-label', item.name);

      let info = document.createElement('div');
      let name = document.createElement('div');
      name.className = 'ti-name';
      name.textContent = item.name;
      let country = document.createElement('div');
      country.className = 'ti-country';
      country.textContent = item.country;
      info.appendChild(name);
      info.appendChild(country);

      let actions = document.createElement('div');
      actions.className = 'ti-actions';

      let visitedButton = document.createElement('button');
      visitedButton.className = 'ti-btn btn-visited' + (visited ? ' on' : '');
      visitedButton.dataset.action = 'visited';
      visitedButton.dataset.id = item.id;
      visitedButton.setAttribute('aria-pressed', visited);
      visitedButton.textContent = visited ? '✓ Visited' : 'Visited';

      let plannedButton = document.createElement('button');
      plannedButton.className = 'ti-btn btn-planned' + (planned ? ' on' : '');
      plannedButton.dataset.action = 'planned';
      plannedButton.dataset.id = item.id;
      plannedButton.setAttribute('aria-pressed', planned);
      plannedButton.textContent = planned ? '📌 Planned' : 'Planned';

      actions.appendChild(visitedButton);
      actions.appendChild(plannedButton);

      li.appendChild(thumb);
      li.appendChild(info);
      li.appendChild(actions);
      listEl.appendChild(li);

      visitedButton.addEventListener('click', handleTrackerButtonClick);
      plannedButton.addEventListener('click', handleTrackerButtonClick);
    }
  }
}

function handleTrackerButtonClick(event) {
  let button = event.currentTarget;
  let destinationId = button.dataset.id;
  let action = button.dataset.action;
  let state = getTrackerState();

  if (state[destinationId] === action) {
    delete state[destinationId];
  } else {
    state[destinationId] = action;
  }

  saveTrackerState(state);
  renderTracker();
}

function initializeTrackerTabs() {
  let tabs = document.querySelectorAll('.tracker-tab');

  for (let i = 0; i < tabs.length; i += 1) {
    tabs[i].addEventListener('click', function () {
      for (let j = 0; j < tabs.length; j += 1) {
        tabs[j].classList.remove('active');
      }
      this.classList.add('active');
      activeFilter = this.dataset.filter;
      renderTracker();
    });
  }
}

initializeTrackerTabs();
renderTracker();
