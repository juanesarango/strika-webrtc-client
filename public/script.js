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

    recordStream(stream)
  })
  videoGrid.append(video)
}

// Setup Recording Button
const record = document.querySelector('.record')
const stop = document.querySelector('.stop')
const mediaVids = document.querySelector('.media-vids')

function recordStream(stream) {
  const mediaRecorder = new MediaRecorder(stream)

  // On Start
  record.onclick = () => {
    mediaRecorder.start()
    console.log(mediaRecorder.state)
    console.log('recorder started')
    record.style.background = 'red'
    record.style.color = 'black'
  }

  // Grab Audio
  let chunks = []
  mediaRecorder.ondataavailable = function (e) {
    chunks.push(e.data)
  }

  // On Stop
  stop.onclick = function () {
    mediaRecorder.stop()
    console.log(mediaRecorder.state)
    console.log('recorder stopped')
    record.style.background = ''
    record.style.color = ''
  }

  // When finishes
  mediaRecorder.onstop = function (e) {
    console.log('recorder stopped')

    // const vidName = prompt('Enter a name for your Video vid')
    const vidName = `Recording #${mediaVids.childElementCount + 1}`

    const vidContainer = document.createElement('article')
    const vidLabel = document.createElement('p')
    const video = document.createElement('video')

    const deleteButton = document.createElement('button')
    const deleteButtonIcon = document.createElement('i')

    vidLabel.innerHTML = vidName
    vidLabel.classList.add('ui', 'header')

    deleteButton.innerHTML = 'Delete'
    deleteButton.classList.add('ui', 'labeled', 'icon', 'button')
    deleteButtonIcon.classList.add('trash', 'icon')
    deleteButton.appendChild(deleteButtonIcon)

    vidContainer.classList.add('vid')
    video.setAttribute('controls', '')

    vidContainer.appendChild(video)
    vidContainer.appendChild(vidLabel)
    vidContainer.appendChild(deleteButton)
    mediaVids.appendChild(vidContainer)

    const blob = new Blob(chunks, { type: 'video/webm; codecs="opus,vp8"' })
    chunks = []
    const videoUrl = window.URL.createObjectURL(blob)
    video.src = videoUrl

    // uploadToS3(blob)

    deleteButton.onclick = function (e) {
      let evtTgt = e.target
      evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode)
    }
  }
}

// const AccessKey = 'AKIA2SA3IWAMUTVMXCRS'
// const SecretKey = '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'
// const bucket = 'strika-data-points'

// uploadToS3 = (file) => {
//   const file = new File([blob], 'video-test.mp4')

//   AWS.config.update({
//     accessKeyId: AccessKey,
//     secretAccessKey: SecretKey,
//   })
//   AWS.config.region = 'us-east-1'

//   const bucket = new AWS.S3({ params: { Bucket: bucket } })

//   if (file) {
//     var uniqueFileName = file.name
//     var params = {
//       Key: `'videos-web'${file.name}`,
//       ContentType: file.type,
//       Body: file,
//       ServerSideEncryption: 'AES256',
//     }

//     bucket
//       .putObject(params, function (err, data) {
//         if (err) {
//           // There Was An Error With Your S3 Config
//           alert(err.message)
//           return false
//         } else {
//           // Success!
//           alert('Upload Done')
//         }
//       })
//       .on('httpUploadProgress', function (progress) {
//         // Log Progress Information
//         console.log(
//           Math.round((progress.loaded / progress.total) * 100) + '% done'
//         )
//       })
//   } else {
//     // No File Selected
//     alert('No File Selected')
//   }
// }
