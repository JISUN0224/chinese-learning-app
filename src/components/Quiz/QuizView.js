import React, { useState, useEffect } from 'react';
import './QuizView.css';
import MultipleChoice from './MultipleChoice';
import FillInTheBlank from './FillInTheBlank';
import ContextQuiz from './ContextQuiz';
import ListeningQuiz from './ListeningQuiz';
import { generateQuizQuestions } from '../../services/quizService';

function QuizView({ vocabList, quizType = 'vocabulary', onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1); // 현재 난이도 (1, 2, 3)
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState(false); // 디버그 모드 (개발용)
  
  // 디버그 모드 토글 (개발 중 문제 확인용)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // 퀴즈 문제 생성
  useEffect(() => {
    console.log("vocabList received:", vocabList);
    if (!vocabList || vocabList.length === 0) {
      console.error("Empty vocabulary list in QuizView");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // 1초 뒤에 퀴즈 생성 (애니메이션 지연을 위해)
      setTimeout(() => {
        const quizQuestions = generateQuizQuestions(vocabList, quizType);
        console.log("Generated quiz questions:", quizQuestions);
        
        if (quizQuestions.length === 0) {
          console.error("No quiz questions were generated");
          setLoading(false);
          return;
        }
        
        setQuestions(quizQuestions);
        setUserAnswers(new Array(quizQuestions.length).fill(null));
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error generating quiz questions:", error);
      setLoading(false);
    }
  }, [vocabList, quizType]);
  
  // 현재 난이도 확인
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      setCurrentLevel(currentQuestion.levelIndex || 1);
    }
  }, [questions, currentQuestionIndex]);
  
  // 답변 제출
  const handleSubmitAnswer = (answer) => {
    // 현재 질문에 대한 답변 저장
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newUserAnswers);
    
    // 정답 여부 확인
    const currentQuestion = questions[currentQuestionIndex];
    if (answer === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    
    // 다음 질문으로 이동 또는 완료
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
    }
  };
  
  // 난이도별 점수 계산 함수
  const calculateLevelStats = () => {
    const levelStats = {
      // 각 난이도별 기본값
      1: { total: 0, correct: 0 },
      2: { total: 0, correct: 0 },
      3: { total: 0, correct: 0 }
    };
    
    // 각 문제별로 난이도 그룹화하여 계산
    questions.forEach((question, index) => {
      const levelIndex = question.levelIndex || 1;
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      levelStats[levelIndex].total += 1;
      if (isCorrect) {
        levelStats[levelIndex].correct += 1;
      }
    });
    
    return levelStats;
  };
  
  // 퀴즈 결과 표시
  if (isComplete) {
    const successRate = Math.round((score / questions.length) * 100);
    const levelStats = calculateLevelStats();
    
    return (
      <div className="quiz-view">
        <div className="quiz-complete">
          <h2>퀴즈 완료!</h2>
          
          <div className="quiz-results">
            <div className="score-display">
              <div className="score-circle">
                <span className="score-number">{score}</span>
                <span className="score-total">/{questions.length}</span>
              </div>
              <p className="score-percentage">{successRate}% 정답률</p>
            </div>
            
            <div className="result-message">
              {successRate >= 80 ? (
                <p>훌륭합니다! 이 단어들을 잘 이해하고 있습니다.</p>
              ) : successRate >= 60 ? (
                <p>좋은 결과입니다! 더 연습하면 더 좋아질 거예요.</p>
              ) : (
                <p>좀 더 연습이 필요합니다. 단어를 다시 복습해보세요.</p>
              )}
            </div>
          </div>
          
          <div className="level-breakdown">
            <h3>단계별 성적</h3>
            <div className="level-stats">
              {[1, 2, 3].map(level => {
                const stats = levelStats[level];
                const levelPercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                
                return (
                  <div key={level} className="level-stat">
                    <div className="level-name">
                      {level === 1 ? '기본 (1단계)' : level === 2 ? '중급 (2단계)' : '고급 (3단계)'}
                    </div>
                    <div className="level-score">
                      {stats.correct}/{stats.total} ({levelPercentage}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="action-buttons">
            <button onClick={onFinish}>
              학습메뉴로 돌아가기
            </button>
          </div>
          
          {/* 디버그 정보 (Ctrl+Shift+D로 토글) */}
          {debug && (
            <div className="debug-info">
              <h4>디버그 정보</h4>
              <div>총 문제 수: {questions.length}</div>
              <div>정답 수: {score}</div>
              <div>
                레벨별 문제 분포: 
                {[1, 2, 3].map(level => (
                  <span key={level}> {level}단계: {questions.filter(q => q.levelIndex === level).length}개</span>
                ))}
              </div>
              <div>사용자 답변: {userAnswers.join(', ')}</div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // 로딩 중
  if (loading) {
    return (
      <div className="quiz-view">
        <div className="loading">퀴즈 문제를 준비하는 중...</div>
      </div>
    );
  }
  
  // 현재 문제 표시
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="quiz-view">
        <div className="loading">문제를 불러올 수 없습니다.</div>
        <button onClick={onFinish} className="back-button">
          학습메뉴로 돌아가기
        </button>
      </div>
    );
  }
  
  // 현재 난이도의 질문 수
  const currentLevelQuestions = questions.filter(q => q.levelIndex === currentLevel);
  const currentLevelQuestionIndex = currentLevelQuestions.findIndex(q => 
    q.questionNumber === currentQuestion.questionNumber
  );
  
  return (
    <div className="quiz-view">
      <div className="quiz-header">
        <button className="back-button" onClick={onFinish}>
          ← 학습메뉴로 돌아가기
        </button>
        
        <div className="quiz-progress">
          <div className="quiz-progress-text">
            전체: {currentQuestionIndex + 1} / {questions.length} 문제
          </div>
          <div className="quiz-progress-bar">
            <div 
              className="quiz-progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="level-indicator">
        <div className={`level-badge level-badge-${currentLevel}`}>
          {currentQuestion.levelDisplay || `${currentLevel}단계`}
        </div>
        <div className="level-progress">
          문제 {currentLevelQuestionIndex + 1} / {currentLevelQuestions.length}
        </div>
      </div>
      
      <div className="question-container">
        {/* 문제 유형에 따른 컴포넌트 렌더링 */}
        {currentQuestion.questionType === 'word-to-meaning' || currentQuestion.questionType === 'meaning-to-word' ? (
          <MultipleChoice 
            question={currentQuestion}
            onAnswer={handleSubmitAnswer}
          />
        ) : currentQuestion.questionType === 'fill-in-blank' ? (
          <FillInTheBlank 
            question={currentQuestion}
            onAnswer={handleSubmitAnswer}
          />
        ) : currentQuestion.questionType === 'context-sentence' ? (
          <ContextQuiz 
            question={currentQuestion}
            onAnswer={handleSubmitAnswer}
          />
        ) : (currentQuestion.questionType === 'listening' || currentQuestion.questionType === 'sentence-listening') ? (
          <ListeningQuiz 
            question={currentQuestion}
            onAnswer={handleSubmitAnswer}
          />
        ) : (
          <div className="error">
            지원하지 않는 문제 유형입니다: {currentQuestion.questionType}
          </div>
        )}
      </div>
      
      {/* 디버그 정보 (Ctrl+Shift+D로 토글) */}
      {debug && (
        <div className="debug-panel">
          <h4>현재 문제 디버그 정보</h4>
          <pre>{JSON.stringify(currentQuestion, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default QuizView;