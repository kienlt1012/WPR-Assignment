const StartBtn = document.querySelector('.StartButton');
const SubmitBtn = document.querySelector('.SubmitButton');
const TryAgainBtn = document.querySelector('.TryAgainButton');
const StartPage = document.querySelector('#introduction');
const attemptPage = document.querySelector('#attempt-quiz');
const reviewPage = document.querySelector('#review-quiz');

function ReturnPage(){
    window.location.reload();
}
StartBtn.addEventListener("click",()=>{
    StartPage.classList.toggle("hidden")
    attemptPage.classList.toggle("hidden")
})
SubmitBtn.addEventListener("click",()=>{
    attemptPage.classList.toggle("hidden")
    reviewPage.classList.toggle("hidden") 
    showResult();
})
TryAgainBtn.addEventListener("click",()=>{
    window.location.reload()
})

async function AttemptAPI(){
    const response = await fetch('127.0.0.1:3000/attempts',{
        method:"POST",
        header:{
            'Content-Type':'application/json'
        },
    });
    return response.json();
}

var state = {
    answers:{

    }
};

var idAttempt;
AttemptAPI().then(data=>{
    appendData(data.questions);
    idAttempt=data._id;
});
function createQuestion(data, i){
    const divQuestions = document.createElement("label");
    divQuestions.setAttribute('class','question');
    divQuestions.setAttribute('id',data[i]._id);
    let id = data[i]._id;
    state.id = null;
    let h1 = document.createElement("h1");
    h1.textContent = 'Question '+(i+1)+' of 10: ';
    let p = document.createElement('p');
    p.textContent=data[i].text;
    divQuestions.appendChild(h1);
    divQuestions.appendChild(p);
    return divQuestions;
}

function createAnswers(data, i) {
    const divAnswers = document.createElement('div');
    for(let j=0; j<data[i].answers.length;j++){
        const labelAnswer = document.createElement('label');
        labelAnswer.setAttribute('class','answer');
        labelAnswer.title = j;
        labelAnswer.id = data[i]._id;
        const radio = document.createElement('input');
        radio.setAttribute('type','radio');
        radio.name = 'question'+(i+1);
        radio.value = j;
        radio.setAttribute('id', data[i]._id);
        const span = document.createElement('span');
        const p = document.createElement('p');
        var content = data[i].answers[j];
        p.textContent=content;

        
        labelAnswer.appendChild(radio);
        labelAnswer.appendChild(span);
        labelAnswer.appendChild(p);
        divAnswers.appendChild(labelAnswer);
    }
    return divAnswers;
}
function appendData(data){
    const QuestionContainer = document.querySelector('#question');
    for(let i=0; i<10; i++){
        divQuestions=createQuestion(data, i);
        QuestionContainer.appendChild(divQuestions);
        divAnswers=createAnswers(data, i);
        QuestionContainer.appendChild(divAnswers);
    }
}

function getResult(){
    const inputs = document.querySelectorAll('input');
    for(input of inputs){
        if(input.checked){
            state.answers[input.id]=input.value;
        }
    }
}
async function SubmitAPI(){
    getResult();
    const response = await fetch(('https://wpr-quiz-api.herokuapp.com/attempts/'+idAttempt+'/submit'),{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(state)
    });
    return response.json();
}
function disable(){
    var inputs = document.querySelectorAll('input[type="radio"]');
    for(var i = 0; i < inputs.length; i++){
        inputs[i].disabled = 'true';
    }
}

function showResult(){
    const score = document.querySelector('#score');
    const percent = document.querySelector('#Percent');
    const reviewtext = document.querySelector('#review-text');
    SubmitAPI().then(data => {
        appendReview(data);
        score.textContent = data.score +"/10";
        percent.textContent = data.score*10+"%";
        reviewtext.textContent = data.scoreText;
    })
}
function appendReview(data){
    disable();
    document.querySelectorAll('input').disabled=true;
    const ReviewSite = document.querySelector('#review');
    const questions = document.querySelector('#question');
    var cloneQuestions = questions.cloneNode(true);
    const answers = cloneQuestions.querySelectorAll('.answer');
    const correctAnswers = data.correctAnswers;
    for(answer of answers){
        const input = answer.querySelector('input');
        if(answer.title == correctAnswers[answer.id] && input.checked){
            answer.classList.add("isCorrect");
            const divtext = document.createElement('div');
            divtext.setAttribute('class','label-checked');
            divtext.textContent = 'Correct Answer';
            answer.appendChild(divtext);
        }else if(answer.title != correctAnswers[answer.id]&&input.checked){
            answer.classList.add("isWrong");
            const divtext = document.createElement('div');
            divtext.setAttribute('class','your-answer');
            divtext.textContent = 'Your Answer';
            answer.appendChild(divtext);
        }else if(answer.title == correctAnswers[answer.id]){
            answer.classList.add("CorrectAnswer");
            const divtext = document.createElement('div');
            divtext.setAttribute('class','label-checked');
            divtext.textContent='Correct Answer';
            answer.appendChild(divtext);
        }
        
    }
    ReviewSite.appendChild(cloneQuestions);
}
