import React, { useState, useEffect } from 'react';
import { loadVocabularyByHanzi } from '../../services/vocabularyService';
import FlashCard from './FlashCard';
import ExampleSentences from './ExampleSentences';
import './HanziVocabLearner.css';

function HanziVocabLearner({ character, onBackToHome }) {
  const [vocabularyList, setVocabularyList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentVocabulary, setCurrentVocabulary] = useState(null);
  const [activeView, setActiveView] = useState('card'); // 'card', 'examples'
  const [loading, setLoading] = useState(true);
  
  // 어휘 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await loadVocabularyByHanzi(character);
        console.log(`'${character}' 관련 어휘 데이터:`, data);
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
  }, [character]);
  
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
        '{character}' 관련 어휘를 찾을 수 없습니다.
        <button onClick={onBackToHome} className="back-button">
          돌아가기
        </button>
      </div>
    );
  }
  
  return (
    <div className="hanzi-vocab-learner">
      <div className="header">
        <button onClick={onBackToHome} className="back-button">
          ← 돌아가기
        </button>
        <h2>'{character}' 관련 어휘 학습</h2>
      </div>
      
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
      </div>
      
      {/* 컨텐츠 영역 */}
      <div className="vocabulary-content">
        {activeView === 'card' && (
          <FlashCard vocabulary={currentVocabulary} />
        )}
        
        {activeView === 'examples' && (
          <ExampleSentences vocabulary={currentVocabulary} />
        )}
      </div>
      
      {/* 네비게이션 버튼 */}
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
    </div>
  );
}

export default HanziVocabLearner;