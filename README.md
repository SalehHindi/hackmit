# Moral Trader -- A messaging app meant to facilitate donation trading
http://m.me/MoralTrader

This was initially built as part of the HackMIT competition but it was not completed. A big shout out to Kyu Chang, Audrey Lin, and Kevin Liao for helping me brainstorm this idea.

# Problem
When I was at Effective Altruism Global I read a paper about moral trades. The idea is that if person A feels very for a cause and person B feels very against a cause, they are likely to donate to charities that might have the effect of cancelling each other out. For example consider someone donating to an organization promising to tighten gun control in the US and someone else donating to an organization with the opposite effect. These people might be willing to agree to donate to a third cause they both care about in order to have a greater impact. Moral Trader is meant to facilitate these trades.

# Solution
The idea is to make a chat bot in Messenger that figures out what causes someone feels strongly about. When another person feels strongly but in the opposite way about a cause, it messages them both and tries to engage a trade. The bot, whose profile picture is of a classy old man and whose cover photo is a French villa, is supposed to have an exquisite personality. 

Implementation
I recently learned about AWS Lambda, Amazon's solution for serverless apps. I decided it would be best to implement this app in Lambda over a traditional server model such as Heroku or Elastic Cloud Compute (EC2) for lower cost and increased speed. The idea behind Lambda is that you give it a function to run and a trigger and Amazon runs your function only in reponse to the trigger. This is ideal for a chat bot because the bot only needs to run after someone messages the bot. In terms of cost, I am only running my function a discrete number of times so it doesn't make sense to have a server run continuously. I previously tried implementing this in Heroku and although the first dyno is free, Amazon promises the first million Lambda calls to be free. So while both implementations are free for now, if this app scales, it will require more processors in Heroku but will remain fre in Lambda for the first million messages. There was also a dramatic decrease in response time when moving to Lambda.

The app works via 3 steps

1. The user input is received.
2. The intent is determined from the input.
3. The intent and the current state determine the next state.

The whole conversation can be imagined as a state graph with each vertex representing a state, ie a a message the bot sends, and each edge representing an intent, ie a message the user sends. 

![State Diagram of a Donation Trade](http://i.imgur.com/mMFc04b.png "State Diagram of a Donation Trade")

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

Since the conversation can be represented so well by a graph, I'm thinking of encoding the conversation as a list of vertices and graphs like `(Vertex1, Vertex2, displayFunction, edge)`, where a display function is any of the ways Messenger can send information, like a series of buttons, a list of quick replies, plain text. 

An example of this is 
```
P1 = ("MoralTrade", "CauseSelection", quickReply, "Yes")
P2 = ("MoralTrade", "CauseSelection", quickReply, "No") 
P3 = ("MoralTrade", "CauseSelection", quickReply, "Huh?")
```

# Takeaway
Overall I had a very positive experience coding a chat bot with Lambda. With Lambda, I get very quick response times in the chat, making for a better user experience and it was all very cheap. Additionally imagining a chat bot as a state diagram made programming it very intuitive. I am planning to store all user responses because if I get enough users, the sequence of states can be studied via Markov Chains or recurrent neural networks (I believe the underlying mathematics is the same). 
