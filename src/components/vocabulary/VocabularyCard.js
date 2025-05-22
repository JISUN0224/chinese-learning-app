import React, { useState } from 'react';
import './VocabularyCard.css';

function VocabularyCard({ vocabulary }) {
  const [showMeaning, setShowMeaning] = useState(false);
  
  const toggleMeaning = () => {
    setShowMeaning(!showMeaning);
  };
  
  if (!vocabulary) {
    return <div className="error">어휘 데이터가 없습니다.</div>;
  }
  
  return (
    <div className="vocabulary-card">
      <div 
        className={`card ${showMeaning ? 'flipped' : ''}`} 
        onClick={toggleMeaning}
      >
        <div className="card-front">
          <div className="chinese-text">{vocabulary.simplified}</div>
          <div className="pinyin">{vocabulary.pinyin}</div>
          <p className="card-hint">(카드를 클릭하면 뜻을 볼 수 있습니다)</p>
        </div>
        <div className="card-back">
          <div className="meaning">{vocabulary.meaning}</div>
          {vocabulary.traditional && (
            <div className="traditional">번체자: {vocabulary.traditional}</div>
          )}
          <p className="card-hint">(카드를 클릭하면 단어를 볼 수 있습니다)</p>
        </div>
      </div>
      
      <div className="card-info">
        <div className="card-details">
          {vocabulary.hskLevel && (
            <span className="hsk-level">HSK {vocabulary.hskLevel}급</span>
          )}
          {vocabulary.category && (
            <span className="category">{vocabulary.category}</span>
          )}
        </div>
        
        {vocabulary.note && (
          <div className="note">
            <strong>참고:</strong> {vocabulary.note}
          </div>
        )}
      </div>
    </div>
  );
}

export default VocabularyCard;