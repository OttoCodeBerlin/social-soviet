const functions = require('firebase-functions')
const admin = require('firebase-admin')
require('dotenv').config()

//serve
admin.initializeApp({ credential: admin.credential.cert(require('../keys/admin.json')) })

//deploy
//admin.initializeApp()

const config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
}

const app = require('express')()

const firebase = require('firebase')
firebase.initializeApp(config)

const db = admin.firestore()

app.get('/screams', (req, res) => {
  db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let screams = []
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        })
      })
      return res.json(screams)
    })
    .catch(err => console.error(err))
})

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  }

  db.collection('screams')
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created successfully` })
    })
    .catch(err => {
      res.status(500).json({ error: 'Some Shit went wrong' })
      console.error(err)
    })
})

const isEmail = email => {
  var regexp = /\S+@\S+\.\S+/
  return regexp.test(String(email).toLowerCase())
}

const isEmpty = string => {
  string.trim() === '' ? true : false
}

app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  let errors = {}

  if (isEmpty(newUser.email)) {
    errors.email = 'Field must not be empty.'
  } else if (!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address.'
  }

  if (isEmpty(newUser.password)) errors.password = 'Field must not be empty.'
  if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match.'
  if (isEmpty(newUser.handle)) errors.handle = 'Field must not be empty.'

  if (Object.keys(errors).length > 0) return res.status(400).json(errors)

  let token, userId
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'This handle already exists.' })
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      userId = data.user.uid
      return data.user.getIdToken()
    })
    .then(idToken => {
      token = idToken
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      }
      return db.doc(`/users/${newUser.handle}`).set(userCredentials)
    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already registered.' })
      } else {
        return res.status(500).json({ error: err.code })
      }
    })
})

app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }
  let errors = {}

  if (isEmpty(user.email)) errors.email = 'Field must not be empty.'
  if (isEmpty(user.password)) errors.password = 'Field must not be empty.'

  if (Object.keys(errors).length > 0) return res.status(400).json(errors)

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken()
    })
    .then(token => {
      return res.json({ token })
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({ general: 'Wrong credentials, please try again' })
      } else {
        return res.status(500).json({ error: err.code })
      }
    })
})

exports.api = functions.region('europe-west1').https.onRequest(app)
