const {createApp} = Vue
createApp({
    data() {return {
        name: '',
        prizeMoney: 0,
        excessTime: 0,
        question: "",
        content: "",
        answer: undefined,
        currentQuestion: 0,
        myTimer: 0,
        handle: undefined,
        questionPrize: 100,
        dataSent: false,
        dataRendered: false,
        highScores: [],
        }
    },
    methods: {
        startGame: function () {
            document.getElementById("start_container").style.display = 'none' //hide the start screen
            document.getElementById("game_container").style.display = 'block' //show the game screen
            document.addEventListener('keyup', this.onKeyup);
            this.displayQuestion()
        },
        displayQuestion: async function () {
            document.getElementById("background-video").playbackRate = 0.6
            if(this.currentQuestion == 15) this.winGame()
            this.setTimer()
            this.setPrizeMoney()

            const response = await fetch("questions.json")
            const json = await response.json()
            let gameQuestions = [json.games[Math.floor(Math.random() * 5)]] //randomly select a set
            this.question = gameQuestions[0].questions[this.currentQuestion].question
            this.content = gameQuestions[0].questions[this.currentQuestion].content
            this.answer = gameQuestions[0].questions[this.currentQuestion].correct
        },
        checkAnswer: function (key) {
                if (key == this.answer) {
                    this.excessTime = this.excessTime + this.myTimer
                    this.currentQuestion++
                    this.displayQuestion()
                } else {
                    this.endGame();
                }
        },
        startTimer: function (secs){
            this.myTimer = secs;
            let countdown = function () {
                this.myTimer--;
               if(this.myTimer == 0) this.endGame();
            }
            this.handle = setInterval(countdown.bind(this), 1000)

        },
        endGame: function (){
            document.getElementById("game_container").style.display = 'none' //hide the game screen
            document.getElementById("end_container").style.display = 'block' //show the end screen
            document.removeEventListener('keyup', this.onKeyup);
            this.submitStats()
            this.renderHighScores()
        },
        setPrizeMoney: function (){
            //set the prize money for the current question
            if(this.currentQuestion == 1) this.questionPrize = 200
            else if(this.currentQuestion == 2) this.questionPrize = 300
            else if(this.currentQuestion == 3) this.questionPrize = 500
            else if(this.currentQuestion > 3) this.questionPrize *= 2

            //set the take home prize money if a certain question is reached
            if(this.currentQuestion == 5) this.prizeMoney = 1000;
            else if(this.currentQuestion == 10) this.prizeMoney = 32000;
        },
        setTimer: function (){
            clearInterval(this.handle); //clear the interval
            //set timer based on the current question
            if(this.currentQuestion < 5)  this.startTimer(15);
            else if(this.currentQuestion < 10 && this.currentQuestion > 4)  this.startTimer(30);
            else if(this.currentQuestion < 14 && this.currentQuestion > 9)  this.startTimer(45);
            else{
                this.startTime(45+this.excessTime)
            }
        },
        winGame: function (){
            document.getElementById("game_container").style.display = 'none' //hide the game screen
            document.getElementById("win_container").style.display = 'block' //show the end screen
            document.removeEventListener('keyup', this.onKeyup);
            this.submitStats()
            this.renderHighScores()
        },
        submitStats: function (){
            if(this.dataSent == false) {
                db.collection("highScores").add({
                    userName: this.name,
                    questionNumber: this.currentQuestion,
                    moneyEarned: this.prizeMoney
                })
                this.dataSent = true;
            }
        },
        renderHighScores: function (){
            if(this.dataRendered == false) {
                db.collection("highScores").onSnapshot(
                    snapshot => {
                        this.dataRendered = true;
                        let changes = snapshot.docChanges()
                        changes.forEach(
                            change => {
                                let doc = change.doc;
                                this.highScores.push({
                                    userName: doc.data().userName,
                                    questionReached: doc.data().questionNumber,
                                    moneyEarned: doc.data().moneyEarned
                                });})})}
        },
        onKeyup(event) {
            if(event.key == 'a') this.checkAnswer(0);
            else if(event.key == 'b') this.checkAnswer(1);
            else if(event.key == 'c') this.checkAnswer(2);
            else if(event.key == 'd') this.checkAnswer(3);
            },
           }}).mount("#main_container")