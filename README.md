# Strika Webrtc

A PeerJS WebRTC Client Side Code. 📹 🧘🏼‍♂️

**Credits:** Project boostrapped from this awesome example ✨ [Zoom-Clone-With-WebRTC](https://github.com/WebDevSimplified/Zoom-Clone-With-WebRTC)


## Setup

Install dependencies:
```bash
yarn start
```

## Running it

To work you need 2 running services: 
1. Run a WebRTC signalling server to help establish the Peer-to-peer connection (using peerjs).

```bash
yarn devSignal
```
2. Run the node express application to create web rooms on the browser.

```bash
yarn devStart
```


## Deployment in the cloud.

This example is deployed in the cloud with both services running in heroku. Give it a try 🦾: 

https://juanes.herokuapp.com/ 

Open several tabs with same url, or in your android mobile or share it with a friend!


![Working test](https://user-images.githubusercontent.com/7906289/113366568-9358a580-9327-11eb-98ee-4b414ef8b804.png)


