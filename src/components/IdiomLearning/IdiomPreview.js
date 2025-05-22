import React from 'react';
import './IdiomPreview.css';

function IdiomPreview({ idiomList, onStartLearning, categoryName }) {
  if (!idiomList || idiomList.length === 0) {
    return (
      <div className="idiom-preview-empty">
        <h3>학습할 성어가 없습니다</h3>
        <p>다른 카테고리를 선택해주세요.</p>
      </div>
    );
  }

  // sub_category가 "Na"가 아닌 것들만 필터링하여 카테고리 표시
  const validSubCategories = [...new Set(
    idiomList
      .filter(idiom => idiom.sub_category && idiom.sub_category !== "Na")
      .map(idiom => idiom.sub_category)
  )];
  
  return (
    <div className="idiom-preview">
      <div className="preview-header">
        <h3>학습할 성어 목록</h3>
        {categoryName && <p className="category-name">{categoryName}</p>}
        
        {/* sub_category 표시 (Na가 아닌 것들만) */}
        {validSubCategories.length > 0 && (
          <div className="subcategories">
            <h4>카테고리</h4>
            <div className="subcategory-tags">
              {validSubCategories.map((subCat, index) => (
                <span key={index} className="subcategory-tag">
                  {subCat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="idiom-list">
        {idiomList.map((idiom, index) => (
          <div key={index} className="idiom-item">
            <div className="idiom-chinese">{idiom.chengyu}</div>
            <div className="idiom-pinyin">{idiom.pinyin}</div>
            <div className="idiom-meaning">{idiom.definition}</div>
            {idiom.sub_category && idiom.sub_category !== "Na" && (
              <div className="idiom-subcategory">{idiom.sub_category}</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="preview-actions">
        <p>위 {idiomList.length}개의 성어를 학습합니다.</p>
        <button 
          className="start-learning-button"
          onClick={onStartLearning}
        >
          학습 시작하기
        </button>
      </div>
    </div>
  );
}

export default IdiomPreview;