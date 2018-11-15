import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from "./components/Signin/Signin";
import Register from './components/Register/Register';  

import Particles from "react-particles-js";
import "./App.css";
import Clarifai from "clarifai";

const app = new Clarifai.App({
  apiKey: "43f32c723be5423e9f46750f62c6a02c"
});

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const intialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}
class App extends Component {
  constructor() {
    super();
    this.state = intialState;
  }

  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    };
  };

  displayFaceBox = box => {
    console.log(box);
    this.setState({ box: box });
  };
  onInputChange = event => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
          if (response) {
            fetch("https://shielded-badlands-47666.herokuapp.com/image",{
              method: 'put',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
              .then(response => response.json())
              .then( count => {
                this.setState(Object.assign(this.state.user, {entries:count}))
            })
            .catch(console.log)

          }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(intialState)
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({route});
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined 
      }
    })

  }
  render() {
    return (
      <div className="App">
        <Particles className="particles" params = {particlesOptions} />
        <Navigation isSignedIn = {this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        {this.state.route === "home" ? (
           <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition
              box={this.state.box}
              imageUrl={this.state.imageUrl}
            />
          </div>
        ) : ( 
          this.state.route ==='signin'
        ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        :<Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
        )
      }
      </div>
    );
  }
}

export default App;
 