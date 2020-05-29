const playBtn = document.querySelector("#playBtn");
const bpmInput = document.querySelector("#bpmInput");
const bpmVisual = document.querySelector("#bpmVisual");
const sequencer = document.querySelector("#sequencer");
const volumeInput = document.querySelector("#volumeInput");
const volumeVisual = document.querySelector("#volumeVisual");
const filterQInput = document.querySelector("#filterQInput");
const filterQVisual = document.querySelector("#filterQVisual");
const delayTimeInput = document.querySelector("#delayTimeInput");
const delayTimeVisual = document.querySelector("#delayTimeVisual");
const delayGainInput = document.querySelector("#delayGainInput");
const delayGainVisual = document.querySelector("#delayGainVisual");
const delayFeedbackInput = document.querySelector("#delayFeedbackInput");
const delayFeedbackVisual = document.querySelector("#delayFeedbackVisual");
const filterFrequencyInput = document.querySelector("#filterFrequencyInput");
const filterFrequencyVisual = document.querySelector("#filterFrequencyVisual");
const oscillatorsGainInput = document.querySelector("#oscillatorsGainInput");
const oscillatorsGainVisual = document.querySelector("#oscillatorsGainVisual");


let sequencerIsPlaying = false;
let toneIsPlaying = false;
let patternToDraw = null;

//First and last step in sequencer
const firstStepIndex = 0;
const lastStepIndex = 15;
let stepIndex = 0;


const ctx = new (window.AudioContext || window.webkitAudioContext)();
let osc1;
let osc2;

//Declaring the different parts of the synthesizer and setting their initial values
const masterGainNode = ctx.createGain();
let volume = 0.1;
masterGainNode.gain.value = volume;
volumeVisual.innerHTML = volume * 100;
volumeInput.value = volume * 100

const oscillatorsGainNode = ctx.createGain();
let oscillatorsGain = 0.1;
oscillatorsGainNode.gain.value = oscillatorsGain;
oscillatorsGainVisual.innerHTML = oscillatorsGain * 100;
oscillatorsGainInput.value = oscillatorsGain * 100

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
delayFeedbackInput.value = delayFeedback * 10;
const delayGainNode = ctx.createGain();
let delayGain = 0;
delayGainNode.gain.value = delayGain;
delayGainInput.value = delayGain;
delayGainVisual.innerHTML = delayGain * 10;

//Declaring the beats per minute variable and setting the initial tempo value
let bpm = 120;
const minuteInMs = 60000;
let bpmInMs = minuteInMs / bpm;
bpmInput.value = bpm;
bpmVisual.innerHTML = bpm

//Function to check whether the pattern object contains any patterns or not
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}


const getPatterns = () => {
  patterns = JSON.parse(localStorage.getItem("patterns"));
  if (!patterns) {
    patterns = {};
  }
}
getPatterns();


function loadAndSetPresets() {
  Object.keys(presetPatterns).forEach(function (pattern) {
    let currentPattern = presetPatterns[pattern];
    let patternToAdd = {}
    Object.keys(currentPattern).forEach(function (step) {
      patternToAdd = {
        ...patternToAdd,
        [step]: {
          toneName: currentPattern[step].toneName,
          octave: currentPattern[step].octave
        }
      }
    })
    patterns[pattern] = patternToAdd;
  })
  localStorage.setItem("patterns", JSON.stringify(patterns));
  drawSequencer();
}

