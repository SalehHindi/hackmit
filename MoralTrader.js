  'use strict';

  var https = require('https');
  var PAGE_TOKEN = "EAAPaEOjibZBkBAPRV91xJyQzh4hCdo1MD1QIwZBgMkNEI2ah9FQObF9QTvSJ5ulVaLRX5L5Jdvr1tGL5S895dQX77BwDR2UbTxbZBgZBw3gSA1yEIXujMYDWobzDlhs76NHuZCfklMEN06ghXRWzttlTLWxrahcRFfRn0ZAuZCizgZDZD";
  var VERIFY_TOKEN = "my_awesome_token";

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
        
        setGreetingText(sender);

        ////////////////////////
        // The goal is to have 3 sections 
        // 1) Receive Inputs. inputs = an array of all inputs including button and text inputs.
        // 2) Determine intent of all inputs.
        // 3) Select next state based on strongest intent.

        ////////////////////////////////////
        // Receive Inputs

        // If anything happens
        if (messagingEvent.message) {
            sendTextMessage(sender, "Event");
        }
        
        // If a user sends text
        if (messagingEvent.message && messagingEvent.message.text) {
          var text = messagingEvent.message.text; 
          sendTextMessage(sender, "Text Received");
          if (messagingEvent.message.text == "moral trade") {
              sendButtons(sender, 
                          "Confirm", 
                          "Do you want to start a moral trade?", 
                          ["Yes", "No"],
                          "MoralTradeStarted"
                          );
              // quickReplies(sender, "Do you want to start a moral trade?", ["Yes", "No"]);
          }
        

          callback(null, "Done");
        }
        
        // If a user clicks a button
        if (messagingEvent.postback) {
          var currentState = messagingEvent.postback.payload.split(".")[0];
          var answer = messagingEvent.postback.payload.split(".")[1];
          sendTextMessage(sender, "State: " + currentState);
          sendTextMessage(sender, "Answer: " + answer);

          // sendTextMessage(sender, "State: " + currentState);
          // sendTextMessage(sender, answer);
          // sendTextMessage(sender, "Postbacktriggered");
          
          if (currentState == "MoralTradeStarted") {
            switch (answer) {
              case "Yes":
                sendTextMessage(sender, "Show Cause Selection");
                sendButtons(sender, 
                            "Cause Selection", 
                            "Select the cause you feel the most passionate about", 
                            ["Gun Rights", "Abortion Rights", "The Presidential Election"],
                             "CauseSelection"
                            );
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
                sendTextMessage(sender, "Gun Control Selected");
                sendButtons(sender, 
                            "Alignment Selection",
                            "How do you feel about this cause?",
                            ["Very For", "Neutral", "Very Against"],
                             "CauseSelected"
                            );
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
            sendTextMessage(sender, "Very For1");
            
            switch (answer) {
              case "Very For":
                sendTextMessage(sender, "Very For2");
                sendButtons(sender, 
                            "Confirm Trade",
                            "Do you want to make a moral trade?",
                            ["Yes", "No"],
                             "AlignmentSelected"
                            );
                break

              case "Neutral":
                sendTextMessage(sender, "Neutral");
                break

              case "Very Against":
                sendTextMessage(sender, "Very Against");
                break

              default:

            }

          }
        }

        ////////////////////////////////////
        // Intent Processing


        ////////////////////////////////////
        // State Selection
        
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

  function quickReplies(sender, titleText, quickReplies) {
    var json = {
      recipient: {id: sender},
      "message":{
        "text": "text",
        "quick_replies":[]
      }
    };

    for (var i = 0; i < quickReplies.length; i++) {
      json.message.quick_replies.push({"content_type": "text", 
                                                                "title": quickReplies[i], 
                                                                "payload": quickReplies[i]}
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
