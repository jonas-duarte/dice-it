import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

class WebSocket {
  port = null;
  app = null;

  constructor(port) {
    this.port = port;
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(cors());

    this.app.get("/", function (req, res) {
      res.send("OK");
    });
  }

  listen() {
    /** Run */
    this.app.listen(this.port, function () {
      console.log("Listenning port " + this.port);
    });
  }
}

export default WebSocket;
