  'use strict'

  var redis = require('redis')
  var redisClient = redis.createClient(6379, "ec2-35-160-109-188.us-west-2.compute.amazonaws.com")
  redisClient.on("connect", function(){console.log('connected')})

  var https = require('https')
  var PAGE_TOKEN = "EAAPaEOjibZBkBAPRV91xJyQzh4hCdo1MD1QIwZBgMkNEI2ah9FQObF9QTvSJ5ulVaLRX5L5Jdvr1tGL5S895dQX77BwDR2UbTxbZBgZBw3gSA1yEIXujMYDWobzDlhs76NHuZCfklMEN06ghXRWzttlTLWxrahcRFfRn0ZAuZCizgZDZD"
  var VERIFY_TOKEN = "my_awesome_token"

  // load from causes.txt instead
  var causes = [ 
    {
      title: "Gun Rights", 
      image_url:"https://upload.wikimedia.org/wikipedia/commons/e/eb/Ash_Tree_-_geograph.org.uk_-_590710.jpg",
      subtitle: "The right for people to own arms.", 
      buttons: [
        {
          type: "postback",
          title: "Choose Gun Rights",
          payload: "UserSelectedCause.Gun Rights"
        },
        {
          type: "web_url",
          url: "https://en.wikipedia.org/wiki/Tree#/media/File:Ash_Tree_-_geograph.org.uk_-_590710.jpg",
          title: "Wikipedia"
        },
        {
          type: "web_url",
          url: "https://en.wikipedia.org/wiki/Tree#/media/File:Ash_Tree_-_geograph.org.uk_-_590710.jpg",
          title: "Visit Website"
        }]
    },
    {
      title: "Abortion Rights", 
      image_url:"https://upload.wikimedia.org/wikipedia/commons/e/eb/Ash_Tree_-_geograph.org.uk_-_590710.jpg",
      subtitle: "The right to freely have an abortion.", 
      buttons: [
        {
          type: "postback",
          payload: "UserSelectedCause.Abortion Rights",
          title: "Choose Abortion Rights"
        },
        {
          type: "web_url",
          url: "https://en.wikipedia.org/wiki/Tree#/media/File:Ash_Tree_-_geograph.org.uk_-_590710.jpg",
          title: "Wikipedia"
        },
        {
          type: "web_url",
          url: "https://en.wikipedia.org/wiki/Tree#/media/File:Ash_Tree_-_geograph.org.uk_-_590710.jpg",
          title: "Visit Website"
        }]
    },
    {
      title: "Presidential Elections", 
      image_url:"https://upload.wikimedia.org/wikipedia/commons/e/eb/Ash_Tree_-_geograph.org.uk_-_590710.jpg",
      subtitle: "The US Presidential Election", 
      buttons: [
        {
          type: "postback",
          payload: "UserSelectedCause.Presidential Elections",
          title: "Choose Presidential Elections"
        },
        {
          type: "web_url",
          url: "https://en.wikipedia.org/wiki/Tree#/media/File:Ash_Tree_-_geograph.org.uk_-_590710.jpg",
          title: "Wikipedia"
        },
        {
          type: "web_url",
          url: "https://en.wikipedia.org/wiki/Tree#/media/File:Ash_Tree_-_geograph.org.uk_-_590710.jpg",
          title: "Visit Website "
        }]
    },
    {
      title: "Some Other Hot Cause", 
      image_url:"https://upload.wikimedia.org/wikipedia/commons/e/eb/Ash_Tree_-_geograph.org.uk_-_590710.jpg",
      subtitle: "The blah blah blah", 
      buttons: [
        {
          type: "postback",
          payload: "UserSelectedCause.Some Other Cause",
          title: "Choose Some Other Cause"
        },
        {
          type: "web_url",
          url: "https://en.wikipedia.org/wiki/Tree#/media/File:Ash_Tree_-_geograph.org.uk_-_590710.jpg",
          title: "Wikipedia"
        },
        {
          type: "web_url",
          url: "https://en.wikipedia.org/wiki/Tree#/media/File:Ash_Tree_-_geograph.org.uk_-_590710.jpg",
          title: "Visit Website "
        }]
    }
  ]

  var graph = 
  {"NONE": 
    {"DonationTrade": {nextVertex: "donationTradeStarted", f: function(options) {
        var stateVariables = {state: options.state, cause: options.cause, alignment: options.alignment}

        quickReplies(options.sender, 
                    "Hello. Care to do a donation trade?", 
                    ["Yes", "No", "Huh?"],
                    "donationTradeStarted")

        stateVariables.state = "donationTradeStarted"
        return stateVariables
      }}
    },
  "donationTradeStarted": 
    {"Yes": {nextVertex: "CauseSelection", f: function(options) {
        var stateVariables = {state: options.state, cause: options.cause, alignment: options.alignment}

        carousel(options.sender, causes, "CauseSelection")
        // quickReplies(options.sender,
        //             "Fantastic. Now choose the cause you care most about. And do be honest.",
        //             ["Gun Rights", "Abortion Rights"],
        //             "CauseSelection")

        stateVariables.state = "CauseSelection"

        return stateVariables
      }},
    "No": {nextVertex: "NONE", f: function(options) {
        var stateVariables = {state: options.state, cause: options.cause, alignment: options.alignment}

        sendTextMessage(options.sender, "In that case, I must bid you farewell. If you ever want to " +
          "engage in a donation trade just write 'donation trade'. Farewell!")

        stateVariables.state = ""
        stateVariables.cause = ""
        stateVariables.alignment = ""

        return stateVariables
      }},
    "Huh?": {nextVertex: "donationTradeStarted", f: function(options) {
        var stateVariables = {state: options.state, cause: options.cause, alignment: options.alignment}

        sendTextMessage(options.sender, "Let me do my best to explain donation trading. When two people disagree strongly " +
          "about a hot bed cause like abortion or gun rights, instead of donating to causes that cancel each other out, they can " +
          "both donate to highly effective charities that they find agreeable. " +
          "In a way, they are agreeing to disagree and work towards a common good.")

        // This is the way to automatically hop to another point in the graph.
        // I need to have a pause between this line and the next step. Otherwise, it interferes with Facebook's instant reply buttons
        return graph["NONE"]["DonationTrade"].f({sender: options.sender, 
                                                    state: options.state,
                                                    cause: options.cause,
                                                    alignment: options.alignment})

      }}
    },
  "CauseSelection": 
    {"Cause": {nextVertex: "AlignmentSelection", f: function(options) {
        var stateVariables = {state: options.state, cause: options.cause, alignment: options.alignment}

        quickReplies(options.sender, 
                    "Extraordinary choice. Tell me, how do you really feel about it?",
                    ["Very For", "Neutral", "Very Against"],
                    "AlignmentSelection")

        stateVariables.state = "AlignmentSelection" 
        // We need some way to get answer 
        stateVariables.cause = options.answer

        return stateVariables
      }}
    },
  "AlignmentSelection": 
    {"Alignment": {nextVertex: "ConfirmTrade", f: function(options) {
        var stateVariables = {state: options.state, cause: options.cause, alignment: options.alignment}

        sendButtons(options.sender, 
                    "Confirm Trade",
                    "Do you want to post the trade?",
                    ["Yes", "No"],
                    "ConfirmTrade")

        stateVariables.state = "ConfirmTrade"
        // We need some way to get answer.
        stateVariables.alignment = options.answer 

        return stateVariables
      }}
    },
  "ConfirmTrade": 
    {"Yes": {nextVertex: "", f: function(options) {
        var stateVariables = {state: options.state, cause: options.cause, alignment: options.alignment}

        var matchFound = false
        sendTextMessage(options.sender, "♞♚♝♛♟♜Trade Posted♞♚♝♛♟♜")

        console.log("Lrange Started")
        redisClient.lrange('MoralTrade:awaitingMatches', 0, -1, function(err, matches) {
          // matches = matches.map(function(x){JSON.parse(x)}) is equivalent to the 3 lines below
          for (var i = 0; i < matches.length; i++) {
            matches[i] = JSON.parse(matches[i])
          }

          console.log("Matches: " + matches)

          // One idea for the future: The total list of alignments should be a huge list of different
          //   alignments and you specify how many different alignments you want for the application.
          var alignments = ["Very For", "Neutral", "Very Against"]
          var oppositeAlignment = alignments[(alignments.length-1) - alignments.indexOf(options.alignment)]

          console.log("1: " + options.alignment)
          console.log("2: " + alignments.indexOf(options.alignment))
          console.log("2: " + oppositeAlignment)

          console.log("loop started***")
          for (var i = 0; i < matches.length; i++) {
            console.log("Remove: " + JSON.stringify(matches[i]))
            console.log("Matches[i]: " + matches[i])
            console.log("Matches keys: " + Object.keys(matches[i]))

            console.log("loop: " + i)
            console.log("match.cause: " + matches[i].cause)
            console.log("options.cause: " + options.cause)
            console.log("match.alignment: " + matches[i].alignment)
            console.log("opposite alignment: " + oppositeAlignment)

            if (matches[i].cause == options.cause && matches[i].alignment == oppositeAlignment) {
              console.log("We have a match!")
              // For some reason, when a match is found, there is an extra entry in the DB...
              redisClient.lrem('MoralTrade:awaitingMatches', 1, JSON.stringify(matches[i])) 

              // sendTextMessage(options.sender, "You got a match!!!") // The person who is currently posting the trade
              sendTextMessage(matches[i].sender, "You got a match!!!") // The person who posted the trade earlier

              // Initiate payments workflow
              matchFound = true
              break
            }
          }

        })
        console.log("Lrange ended")
        
        if (!matchFound) {
          redisClient.lpush(["MoralTrade:awaitingMatches", JSON.stringify({sender: options.sender, cause: options.cause, alignment: options.alignment})])
        }

        stateVariables.state = "" //Should be MatchFinding
        stateVariables.cause = ""
        stateVariables.alignment = ""

        return stateVariables

        // The next state will be match finding and then after that finances...
    }}
  },
  "CATCHALLSTATE": 
    {"CATCHALLANSWER": {nextVertex: "XXXX", f: function() {}}
    }
  }

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
            // Need a try statement here
            userInput = messagingEvent.message.quick_reply.payload.split(".")[1]
          } 

          callback(null, "Done")
        }
        
        // If a user clicks a button
        if (messagingEvent.postback) {
          userInput = messagingEvent.postback.payload.split(".")[1]
          console.log("Reached")
          console.log(userInput)
        }

        console.log("intent processing started")

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
              answer = "DonationTrade"
            
              break

            case "Yes":
            case "yes":
            case "si":
            case "yup":
            case "y":
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
            case "Presidential Elections":
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

        console.log("intent processing cleared")

        ////////////////////////////////////
        // State Selection
        // sendTextMessage(sender, "Program running")
        if (answer != "") {
          // Get state
          // sender: 1108136689268764
          // redisClient.set("MoralTrade:" + sender, JSON.stringify({sender:1108136689268764, state:"", cause: "", alignment: ""}))          

          console.log("Sender: " + sender)
          redisClient.get("MoralTrade:" + sender, function(err, reply) {
            // I think the issue with testing is that when you try to get MoralTrade:ID, for a new ID, the values are nil.
            // so try to console.log(userData) for a random ID as sender and see what it says. Let that value be XXX. 
            // If (userData == XXX) { init the values to blank ie ""}

            var userData = JSON.parse(reply);
            console.log("USER DATA:" + JSON.stringify(userData))

            // userData = null in the case of a new user using the bot
            if (userData == null) {
              userData = {sender: sender, state: "", cause: "", alignment: ""}
            }

            //These are the stateVariables that control the flow of the program
            var state = userData.state
            var cause = userData.cause
            var alignment = userData.alignment

            var vertex
            var listOfCauses = ["Presidential Elections", "Gun Rights", "Abortion Rights"]
            var listOfAlignments = ["Very For", "Neutral", "Very Against"]
            if (inList(listOfCauses, answer)) {
              vertex = "Cause"
            } else if (inList(listOfAlignments, answer)) {
              vertex = "Alignment"
            } else {
              vertex = answer
            }

            // state = "" in the case of the start of a donation trade (either new user or restarting)
            if (state == "") {
              state = "NONE"
            }

            // Add a vertex variable. 
            // If answer in listOfCauses: vertex = "cause". 
            // If answer in listOfAlignments: vertex = "alignment"
            // else: vertex = answer
            // and then do graph[state][vertex].f instead of graph[state][answer].f
            // and also pass in answer: answer to options to be able to combine alignments AND causes.

            console.log("State:" + state)
            console.log("answer:" + answer)
            console.log("Graph:" + JSON.stringify(graph))

            if (inList(Object.keys(graph[state]), vertex)) {
              // This is the fundamental graph operation
              var stateVariables = graph[state][vertex].f({sender: sender, 
                                                          state: state,
                                                          cause: cause,
                                                          alignment: alignment,
                                                          answer: answer})

              // state = graph[state][answer].nextVertex
              state = stateVariables.state
              cause = stateVariables.cause
              alignment = stateVariables.alignment
            } else {
              sendTextMessage(sender, "Sorry, I didn't catch that. Could you repeat that?")
            }
            console.log("Setting started")

            redisClient.set("MoralTrade:" + sender, JSON.stringify({"sender": sender, "state": state, "cause": cause, "alignment": alignment}))          
            console.log("Setting ended")

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

  function inList(list, el) {
    // Another way to do inList:
    // [1,2,3,4,5].reduce(function(x, y) {return (x === true || y == 0)}, false)
    // list.reduce(function(x, y) {return (x === true || y == el)}, false)

    var i = 0
    while (i < list.length) {
      if (list[i] === el) {
        return true
      }
      i += 1
    }
    return false
  }

  // function randomResponse(respType) {
  //     
  // }

  // function findOpenStates() {
  // 
  // }


  //👍 👎 🤖 ♞♚♝♛♟♜

  // MVP:
  // - Better error handling
  // - Add a greeting

  // Planned Features
  // - Intelligent intent processing
  // - Multiple responses and a method for randomly choosing them.
