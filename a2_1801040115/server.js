
const express = require('express');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const DB_NAME = "wpr-quiz";
const DB_URL = `mongodb://localhost:27017/${DB_NAME}`;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('index.html', express.static('public'));

let db = null;
async function startServer(){
    const client =await mongodb.MongoClient.connect(DB_URL);
    db = client.db();
    
    console.log("connected to db");
     
    await app.listen(3000, function(){
        console.log("Listening on port 3000!");
    });
}
startServer();

app.post("/attempts", async function(req, res){
    const questions_db = await db.collection('questions').aggregate([{$sample:{size:10}}]).toArray();
    let attempt = {};
    let quest=[];
    let correctanswer = {};
    let date = new Date();
    for(question in questions_db){
        let new_question = {};
        new_question = {
            _id:questions_db[question]._id,
            text:questions_db[question].text,
            answers:questions_db[question].answers,
            __v:0
        }
        quest.push(new_question);
    }
    date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+'-'+date.getHours()+'-'+date.getMinutes()+'-'+date.getMilliseconds();
    attempt = {
        questions:quest,
        completed:false,
        score:0,
        startAt: date,
        __v:0
    };
    res.json(attempt); 
}); 

