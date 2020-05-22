const sequencerWrapper = document.querySelector("#sequencerWrapper");
const playBtn = document.querySelector("#playBtn");
const bpmInput = document.querySelector("#bpmInput");
const bpmVisual = document.querySelector("#bpmVisual");
const volumeInput = document.querySelector("#volumeInput");
const volumeVisual = document.querySelector("#volumeVisual");
const filterFrequencyInput = document.querySelector("#filterFrequencyInput");
const filterFrequencyVisual = document.querySelector("#filterFrequencyVisual");
const filterQInput = document.querySelector("#filterQInput");
const filterQVisual = document.querySelector("#filterQVisual");
const delayTimeInput = document.querySelector("#delayTimeInput");
const delayTimeVisual = document.querySelector("#delayTimeVisual");
const delayFeedbackInput = document.querySelector("#delayFeedbackInput");
const delayFeedbackVisual = document.querySelector("#delayFeedbackVisual");
const delayGainInput = document.querySelector("#delayGainInput");
const delayGainVisual = document.querySelector("#delayGainVisual");
const oscillatorsGainInput = document.querySelector("#oscillatorsGainInput");
const oscillatorsGainVisual = document.querySelector("#oscillatorsGainVisual");

let sequencerIsPlaying = false;
let toneIsPlaying = false;
let patternToDraw = null;

const firstStepIndex = 0;
const lastStepIndex = 15;

const ctx = new (window.AudioContext || window.webkitAudioContext)();
// console.log(ctx.state)

let stepIndex = 0;
let osc1;
let osc2;

const masterGainNode = ctx.createGain();
let volume = 0.1;
masterGainNode.gain.value = volume;
volumeVisual.innerHTML = volume * 10;

const oscillatorsGainNode = ctx.createGain();
let oscillatorsGain = 0.1;
oscillatorsGainNode.gain.value = oscillatorsGain;
oscillatorsGainVisual.innerHTML = oscillatorsGain * 10;


const filter = ctx.createBiquadFilter();
let filterFrequency = 1000;
let filterQValue = 0;
filter.type = "lowpass";
filter.frequency.value = filterFrequency;
filter.Q.value = filterQValue
filterFrequencyInput.value = filterFrequency
filterFrequencyVisual.innerHTML = filterFrequency
filterQInput.value = filterQValue;
filterQVisual.innerHTML = filterQValue;

const synthDelay = ctx.createDelay(5.0);
let delayTimeValue = 0;
synthDelay.delayTime.value = delayTimeValue;
delayTimeVisual.innerHTML = delayTimeValue;
delayTimeInput.value = delayTimeValue;
const delayFeedbackNode = ctx.createGain();
let delayFeedback = 0;
delayFeedbackNode.gain.value = delayFeedback;
delayFeedbackVisual.innerHTML = delayFeedback * 10;
const delayGainNode = ctx.createGain();
let delayGain = 0;
delayGainNode.gain.value = delayGain;
delayGainInput.value = delayGain;
delayGainVisual.innerHTML = delayGain * 10;



let bpm = 120;
const minuteInMs = 60000;
let bpmInMs = minuteInMs / bpm;
bpmInput.value = bpm;
bpmVisual.innerHTML = bpm


const getPatterns = () => {
  patterns = JSON.parse(localStorage.getItem("patterns"));
  !patterns ? (patterns = {}) : null;
}
getPatterns();

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}


