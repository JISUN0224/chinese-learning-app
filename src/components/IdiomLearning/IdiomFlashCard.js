import React, { useState } from 'react';
import './IdiomFlashCard.css';

function IdiomFlashCard({ idiom, onNext, onPrev, isFirst, isLast, currentIndex, totalCards }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // 카드 뒤집기
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  // 발음 듣기
  const speakText = (text, isSlow = false) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      
      if (isSlow) {
        utterance.rate = 0.7;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('죄송합니다. 현재 브라우저는 음성 합성을 지원하지 않습니다.');
    }
  };
  
  // 다음 카드로 이동
  const handleNext = (e) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    setIsFlipped(false); // 카드 앞면으로 초기화
    onNext();
  };
  
  // 이전 카드로 이동
  const handlePrev = (e) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    setIsFlipped(false);
    onPrev();
  };
  
  // 데이터가 없는 경우
  if (!idiom) {
    return (
      <div className="flashcard-wrapper">
        <div className="flashcard">
          <div className="card-inner">
            <div className="card-front">
              <h1 className="idiom-word">데이터 없음</h1>
              <p className="idiom-pinyin">데이터를 불러올 수 없습니다</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flashcard-wrapper">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
        <div className="card-inner">
          {/* 앞면 - 한자와 병음 */}
          <div className="card-front">
            <h1 className="idiom-word">{idiom.chengyu}</h1>
            <p className="idiom-pinyin">{idiom.pinyin}</p>
            
            <div className="card-hint">클릭하여 뜻 보기</div>
            
            <div className="audio-buttons">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(idiom.chengyu);
                }}
                className="audio-button"
              >
                🔊 듣기
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(idiom.chengyu, true);
                }}
                className="audio-button slow"
              >
                🐌 천천히
              </button>
            </div>
          </div>
          
          {/* 뒷면 - 한국어 뜻과 설명 */}
          <div className="card-back">
            <div className="back-content">
              <h2 className="idiom-meaning">
                {idiom.definition || '뜻을 찾을 수 없습니다.'}
              </h2>
              
              {idiom.category && (
                <div className="idiom-category-info">
                  <span className="category-tag">📂 {idiom.category}</span>
                  {idiom.sub_category && idiom.sub_category !== 'Na' && (
                    <span className="sub-category-tag">🏷️ {idiom.sub_category}</span>
                  )}
                </div>
              )}
              
              <div className="back-idiom-info">
                <p className="back-chengyu">{idiom.chengyu}</p>
                <p className="back-pinyin">{idiom.pinyin}</p>
              </div>
            </div>
            
            <div className="card-hint">클릭하여 앞면 보기</div>
            
            <div className="audio-buttons">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(idiom.chengyu);
                }}
                className="audio-button"
              >
                🔊 듣기
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-navigation">
        <button 
          className="nav-button prev"
          onClick={handlePrev}
          disabled={isFirst}
        >
          ← 이전
        </button>
        
        <div className="card-indicator">
          {currentIndex + 1} / {totalCards}
        </div>
        
        <button 
          className="nav-button next"
          onClick={handleNext}
          disabled={isLast}
        >
          {isLast ? '완료' : '다음 →'}
        </button>
      </div>
      
      {/* 마지막 카드일 때 완료 버튼 추가 */}
      {isLast && (
        <div className="complete-section">
          <button 
            className="complete-button"
            onClick={(e) => {
              e.stopPropagation();
              onNext(); // 완료 처리를 위해 onNext 호출
            }}
          >
            학습 완료하기
          </button>
        </div>
      )}
    </div>
  );
}

export default IdiomFlashCard;