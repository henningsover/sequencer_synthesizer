let ctx;
let synthDelay;
let filter;
let osc1;
let osc2;

function runAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();;
  let synthDelay = ctx.createDelay();
  synthDelay.delayTime.setValueAtTime(0.2, ctx.currentTime);

  let osc1;
  let osc2;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFrequency;
  filter.Q.value = filterQValue
} 