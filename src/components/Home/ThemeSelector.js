import React from 'react';
import './ThemeSelector.css';

function ThemeSelector({ themes, selectedTheme, onSelectTheme }) {
  return (
    <div className="theme-selector">
      {themes.map(theme => (
        <div 
          key={theme.id}
          className={`theme-card ${selectedTheme?.id === theme.id ? 'selected' : ''}`}
          onClick={() => onSelectTheme(theme)}
        >
          <h3>{theme.name}</h3>
          <p>{theme.description}</p>
          <div className="theme-info">
            <span>{theme.wordCount} 단어</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ThemeSelector;