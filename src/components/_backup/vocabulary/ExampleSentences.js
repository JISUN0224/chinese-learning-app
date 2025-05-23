import React, { useState } from 'react';
import './ExampleSentences.css';

function ExampleSentences({ vocabulary }) {
  const [showTranslations, setShowTranslations] = useState({});
  
  if (!vocabulary || !vocabulary.examples || vocabulary.examples.length === 0) {
    return (
      <div className="example-sentences">
        <div className="examples-empty">
          <p>예문이 없습니다.</p>
        </div>
      </div>
    );
  }
  
  const toggleTranslation = (index) => {
    setShowTranslations({
      ...showTranslations,
      [index]: !showTranslations[index]
    });
  };
  
  return (
    <div className="example-sentences">
      <h3>예문 학습</h3>
      
      <div className="examples-list">
        {vocabulary.examples.map((example, index) => (
          <div key={index} className="example-item">
            <div className="example-chinese">{example.chinese}</div>
            <div className="example-pinyin">{example.pinyin}</div>
            
            <button 
              className="translation-toggle" 
              onClick={() => toggleTranslation(index)}
            >
              {showTranslations[index] ? '번역 숨기기' : '번역 보기'}
            </button>
            
            {showTranslations[index] && (
              <div className="example-translation">{example.translation}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExampleSentences;