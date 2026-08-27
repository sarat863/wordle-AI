import axios from 'axios';

// Dynamically determine the backend API URL (supports local dev, custom env, and standard port 5001)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('wordle_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API services
export const authApi = {
  login: async (username, password) => {
    const res = await apiClient.post('/api/auth/login', { username, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post('/api/auth/register', userData);
    return res.data;
  },
  getProfile: async () => {
    const res = await apiClient.get('/api/auth/profile');
    return res.data;
  },
  getScore: async () => {
    const res = await apiClient.get('/api/auth/score');
    return res.data;
  }
};

// Game API services
export const gameApi = {
  startSession: async (options = {}) => {
    const res = await apiClient.post('/api/game/new', options);
    return res.data;
  },
  submitGuess: async (sessionId, guess) => {
    const res = await apiClient.post('/api/game/guess', { sessionId, guess });
    return res.data;
  },
  giveUp: async (sessionId) => {
    const res = await apiClient.post('/api/game/give-up', { sessionId });
    return res.data;
  },
  createCustomChallenge: async (word) => {
    const res = await apiClient.post('/api/game/custom/create', { word });
    return res.data;
  }
};

// Multi-Grid API (Dordle & Quordle)
export const multiGridApi = {
  startSession: async (mode = 'dordle') => {
    const res = await apiClient.post('/api/multigrid/new', { mode });
    return res.data;
  },
  submitGuess: async (sessionId, guess) => {
    const res = await apiClient.post('/api/multigrid/guess', { sessionId, guess });
    return res.data;
  }
};

// AI Game Review & Accuracy Analyzer
export const analyzerApi = {
  reviewGame: async (history, secretWord, sessionId = null) => {
    const res = await apiClient.post('/api/analyzer/review', { history, secretWord, sessionId });
    return res.data;
  }
};

// AI Battle Tournament Simulation
export const battleApi = {
  simulateBattle: async (secretWord = null) => {
    const res = await apiClient.post('/api/battle/simulate', { secretWord });
    return res.data;
  }
};

// Player XP & Achievements API
export const achievementApi = {
  getUserAchievements: async () => {
    const res = await apiClient.get('/api/achievements/user');
    return res.data;
  },
  listAllAchievements: async () => {
    const res = await apiClient.get('/api/achievements/list');
    return res.data;
  }
};

// AI Solver & Hints API
export const solverApi = {
  getRecommendations: async (history, wordLength = 5, limit = 5) => {
    const res = await apiClient.post('/api/solver/recommend', { history, wordLength, limit });
    return res.data;
  },
  getHints: async (sessionId, level = 1) => {
    const res = await apiClient.post('/api/solver/hints', { sessionId, level });
    return res.data;
  },
  analyzeWord: async (guess) => {
    const res = await apiClient.post('/api/solver/analyze', { guess });
    return res.data;
  }
};

// Stats & Leaderboard API
export const statsApi = {
  getUserStats: async () => {
    const res = await apiClient.get('/api/stats/user');
    return res.data;
  },
  getGlobalLeaderboard: async (limit = 20) => {
    const res = await apiClient.get('/api/leaderboard/global', { params: { limit } });
    return res.data;
  }
};

export default apiClient;
