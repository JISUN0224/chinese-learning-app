import React, { useState, useEffect } from 'react';
import './IdiomLearningHome.css';
import { getIdiomCategories } from '../../services/idiomService';

function IdiomLearningHome({ onSelectCategory, onBackToHome }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 카테고리 로드
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const categoryData = await getIdiomCategories();
        
        // 카테고리 이름을 기반으로 그룹화된 객체 생성
        const groupedCategories = {};
        categoryData.forEach(category => {
          const name = category.name?.trim() || '';
          if (name && !groupedCategories[name]) {
            groupedCategories[name] = {
              id: category.id,
              name: name,
              description: category.description || `${name} 관련 성어`,
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
              id: 'satire',
              name: '풍자·비유',
              description: '풍자나 비유를 담은 성어',
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
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error loading idiom categories:', error);
        // 오류 시 기본 카테고리로 대체
        setCategories([
          {
            id: 'default',
            name: '기본 성어',
            description: '대표적인 중국어 성어 모음',
            wordCount: 30
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleSelectCategory = (category) => {
    onSelectCategory(category);
  };
  
  if (isLoading) {
    return <div className="loading">성어 카테고리를 불러오는 중...</div>;
  }
  
  return (
    <div className="idiom-learning-home">
      <div className="home-header">
        <button className="back-button" onClick={onBackToHome}>
          ← 홈으로 돌아가기
        </button>
        <h2 className="page-title">🏮 성어 학습</h2>
      </div>
      
      <div className="idiom-categories">
        <h3 className="category-title">🟥 성어 카테고리</h3>
        <div className="category-cards">
          {categories.map(category => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => handleSelectCategory(category)}
            >
              <h4>{category.name}</h4>
              <p>{category.description}</p>
              <span className="word-count">{category.wordCount}개 성어</span>
            </div>
          ))}
          
          {/* 즐겨찾기 카테고리 추가 */}
          <div 
            className="category-card favorites-card"
            onClick={() => handleSelectCategory({ id: 'favorites', name: '즐겨찾기', description: '저장한 성어 모음' })}
          >
            <h4>⭐ 즐겨찾기</h4>
            <p>내가 저장한 성어 모음</p>
            <span className="favorites-label">저장된 성어</span>
          </div>
        </div>
      </div>
      
      <div className="idiom-info">
        <h3>성어(成語)란?</h3>
        <p>
          성어는 문자 그대로 '이루어진 말'이라는 뜻으로, 일반적으로 4개의 한자로 이루어진 관용어구를 말합니다. 
          중국의 고사, 시가, 역사, 철학 등에서 유래되었으며, 간결한 표현 속에 깊은 의미를 담고 있습니다.
        </p>
        <p>
          성어(중국어로는 '청유(成語)')는 중국 문화의 정수를 담고 있으며, 다양한 상황에서 적절하게 사용할 수 있습니다.
          카테고리를 선택하여 다양한 성어를 학습해보세요!
        </p>
      </div>
    </div>
  );
}

export default IdiomLearningHome;