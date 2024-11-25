import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { createUserProfile, getUserProfile } from './users';

// Authorized domains for Firebase Authentication
const AUTHORIZED_DOMAINS = [
  'stackblitz.io',
  'stackblitz.com',
  'bolt.new',
  'exp32024.web.app',
  'exp32024.firebaseapp.com',
  'exp3.org',
  'netlify.app',
  'localhost',
  'webcontainer.io'
];

export const handleAuthError = (error: any) => {
  console.error('Authentication error:', error);
  
  switch (error.code) {
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please allow popups or try again.';
    case 'auth/cancelled-popup-request':
      return 'Authentication was cancelled. Please try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for authentication. Please contact support.';
    case 'auth/popup-closed-by-user':
      return 'Authentication window was closed. Please try again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

export const signInWithGoogle = async () => {
  try {
    const domain = window.location.hostname;
    const isDomainAuthorized = AUTHORIZED_DOMAINS.some(authDomain => 
      domain.includes(authDomain) || domain === 'localhost'
    );

    if (!isDomainAuthorized) {
      console.error('Unauthorized domain:', domain);
      return { user: null, error: 'This domain is not authorized for authentication' };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const { user: userProfile, error: profileError } = await createUserProfile({
          id: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL
        });

        if (profileError) {
          throw new Error(profileError);
        }

        return { user: userProfile, error: null };
      }
    } catch (popupError: any) {
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/unauthorized-domain') {
        await signInWithRedirect(auth, googleProvider);
        return { user: null, error: null };
      }
      throw popupError;
    }
    
    return { user: null, error: 'No user data received' };
  } catch (error: any) {
    const errorMessage = handleAuthError(error);
    return { user: null, error: errorMessage };
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const { user: userProfile, error: profileError } = await createUserProfile({
        id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL
      });

      if (profileError) {
        throw new Error(profileError);
      }

      return { user: userProfile, error: null };
    }
    return { user: null, error: null };
  } catch (error: any) {
    const errorMessage = handleAuthError(error);
    return { user: null, error: errorMessage };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: 'Failed to sign out. Please try again.' };
  }
};

export const getCurrentUser = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (user) {
        const { user: userProfile } = await getUserProfile(user.uid);
        resolve(userProfile || {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL
        });
      } else {
        resolve(null);
      }
    });
  });
};