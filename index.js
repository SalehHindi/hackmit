  'use strict'

  var redis = require('redis')
  var redisClient = redis.createClient(6379, "ec2-35-161-227-141.us-west-2.compute.amazonaws.com")
  redisClient.on("connect", function(){console.log('connected')})

  var https = require('https')
  var PAGE_TOKEN = "EAAPaEOjibZBkBAPRV91xJyQzh4hCdo1MD1QIwZBgMkNEI2ah9FQObF9QTvSJ5ulVaLRX5L5Jdvr1tGL5S895dQX77BwDR2UbTxbZBgZBw3gSA1yEIXujMYDWobzDlhs76NHuZCfklMEN06ghXRWzttlTLWxrahcRFfRn0ZAuZCizgZDZD"
  var VERIFY_TOKEN = "my_awesome_token"

  // I could make this leaner with a database of all the causes.
  // redisClient.get("MoralTrade:CauseLis")
  var causes = [ 
    {
      title: "Gun Rights", 
      subtitle: "The right for people to own arms.", 
      buttons: [
        {
          type: "web_url",
          url: "https://petersfancybrownhats.com",
          title: "Placeholder Button"
        }]
    },
    {
      title: "Abortion Rights", 
      subtitle: "The right to freely have an abortion.", 
      buttons: [
        {
          type: "web_url",
          url: "https://petersfancybrownhats.com",
          title: "Placeholder Button"
        }]
    },
    {
      title: "Presidential Elections", 
      subtitle: "The US Presidential Election", 
      buttons: [
        {
          type: "web_url",
          url: "https://petersfancybrownhats.com",
          title: "Placeholder Button"
        }]
    },
    {
      title: "Some Other Hot Cause", 
      subtitle: "The blah blah blah", 
      buttons: [
        {
          type: "web_url",
          url: "https://petersfancybrownhats.com",
          title: "Placeholder Button"
        }]
    }
  ]

  // Turn this into a function
  exports.handler = (event, context, callback) => {

    // process GET request
    if(event.params && event.params.querystring){
      var queryParams = event.params.querystring
      var rVerifyToken = queryParams['hub.verify_token']
   
      if (rVerifyToken === VERIFY_TOKEN) {
        var challenge = queryParams['hub.challenge']
        callback(null, parseInt(challenge))
      } else{
        callback(null, 'Error, wrong validation token')
      }
   
    // process POST request
    } else{
   
      var messagingEvents = event.entry[0].messaging
      for (var i = 0; i < messagingEvents.length; i++) {
        var messagingEvent = messagingEvents[i]
        var sender = messagingEvent.sender.id
        
        var userInput = ""

        setGreetingText(sender)

        ////////////////////////
        // The goal is to have 3 sections 
        // 1) Receive Inputs. inputs = an array of all inputs including button and text inputs.
        // 2) Determine intent of all inputs.
        // 3) Select next state based on strongest intent.

        ////////////////////////////////////
        // Receive Inputs

        // If any event happens
        if (messagingEvent.message) {
            // sendTextMessage(sender, "Event")
        }
        

        // If a user sends text
        if (messagingEvent.message && messagingEvent.message.text) {
          var text = messagingEvent.message.text
          userInput = text

          // If the user sends text by clicking a quick reply button
          if (messagingEvent.message.quick_reply) {
            userInput = messagingEvent.message.quick_reply.payload.split(".")[1]
          } 

          callback(null, "Done")
        }
        
        // If a user clicks a button
        if (messagingEvent.postback) {
          userInput = messagingEvent.postback.payload.split(".")[1]
          sendTextMessage(sender, "Answer: " + userInput)
        }

        ////////////////////////////////////
        // Intent Processing

        // This would be a good use case for wit.ai

        var answer = userInput
        if (userInput != "") {
          switch (userInput) {
            case "donation trade":
            case "dt":
            case "Donation Trade":
            case "Trade":
            case "Donation trade":
              answer = "Donation Trade"
            
              break

            case "Yes":
            case "yes":
            case "si":
            case "yup":
            case "Yup":
              answer = "Yes"

              break

            case "No":
            case "no":
            case "n":
            case "nope":
            case "Nope":
              answer = "No"
            
              break

            case "Gun Rights":
            case "Guns":
            case "guns":
            case "gun":
            // case "":
              answer = "Gun Rights"

              break

            case "Abortion Rights":
            case "abortions":
            // case "":
            // case "":
            // case "":
              answer = "Abortion Rights"

              break

            case "Elections":
            // case "":
            // case "":
            // case "":
            // case "":
              answer = "Presidential Elections"

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

        ////////////////////////////////////
        // State Selection

        // sendTextMessage(sender, "Program running")
        if (answer != "") {
          // Get state
          // sender: 1108136689268764
          // redisClient.set("MoralTrade:" + sender, JSON.stringify({sender:1108136689268764, state:"", cause: "", alignment: ""}))          

          redisClient.get("MoralTrade:" + sender, function(err, reply) {
            var userData = JSON.parse(reply);
            var state = userData.state
            var cause = userData.cause
            var alignment = userData.alignment

            // sendTextMessage(sender, "state::" + state)
            // sendTextMessage(sender, "cause::" + cause)
            // sendTextMessage(sender, "answer::" + answer)
            // sendTextMessage(sender, "alignment::" + alignment)

            if (state == "") {
              switch (answer) {
                case "Donation Trade":
                  // redisClient.set("MoralTrade:awaitingMatches", JSON.stringify({sender: sender,
                  //                                                               state: state}))

                  setTyping(sender, "on")
                  setTimeout(function(){
                    quickReplies(sender, 
                                "Hello. Care to do a donation trade?", 
                                ["Yes", "No", "Huh?"],
                                "donationTradeStarted")
                    setTyping(sender, "off")
                    }, 100
                  )
                  //userData.state = "donationTradeStarted"
                  state = "donationTradeStarted"
                  break
              }
                                              
            } else if (state == "donationTradeStarted") {
              switch (answer) {
                case "Yes":
                  // sendTextMessage(sender, "Show Cause Selection")
                  redisClient.set("MoralTrade:test", "it works!")

                  setTyping(sender, "on")
                  setTimeout(function(){
                    quickReplies(sender,
                                "Fantastic. Now choose the cause you care most about. And do be honest",
                                ["Gun Rights", "Abortion Rights"],
                                "CauseSelection")
                    setTyping(sender, "off")
                    }, 100
                  )
                  //userData.state = "CauseSelection"
                  state = "CauseSelection"
                  break
                          
                case "No":
                  sendTextMessage(sender, "No1")
                  break

                case "Huh?":
                  sendTextMessage(sender, "Huh?")
                  break
                        
                default:
                          
              }

            } else if (state == "CauseSelection") {
              switch (answer) {
                case "Gun Rights":
                  // sendTextMessage(sender, "Gun Control Selected")
                  setTyping(sender, "on")
                  setTimeout(function(){
                    quickReplies(sender, 
                                "Extraordinary choice. Tell me, how do you really feel about it?",
                                ["Very For", "Neutral", "Very Against"],
                                "CauseSelected"
                                )
                    setTyping(sender, "off")
                    }, 100
                  ) 
                  state = "CauseSelected" 
                  cause = "Gun Rights" // ie cause = answer
                  break

                case "Abortion Rights":
                  sendTextMessage(sender, "Abortion Rights")
                  break

                case "The Presidential Election":
                  sendTextMessage(sender, "The Presential Election")
                  break

                default:

              }

            } else if (state == "CauseSelected") {
              switch (answer) {
                case "Very For":
                  setTyping(sender, "on")
                  setTimeout(function(){
                    sendTextMessage(sender, "Very good. Lets proceed.")
                    sendButtons(sender, 
                                "Confirm Trade",
                                "Do you want to post the trade?",
                                ["Yes", "No"],
                                "AlignmentSelected"
                                )
                    setTyping(sender, "off")
                    }, 100
                  ) 

                  // userData.alignment = "Very For"
                  state = "AlignmentSelected"
                  alignment = "Very For" // ie alignment = answer
                  break

                case "Neutral":
                  sendTextMessage(sender, "Neutral")
                  break

                case "Very Against":
                  sendTextMessage(sender, "Very Against")
                  break

                default:
                  sendTextMessage(sender, "You have outwitted me! Please, please, reframe your answer.")

              }

            } else if (state == "AlignmentSelected") {
              sendTextMessage(sender, "♞♚♝♛♟♜")
              switch (answer) {
                case "Yes":
                  // Later, when we implement statefulness, I will push name, cause, alignment


                  redisClient.lpush(["MoralTrade:awaitingMatches", JSON.stringify({name: sender, cause: cause, alignment: alignment})])
                  sendTextMessage(sender, "♞♚♝♛♟♜Trade Posted♞♚♝♛♟♜")

                  state = "" //Should be MatchFinding
                  cause = ""
                  alignment = ""

                  // The next state will be match finding and then after that finances...
                  break

                default:
              }
            }

            // sendTextMessage(sender, state)
            redisClient.set("MoralTrade:" + sender, JSON.stringify({"sender":1108136689268764, "state":state, "cause": cause, "alignment": alignment}))          

          });
        }
        
        ////////////////////////////////////
      }
   
      callback(null, event)
    }
  }

  function sendTextMessage(sender, text) {
    var json = {
      recipient: {id: sender},
      message: {text: text},
    }

    var body = JSON.stringify(json)

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }

    httpRequestHelper(body, options)
  }
  
  // Called with carousel(sender, causes, "") 
  function carousel(sender, options, state) {
    var json = {
      recipient: { id:sender },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: []
          }
        }
      }
    }

    // Buttons: Buttons will be information about the cause to learn more.
    // In the future it might be a link to a wikipedia article, infographics, how many people have donated, maybe a way to contact
    // People who voted a certain way... etc.

    for (var i = 0; i < options.length; i++) {
      json.message.attachment.payload.elements.push(options[i])
    }

    var body = JSON.stringify(json)

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }

    httpRequestHelper(body, options)
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
    }

    for (var i = 0; i < buttons.length; i++) {
      json.message.attachment.payload.elements[0].buttons.push({"type": "postback", 
                                                                "title": buttons[i], 
                                                                "payload": state + "." + buttons[i]}
                                                              )
    }

    var body = JSON.stringify(json)

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }

    httpRequestHelper(body, options)
  }

  function quickReplies(sender, titleText, quickReplies, state) {
    var json = {
      recipient: {id: sender},
      "message":{
        "text": titleText,
        "quick_replies":[]
      }
    }

    for (var i = 0; i < quickReplies.length; i++) {
      json.message.quick_replies.push({content_type: "text", 
                                      title: quickReplies[i], 
                                      payload: state + "." + quickReplies[i]}
                                      )
    }

    var body = JSON.stringify(json)

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }

    var callback = function(response) {

      var str = ''
      response.on('data', function (chunk) {
        str += chunk
      })

      response.on('end', function () {
   
      })
    }

    var req = https.request(options, callback)
    req.on('error', function(e) {
      console.log('problem with request: '+ e)
    })
   
    req.write(body)
    req.end()
  }

  function setGreetingText(sender) {
    var json = {
      setting_type:"greeting",
      greeting:{
        "text":"Timeless apparel for the masses."
      }
    }

    var body = JSON.stringify(json)

    var path = '/v2.6/me/thread_settings?access_token=' + PAGE_TOKEN

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }

    httpRequestHelper(body, options)
  }

  function setTyping(sender, setting) {
    var json = {
      recipient: {id: sender},
      sender_action: "typing_" + setting,
    }

    var body = JSON.stringify(json)

    var path = '/v2.6/me/messages?access_token=' + PAGE_TOKEN

    var options = {
      host: "graph.facebook.com",
      path: path,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }

    httpRequestHelper(body, options)
  }

  function httpRequestHelper(body, options) {
    var callback = function(response) {

      var str = ''
      response.on('data', function (chunk) {
        str += chunk
      })

      response.on('end', function () {
   
      })
    }

    var req = https.request(options, callback)
    req.on('error', function(e) {
      console.log('problem with request: '+ e)
    })
   
    req.write(body)
    req.end()
  }

  //♞♚♝♛♟♜
