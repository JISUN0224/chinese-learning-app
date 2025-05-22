import React from 'react';
import './VocabPreview.css';

function VocabPreview({ vocabList, onStartLearning }) {
  if (!vocabList || vocabList.length === 0) {
    return (
      <div className="vocab-preview empty">
        <p>학습할 단어가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="vocab-preview">
      <h3>학습할 단어 미리보기</h3>
      <p className="preview-info">이번 단계에서 학습할 {vocabList.length}개의 단어를 확인하세요.</p>
      
      <div className="preview-list">
        {vocabList.map((vocab, index) => (
          <div key={index} className="preview-item">
            <div className="chinese">{vocab.simplified}</div>
            <div className="pinyin">{vocab.pinyin}</div>
            <div className="meaning">{vocab.meaning}</div>
          </div>
        ))}
      </div>
      
      <div className="preview-actions">
        <button className="start-learning-btn" onClick={onStartLearning}>
          학습 시작하기
        </button>
      </div>
    </div>
  );
}

export default VocabPreview;