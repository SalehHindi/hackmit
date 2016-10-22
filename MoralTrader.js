  'use strict';

  var https = require('https');
  var PAGE_TOKEN = "EAAPaEOjibZBkBAPRV91xJyQzh4hCdo1MD1QIwZBgMkNEI2ah9FQObF9QTvSJ5ulVaLRX5L5Jdvr1tGL5S895dQX77BwDR2UbTxbZBgZBw3gSA1yEIXujMYDWobzDlhs76NHuZCfklMEN06ghXRWzttlTLWxrahcRFfRn0ZAuZCizgZDZD";
  var VERIFY_TOKEN = "my_awesome_token";

  // Turn this into a function
  exports.handler = (event, context, callback) => {

    // process GET request
    if(event.params && event.params.querystring){
      var queryParams = event.params.querystring;
      var rVerifyToken = queryParams['hub.verify_token']
   
      if (rVerifyToken === VERIFY_TOKEN) {
        var challenge = queryParams['hub.challenge']
        callback(null, parseInt(challenge))
      } else{
        callback(null, 'Error, wrong validation token');
      }
   
    // process POST request
    } else{
   
      var messagingEvents = event.entry[0].messaging;
      for (var i = 0; i < messagingEvents.length; i++) {
        var messagingEvent = messagingEvents[i];
        var sender = messagingEvent.sender.id;
        
        var userInput = "";
        var currentState = "";

        setGreetingText(sender);

        ////////////////////////
        // The goal is to have 3 sections 
        // 1) Receive Inputs. inputs = an array of all inputs including button and text inputs.
        // 2) Determine intent of all inputs.
        // 3) Select next state based on strongest intent.

        ////////////////////////////////////
        // Receive Inputs

        // If any event happens
        if (messagingEvent.message) {
            // sendTextMessage(sender, "Event");
        }
        

        // If a user sends text
        if (messagingEvent.message && messagingEvent.message.text) {
          var text = messagingEvent.message.text
          userInput = text;

          // If the user sends text by clicking a quick reply button
          if (messagingEvent.message.quick_reply) {
            currentState = messagingEvent.message.quick_reply.payload.split(".")[0];
            userInput = messagingEvent.message.quick_reply.payload.split(".")[1];
          } 

          callback(null, "Done");
        }
        
        // If a user clicks a button
        if (messagingEvent.postback) {
          currentState = messagingEvent.postback.payload.split(".")[0];
          userInput = messagingEvent.postback.payload.split(".")[1];
          sendTextMessage(sender, "State: " + currentState);
          sendTextMessage(sender, "Answer: " + userInput);
        }

        ////////////////////////////////////
        // Intent Processing

        // This would be a good use case for wit.ai but it'll be O(n) efficient to do it this way

        var answer = userInput;
        if (userInput != "") {
          switch (userInput) {
            case "moral trade":
            case "mt":
            case "Moral Trade":
            case "Trade":
            case "Moral trade":
              answer = "Moral Trade";
            
              break

            case "Yes":
            case "yes":
            case "si":
            case "yup":
            case "Yup":
              answer = "Yes";

              break

            case "No":
            case "no":
            case "n":
            case "nope":
            case "Nope":
              answer = "No";
            
              break

            case "Gun Rights":
            case "Guns":
            case "guns":
            case "gun":
            // case "":
              answer = "Gun Rights";

              break

            case "Abortion Rights":
            case "abortions":
            // case "":
            // case "":
            // case "":
              answer = "Abortion Rights";

              break

            case "Elections":
            // case "":
            // case "":
            // case "":
            // case "":
              answer = "Presidential Elections";

              break

            case "Very For":
            // case "":
            // case "":
            // case "":
            // case "":
              answer = "Very For"

              break

            case "Neutral":
            // case "":
            // case "":
            // case "":
            // case "":
              answer = "Neutral"

              break

            case "Very Against":
            // case "":
            // case "":
            // case "":
            // case "":
              answer = "Very Against"

              break

            default:
              // answer = "00000000000000000"
          }
        }

        // var answer = "Moral Trade"

        ////////////////////////////////////
        // State Selection

        // sendTextMessage(sender, "Program running")
        console.log("Program Working. currentState: " + currentState + " answer: " + answer)
        if (answer != "") {
          if (currentState == "") {
            switch (answer) {
              case "Moral Trade":
                setTyping(sender, "on");
                setTimeout(function(){
                  quickReplies(sender, 
                              "Do you want to start a moral trade?", 
                              ["Yes", "No"],
                              "MoralTradeStarted");
                  setTyping(sender, "off");
                  }, 2000
                );
                currentState = "MoralTradeStarted";
                break
            }
                                            
          } else if (currentState == "MoralTradeStarted") {
            switch (answer) {
              case "Yes":
                // sendTextMessage(sender, "Show Cause Selection");

                setTyping(sender, "on");
                setTimeout(function(){
                  quickReplies(sender,
                              "Select the cause you feel the most passionate about",
                              ["Gun Rights", "Abortion Rights"],
                              "CauseSelection");
                  setTyping(sender, "off");
                  }, 1500
                );
                currentState = "CauseSelection"
                break
                        
              case "No":
                sendTextMessage(sender, "No1");
                quickReplies(sender, "Drop the baaaase", ["Gun Rights", "nosir"]);
                break
                      
              default:
                        
            }

          } else if (currentState == "CauseSelection") {
            switch (answer) {
              case "Gun Rights":
                // sendTextMessage(sender, "Gun Control Selected");
                setTyping(sender, "on");
                setTimeout(function(){
                  quickReplies(sender, 
                              "How do you feel about this cause?",
                              ["Very For", "Neutral", "Very Against"],
                              "CauseSelected"
                              );
                  setTyping(sender, "off");
                  }, 1500
                ); 
                currentState = "CauseSelected"           
                break

              case "Abortion Rights":
                sendTextMessage(sender, "Abortion Rights");
                break

              case "The Presidential Election":
                sendTextMessage(sender, "The Presential Election");
                break

              default:

            }

          } else if (currentState == "CauseSelected") {
            switch (answer) {
              case "Very For":
                sendButtons(sender, 
                            "Confirm Trade",
                            "Do you want to make a moral trade?",
                            ["Yes", "No"],
                            "AlignmentSelected"
                            );
                currentState = "AlignmentSelected"
                break

              case "Neutral":
                sendTextMessage(sender, "Neutral");
                break

              case "Very Against":
                sendTextMessage(sender, "Very Against");
                break

              default:
                sendTextMessage(sender, "Im sorry, I didnt catch that. Can you retype your message?");


            }

          }
        }
        
        ////////////////////////////////////
      }
   
      callback(null, event);
    }
  };

  function sendTextMessage(sender, text) {
    var json = {
      recipient: {id: sender},
      message: {text: text},
    };

    var body = JSON.stringify(json);

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    };
  }

  function sendButtons(sender, title, subtitle, buttons, state) {
    var json = {
      recipient: {id: sender},
      message: {
          "attachment": {
              "type": "template",
              "payload": {
                  "template_type": "generic",
                  "elements": [{
                      "title": title,
                      "subtitle": subtitle,
                      "buttons": [],
                  }]
              }
          }
      },
    };

    for (var i = 0; i < buttons.length; i++) {
      json.message.attachment.payload.elements[0].buttons.push({"type": "postback", 
                                                                "title": buttons[i], 
                                                                "payload": state + "." + buttons[i]}
                                                              );
    }

    var body = JSON.stringify(json);

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    };

    httpRequestHelper(body, options)
  }

  function quickReplies(sender, titleText, quickReplies, state) {
    var json = {
      recipient: {id: sender},
      "message":{
        "text": titleText,
        "quick_replies":[]
      }
    };

    for (var i = 0; i < quickReplies.length; i++) {
      json.message.quick_replies.push({content_type: "text", 
                                      title: quickReplies[i], 
                                      payload: state + "." + quickReplies[i]}
                                      );
    }

    var body = JSON.stringify(json);

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    };

    var callback = function(response) {

      var str = ''
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
   
      });
    }

    var req = https.request(options, callback);
    req.on('error', function(e) {
      console.log('problem with request: '+ e);
    });
   
    req.write(body);
    req.end();
  }

function setGreetingText(sender) {
    var json = {
      setting_type:"greeting",
      greeting:{
        "text":"Timeless apparel for the masses."
      }
    };

    var body = JSON.stringify(json);

    var path = '/v2.6/me/thread_settings?access_token=' + PAGE_TOKEN;

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    };

    httpRequestHelper(body, options)
  }


  function setTyping(sender, setting) {
    var json = {
      recipient: {id: sender},
      sender_action: "typing_" + setting,
    };

    var body = JSON.stringify(json);

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN;

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    };

    httpRequestHelper(body, options)
  }

  function httpRequestHelper(body, options) {
    var callback = function(response) {

      var str = ''
      response.on('data', function (chunk) {
        str += chunk;
      });

      response.on('end', function () {
   
      });
    }

    var req = https.request(options, callback);
    req.on('error', function(e) {
      console.log('problem with request: '+ e);
    });
   
    req.write(body);
    req.end();

  }