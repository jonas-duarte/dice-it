"use strict";

const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3002 });

let state = {
  actions: [],
  images: [],
};

/** Geberate Token */
const generateTokenString = (length) => {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var token = "";
  for (let i = 0; i < length; i++) {
    token += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return token;
};

const rollDice = ({ player, dice }) => {
  const value = Math.floor(Math.random() * dice) + 1;
  const action = { event: "rollDice", player, dice, value };
  state.actions.unshift(action);
  // TODO: if actions lenght > 100
  if (state.actions.length > 100) state.actions.pop();
  return action;
};

const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://admin:UE2XQiFUwomcNNNI@cluster0-yoopc.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true });
client.connect((err) => {
  if (!err) {
    console.log("Successfully connected in the data base :)");
  } else {
    console.log("Error: " + err);
    return;
  }

  const storage = client.db("dice-it").collection("storage");

  storage.findOne({ key: "state" }).then((s) => {
    if (s) {
      state = { ...state, ...s.value };
    }

    wss.on("connection", function connection(ws) {
      ws.on("message", function incoming(d) {
        const data = JSON.parse(d);
        let result;
        switch (data.event) {
          case "setImages":
            state.images = data.images;
            result = { event: "getImages", images: state.images };
            wss.clients.forEach(function each(client) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(result));
              }
            });
            break;
          case "getState":
            result = { event: "getState", state };
            ws.send(JSON.stringify(result));
            break;
          case "rollDice":
            result = rollDice(data);
            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(result));
              }
            });
            break;
        }

        storage.updateOne(
          { key: "state" },
          { $set: { key: "state", value: state } },
          { upsert: true }
        );
      });
    });
  });
});