function drawSequencer() {
  // if ()
  // // let oldSequencer = document.getElementById(sequencer);
  // // console.log(oldSequencer);
  // // sequencerWrapper.removeChild(oldSequencer)
  sequencerWrapper.innerHTML = "";
  let sequencerHead = document.createElement("div");
  sequencerHead.setAttribute("id", "sequencerHead");
  sequencerHead.classList.add("sequencer__head");

  let patternSelect = document.createElement('select');
  patternSelect.setAttribute('name', "patternSelect");
  patternSelect.setAttribute('id', "patternSelect");
  patternSelect.classList.add('pattern-select');
  let patternSelectDefault = document.createElement('option');
  patternSelectDefault.setAttribute('value', "default");
  patternSelectDefault.innerHTML = "Select a pattern";
  patternSelectDefault.setAttribute('selected', "selected");
  patternSelect.appendChild(patternSelectDefault);
  if (isEmpty(patterns)) {
  } else {
    Object.keys(patterns).forEach((item) => {
      let patternOption = document.createElement('option');
      patternOption.setAttribute('value', item);
      patternOption.innerHTML = item;
      patternSelect.appendChild(patternOption);
    })
  }
  patternSelect.classList.add('pattern-select');

  let createNewBtn = document.createElement('button');
  createNewBtn.setAttribute('id', "createNewBtn");
  createNewBtn.classList.add('create-new-btn');
  createNewBtn.innerHTML = "Create new pattern";
  createNewBtn.addEventListener("click", () => {
    patternToDraw = null;

    drawSequencer();
  })

  sequencerHead.appendChild(patternSelect);
  sequencerHead.appendChild(createNewBtn);
  sequencerWrapper.appendChild(sequencerHead);

  let patternNameInput = document.createElement('input');
  patternNameInput.setAttribute('name', "patternNameInput");
  patternNameInput.setAttribute('id', "patternNameInput");
  patternNameInput.setAttribute('placeholder', "New pattern");
  if (patternToDraw !== null) {
    patternNameInput.value = patternToDraw;
  }
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
    noToneOption.setAttribute('selected', 'selected')
    toneSelect.appendChild(noToneOption);
    let holdToneOption = document.createElement("option");
    holdToneOption.setAttribute('value', "-->");
    holdToneOption.innerHTML = "-->"
    toneSelect.appendChild(holdToneOption);
    tones.forEach(tone => {
      let option = document.createElement("option");
      option.setAttribute('value', tone.toneName);
      option.classList.add('tone-option')
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
  let managePatternsBtns = document.createElement('div');
  managePatternsBtns.classList.add('manage-pattern-btns');

  let saveBtn = document.createElement('button');
  saveBtn.classList.add('save-btn');
  saveBtn.innerHTML = "Save";
  let delBtn = document.createElement('button');
  delBtn.classList.add('del-btn');
  delBtn.innerHTML = "Delete";
  managePatternsBtns.appendChild(saveBtn);
  managePatternsBtns.appendChild(delBtn);
  sequencerWrapper.appendChild(managePatternsBtns);
  if (patternToDraw !== null) {
    setPatternValues();
  }
}
drawSequencer();

function setPatternValues() {
  let steps = document.querySelectorAll(".sequencer__step");
  if (patternToDraw !== null) {
    for (let i = 0; i < steps.length; i++) {
      let toneSelect = steps[i].firstChild;
      let octaveInput = steps[i].lastChild;
      let stepName = i < 10 ? "step0" + i : "step" + i;
      toneNameToSet = patterns[patternToDraw][stepName].toneName
      octaveToSet = patterns[patternToDraw][stepName].octave
      toneSelect.value = toneNameToSet;
      octaveInput.value = octaveToSet;
    }
  }
}

bpmInput.addEventListener("input", (e) => {
  bpm = parseInt(e.target.value);
  bpmVisual.innerHTML = bpm;
  setDelayTime();
})
volumeInput.addEventListener("input", (e) => {
  volume = parseFloat(e.target.value) / 100;
  volumeVisual.innerHTML = parseFloat(e.target.value);
})
filterFrequencyInput.addEventListener("input", (e) => {
  filterFrequency = parseInt(e.target.value);
  filterFrequencyVisual.innerHTML = filterFrequency;
})
filterQInput.addEventListener("input", (e) => {
  filterQValue = parseInt(e.target.value);
  filterQVisual.innerHTML = filterQValue;
})
delayFeedbackInput.addEventListener('input', (e) => {
  delayFeedback = parseFloat(e.target.value) / 100;
  delayFeedbackVisual.innerHTML = parseFloat(e.target.value);
})
delayGainInput.addEventListener('input', (e) => {
  delayGain = parseFloat(e.target.value) / 100;
  delayGainVisual.innerHTML = parseFloat(e.target.value);
})

delayTimeInput.addEventListener("input", (e) => {
  setDelayTime();
})
oscillatorsGainInput.addEventListener('input', (e) => {
  oscillatorsGain = parseFloat(e.target.value) / 100;
  oscillatorsGainVisual.innerHTML = parseFloat(e.target.value);
})



function runSequencer() {
  // console.log(stepIndex)
  // console.log(ctx.state)
  // console.log(toneIsPlaying);
  let steps = document.querySelectorAll(".sequencer__step");
  let toneDuration = getBpm();
  let myTimeout = setTimeout(function () {
    if (sequencerIsPlaying !== true) {
      let previousStep = stepIndex - 1;
      stepIndex === 0 ? previousStep = lastStepIndex : null;
      steps[previousStep].classList.remove('selected-step')
      stepIndex = 0;
      clearTimeout(myTimeout);
    } else {
      if (stepIndex === lastStepIndex) {
        let previousStep = stepIndex - 1;
        // console.log(steps[previousStep].firstChild.value)
        if (steps[stepIndex].firstChild.value !== "-->" && steps[previousStep].firstChild.value !== "") {
          if (toneIsPlaying) {
            stopNote();
          }
        }
        steps[previousStep].classList.remove('selected-step');
        steps[stepIndex].classList.add('selected-step');
        let selectedTone = steps[stepIndex].firstChild.value;
        let selectedOctave = parseFloat(steps[stepIndex].lastChild.value);
        getTone(tones, selectedTone, selectedOctave);
        stepIndex = 0;
        // stepIndex++;
      } else {
        if (stepIndex > 0) {
          let previousStep = stepIndex - 1;
          // console.log(steps[previousStep].firstChild.value)
          if (steps[stepIndex].firstChild.value !== "-->" && steps[previousStep].firstChild.value !== "") {
            if (toneIsPlaying) {
              stopNote();
            }
          }
          steps[previousStep].classList.remove('selected-step');
        } else {
          if (steps[stepIndex].firstChild.value !== "-->") {
            if (steps[lastStepIndex].firstChild.value !== "") {
              if (toneIsPlaying) {
                stopNote();
              }
            }

          }
          steps[lastStepIndex].classList.remove('selected-step');
        }
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

  masterGainNode.gain.value = volume;

  filter.frequency.value = filterFrequency
  filter.Q.value = filterQValue;
  synthDelay.delayTime.value = delayTimeValue;
  delayFeedbackNode.gain.value = delayFeedback;
  delayGainNode.gain.value = delayGain;
  oscillatorsGainNode.gain.value = oscillatorsGain;

  osc1.connect(synthDelay);
  osc2.connect(synthDelay);
  // oscillatorsGainNode.connect(synthDelay);
  synthDelay.connect(delayFeedbackNode);
  delayFeedbackNode.connect(synthDelay);
  synthDelay.connect(delayGainNode);
  osc1.connect(oscillatorsGainNode);
  osc2.connect(oscillatorsGainNode);
  oscillatorsGainNode.connect(filter);
  delayGainNode.connect(filter)
  filter.connect(masterGainNode);
  // delayFeedbackNode.connect(masterGainNode);

  masterGainNode.connect(ctx.destination);
  osc1.start(0);
  osc2.start(0);
  toneIsPlaying = true;
}

const getBpm = () => {
  let bpmInMs = minuteInMs / bpm;
  let sixteenthNoteDuration = bpmInMs / 4;
  return sixteenthNoteDuration;
}
const setDelayTime = () => {
  let input = parseInt(delayTimeInput.value)
  console.log(input)
  let quarterNoteDuration = (minuteInMs / bpm) / 1000;
  let eightNoteDuration = quarterNoteDuration / 2;
  let eightNoteTripletDuration = quarterNoteDuration / 3;
  let sixteenthNoteDuration = eightNoteDuration / 2;
  if (input === 0) {
    delayTimeValue = 0;
    delayTimeVisual.innerHTML = 0;

  } else if (input === 1) {
    delayTimeValue = sixteenthNoteDuration;
    console.log(delayTimeValue)
    delayTimeVisual.innerHTML = "1/16";

  } else if (input === 2) {
    delayTimeValue = eightNoteTripletDuration;
    console.log(delayTimeValue)
    delayTimeVisual.innerHTML = "1/8T";

  } else if (input === 3) {
    delayTimeValue = eightNoteDuration;
    console.log(delayTimeValue)
    delayTimeVisual.innerHTML = "1/8";

  } else if (input === 4) {
    delayTimeValue = quarterNoteDuration;
    console.log(delayTimeValue)
    delayTimeVisual.innerHTML = "1/4";
  }
}

const stopNote = () => {
  // console.log("trying to stop")
  if (typeof osc1 !== "undefined" && typeof osc2 !== "undefined") {
    osc1.stop(ctx.currentTime)
    osc2.stop(ctx.currentTime)
    toneIsPlaying = false;
  }
}
let fadeOut;
const disconnectEffects = () => {
  if (typeof osc1 !== "undefined" && typeof osc2 !== "undefined") {
    synthDelay.delayTime.value = delayTimeValue;
    osc1.disconnect(0)
    osc2.disconnect(0);
    fadeOut = setTimeout(function () {
      // console.log(typeof fadeOut)
      // console.log("disconnecting")
      filter.disconnect(0);
      synthDelay.disconnect(0);
      masterGainNode.disconnect(0);
      ctx.suspend();
    }, 3000);
  }
}

const savePattern = (patternName, stepsList) => {
  let patternToAdd = {};
  for (let i = 0; i < stepsList.length; i++) {
    let toneToAdd = stepsList[i].firstChild.value;
    let octaveToAdd = stepsList[i].lastChild.value
    let stepName = i < 10 ? "step0" + i : "step" + i;
    patternToAdd = {
      ...patternToAdd,
      [stepName]: {
        toneName: toneToAdd,
        octave: octaveToAdd
      }
    }
  }
  patterns[patternName] = patternToAdd;
  localStorage.setItem("patterns", JSON.stringify(patterns));
  patternToDraw = patternName;
  drawSequencer();
}
const deletePattern = (patternToDelete) => {
  delete patterns[patternToDelete]
  localStorage.setItem("patterns", JSON.stringify(patterns));
  patternToDraw = null;
  drawSequencer();
}
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("play-btn")) {
    if (sequencerIsPlaying == false) {
      sequencerIsPlaying = true;
      if (ctx.state === "suspended") {
        ctx.resume();
      } else {
        if (typeof fadeOut !== "undefined") {
          // console.log("clearing fadeout")
          clearTimeout(fadeOut);
        }
      }

      runSequencer();
    }
    else {
      // console.log('not working');
    }
  }
})

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("stop-btn")) {
    if (sequencerIsPlaying == true) {
      sequencerIsPlaying = false;
      // stopNote();
      disconnectEffects();
    }
    else {
      // console.log('playing');
    }
  }
})
document.addEventListener("click", (e) => {
  if (e.target.classList.contains('save-btn')) {
    let patternName = document.querySelector('#patternNameInput').value;
    let steps = document.querySelectorAll(".sequencer__step");
    if (patternName == "") {
      alert("Please enter a name for this pattern")
    } else if (Object.keys(patterns).includes(patternName)) {
      let shouldSave = confirm("Pattern name already exist, do you want to overwrite pattern?")
      if (shouldSave) { savePattern(patternName, steps) };
    }
    else {
      savePattern(patternName, steps);
    }
  }
})
document.addEventListener("click", (e) => {
  if (e.target.classList.contains('del-btn')) {
    if (patternToDraw !== null) {
      let shouldDelete = confirm("Do you really want to delete this pattern?")
      if (shouldDelete) {
        deletePattern(patternToDraw);
      }
    }
  }
})
document.addEventListener("change", (e) => {
  if (e.target.classList.contains('pattern-select')) {
    patternToDraw = e.target.value;
    drawSequencer();
  }
})
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('octave-input')) {
    if (parseInt(e.target.value) < 1 || e.target.value === "") {
      e.target.value = 1
    }
    if (parseInt(e.target.value) > 5) {
      e.target.value = 5;
    }
  }
})
