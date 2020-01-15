const functions = require('firebase-functions')

const app = require('express')()

const FBauth = require('./utilities/fbauth')

const { getAllScreams, postOneScream, getScream, commentOnScream } = require('./handlers/screams')
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users')

//Scream routes
app.get('/screams', getAllScreams)
app.post('/scream', FBauth, postOneScream)
app.get('/scream/:screamId', getScream)
app.post('/scream/:screamId/comment', FBauth, commentOnScream)

//Todo: delete scream, like scream, unlike scream, comment on scream

//User routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBauth, uploadImage)
app.post('/user', FBauth, addUserDetails)
app.get('/user', FBauth, getAuthenticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app)
