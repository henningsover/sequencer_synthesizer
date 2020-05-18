let shouldStop = false;

let stepIndex = 0;
function task() {
  let myTimeout = setTimeout(function () {
    if (shouldStop === true) {
      clearTimeout(myTimeout)
    } else {
      console.log("hej")
      console.log(shouldStop)
      task();
    }
  }, 2000);
}
task();
let stopBtn = document.querySelector(".stop");
stopBtn.addEventListener("click", () => {
  shouldStop = true;
})
