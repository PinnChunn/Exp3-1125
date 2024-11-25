import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { logUserActivity } from './firebase';

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  createdAt: number;
  lastLoginAt: number;
  xp: number;
  registeredEvents: string[];
  completedEvents: string[];
  skills: string[];
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
  metadata: {
    lastEventView?: string;
    lastEventRegistration?: string;
    totalEventsCompleted: number;
    totalXPEarned: number;
  };
}

export const createUserProfile = async (user: {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}) => {
  try {
    const userRef = doc(db, 'users', user.id);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUser: UserProfile = {
        ...user,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        xp: 0,
        registeredEvents: [],
        completedEvents: [],
        skills: [],
        preferences: {
          notifications: true,
          emailUpdates: true,
          language: 'en'
        },
        metadata: {
          totalEventsCompleted: 0,
          totalXPEarned: 0
        }
      };

      await setDoc(userRef, newUser);
      logUserActivity.memberRegister(user.id, {
        name: user.name,
        email: user.email
      });

      return { user: newUser, error: null };
    }

    // Update last login time and log activity
    const updatedData = {
      lastLoginAt: Date.now()
    };
    await updateDoc(userRef, updatedData);
    logUserActivity.memberLogin(user.id, 'google');

    return { user: userDoc.data() as UserProfile, error: null };
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return { user: null, error: 'Failed to create/update user profile' };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { user: null, error: 'User not found' };
    }

    return { user: userDoc.data() as UserProfile, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { user: null, error: 'Failed to fetch user profile' };
  }
};

export const updateUserXP = async (userId: string, xpAmount: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { error: 'User not found' };
    }

    const currentUser = userDoc.data() as UserProfile;
    const newXP = currentUser.xp + xpAmount;
    
    await updateDoc(userRef, {
      xp: newXP,
      'metadata.totalXPEarned': currentUser.metadata.totalXPEarned + xpAmount,
      updatedAt: serverTimestamp()
    });

    logUserActivity.userInteraction('xp_earned', {
      amount: xpAmount,
      new_total: newXP
    }, userId);

    return { error: null };
  } catch (error) {
    console.error('Error updating user XP:', error);
    return { error: 'Failed to update XP' };
  }
};

export const addEventToUser = async (userId: string, eventId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { error: 'User not found' };
    }

    await updateDoc(userRef, {
      registeredEvents: arrayUnion(eventId),
      'metadata.lastEventRegistration': eventId,
      updatedAt: serverTimestamp()
    });

    logUserActivity.userInteraction('event_registration', {
      event_id: eventId
    }, userId);

    return { error: null };
  } catch (error) {
    console.error('Error adding event to user:', error);
    return { error: 'Failed to add event to user' };
  }
};

export const removeEventFromUser = async (userId: string, eventId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      registeredEvents: arrayRemove(eventId),
      updatedAt: serverTimestamp()
    });

    logUserActivity.userInteraction('event_unregistration', {
      event_id: eventId
    }, userId);

    return { error: null };
  } catch (error) {
    console.error('Error removing event from user:', error);
    return { error: 'Failed to remove event from user' };
  }
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserProfile['preferences']>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences: preferences,
      updatedAt: serverTimestamp()
    });

    logUserActivity.memberUpdate(userId, Object.keys(preferences));

    return { error: null };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { error: 'Failed to update user preferences' };
  }
};

export const addUserSkill = async (userId: string, skill: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      skills: arrayUnion(skill),
      updatedAt: serverTimestamp()
    });

    logUserActivity.userInteraction('skill_added', {
      skill: skill
    }, userId);

    return { error: null };
  } catch (error) {
    console.error('Error adding user skill:', error);
    return { error: 'Failed to add user skill' };
  }
};