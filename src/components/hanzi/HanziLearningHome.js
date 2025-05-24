import React, { useState, useEffect } from 'react';
import './HanziLearningHome.css';

function HanziLearningHome({ onSelectCategory }) {
  const [hanziData, setHanziData] = useState([]);
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 백그라운드에서 데이터 로딩
  useEffect(() => {
    loadHanziDataBackground();
  }, []);

  // 백그라운드에서 데이터 로딩
  const loadHanziDataBackground = async () => {
    try {
      console.log('백그라운드에서 GitHub 데이터 로딩 시작...');
      
      const response = await fetch('https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('GitHub 데이터 로딩 성공:', data.length, '개 항목');
      
      setHanziData(data);
      setError(null);
      
    } catch (error) {
      console.error('GitHub 데이터 로딩 실패:', error);
      setError(`GitHub 데이터 로딩 실패: ${error.message}`);
    }
  };

  // 큰 카테고리 선택 핸들러
  const handleMainCategorySelect = (categoryType) => {
    console.log('메인 카테고리 선택:', categoryType);
    onSelectCategory({
      type: 'main-category',
      categoryType,
      data: hanziData
    });
  };

  return (
    <div className="hanzi-learning-home">
      <div className="home-header">
        <h2 className="page-title">🈷️ 한자 학습</h2>
      </div>

      {/* 데이터 상태 알림 */}
      {error && (
        <div className="data-status">
          <p className="status-warning">
            ⚠️ 실시간 데이터 로딩 실패 - 기본 기능으로 학습 가능
          </p>
        </div>
      )}

      {!error && hanziData.length > 0 && (
        <div className="data-status">
          <p className="status-success">
            ✅ 최신 데이터 ({hanziData.length}개 단어) 로딩 완료
          </p>
        </div>
      )}

      {/* 메인 카테고리 3개만 표시 */}
      <div className="main-categories">
        {/* 급수별 학습 */}
        <div 
          className="main-category-card level-category"
          onClick={() => handleMainCategorySelect('level')}
        >
          <div className="category-icon">🟦</div>
          <h3>급수별 학습</h3>
          <p>HSK 급수에 따른 한자 학습</p>
          <div className="category-arrow">→</div>
        </div>

        {/* 부수별 학습 */}
        <div 
          className="main-category-card radical-category"
          onClick={() => handleMainCategorySelect('radical')}
        >
          <div className="category-icon">🟨</div>
          <h3>부수별 학습</h3>
          <p>동일 부수를 가진 한자 학습</p>
          <div className="category-arrow">→</div>
        </div>

        {/* 빈도순 학습 */}
        <div 
          className="main-category-card frequency-category"
          onClick={() => handleMainCategorySelect('frequency')}
        >
          <div className="category-icon">🟥</div>
          <h3>빈도순 한자</h3>
          <p>사용 빈도 기준 한자 학습</p>
          <div className="category-arrow">→</div>
        </div>
      </div>

      <div className="hanzi-info">
        <h3>한자 학습 안내</h3>
        <p>
          한자는 중국어 학습의 기초입니다. 급수별, 부수별, 품사별, 빈도순으로 체계적으로 학습할 수 있습니다.
        </p>
        <p>
          원하는 학습 방법을 선택하여 해당 한자들의 획순, 의미, 용법을 익혀보세요.
        </p>
        {error && (
          <p className="offline-note">
            <strong>참고:</strong> 현재 오프라인 모드로 기본 기능을 제공하고 있습니다. 
            인터넷 연결을 확인하시면 더 정확한 데이터를 이용할 수 있습니다.
          </p>
        )}
      </div>
    </div>
  );
}

export default HanziLearningHome;