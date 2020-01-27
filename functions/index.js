const functions = require('firebase-functions')

const app = require('express')()

const FBauth = require('./utilities/fbauth')

const { db } = require('./utilities/admin')

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

//3:42:04

//User routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBauth, uploadImage)
app.post('/user', FBauth, addUserDetails)
app.get('/user', FBauth, getAuthenticatedUser)

exports.api = functions.region('europe-west1').https.onRequest(app)

exports.createNotificationOnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          })
        }
      })
      .then(() => {
        return
      })
      .catch(err => {
        console.error(err)
        return
      })
  })

exports.deleteNotificationOnUnlike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onDelete(snapshot => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return
      })
      .catch(err => {
        console.error(err)
        return
      })
  })

exports.createNotificationOnComment = functions
  .region('europe-west1')
  .firestore.document('comments/{id}')
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          })
        }
      })
      .then(() => {
        return
      })
      .catch(err => {
        console.error(err)
        return
      })
  })
