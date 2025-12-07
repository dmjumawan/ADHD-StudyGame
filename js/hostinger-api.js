/**
 * Hostinger API Manager
 * Simple direct API communication for ADHD Study Game
 * Replaces both Firebase and db-manager with pure Hostinger backend
 */

class HostingerAPI {
    constructor(apiUrl = 'https://minikobo.com/studyshroom-api/api.php') {
        // UPDATE THIS with your actual Hostinger domain
        this.apiUrl = apiUrl;
        this.userId = this.getOrCreateUserId();

        // Keys for offline queue and cached player
        this.queueKey = 'studyshroom_queue_v1';
        this.playerCacheKey = 'studyshroom_player_cache_v1';

        // When the browser comes back online, try to flush queued data
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('Network: online - flushing queued data');
                this.flushQueue();
                this.flushPlayerCache();
            });
        }
    }

    /**
     * Generate or retrieve a unique user ID
     */
    getOrCreateUserId() {
        let userId = localStorage.getItem('studyshroom_userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('studyshroom_userId', userId);
        }
        return userId;
    }

    /**
     * Make API request
     */
    async request(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            // Use PATH_INFO style routing: /api.php/endpoint
            const url = `${this.apiUrl}/${endpoint}`;
            const response = await fetch(url, options);
            
            if (!response.ok) {
                console.error(`API Error: ${response.status}`);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request Error: ${error.message}`);
            return null;
        }
    }

    /**
     * Save player data to database
     */
    async savePlayer(playerState) {
        console.log('Saving player to Hostinger (or cache if offline):', playerState);

        const payload = {
            name: playerState.name || 'Player',
            currency: playerState.currency || 0,
            characterId: playerState.characterId || 'girl1',
            items: playerState.items || [],
            totalMinutesStudied: playerState.totalMinutesStudied || 0,
            completedSessions: playerState.completedSessions || 0,
            petType: playerState.petType || null,
            petHunger: playerState.petHunger || 0,
            petFood: playerState.petFood || 0
        };

        // If offline, cache locally and return success (will flush later)
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            try {
                localStorage.setItem(this.playerCacheKey, JSON.stringify(payload));
                console.log('📥 Offline: player data cached locally');
                return true;
            } catch (e) {
                console.error('Failed to cache player locally:', e.message);
                return false;
            }
        }

        const response = await this.request('player', 'POST', {
            userId: this.userId,
            playerData: payload
        });

        if (response?.success) {
            // remove any cached player copy
            try { localStorage.removeItem(this.playerCacheKey); } catch (e) {}
            console.log('✅ Player saved successfully');
            return true;
        } else {
            console.warn('❌ Failed to save player online, caching locally instead');
            try { localStorage.setItem(this.playerCacheKey, JSON.stringify(payload)); } catch (e) {}
            return true; // return true because data is preserved locally
        }
    }

    /**
     * Load player data from database
     */
    async loadPlayer() {
        console.log('Loading player from Hostinger...');
        
        // If offline, try to return cached player copy
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            try {
                const cached = localStorage.getItem(this.playerCacheKey);
                if (cached) {
                    console.log('📥 Loaded player from local cache (offline)');
                    return JSON.parse(cached);
                }
            } catch (e) {
                console.error('Failed to read player cache:', e.message);
            }
            return null;
        }

        try {
            const url = `${this.apiUrl}/player?userId=${this.userId}`;
            const response = await fetch(url, { method: 'GET' });

            if (response.status === 404) {
                console.log('ℹ️ No existing player found - creating new');
                return null;
            }

            if (!response.ok) {
                console.error(`API Error: ${response.status}`);
                // Fall back to cached player if available
                const cached = localStorage.getItem(this.playerCacheKey);
                if (cached) return JSON.parse(cached);
                return null;
            }

            const playerData = await response.json();
            console.log('✅ Player loaded successfully');
            return playerData;
        } catch (error) {
            console.error(`API Request Error: ${error.message}`);
            // Fall back to cached player if available
            try { const cached = localStorage.getItem(this.playerCacheKey); if (cached) return JSON.parse(cached); } catch (e) {}
            return null;
        }
    }

    /**
     * Record a study session
     */
    async recordSession(keypresses, durationSeconds) {
        console.log(`Recording session: ${keypresses} keypresses, ${durationSeconds}s`);
        
        // Calculate mushrooms: 1 keypress = 1 mushroom
        const mushroomsEarned = keypresses;
        
        const payload = {
            userId: this.userId,
            keypresses: keypresses,
            duration: durationSeconds,
            mushrooms_earned: mushroomsEarned,
            created_at: new Date().toISOString()
        };

        // If offline, enqueue and return mushrooms immediately
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            this.enqueueSession(payload);
            console.log('📥 Offline: session queued locally');
            return mushroomsEarned;
        }

        const response = await this.request('session', 'POST', payload);

        if (response?.success) {
            console.log(`✅ Session recorded: ${mushroomsEarned} mushrooms earned`);
            return mushroomsEarned;
        } else {
            console.warn('❌ Failed to record session online - queuing locally');
            this.enqueueSession(payload);
            return mushroomsEarned; // still credit the player locally
        }
    }

    /**
     * Get global leaderboard
     */
    async getLeaderboard(limit = 10) {
        console.log('Fetching leaderboard...');
        
        try {
            const url = `${this.apiUrl}/leaderboard?limit=${limit}`;
            const response = await fetch(url, { method: 'GET' });
            
            if (!response.ok) {
                console.error(`API Error: ${response.status}`);
                return [];
            }
            
            const leaderboard = await response.json();
            console.log(`✅ Leaderboard loaded: ${leaderboard.length} players`);
            return leaderboard;
        } catch (error) {
            console.error(`API Request Error: ${error.message}`);
            return [];
        }
    }

    /**
     * Get global statistics
     */
    async getStats() {
        console.log('Fetching global stats...');
        
        try {
            const url = `${this.apiUrl}/stats`;
            const response = await fetch(url, { method: 'GET' });
            
            if (!response.ok) {
                console.error(`API Error: ${response.status}`);
                return null;
            }
            
            const stats = await response.json();
            console.log('✅ Stats loaded');
            return stats;
        } catch (error) {
            console.error(`API Request Error: ${error.message}`);
            return null;
        }
    }

    /**
     * Get user's session history
     */
    async getSessions(limit = 10) {
        console.log('Fetching session history...');
        
        try {
            const url = `${this.apiUrl}/session?userId=${this.userId}&limit=${limit}`;
            const response = await fetch(url, { method: 'GET' });
            
            if (!response.ok) {
                console.error(`API Error: ${response.status}`);
                return [];
            }
            
            const sessions = await response.json();
            console.log(`✅ Sessions loaded: ${sessions.length} sessions`);
            return sessions;
        } catch (error) {
            console.error(`API Request Error: ${error.message}`);
            return [];
        }
    }

    /**
     * Check if API is accessible
     */
    async testConnection() {
        console.log('Testing API connection...');
        const stats = await this.getStats();
        if (stats) {
            console.log('✅ API connection successful!');
            console.log('Total players:', stats.total_players || 0);
            return true;
        } else {
            console.error('❌ API connection failed - check console errors');
            return false;
        }
    }

    /**
     * Enqueue a session to localStorage for later flushing
     */
    enqueueSession(sessionObj) {
        try {
            const raw = localStorage.getItem(this.queueKey);
            const queue = raw ? JSON.parse(raw) : [];
            queue.push(sessionObj);
            localStorage.setItem(this.queueKey, JSON.stringify(queue));
            console.log(`Queued session locally (queue length: ${queue.length})`);
        } catch (e) {
            console.error('Failed to enqueue session:', e.message);
        }
    }

    /**
     * Flush queued sessions to the server. Leaves any failed items in the queue.
     */
    async flushQueue() {
        try {
            const raw = localStorage.getItem(this.queueKey);
            if (!raw) return;
            let queue = JSON.parse(raw);
            if (!Array.isArray(queue) || queue.length === 0) return;

            console.log(`Flushing ${queue.length} queued sessions...`);

            const remaining = [];
            for (const item of queue) {
                try {
                    const res = await this.request('session', 'POST', item);
                    if (res?.success) {
                        console.log('Flushed queued session successfully');
                    } else {
                        console.warn('Failed to flush one queued session, keeping for later');
                        remaining.push(item);
                    }
                } catch (e) {
                    console.error('Error flushing queued session:', e.message);
                    remaining.push(item);
                }
            }

            if (remaining.length > 0) {
                localStorage.setItem(this.queueKey, JSON.stringify(remaining));
                console.log(`Remaining queued sessions: ${remaining.length}`);
            } else {
                localStorage.removeItem(this.queueKey);
                console.log('All queued sessions flushed');
            }
        } catch (e) {
            console.error('Failed to flush queue:', e.message);
        }
    }

    /**
     * Flush cached player data (if any) to server
     */
    async flushPlayerCache() {
        try {
            const raw = localStorage.getItem(this.playerCacheKey);
            if (!raw) return;
            const playerData = JSON.parse(raw);
            console.log('Flushing cached player data to server...');
            const res = await this.request('player', 'POST', { userId: this.userId, playerData });
            if (res?.success) {
                localStorage.removeItem(this.playerCacheKey);
                console.log('Flushed cached player data successfully');
            } else {
                console.warn('Failed to flush cached player data; will retry later');
            }
        } catch (e) {
            console.error('Failed to flush player cache:', e.message);
        }
    }
}
