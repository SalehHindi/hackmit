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
      
      // If anything happens
      if (messagingEvent.message) {
          sendTextMessage(sender, "Event")
      }
      
      // If a user sends text
      if (messagingEvent.message && messagingEvent.message.text) {
        var text = messagingEvent.message.text; 
        console.log("Receive a message: " + text);
        
        if (messagingEvent.message.text == "moral trade") {
            sendButtons(sender, "Confirm", "Do you want to start a moral trade?", ["Yes", "No"]);
            state = "MoralTradeStarted";
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
              sendTextMessage(sender, "Show Cause Selection");
              state = "CauseSelection";
              sendButtons(sender, 
                          "Cause Selection", 
                          "Select the cause you feel the most passionate about", 
                          ["Gun Rights", "Abortion Rights", "The Presidential Election"]
                          );
              break
                      
            case "No":
                  
              break
                    
            default:
                      
          }

        } else if (state == "CauseSelection") {
          switch (messagingEvent.postback.payload) {
            case "Gun Rights":
              sendTextMessage(sender, "Gun Control Selected");
              state = "CauseSelected";
              alignmentSelection(sender);
              break

            case "Abortion Rights":

              break

            case "The Presidential Election":

              break

            default:

          }

        } else if (state == "CauseSelected") {
          sendTextMessage(sender, "Very For");
          state = "AlignmentSelected";
          confirmTrade(sender);
        }
      }
      
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

//Clean up variable names. sender -> sender 
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

function alignmentSelection(sender) {
  var json = {
    recipient: {id: sender},
    message: {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Alignment Selection",
                    "subtitle": "How do you feel about this cause?",
                    "buttons": [{
                        "type": "postback",
                        "title": "Very For",
                        "payload": "veryfor",
                    }, 
                    {
                        "type": "postback",
                        "title": "Neutral",
                        "payload": "neutral",
                    },
                    {
                        "type": "postback",
                        "title": "Very Against",
                        "payload": "veryagainst",
                    }],
                }]
            }
        }
    }
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

function confirmTrade(sender) {
  var json = {
    recipient: {id: sender},
    message: {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Confirm Trade",
                    "subtitle": "It looks like you are very for gun control. Do you want to trade with someone who is very against gun control?",
                    "buttons": [{
                        "type": "postback",
                        "title": "Yes",
                        "payload": "yes",

                    }, 
                    {
                        "type": "postback",
                        "title": "No",
                        "payload": "no",
                    }],
                }]
            }
        }
    },
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