function drawSequencer() {
  sequencer.innerHTML = "";
  let sequencerHead = document.createElement("div");
  sequencerHead.setAttribute("id", "sequencerHead");
  sequencerHead.classList.add("sequencer__head");

  let sequencerHeading = document.createElement('h3');
  sequencerHeading.classList.add('sequencer__head__heading');
  sequencerHeading.innerHTML = "Sequencer";

  let patternSelection = document.createElement('div');
  patternSelection.classList.add('sequencer__head__patterns')

  let patternSelect = document.createElement('select');
  patternSelect.setAttribute('name', "patternSelect");
  patternSelect.setAttribute('id', "patternSelect");
  patternSelect.classList.add('pattern-select');
  let patternSelectDefault = document.createElement('option');
  patternSelectDefault.setAttribute('value', "default");
  patternSelectDefault.innerHTML = "Select a pattern";
  patternSelectDefault.setAttribute('selected', "selected");
  patternSelect.appendChild(patternSelectDefault);

  //If there is any patterns in local storage or
  //if the user loaded presets
  if (isEmpty(patterns)) {
  } else {
    Object.keys(patterns).forEach((item) => {
      let patternName = item;
      let patternNameDisplay = patternName.length > 30 ? patternName.slice(0, 30) + "..." : patternName;
      let patternOption = document.createElement('option');
      patternOption.setAttribute('value', patternName);
      patternOption.innerHTML = patternNameDisplay;
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
  patternSelection.appendChild(patternSelect);
  patternSelection.appendChild(createNewBtn);
  sequencerHead.appendChild(sequencerHeading);
  sequencerHead.appendChild(patternSelection);
  sequencer.appendChild(sequencerHead);

  let namePlay = document.createElement('div');
  namePlay.classList.add('name-and-play');

  let patternNameInput = document.createElement('input');
  patternNameInput.setAttribute('name', "patternNameInput");
  patternNameInput.setAttribute('id', "patternNameInput");
  patternNameInput.setAttribute('placeholder', "Pattern name (max 30)");
  patternNameInput.setAttribute("maxlength", 30)
  if (patternToDraw !== null) {
    patternNameInput.value = patternToDraw;
  }
  let startStop = document.createElement('div');
  startStop.classList.add('start-stop-btns');
  let playBtn = document.createElement('button');
  playBtn.setAttribute('id', 'playBtn');
  playBtn.classList.add('play-btn');
  playBtn.innerHTML = "Play";
  let stopBtn = document.createElement('button');
  stopBtn.setAttribute('id', 'stopBtn');
  stopBtn.classList.add('stop-btn');
  stopBtn.innerHTML = "Stop";

  startStop.appendChild(playBtn);
  startStop.appendChild(stopBtn);

  namePlay.appendChild(patternNameInput);
  namePlay.appendChild(startStop);
  sequencer.appendChild(namePlay);


  let sequencerWrapper = document.createElement('div');
  sequencerWrapper.classList.add("sequencer__wrapper");
  sequencerWrapper.setAttribute("id", "sequencerWrapper");

  for (let i = 0; i < 16; i++) {
    let stepWrapper = document.createElement("div");
    stepWrapper.setAttribute('id', `stepWrapper${i}`);
    stepWrapper.setAttribute('name', `stepWrapper${i}`);
    stepWrapper.classList.add('sequencer__wrapper__step');
    let toneSelect = document.createElement("select");
    toneSelect.setAttribute('id', `toneSelect${i}`);
    toneSelect.classList.add("tone-select");
    //Set empty option for quiet step
    let noToneOption = document.createElement("option");
    noToneOption.setAttribute('value', "");
    noToneOption.setAttribute('selected', 'selected')
    toneSelect.appendChild(noToneOption);
    //Set arrow option to keep previous tone ringing
    let holdToneOption = document.createElement("option");
    holdToneOption.setAttribute('value', "-->");
    holdToneOption.innerHTML = "-->"
    toneSelect.appendChild(holdToneOption);
    //Get every toneName from tones.js and set them to select options
    tones.forEach(tone => {
      let option = document.createElement("option");
      option.setAttribute('value', tone.toneName);
      option.classList.add('tone-option')
      option.innerHTML = tone.toneName;
      toneSelect.appendChild(option);
    });
    let octaveWrapper = document.createElement('div');
    octaveWrapper.classList.add('octave');
    let octaveInput = document.createElement('input');
    octaveInput.setAttribute("type", "number");
    octaveInput.setAttribute("id", `octaveInput${i}`);
    octaveInput.setAttribute("name", `octaveInput${i}`);
    octaveInput.setAttribute("min", "1");
    octaveInput.setAttribute("max", "5");
    octaveInput.value = 3;
    octaveInput.classList.add("octave__input");
    let plusBtn = document.createElement('button');
    plusBtn.classList.add('octave__plus-btn');
    plusBtn.classList.add('qty-btns');
    plusBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    let minusBtn = document.createElement('button');
    minusBtn.classList.add('octave__minus-btn');
    minusBtn.classList.add('qty-btns');
    minusBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    stepWrapper.appendChild(toneSelect);
    octaveWrapper.appendChild(minusBtn);
    octaveWrapper.appendChild(octaveInput);
    octaveWrapper.appendChild(plusBtn);
    stepWrapper.appendChild(octaveWrapper);
    sequencerWrapper.appendChild(stepWrapper);
  }
  sequencer.appendChild(sequencerWrapper);
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
  sequencer.appendChild(managePatternsBtns);
  if (patternToDraw !== null) {
    setPatternValues();
  }
}
drawSequencer();
//If localStorage is empty the user gets to
//load in preset patterns
if (isEmpty(patterns)) {
  let shouldLoadPresets = confirm("No saved patterns from before, do you wish to load in presets?");
  if (shouldLoadPresets) {
    loadAndSetPresets();
  }
}

function setPatternValues() {
  let steps = document.querySelectorAll(".sequencer__wrapper__step");
  if (patternToDraw !== null) {
    for (let i = 0; i < steps.length; i++) {
      let toneSelect = steps[i].firstChild;
      let octaveInput = steps[i].lastChild.children[1];
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
  let steps = document.querySelectorAll(".sequencer__wrapper__step");
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
        if (steps[stepIndex].firstChild.value !== "-->" && steps[previousStep].firstChild.value !== "") {
          if (toneIsPlaying) {
            stopNote();
          }
        }
        steps[previousStep].classList.remove('selected-step');
        steps[stepIndex].classList.add('selected-step');
        let selectedTone = steps[stepIndex].firstChild.value;
        let selectedOctave = parseFloat(steps[stepIndex].lastChild.children[1].value);
        getTone(tones, selectedTone, selectedOctave);
        stepIndex = 0;
      } else {
        if (stepIndex !== firstStepIndex) {
          let previousStep = stepIndex - 1;
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
          if (steps[lastStepIndex].classList.contains('selected-step')) {
            steps[lastStepIndex].classList.remove('selected-step');
          }
        }
        steps[stepIndex].classList.add('selected-step');
        let selectedTone = steps[stepIndex].firstChild.value;
        let selectedOctave = parseFloat(steps[stepIndex].lastChild.children[1].value);
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
  let minuteInMs = 60000;
  let bpmInMs = minuteInMs / bpm;
  let sixteenthNoteDuration = bpmInMs / 4;
  return sixteenthNoteDuration;
}
const setDelayTime = () => {
  let input = parseInt(delayTimeInput.value)
  let quarterNoteDuration = (minuteInMs / bpm) / 1000;
  let eightNoteDuration = quarterNoteDuration / 2;
  let eightNoteTripletDuration = quarterNoteDuration / 3;
  let sixteenthNoteDuration = eightNoteDuration / 2;
  if (input === 0) {
    delayTimeValue = 0;
    delayTimeVisual.innerHTML = 0;

  } else if (input === 1) {
    delayTimeValue = sixteenthNoteDuration;
    delayTimeVisual.innerHTML = "1/16";

  } else if (input === 2) {
    delayTimeValue = eightNoteTripletDuration;
    delayTimeVisual.innerHTML = "1/8T";

  } else if (input === 3) {
    delayTimeValue = eightNoteDuration;
    delayTimeVisual.innerHTML = "1/8";

  } else if (input === 4) {
    delayTimeValue = quarterNoteDuration;
    delayTimeVisual.innerHTML = "1/4";
  }
}

const stopNote = () => {
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
    let octaveToAdd = stepsList[i].lastChild.children[1].value
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
          clearTimeout(fadeOut);
        }
      }
      runSequencer();
    }
  }
})

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("stop-btn")) {
    if (sequencerIsPlaying == true) {
      sequencerIsPlaying = false;
      disconnectEffects();
    }
  }
})

