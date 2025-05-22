import React, { useState } from 'react';
import './ContextQuiz.css';

function ContextQuiz({ question, onAnswer }) {
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
  
  // 문맥 문장이 없는 경우 대체 표시
  if (!question.context || (!question.context.sentence && !question.context.translation)) {
    return (
      <div className="context-quiz">
        <h2 className="question-text">{question.questionText}</h2>
        <div className="error-message">문맥 정보가 없습니다.</div>
        
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
  
  return (
    <div className="context-quiz">
      <h2 className="question-text">{question.questionText}</h2>
      
      <div className="context-container">
        <p className="context-chinese">{question.context.sentence}</p>
        <p className="context-translation">{question.context.translation}</p>
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

export default ContextQuiz;