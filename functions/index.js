const functions = require('firebase-functions')

const app = require('express')()

const FBauth = require('./utilities/fbauth')

const { getAllScreams, postOneScream } = require('./handlers/screams')
const { signup, login, uploadImage, addUserDetails } = require('./handlers/users')

//Scream routes
app.get('/screams', getAllScreams)
app.post('/scream', FBauth, postOneScream)

//User routes
app.post('/signup', signup)
app.post('/login', login)

app.post('/user/image', FBauth, uploadImage)
app.post('/user', FBauth, addUserDetails)

exports.api = functions.region('europe-west1').https.onRequest(app)
