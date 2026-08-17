import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  auth, 
  db,
  googleProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Helper to sync/save user data to Firestore `users` collection/table
  const syncUserToFirestore = async (user, additionalData = {}) => {
    if (!user || !user.uid || !db) return
    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnapshot = await getDoc(userRef)

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: additionalData.displayName || user.displayName || user.email?.split('@')[0] || 'Researcher',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
        role: 'researcher',
        lastLoginAt: serverTimestamp(),
        ...additionalData
      }

      if (!userSnapshot.exists()) {
        userData.createdAt = serverTimestamp()
      }

      await setDoc(userRef, userData, { merge: true })
      return userData
    } catch (err) {
      console.warn('Firestore user table sync notice:', err.message)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch or create Firestore user profile if db is available
        try {
          if (db) {
            const userRef = doc(db, 'users', user.uid)
            const userSnap = await getDoc(userRef)
            const profileData = userSnap.exists() ? userSnap.data() : {}

            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: profileData.displayName || user.displayName || user.email.split('@')[0],
              photoURL: profileData.photoURL || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
              role: profileData.role || 'researcher',
              isAnonymous: user.isAnonymous
            })
          } else {
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
              role: 'researcher',
              isAnonymous: user.isAnonymous
            })
          }
        } catch (e) {
          // Fallback to basic auth object
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            role: 'researcher',
            isAnonymous: user.isAnonymous
          })
        }
      } else {
        // Check if demo user is stored in localStorage
        const savedDemo = localStorage.getItem('DEMO_USER')
        if (savedDemo) {
          try {
            setCurrentUser(JSON.parse(savedDemo))
          } catch (e) {
            setCurrentUser(null)
          }
        } else {
          setCurrentUser(null)
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Register with Email & Password + Store in Firestore 'users' collection
  const registerUser = async (email, password, fullName) => {
    try {
      setAuthError(null)
      const res = await createUserWithEmailAndPassword(auth, email, password)
      
      if (fullName && res.user) {
        await updateProfile(res.user, {
          displayName: fullName
        })
      }

      // Save user record in Firestore `users` table
      await syncUserToFirestore(res.user, {
        displayName: fullName,
        registeredVia: 'email_password'
      })

      return res.user
    } catch (err) {
      console.error('Registration error:', err)
      let msg = err.message
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.'
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.'
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.'
      setAuthError(msg)
      throw new Error(msg)
    }
  }

  // Login with Email & Password + Update last login in Firestore
  const loginUser = async (email, password) => {
    try {
      setAuthError(null)
      const res = await signInWithEmailAndPassword(auth, email, password)
      
      // Update lastLogin in Firestore
      await syncUserToFirestore(res.user, {
        lastLoginAt: serverTimestamp()
      })

      return res.user
    } catch (err) {
      console.error('Login error:', err)
      let msg = err.message
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.'
      }
      setAuthError(msg)
      throw new Error(msg)
    }
  }

  // Login with Google + Auto-create in Firestore
  const loginWithGoogle = async () => {
    try {
      setAuthError(null)
      const res = await signInWithPopup(auth, googleProvider)
      
      // Store/Update user document in Firestore `users` table
      await syncUserToFirestore(res.user, {
        registeredVia: 'google_oauth'
      })

      return res.user
    } catch (err) {
      console.error('Google Sign-in error:', err)
      setAuthError(err.message)
      throw err
    }
  }

  // Guest / Instant Demo Login
  const loginAsGuest = () => {
    const demoUser = {
      uid: 'guest_' + Date.now(),
      email: 'researcher@university.edu',
      displayName: 'Guest Researcher',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      role: 'guest',
      isGuest: true
    }
    localStorage.setItem('DEMO_USER', JSON.stringify(demoUser))
    setCurrentUser(demoUser)
    setAuthError(null)
  }

  // Logout
  const logoutUser = async () => {
    try {
      localStorage.removeItem('DEMO_USER')
      await signOut(auth)
      setCurrentUser(null)
    } catch (err) {
      console.error('Sign-out error:', err)
    }
  }

  const value = {
    currentUser,
    loading,
    authError,
    setAuthError,
    registerUser,
    loginUser,
    loginWithGoogle,
    loginAsGuest,
    logoutUser
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
