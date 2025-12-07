// Database Integration Helper
// Manages both Firebase and Hostinger API

class DatabaseManager {
  constructor() {
    this.firebaseReady = false;
    this.apiUrl = 'https://yourdomain.com/studyshroom-api/api.php'; // Update this
    this.userId = null;
  }

  // Initialize database connections
  async initialize() {
    try {
      // Try Firebase first
      const { initializeFirebase } = await import('./firebase-config.js');
      this.userId = await initializeFirebase();
      this.firebaseReady = true;
      console.log('✓ Firebase initialized');
    } catch (error) {
      console.warn('Firebase not available:', error);
    }

    // Initialize anonymous user ID if needed
    if (!this.userId) {
      this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
      console.log('Using temporary user ID:', this.userId);
    }
  }

  // Save player data to both databases
  async savePlayer(playerState) {
    const promises = [];

    // Save to Firebase
    if (this.firebaseReady) {
      try {
        const { savePlayerData } = await import('./firebase-config.js');
        promises.push(savePlayerData(playerState));
      } catch (error) {
        console.error('Firebase save error:', error);
      }
    }

    // Save to Hostinger API
    try {
      promises.push(
        fetch(this.apiUrl + '/player', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: this.userId,
            playerData: playerState
          })
        })
      );
    } catch (error) {
      console.error('API save error:', error);
    }

    await Promise.all(promises).catch(err => console.error('Save error:', err));
  }

  // Load player data (try both sources)
  async loadPlayer() {
    // Try Firebase first
    if (this.firebaseReady) {
      try {
        const { loadPlayerData } = await import('./firebase-config.js');
        const data = await loadPlayerData();
        if (data) return data;
      } catch (error) {
        console.warn('Firebase load error:', error);
      }
    }

    // Fall back to Hostinger API
    try {
      const response = await fetch(
        this.apiUrl + '/player?userId=' + this.userId
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('API load error:', error);
    }

    return null;
  }

  // Record study session
  async recordSession(keypresses, duration) {
    const promises = [];

    // Record in Firebase
    if (this.firebaseReady) {
      try {
        const { recordStudySession } = await import('./firebase-config.js');
        promises.push(recordStudySession(keypresses, duration));
      } catch (error) {
        console.error('Firebase session error:', error);
      }
    }

    // Record in Hostinger API
    try {
      promises.push(
        fetch(this.apiUrl + '/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: this.userId,
            keypresses: keypresses,
            duration: duration
          })
        })
      );
    } catch (error) {
      console.error('API session error:', error);
    }

    await Promise.all(promises).catch(err => console.error('Session error:', err));
  }

  // Get leaderboard
  async getLeaderboard(limit = 10, sortBy = 'currency') {
    try {
      const response = await fetch(
        this.apiUrl + `/leaderboard?limit=${limit}&sortBy=${sortBy}`
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Leaderboard error:', error);
    }
    return [];
  }

  // Get player stats
  async getStats() {
    try {
      const response = await fetch(this.apiUrl + '/stats');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Stats error:', error);
    }
    return null;
  }

  // Get user sessions
  async getSessions(limit = 20) {
    try {
      const response = await fetch(
        this.apiUrl + `/session?userId=${this.userId}&limit=${limit}`
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Sessions error:', error);
    }
    return [];
  }
}

// Create global instance
window.db = new DatabaseManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await window.db.initialize();
  console.log('Database manager ready');
});

export default DatabaseManager;
