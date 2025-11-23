import React from 'react';
import './Controls.css';

const Controls = ({ isActive, onStart, onPause, onReset, onModeChange, currentMode }) => {
    return (
        <div className="controls-container">
            <div className="mode-toggles">
                <button
                    className={`mode-btn ${currentMode === 'focus' ? 'active' : ''}`}
                    onClick={() => onModeChange('focus')}
                >
                    專注
                </button>
                <button
                    className={`mode-btn ${currentMode === 'shortBreak' ? 'active' : ''}`}
                    onClick={() => onModeChange('shortBreak')}
                >
                    短休息
                </button>
                <button
                    className={`mode-btn ${currentMode === 'longBreak' ? 'active' : ''}`}
                    onClick={() => onModeChange('longBreak')}
                >
                    長休息
                </button>
            </div>

            <div className="action-buttons">
                {!isActive ? (
                    <button className="primary-btn" onClick={onStart}>開始</button>
                ) : (
                    <button className="secondary-btn" onClick={onPause}>暫停</button>
                )}
                <button className="icon-btn" onClick={onReset} aria-label="Reset">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12" />
                        <path d="M3 3v9h9" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Controls;
