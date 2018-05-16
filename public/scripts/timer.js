var numberOfQuestion = document.getElementsByClassName("question").length;
var remainingTime = document.getElementById("remainingTime");
var quiz = document.getElementById("quiz")

function startTimer(duration) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        remainingTime.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
           quiz.submit();
        }
    }, 1000);
}

// startTimer(5);
startTimer(60 * numberOfQuestion);
