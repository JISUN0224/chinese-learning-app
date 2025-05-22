import React, { useState, useEffect } from 'react';
import './VocabLearningView.css';
import FlashCard from './FlashCard';
import ProgressIndicator from './ProgressIndicator';
import VocabPreview from './VocabPreview'; 
import { loadVocabularyByLevelOrTheme, loadVocabularyByHanzi } from '../../services/vocabularyService';

// 한 번에 학습할 단어 수
const WORDS_PER_BATCH = 6;

function VocabLearningView({ params, onStartQuiz, onBackToHome }) {
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
          data = await loadVocabularyByLevelOrTheme(level?.id, theme?.id);
        }
        
        console.log('Loaded vocabulary data:', data?.length || 0, 'items');
        
        if (!data || data.length === 0) {
          setError('어휘 데이터를 불러올 수 없습니다.');
          setIsLoading(false);
          return;
        }
        
        setAllVocabulary(data);
        
        // 첫 번째 배치 설정
        const firstBatch = data.slice(0, WORDS_PER_BATCH);
        setCurrentBatch(firstBatch);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading vocabulary:', error);
        setError('어휘 데이터를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    fetchVocabulary();
  }, [params]);
  
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
    onStartQuiz(currentBatch);
  };
  
  // 다음 배치로 이동
  const goToNextBatch = () => {
    const nextBatchIndex = batchIndex + 1;
    const startIndex = nextBatchIndex * WORDS_PER_BATCH;
    
    if (startIndex < allVocabulary.length) {
      const nextBatch = allVocabulary.slice(startIndex, startIndex + WORDS_PER_BATCH);
      setCurrentBatch(nextBatch);
      setBatchIndex(nextBatchIndex);
      setCurrentCardIndex(0);
      setViewMode('preview'); // 다음 배치의 미리보기로 돌아갑니다
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
          <p>배치 {batchIndex + 1}/{totalBatches}</p>
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