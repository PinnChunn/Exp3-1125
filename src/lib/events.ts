import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  updateDoc,
  serverTimestamp,
  DocumentData,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { logUserActivity } from './firebase';

export interface Instructor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  stats?: {
    courses: number;
    articles: number;
    students: number;
  };
  expertise: string[];
}

export interface Event {
  id?: string;
  title: string;
  date: string;
  time: string;
  format: string;
  location?: string;
  description: string;
  imageUrl: string;
  xp?: number;
  attendeeLimit: number;
  tags: string[];
  skills: string[];
  requirements: string[];
  instructor: Instructor;
  learningOutcomes?: string[];
  createdAt?: any;
  updatedAt?: any;
  registeredUsers?: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  meetingLink?: string;
  externalLink?: string;
  duration?: string;
  participants?: number;
}

const INITIAL_EVENTS: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "AI/UX Lecture",
    date: "December 8, 2024",
    time: "15:00 PM EST",
    format: "Virtual",
    description: "Join us for an intensive workshop that bridges the gap between AI technology and UX design. Learn how to leverage artificial intelligence to enhance user experiences, automate design workflows, and create more intelligent interfaces.",
    imageUrl: "/src/assets/AIUX活動封面.jpg",
    xp: 500,
    attendeeLimit: 200,
    tags: ["AI", "UX", "Design"],
    skills: ["AI Integration", "UX Research", "Interface Design", "Technical Implementation"],
    requirements: [
      "Basic understanding of UX design principles",
      "Familiarity with design tools (Figma, Sketch)",
      "No coding experience required"
    ],
    learningOutcomes: [
      "Understand AI's role in modern UX design",
      "Learn to integrate AI tools into design workflows",
      "Create AI-enhanced user interfaces",
      "Implement ethical AI design principles"
    ],
    instructor: {
      id: "instructor1",
      name: "温明輝",
      role: "UX Research & Design Expert",
      avatar: "/src/assets/speaker.jpg",
      bio: "40% 網路創業者 + 40 % 設計學院教授 + 20% UX 修行者與傳教士",
      stats: {
        courses: 12,
        articles: 45,
        students: 2800
      },
      expertise: [
        "AI/UX Integration",
        "Design Systems",
        "User Research",
        "Product Strategy"
      ]
    },
    meetingLink: "https://meet.google.com/bed-xapu-fve",
    status: "published",
    participants: 0
  },
  {
    title: "UX.3toryu Workshop",
    date: "September 2024",
    time: "Flexible",
    format: "Virtual",
    duration: "September 2024 - February 2025",
    description: "Learn how to design and develop Web3 applications with a focus on user experience. This workshop covers everything from token economics to smart contract integration from a UX perspective.",
    imageUrl: "/src/assets/3.jpg",
    xp: 500,
    attendeeLimit: 1000,
    participants: 970,
    tags: ["UX", "Web3", "Design"],
    skills: ["Web3 Design", "DApp UX", "Token Economics", "Smart Contract Integration"],
    requirements: [
      "Basic understanding of blockchain concepts",
      "Familiarity with Web3 wallets",
      "Basic JavaScript knowledge"
    ],
    instructor: {
      id: "instructor2",
      name: "Alex Chen",
      role: "Web3 UX Specialist",
      avatar: "/src/assets/speaker.jpg",
      bio: "Pioneering the intersection of Web3 and user experience design",
      expertise: [
        "Web3 UX",
        "DApp Design",
        "Token Economics",
        "Smart Contracts"
      ]
    },
    externalLink: "https://lu.ma/ux3",
    status: "published"
  }
];

export const clearEvents = async () => {
  try {
    const eventsQuery = query(collection(db, 'events'));
    const snapshot = await getDocs(eventsQuery);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return { error: null };
  } catch (error) {
    console.error('Error clearing events:', error);
    return { error: 'Failed to clear events' };
  }
};

export const setupInitialEvents = async () => {
  try {
    // Clear existing events first
    await clearEvents();
    
    // Add new events
    const batch = writeBatch(db);
    const eventsCollection = collection(db, 'events');
    
    for (const eventData of INITIAL_EVENTS) {
      const newEventRef = doc(eventsCollection);
      batch.set(newEventRef, {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        registeredUsers: []
      });
    }
    
    await batch.commit();
    return { error: null };
  } catch (error) {
    console.error('Error setting up initial events:', error);
    return { error: 'Failed to setup initial events' };
  }
};

export const getEvents = async (filters?: {
  status?: Event['status'];
  instructorId?: string;
  tags?: string[];
  userId?: string;
}) => {
  try {
    let eventsQuery = collection(db, 'events');

    if (filters) {
      if (filters.status) {
        eventsQuery = query(eventsQuery, where('status', '==', filters.status));
      }
      if (filters.instructorId) {
        eventsQuery = query(eventsQuery, where('instructor.id', '==', filters.instructorId));
      }
      if (filters.tags && filters.tags.length > 0) {
        eventsQuery = query(eventsQuery, where('tags', 'array-contains-any', filters.tags));
      }
    }

    const querySnapshot = await getDocs(eventsQuery);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isRegistered: filters?.userId ? 
        doc.data().registeredUsers?.includes(filters.userId) : 
        false
    }));

    return { events, error: null };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { events: [], error: 'Failed to fetch events' };
  }
};

export const getEvent = async (id: string, userId?: string) => {
  try {
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const eventData = docSnap.data();
      const isRegistered = userId ? 
        eventData.registeredUsers?.includes(userId) : 
        false;

      return { 
        event: { 
          id: docSnap.id, 
          ...eventData,
          isRegistered
        } as Event, 
        error: null 
      };
    } else {
      return { event: null, error: 'Event not found' };
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    return { event: null, error: 'Failed to fetch event' };
  }
};

export const registerForEvent = async (eventId: string, userId: string) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      return { error: 'Event not found' };
    }

    const event = eventDoc.data() as Event;
    const registeredUsers = event.registeredUsers || [];

    if (registeredUsers.includes(userId)) {
      return { error: 'Already registered for this event' };
    }

    if (registeredUsers.length >= event.attendeeLimit) {
      return { error: 'Event is full' };
    }

    const batch = writeBatch(db);
    batch.update(eventRef, {
      registeredUsers: arrayUnion(userId),
      updatedAt: serverTimestamp(),
      participants: (event.participants || 0) + 1
    });

    await batch.commit();
    return { error: null };
  } catch (error) {
    console.error('Error registering for event:', error);
    return { error: 'Failed to register for event' };
  }
};

export const isUserRegistered = async (eventId: string, userId: string) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      return { isRegistered: false, error: 'Event not found' };
    }

    const event = eventDoc.data() as Event;
    const isRegistered = event.registeredUsers?.includes(userId) || false;

    return { isRegistered, error: null };
  } catch (error) {
    console.error('Error checking registration status:', error);
    return { isRegistered: false, error: 'Failed to check registration status' };
  }
};