import React, { useState, useEffect } from 'react';
import { getIdiomCategories, getIdiomsByCategory } from '../../services/idiomService';
import IdiomFlashCard from './IdiomFlashCard';
import './IdiomLearner.css';

function IdiomLearner({ onBackToHome }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allIdioms, setAllIdioms] = useState([]);
  const [filteredIdioms, setFilteredIdioms] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 카테고리 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = getIdiomCategories();
        setCategories(data);
        setIsLoading(false);
      } catch (error) {
        console.error('카테고리 로드 오류:', error);
        setError('카테고리를 불러올 수 없습니다.');
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // 카테고리 선택 처리
  const handleCategorySelect = async (categoryId) => {
    try {
      setIsLoading(true);
      const idioms = await getIdiomsByCategory(categoryId);
      setAllIdioms(idioms);
      setFilteredIdioms(idioms);
      
      // sub_category 추출 ("Na" 제외)
      const uniqueSubCategories = [...new Set(
        idioms
          .filter(idiom => idiom.sub_category && idiom.sub_category !== "Na")
          .map(idiom => idiom.sub_category)
      )];
      
      setSubCategories(uniqueSubCategories);
      setSelectedCategory(categoryId);
      setSelectedSubCategory('all');
      setCurrentCardIndex(0);
      setIsLoading(false);
    } catch (error) {
      console.error('성어 데이터 로드 오류:', error);
      setError('성어 데이터를 불러올 수 없습니다.');
      setIsLoading(false);
    }
  };

  // sub_category 필터링
  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setCurrentCardIndex(0);
    
    if (subCategory === 'all') {
      setFilteredIdioms(allIdioms);
    } else {
      const filtered = allIdioms.filter(idiom => idiom.sub_category === subCategory);
      setFilteredIdioms(filtered);
    }
  };

  // 카드 네비게이션
  const goToNextCard = () => {
    if (currentCardIndex < filteredIdioms.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // 카테고리 선택으로 돌아가기
  const goBackToCategories = () => {
    setSelectedCategory(null);
    setAllIdioms([]);
    setFilteredIdioms([]);
    setSubCategories([]);
    setSelectedSubCategory('all');
    setCurrentCardIndex(0);
  };

  if (isLoading) {
    return <div className="loading">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={onBackToHome} className="back-button">홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="idiom-learner">
      {/* 헤더 */}
      <div className="learning-header">
        <button className="back-button" onClick={
          selectedCategory ? goBackToCategories : onBackToHome
        }>
          {selectedCategory ? '← 카테고리로' : '← 홈으로'}
        </button>
        
        <div className="learning-info">
          <h2>
            {selectedCategory ? 
              `${categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory} 성어 학습` : 
              '성어 학습'
            }
          </h2>
        </div>
      </div>

      {/* 카테고리 선택 화면 */}
      {!selectedCategory && (
        <div className="category-list">
          <h3>성어 카테고리 선택</h3>
          <div className="category-grid">
            {categories.map(category => (
              <div 
                key={category.id}
                className="category-card"
                onClick={() => handleCategorySelect(category.id)}
              >
                <h4>{category.name}</h4>
                <p>{category.description}</p>
                <span className="word-count">{category.wordCount}개 성어</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 플래시카드 화면 */}
      {selectedCategory && filteredIdioms.length > 0 && (
        <div className="flashcard-section">
          {/* sub_category 필터 버튼들 */}
          {subCategories.length > 0 && (
            <div className="subcategory-filters">
              <h4>카테고리</h4>
              <div className="subcategory-buttons">
                <button 
                  className={selectedSubCategory === 'all' ? 'active' : ''}
                  onClick={() => handleSubCategorySelect('all')}
                >
                  전체 ({allIdioms.length})
                </button>
                {subCategories.map(subCat => (
                  <button 
                    key={subCat}
                    className={selectedSubCategory === subCat ? 'active' : ''}
                    onClick={() => handleSubCategorySelect(subCat)}
                  >
                    {subCat} ({allIdioms.filter(idiom => idiom.sub_category === subCat).length})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 플래시카드 */}
          <div className="flashcard-container">
            <IdiomFlashCard 
              idiom={filteredIdioms[currentCardIndex]} 
              onNext={goToNextCard}
              onPrev={goToPrevCard}
              isFirst={currentCardIndex === 0}
              isLast={currentCardIndex === filteredIdioms.length - 1}
              currentIndex={currentCardIndex}
              totalCards={filteredIdioms.length}
            />
          </div>
        </div>
      )}

      {/* 선택된 카테고리에 성어가 없는 경우 */}
      {selectedCategory && filteredIdioms.length === 0 && (
        <div className="no-idioms">
          <p>선택한 카테고리에 성어가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default IdiomLearner;