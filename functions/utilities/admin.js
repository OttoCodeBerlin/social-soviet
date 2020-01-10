const admin = require('firebase-admin')

//serve
admin.initializeApp({ credential: admin.credential.cert(require('../../keys/admin.json')) })

//deploy
//admin.initializeApp()

const db = admin.firestore()

module.exports = { admin, db }
