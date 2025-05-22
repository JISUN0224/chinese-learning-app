import React, { useState } from 'react';
import './FlashCard.css';

function FlashCard({ vocab, onNext, onPrev, isFirst, isLast, currentIndex, totalCards }) {
  const [flipped, setFlipped] = useState(false);
  const [translations, setTranslations] = useState([]);
  const [examples, setExamples] = useState([]);
  
  // 카드 뒤집기
  const handleFlip = () => {
    if (!flipped) {
      // 번역 및 예문 설정
      let meaningText = '';
      if (vocab.meaning) {
        if (typeof vocab.meaning === 'object' && vocab.meaning.ko) {
          meaningText = vocab.meaning.ko;
        } else if (typeof vocab.meaning === 'string') {
          meaningText = vocab.meaning;
        }
      }
      
      const meaningArray = meaningText ? meaningText.split(',').map(str => str.trim()) : ['의미 없음'];
      setTranslations(meaningArray);
      
      // 예제 문장 설정
      const exampleSentences = [];
      if (vocab.example) {
        if (typeof vocab.example === 'object' && vocab.example.zh && vocab.example.ko) {
          exampleSentences.push({
            chinese: vocab.example.zh,
            translation: vocab.example.ko
          });
        } else if (typeof vocab.example === 'string') {
          exampleSentences.push({
            chinese: vocab.example,
            translation: '예문 번역 없음'
          });
        }
      }
      setExamples(exampleSentences);
    }
    
    setFlipped(!flipped);
  };
  
  // 다음 카드로 이동
  const handleNext = () => {
    setFlipped(false);
    onNext();
  };
  
  // 이전 카드로 이동
  const handlePrev = () => {
    setFlipped(false);
    onPrev();
  };
  
  return (
    <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
      <div className="flashcard-inner">
        {/* 카드 앞면 - 한자 */}
        <div className="flashcard-front" onClick={handleFlip}>
          <div className="card-content">
            <div className="character-display">
              <div className="character">{vocab.simplified}</div>
              <div className="pinyin">{vocab.pinyin}</div>
            </div>
            
            <div className="flip-instruction">
              탭하여 단어 정보 보기
            </div>
          </div>
        </div>
        
        {/* 카드 뒷면 - 정보 */}
        <div className="flashcard-back" onClick={handleFlip}>
          <div className="card-content">
            <div className="word-info">
              <div className="character-small">{vocab.simplified}</div>
              <div className="pinyin-small">{vocab.pinyin}</div>
              
              <div className="translations">
                {translations.length > 0 ? (
                  <ul>
                    {translations.map((translation, index) => (
                      <li key={index}>{translation}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data">번역 정보가 없습니다.</p>
                )}
              </div>
            </div>
            
            {examples && examples.length > 0 && (
              <div className="examples">
                <h4>예문:</h4>
                {examples.map((example, index) => (
                  <div key={index} className="example">
                    <p className="example-chinese">{example.chinese}</p>
                    <p className="example-translation">{example.translation}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flip-instruction">
              탭하여 단어로 돌아가기
            </div>
          </div>
        </div>
      </div>
      
      <div className="navigation-buttons">
        <button 
          className={`prev-button ${isFirst ? 'disabled' : ''}`}
          onClick={handlePrev}
          disabled={isFirst}
        >
          이전
        </button>
        
        <div className="card-counter">
          {currentIndex + 1} / {totalCards}
        </div>
        
        <button 
          className={`next-button ${isLast ? 'complete' : ''}`}
          onClick={handleNext}
        >
          {isLast ? '완료' : '다음'}
        </button>
      </div>
    </div>
  );
}

export default FlashCard;