document.addEventListener("click", (e) => {
  if (e.target.classList.contains('save-btn')) {
    let patternName = escapeHtml(document.querySelector('#patternNameInput').value);
    let steps = document.querySelectorAll(".sequencer__wrapper__step");
    if (patternName == "") {
      alert("Please enter a name for this pattern")
    } else if (Object.keys(patterns).includes(patternName)) {
      let shouldSave = confirm("Pattern name already exist, do you want to overwrite pattern?")
      if (shouldSave) { savePattern(patternName, steps) };
    } else if (!patternName.replace(/\s/g, '').length) {
      alert("Pattern name can't be just whitespace")
    }
    else {
      savePattern(patternName, steps);
    }
  }
})

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

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
    stopNote();
    drawSequencer();
  }
})

document.addEventListener('input', (e) => {
  if (e.target.classList.contains('octave__input')) {
    if (parseInt(e.target.value) < 1 || e.target.value === "") {
      e.target.value = 1
    }
    if (parseInt(e.target.value) > 5) {
      e.target.value = 5;
    }
  }
})
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('octave__plus-btn')) {
    let plusButton = e.target;
    let input = plusButton.parentNode.children[1];

    if (parseInt(input.value) !== 5) {
      input.value++;
    }
  }
})
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('octave__minus-btn')) {
    let minusButton = e.target;
    let input = minusButton.parentNode.children[1];

    if (parseFloat(input.value) !== 1) {
      input.value = parseFloat(input.value) - 1;
    }
  }
})

const isPortrait = () => {
  let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  let viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return viewportHeight > viewportWidth;
}


const showHideWrappers = () => {
  let effects = document.querySelectorAll(".drawbars__section__wrapper")
  let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  effects.forEach(effect => {
    if (isPortrait()) {
      if (viewportWidth < 550) {
        effect.classList.add("hidden");
      }
    } else {
      effect.classList.remove("hidden");
    }
  });
}

showHideWrappers();
const openBtns = document.querySelectorAll('.open')
openBtns.forEach(btn => {
  btn.addEventListener("click", function (e) {
    if (isPortrait()) {
      let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      if (viewportWidth < 550) {
        let effectToHide = e.target.parentNode.nextElementSibling
        let buttonToUpdate = e.target.children[0]
        effectToHide.classList.toggle("hidden");
        if (effectToHide.classList.contains("hidden")) {
          buttonToUpdate.classList.remove("fa-times");
          buttonToUpdate.classList.add("fa-chevron-down");
        } else {
          buttonToUpdate.classList.remove("fa-chevron-down");
          buttonToUpdate.classList.add("fa-times");
        }
      }
    }
  })
});
window.addEventListener("resize", showHideWrappers);

let viewportWidth = window.innerWidth || document.documentElement.clientWidth;
if (isPortrait && viewportWidth < 550) {
  alert('Turn device to max experience')
}