// survery
let surveyObject = {};
const ACTION = "Submitted_vod";
let ANSWER = null;

$(document).ready(function() {

    // drag
    $(".slider-range-min").slider({
        range: "min",
        value: 0,
        min: 0,
        max: 100,
        step: 5,
        slide: function(event, ui) {
            var id = $(this).parent().attr("id");
            $("#" + id + " .amount").val(ui.value);
            $("#" + id + " .num").html(ui.value);
            $("#" + id + " .num").attr('data-value', ui.value);
            if (ui.value >= 5) {
                $('.btn_sub').addClass('on');
            } else {
                $('.btn_sub').removeClass('on');
            }
        }
    });

    let drag_handel = $(".ui-slider-handle");
    let data_val = $(".slider-range-min").slider("value");
    // train bg
    drag_handel.append("<div class='train'></div>");
    // value
    drag_handel.append(`<div class='num_wrap'><span class='num' data-value='${data_val}'>${data_val}</span></div>`);
    $(".amount").val($(".slider-range-min").slider("value"));


    // submit
    let btnSave = $(".btn_sub");
    btnSave.on("click", function(e) {
        // setSurveyResult()
        //     .then(res => submitSurvey(surveyObject, ACTION));

        submitSurvey(surveyObject, ACTION);
        setTimeout(() => {
            com.vclm.mt.gotoSlide('Xospata_sc03-2021_004');
        }, 500);
    });

    setTimeout(() => {
        if (com.vclm.mt.isVeevaEnvironment()) {
            com.veeva.clm.getSurvey_Object(
                function(dataReceived) {
                    surveyObject = dataReceived;
                    $('.error').append(`<h2>surveyObject</h2>`)
                },
                function(errorMsg) {
                    $('.error').append(`<h2>${errorMsg}</h2>`)
                }
            );
        } else {
            surveyObject = dummyObject;
        }
    }, 10)
});

const setSurveyResult = () => {
    return new Promise((res, rej) => {
        if (com.vclm.mt.isVeevaEnvironment()) {
            com.veeva.clm.getSurvey_Object(
                function(dataReceived) {
                    surveyObject = dataReceived;
                    // $('.error').append(`<h2>surveyObject</h2>`)
                    res();
                },
                function(errorMsg) {
                    $('.error').append(`<h2>${errorMsg}</h2>`)
                    res();
                }
            );
        } else {
            surveyObject = dummyObject;
            res();
        }
    });
}

const submitSurvey = (surveyObject, action, ANSWER) => {
    ANSWER = $(".ui-slider-handle").find('.num').data("value") + "%";
    surveyObject.Questions[0].Response.Response_vod__c = ANSWER;
    $('.error').append(`<h2>${ANSWER}</h2>`)

    if (com.vclm.mt.isVeevaEnvironment()) {
        console.log("비바환경", "action:", action, "surveyObject", surveyObject);
        com.veeva.clm.submitSurvey(
            surveyObject,
            action,
            function() {
                if (action == "Saved_vod") {
                    // $(".inner").text("Survey has been saved.");
                } else {
                    // $(".inner").text("Survey has been submitted");
                }
                // com.vclm.mt.gotoSlide('Xospata_sc03-2021_004');
            },
            function(errorMsg) {
                console.log(errorMsg);
                $('.error').append(`<h2>${errorMsg}</h2>`)
            }
        );
    } else {
        console.log("submit!!!", surveyObject);
        // com.vclm.mt.gotoSlide('Xospata_sc03-2021_004');
    }
}

let dummyObject = {
    ID: "a1wf0000000RlePAAS",
    Name: "Xospata_sc03-2021",
    Frequency: "Recurring",
    Survey_Target_vod__c: "FA62DF0F-74F3-4486-A5A4-C4CA8B8EF757",
    Status_vod__c: "Saved_vod",
    Questions: [{
        ID: "a1uf0000000lO3wAAE",
        Text_vod__c: "FLT3 mutated R/R AML 환자에서 기존 약물치료로 CR*에 도달한 환자의 비율은 몇 % 정도라고 생각하시나요?",
        Order_vod__c: "0",
        Required_vod__c: 0,
        RecordTypeID: "012i0000000RNjLAAW",
        RecordTypeName: "Radio",
        Answer_Choice_vod__c: "5%;0; 10%;0; 15%;0; 20%;0; 25%;0; 30%;0; 35%;0; 40%;0;  45%;0; 50%;0;  55%;0; 60%;0; 65%;0; 70%;0; 75%;0; 80%;0; 85%;0; 90%;0; 95%;0; 100%;0;",
        Answer_Choice_vod__c_ToArray: ["5%", "10%", "15%", "20%", "25%", "30%", "35%", "40%", "45%", "50%", "55%", "60%", "65%", "70%", "75%", "80%", "85%", "90%", "95%", "100%"],
        Response: {
            ID: "CEB2643F-6FA7-4DFA-8601-19670DB8609F",
            Response_vod__c: "Picklist option 2 ipsum lorem",
        },
    }],
};