import React, { useState, useEffect } from 'react';
import './HanziCategoryView.css';
import HanziLearner from './HanziLearner';

function HanziCategoryView({ categoryData, onBackToHome }) {
  const [filteredHanzi, setFilteredHanzi] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (categoryData) {
      console.log('카테고리 데이터 받음:', categoryData);
      filterHanziByCategory();
    } else {
      setError('카테고리 데이터가 없습니다.');
      setLoading(false);
    }
  }, [categoryData]);

  const filterHanziByCategory = () => {
    setLoading(true);
    setError(null);
    
    try {
      const { type, category, data } = categoryData;
      let filtered = [];

      console.log('필터링 시작:', { type, categoryId: category.id, dataLength: data?.length });

      if (!data || data.length === 0) {
        throw new Error('데이터가 없습니다.');
      }

      switch (type) {
        case 'level':
          filtered = data.filter(item => {
            if (Array.isArray(item.level)) {
              return item.level.includes(category.id);
            }
            return item.level === category.id;
          });
          console.log('레벨 필터링 결과:', filtered.length);
          break;
        case 'radical':
          filtered = data.filter(item => item.radical === category.id);
          console.log('부수 필터링 결과:', filtered.length);
          break;
        case 'frequency':
          // 전체 한자 추출 및 빈도순 정렬
          const allHanzi = new Map();
          
          data.forEach(item => {
            if (item.simplified) {
              Array.from(item.simplified).forEach(char => {
                if (/[\u4e00-\u9fff]/.test(char)) {
                  if (!allHanzi.has(char) || (item.frequency && item.frequency < allHanzi.get(char).frequency)) {
                    allHanzi.set(char, {
                      char: char,
                      frequency: item.frequency || 9999,
                      originalItem: item
                    });
                  }
                }
              });
            }
          });
          
          // 빈도순으로 정렬
          const sortedHanzi = Array.from(allHanzi.values()).sort((a, b) => a.frequency - b.frequency);
          const totalCount = sortedHanzi.length;
          
          let selectedHanzi = [];
          switch (category.id) {
            case 'top-30':
              selectedHanzi = sortedHanzi.slice(0, Math.floor(totalCount * 0.3));
              break;
            case 'top-60':
              selectedHanzi = sortedHanzi.slice(Math.floor(totalCount * 0.3), Math.floor(totalCount * 0.6));
              break;
            case 'others':
              selectedHanzi = sortedHanzi.slice(Math.floor(totalCount * 0.6));
              break;
            default:
              selectedHanzi = sortedHanzi;
          }
          
          filtered = selectedHanzi.map(hanziData => hanziData.originalItem);
          console.log('빈도 필터링 결과:', filtered.length, '/ 전체:', totalCount);
          break;
        default:
          filtered = data;
      }

      // 한자만 추출 (중복 제거)
      const hanziSet = new Set();
      const hanziList = [];

      filtered.forEach(item => {
        if (item.simplified) {
          // 개별 한자 추출
          Array.from(item.simplified).forEach((char, index) => {
            if (!hanziSet.has(char) && /[\u4e00-\u9fff]/.test(char)) {
              hanziSet.add(char);
              
              // GitHub HSK 데이터 구조에 맞게 한자 객체 생성
              hanziList.push({
                id: `hanzi_${char}`,
                simplified: char,
                level: item.level,
                radical: item.radical,
                pos: item.pos,
                frequency: item.frequency,
                forms: [{
                  traditional: item.forms && item.forms[0] && item.forms[0].traditional 
                    ? item.forms[0].traditional.charAt(index) || item.forms[0].traditional.charAt(0)
                    : char,
                  transcriptions: {
                    pinyin: item.forms && item.forms[0] && item.forms[0].transcriptions && item.forms[0].transcriptions.pinyin
                      ? item.forms[0].transcriptions.pinyin.split(' ')[index] || item.forms[0].transcriptions.pinyin.split(' ')[0]
                      : ''
                  },
                  meanings: item.forms && item.forms[0] && item.forms[0].meanings
                    ? item.forms[0].meanings.slice(0, 2)
                    : ['의미 없음']
                }]
              });
            }
          });
        }
      });

      console.log('최종 한자 목록:', hanziList.length);
      console.log('첫 번째 한자 예시:', hanziList[0]);

      if (hanziList.length === 0) {
        throw new Error('해당 카테고리에 한자가 없습니다.');
      }

      setFilteredHanzi(hanziList);
      setCurrentIndex(0);
      setLoading(false);
    } catch (err) {
      console.error('한자 필터링 오류:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hanzi-category-view">
        <div className="category-header">
          <button onClick={onBackToHome} className="back-button">
            ← 한자 학습으로 돌아가기
          </button>
          <div className="category-info">
            <h2>{categoryData?.category?.name || '카테고리'}</h2>
          </div>
        </div>
        <div className="loading">한자를 분류하는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hanzi-category-view">
        <div className="category-header">
          <button onClick={onBackToHome} className="back-button">
            ← 한자 학습으로 돌아가기
          </button>
          <div className="category-info">
            <h2>{categoryData?.category?.name || '카테고리'}</h2>
          </div>
        </div>
        <div className="error-message">
          <h3>오류 발생</h3>
          <p>{error}</p>
          <button onClick={() => filterHanziByCategory()} className="retry-button">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (filteredHanzi.length === 0) {
    return (
      <div className="hanzi-category-view">
        <div className="category-header">
          <button onClick={onBackToHome} className="back-button">
            ← 한자 학습으로 돌아가기
          </button>
          <div className="category-info">
            <h2>{categoryData?.category?.name || '카테고리'}</h2>
          </div>
        </div>
        <div className="no-data">
          <h3>해당 카테고리에 한자가 없습니다.</h3>
          <button onClick={onBackToHome} className="back-button">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hanzi-category-view">
      <div className="category-header">
        <button onClick={onBackToHome} className="back-button">
          ← 한자 학습으로 돌아가기
        </button>
        <div className="category-info">
          <h2>{categoryData.category.name}</h2>
          <p>총 {filteredHanzi.length}개 한자</p>
        </div>
      </div>

      <HanziLearner 
        hanziList={filteredHanzi}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
    </div>
  );
}

export default HanziCategoryView;