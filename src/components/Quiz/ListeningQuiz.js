import React, { useState, useRef } from 'react';
import './ListeningQuiz.css';

function ListeningQuiz({ question, onAnswer }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
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
  
  const handlePlayAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // 오디오 재생이 끝나면 상태 업데이트
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
  return (
    <div className="listening-quiz">
      <h2 className="question-text">{question.questionText}</h2>
      
      <div className="audio-player">
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayAudio}
        >
          {isPlaying ? '일시정지' : '듣기'}
        </button>
        
        {question.audioUrl && (
          <audio 
            ref={audioRef}
            src={question.audioUrl}
            onEnded={handleAudioEnded}
          />
        )}
        
        {!question.audioUrl && (
          <div className="error-message">
            오디오 파일을 불러올 수 없습니다.
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

export default ListeningQuiz;