import React, { useState } from 'react';
import './MultipleChoice.css';

function MultipleChoice({ question, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const handleOptionSelect = (option) => {
    if (isAnswered) return; // 이미 답변을 제출한 경우 추가 선택 방지
    
    setSelectedOption(option);
  };
  
  const handleSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    
    setIsAnswered(true);
    
    // 애니메이션을 위한 지연 후 다음 문제로 이동
    setTimeout(() => {
      onAnswer(selectedOption);
      setSelectedOption(null);
      setIsAnswered(false);
    }, 1000);
  };
  
  return (
    <div className="multiple-choice">
      <h2 className="question-text">{question.questionText}</h2>
      
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

export default MultipleChoice;