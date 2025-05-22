import React, { useState, useEffect } from 'react';
import './HomeScreen.css';
import LevelSelector from './LevelSelector';
import ThemeSelector from './ThemeSelector';
import { loadVocabularyLevels, loadVocabularyThemes } from '../../services/vocabularyService';
import { getIdiomCategories } from '../../services/idiomService';

function HomeScreen({ onStartLearning, onStartIdiomLearning }) {
  const [levels, setLevels] = useState([]);
  const [themes, setThemes] = useState([]);
  const [idiomCategories, setIdiomCategories] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedIdiomCategory, setSelectedIdiomCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 레벨, 테마, 성어 카테고리 데이터 로드
        const levelsData = await loadVocabularyLevels();
        const themesData = await loadVocabularyThemes();
        const idiomCategoriesData = await getIdiomCategories();
        
        setLevels(levelsData || []);
        setThemes(themesData || []);
        setIdiomCategories(idiomCategoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setSelectedIdiomCategory(null); // 성어 카테고리 선택 해제
  };
  
  const handleIdiomCategorySelect = (category) => {
    setSelectedIdiomCategory(category);
    setSelectedLevel(null); // 레벨 선택 해제
    setSelectedTheme(null); // 테마 선택 해제
  };

  const handleStartLearning = () => {
    if (selectedLevel || selectedTheme) {
      onStartLearning({
        level: selectedLevel,
        theme: selectedTheme
      });
    } else if (selectedIdiomCategory) {
      // 성어 학습 시작
      onStartIdiomLearning(selectedIdiomCategory);
    }
  };

  if (loading) {
    return <div className="loading">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="home-screen">
      <h1>중국어 어휘 학습</h1>
      <p className="intro-text">레벨 또는 테마를 선택하여 학습을 시작하세요.</p>
      
      <div className="selection-container">
        <div className="level-section">
          <h2>레벨별 학습</h2>
          <LevelSelector 
            levels={levels} 
            selectedLevel={selectedLevel} 
            onSelectLevel={handleLevelSelect} 
          />
        </div>
        
        <div className="theme-section">
          <h2>테마별 학습</h2>
          <ThemeSelector 
            themes={themes} 
            selectedTheme={selectedTheme} 
            onSelectTheme={handleThemeSelect} 
          />
        </div>
        
        <div className="idiom-section">
          <h2>성어 학습</h2>
          <div className="idiom-category-selector">
            {idiomCategories.map(category => (
              <div 
                key={category.id}
                className={`idiom-category-item ${selectedIdiomCategory && selectedIdiomCategory.id === category.id ? 'selected' : ''}`}
                onClick={() => handleIdiomCategorySelect(category)}
              >
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="word-count">{category.wordCount}개 성어</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {(selectedLevel || selectedTheme || selectedIdiomCategory) && (
        <button 
          className="start-learning-button"
          onClick={handleStartLearning}
        >
          학습 시작하기
        </button>
      )}
    </div>
  );
}

export default HomeScreen;