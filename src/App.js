import React, { useState, useEffect } from 'react';
import './App.css';
import HanziLearningHome from './components/hanzi/HanziLearningHome';
import HanziSubCategoryView from './components/hanzi/HanziSubCategoryView';
import HanziCategoryView from './components/hanzi/HanziCategoryView';
import HanziLearner from './components/hanzi/HanziLearner';
import VocabLearningHome from './components/VocabLearning/VocabLearningHome';
import VocabLearningView from './components/VocabLearning/VocabLearningView';
import HanziVocabLearner from './components/VocabLearning/HanziVocabLearner';
import VocabQuiz from './components/VocabLearning/VocabQuiz';
import IdiomLearningView from './components/IdiomLearning/IdiomLearningView';

function App() {
  const [activeView, setActiveView] = useState('hanziHome'); // 기본을 한자학습으로 변경
  const [learningParams, setLearningParams] = useState(null);
  const [quizParams, setQuizParams] = useState(null);
  const [hanziCategoryData, setHanziCategoryData] = useState(null);
  const [hanziSubCategoryData, setHanziSubCategoryData] = useState(null);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0); // 배치 인덱스 추가

  // 페이지 새로고침 시 현재 뷰를 유지하기 위한 localStorage 사용
  useEffect(() => {
    const savedView = localStorage.getItem('currentView');
    if (savedView && savedView !== 'home') {
      setActiveView(savedView);
    }
  }, []);

  // activeView 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('currentView', activeView);
  }, [activeView]);
  
  // 한자 학습에서 어휘로 전환할 때 사용할 함수
  const handleViewVocabulary = (character) => {
    setLearningParams({ character });
    setActiveView('vocabulary');
  };

  // 한자 카테고리 선택 (메인 카테고리 선택 시)
  const handleSelectHanziCategory = (categoryData) => {
    console.log('한자 메인 카테고리 선택됨:', categoryData);
    if (categoryData.type === 'main-category') {
      setHanziSubCategoryData({
        categoryType: categoryData.categoryType,
        data: categoryData.data
      });
      setActiveView('hanziSubCategory');
    } else {
      setHanziCategoryData(categoryData);
      setActiveView('hanziCategory');
    }
  };

  // 어휘 학습 시작 (VocabLearningHome에서 선택 시)
  const handleSelectLearningType = (params) => {
    setLearningParams(params);
    
    if (params.type === 'idiom') {
      setActiveView('idiomLearning');
    } else {
      setActiveView('vocabLearning');
    }
  };

  // 퀴즈 시작
  const handleStartQuiz = (vocabList, batchIndex = 0) => {
    setCurrentBatchIndex(batchIndex); // 현재 배치 인덱스 저장
    setQuizParams({
      vocabList,
      type: learningParams?.type || 'vocabulary',
      batchIndex: batchIndex
    });
    setActiveView('quiz');
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="main-header" onClick={() => setActiveView('hanziHome')}>중국어 학습 플랫폼</h1>
      </header>
      
      <div className="navigation-menu">
        <button 
          className={
            activeView === 'hanzi' || 
            activeView === 'hanziHome' || 
            activeView === 'hanziSubCategory' || 
            activeView === 'hanziCategory' ? 'active-tab' : 'tab-button'
          } 
          onClick={() => setActiveView('hanziHome')}
        >
          한자 학습
        </button>
        <button 
          className={
            activeView === 'vocabLearningHome' || 
            activeView === 'vocabLearning' || 
            activeView === 'vocabulary' ||
            activeView === 'idiomLearning' ? 'active-tab' : 'tab-button'
          } 
          onClick={() => setActiveView('vocabLearningHome')}
        >
          어휘 학습
        </button>
      </div>
      
      <main>
        {activeView === 'hanziHome' && (
          <HanziLearningHome 
            onSelectCategory={handleSelectHanziCategory}
          />
        )}
        
        {activeView === 'hanziSubCategory' && hanziSubCategoryData && (
          <HanziSubCategoryView 
            categoryType={hanziSubCategoryData.categoryType}
            data={hanziSubCategoryData.data}
            onBackToHome={() => setActiveView('hanziHome')}
          />
        )}
        
        {activeView === 'hanziCategory' && hanziCategoryData && (
          <HanziCategoryView 
            categoryData={hanziCategoryData}
            onBackToHome={() => setActiveView('hanziSubCategory')}
          />
        )}
        
        {activeView === 'hanzi' && (
          <HanziLearner 
            onViewVocabulary={handleViewVocabulary} 
          />
        )}
        
        {activeView === 'vocabLearningHome' && (
          <VocabLearningHome 
            onSelectLearningType={handleSelectLearningType}
          />
        )}
        
        {activeView === 'vocabLearning' && learningParams && (
          <VocabLearningView 
            params={learningParams} 
            onStartQuiz={handleStartQuiz} 
            onBackToHome={() => setActiveView('vocabLearningHome')}
            initialBatchIndex={currentBatchIndex} // 현재 배치 인덱스 전달
          />
        )}
        
        {activeView === 'vocabulary' && learningParams && learningParams.character && (
          <HanziVocabLearner 
            character={learningParams.character}
            onBackToHome={() => setActiveView('hanziHome')} 
          />
        )}
        
        {/* 성어 학습 - IdiomLearningView로 바로 연결 */}
        {activeView === 'idiomLearning' && (
          <IdiomLearningView 
            selectedCategory={learningParams?.category}
            onBackToHome={() => setActiveView('vocabLearningHome')} 
          />
        )}
        
        {activeView === 'quiz' && quizParams && (
          <VocabQuiz 
            vocabularyData={quizParams.vocabList}
            onContinue={() => {
              // 이어서 학습하기: 다음 배치로 이동
              setCurrentBatchIndex(0); // 첫 번째 배치로 리셋
              if (quizParams.type === 'vocabulary' || quizParams.type === 'hsk' || quizParams.type === 'theme') {
                setActiveView('vocabLearning');
              } else if (quizParams.type === 'idiom') {
                setActiveView('idiomLearning');
              } else {
                setActiveView('hanziHome');
              }
            }}
            onFinish={() => {
              // 학습 메뉴로 돌아가기
              if (quizParams.type === 'vocabulary' || quizParams.type === 'hsk' || quizParams.type === 'theme') {
                setActiveView('vocabLearning');
              } else if (quizParams.type === 'idiom') {
                setActiveView('vocabLearningHome');
              } else {
                setActiveView('hanziHome');
              }
            }} 
          />
        )}
      </main>
      
      <footer className="App-footer">
        <p>© 2025 중국어 학습 플랫폼</p>
      </footer>
    </div>
  );
}

export default App;