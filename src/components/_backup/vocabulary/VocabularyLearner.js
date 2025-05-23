import React, { useState, useEffect } from 'react';
import { loadVocabularyData } from '../../services/vocabularyService';
import VocabularyCard from './VocabularyCard';
import ExampleSentences from './ExampleSentences';
import VocabularyQuiz from './VocabularyQuiz';
import './VocabularyLearner.css';

function VocabularyLearner({ character, categoryId }) {
  const [vocabularyList, setVocabularyList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentVocabulary, setCurrentVocabulary] = useState(null);
  const [activeView, setActiveView] = useState('card'); // 'card', 'examples', 'quiz'
  const [loading, setLoading] = useState(true);
  
  // 어휘 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await loadVocabularyData(character, categoryId);
        console.log("로드된 어휘 데이터:", data);
        if (data && data.length > 0) {
          setVocabularyList(data);
          setCurrentVocabulary(data[0]);
        }
      } catch (error) {
        console.error("어휘 데이터 로드 오류:", error);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [character, categoryId]);
  
  // 다음 어휘로 이동
  const handleNext = () => {
    if (currentIndex < vocabularyList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentVocabulary(vocabularyList[currentIndex + 1]);
    }
  };
  
  // 이전 어휘로 이동
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentVocabulary(vocabularyList[currentIndex - 1]);
    }
  };
  
  if (loading) {
    return <div className="loading">어휘 데이터를 불러오는 중...</div>;
  }
  
  if (!currentVocabulary) {
    return (
      <div className="error">
        {character ? `'${character}' 관련 어휘를 찾을 수 없습니다.` : '어휘 데이터를 불러올 수 없습니다.'}
      </div>
    );
  }
  
  return (
    <div className="vocabulary-learner">
      <h2>어휘 학습</h2>
      
      {/* 탭 네비게이션 */}
      <div className="vocabulary-tabs">
        <button 
          className={activeView === 'card' ? 'active-tab' : ''}
          onClick={() => setActiveView('card')}
        >
          플래시 카드
        </button>
        <button 
          className={activeView === 'examples' ? 'active-tab' : ''}
          onClick={() => setActiveView('examples')}
        >
          예문 학습
        </button>
        <button 
          className={activeView === 'quiz' ? 'active-tab' : ''}
          onClick={() => setActiveView('quiz')}
        >
          퀴즈
        </button>
      </div>
      
      {/* 컨텐츠 영역 */}
      <div className="vocabulary-content">
        {activeView === 'card' && (
          <VocabularyCard vocabulary={currentVocabulary} />
        )}
        
        {activeView === 'examples' && (
          <ExampleSentences vocabulary={currentVocabulary} />
        )}
        
        {activeView === 'quiz' && (
          <VocabularyQuiz vocabularyList={vocabularyList} />
        )}
      </div>
      
      {/* 네비게이션 버튼 (퀴즈 모드에서는 표시하지 않음) */}
      {activeView !== 'quiz' && (
        <div className="navigation-buttons">
          <button onClick={handlePrevious} disabled={currentIndex === 0}>
            이전
          </button>
          <div className="progress">
            {currentIndex + 1} / {vocabularyList.length}
          </div>
          <button onClick={handleNext} disabled={currentIndex === vocabularyList.length - 1}>
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default VocabularyLearner;