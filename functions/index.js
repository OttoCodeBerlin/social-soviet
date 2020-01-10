const functions = require('firebase-functions')

// require('dotenv').config()

// const config = {
//   apiKey: process.env.apiKey,
//   authDomain: process.env.authDomain,
//   databaseURL: process.env.databaseURL,
//   projectId: process.env.projectId,
//   storageBucket: process.env.storageBucket,
//   messagingSenderId: process.env.messagingSenderId,
//   appId: process.env.appId,
//   measurementId: process.env.measurementId
// }

const app = require('express')()

const FBauth = require('./utilities/fbauth')

const { getAllScreams, postOneScream } = require('./handlers/screams')
const { signup, login } = require('./handlers/users')

// const firebase = require('firebase')
// firebase.initializeApp(config)

//Scream routes
app.get('/screams', getAllScreams)
app.post('/scream', FBauth, postOneScream)

//User routes
app.post('/signup', signup)
app.post('/login', login)

exports.api = functions.region('europe-west1').https.onRequest(app)
