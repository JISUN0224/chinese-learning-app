import React, { useState, useEffect, useRef } from 'react';
import { loadHanziData } from '../../services/hanziService';
import HanziWriter from 'hanzi-writer';
import './HanziLearner.css';

// 급수 이름 매핑 함수 (배열 처리 포함)
const getLevelDisplayName = (level) => {
  const levelNames = {
    'new-1': '신HSK 1급',
    'new-2': '신HSK 2급',
    'new-3': '신HSK 3급',
    'new-4': '신HSK 4급',
    'new-5': '신HSK 5급',
    'new-6': '신HSK 6급',
    'new-7': '신HSK 7급',
    'new-7+': '신HSK 7급+',
    'old-1': '구HSK 1급',
    'old-2': '구HSK 2급',
    'old-3': '구HSK 3급',
    'old-4': '구HSK 4급',
    'old-5': '구HSK 5급',
    'old-6': '구HSK 6급'
  };
  
  // level이 배열인 경우 처리
  if (Array.isArray(level)) {
    return level.map(l => levelNames[l] || l).join(', ');
  }
  
  return levelNames[level] || level;
};

// StrokeAnimation 컴포넌트
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

// 쓰기 연습 컴포넌트
function WritingPractice({ character }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 초기화
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 가이드 한자 그리기 (희미하게)
    ctx.font = '200px sans-serif';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(character, canvas.width / 2, canvas.height / 2);
    
    // 테두리 추가
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [character]);
  
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    setIsDrawing(true);
    setLastPos({ x, y });
  };
  
  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    setLastPos({ x, y });
  };
  
  const endDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 초기화
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 가이드 한자 다시 그리기
    ctx.font = '200px sans-serif';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(character, canvas.width / 2, canvas.height / 2);
    
    // 테두리 추가
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  };
  
  return (
    <div className="writing-practice">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        className="writing-canvas"
      />
      <div className="writing-controls">
        <button onClick={clearCanvas} className="clear-button">지우기</button>
      </div>
    </div>
  );
}

function HanziLearner({ hanziList, currentIndex, onIndexChange, level = 1, onViewVocabulary }) {
  const [internalHanziList, setInternalHanziList] = useState([]);
  const [internalCurrentIndex, setInternalCurrentIndex] = useState(0);
  const [currentHanzi, setCurrentHanzi] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 외부에서 hanziList가 제공되면 그것을 사용, 아니면 내부에서 로드
  useEffect(() => {
    if (hanziList && hanziList.length > 0) {
      // 외부에서 제공된 한자 리스트 사용
      setInternalHanziList(hanziList);
      const index = currentIndex || 0;
      setInternalCurrentIndex(index);
      setCurrentHanzi(hanziList[index]);
      setLoading(false);
    } else {
      // 내부에서 한자 데이터 로드
      const fetchData = async () => {
        setLoading(true);
        const data = await loadHanziData(level);
        console.log("로드된 한자 데이터:", data);
        if (data && data.length > 0) {
          setInternalHanziList(data);
          setCurrentHanzi(data[0]);
          setInternalCurrentIndex(0);
          console.log("현재 한자:", data[0]);
        } else {
          console.log("데이터가 비어있거나 없습니다.");
        }
        setLoading(false);
      };
      
      fetchData();
    }
  }, [hanziList, currentIndex, level]);
  
  // 다음 한자로 이동
  const handleNext = () => {
    const nextIndex = internalCurrentIndex + 1;
    if (nextIndex < internalHanziList.length) {
      setInternalCurrentIndex(nextIndex);
      setCurrentHanzi(internalHanziList[nextIndex]);
      if (onIndexChange) onIndexChange(nextIndex);
    }
  };
  
  // 이전 한자로 이동
  const handlePrevious = () => {
    const prevIndex = internalCurrentIndex - 1;
    if (prevIndex >= 0) {
      setInternalCurrentIndex(prevIndex);
      setCurrentHanzi(internalHanziList[prevIndex]);
      if (onIndexChange) onIndexChange(prevIndex);
    }
  };
  
  if (loading) {
    return <div className="loading">한자 데이터를 불러오는 중...</div>;
  }
  
  if (!currentHanzi) {
    return <div className="error">한자 데이터를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="hanzi-learner">
      <h2>한자 학습</h2>
      
      <div className="hanzi-content">
        <div className="hanzi-display">
          {/* 한자 표시 - 가로로 배열 */}
          <div className="horizontal-display">
            {currentHanzi.simplified && (
              <div className="character">{currentHanzi.simplified}</div>
            )}
            
            <div className="character-info">
              {/* 병음 표시 */}
              {currentHanzi.forms && currentHanzi.forms[0] && currentHanzi.forms[0].transcriptions && currentHanzi.forms[0].transcriptions.pinyin && (
              <div className="pinyin">
              {currentHanzi.forms[0].transcriptions.pinyin}
              </div>
              )}
              
              {/* 의미 표시 */}
              {currentHanzi.forms && currentHanzi.forms[0] && currentHanzi.forms[0].meanings && currentHanzi.forms[0].meanings.length > 0 && (
              <div className="meaning">
              의미: {currentHanzi.forms[0].meanings.join(', ')}
              </div>
              )}
              
              {/* 추가 정보 표시 */}
              <div className="additional-info">
                {currentHanzi.radical && <p>부수: {currentHanzi.radical}</p>}
                {currentHanzi.level && <p>급수: {getLevelDisplayName(currentHanzi.level)}</p>}
                {currentHanzi.frequency && <p>빈도: {currentHanzi.frequency}</p>}
                {currentHanzi.pos && <p>품사: {Array.isArray(currentHanzi.pos) ? currentHanzi.pos.join(', ') : currentHanzi.pos}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* 획순 애니메이션 섹션 */}
        <div className="stroke-animation-section">
          <h3>획순 애니메이션 & 쓰기 연습</h3>
          {currentHanzi.simplified && (
            currentHanzi.simplified.length === 1 ? (
              <StrokeAnimation character={currentHanzi.simplified} />
            ) : (
              <div className="multi-character-animation">
                {Array.from(currentHanzi.simplified).map((char, index) => (
                  <StrokeAnimation key={index} character={char} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
      
      <div className="navigation-buttons">
        <button onClick={handlePrevious} disabled={internalCurrentIndex === 0}>
          이전
        </button>
        
        <div className="progress">
          {internalCurrentIndex + 1} / {internalHanziList.length}
        </div>
        
        {/* 관련 어휘 보기 버튼 (외부 콜백이 있을 때만 표시) */}
        {onViewVocabulary && currentHanzi && currentHanzi.simplified && (
          <button 
            className="vocabulary-button"
            onClick={() => onViewVocabulary(currentHanzi.simplified)}
          >
            관련 어휘 보기
          </button>
        )}
        
        <button onClick={handleNext} disabled={internalCurrentIndex === internalHanziList.length - 1}>
          다음
        </button>
      </div>
    </div>
  );
}

export default HanziLearner;