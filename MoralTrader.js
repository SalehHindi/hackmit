'use strict';

var https = require('https');
var PAGE_TOKEN = "EAAPaEOjibZBkBAPRV91xJyQzh4hCdo1MD1QIwZBgMkNEI2ah9FQObF9QTvSJ5ulVaLRX5L5Jdvr1tGL5S895dQX77BwDR2UbTxbZBgZBw3gSA1yEIXujMYDWobzDlhs76NHuZCfklMEN06ghXRWzttlTLWxrahcRFfRn0ZAuZCizgZDZD";
var VERIFY_TOKEN = "my_awesome_token";
var state = "";

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
      
      ////////////////////////
      // The goal is to have 3 sections 
      // 1) Receive Inputs. inputs = an array of all inputs including button and text inputs.
      // 2) Determine intent of all inputs.
      // 3) Select next state based on strongest intent.

      ////////////////////////////////////
      // Receive Inputs

      // If anything happens
      if (messagingEvent.message) {
          sendTextMessage(sender, "Event")
      }
      
      // If a user sends text
      if (messagingEvent.message && messagingEvent.message.text) {
        var text = messagingEvent.message.text; 
       
        sendTextMessage(sender, "Text Received") 
        if (messagingEvent.message.text == "moral trade") {
            state = "MoralTradeStarted";
            sendButtons(sender, "Confirm", "Do you want to start a moral trade?", ["Yes", "No"]);
        }

        callback(null, "Done")
      }
      
      // If a user clicks a button
      if (messagingEvent.postback) {
        // Where all the logic for button goes
        sendTextMessage(sender, "State: " + state);
        sendTextMessage(sender, messagingEvent.postback.payload);
        sendTextMessage(sender, "Postbacktriggered");
          
        if (state == "MoralTradeStarted") {
          switch (messagingEvent.postback.payload) {
            case "Yes":
              state = "CauseSelection";
              sendTextMessage(sender, "Show Cause Selection");
              sendButtons(sender, 
                          "Cause Selection", 
                          "Select the cause you feel the most passionate about", 
                          ["Gun Rights", "Abortion Rights", "The Presidential Election"]
                          );
              break
                      
            case "No":
              sendTextMessage(sender, "No1");
              quickReplies(sender, "Drop the baaaase", ["Gun Rights", "nosir"]);
              break
                    
            default:
                      
          }

        } else if (state == "CauseSelection") {
          switch (messagingEvent.postback.payload) {
            case "Gun Rights":
              sendTextMessage(sender, "Gun Control Selected");
              sendButtons(sender, 
                          "Alignment Selection",
                          "How do you feel about this cause?",
                          ["Very For", "Neutral", "Very Against"]
                          );
              state = "CauseSelected";
              break

            case "Abortion Rights":
              sendTextMessage(sender, "Abortion Rights");
              break

            case "The Presidential Election":
              sendTextMessage(sender, "The Presential Election");
              break

            default:

          }

        } else if (state == "CauseSelected") {
          sendTextMessage(sender, "Very For1");
          
          switch (messagingEvent.postback.payload) {
            case "Very For":
              state = "AlignmentSelected";
              sendTextMessage(sender, "Very For2");
              sendButtons(sender, 
                          "Confirm Trade",
                          "Do you want to make a moral trade?",
                          ["Yes", "No"]
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

function sendButtons(sender, title, subtitle, buttons) {
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
                                                              "payload": buttons[i]}
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

// Note, when a user selects a quick reply, that is the same as if they sent that piece of text
function quickReplies(sender, titleText, quickReplies) {
  var json = {
    recipient: {id: sender},
    "message":{
      "text": "text",
      "quick_replies":[
        {
          "content_type":"text",
          "title":"Red",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
        },
        {
          "content_type":"text",
          "title":"Green",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
        }
      ]
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
