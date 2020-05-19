import React, { Component } from "react";
import ImagesPanel from "../../components/images-panel";

import "./index.css";

// const URL = "ws://localhost:3002";
const URL = "ws://18.231.117.102:3002";

const dices = [4, 6, 8, 10, 12, 20, 100];

class Home extends Component {
  state = {
    form: {
      name: "",
    },
    character: null,
    actions: [],
    images: [],
    connected: false,
  };

  ws = new WebSocket(URL);

  componentDidMount() {
    // Reload the page if websocket is disconected
    setTimeout(() => {
      const tryToReconnect = () => {
        if (!this.state.connected) {
          window.location.reload(false);
        }
        setTimeout(tryToReconnect, 1000);
      };
      tryToReconnect();
    }, 2000);

    this.ws.onopen = () => {
      // TODO: LOAD DATA FROM BACKEND
      console.log("connected");

      this.ws.send(JSON.stringify({ event: "getState" }));
    };

    this.ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);

      switch (data.event) {
        case "getImages":
          this.setState({ images: data.images });
          break;
        case "getState":
          this.setState({
            actions: data.state.actions,
            images: data.state.images,
            connected: true,
          });
          break;
        case "rollDice":
          const { actions } = this.state;
          actions.unshift(data);
          if (actions.length > 100) actions.pop();
          this.setState({ actions });
          break;
      }
    };

    this.ws.onclose = () => {
      console.log("disconnected");
      this.ws.close();
      this.setState({ connected: false });
    };

    const character = JSON.parse(localStorage.getItem("character"));
    this.setState({ character });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const character = { name: this.state.form.name };
    localStorage.setItem("character", JSON.stringify(character));
    this.setState({ character });
  };

  handleChangeField = ({ currentTarget: input }) => {
    const form = { ...this.state.form };
    form[input.name] = input.value;
    this.setState({ form });
  };

  rollDice = (dice) => {
    this.ws.send(
      JSON.stringify({
        event: "rollDice",
        player: this.state.character.name,
        dice,
      })
    );
  };

  clearImages = () => {
    this.setState({ images: [] });
  };

  addImage = (image) => {
    const { images } = this.state;
    images.push(image);
    this.setState({ images });
    this.ws.send(JSON.stringify({ event: "setImages", images }));
  };

  render() {
    const { actions, character, images } = this.state;

    if (character) {
      return (
        <div className="container">
          <div className="mainPanel">
            <div className="board">
              <ImagesPanel
                addImage={this.addImage}
                clearImages={this.clearImages}
                images={images}
              ></ImagesPanel>
            </div>
            <div className="actionsLog">
              {actions.map((action, i) => (
                <div
                  key={i}
                >{`${action.player} rolled ${action.value} in a dice (d${action.dice})`}</div>
              ))}
            </div>
          </div>
          <div className="actions">
            {dices.map((dice) => (
              <button key={dice} onClick={() => this.rollDice(dice)}>
                d{dice}
              </button>
            ))}
            <button
              onClick={() => {
                localStorage.removeItem("character");
                this.setState({ character: null });
              }}
            >
              <i className="fa fa-user-o"></i>
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container">
          <div className="character">
            <form onSubmit={this.handleSubmit}>
              Nome do personagem
              <input
                autoFocus
                required
                maxlength="15"
                id="name"
                name="name"
                value={this.state.form.name}
                onChange={this.handleChangeField}
              />
              <br></br>
              <button>Jogar!</button>
            </form>
          </div>
        </div>
      );
    }
  }
}

export default Home;
