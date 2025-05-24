import React, { useState, useEffect } from 'react';
import './VocabQuiz.css';
import VocabMultipleChoice from './VocabMultipleChoice';
import VocabFillBlank from './VocabFillBlank';
import VocabListening from './VocabListening';

function VocabQuiz({ vocabularyData, onFinish, onContinue }) {
  const [currentLevel, setCurrentLevel] = useState(1); // 1: 초급, 2: 중급, 3: 고급
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState({ level1: 0, level2: 0, level3: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // 퀴즈 문제 생성
  useEffect(() => {
    if (!vocabularyData || vocabularyData.length === 0) {
      setLoading(false);
      return;
    }

    generateQuestions();
    setLoading(false);
  }, [vocabularyData]);

  // 현재 레벨 추적
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      setCurrentLevel(currentQuestion.level);
    }
  }, [currentQuestionIndex, questions]);

  // 각 단계별 3문제씩 총 9문제 생성 (6개 어휘에서 중복 사용)
  const generateQuestions = () => {
    const allQuestions = [];
    
    // 단어를 랜덤하게 섞기
    const shuffledVocab = [...vocabularyData].sort(() => 0.5 - Math.random());
    
    // 6개 어휘로 9문제를 만들기 위해 중복 사용
    const getVocabForQuestion = (questionIndex) => {
      return shuffledVocab[questionIndex % shuffledVocab.length];
    };
    
    // 각 단계별로 3문제씩 생성
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 3; i++) {
        const questionIndex = (level - 1) * 3 + i;
        const vocab = getVocabForQuestion(questionIndex);
        let question;
        
        switch (level) {
          case 1: // 초급: 뜻 맞추기 (선택형)
            question = generateMultipleChoiceQuestion(vocab, shuffledVocab, level);
            break;
          case 2: // 중급: 빈칸 맞추기
            question = generateFillBlankQuestion(vocab, level);
            break;
          case 3: // 고급: 듣기 퀴즈
            question = generateListeningQuestion(vocab, shuffledVocab, level);
            break;
          default:
            question = generateMultipleChoiceQuestion(vocab, shuffledVocab, level);
        }
        
        allQuestions.push(question);
      }
    }
    
    console.log('생성된 퀴즈 문제들:', allQuestions);
    setQuestions(allQuestions);
    setUserAnswers(new Array(allQuestions.length).fill(null));
  };

  // 뜻 맞추기 문제 생성 (초급)
  const generateMultipleChoiceQuestion = (vocab, allVocab, level) => {
    const correctAnswer = vocab.meaning;
    const options = [correctAnswer];
    
    // 오답 옵션 3개 추가
    const otherVocab = allVocab.filter(v => v.id !== vocab.id && v.meaning !== vocab.meaning);
    for (let i = 0; i < 3 && i < otherVocab.length; i++) {
      const randomIndex = Math.floor(Math.random() * otherVocab.length);
      const wrongAnswer = otherVocab.splice(randomIndex, 1)[0].meaning;
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // 옵션 섞기
    options.sort(() => 0.5 - Math.random());
    
    return {
      type: 'multiple-choice',
      level: level,
      questionText: `'${vocab.simplified}' (${vocab.pinyin})의 의미는?`,
      options: options,
      correctAnswer: correctAnswer,
      vocab: vocab
    };
  };

  // 빈칸 맞추기 문제 생성 (중급) - 한글 번역 추가
  const generateFillBlankQuestion = (vocab, level) => {
    // 정답 옵션
    const correctAnswer = vocab.simplified;
    const options = [correctAnswer];
    
    // 오답 옵션 3개 추가
    const otherVocab = vocabularyData.filter(v => v.id !== vocab.id && v.simplified !== vocab.simplified);
    for (let i = 0; i < 3 && i < otherVocab.length; i++) {
      const randomIndex = Math.floor(Math.random() * otherVocab.length);
      const wrongAnswer = otherVocab.splice(randomIndex, 1)[0].simplified;
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // 옵션 섞기
    options.sort(() => 0.5 - Math.random());
    
    // 예문 처리 - 실제 example 필드 사용 시도
    let context = null;
    let koreanTranslation = "";
    
    if (vocab.example && typeof vocab.example === 'object') {
      // example 객체에서 중국어와 한국어 찾기
      const chineseText = vocab.example.zh || vocab.example.chinese || vocab.example.cn;
      const koreanText = vocab.example.ko || vocab.example.korean || vocab.example.kr;
      
      if (chineseText && chineseText.includes(vocab.simplified)) {
        context = {
          before: chineseText.split(vocab.simplified)[0],
          after: chineseText.split(vocab.simplified)[1] || ''
        };
        koreanTranslation = koreanText || `"${vocab.meaning}" 관련 문장`;
      }
    } else if (vocab.example && typeof vocab.example === 'string') {
      // 문자열 형태의 예문
      if (vocab.example.includes(vocab.simplified)) {
        context = {
          before: vocab.example.split(vocab.simplified)[0],
          after: vocab.example.split(vocab.simplified)[1] || ''
        };
        koreanTranslation = `"${vocab.meaning}" 관련 문장`;
      }
    }
    
    // 예문이 없거나 단어가 포함되지 않은 경우 기본 문장 생성
    if (!context) {
      context = {
        before: `我很喜欢`,
        after: ``
      };
      koreanTranslation = `"나는 ${vocab.meaning}을/를 매우 좋아한다"`;
    }
    
    return {
      type: 'fill-blank',
      level: level,
      questionText: '빈칸에 들어갈 중국어 단어를 선택하세요',
      context: context,
      koreanTranslation: koreanTranslation, // 한글 번역 추가
      options: options,
      correctAnswer: correctAnswer,
      vocab: vocab
    };
  };

  // 듣기 퀴즈 문제 생성 (고급) - 단어 듣기와 문장 듣기 두 가지 유형
  const generateListeningQuestion = (vocab, allVocab, level) => {
    // 랜덤으로 단어 듣기 또는 문장 듣기 선택
    const isWordListening = Math.random() < 0.5;
    
    if (isWordListening) {
      // 유형 1: 단어 듣기 (기존)
      const correctAnswer = vocab.meaning;
      const options = [correctAnswer];
      
      // 오답 옵션 3개 추가
      const otherVocab = allVocab.filter(v => v.id !== vocab.id && v.meaning !== vocab.meaning);
      for (let i = 0; i < 3 && i < otherVocab.length; i++) {
        const randomIndex = Math.floor(Math.random() * otherVocab.length);
        const wrongAnswer = otherVocab.splice(randomIndex, 1)[0].meaning;
        if (!options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }
      
      // 옵션 섞기
      options.sort(() => 0.5 - Math.random());
      
      return {
        type: 'listening',
        subType: 'word',
        level: level,
        questionText: '음성을 듣고 올바른 의미를 선택하세요',
        options: options,
        correctAnswer: correctAnswer,
        audioText: vocab.simplified, // 단어만 읽음
        vocab: vocab
      };
    } else {
      // 유형 2: 문장 듣기 (신규)
      const correctAnswer = vocab.simplified;
      const options = [correctAnswer];
      
      // 오답 옵션 3개 추가 (다른 단어들)
      const otherVocab = allVocab.filter(v => v.id !== vocab.id && v.simplified !== vocab.simplified);
      for (let i = 0; i < 3 && i < otherVocab.length; i++) {
        const randomIndex = Math.floor(Math.random() * otherVocab.length);
        const wrongAnswer = otherVocab.splice(randomIndex, 1)[0].simplified;
        if (!options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }
      
      // 옵션 섞기
      options.sort(() => 0.5 - Math.random());
      
      // 문장 생성 (예문이 있으면 사용, 없으면 기본 문장)
      let sentence = null;
      let koreanTranslation = "";
      
      if (vocab.example && typeof vocab.example === 'object') {
        const chineseText = vocab.example.zh || vocab.example.chinese || vocab.example.cn;
        const koreanText = vocab.example.ko || vocab.example.korean || vocab.example.kr;
        
        if (chineseText && chineseText.includes(vocab.simplified)) {
          sentence = chineseText;
          koreanTranslation = koreanText || `"${vocab.meaning}" 관련 문장`;
        }
      } else if (vocab.example && typeof vocab.example === 'string') {
        if (vocab.example.includes(vocab.simplified)) {
          sentence = vocab.example;
          koreanTranslation = `"${vocab.meaning}" 관련 문장`;
        }
      }
      
      // 예문이 없으면 기본 문장 생성
      if (!sentence) {
        sentence = `我很喜欢${vocab.simplified}`;
        koreanTranslation = `"나는 ${vocab.meaning}을/를 매우 좋아한다"`;
      }
      
      return {
        type: 'listening',
        subType: 'sentence',
        level: level,
        questionText: '문장을 듣고 빈칸에 들어갈 단어를 선택하세요',
        options: options,
        correctAnswer: correctAnswer,
        audioText: sentence, // 전체 문장 읽음
        sentence: sentence,
        koreanTranslation: koreanTranslation,
        vocab: vocab
      };
    }
  };

  // 답변 처리
  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    // 답변 저장
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = {
      answer: answer,
      isCorrect: isCorrect,
      question: currentQuestion
    };
    setUserAnswers(newUserAnswers);
    
    // 점수 업데이트
    if (isCorrect) {
      setScore(prevScore => ({
        ...prevScore,
        [`level${currentQuestion.level}`]: prevScore[`level${currentQuestion.level}`] + 1
      }));
    }
    
    // 다음 문제로 이동 또는 완료
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  // 현재 문제
  const currentQuestion = questions[currentQuestionIndex];
  
  // 로딩 중
  if (loading) {
    return (
      <div className="vocab-quiz">
        <div className="loading">퀴즈 문제를 준비하는 중...</div>
      </div>
    );
  }

  // 퀴즈 완료
  if (isComplete) {
    const totalScore = score.level1 + score.level2 + score.level3;
    const totalQuestions = questions.length;
    const percentage = Math.round((totalScore / totalQuestions) * 100);
    
    return (
      <div className="vocab-quiz">
        <div className="quiz-complete">
          <h2>🎉 퀴즈 완료!</h2>
          
          <div className="final-results">
            <div className="total-score">
              <div className="score-circle">
                <span className="score-number">{totalScore}</span>
                <span className="score-total">/{totalQuestions}</span>
              </div>
              <p className="score-percentage">{percentage}% 정답률</p>
            </div>
            
            <div className="level-breakdown">
              <h3>단계별 성적</h3>
              <div className="level-scores">
                <div className={`level-score level-1 ${score.level1 === 3 ? 'perfect' : ''}`}>
                  <span className="level-name">초급 (뜻 맞추기)</span>
                  <span className="level-result">{score.level1}/3</span>
                </div>
                <div className={`level-score level-2 ${score.level2 === 3 ? 'perfect' : ''}`}>
                  <span className="level-name">중급 (빈칸 맞추기)</span>
                  <span className="level-result">{score.level2}/3</span>
                </div>
                <div className={`level-score level-3 ${score.level3 === 3 ? 'perfect' : ''}`}>
                  <span className="level-name">고급 (듣기 퀴즈)</span>
                  <span className="level-result">{score.level3}/3</span>
                </div>
              </div>
            </div>
            
            <div className="result-message">
              {percentage >= 80 ? (
                <p>🏆 훌륭합니다! 단어를 매우 잘 이해하고 있습니다.</p>
              ) : percentage >= 60 ? (
                <p>👍 좋은 결과입니다! 조금 더 연습하면 완벽해질 거예요.</p>
              ) : (
                <p>💪 다시 도전해보세요! 복습 후 재도전하면 더 좋은 결과를 얻을 수 있습니다.</p>
              )}
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="continue-button" onClick={() => onContinue && onContinue()}>
              이어서 학습하기
            </button>
            <button className="finish-button" onClick={onFinish}>
              학습 메뉴로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 문제가 없는 경우
  if (!currentQuestion) {
    return (
      <div className="vocab-quiz">
        <div className="error">
          <p>퀴즈 문제를 생성할 수 없습니다.</p>
          <button onClick={onFinish} className="finish-button">
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 현재 레벨의 문제 번호 계산
  const levelQuestionIndex = ((currentQuestionIndex) % 3) + 1;
  
  return (
    <div className="vocab-quiz">
      <div className="quiz-header">
        <button className="back-button" onClick={onFinish}>
          ← 학습 메뉴로 돌아가기
        </button>
        
        <div className="quiz-progress">
          <div className="overall-progress">
            전체: {currentQuestionIndex + 1} / {questions.length} 문제
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="level-indicator">
        <div className={`level-badge level-${currentLevel}`}>
          {currentLevel === 1 ? '초급 (뜻 맞추기)' : 
           currentLevel === 2 ? '중급 (빈칸 맞추기)' : 
           '고급 (듣기 퀴즈)'}
        </div>
        <div className="level-question-number">
          {levelQuestionIndex} / 3 문제
        </div>
      </div>
      
      <div className="question-container">
        {currentQuestion.type === 'multiple-choice' && (
          <VocabMultipleChoice 
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )}
        
        {currentQuestion.type === 'fill-blank' && (
          <VocabFillBlank 
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )}
        
        {currentQuestion.type === 'listening' && (
          <VocabListening 
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )}
      </div>
    </div>
  );
}

export default VocabQuiz;