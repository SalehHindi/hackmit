'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const token = "EAAPaEOjibZBkBAKOX0gacDUedVsZCZBw2CUfwda6Gm11HkKnxZANfp9zu5to3ab4U2lnd7qVpxTldZBJ42Kdm2mIsik55SUy23MkhZCgTtTD4PDaSIS1o5gAtnQ5oZBeEKvguhm3fRBZCsYZAZB8e8MOOKAJTD83LhpLoVgYvsoBcpXQZDZD"

var state = 0

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
    sendTextMessage(sender, "Processing")
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id

        if (event.message && event.message.text) {
            let text = event.message.text
            sendTextMessage(sender, "STAGING")
            // sendGenericMessage(sender)
        }
        if (event.postback) {
            let text = event.postback.payload
            sendTextMessage(sender, "Postback Triggered " + state + ": ", token)

            switch (state) {
                case 0:
                    sendTextMessage(sender, "State 0")
                    state = 1
                    break

                case 1:
                    sendTextMessage(sender, "State 1")
                    state = 2
                    break

        		// // Response to "Do you want to do a moral trade?"
        		// case 1:
        		// 	if (text == "yes") {
        		// 		state = 1
        		// 		causeSelection(sender)
			       //      sendTextMessage(sender, "Hello there yes")
        		// 	} else if (text == "no") {
        		// 		state = 2
        		// 		sendTextMessage(sender, "Great!", token)
			       //      sendTextMessage(sender, "Hello there noooo")
        		// 	}

	        	// 	break

	        	// // How do you feel about your cause?
        		// case 2:
        		// 	if (text == "gun") {
        		// 		state = 2
        		// 		sendTextMessage(sender, "gun", token)
        		// 	} else if (text == "abortion") {
        		// 		state = 2
        		// 		sendTextMessage(sender, "abortion", token)
        		// 	} else if (text == "president") {
        		// 		state = 2
        		// 		sendTextMessage(sender, "president", token)
        		// 	}

        		// 	break

          //       // How do you feel about your cause?
          //       // case 3:
          //           // if (text == ) {

          //           // }
          //           // break

        		default:
        			state = 0
		            sendTextMessage(sender, "Im sorry I didnt catch that. State set to 0")

        	}

	        continue
        }
    }
    res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

// Respond with some text
function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// Do you want to make a moral trade?
function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Hello",
                    "subtitle": "Do you want to make a moral trade?",
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
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// Cause selection
function causeSelection(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Cause Selection",
                    "subtitle": "Select the cause you feel the most passionate about",
                    "buttons": [{
                        "type": "postback",
                        "title": "Gun Rights",
                        "payload": "yes",

                    }, 
                    {
                        "type": "postback",
                        "title": "Abortion Rights",
                        "payload": "abortion",
                    },
                    {
                        "type": "postback",
                        "title": "Presidential Election",
                        "payload": "president",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}