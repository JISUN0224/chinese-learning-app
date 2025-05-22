import React, { useState } from 'react';
import './IdiomCard.css';

function IdiomCard({ idiom }) {
  const [showMeaning, setShowMeaning] = useState(false);
  
  const toggleMeaning = () => {
    setShowMeaning(!showMeaning);
  };
  
  if (!idiom) {
    return <div className="error">성어 데이터가 없습니다.</div>;
  }
  
  return (
    <div className="idiom-card-container">
      <div 
        className={`idiom-card ${showMeaning ? 'flipped' : ''}`} 
        onClick={toggleMeaning}
      >
        <div className="card-front">
          <div className="idiom-text">{idiom.simplified}</div>
          <div className="idiom-pinyin">{idiom.pinyin}</div>
          <p className="card-hint">(카드를 클릭하면 뜻을 볼 수 있습니다)</p>
        </div>
        <div className="card-back">
          <div className="idiom-meaning">{idiom.meaning}</div>
          <div className="idiom-story">{idiom.story}</div>
          <p className="card-hint">(카드를 클릭하면 성어를 볼 수 있습니다)</p>
        </div>
      </div>
      
      <div className="idiom-info">
        <div className="idiom-category">
          {idiom.category && <span className="category-tag">{idiom.category}</span>}
          {idiom.difficulty && <span className="difficulty-tag">난이도: {idiom.difficulty}</span>}
        </div>
        
        {idiom.usage && (
          <div className="idiom-usage">
            <strong>용례:</strong> {idiom.usage}
          </div>
        )}
      </div>
    </div>
  );
}

export default IdiomCard;