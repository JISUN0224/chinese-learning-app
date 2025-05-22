import React, { useState, useEffect } from 'react';
import { loadIdiomData } from '../../services/idiomService';
import IdiomCard from './IdiomCard';
import './IdiomLearner.css';

function IdiomLearner({ categoryId, onBack }) {
  const [idiomList, setIdiomList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIdiom, setCurrentIdiom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || null);
  
  // 카테고리 데이터 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await loadIdiomData('categories');
        console.log("로드된 성어 카테고리:", data);
        
        // 'na' 값은 표시하지 않음
        const filteredCategories = data.filter(cat => cat.id !== 'na');
        
        setCategories(filteredCategories);
        
        // 선택된 카테고리가 없을 경우 첫번째 카테고리 선택
        if (!selectedCategory && filteredCategories.length > 0) {
          setSelectedCategory(filteredCategories[0].id);
        }
      } catch (error) {
        console.error("카테고리 데이터 로드 오류:", error);
      }
    };
    
    fetchCategories();
  }, [selectedCategory]);
  
  // 선택된 카테고리의 성어 데이터 로드
  useEffect(() => {
    const fetchIdioms = async () => {
      if (!selectedCategory) return;
      
      setLoading(true);
      try {
        const data = await loadIdiomData(selectedCategory);
        console.log("로드된 성어 데이터:", data);
        if (data && data.length > 0) {
          setIdiomList(data);
          setCurrentIdiom(data[0]);
          setCurrentIndex(0);
        } else {
          setIdiomList([]);
          setCurrentIdiom(null);
        }
      } catch (error) {
        console.error("성어 데이터 로드 오류:", error);
      }
      setLoading(false);
    };
    
    fetchIdioms();
  }, [selectedCategory]);
  
  // 카테고리 변경 처리
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  
  // 다음 성어로 이동
  const handleNext = () => {
    if (currentIndex < idiomList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentIdiom(idiomList[currentIndex + 1]);
    }
  };
  
  // 이전 성어로 이동
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentIdiom(idiomList[currentIndex - 1]);
    }
  };
  
  if (loading) {
    return <div className="loading">성어 데이터를 불러오는 중...</div>;
  }
  
  // 카테고리 선택 화면
  if (!selectedCategory) {
    return (
      <div className="idiom-learner">
        <h2>성어 학습</h2>
        
        <div className="category-list">
          {categories.map(category => (
            <div 
              key={category.id} 
              className="category-item"
              onClick={() => handleCategoryChange(category.id)}
            >
              <h3>{category.name}</h3>
              {category.subcategory && <p>{category.subcategory}</p>}
              <span className="item-count">{category.count || 0}개 성어</span>
            </div>
          ))}
        </div>
        
        <button className="back-button" onClick={onBack}>
          학습 메뉴로 돌아가기
        </button>
      </div>
    );
  }
  
  if (!currentIdiom) {
    return (
      <div className="idiom-learner">
        <h2>성어 학습</h2>
        
        <div className="category-selector">
          <label>카테고리 선택:</label>
          <select 
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} {category.subcategory ? `- ${category.subcategory}` : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="error">
          이 카테고리에 성어가 없습니다.
        </div>
        
        <button className="back-button" onClick={onBack}>
          학습 메뉴로 돌아가기
        </button>
      </div>
    );
  }
  
  // 현재 카테고리 정보 찾기
  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  
  return (
    <div className="idiom-learner">
      <h2>성어 학습</h2>
      
      <div className="category-selector">
        <label>카테고리 선택:</label>
        <select 
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} {category.subcategory ? `- ${category.subcategory}` : ''}
            </option>
          ))}
        </select>
        
        {currentCategory && currentCategory.subcategory && (
          <div className="subcategory-display">
            {currentCategory.subcategory}
          </div>
        )}
      </div>
      
      <div className="idiom-content">
        <IdiomCard idiom={currentIdiom} />
      </div>
      
      <div className="navigation-buttons">
        <button onClick={handlePrevious} disabled={currentIndex === 0}>
          이전
        </button>
        <div className="progress">
          {currentIndex + 1} / {idiomList.length}
        </div>
        <button onClick={handleNext} disabled={currentIndex === idiomList.length - 1}>
          다음
        </button>
      </div>
      
      <button className="back-button" onClick={onBack}>
        학습 메뉴로 돌아가기
      </button>
    </div>
  );
}

export default IdiomLearner;