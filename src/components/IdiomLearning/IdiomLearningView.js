import React, { useState, useEffect } from 'react';
import { loadIdiomData, getIdiomSubCategories, getIdiomsBySubCategory } from '../../services/idiomService';
import IdiomFlashCard from './IdiomFlashCard';
import ProgressIndicator from './ProgressIndicator';
import './IdiomLearningView.css';

// 특정 메인 카테고리 내의 서브카테고리 목록을 가져오는 함수
const getIdiomSubCategoriesForMainCategory = (mainCategoryId, idiomData) => {
  const subCategories = new Map();
  
  idiomData.forEach(idiom => {
    if (idiom.category === mainCategoryId && idiom.sub_category && idiom.sub_category !== 'Na') {
      const subCategoryId = idiom.sub_category;
      if (!subCategories.has(subCategoryId)) {
        subCategories.set(subCategoryId, {
          id: subCategoryId,
          name: subCategoryId,
          wordCount: 1
        });
      } else {
        const subCategory = subCategories.get(subCategoryId);
        subCategory.wordCount++;
      }
    }
  });
  
  return Array.from(subCategories.values()).sort((a, b) => b.wordCount - a.wordCount);
};

// 한 번에 학습할 성어 수
const IDIOMS_PER_BATCH = 10;

function IdiomLearningView({ selectedCategory, onBackToHome }) {
  const [allIdioms, setAllIdioms] = useState([]);
  const [filteredIdioms, setFilteredIdioms] = useState([]);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [batchIndex, setBatchIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('learning'); // 바로 학습 모드로 시작
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [subCategories, setSubCategories] = useState([]);
  
  // 성어 데이터 로드
  useEffect(() => {
    const fetchIdioms = async () => {
      try {
        setIsLoading(true);
        
        // 선택된 카테고리가 있으면 해당 카테고리의 성어만 로드
        if (selectedCategory && selectedCategory.id) {
          console.log('선택된 카테고리 전체 정보:', selectedCategory);
          console.log('카테고리 ID:', selectedCategory.id);
          console.log('카테고리 이름:', selectedCategory.name);
          console.log('카테고리 타입:', typeof selectedCategory.id);
          console.log('JSON.stringify(selectedCategory):', JSON.stringify(selectedCategory));
          
          const data = await getIdiomsBySubCategory(selectedCategory.id);
          console.log('로드된 성어 개수:', data.length);
          console.log('첫 번째 성어 샘플:', data.length > 0 ? data[0] : 'No data');
          
          setAllIdioms(data);
          setFilteredIdioms(data);
          
          // 첫 번째 배치 설정
          const firstBatch = data.slice(0, IDIOMS_PER_BATCH);
          console.log('첫 번째 배치 설정:', firstBatch.length, '개');
          console.log('첫 번째 배치 내용:', firstBatch);
          setCurrentBatch(firstBatch);
          setBatchIndex(0);
          setCurrentCardIndex(0);
          
          // sub_category 목록 추출 (선택된 메인 카테고리 내의 서브카테고리만)
          const subCategoryData = getIdiomSubCategoriesForMainCategory(selectedCategory.id, data);
          setSubCategories(subCategoryData);
          
          // 서브카테고리를 'all'로 초기화
          setSelectedSubCategory('all');
        } else {
          // 전체 데이터 로드
          const data = await loadIdiomData();
          setAllIdioms(data);
          
          // sub_category 목록 추출
          const subCategoryData = getIdiomSubCategories();
          setSubCategories(subCategoryData);
          
          // 초기에는 모든 데이터를 표시
          setFilteredIdioms(data);
          
          // 첫 번째 배치 설정
          const firstBatch = data.slice(0, IDIOMS_PER_BATCH);
          setCurrentBatch(firstBatch);
          setBatchIndex(0);
          setCurrentCardIndex(0);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('성어 데이터 로드 오류:', error);
        setError('성어 데이터를 불러올 수 없습니다.');
        setIsLoading(false);
      }
    };
    
    fetchIdioms();
  }, [selectedCategory]);
  
  // sub_category 변경 시 필터링 (선택된 메인 카테고리가 있을 때만)
  useEffect(() => {
    if (!selectedCategory) {
      // 메인 카테고리가 선택되지 않은 경우 (전체 성어 보기 모드)
      if (selectedSubCategory === 'all') {
        setFilteredIdioms(allIdioms);
      } else {
        const filtered = allIdioms.filter(idiom => idiom.sub_category === selectedSubCategory);
        setFilteredIdioms(filtered);
      }
    } else {
      // 메인 카테고리가 선택된 경우
      if (selectedSubCategory === 'all') {
        // 해당 메인 카테고리의 모든 성어 표시
        setFilteredIdioms(allIdioms);
      } else {
        // 해당 메인 카테고리 내의 특정 서브카테고리만 필터링
        const filtered = allIdioms.filter(idiom => 
          idiom.category === selectedCategory.id && idiom.sub_category === selectedSubCategory
        );
        setFilteredIdioms(filtered);
      }
    }
    
    // 새로 필터된 데이터로 첫 번째 배치 설정
    const newData = !selectedCategory ? 
      (selectedSubCategory === 'all' ? allIdioms : allIdioms.filter(idiom => idiom.sub_category === selectedSubCategory)) :
      (selectedSubCategory === 'all' ? allIdioms : allIdioms.filter(idiom => 
        idiom.category === selectedCategory.id && idiom.sub_category === selectedSubCategory
      ));
    
    const firstBatch = newData.slice(0, IDIOMS_PER_BATCH);
    setCurrentBatch(firstBatch);
    setBatchIndex(0);
    setCurrentCardIndex(0);
  }, [selectedSubCategory, allIdioms, selectedCategory]);
  
  // 다음 카드로 이동
  const goToNextCard = () => {
    if (currentCardIndex < currentBatch.length - 1) {
      // 현재 배치 내에서 다음 카드로 이동
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // 현재 배치의 마지막 카드인 경우
      setViewMode('complete');
    }
  };
  
  // 이전 카드로 이동
  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };
  
  // 다음 배치로 이동
  const goToNextBatch = () => {
    const nextBatchIndex = batchIndex + 1;
    const startIndex = nextBatchIndex * IDIOMS_PER_BATCH;
    
    if (startIndex < filteredIdioms.length) {
      const nextBatch = filteredIdioms.slice(startIndex, startIndex + IDIOMS_PER_BATCH);
      setCurrentBatch(nextBatch);
      setBatchIndex(nextBatchIndex);
      setCurrentCardIndex(0);
      setViewMode('learning');
    } else {
      // 모든 성어 학습 완료
      alert("모든 성어를 학습했습니다!");
      setViewMode('learning');
      setBatchIndex(0);
      setCurrentCardIndex(0);
      const firstBatch = filteredIdioms.slice(0, IDIOMS_PER_BATCH);
      setCurrentBatch(firstBatch);
    }
  };
  
  // 카테고리 변경 핸들러
  const handleCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
  };
  
  if (isLoading) {
    console.log('로딩 중 상태');
    return <div className="loading">성어 데이터를 불러오는 중...</div>;
  }
  
  if (error) {
    console.log('에러 상태:', error);
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={onBackToHome} className="back-button">홈으로 돌아가기</button>
      </div>
    );
  }
  
  console.log('렌더링 시점 상태:');
  console.log('- viewMode:', viewMode);
  console.log('- currentBatch.length:', currentBatch.length);
  console.log('- filteredIdioms.length:', filteredIdioms.length);
  console.log('- isLoading:', isLoading);
  console.log('- currentBatch:', currentBatch);
  
  return (
    <div className="idiom-learning-view">
      <div className="learning-header">
        <button className="back-button" onClick={onBackToHome}>
          ← 홈으로
        </button>
        
        <div className="learning-info">
          <h2>🏮 성어 학습</h2>
          {selectedCategory && (
            <p>{selectedCategory.name} - {selectedCategory.description}</p>
          )}
          {filteredIdioms.length > 0 && (
            <p>배치 {batchIndex + 1}/{Math.ceil(filteredIdioms.length / IDIOMS_PER_BATCH)}</p>
          )}
        </div>
      </div>
      
      {/* 선택된 카테고리가 있을 때 Sub Category 선택 표시 */}
      {selectedCategory && (
        <div className="category-selector">
          <label htmlFor="category">서브 카테고리 선택:</label>
          <select 
            id="category" 
            value={selectedSubCategory} 
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="all">전체 성어</option>
            {subCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.wordCount}개)</option>
            ))}
          </select>
          <span className="idiom-count">
            ({filteredIdioms.length}개 성어)
          </span>
        </div>
      )}
      
      {/* 전체 성어 보기 모드일 때 Sub Category 선택 표시 */}
      {!selectedCategory && (
        <div className="category-selector">
          <label htmlFor="category">서브 카테고리 선택:</label>
          <select 
            id="category" 
            value={selectedSubCategory} 
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="all">전체 성어</option>
            {subCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <span className="idiom-count">
            ({filteredIdioms.length}개 성어)
          </span>
        </div>
      )}
      
      {viewMode === 'learning' && currentBatch && currentBatch.length > 0 && (
        <>
          <div className="cards-progress">
            <ProgressIndicator 
              current={currentCardIndex + 1} 
              total={currentBatch.length}
            />
          </div>
          
          <div className="flashcard-container">
            <IdiomFlashCard 
              idiom={currentBatch[currentCardIndex]} 
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
          <p>{currentBatch.length}개 성어를 학습했습니다.</p>
          <div className="action-buttons">
            <button className="next-batch-button" onClick={goToNextBatch}>
              다음 배치 학습하기
            </button>
          </div>
        </div>
      )}
      
      {filteredIdioms.length === 0 && !isLoading && (
        <div className="no-data">
          <p>선택한 카테고리에 성어가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default IdiomLearningView;