import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC16ekl_0eR4RarphTPMXt64bHQZrgrWkk",
  authDomain: "exp32024.firebaseapp.com",
  projectId: "exp32024",
  storageBucket: "exp32024.firebasestorage.app",
  messagingSenderId: "581668076921",
  appId: "1:581668076921:web:9b08c9b3f64ef43a3083a8",
  measurementId: "G-NNQ94XM1CT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Analytics helper functions
export const logUserActivity = {
  memberLogin: (userId: string, method: string) => {
    logEvent(analytics, 'member_login', {
      user_id: userId,
      login_method: method,
      timestamp: new Date().toISOString()
    });
  },
  
  memberRegister: (userId: string, userDetails: any) => {
    logEvent(analytics, 'member_register', {
      user_id: userId,
      registration_date: new Date().toISOString(),
      user_details: userDetails
    });
  },

  memberUpdate: (userId: string, updatedFields: string[]) => {
    logEvent(analytics, 'member_update', {
      user_id: userId,
      updated_fields: updatedFields,
      timestamp: new Date().toISOString()
    });
  },

  viewEvent: (eventId: string, eventTitle: string, userId?: string) => {
    logEvent(analytics, 'view_event', {
      event_id: eventId,
      event_title: eventTitle,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  },

  registerEvent: (eventId: string, userId: string, eventDetails: any) => {
    logEvent(analytics, 'register_event', {
      event_id: eventId,
      user_id: userId,
      event_details: eventDetails,
      registration_date: new Date().toISOString()
    });
  },

  completeEvent: (eventId: string, userId: string, completionDetails: any) => {
    logEvent(analytics, 'complete_event', {
      event_id: eventId,
      user_id: userId,
      completion_details: completionDetails,
      completion_date: new Date().toISOString()
    });
  },

  shareEvent: (eventId: string, shareMethod: string, userId?: string) => {
    logEvent(analytics, 'share_event', {
      event_id: eventId,
      share_method: shareMethod,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  },

  pageView: (pageName: string, userId?: string) => {
    logEvent(analytics, 'page_view', {
      page_name: pageName,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  },

  userInteraction: (interactionType: string, details: any, userId?: string) => {
    logEvent(analytics, 'user_interaction', {
      interaction_type: interactionType,
      details: details,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }
};