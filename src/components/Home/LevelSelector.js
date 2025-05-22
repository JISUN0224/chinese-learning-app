import React from 'react';
import './LevelSelector.css';

function LevelSelector({ levels, selectedLevel, onSelectLevel }) {
  return (
    <div className="level-selector">
      {levels.map(level => (
        <div 
          key={level.id}
          className={`level-card ${selectedLevel?.id === level.id ? 'selected' : ''}`}
          onClick={() => onSelectLevel(level)}
        >
          <h3>{level.name}</h3>
          <p>{level.description}</p>
          <div className="level-info">
            <span>{level.wordCount} 단어</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LevelSelector;