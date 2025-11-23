import React, { useState, useEffect, useRef } from 'react';
import Timer from './components/Timer';
import Controls from './components/Controls';
import PomodoroIcon from './assets/pomodoro-icon.png';

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
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('light');
  const wakeLockRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // ... (keep playSound and other handlers same, but update logic where MODES was used)

  const audioRef = useRef(null);

  useEffect(() => {
    // 預先載入音訊
    audioRef.current = new Audio('/pomodoro-timer/clock_bell.mp3');
    audioRef.current.load();
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // 重置播放位置
      audioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
        // 如果自動播放失敗，嘗試使用 Notification API 或震動
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      });
    }
  };

  // 請求 Wake Lock 防止螢幕關閉時暫停
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake Lock activated');
      }
    } catch (err) {
      console.log('Wake Lock error:', err);
    }
  };

  // 釋放 Wake Lock
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock released');
      } catch (err) {
        console.log('Wake Lock release error:', err);
      }
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
      releaseWakeLock();
      playSound();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, time]);

  const handleStart = () => {
    // 在用戶互動時初始化音訊（解決手機瀏覽器限制）
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }).catch(() => {
        // 忽略初始化錯誤
      });
    }
    // 請求 Wake Lock 防止螢幕關閉時暫停
    requestWakeLock();
    setIsActive(true);
  };
  const handlePause = () => {
    releaseWakeLock();
    setIsActive(false);
  };

  const handleReset = () => {
    releaseWakeLock();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={PomodoroIcon} alt="番茄鐘圖示" width="40" height="40" style={{ borderRadius: '8px' }} />
          <h1>番茄鐘</h1>
        </div>
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
        <Timer time={time} mode={timerSettings[mode].label} />
        <Controls
          isActive={isActive}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onModeChange={handleModeChange}
          currentMode={mode}
        />
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
