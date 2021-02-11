var aws = require("aws-sdk");
var dynamo = new aws.DynamoDB.DocumentClient();
var ses = new aws.SES({ region: "us-east-1" });
var crypto = require('crypto');
require('dotenv').config();


exports.handler = (event, context, callback) => {

    let message = JSON.parse(event.Records[0].Sns.Message);
    console.log(JSON.stringify(message));


    let dataContent = {

        answer_uid: message.userDetails.id,
        answer_id: message.answerDetails.answer_id,
        answer_text: message.AnswerText,
        question_uid : message.ToAddresses.id,
        question_id: message.questionDetails.question_id,
        type: message.type

    };

    let myHash = dataContent.question_uid + "," + dataContent.question_id + "," + dataContent.answer_uid + "," + dataContent.answer_id + "," + message.type;

    if(message.type === 'POST'){
        myHash = dataContent.question_uid + "," + dataContent.question_id + "," + dataContent.answer_uid + "," + dataContent.answer_text + "," + message.type;
    }

    let hashSum = crypto.createHash('sha256');
    hashSum.update(myHash);

    let hashGenerated = hashSum.digest('hex');

    let searchParams = {
        TableName: "csye6225",
        Key: {
            "email_hash": hashGenerated
        }
    };

    dynamo.get(searchParams, function(error, retrievedRecord){

        let isPresent = false;
        const currentTime = Math.floor(Date.now() / 1000);
        let timeToLive = 60 * 5;
        const lapses = timeToLive + currentTime;
    
        if(error) {

            console.log("error in dynamo get",error);

        } else {

            console.log(JSON.stringify("records got: ",retrievedRecord));

            if (retrievedRecord.Item == null || retrievedRecord.Item == undefined) {
                isPresent = false;
            } else {
                if(retrievedRecord.Item.ttl < Math.floor(Date.now() / 1000))
                    isPresent = false
                else
                    isPresent = true;
            }

            if(!isPresent) {

                const params = {
                    Item: {
                        email_hash: hashGenerated,
                        ttl: lapses,
                        time_created: new Date().getTime(),
                    },
                    TableName: "csye6225"
                }

                dynamo.put(params, function (error, data) {

                    if (!error){

                        sendEmail(message, message.question, message.answer);

                    } else {

                        console.log("put in db error",error);
                    }
                });
                
            } else {
                 console.log("already present");
                 console.log("cannot send email,already present")
            }
        }
    })
};

var sendEmail = (message, Question, Answer) => {

    let newUpdated= "";
    let URL_LINKS = "";
    let Answernew = "";

    if(message.type === "POST")
        newUpdated = "Answer posted ";
    else if(message.type === "UPDATE"){
        newUpdated = "Answer Updated ";
        Answernew = "Answer_Text: "+message.AnswerText+"\n"
    }else
        newUpdated = "Answer Deleted ";

    if(message.type === "POST")
        URL_LINKS = "Question URL: https://"+message.questionAPI+"\n"+
            "Answer URL: https://"+message.answerAPI+"\n"
    else if(message.type === "UPDATE")
        URL_LINKS = "QUestion URL: https://"+message.questionAPI+"\n"+
            "Answer URL: https://"+message.answerAPI+"\n"
    else 
        URL_LINKS = "Question URL: https://"+message.questionAPI+"\n"


    let data = newUpdated +".\n\n\n" + "QUESTION :-\n" +
        "Question ID: " + message.questionDetails.question_id +"\n" +
        "Question Text: " + message.questionDetails.question_text +"\n\n\n"+
        "User EmailAddress: " + message.ToAddresses.emailAddress +"\n\n" +
        "ANSWER :-\n" + "Answer ID: " + message.answerDetails.answer_id +"\n"+
        "Answer Text: "+ message.answerDetails.answer_text +"\n"+
        "URLs: " +"\n\n"+ URL_LINKS

    let fromMail = "no-reply@"+process.env.DOMAIN
    let emailParams = {
        Destination: {
            ToAddresses: [message.ToAddresses.emailAddress],
        },
        Message: {
            Body: {
                Text: { Data: data
                },
            },

            Subject: { Data: "CSYE6225 SES DEMO" },
        },
        Source: fromMail,
    };

    let sendEmailPromise = ses.sendEmail(emailParams).promise()
    sendEmailPromise
        .then(function(result) {
            console.log(result);
        })
        .catch(function(err) {
            console.error(err, err.stack);
        });
}