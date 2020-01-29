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

const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require('./handlers/users')

//Scream routes
app.get('/screams', getAllScreams)
app.post('/scream', FBauth, postOneScream)
app.get('/scream/:screamId', getScream)
app.delete('/scream/:screamId', FBauth, deleteScream)
app.post('/scream/:screamId/comment', FBauth, commentOnScream)
app.get('/scream/:screamId/like', FBauth, likeScream)
app.get('/scream/:screamId/unlike', FBauth, unlikeScream)

//3:51:25

//User routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBauth, uploadImage)
app.post('/user', FBauth, addUserDetails)
app.get('/user', FBauth, getAuthenticatedUser)
app.get('/user/:handle', getUserDetails)
app.post('/notifications', FBauth, markNotificationsRead)

exports.api = functions.region('europe-west1').https.onRequest(app)

exports.createNotificationOnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
      .catch(err => console.error(err))
  })

exports.deleteNotificationOnUnlike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => console.error(err))
  })

exports.createNotificationOnComment = functions
  .region('europe-west1')
  .firestore.document('comments/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
      .catch(err => console.error(err))
  })

exports.onUserImageChange = functions
  .region('europe-west1')
  .firestore.document('/users/{userId}')
  .onUpdate(change => {
    console.log(change.before.data())
    console.log(change.before.data())
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('Image changed')
      let batch = db.batch()
      return db
        .collection('screams')
        .where('userHandle', '==', change.before.data().handle)
        .get()

        .then(data => {
          data.forEach(doc => {
            const scream = db.doc(`/screams/${doc.id}`)
            batch.update(scream, { userImage: change.after.data().imageUrl })
          })
          return batch.commit()
        })
    }
  })

exports.onScreamDelete = functions
  .region('europe-west1')
  .firestore.document('/screams/{screamId}')
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId
    const batch = db.batch()
    return db
      .collection('comments')
      .where('screamId', '==', screamId)
      .get()

      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`))
        })
        return db.collection('likes').where('screamId', '==', screamId)
      })

      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`))
        })
        return db.collection('notifications').where('screamId', '==', screamId)
      })

      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`))
        })
        return batch.commit()
       })
       .catch(err=> console.error(err))
  })
