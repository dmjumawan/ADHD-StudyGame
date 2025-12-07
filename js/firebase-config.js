// Firebase Configuration
// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "studyshroom.firebaseapp.com",
  projectId: "studyshroom",
  storageBucket: "studyshroom.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  databaseURL: "https://studyshroom-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Current user ID
let currentUserId = null;

// Initialize auth and get user
export function initializeFirebase() {
  return new Promise((resolve) => {
    signInAnonymously(auth).then(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUserId = user.uid;
          console.log("Firebase initialized with user:", currentUserId);
          resolve(currentUserId);
        }
      });
    }).catch((error) => {
      console.error("Firebase auth error:", error);
    });
  });
}

// Save player data to Firebase
export function savePlayerData(playerState) {
  if (!currentUserId) return;
  
  const userRef = ref(database, 'players/' + currentUserId);
  const timestamp = new Date().toISOString();
  
  set(userRef, {
    name: playerState.name,
    currency: playerState.currency,
    characterId: playerState.characterId,
    items: playerState.items,
    totalMinutesStudied: playerState.totalMinutesStudied,
    completedSessions: playerState.completedSessions,
    petType: playerState.petType,
    petHunger: playerState.petHunger,
    petFood: playerState.petFood,
    lastUpdated: timestamp
  }).catch((error) => {
    console.error("Error saving player data:", error);
  });
}

// Load player data from Firebase
export function loadPlayerData() {
  if (!currentUserId) return null;
  
  return new Promise((resolve) => {
    const userRef = ref(database, 'players/' + currentUserId);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        resolve(snapshot.val());
      } else {
        resolve(null);
      }
    }).catch((error) => {
      console.error("Error loading player data:", error);
      resolve(null);
    });
  });
}

// Save study session
export function recordStudySession(keypresses, duration) {
  if (!currentUserId) return;
  
  const sessionRef = ref(database, 'sessions/' + currentUserId + '/' + Date.now());
  const timestamp = new Date().toISOString();
  
  set(sessionRef, {
    keypresses: keypresses,
    duration: duration,
    timestamp: timestamp,
    mushroomsEarned: keypresses
  }).catch((error) => {
    console.error("Error recording session:", error);
  });
}

// Get leaderboard data
export function getLeaderboard(limit = 10) {
  return new Promise((resolve) => {
    const leaderboardRef = ref(database, 'players');
    get(leaderboardRef).then((snapshot) => {
      if (snapshot.exists()) {
        const players = snapshot.val();
        const leaderboard = Object.entries(players)
          .map(([id, data]) => ({
            id,
            ...data
          }))
          .sort((a, b) => b.currency - a.currency)
          .slice(0, limit);
        resolve(leaderboard);
      } else {
        resolve([]);
      }
    }).catch((error) => {
      console.error("Error fetching leaderboard:", error);
      resolve([]);
    });
  });
}

export { currentUserId, auth, database };
