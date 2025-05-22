import React, { useState, useEffect } from 'react';
import './HanziSubCategoryView.css';
import HanziCategoryView from './HanziCategoryView';

function HanziSubCategoryView({ categoryType, data, onBackToHome }) {
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSubCategories();
  }, [categoryType, data]);

  const generateSubCategories = () => {
    setLoading(true);
    
    let categories = [];
    
    switch (categoryType) {
      case 'level':
        categories = generateLevelCategories();
        break;
      case 'radical':
        categories = generateRadicalCategories();
        break;
      case 'frequency':
        categories = generateFrequencyCategories();
        break;
      default:
        categories = [];
    }
    
    setSubCategories(categories);
    setLoading(false);
  };

  const generateLevelCategories = () => {
    if (data && data.length > 0) {
      const levelMap = new Map();
      
      data.forEach(item => {
        if (item.level && Array.isArray(item.level)) {
          item.level.forEach(level => {
            if (!levelMap.has(level)) {
              levelMap.set(level, {
                id: level,
                name: getLevelName(level),
                description: `${getLevelName(level)} 필수 한자`,
                count: 0
              });
            }
            levelMap.get(level).count++;
          });
        }
      });
      
      return Array.from(levelMap.values()).sort((a, b) => a.id.localeCompare(b.id));
    }
    
    // 기본 카테고리
    return [
      { id: 'new-1', name: '신HSK 1급', description: '신HSK 1급 필수 한자', count: 174 },
      { id: 'new-2', name: '신HSK 2급', description: '신HSK 2급 필수 한자', count: 347 },
      { id: 'new-3', name: '신HSK 3급', description: '신HSK 3급 필수 한자', count: 617 },
      { id: 'new-4', name: '신HSK 4급', description: '신HSK 4급 필수 한자', count: 1064 },
      { id: 'new-5', name: '신HSK 5급', description: '신HSK 5급 필수 한자', count: 1685 },
      { id: 'new-6', name: '신HSK 6급', description: '신HSK 6급 필수 한자', count: 2663 }
    ];
  };

  const generateRadicalCategories = () => {
    if (data && data.length > 0) {
      const radicalMap = new Map();
      
      data.forEach(item => {
        if (item.radical) {
          const radical = item.radical;
          if (!radicalMap.has(radical)) {
            radicalMap.set(radical, {
              id: radical,
              name: `${radical} 부수`,
              description: `${radical} 부수를 가진 한자`,
              count: 0
            });
          }
          radicalMap.get(radical).count++;
        }
      });
      
      return Array.from(radicalMap.values()).sort((a, b) => b.count - a.count).slice(0, 20);
    }
    
    // 기본 카테고리
    return [
      { id: '人', name: '人 부수', description: '人 부수를 가진 한자', count: 156 },
      { id: '口', name: '口 부수', description: '口 부수를 가진 한자', count: 234 },
      { id: '水', name: '水 부수', description: '水 부수를 가진 한자', count: 189 },
      { id: '木', name: '木 부수', description: '木 부수를 가진 한자', count: 167 },
      { id: '手', name: '手 부수', description: '手 부수를 가진 한자', count: 145 },
      { id: '心', name: '心 부수', description: '心 부수를 가진 한자', count: 128 },
      { id: '火', name: '火 부수', description: '火 부수를 가진 한자', count: 112 },
      { id: '土', name: '土 부수', description: '土 부수를 가진 한자', count: 98 }
    ];
  };

  const generateFrequencyCategories = () => {
    // 전체 데이터에서 한자 추출
    let totalHanziCount = 0;
    if (data && data.length > 0) {
      const hanziSet = new Set();
      data.forEach(item => {
        if (item.simplified) {
          Array.from(item.simplified).forEach(char => {
            if (/[\u4e00-\u9fff]/.test(char)) {
              hanziSet.add(char);
            }
          });
        }
      });
      totalHanziCount = hanziSet.size;
    }
    
    const top30Count = Math.floor(totalHanziCount * 0.3);
    const top60Count = Math.floor(totalHanziCount * 0.6);
    const othersCount = totalHanziCount - top60Count;
    
    return [
      { 
        id: 'top-30', 
        name: '상위 30%', 
        description: '가장 자주 사용되는 한자',
        count: top30Count || 300
      },
      { 
        id: 'top-60', 
        name: '상위 60%', 
        description: '중간 빈도의 한자',
        count: (top60Count - top30Count) || 600
      },
      { 
        id: 'others', 
        name: '기타', 
        description: '낮은 빈도의 한자',
        count: othersCount || 500
      }
    ];
  };

  const getLevelName = (level) => {
    const levelNames = {
      'new-1': '신HSK 1급', 'new-2': '신HSK 2급', 'new-3': '신HSK 3급',
      'new-4': '신HSK 4급', 'new-5': '신HSK 5급', 'new-6': '신HSK 6급',
      'new-7': '신HSK 7급', 'old-1': '구HSK 1급', 'old-2': '구HSK 2급',
      'old-3': '구HSK 3급', 'old-4': '구HSK 4급', 'old-5': '구HSK 5급',
      'old-6': '구HSK 6급'
    };
    return levelNames[level] || level;
  };

  const getCategoryTitle = () => {
    const titles = {
      'level': '급수별 학습',
      'radical': '부수별 학습', 
      'frequency': '빈도순 한자'
    };
    return titles[categoryType] || '한자 학습';
  };

  const getCategoryIcon = () => {
    const icons = {
      'level': '🟦',
      'radical': '🟨',
      'frequency': '🟥'
    };
    return icons[categoryType] || '📚';
  };

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory({
      type: categoryType,
      category: subCategory,
      data: data
    });
  };

  // 하위 카테고리가 선택되면 HanziCategoryView 표시
  if (selectedSubCategory) {
    return (
      <HanziCategoryView 
        categoryData={selectedSubCategory}
        onBackToHome={() => setSelectedSubCategory(null)}
      />
    );
  }

  return (
    <div className="hanzi-subcategory-view">
      <div className="subcategory-header">
        <button className="back-button" onClick={onBackToHome}>
          ← 한자 학습으로 돌아가기
        </button>
        <div className="category-title">
          <span className="category-icon">{getCategoryIcon()}</span>
          <h2>{getCategoryTitle()}</h2>
        </div>
      </div>

      <div className="subcategory-selector">
        <label htmlFor="subcategory-dropdown">세부 카테고리 선택:</label>
        <select 
          id="subcategory-dropdown"
          onChange={(e) => {
            const selected = subCategories.find(cat => cat.id === e.target.value);
            if (selected) handleSubCategorySelect(selected);
          }}
          defaultValue=""
        >
          <option value="" disabled>카테고리를 선택하세요</option>
          {subCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.count}자)
            </option>
          ))}
        </select>
      </div>

      <div className="subcategory-grid">
        {subCategories.map(category => (
          <div 
            key={category.id}
            className={`subcategory-card ${categoryType}-card`}
            onClick={() => handleSubCategorySelect(category)}
          >
            <h4>{category.name}</h4>
            <p>{category.description}</p>
            <span className="word-count">{category.count}자</span>
          </div>
        ))}
      </div>

      <div className="category-info">
        <h3>{getCategoryTitle()} 안내</h3>
        <p>
          위에서 원하는 세부 카테고리를 선택하여 한자 학습을 시작하세요. 
          드롭다운 메뉴나 카드를 클릭하여 선택할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default HanziSubCategoryView;