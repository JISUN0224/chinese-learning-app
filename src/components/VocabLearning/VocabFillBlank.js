import React, { useState } from 'react';
import './VocabFillBlank.css';

function VocabFillBlank({ question, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };
  
  const handleSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    
    setTimeout(() => {
      onAnswer(selectedOption);
      setSelectedOption(null);
      setIsAnswered(false);
    }, 1000);
  };
  
  return (
    <div className="vocab-fill-blank">
      <h2 className="question-text">{question.questionText}</h2>
      
      <div className="sentence-context">
        <div className="chinese-sentence">
          {question.context.before}
          <span className="blank">______</span>
          {question.context.after}
        </div>
        
        {/* 한글 번역 표시 */}
        {question.koreanTranslation && (
          <div className="korean-translation">
            <span className="translation-label">의미:</span>
            <span className="translation-text">{question.koreanTranslation}</span>
          </div>
        )}
      </div>
      
      <div className="options-container">
        {question.options.map((option, index) => {
          let optionClass = "option";
          
          if (isAnswered) {
            if (option === question.correctAnswer) {
              optionClass += " correct";
            } else if (option === selectedOption) {
              optionClass += " incorrect";
            }
          } else if (option === selectedOption) {
            optionClass += " selected";
          }
          
          return (
            <div 
              key={index} 
              className={optionClass}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </div>
          );
        })}
      </div>
      
      <button 
        className={`submit-button ${selectedOption ? 'active' : 'disabled'}`}
        onClick={handleSubmit}
        disabled={selectedOption === null || isAnswered}
      >
        {isAnswered ? '정답 확인 중...' : '정답 확인'}
      </button>
    </div>
  );
}

export default VocabFillBlank;