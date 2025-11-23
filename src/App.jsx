import React, { useState, useEffect, useRef } from 'react';
import Timer from './components/Timer';
import Controls from './components/Controls';
import TimerIllustration from './assets/timer-illustration.svg';

const DEFAULT_SETTINGS = {
  focus: { time: 25, label: '專注時間' },
  shortBreak: { time: 5, label: '短休息' },
  longBreak: { time: 10, label: '長休息' },
};

function App() {
  const [timerSettings, setTimerSettings] = useState(DEFAULT_SETTINGS);
  const [mode, setMode] = useState('focus');
  const [time, setTime] = useState(DEFAULT_SETTINGS.focus.time * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);
  const [soundType, setSoundType] = useState('chime');
  const [customSound, setCustomSound] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ... (keep playSound and other handlers same, but update logic where MODES was used)

  const playNotificationSound = () => {
    // Kept for reference if needed, but we are using playSound now
  };

  const handleSoundChange = (e) => {
    setSoundType(e.target.value);
    if (e.target.value !== 'custom') {
      playSound(e.target.value);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomSound(url);
      const audio = new Audio(url);
      audio.play();
    }
  };

  const playSound = (type) => {
    if (type === 'custom') {
      if (customSound) {
        const audio = new Audio(customSound);
        audio.play();
      }
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 1.5);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
    } else if (type === 'bell') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2);
      osc.start(now);
      osc.stop(now + 2);
    } else if (type === 'digital') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1600, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  };

  useEffect(() => {
    if (isActive && time > 0) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
      playSound(soundType);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, time, soundType]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);

  const handleReset = () => {
    setIsActive(false);
    setTime(timerSettings[mode].time * 60);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTime(timerSettings[newMode].time * 60);
  };

  const handleSettingChange = (modeKey, newTime) => {
    const newSettings = { ...timerSettings };
    newSettings[modeKey].time = parseInt(newTime) || 0;
    setTimerSettings(newSettings);

    // If currently in that mode, update time immediately if not active
    if (mode === modeKey && !isActive) {
      setTime(newSettings[modeKey].time * 60);
    }
  };

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
        <h1>番茄鐘</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={toggleTheme}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            aria-label="Settings"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        <div className="illustration-container" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <img src={TimerIllustration} alt="Timer Illustration" width="120" height="120" />
        </div>
        <Timer time={time} mode={timerSettings[mode].label} />
        <Controls
          isActive={isActive}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onModeChange={handleModeChange}
          currentMode={mode}
        />

        <div className="sound-selector" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <label htmlFor="sound-select" style={{ fontSize: '0.9rem' }}>提示音效：</label>
          <select
            id="sound-select"
            value={soundType}
            onChange={(e) => {
              setSoundType(e.target.value);
              playSound(e.target.value);
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: 'var(--card-bg)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="chime">鈴聲</option>
            <option value="bell">鐘聲</option>
            <option value="digital">電子音</option>
            <option value="custom">自訂音效（上傳 MP3）</option>
          </select>
        </div>

        {soundType === 'custom' && (
          <div className="file-upload" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <label
              htmlFor="file-upload"
              style={{
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                background: 'var(--primary-color)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background 0.3s'
              }}
            >
              上傳 MP3
            </label>
            <input
              id="file-upload"
              type="file"
              accept="audio/mp3,audio/wav"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {customSound && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>檔案已載入</span>}
          </div>
        )}
      </main>

      {showSettings && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 100
        }}>
          <div className="modal-content" style={{
            background: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)',
            width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-soft)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>設定</h2>

            <div className="setting-item" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>專注時間（分鐘）</label>
              <input
                type="number"
                value={timerSettings.focus.time}
                onChange={(e) => handleSettingChange('focus', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
            </div>

            <div className="setting-item" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>短休息（分鐘）</label>
              <input
                type="number"
                value={timerSettings.shortBreak.time}
                onChange={(e) => handleSettingChange('shortBreak', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
            </div>

            <div className="setting-item" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>長休息（分鐘）</label>
              <input
                type="number"
                value={timerSettings.longBreak.time}
                onChange={(e) => handleSettingChange('longBreak', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
              />
            </div>

            <button
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%', padding: '0.75rem', background: 'var(--primary-color)', color: 'white',
                borderRadius: '8px', fontWeight: '600'
              }}
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
