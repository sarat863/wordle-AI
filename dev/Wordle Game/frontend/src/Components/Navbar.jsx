import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';
import { 
  Sparkles, 
  HelpCircle, 
  BarChart2, 
  Trophy, 
  Settings, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  LogIn, 
  ChevronDown,
  Flame,
  Award,
  Swords,
  BookOpen
} from 'lucide-react';

function Navbar({ 
  gameMode, 
  setGameMode, 
  onOpenHints, 
  onOpenStats, 
  onOpenLeaderboard, 
  onOpenHowToPlay, 
  onOpenSettings,
  onOpenAchievements,
  onOpenBattle,
  onOpenDictionary,
  score = 0
}) {
  const { user, isGuest, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { soundEnabled, toggleSound, playKeypress } = useSound();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const modes = [
    { id: 'practice', name: 'Practice (5 Letters)', icon: '♾️' },
    { id: 'daily', name: 'Daily Challenge', icon: '📅' },
    { id: 'dordle', name: 'Dordle (2 Boards)', icon: '👥' },
    { id: 'quordle', name: 'Quordle (4 Boards)', icon: '👑' },
    { id: 'speed', name: 'Speed Run (3 Min)', icon: '⚡' },
    { id: 'length_4', name: '4-Letter Mini', icon: '4️⃣' },
    { id: 'length_6', name: '6-Letter Master', icon: '6️⃣' },
    { id: 'custom', name: 'Friend Challenge', icon: '🔗' }
  ];

  const currentModeObj = modes.find(m => m.id === gameMode) || modes[0];

  const handleModeSelect = (modeId) => {
    playKeypress();
    setGameMode(modeId);
    setDropdownOpen(false);
  };

  return (
    <header className="w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 transition-colors light:bg-white/90 light:border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand & Mode Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/game')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 via-emerald-500 to-teal-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-emerald-500/20">
              W
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-xl tracking-tight text-white light:text-slate-900">
                Wordle<span className="text-emerald-400 font-bold ml-1 text-sm bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">AI</span>
              </span>
            </div>
          </div>

          {/* Mode Dropdown */}
          <div className="relative">
            <button
              onClick={() => { playKeypress(); setDropdownOpen(!dropdownOpen); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200 transition shadow-sm"
            >
              <span>{currentModeObj.icon}</span>
              <span className="hidden md:inline">{currentModeObj.name}</span>
              <span className="md:hidden">{currentModeObj.name.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 light:bg-white light:border-slate-200">
                {modes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs sm:text-sm font-medium transition ${
                      gameMode === mode.id
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold light:bg-emerald-50 light:text-emerald-700'
                        : 'text-slate-300 hover:bg-slate-700/50 light:text-slate-700 light:hover:bg-slate-100'
                    }`}
                  >
                    <span>{mode.icon}</span>
                    <span>{mode.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: AI Solver Quick Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { playKeypress(); onOpenHints(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Solver</span>
            <span className="sm:hidden">AI</span>
          </button>

          <button
            onClick={() => { playKeypress(); onOpenBattle(); }}
            title="AI Bot Battle Arena"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-500/40 shadow-sm transition"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Bot Arena</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* User Score Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs font-bold text-amber-400 light:bg-slate-100 light:text-amber-700">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{score} pts</span>
          </div>

          {/* Achievements / XP */}
          <button
            onClick={() => { playKeypress(); onOpenAchievements(); }}
            title="Achievements & XP Level"
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 light:text-slate-600 light:hover:bg-slate-100 transition"
          >
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dictionary Lookup */}
          <button
            onClick={() => { playKeypress(); onOpenDictionary(); }}
            title="Vocabulary Dictionary"
            className="p-2 rounded-xl text-slate-400 hover:text-teal-400 hover:bg-slate-800 light:text-slate-600 light:hover:bg-slate-100 transition"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Stats Button */}
          <button
            onClick={() => { playKeypress(); onOpenStats(); }}
            title="Statistics"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 light:text-slate-600 light:hover:bg-slate-100 transition"
          >
            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => { playKeypress(); onOpenLeaderboard(); }}
            title="Leaderboard"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 light:text-slate-600 light:hover:bg-slate-100 transition"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 light:text-slate-600 light:hover:bg-slate-100 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Light/Dark Theme"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 light:text-slate-600 light:hover:bg-slate-100 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => { playKeypress(); onOpenSettings(); }}
            title="Settings"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 light:text-slate-600 light:hover:bg-slate-100 transition"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Auth Profile / Logout */}
          {user ? (
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title={`Logged in as ${user.username} (Click to logout)`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-200 hover:text-red-400 border border-slate-700 text-xs font-bold transition"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline max-w-[70px] truncate">{user.username}</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
