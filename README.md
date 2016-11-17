# Moral Trader

A messaging bot to facilitate donation trading.

This was initially built as part of the HackMIT competition.

# Challenge
This project is inspired by a paper I read about moral trades. The idea is that if two people feel very strongly but oppositely about a cause, they are liable to donate to charities that might have the effect of cancelling each other out. For example if someone donates to an organization promising to tighten gun control and someone else donates to an organization with the opposite mission, the money donated might not have a very strong effect in either direction. These people might be willing to agree to donate to a third cause they both care about in order to have a greater impact. Moral Trader is meant to facilitate these trades.

# Solution
The idea is to make a chat bot in Messenger that figures out what causes someone feels strongly about. When another person feels strongly but in the opposite way about a cause, it messages them both and tries to engage a trade. The bot, whose profile picture is of a classy old man and whose cover photo is a French villa, is supposed to have an exquisite personality. 

Implementation
I recently learned about AWS Lambda, Amazon's solution for serverless apps. I decided it would be best to implement this app in Lambda over a traditional server model such as Heroku or Elastic Cloud Compute (EC2) for lower cost and increased speed. The idea behind Lambda is that you give it a function to run and a trigger and Amazon runs your function only in reponse to the trigger. This is ideal for a chat bot because the bot only needs to run after someone messages the bot. In terms of cost, I am only running my function a discrete number of times so it doesn't make sense to have a server run continuously. I previously tried implementing this in Heroku and although the first dyno is free, Amazon promises the first million Lambda calls to be free. So while both implementations are free for now, if this app scales, it will require more dynos in Heroku but will remain free in Lambda for the first million messages. There was also a dramatic decrease in response time when moving to Lambda.

The app works via 3 steps

1. The user input is received.
2. The intent is determined from the input.
3. The intent and the current state determine the next state.

The whole conversation can be imagined as a state graph with each vertex representing a state, ie a message the bot sends, and each edge representing an intent, ie a message the user sends. This function relies on a redis database running on a remote computer to store user data but it would be beneficial to move to DynamoDB as a database. [Here](https://github.com/SalehHindi/hackmit/blob/master/RedisonEC2.md) is how to get redis working with Moral Trader

![State Diagram of a Donation Trade](http://i.imgur.com/mMFc04b.png "State Diagram of a Donation Trade")

The directed graph is stored in the `graph` variable and the semantics is `graph.vertex.nextVertex` or `graph.vertex.f(options)`. Note: in javascript you cannot do `graph."nextState"` but instead must do `graph["nextState"]`. Here are a couple of vertices and edges for the graph:

```javascript
var graph = 
  {"NONE": 
    // Note that instead of passing in sender, I should pass in options as a dict with sender + the stateVariables
    {"DonationTrade": {nextVertex: "donationTradeStarted", f: function(sender) {
        var stateVariables = {state: "", cause: "", alignment: ""}

        setTyping(sender, "on")
        setTimeout(function(){
            quickReplies(sender, 
                        "Hello. Care to do a donation trade?", 
                        ["Yes", "No", "Huh?"],
                        "donationTradeStarted")
            setTyping(sender, "off")
            }, 100
        )
        stateVariables.state = "donationTradeStarted"
        return stateVariables
      }}
    },
  "donationTradeStarted": 
    {"Yes": {nextVertex: "CauseSelection", f: function(sender) {
        var stateVariables = {state: "", cause: "", alignment: ""}

        setTyping(sender, "on")
        setTimeout(function(){
        quickReplies(sender,
                    "Fantastic. Now choose the cause you care most about. And do be honest",
                    ["Gun Rights", "Abortion Rights"],
                    "CauseSelection")
        setTyping(sender, "off")
        }, 100
        )
        stateVariables.state = "CauseSelection"

        return stateVariables
      }},
    "No": {nextVertex: "XXXX", f: function(sender) {
        var stateVariables = {state: "", cause: "", alignment: ""}
        sendTextMessage(sender, "No1")

        return stateVariables
      }},
    "Huh?": {nextVertex: "XXXX", f: function(sender) {
        var stateVariables = {state: "", cause: "", alignment: ""}
        sendTextMessage(sender, "Huh?")

        return stateVariables
      }}
    },
  "CauseSelection": 
    {"Gun Rights": {nextVertex: "CauseSelected", f: function(sender) {
        var stateVariables = {state: "", cause: "", alignment: ""}

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
        stateVariables.state = "CauseSelected" 
        stateVariables.cause = "Gun Rights" 

        return stateVariables
      }},
```

To handle the possibility of multiple different user inputs like "yes", "yup", "Yes", "y", etc currently the code takes the raw user input and filters down to a base case as follows

```javascript
...
switch (userInput) {
case "donation trade":
case "dt":
case "Donation Trade":
case "Trade":
case "Donation trade":
  answer = "Donation Trade";

  break
...
```


Currently, the next state is selected by:
```javascript
...
// If the answer, ie intent, is in the list of possible edges for the current vertex...
if (inList(Object.keys(graph[state]), answer)) {
   var stateVariables = graph[state][answer].f(sender)

   state = stateVariables.state
   cause = stateVariables.cause
   alignment = stateVariables.alignment
} 
...
```

Since the conversation can be represented so well by a graph, I'm thinking of encoding the conversation as a list of vertices and graphs like `(Vertex1, Vertex2, displayFunction, edge)`, where a display function is any of the ways Messenger can send information, like a series of buttons, a list of quick replies, plain text. 

An example of this is 
```javascript
P1 = ("MoralTrade", "CauseSelection", quickReply, "Yes")
P2 = ("MoralTrade", "CauseSelection", quickReply, "No") 
P3 = ("MoralTrade", "CauseSelection", quickReply, "Huh?")
```

# Takeaway
Overall I had a very positive experience coding a chat bot with Lambda. With Lambda, I get very quick response times in the chat, making for a better user experience and it was all very cheap. Additionally imagining a chat bot as a state diagram made programming it very intuitive. Extending the program just means adding more states and functions to the `graph` variable. It's so easy that using this program as a template I coded a chat bot which helps someone find directions to a place on a map all in an afternoon. 

The next step will be to hook up the chatbot to Messenger's payment system to start collecting donations.

Please feel free to email me at shindi@haverford.edu for questions, comments, concerns.