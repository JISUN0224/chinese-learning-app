import React, { useState, useEffect } from 'react';
import './VocabLearningHome.css';
import { loadVocabularyLevels, loadVocabularyThemes } from '../../services/vocabularyService';
import { getIdiomCategories } from '../../services/idiomService';

function VocabLearningHome({ onSelectLearningType, onBackToHome, onStartQuiz }) {
  const [levels, setLevels] = useState([]);
  const [themes, setThemes] = useState([]);
  const [idiomCategories, setIdiomCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        // HSK 레벨 데이터 불러오기
        const levelsData = await loadVocabularyLevels();
        setLevels(levelsData);
        
        // 주제별 데이터 불러오기
        const themesData = await loadVocabularyThemes();
        setThemes(themesData);
        
        // 성어 카테고리 불러오기
        const categoryData = await getIdiomCategories();
        
        // 카테고리 이름을 기반으로 그룹화된 객체 생성
        const groupedCategories = {};
        categoryData.forEach(category => {
          const name = category.name?.trim();
          if (name && !groupedCategories[name]) {
            groupedCategories[name] = {
              id: category.id,
              name: name,
              description: category.description || `${name} 관련 성어 모음`,
              wordCount: category.wordCount || 0
            };
          } else if (name) {
            // 이미 있는 카테고리면 단어 수만 더하기
            groupedCategories[name].wordCount += (category.wordCount || 0);
          }
        });
        
        // 객체를 배열로 변환
        let uniqueCategories = Object.values(groupedCategories);
        
        // 기본 대표 카테고리 추가 (기존 카테고리가 없다면 임시 데이터 추가)
        if (uniqueCategories.length === 0) {
          uniqueCategories = [
            {
              id: 'people',
              name: '인물·성격',
              description: '인물이나 성격과 관련된 성어',
              wordCount: 25
            },
            {
              id: 'nature',
              name: '자연·풍경',
              description: '자연이나 풍경을 묘사하는 성어',
              wordCount: 30
            },
            {
              id: 'action',
              name: '행동·결심',
              description: '행동이나 결심과 관련된 성어',
              wordCount: 28
            },
            {
              id: 'wisdom',
              name: '지혜·교훈',
              description: '지혜나 교훈을 담은 성어',
              wordCount: 35
            },
            {
              id: 'quantity',
              name: '수량·숫자 표현',
              description: '수량이나 숫자를 나타내는 성어',
              wordCount: 22
            },
            {
              id: 'history',
              name: '고사 유래',
              description: '역사적 이야기에서 유래된 성어',
              wordCount: 40
            },
            {
              id: 'others',
              name: '기타',
              description: '기타 다양한 주제의 성어',
              wordCount: 20
            }
          ];
        }
        
        setIdiomCategories(uniqueCategories);
        setIsLoading(false);
      } catch (error) {
        console.error('학습 옵션 로드 실패:', error);
        setIsLoading(false);
      }
    };
    
    fetchOptions();
  }, []);
  
  const handleSelectLevel = (level) => {
    onSelectLearningType({ level, type: 'hsk' });
  };
  
  const handleSelectTheme = (theme) => {
    onSelectLearningType({ theme, type: 'theme' });
  };
  
  const handleSelectIdiomCategory = (category) => {
    onSelectLearningType({ category, type: 'idiom' });
  };
  
  if (isLoading) {
    return <div className="loading">학습 옵션을 불러오는 중...</div>;
  }
  
  return (
    <div className="vocab-learning-home">
      <h2 className="page-title">📚 어휘 학습</h2>
      
      <div className="vocab-learning-options">
        {/* HSK별 학습 */}
        <div className="learning-option hsk-option">
          <h3 className="option-title">🟦 HSK별 학습하기</h3>
          <div className="option-cards">
            {levels.map((level) => (
              <div 
                key={level.id} 
                className="option-card hsk-card"
                onClick={() => handleSelectLevel(level)}
              >
                <h4>{level.name}</h4>
                <p>{level.description}</p>
                <span className="word-count">{level.wordCount}단어</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 유형별 학습 */}
        <div className="learning-option theme-option">
          <h3 className="option-title">🟨 유형별 학습하기</h3>
          <div className="option-cards">
            {themes.map((theme) => (
              <div 
                key={theme.id} 
                className="option-card theme-card"
                onClick={() => handleSelectTheme(theme)}
              >
                <h4>{theme.name}</h4>
                <p>{theme.description}</p>
                <span className="word-count">{theme.wordCount}단어</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 성어 학습 */}
        <div className="learning-option idiom-option">
          <h3 className="option-title">🟥 성어 학습하기</h3>
          <div className="option-cards">
            {idiomCategories.map((category) => (
              <div 
                key={category.id} 
                className="option-card idiom-card"
                onClick={() => handleSelectIdiomCategory(category)}
              >
                <h4>{category.name}</h4>
                <p>{category.description}</p>
                <span className="word-count">{category.wordCount}개 성어</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VocabLearningHome;