import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wordle_token') || null);
  const [isGuest, setIsGuest] = useState(localStorage.getItem('wordle_is_guest') === 'true');
  const [loading, setLoading] = useState(true);

  // Local guest stats in case offline or not logged in
  const [guestStats, setGuestStats] = useState(() => {
    const saved = localStorage.getItem('wordle_guest_stats');
    return saved ? JSON.parse(saved) : {
      score: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 }
    };
  });

  useEffect(() => {
    localStorage.setItem('wordle_guest_stats', JSON.stringify(guestStats));
  }, [guestStats]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authApi.getProfile();
          setUser(res.user);
          setIsGuest(false);
          localStorage.removeItem('wordle_is_guest');
        } catch (err) {
          console.warn('Could not verify token with server, entering guest mode:', err.message);
          setIsGuest(true);
        }
      } else {
        setIsGuest(true);
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem('wordle_token', data.token);
    localStorage.removeItem('wordle_is_guest');
    setToken(data.token);
    setUser(data.user);
    setIsGuest(false);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    localStorage.setItem('wordle_token', data.token);
    localStorage.removeItem('wordle_is_guest');
    setToken(data.token);
    setUser(data.user);
    setIsGuest(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('wordle_token');
    localStorage.setItem('wordle_is_guest', 'true');
    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  const playAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('wordle_is_guest', 'true');
  };

  const recordGuestGame = (won, numGuesses, scoreDelta = 0) => {
    setGuestStats(prev => {
      const gamesPlayed = prev.gamesPlayed + 1;
      const gamesWon = won ? prev.gamesWon + 1 : prev.gamesWon;
      const currentStreak = won ? prev.currentStreak + 1 : 0;
      const maxStreak = Math.max(prev.maxStreak, currentStreak);
      const score = Math.max(0, prev.score + scoreDelta);
      const winRate = Number(((gamesWon / gamesPlayed) * 100).toFixed(1));
      const guessDistribution = { ...prev.guessDistribution };
      if (won && numGuesses >= 1 && numGuesses <= 6) {
        guessDistribution[String(numGuesses)] = (guessDistribution[String(numGuesses)] || 0) + 1;
      }
      return {
        score,
        gamesPlayed,
        gamesWon,
        winRate,
        currentStreak,
        maxStreak,
        guessDistribution
      };
    });
  };

  const value = {
    user,
    token,
    isGuest,
    loading,
    guestStats,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    playAsGuest,
    recordGuestGame,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
