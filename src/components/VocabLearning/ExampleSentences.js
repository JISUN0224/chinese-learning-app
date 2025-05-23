import React, { useState } from 'react';
import './ExampleSentences.css';

function ExampleSentences({ vocabulary }) {
  const [showTranslations, setShowTranslations] = useState({});
  
  if (!vocabulary) {
    return (
      <div className="example-sentences">
        <div className="examples-empty">
          <p>어휘 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }
  
  // 예문이 문자열인 경우와 배열인 경우 모두 처리
  let examples = [];
  if (vocabulary.example && typeof vocabulary.example === 'string') {
    // 단일 예문 문자열인 경우
    examples = [{
      chinese: vocabulary.example,
      pinyin: '',
      translation: ''
    }];
  } else if (vocabulary.examples && Array.isArray(vocabulary.examples)) {
    // 예문 배열인 경우
    examples = vocabulary.examples;
  }
  
  if (examples.length === 0) {
    return (
      <div className="example-sentences">
        <div className="examples-empty">
          <p>예문이 없습니다.</p>
          <div className="vocab-info">
            <div className="chinese">{vocabulary.simplified}</div>
            <div className="pinyin">{vocabulary.pinyin}</div>
            <div className="meaning">{vocabulary.meaning}</div>
          </div>
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
      <div className="current-vocab">
        <div className="chinese">{vocabulary.simplified}</div>
        <div className="pinyin">{vocabulary.pinyin}</div>
        <div className="meaning">{vocabulary.meaning}</div>
      </div>
      
      <h3>예문 학습</h3>
      
      <div className="examples-list">
        {examples.map((example, index) => (
          <div key={index} className="example-item">
            <div className="example-chinese">{example.chinese}</div>
            {example.pinyin && (
              <div className="example-pinyin">{example.pinyin}</div>
            )}
            
            {example.translation && (
              <>
                <button 
                  className="translation-toggle" 
                  onClick={() => toggleTranslation(index)}
                >
                  {showTranslations[index] ? '번역 숨기기' : '번역 보기'}
                </button>
                
                {showTranslations[index] && (
                  <div className="example-translation">{example.translation}</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExampleSentences;