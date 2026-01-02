import { initializeApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

let app: any = null
let auth: Auth | null = null
let db: Firestore | null = null

export function initializeFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  }
  return { app, auth, db }
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const { auth: newAuth } = initializeFirebase()
    return newAuth!
  }
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    const { db: newDb } = initializeFirebase()
    return newDb!
  }
  return db
}
