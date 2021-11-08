// Veeva JavaScript Library Survey Addendum v1.0
// http://www.idetailingcreatives.com

// com.veeva.clm.getSurvey_Object(onRequestSucess,onRequestError)
//
// If Success, this will return a JSON object with the survey definition as a parameter for onRequestSuccess function
// If Error, this will return an error message as a parameter for onRequestError function
//
// The object has the following structure:
//
// {
//    "ID": "a1wf0000000RlePAAS",   //Survey ID
//    "Name": "KonaTestSurvey",     //Survey Name
//    "Frequency": "Recurring",     //Survey Frequency: [One Time] or [Recurring]
//    "Survey_Target_vod__c": "FA62DF0F-74F3-4486-A5A4-C4CA8B8EF757",   //Target ID: value or null
//    "Status_vod__c": "Saved_vod", //Survey Status: [New], [Pending_vod], [Saved_vod], [Submitted_vod]
//    "Questions": [                //Questions array
//    {
//        "ID": "a1uf0000000lO3wAAE",   //Question ID
//        "Text_vod__c": "What would you choose from this picklist?", //Question Name
//        "Order_vod__c": "0",          //Question Order
//        "Required_vod__c": 1,         //Question Required
//        "RecordTypeID": "012i0000000RNjLAAW", //Question Recordtype ID
//        "RecordTypeName": "Picklist",         //Question Recordtype Name
//        "Answer_Choice_vod__c": "Picklist option 1 lorem ipsum;0;Picklist option 2 ipsum lorem;0;Picklist option 3 asir maret;0", //Answer choices (as stored in the CRM)
//        "Answer_Choice_vod__c_ToArray": ["Picklist option 1 lorem ipsum", "Picklist option 2 ipsum lorem", "Picklist option 3 asir maret"], //Answer choices array
//        "Response": //Response object
//        {
//            "ID": "CEB2643F-6FA7-4DFA-8601-19670DB8609F", //Response ID (will be null if no response)
//            "Response_vod__c": "Picklist option 2 ipsum lorem" //Response value (field name will change depending on the record type: [Response_vod__c], [Text_vod__c], [Date_vod__c], [Datetime_vod__c], [Number_vod__c])
//        }
//    }]
// }
com.veeva.clm.getSurvey_Object = function (onRequestSuccess, onRequestError) {

    var fetchPosition = 0; //used to loop through records in asynchronic calls
    var accountID = null;
    var questionRecordTypes = []; //question record types (JSON array: ID, Name)
    var objSurvey_vod__c = {}; //survey object (JSON)

    //this function is the first to be called
    var startGetSequence = function () {
        getAccountID();
    };

    //get account id
    var getAccountID = function () {
        com.veeva.clm.getDataForCurrentObject(
            'Account',
            'ID',
            function (dataReceived) {
                if (dataReceived.success) {
                    accountID = dataReceived.Account.ID;
                    getQuestionRecordTypes();
                } else {
                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Account ID. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                }
            });
    };

    //get question recordtypes: will populate the questionsRecordTypes JSON array {["ID":"record type id","Name":"record type name"]}
    var getQuestionRecordTypes = function () {
        com.veeva.clm.getRecordType_Object(
            'Survey_Question_vod__c',
            function (dataReceived) {
                if (dataReceived.success) {
                    for (var i = 0; i < dataReceived.RecordType.length; i++) {
                        questionRecordTypes.push(JSON.parse('{"ID":"' + dataReceived.RecordType[i].ID + '"}'));
                    }
                    fetchPosition = 0;
                    getQuestionRecordTypeNames();
                } else {
                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Survey Question RecordType. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                }
            });

        var getQuestionRecordTypeNames = function () {
            com.veeva.clm.getDataForObject(
                'RecordType',
                questionRecordTypes[fetchPosition].ID,
                'DeveloperName',
                function (dataReceived) {
                    if (dataReceived.success) {
                        switch (dataReceived.RecordType.DeveloperName) {
                            case 'Date_vod':
                                questionRecordTypes[fetchPosition].Name = 'Date';
                                break;
                            case 'Picklist_vod':
                                questionRecordTypes[fetchPosition].Name = 'Picklist';
                                break;
                            case 'Multiselect_vod':
                                questionRecordTypes[fetchPosition].Name = 'Multiselect';
                                break;
                            case 'Datetime_vod':
                                questionRecordTypes[fetchPosition].Name = 'Datetime';
                                break;
                            case 'Radio_vod':
                                questionRecordTypes[fetchPosition].Name = 'Radio';
                                break;
                            case 'Description_vod':
                                questionRecordTypes[fetchPosition].Name = 'Description';
                                break;
                            case 'Long_Text_vod':
                                questionRecordTypes[fetchPosition].Name = 'Long Text';
                                break;
                            case 'Number_vod':
                                questionRecordTypes[fetchPosition].Name = 'Number';
                                break;
                            case 'Text_vod':
                                questionRecordTypes[fetchPosition].Name = 'Text';
                                break;
                        }
                        fetchPosition++;
                        if (fetchPosition < questionRecordTypes.length) {
                            getQuestionRecordTypeNames();
                        } else {
                            getSurveyDetails();
                        }
                    } else {
                        returnError('com.veeva.clm.getSurvey_Object: Unable to get RecordType DeveloperName. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                    }
                });
        };
    };

    //get survey detauls (ID, Name and Frequency): will store the data in the objSurvey_vod__c object
    var getSurveyDetails = function () {
        //survey id
        com.veeva.clm.getDataForCurrentObject(
            'Presentation',
            'Survey_vod__c',
            function (dataReceived) {
                if (dataReceived.success) {
                    objSurvey_vod__c.ID = dataReceived.Presentation.Survey_vod__c;
                    //survey name
                    com.veeva.clm.getDataForObject(
                        'Survey_vod__c',
                        objSurvey_vod__c.ID,
                        'Name',
                        function (dataReceived) {
                            if (dataReceived.success) {
                                objSurvey_vod__c.Name = dataReceived.Survey_vod__c.Name;
                                //record type: recurring or one time
                                com.veeva.clm.getDataForObject(
                                    'Survey_vod__c',
                                    objSurvey_vod__c.ID,
                                    'RecordTypeId',
                                    function (dataReceived) {
                                        com.veeva.clm.getDataForObject(
                                            'RecordType',
                                            dataReceived.Survey_vod__c.RecordTypeId,
                                            'DeveloperName',
                                            function (dataReceived) {
                                                if (dataReceived.success) {
                                                    if (dataReceived.RecordType.DeveloperName == 'Recurring_vod') {
                                                        objSurvey_vod__c.Frequency = 'Recurring';
                                                    } else {
                                                        objSurvey_vod__c.Frequency = 'One Time';
                                                    }
                                                    //move on
                                                    getMostRecentTargetAndStatus();
                                                } else {
                                                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Survey RecordTypeId. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                }
                                            });
                                    });
                            } else {
                                returnError('com.veeva.clm.getSurvey_Object: Unable to get Survey Name. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                            }
                        });
                } else {
                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Survey ID. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                }
            });
    };

    //get survey taget and status: will set the survey status (New, Pending_vod, Saved_vod, Submitted_vod) and most recent target ID (if any)
    var getMostRecentTargetAndStatus = function () {
        com.veeva.clm.getSurveyTarget_Account(
            accountID,
            objSurvey_vod__c.ID,
            function (dataReceived) {
                if (dataReceived.success) {
                    if (dataReceived.Survey_Target_vod__c.length > 0) {
                        objSurvey_vod__c.Survey_Target_vod__c = dataReceived.Survey_Target_vod__c[dataReceived.Survey_Target_vod__c.length - 1].ID;
                        com.veeva.clm.getDataForObject(
                            'Survey_Target_vod__c',
                            objSurvey_vod__c.Survey_Target_vod__c,
                            'Status_vod__c',
                            function (dataReceived) {
                                switch (dataReceived.Survey_Target_vod__c.Status_vod__c) {
                                    case 'Pending_vod':
                                        objSurvey_vod__c.Status_vod__c = 'Pending_vod';
                                        break;
                                    case 'Saved_vod':
                                        objSurvey_vod__c.Status_vod__c = 'Saved_vod';
                                        break;
                                    case 'Submitted_vod':
                                        objSurvey_vod__c.Status_vod__c = 'Submitted_vod';
                                        break;
                                    default:
                                        objSurvey_vod__c.Status_vod__c = 'New';
                                        break;
                                }
                                getQuestions();
                            });

                    } else {
                        objSurvey_vod__c.Status_vod__c = 'New';
                        getQuestions();
                    }
                } else {
                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Survey Status. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                }
            });
    };

    //get survey questions: will populate the questions array in objSurvey_vod__c
    //for each question, the following data will be collected: ID, Text, Order, Required, Recordtype ID, Recordtype Name, Anwser Choices
    //a response object for each question will be initialized with null values
    var getQuestions = function () {
        var questions = [];

        //questions id
        com.veeva.clm.getSurveyQuestions_Survey(
            objSurvey_vod__c.ID,
            function (dataReceived) {
                if (dataReceived.success) {
                    for (var i = 0; i < dataReceived.Survey_Question_vod__c.length; i++) {
                        questions.push(JSON.parse('{"ID":"' + dataReceived.Survey_Question_vod__c[i].ID + '"}'));
                    }
                    fetchPosition = 0;
                    if (questions.length > 0) {
                        getQuestionDetails();
                    } else {
                        returnError('com.veeva.clm.getSurvey_Object: Survey is Empty.');
                    }

                } else {
                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Survey Questions. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                }
            });

        //question details
        var getQuestionDetails = function () {
            //text
            com.veeva.clm.getDataForObject(
                'Survey_Question_vod__c',
                questions[fetchPosition].ID,
                'Text_vod__c',
                function (dataReceived) {
                    if (dataReceived.success) {
                        questions[fetchPosition].Text_vod__c = dataReceived.Survey_Question_vod__c.Text_vod__c;
                        //order
                        com.veeva.clm.getDataForObject(
                            'Survey_Question_vod__c',
                            questions[fetchPosition].ID,
                            'Order_vod__c',
                            function (dataReceived) {
                                if (dataReceived.success) {
                                    questions[fetchPosition].Order_vod__c = dataReceived.Survey_Question_vod__c.Order_vod__c;
                                    //required
                                    com.veeva.clm.getDataForObject(
                                        'Survey_Question_vod__c',
                                        questions[fetchPosition].ID,
                                        'Required_vod__c',
                                        function (dataReceived) {
                                            if (dataReceived.success) {
                                                if (dataReceived.Survey_Question_vod__c.Required_vod__c == true) {
                                                    questions[fetchPosition].Required_vod__c = 1;
                                                } else {
                                                    questions[fetchPosition].Required_vod__c = 0;
                                                }
                                                //type
                                                com.veeva.clm.getDataForObject(
                                                    'Survey_Question_vod__c',
                                                    questions[fetchPosition].ID,
                                                    'RecordTypeId',
                                                    function (dataReceived) {
                                                        if (dataReceived.success) {
                                                            questions[fetchPosition].RecordTypeID = dataReceived.Survey_Question_vod__c.RecordTypeId;
                                                            questions[fetchPosition].RecordTypeName = findQuestionRecordTypeName(questions[fetchPosition].RecordTypeID);
                                                            //answer choices
                                                            com.veeva.clm.getDataForObject(
                                                                'Survey_Question_vod__c',
                                                                questions[fetchPosition].ID,
                                                                'Answer_Choice_vod__c',
                                                                function (dataReceived) {
                                                                    if (dataReceived.success) {
                                                                        questions[fetchPosition].Answer_Choice_vod__c = dataReceived.Survey_Question_vod__c.Answer_Choice_vod__c;
                                                                        questions[fetchPosition].Answer_Choice_vod__c_ToArray = answerChoicesToArray(dataReceived.Survey_Question_vod__c.Answer_Choice_vod__c);

                                                                        //question response object
                                                                        questions[fetchPosition].Response = {};
                                                                        questions[fetchPosition].Response.ID = null;
                                                                        switch (questions[fetchPosition].RecordTypeName) {
                                                                            case 'Date':
                                                                                questions[fetchPosition].Response.Date_vod__c = null;
                                                                                break;
                                                                            case 'Datetime':
                                                                                questions[fetchPosition].Response.Datetime_vod__c = null;
                                                                                break;
                                                                            case 'Picklist':
                                                                            case 'Multiselect':
                                                                            case 'Radio':
                                                                                questions[fetchPosition].Response.Response_vod__c = null;
                                                                                break;
                                                                            case 'Long Text':
                                                                            case 'Text':
                                                                                questions[fetchPosition].Response.Text_vod__c = null;
                                                                                break;
                                                                            case 'Number':
                                                                                questions[fetchPosition].Response.Number_vod__c = null;
                                                                                break;
                                                                        }

                                                                        //loop or move on
                                                                        fetchPosition++;
                                                                        if (fetchPosition < questions.length) {
                                                                            getQuestionDetails();
                                                                        } else {
                                                                            objSurvey_vod__c.Questions = questions;
                                                                            if (objSurvey_vod__c.Status_vod__c == 'Saved_vod') {
                                                                                //saved responses for Pending, Saved and Submitted surveys
                                                                                getSavedResponses();
                                                                            } else {
                                                                                returnSurveyObject();
                                                                            }
                                                                        }

                                                                    } else {
                                                                        returnError('com.veeva.clm.getSurvey_Object: Unable to get Question Answer Choices. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                                    }
                                                                });
                                                        } else {
                                                            returnError('com.veeva.clm.getSurvey_Object: Unable to get Question RecordType. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                        }
                                                    });
                                            } else {
                                                returnError('com.veeva.clm.getSurvey_Object: Unable to get Question Required. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                            }
                                        });
                                } else {
                                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Question Order. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                }
                            });
                    } else {
                        returnError('com.veeva.clm.getSurvey_Object: Unable to get Question Text. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                    }
                });
        };

        var findQuestionRecordTypeName = function (recordTypeID) {
            for (var n = 0; n < questionRecordTypes.length; n++) {
                if (questionRecordTypes[n].ID == recordTypeID) {
                    return questionRecordTypes[n].Name;
                }
            }
        };

        var answerChoicesToArray = function (answerChoices) {

            var tempArray = [];
            var newArray = [];
            var add = true;

            if (answerChoices != '') {
                tempArray = answerChoices.split(';');
                for (var n = 0; n < tempArray.length; n++) {
                    if (add) {
                        newArray.push(tempArray[n]);
                        add = false;
                    } else {
                        add = true;
                    }
                }
            }
            return newArray;
        };
    };

    //get saved responses (only if the survey status is in Saved_vod): will get response ID and value for each question
    //some questions may not have a saved response, in that case, the response object will remain null (Response.ID: null)
    var getSavedResponses = function () {
        var responses = [];

        //get responses for survey target
        com.veeva.clm.getQuestionResponse_SurveyTarget(
            objSurvey_vod__c.Survey_Target_vod__c,
            function (dataReceived) {
                if (dataReceived.success) {
                    for (var v = 0; v < dataReceived.Question_Response_vod__c.length; v++) {
                        responses.push(dataReceived.Question_Response_vod__c[v].ID);
                    }
                    fetchPosition = 0;
                    assignResponsesToQuestions();
                } else {
                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Question Responses. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                }
            });

        //assign response IDs to questions
        var assignResponsesToQuestions = function () {

            //question id of response
            com.veeva.clm.getDataForObject(
                'Question_Response_vod__c',
                responses[fetchPosition],
                'Survey_Question_vod__c',
                function (dataReceived) {
                    if (dataReceived.success) {
                        //find question that matches ID
                        for (var n = 0; n < objSurvey_vod__c.Questions.length; n++) {
                            if (objSurvey_vod__c.Questions[n].ID == dataReceived.Question_Response_vod__c.Survey_Question_vod__c) {
                                objSurvey_vod__c.Questions[n].Response.ID = responses[fetchPosition];
                                break;
                            }
                        }

                        //next response
                        fetchPosition++;

                        //loop or move on
                        if (fetchPosition < responses.length) {
                            assignResponsesToQuestions();
                        } else {
                            fetchPosition = 0;
                            getResponsesValues();
                        }
                    } else {
                        if (dataReceived.code == 2002) //record is empty
                        {
                            //next response
                            fetchPosition++;

                            //loop or move on
                            if (fetchPosition < responses.length) {
                                assignResponsesToQuestions();
                            } else {
                                fetchPosition = 0;
                                getResponsesValues();
                            }

                        } else {
                            returnError('com.veeva.clm.getSurvey_Object: Unable to get Responses Question ID. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                        }
                    }
                });
        };

        //get response values
        var getResponsesValues = function () {

            var next = function () {
                //next response
                fetchPosition++;

                //loop or move on
                if (fetchPosition < objSurvey_vod__c.Questions.length) {
                    getResponsesValues();
                } else {
                    returnSurveyObject();
                }
            };

            if (!(objSurvey_vod__c.Questions[fetchPosition].Response.ID === null)) //if response id is null, it means there's no saved response
            {
                switch (objSurvey_vod__c.Questions[fetchPosition].RecordTypeName) {
                    case 'Date':
                        com.veeva.clm.getDataForObject(
                            'Question_Response_vod__c',
                            responses[fetchPosition],
                            'Date_vod__c',
                            function (dataReceived) {
                                if (dataReceived.success) {
                                    objSurvey_vod__c.Questions[fetchPosition].Response.Date_vod__c = dataReceived.Question_Response_vod__c.Date_vod__c; //response
                                    next();
                                } else {
                                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Responses Value (Date). Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                }
                            });
                        break;

                    case 'Datetime':
                        com.veeva.clm.getDataForObject(
                            'Question_Response_vod__c',
                            responses[fetchPosition],
                            'Datetime_vod__c',
                            function (dataReceived) {
                                if (dataReceived.success) {
                                    objSurvey_vod__c.Questions[fetchPosition].Response.Datetime_vod__c = dataReceived.Question_Response_vod__c.Datetime_vod__c; //response
                                    next();
                                } else {
                                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Responses Value (DateTime). Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                }
                            });
                        break;

                    case 'Picklist':
                    case 'Multiselect':
                    case 'Radio':
                        com.veeva.clm.getDataForObject(
                            'Question_Response_vod__c',
                            responses[fetchPosition],
                            'Response_vod__c',
                            function (dataReceived) {
                                if (dataReceived.success) {
                                    objSurvey_vod__c.Questions[fetchPosition].Response.Response_vod__c = dataReceived.Question_Response_vod__c.Response_vod__c; //response
                                    next();
                                } else {
                                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Responses Value (Picklist/Multiselect/Radio). Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                }
                            });
                        break;

                    case 'Long Text':
                    case 'Text':
                        com.veeva.clm.getDataForObject(
                            'Question_Response_vod__c',
                            responses[fetchPosition],
                            'Text_vod__c',
                            function (dataReceived) {
                                if (dataReceived.success) {
                                    objSurvey_vod__c.Questions[fetchPosition].Response.Text_vod__c = dataReceived.Question_Response_vod__c.Text_vod__c; //response
                                    next();
                                } else {
                                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Responses Value (Text/Long text). Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                }
                            });
                        break;

                    case 'Number':
                        com.veeva.clm.getDataForObject(
                            'Question_Response_vod__c',
                            responses[fetchPosition],
                            'Number_vod__c',
                            function (dataReceived) {
                                if (dataReceived.success) {
                                    objSurvey_vod__c.Questions[fetchPosition].Response.Number_vod__c = dataReceived.Question_Response_vod__c.Number_vod__c; //response
                                    next();
                                } else {
                                    returnError('com.veeva.clm.getSurvey_Object: Unable to get Responses Value (Number). Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                }
                            });
                        break;
                }
            } else {
                next();
            }
        };
    };

    //Return survey object
    var returnSurveyObject = function () {
        onRequestSuccess(objSurvey_vod__c);
    };

    //Something went wrong, return error message
    var returnError = function (errorMsg) {
        onRequestError(errorMsg);
    };

    startGetSequence();
};

// com.veeva.clm.submitSurvey(surveyObject, action, onRequestSucess,onRequestError)
//
// surveyObject: survey object returned by com.veeva.clm.getSurvey_Object and updated with response values
// action: [Submitted_vod] or [Saved_vod]: will update the survey target to submitted or saved (for later)
//
// If Success, this will call the onRequestSuccess function
// If Error, this will return an error message as a parameter for onRequestError function
com.veeva.clm.submitSurvey = function (surveyObject, action, onRequestSuccess, onRequestError) {

    var fetchPosition = 0;
    var surveyResponseObject = {};
    var clmResponseRecordTypeID = null;
    var recordTypesArray = [];

    var startSubmitSequence = function () {
        if ((action != 'Submitted_vod') && (action != 'Saved_vod')) {
            returnError('com.veeva.clm.submitSurvey: Invalid action [' + action + ']');
        } else {
            getResponseRecordTypes();
        }
    };

    //find CLM response recordtype
    var getResponseRecordTypes = function () {
        com.veeva.clm.getRecordType_Object(
            'Question_Response_vod__c',
            function (dataReceived) {
                recordTypesArray = [];
                for (var v = 0; v < dataReceived.RecordType.length; v++) {
                    recordTypesArray.push(dataReceived.RecordType[v].ID);
                }
                fetchPosition = 0;
                findCLMResponseRecordTypeID();
            });
    };

    var findCLMResponseRecordTypeID = function () {
        com.veeva.clm.getDataForObject(
            'RecordType',
            recordTypesArray[fetchPosition],
            'DeveloperName',
            function (dataReceived) {
                if (dataReceived.RecordType.DeveloperName == 'CLM_vod') {
                    clmResponseRecordTypeID = recordTypesArray[fetchPosition];
                    fetchPosition = 0;
                    evaluateSurveyStatus();
                } else {
                    if (fetchPosition < recordTypesArray.length - 1) {
                        fetchPosition++;
                        findCLMResponseRecordTypeID(); //recursive call
                    } else {
                        returnError('com.veeva.clm.submitSurvey: Unable to find CLM response recordtype ID');
                    }
                }
            });
    };

    //evaluate status (need to create survey target?)
    //for new or recurring submitted surveys, will create the survey target then create question response records
    //for pending surveys, will use the survey target to create new response records
    //for saved surveys, will create or updated response records
    var evaluateSurveyStatus = function () {
        switch (surveyObject.Status_vod__c) {
            case 'New':
                createSurveyTarget(); //create survey target, then create question response records
                break;
            case 'Pending_vod':
                submitQuestions(); //create question response records for current target
                break;
            case 'Saved_vod':
                submitQuestions(); //create or update question response records
                break;
            case 'Submitted_vod':
                if (surveyObject.Frequency == 'Recurring') {
                    createSurveyTarget(); //create new survey target, then create question response records
                } else {
                    returnError('com.veeva.clm.submitSurvey: This is a one-time survey that has already been completed');
                }
                break;
        }
    };

    //create survey target: will create the survey target object
    var createSurveyTarget = function () {
        var surveyTargetObject = {};

        surveyTargetObject.Survey_vod__c = surveyObject.ID;
        surveyTargetObject.Name = surveyObject.Name;
        surveyTargetObject.Status_vod__c = 'Saved_vod';
        surveyTargetObject.No_Autoassign_vod__c = 1;

        //account id
        com.veeva.clm.getDataForCurrentObject(
            'Account',
            'ID',
            function (dataReceived) {
                if (dataReceived.success) {
                    surveyTargetObject.Account_vod__c = dataReceived.Account.ID;
                    //recordtype
                    com.veeva.clm.getDataForObject(
                        'Survey_vod__c',
                        surveyObject.ID,
                        'RecordTypeID',
                        function (dataReceived) {
                            if (dataReceived.success) {
                                surveyTargetObject.RecordTypeID = dataReceived.Survey_vod__c.RecordTypeID;
                                //territory
                                com.veeva.clm.getDataForObject(
                                    'Survey_vod__c',
                                    surveyObject.ID,
                                    'Territory_vod__c',
                                    function (dataReceived) {
                                        if (dataReceived.success) {
                                            surveyTargetObject.Territory_vod__c = dataReceived.Survey_vod__c.Territory_vod__c;
                                            //start date
                                            com.veeva.clm.getUTCdatetime(
                                                'Survey_vod__c',
                                                surveyObject.ID,
                                                'Start_Date_vod__c',
                                                function (dataReceived) {
                                                    if (dataReceived.success) {
                                                        surveyTargetObject.Start_Date_vod__c = dataReceived.Survey_vod__c.Start_Date_vod__c;
                                                        //end date
                                                        com.veeva.clm.getUTCdatetime(
                                                            'Survey_vod__c',
                                                            surveyObject.ID,
                                                            'End_Date_vod__c',
                                                            function (dataReceived) {
                                                                if (dataReceived.success) {
                                                                    surveyTargetObject.End_Date_vod__c = dataReceived.Survey_vod__c.End_Date_vod__c;
                                                                    //region
                                                                    com.veeva.clm.getDataForObject(
                                                                        'Survey_vod__c',
                                                                        surveyObject.ID,
                                                                        'Region_vod__c',
                                                                        function (dataReceived) {
                                                                            if (dataReceived.success) {
                                                                                surveyTargetObject.Region_vod__c = dataReceived.Survey_vod__c.Region_vod__c;
                                                                                //language
                                                                                com.veeva.clm.getDataForObject(
                                                                                    'Survey_vod__c',
                                                                                    surveyObject.ID,
                                                                                    'Language_vod__c',
                                                                                    function (dataReceived) {
                                                                                        if (dataReceived.success) {
                                                                                            surveyTargetObject.Language_vod__c = dataReceived.Survey_vod__c.Language_vod__c;
                                                                                            //channels
                                                                                            com.veeva.clm.getDataForObject(
                                                                                                'Survey_vod__c',
                                                                                                surveyObject.ID,
                                                                                                'Channels_vod__c',
                                                                                                function (dataReceived) {
                                                                                                    if (dataReceived.success) {
                                                                                                        surveyTargetObject.Channels_vod__c = dataReceived.Survey_vod__c.Channels_vod__c;
                                                                                                        //create survey target
                                                                                                        com.veeva.clm.createRecord(
                                                                                                            'Survey_Target_vod__c',
                                                                                                            surveyTargetObject,
                                                                                                            function (dataReceived) {
                                                                                                                if (dataReceived.success) {
                                                                                                                    surveyObject.Survey_Target_vod__c = dataReceived.Survey_Target_vod__c.ID;
                                                                                                                    submitQuestions();
                                                                                                                } else {
                                                                                                                    returnError('com.veeva.clm.submitSurvey: Unable to create Survey Target. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                                                                                }
                                                                                                            });
                                                                                                    } else {
                                                                                                        returnError('com.veeva.clm.submitSurvey: Unable to get Survey Channels. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                                                                    }
                                                                                                });
                                                                                        } else {
                                                                                            returnError('com.veeva.clm.submitSurvey: Unable to get Survey Language. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                                                        }
                                                                                    });
                                                                            } else {
                                                                                returnError('com.veeva.clm.submitSurvey: Unable to get Survey Region. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                                            }
                                                                        });
                                                                } else {
                                                                    returnError('com.veeva.clm.submitSurvey: Unable to get Survey End Date. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                                }
                                                            });
                                                    } else {
                                                        returnError('com.veeva.clm.submitSurvey: Unable to get Survey Start Date. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                                    }
                                                });
                                        } else {
                                            returnError('com.veeva.clm.submitSurvey: Unable to get Survey Territory. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                                        }
                                    });
                            } else {
                                returnError('com.veeva.clm.submitSurvey: Unable to get Survey RecordTypeID. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                            }
                        });
                } else {
                    returnError('com.veeva.clm.submitSurvey: Unable to get Account ID. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                }
            });
    };

    //submit questions (create or update records), one by one
    var submitQuestions = function () {

        if (fetchPosition < surveyObject.Questions.length) {

            surveyResponseObject = {};

            if (!(surveyObject.Questions[fetchPosition].Response.ID === null)) //if there's a saved response, assign ID
            {
                surveyResponseObject.ID = surveyObject.Questions[fetchPosition].Response.ID;
            }
            surveyResponseObject.RecordTypeId = clmResponseRecordTypeID;
            surveyResponseObject.Survey_Target_vod__c = surveyObject.Survey_Target_vod__c;
            surveyResponseObject.Survey_Question_vod__c = surveyObject.Questions[fetchPosition].ID;
            surveyResponseObject.Type_vod__c = surveyObject.Questions[fetchPosition].RecordTypeID;
            surveyResponseObject.Question_Text_vod__c = surveyObject.Questions[fetchPosition].Text_vod__c;
            surveyResponseObject.Answer_Choice_vod__c = surveyObject.Questions[fetchPosition].Answer_Choice_vod__c;
            surveyResponseObject.Order_vod__c = surveyObject.Questions[fetchPosition].Order_vod__c;
            surveyResponseObject.Required_vod__c = surveyObject.Questions[fetchPosition].Required_vod__c;

            switch (surveyObject.Questions[fetchPosition].RecordTypeName) { //response
                case 'Date':
                    surveyResponseObject.Date_vod__c = surveyObject.Questions[fetchPosition].Response.Date_vod__c;
                    break;
                case 'Datetime':
                    surveyResponseObject.Datetime_vod__c = surveyObject.Questions[fetchPosition].Response.Datetime_vod__c;
                    break;

                case 'Picklist':
                case 'Multiselect':
                case 'Radio':
                    surveyResponseObject.Response_vod__c = surveyObject.Questions[fetchPosition].Response.Response_vod__c;
                    break;

                case 'Long Text':
                case 'Text':
                    surveyResponseObject.Text_vod__c = surveyObject.Questions[fetchPosition].Response.Text_vod__c;
                    break;

                case 'Number':
                    surveyResponseObject.Number_vod__c = surveyObject.Questions[fetchPosition].Response.Number_vod__c;
                    break;
            }

            if (surveyObject.Questions[fetchPosition].Response.ID === null) {
                //create question
                com.veeva.clm.createRecord(
                    "Question_Response_vod__c",
                    surveyResponseObject,
                    function (dataReceived) {
                        if (!dataReceived.success) {
                            returnError('com.veeva.clm.submitSurvey: Unable to create Response Record. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                        } else {
                            fetchPosition++;
                            submitQuestions(); //recursive call
                        }
                    });
            } else {
                //update question
                com.veeva.clm.updateRecord(
                    'Question_Response_vod__c',
                    surveyResponseObject.ID,
                    surveyResponseObject,
                    function (dataReceived) {
                        if (!dataReceived.success) {
                            returnError('com.veeva.clm.submitSurvey: Unable to update Response Record. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                        } else {
                            fetchPosition++;
                            submitQuestions(); //recursive call
                        }
                    });
            }
        } else {
            //update survey target status
            surveyObject.Status_vod__c = action;

            //finished submitting responses - update target to submitted
            var submittedStatusObject = {
                "Status_vod__c": action
            };

            com.veeva.clm.updateRecord(
                'Survey_Target_vod__c',
                surveyObject.Survey_Target_vod__c,
                submittedStatusObject,
                function (dataReceived) {
                    if (!dataReceived.success) {
                        returnError('com.veeva.clm.submitSurvey: Unable to update Survey Target Status. Code: ' + dataReceived.code + '. Message:' + dataReceived.message);
                    } else {
                        returnSuccess();
                    }
                });
        }
    };

    //Return survey object
    var returnSuccess = function () {
        onRequestSuccess();
    };

    //Something went wrong, return error message
    var returnError = function (errorMsg) {
        onRequestError(errorMsg);
    };

    startSubmitSequence();
};