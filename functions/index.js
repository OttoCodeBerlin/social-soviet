const functions = require('firebase-functions')

const app = require('express')()

const FBauth = require('./utilities/fbauth')

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream
} = require('./handlers/screams')
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users')

//Scream routes
app.get('/screams', getAllScreams)
app.post('/scream', FBauth, postOneScream)
app.get('/scream/:screamId', getScream)
app.delete('/scream/:screamId', FBauth, deleteScream)
app.post('/scream/:screamId/comment', FBauth, commentOnScream)
app.get('/scream/:screamId/like', FBauth, likeScream)
app.get('/scream/:screamId/unlike', FBauth, unlikeScream)

//3:20:23

//User routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBauth, uploadImage)
app.post('/user', FBauth, addUserDetails)
app.get('/user', FBauth, getAuthenticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app)
