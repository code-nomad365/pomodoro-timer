import React from 'react';
import './Timer.css';

const Timer = ({ time, mode }) => {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    // This will be calculated in the parent or passed down
    // For now, just a placeholder or we can calculate it if we know the total time
    return 100; 
  };

  return (
    <div className="timer-container">
      <div className="timer-circle">
        <span className="timer-text">{formatTime(time)}</span>
        <span className="timer-mode">{mode}</span>
      </div>
    </div>
  );
};

export default Timer;
