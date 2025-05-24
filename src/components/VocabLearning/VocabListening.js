import React, { useState, useRef } from 'react';
import './VocabListening.css';

function VocabListening({ question, onAnswer }) {
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
    // 실제 오디오가 없으므로 TTS 사용 또는 텍스트만 표시
    if (question.audioText) {
      // 브라우저 TTS 사용
      const utterance = new SpeechSynthesisUtterance(question.audioText);
      utterance.lang = 'zh-CN'; // 중국어 설정
      utterance.rate = 0.8; // 조금 느리게
      
      setIsPlaying(true);
      speechSynthesis.speak(utterance);
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
    }
  };
  
  return (
    <div className="vocab-listening">
      <h2 className="question-text">{question.questionText}</h2>
      
      <div className="audio-player">
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayAudio}
          disabled={!question.audioText}
        >
          {isPlaying ? '재생 중...' : '🔊 듣기'}
        </button>
        
        <div className="audio-info">
          {question.subType === 'word' ? (
            <p>음성을 듣고 올바른 의미를 선택하세요</p>
          ) : (
            <div>
              <p>문장을 듣고 빈칸에 들어갈 단어를 선택하세요</p>
              {question.sentence && (
                <div className="sentence-display">
                  <div className="chinese-text">
                    {question.sentence.replace(question.vocab.simplified, '______')}
                  </div>
                  {question.koreanTranslation && (
                    <div className="korean-translation">
                      <span className="translation-label">의미:</span>
                      <span className="translation-text">{question.koreanTranslation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {!question.audioText && (
            <p className="error-message">오디오를 재생할 수 없습니다.</p>
          )}
        </div>
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

export default VocabListening;