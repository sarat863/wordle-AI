import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';

import Game from './Components/Game';
import Login from './Components/Login';
import SignUp from './Components/SignUp';

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Game />} />
              <Route path="/game" element={<Game />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/hints" element={<Navigate to="/game" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
