import React, { useState, useEffect, memo, useRef } from 'react';
import './IdiomFlashCard.css';
import { playChineseAudio, stopAudio } from '../../services/audioService';

const IdiomFlashCard = memo(function IdiomFlashCard({ idiom, onNext, onPrev, isFirst, isLast, currentIndex, totalCards }) {
  const [flipped, setFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [studyMode, setStudyMode] = useState('zh-ko'); // 'zh-ko': 중국어→한국어, 'ko-zh': 한국어→중국어
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const animationTimeoutRef = useRef(null);
  
  // 다른 성어로 변경될 때만 flipped 상태 리셋
  useEffect(() => {
    setFlipped(false);
    setIsAnimating(false);
    // 타이머 정리
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, [idiom?.id || idiom?.chengyu]);
  
  // 학습 모드 변경 시 카드 뒤집기 상태 리셋
  useEffect(() => {
    setFlipped(false);
    setIsAnimating(false);
  }, [studyMode]);
  
  // 컴포넌트 언마운트 시 타이머 정리 및 오디오 정지
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      stopAudio(); // 오디오 정지
    };
  }, []);
  
  // 카드 뒤집기
  const handleFlip = () => {
    console.log('🎯 IdiomFlashCard 클릭! 현재 상태:', flipped);
    
    // 애니메이션 중이면 무시
    if (isAnimating) {
      console.log('⚠️ 애니메이션 중이라 무시');
      return;
    }
    
    setIsAnimating(true);
    setFlipped(!flipped);
    console.log('🔄 카드 뒤집기:', !flipped ? '앞→뒤' : '뒤→앞');
    
    // CSS 애니메이션과 동일한 시간(0.6초) 후 애니메이션 완료
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      console.log('✅ 애니메이션 완료');
    }, 600);
  };
  
  // 학습 모드 변경
  const handleModeChange = (mode) => {
    setStudyMode(mode);
    setFlipped(false); // 모드 변경 시 앞면으로
  };
  
  // 다음 카드로 이동
  const handleNext = (e) => {
    e.stopPropagation();
    setFlipped(false);
    stopAudio(); // 오디오 정지
    onNext();
  };
  
  // 이전 카드로 이동
  const handlePrev = (e) => {
    e.stopPropagation();
    setFlipped(false);
    stopAudio(); // 오디오 정지
    onPrev();
  };
  
  // 오디오 재생 함수
  const handlePlayAudio = async (text, speed = 'normal', e) => {
    if (e) {
      e.stopPropagation(); // 카드 뒤집기 방지
    }
    
    if (isPlayingAudio) {
      stopAudio();
      setIsPlayingAudio(false);
      return;
    }
    
    try {
      setIsPlayingAudio(true);
      await playChineseAudio(text, speed);
    } catch (error) {
      console.error('오디오 재생 실패:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  };
  
  // 데이터가 없는 경우
  if (!idiom) {
    return (
      <div className="idiom-flashcard-container">
        <div className="error">성어 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }
  
  return (
    <div className="idiom-flashcard-container">
      {/* 학습 모드 선택 버튼 */}
      <div className="study-mode-selector">
        <button 
          className={`mode-button ${studyMode === 'zh-ko' ? 'active' : ''}`}
          onClick={() => handleModeChange('zh-ko')}
        >
          중국어 → 한국어
        </button>
        <button 
          className={`mode-button ${studyMode === 'ko-zh' ? 'active' : ''}`}
          onClick={() => handleModeChange('ko-zh')}
        >
          한국어 → 중국어
        </button>
      </div>
      
      <div 
        className={`idiom-flashcard ${flipped ? 'flipped' : ''}`} 
        onClick={handleFlip}
      >
        <div className="idiom-flashcard-inner">
          {/* 카드 앞면 */}
          <div className="idiom-flashcard-front">
            <div className="idiom-card-content">
              {studyMode === 'zh-ko' ? (
                // 중국어 → 한국어 모드: 앞면에 중국어
                <div className="idiom-character-display">
                  <div className="idiom-character">{idiom.chengyu}</div>
                  <div className="idiom-pinyin">{idiom.pinyin}</div>
                  
                  {/* 듣기 버튼 */}
                  <div className="idiom-audio-buttons" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`audio-btn ${isPlayingAudio ? 'playing' : ''}`}
                      onClick={(e) => handlePlayAudio(idiom.chengyu, 'normal', e)}
                      disabled={isPlayingAudio}
                    >
                      {isPlayingAudio ? '재생 중...' : '🔊 듣기'}
                    </button>
                    <button 
                      className="audio-btn slow"
                      onClick={(e) => handlePlayAudio(idiom.chengyu, 'slow', e)}
                      disabled={isPlayingAudio}
                    >
                      🔊 천천히 듣기
                    </button>
                  </div>
                  
                  <div className="idiom-flip-instruction">
                    탭하여 한국어 의미 보기
                  </div>
                </div>
              ) : (
                // 한국어 → 중국어 모드: 앞면에 한국어
                <div className="idiom-meaning-display">
                  <div className="idiom-meaning-title">한국어 의미</div>
                  <div className="idiom-meanings">
                    <div className="idiom-meaning-item">
                      {idiom.definition || '의미를 찾을 수 없습니다.'}
                    </div>
                  </div>
                  <div className="idiom-flip-instruction">
                    탭하여 중국어 보기
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 카드 뒷면 */}
          <div className="idiom-flashcard-back">
            <div className="idiom-card-content">
              {studyMode === 'zh-ko' ? (
                // 중국어 → 한국어 모드: 뒷면에 한국어 의미
                <div className="idiom-answer-display">
                  <div className="idiom-answer-title">한국어 의미</div>
                  <div className="idiom-translations">
                    <div className="idiom-translation-item">
                      {idiom.definition || '의미를 찾을 수 없습니다.'}
                    </div>
                  </div>
                  
                  {(idiom.category || idiom.sub_category) && (
                    <div className="idiom-category-info">
                      {idiom.category && (
                        <div className="category-tag">📂 {idiom.category}</div>
                      )}
                      {idiom.sub_category && idiom.sub_category !== 'Na' && (
                        <div className="sub-category-tag">🏷️ {idiom.sub_category}</div>
                      )}
                    </div>
                  )}
                  
                  <div className="idiom-flip-instruction">
                    탭하여 중국어로 돌아가기
                  </div>
                </div>
              ) : (
                // 한국어 → 중국어 모드: 뒷면에 중국어
                <div className="idiom-answer-display">
                  <div className="idiom-answer-title">중국어</div>
                  <div className="idiom-chinese-answer">
                    <div className="idiom-character-answer">{idiom.chengyu}</div>
                    <div className="idiom-pinyin-answer">{idiom.pinyin}</div>
                    
                    {/* 듣기 버튼 */}
                    <div className="idiom-audio-buttons" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className={`audio-btn ${isPlayingAudio ? 'playing' : ''}`}
                        onClick={(e) => handlePlayAudio(idiom.chengyu, 'normal', e)}
                        disabled={isPlayingAudio}
                      >
                        {isPlayingAudio ? '재생 중...' : '🔊 듣기'}
                      </button>
                      <button 
                        className="audio-btn slow"
                        onClick={(e) => handlePlayAudio(idiom.chengyu, 'slow', e)}
                        disabled={isPlayingAudio}
                      >
                        🔊 천천히 듣기
                      </button>
                    </div>
                  </div>
                  
                  {(idiom.category || idiom.sub_category) && (
                    <div className="idiom-category-info">
                      {idiom.category && (
                        <div className="category-tag">📂 {idiom.category}</div>
                      )}
                      {idiom.sub_category && idiom.sub_category !== 'Na' && (
                        <div className="sub-category-tag">🏷️ {idiom.sub_category}</div>
                      )}
                    </div>
                  )}
                  
                  <div className="idiom-flip-instruction">
                    탭하여 한국어로 돌아가기
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="idiom-navigation-buttons" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`idiom-prev-button ${isFirst ? 'disabled' : ''}`}
            onClick={handlePrev}
            disabled={isFirst}
          >
            이전
          </button>
          
          <div className="idiom-card-counter">
            {currentIndex + 1} / {totalCards}
          </div>
          
          <button 
            className={`idiom-next-button ${isLast ? 'complete' : ''}`}
            onClick={handleNext}
          >
            {isLast ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default IdiomFlashCard;