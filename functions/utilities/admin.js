const admin = require('firebase-admin')

//serve
admin.initializeApp({
  credential: admin.credential.cert(require('../../keys/admin.json')),
  storageBucket: 'social-soviet.appspot.com'
})

//deploy
// admin.initializeApp()

const db = admin.firestore()

module.exports = { admin, db }
