const sequencerWrapper = document.querySelector("#sequencerWrapper");
const playBtn = document.querySelector("#playBtn");
const bpmInput = document.querySelector("#bpmInput");
const bpmVisual = document.querySelector("#bpmVisual");
const volumeInput = document.querySelector("#volumeInput");
const volumeVisual = document.querySelector("#volumeVisual");
let sequencerIsPlaying = false;
const firstStepIndex = 0;
const lastStepIndex = 15;
const ctx = new (window.AudioContext || window.webkitAudioContext)();
let synthDelay = ctx.createDelay();
synthDelay.delayTime.setValueAtTime(0.2, ctx.currentTime);
let stepIndex = 0;
let osc1;
let osc2;
let bpm = 120;
const minuteInMs = 60000;
let bpmInMs = minuteInMs / bpm;
bpmInput.value = bpm;
bpmVisual.innerHTML = bpm
const _gainNode = ctx.createGain();
let volume = 0.1;
_gainNode.gain.value = volume;
volumeVisual.innerHTML = volume * 10;



function drawSequencer() {
  let sequencerHead = document.createElement("div");
  sequencerHead.setAttribute("id", "sequencerHead");
  sequencerHead.classList.add("sequencer__head");

  let patternSelect = document.createElement('select');
  patternSelect.setAttribute('name', "patternSelect");
  patternSelect.setAttribute('id', "patternSelect");
  patternSelect.classList.add('pattern-select');

  let createNewBtn = document.createElement('button');
  createNewBtn.setAttribute('id', "createNewBtn");
  createNewBtn.classList.add('create-new-btn');
  createNewBtn.innerHTML = "Create new pattern";
  createNewBtn.addEventListener("click", () => {
    sequencerWrapper.innerHTML = "";
    drawSequencer();
  })

  sequencerHead.appendChild(patternSelect);
  sequencerHead.appendChild(createNewBtn);
  sequencerWrapper.appendChild(sequencerHead);

  let patternNameInput = document.createElement('input');
  patternNameInput.setAttribute('name', "patternNameInput");
  patternNameInput.setAttribute('id', "patternNameInput");
  patternNameInput.setAttribute('placeholder', "New pattern");
  sequencerWrapper.appendChild(patternNameInput);


  let sequencer = document.createElement('div');
  sequencer.classList.add("sequencer");
  sequencer.setAttribute("id", "sequencer");

  for (let i = 0; i < 16; i++) {
    let stepWrapper = document.createElement("div");
    stepWrapper.setAttribute('id', `stepWrapper${i}`);
    stepWrapper.setAttribute('name', `stepWrapper${i}`);
    stepWrapper.classList.add('sequencer__step');
    let toneSelect = document.createElement("select");
    toneSelect.setAttribute('id', `toneSelect${i}`);
    toneSelect.classList.add("tone-select");
    let noToneOption = document.createElement("option");
    noToneOption.setAttribute('value', "");
    toneSelect.appendChild(noToneOption);
    let holdToneOption = document.createElement("option");
    holdToneOption.setAttribute('value', "-->");
    holdToneOption.innerHTML = "-->"
    toneSelect.appendChild(holdToneOption);
    tones.forEach(tone => {
      let option = document.createElement("option");
      option.setAttribute('value', tone.toneName);
      option.innerHTML = tone.toneName;
      toneSelect.appendChild(option);
    });
    let octaveInput = document.createElement('input');
    octaveInput.setAttribute("type", "number");
    octaveInput.setAttribute("id", `octaveInput${i}`);
    octaveInput.setAttribute("name", `octaveInput${i}`);
    octaveInput.setAttribute("min", "1");
    octaveInput.setAttribute("max", "5");
    octaveInput.value = 3;
    octaveInput.classList.add("octave-input");
    stepWrapper.appendChild(toneSelect);
    stepWrapper.appendChild(octaveInput)
    sequencer.appendChild(stepWrapper);
  }
  sequencerWrapper.appendChild(sequencer);
}
drawSequencer();




