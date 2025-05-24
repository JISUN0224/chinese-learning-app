import React, { useState, useEffect, memo, useRef } from 'react';
import './FlashCard.css';
import { playChineseAudio, stopAudio } from '../../services/audioService';

const FlashCard = memo(function FlashCard({ vocab, onNext, onPrev, isFirst, isLast, currentIndex, totalCards }) {
  const [flipped, setFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [studyMode, setStudyMode] = useState('zh-ko'); // 'zh-ko': 중국어→한국어, 'ko-zh': 한국어→중국어
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const animationTimeoutRef = useRef(null);
  
  // 다른 단어로 변경될 때만 flipped 상태 리셋
  useEffect(() => {
    setFlipped(false);
    setIsAnimating(false);
    // 타이머 정리
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, [vocab?.id]);
  
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
  
  const [translations, setTranslations] = useState([]);
  const [examples, setExamples] = useState([]);
  
  // 의미와 예문 데이터 준비
  useEffect(() => {
    // 번역 데이터 준비
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
  }, [vocab]);
  
  // 카드 뒤집기
  const handleFlip = () => {
    console.log('🎯 FlashCard 클릭! 현재 상태:', flipped);
    
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
  
  // 예문 오디오 재생
  const handlePlayExampleAudio = async (chineseText, e) => {
    if (e) {
      e.stopPropagation();
    }
    await handlePlayAudio(chineseText, 'normal', null);
  };
  
  return (
    <div className="vocab-flashcard-container">
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
        className={`vocab-flashcard ${flipped ? 'flipped' : ''}`} 
        onClick={handleFlip}
      >
        <div className="vocab-flashcard-inner">
          {/* 카드 앞면 */}
          <div className="vocab-flashcard-front">
            <div className="vocab-card-content">
              {studyMode === 'zh-ko' ? (
                // 중국어 → 한국어 모드: 앞면에 중국어
                <div className="vocab-character-display">
                  <div className="vocab-character">{vocab.simplified}</div>
                  <div className="vocab-pinyin">{vocab.pinyin}</div>
                  
                  {/* 듣기 버튼 */}
                  <div className="vocab-audio-buttons" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`audio-btn ${isPlayingAudio ? 'playing' : ''}`}
                      onClick={(e) => handlePlayAudio(vocab.simplified, 'normal', e)}
                      disabled={isPlayingAudio}
                    >
                      {isPlayingAudio ? '재생 중...' : '🔊 듣기'}
                    </button>
                    <button 
                      className="audio-btn slow"
                      onClick={(e) => handlePlayAudio(vocab.simplified, 'slow', e)}
                      disabled={isPlayingAudio}
                    >
                      🔊 천천히 듣기
                    </button>
                  </div>
                  
                  <div className="vocab-flip-instruction">
                    탭하여 한국어 의미 보기
                  </div>
                </div>
              ) : (
                // 한국어 → 중국어 모드: 앞면에 한국어
                <div className="vocab-meaning-display">
                  <div className="vocab-meaning-title">한국어 의미</div>
                  <div className="vocab-meanings">
                    {translations.map((translation, index) => (
                      <div key={index} className="vocab-meaning-item">
                        {translation}
                      </div>
                    ))}
                  </div>
                  <div className="vocab-flip-instruction">
                    탭하여 중국어 보기
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 카드 뒷면 */}
          <div className="vocab-flashcard-back">
            <div className="vocab-card-content">
              {studyMode === 'zh-ko' ? (
                // 중국어 → 한국어 모드: 뒷면에 한국어 의미
                <div className="vocab-answer-display">
                  <div className="vocab-answer-title">한국어 의미</div>
                  <div className="vocab-translations">
                    {translations.map((translation, index) => (
                      <div key={index} className="vocab-translation-item">
                        {translation}
                      </div>
                    ))}
                  </div>
                  
                  {examples && examples.length > 0 && (
                    <div className="vocab-examples">
                      <h4>예문</h4>
                      {examples.map((example, index) => (
                        <div key={index} className="vocab-example">
                          <div className="example-content">
                            <p className="vocab-example-chinese">{example.chinese}</p>
                            <p className="vocab-example-translation">{example.translation}</p>
                          </div>
                          {/* 예문 듣기 버튼 */}
                          <button 
                            className="example-audio-btn"
                            onClick={(e) => handlePlayExampleAudio(example.chinese, e)}
                            disabled={isPlayingAudio}
                            title="예문 듣기"
                          >
                            🔊
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="vocab-flip-instruction">
                    탭하여 중국어로 돌아가기
                  </div>
                </div>
              ) : (
                // 한국어 → 중국어 모드: 뒷면에 중국어
                <div className="vocab-answer-display">
                  <div className="vocab-answer-title">중국어</div>
                  <div className="vocab-chinese-answer">
                    <div className="vocab-character-answer">{vocab.simplified}</div>
                    <div className="vocab-pinyin-answer">{vocab.pinyin}</div>
                    
                    {/* 듣기 버튼 */}
                    <div className="vocab-audio-buttons" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className={`audio-btn ${isPlayingAudio ? 'playing' : ''}`}
                        onClick={(e) => handlePlayAudio(vocab.simplified, 'normal', e)}
                        disabled={isPlayingAudio}
                      >
                        {isPlayingAudio ? '재생 중...' : '🔊 듣기'}
                      </button>
                      <button 
                        className="audio-btn slow"
                        onClick={(e) => handlePlayAudio(vocab.simplified, 'slow', e)}
                        disabled={isPlayingAudio}
                      >
                        🔊 천천히 듣기
                      </button>
                    </div>
                  </div>
                  
                  {examples && examples.length > 0 && (
                    <div className="vocab-examples">
                      <h4>예문</h4>
                      {examples.map((example, index) => (
                        <div key={index} className="vocab-example">
                          <div className="example-content">
                            <p className="vocab-example-chinese">{example.chinese}</p>
                            <p className="vocab-example-translation">{example.translation}</p>
                          </div>
                          {/* 예문 듣기 버튼 */}
                          <button 
                            className="example-audio-btn"
                            onClick={(e) => handlePlayExampleAudio(example.chinese, e)}
                            disabled={isPlayingAudio}
                            title="예문 듣기"
                          >
                            🔊
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="vocab-flip-instruction">
                    탭하여 한국어로 돌아가기
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="vocab-navigation-buttons" onClick={(e) => e.stopPropagation()}>
          <button 
            className={`vocab-prev-button ${isFirst ? 'disabled' : ''}`}
            onClick={handlePrev}
            disabled={isFirst}
          >
            이전
          </button>
          
          <div className="vocab-card-counter">
            {currentIndex + 1} / {totalCards}
          </div>
          
          <button 
            className={`vocab-next-button ${isLast ? 'complete' : ''}`}
            onClick={handleNext}
          >
            {isLast ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default FlashCard;