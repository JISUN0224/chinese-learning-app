import React, { useState } from 'react';
import './FillInTheBlank.css';

function FillInTheBlank({ question, onAnswer }) {
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleInputChange = (e) => {
    if (isAnswered) return; // 이미 답변을 제출한 경우 추가 입력 방지
    
    setUserInput(e.target.value);
  };
  
  const handleSubmit = () => {
    if (userInput.trim() === '' || isAnswered) return;
    
    setIsAnswered(true);
    
    // 정답 확인
    const correct = userInput.trim() === question.correctAnswer;
    setIsCorrect(correct);
    
    // 애니메이션을 위한 지연 후 다음 문제로 이동
    setTimeout(() => {
      onAnswer(userInput);
      setUserInput('');
      setIsAnswered(false);
      setIsCorrect(false);
    }, 1500);
  };
  
  // 엔터 키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <div className="fill-in-blank">
      <h2 className="question-text">{question.questionText}</h2>
      
      {question.context && (
        <div className="sentence-context">
          {question.context.before}
          <span className="blank">______</span>
          {question.context.after}
        </div>
      )}
      
      <div className="input-container">
        <input
          type="text"
          className={`answer-input ${isAnswered ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
          placeholder="답을 입력하세요"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isAnswered}
        />
        
        {isAnswered && (
          <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? '정답입니다!' : `정답은 "${question.correctAnswer}" 입니다.`}
          </div>
        )}
      </div>
      
      <button 
        className={`submit-button ${userInput.trim() !== '' ? 'active' : 'disabled'}`}
        onClick={handleSubmit}
        disabled={userInput.trim() === '' || isAnswered}
      >
        {isAnswered ? '다음 문제로...' : '정답 확인'}
      </button>
    </div>
  );
}

export default FillInTheBlank;