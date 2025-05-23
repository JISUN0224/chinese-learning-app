import React, { useState, useEffect } from 'react';
import './VocabLearningView.css';
import FlashCard from './FlashCard';
import ProgressIndicator from './ProgressIndicator';
import VocabPreview from './VocabPreview'; 
import { loadVocabularyByLevelOrTheme, loadVocabularyByHanzi } from '../../services/vocabularyService';

// 한 번에 학습할 단어 수
const WORDS_PER_BATCH = 6;

function VocabLearningView({ params, onStartQuiz, onBackToHome, initialBatchIndex = 0 }) {
  const [allVocabulary, setAllVocabulary] = useState([]);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('preview'); // 'preview', 'learning', 'complete' 중 하나
  
  // 디버깅을 위한 로그
  useEffect(() => {
    console.log("Current view mode:", viewMode);
    console.log("Current card index:", currentCardIndex);
    console.log("Current batch:", currentBatch);
    console.log("Current params:", params);
  }, [viewMode, currentCardIndex, currentBatch, params]);
  
  // 학습 데이터 로드
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching vocabulary with params:', params);
        let data = [];
        
        // 한자 관련 어휘 로드
        if (params.character) {
          data = await loadVocabularyByHanzi(params.character);
        } 
        // 레벨/테마별 어휘 로드
        else {
          const { level, theme } = params || {};
          // 테마의 경우 name을 사용 (실제 카테고리 이름)
          const themeId = theme ? theme.name : null;
          data = await loadVocabularyByLevelOrTheme(level?.id, themeId);
        }
        
        console.log('Loaded vocabulary data:', data?.length || 0, 'items');
        
        if (!data || data.length === 0) {
          setError('어휘 데이터를 불러올 수 없습니다.');
          setIsLoading(false);
          return;
        }
        
        setAllVocabulary(data);
        
        // 초기 배치 인덱스 설정 (이어서 학습하기에서 오는 경우)
        const targetBatchIndex = initialBatchIndex;
        setBatchIndex(targetBatchIndex);
        
        // 해당 배치 설정
        const startIndex = targetBatchIndex * WORDS_PER_BATCH;
        const targetBatch = data.slice(startIndex, startIndex + WORDS_PER_BATCH);
        
        if (targetBatch.length === 0) {
          // 모든 배치를 완료한 경우 첫 번째 배치로 돌아가기
          setCurrentBatch(data.slice(0, WORDS_PER_BATCH));
          setBatchIndex(0);
        } else {
          setCurrentBatch(targetBatch);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading vocabulary:', error);
        setError('어휘 데이터를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    fetchVocabulary();
  }, [params, initialBatchIndex]); // initialBatchIndex 의존성 추가
  
  // 다음 카드로 이동
  const goToNextCard = () => {
    console.log("Going to next card. Current index:", currentCardIndex, "Total cards:", currentBatch.length);
    
    if (currentCardIndex < currentBatch.length - 1) {
      // 현재 배치 내에서 다음 카드로 이동
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // 현재 배치의 마지막 카드인 경우
      console.log("Reached last card! Setting view mode to complete");
      setViewMode('complete');
    }
  };
  
  // 이전 카드로 이동
  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };
  
  // 퀴즈 시작
  const handleStartQuiz = () => {
    console.log("Starting quiz with vocabulary batch:", currentBatch);
    if (currentBatch.length === 0) {
      console.error("Cannot start quiz: No vocabulary data");
      return;
    }
    onStartQuiz(currentBatch, batchIndex); // 배치 인덱스도 함께 전달
  };
  
  // 특정 배치로 이동
  const goToBatch = (targetBatchIndex) => {
    const startIndex = targetBatchIndex * WORDS_PER_BATCH;
    
    if (startIndex < allVocabulary.length) {
      const targetBatch = allVocabulary.slice(startIndex, startIndex + WORDS_PER_BATCH);
      setCurrentBatch(targetBatch);
      setBatchIndex(targetBatchIndex);
      setCurrentCardIndex(0);
      setViewMode('preview');
    }
  };
  
  // 배치 드롭다운 변경 핸들러
  const handleBatchChange = (e) => {
    const selectedBatch = parseInt(e.target.value);
    goToBatch(selectedBatch);
  };
  
  // 다음 배치로 이동 (기존 함수 유지)
  const goToNextBatch = () => {
    const nextBatchIndex = batchIndex + 1;
    
    if (nextBatchIndex < totalBatches) {
      goToBatch(nextBatchIndex);
    } else {
      // 모든 단어 학습 완료
      alert("모든 단어를 학습했습니다!");
      onBackToHome();
    }
  };
  
  // 학습 시작하기
  const handleStartLearning = () => {
    console.log("Starting learning mode");
    setViewMode('learning');
    setCurrentCardIndex(0);
  };
  
  if (isLoading) {
    return <div className="loading">어휘 데이터를 불러오는 중...</div>;
  }
  
  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={onBackToHome} className="back-button">홈으로 돌아가기</button>
      </div>
    );
  }
  
  const currentCard = currentBatch[currentCardIndex];
  const totalBatches = Math.ceil(allVocabulary.length / WORDS_PER_BATCH);
  
  // 학습 항목명 표시 (레벨, 테마, 한자)
  const getLearningTitle = () => {
    if (params.character) {
      return `'${params.character}' 관련 어휘`;
    } else if (params.level) {
      return `${params.level.name} 어휘`;
    } else if (params.theme) {
      return `${params.theme.name} 관련 어휘`;
    }
    return '어휘 학습';
  };
  
  return (
    <div className="vocab-learning-view">
      <div className="learning-header">
        <button className="back-button" onClick={onBackToHome}>
          ← 돌아가기
        </button>
        
        <div className="learning-info">
          <h2>{getLearningTitle()}</h2>
          <div className="batch-controls">
            <span className="batch-text">배치</span>
            <select 
              className="batch-selector"
              value={batchIndex}
              onChange={handleBatchChange}
            >
              {Array.from({ length: totalBatches }, (_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="batch-total">/ {totalBatches}</span>
          </div>
        </div>
      </div>
      
      {viewMode === 'preview' && (
        <div className="preview-container">
          <VocabPreview 
            vocabList={currentBatch} 
            onStartLearning={handleStartLearning}
          />
        </div>
      )}
      
      {viewMode === 'learning' && (
        <>
          <div className="cards-progress">
            <ProgressIndicator 
              current={currentCardIndex + 1} 
              total={currentBatch.length}
            />
          </div>
          
          <div className="flashcard-container">
            <FlashCard 
              key={currentCardIndex}
              vocab={currentCard} 
              onNext={goToNextCard}
              onPrev={goToPrevCard}
              isFirst={currentCardIndex === 0}
              isLast={currentCardIndex === currentBatch.length - 1}
              currentIndex={currentCardIndex}
              totalCards={currentBatch.length}
            />
          </div>
        </>
      )}
      
      {viewMode === 'complete' && (
        <div className="batch-complete">
          <h3>배치 학습 완료!</h3>
          <p>{currentBatch.length}개 단어를 학습했습니다.</p>
          <div className="action-buttons">
            <button className="quiz-button" onClick={handleStartQuiz}>
              퀴즈 시작하기
            </button>
            <button className="next-batch-button" onClick={goToNextBatch}>
              다음 배치 학습하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VocabLearningView;