/*
To run, open 2 terminals:

In the first, run:
npm run devStart

In the Second terminal, run: from https://github.com/peers/peerjs-server
peerjs --port 9000 --key peerjs --path /myapp
*/

// Setup PeerJs connection

const socket = io('/')
const myPeer = new Peer(undefined, {
  host: 'vast-sands-06033.herokuapp.com',
  port: 443,
  secure: true,
  path: '/',
})

// const myPeer = new Peer(undefined, {
//   host: '/',
//   port: 9000,
// })

// Setup video grid

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', (call) => {
      console.log('Call Event Triggered')
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
      })
    })

    socket.on('user-connected', (userId) => {
      setTimeout(() => {
        // user is joining
        connectToNewUser(userId, stream)
        console.log('New user connected: ' + userId)
      }, 3000)
    })
  })

socket.on('user-disconnected', (userId) => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id)
  console.log('Open Event Triggered')
})

// Utils

function connectToNewUser(userId, stream) {
  console.log('Connect to New User')
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', (userVideoStream) => {
    console.log('Add Video Stream')
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
  console.log(peers)
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}