let steps = document.querySelectorAll(".sequencer__step");

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("play-btn")) {
    if (sequencerIsPlaying == false) {
      sequencerIsPlaying = true;
      ctx.resume();

      runSequencer();
    }
    else {
      console.log('not working');
    }
  }
})
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("stop-btn")) {
    if (sequencerIsPlaying == true) {
      sequencerIsPlaying = false;
      stopNote();
    }
    else {
      console.log('playing');
    }
  }
})
bpmInput.addEventListener("input", (e) => {
  bpm = parseInt(e.target.value);
  bpmVisual.innerHTML = bpm;
})
volumeInput.addEventListener("input", (e) => {
  volume = parseFloat(e.target.value) / 10;
  volumeVisual.innerHTML = parseFloat(e.target.value);
})

function runSequencer() {
  let toneDuration = getBpm();
  let myTimeout = setTimeout(function () {
    if (sequencerIsPlaying !== true) {
      let previousStep = stepIndex - 1;
      steps[previousStep].classList.remove('selected-step');
      stepIndex = 0;
      clearTimeout(myTimeout);
    } else {
      if (stepIndex == lastStepIndex) {
        let previousStep = stepIndex - 1;
        if (steps[stepIndex].firstChild.value !== "-->") {
          stopNote();
        }
        steps[previousStep].classList.remove('selected-step');
        steps[stepIndex].classList.add('selected-step');
        let selectedTone = steps[stepIndex].firstChild.value;
        let selectedOctave = parseFloat(steps[stepIndex].lastChild.value);
        getTone(tones, selectedTone, selectedOctave);
        stepIndex = 0;
        // stepIndex++;
      } else {
        if (steps[stepIndex].firstChild.value !== "-->") {
          stopNote();
        }
        if (stepIndex > 0) {
          let previousStep = stepIndex - 1;
          steps[previousStep].classList.remove('selected-step');
        }
        steps[lastStepIndex].classList.remove('selected-step');
        steps[stepIndex].classList.add('selected-step');
        let selectedTone = steps[stepIndex].firstChild.value;
        let selectedOctave = parseFloat(steps[stepIndex].lastChild.value);
        getTone(tones, selectedTone, selectedOctave);
        stepIndex++;
      }
      runSequencer();
    }
  }, toneDuration);
}

const getTone = (data, selectedTone, selectedOctave) => {
  let [chosenTone] = data.filter(tone => {
    return tone.toneName == selectedTone;
  });
  if (typeof chosenTone !== "undefined") {
    playNote(chosenTone, selectedOctave);
  }
};

function playNote(chosenTone, octave) {
  if (ctx.state !== "running") {
    ctx.resume()
  }
  let toneFrequency = chosenTone["freq"] * Math.pow(2, (octave - 1));
  let osc1Wave = document.querySelector("input[name=osc1_waves]:checked").value;
  osc1 = ctx.createOscillator();
  osc1.type = osc1Wave;
  osc1.frequency.value = toneFrequency;

  let osc2Wave = document.querySelector("input[name=osc2_waves]:checked").value;
  osc2 = ctx.createOscillator();
  osc2.type = osc2Wave;
  osc2.frequency.value = toneFrequency;
  osc2.detune.value = 10;
  _gainNode.gain.value = volume;

  osc1.start(0);
  osc2.start(0);
  osc1.connect(_gainNode);
  osc2.connect(_gainNode);
  _gainNode.connect(ctx.destination);
}

const getBpm = () => {
  let bpmInMs = minuteInMs / bpm;
  let sixteenthNoteDuration = bpmInMs / 4;
  return sixteenthNoteDuration;
}

const stopNote = () => {
  if (typeof osc1 !== "undefined" && typeof osc2 !== "undefined") {
    osc1.disconnect();
    osc2.disconnect();
  }
}
