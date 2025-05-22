import React, { useState, useRef, useEffect } from 'react';
import HanziWriter from 'hanzi-writer';
import WritingPractice from './WritingPractice';
import './StrokeAnimation.css';

function StrokeAnimation({ character, width = 200, height = 200 }) {
  const containerRef = useRef(null);
  const writerRef = useRef(null);
  const [showWritingPractice, setShowWritingPractice] = useState(false);
  
  useEffect(() => {
    // 빈 문자열이거나 여러 글자인 경우 처리하지 않음
    if (!character || character.length !== 1 || !containerRef.current) {
      return;
    }
    
    // 이전 인스턴스 정리
    if (writerRef.current) {
      writerRef.current = null;
    }
    
    // div 내용 초기화
    containerRef.current.innerHTML = '';
    
    try {
      // HanziWriter 인스턴스 생성 시도
      writerRef.current = HanziWriter.create(containerRef.current, character, {
        width: width,
        height: height,
        padding: 5,
        delayBetweenStrokes: 300,
        strokeColor: '#333',
        radicalColor: '#168F16',
        outlineColor: '#DDD',
        showCharacter: false,
        showOutline: true
      });
      
      // 기본적으로 애니메이션 자동 시작
      writerRef.current.loopCharacterAnimation();
    } catch (error) {
      console.error(`Failed to load animation for character: ${character}`, error);
      // 오류 메시지를 표시하거나 대체 콘텐츠 제공
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div class="error-message">이 한자(${character})의 획순 데이터를 불러올 수 없습니다.</div>`;
      }
    }
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (writerRef.current) {
        writerRef.current = null;
      }
    };
  }, [character, width, height]);
  
  const handleAnimateStrokes = () => {
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
  };
  
  const handleShowStrokes = () => {
    if (writerRef.current) {
      writerRef.current.showCharacter();
    }
  };
  
  const handleHideStrokes = () => {
    if (writerRef.current) {
      writerRef.current.hideCharacter();
    }
  };
  
  const handleToggleWritingPractice = () => {
    setShowWritingPractice(!showWritingPractice);
  };
  
  return (
    <div>
      <div ref={containerRef} className="animation-container"></div>
      <div className="animation-controls">
        <button onClick={handleAnimateStrokes}>애니메이션</button>
        <button onClick={handleShowStrokes}>보이기</button>
        <button onClick={handleHideStrokes}>숨기기</button>
        <button 
          onClick={handleToggleWritingPractice}
          className={showWritingPractice ? "active" : ""}
        >
          쓰기 연습
        </button>
      </div>
      
      {showWritingPractice && <WritingPractice character={character} />}
    </div>
  );
}

export default StrokeAnimation;