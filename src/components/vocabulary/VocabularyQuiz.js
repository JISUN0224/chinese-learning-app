import React, { useState, useEffect } from 'react';
import './VocabularyQuiz.css';

// 퀴즈 타입
const QUIZ_TYPES = {
  MULTIPLE_CHOICE: '선택형',
  FILL_BLANK: '빈칸 채우기',
  MATCHING: '짝짓기'
};

function VocabularyQuiz({ vocabularyList }) {
  const [quizStage, setQuizStage] = useState(1); // 1, 2, 3 단계
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // 각 단계별로 3문제씩 생성
  useEffect(() => {
    if (!vocabularyList || vocabularyList.length === 0) return;
    
    const generateQuestions = () => {
      // 단계별 퀴즈 타입 설정
      let quizType;
      switch (quizStage) {
        case 1:
          quizType = QUIZ_TYPES.MULTIPLE_CHOICE;
          break;
        case 2:
          quizType = QUIZ_TYPES.FILL_BLANK;
          break;
        case 3:
          quizType = QUIZ_TYPES.MATCHING;
          break;
        default:
          quizType = QUIZ_TYPES.MULTIPLE_CHOICE;
      }
      
      // 단계별 3문제 생성
      const stageQuestions = [];
      
      // 중복 없이 랜덤하게 3개 선택
      const availableVocabulary = [...vocabularyList];
      for (let i = 0; i < 3; i++) {
        if (availableVocabulary.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * availableVocabulary.length);
        const selectedVocabulary = availableVocabulary.splice(randomIndex, 1)[0];
        
        let question;
        
        // 퀴즈 타입에 따라 문제 생성
        switch (quizType) {
          case QUIZ_TYPES.MULTIPLE_CHOICE:
            question = generateMultipleChoiceQuestion(selectedVocabulary, vocabularyList);
            break;
          case QUIZ_TYPES.FILL_BLANK:
            question = generateFillBlankQuestion(selectedVocabulary);
            break;
          case QUIZ_TYPES.MATCHING:
            question = generateMatchingQuestion(selectedVocabulary, vocabularyList);
            break;
          default:
            question = generateMultipleChoiceQuestion(selectedVocabulary, vocabularyList);
        }
        
        stageQuestions.push(question);
      }
      
      return stageQuestions;
    };
    
    const newQuestions = generateQuestions();
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setUserInput('');
  }, [quizStage, vocabularyList]);
  
  // 선택형 퀴즈 생성
  const generateMultipleChoiceQuestion = (vocabulary, allVocabulary) => {
    // 정답 옵션
    const correctOption = {
      text: vocabulary.meaning,
      isCorrect: true
    };
    
    // 오답 옵션들 (중복 없이)
    const incorrectOptions = [];
    const availableVocabulary = allVocabulary.filter(v => v.id !== vocabulary.id);
    
    for (let i = 0; i < 3; i++) {
      if (availableVocabulary.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableVocabulary.length);
      const randomVocabulary = availableVocabulary.splice(randomIndex, 1)[0];
      
      incorrectOptions.push({
        text: randomVocabulary.meaning,
        isCorrect: false
      });
    }
    
    // 모든 옵션을 섞기
    const allOptions = [correctOption, ...incorrectOptions];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    return {
      type: QUIZ_TYPES.MULTIPLE_CHOICE,
      text: `'${vocabulary.simplified}' (${vocabulary.pinyin})의 의미로 알맞은 것은?`,
      options: allOptions,
      correctAnswer: correctOption.text
    };
  };
  
  // 빈칸 채우기 퀴즈 생성
  const generateFillBlankQuestion = (vocabulary) => {
    // 예문이 없는 경우 대체 문장 생성
    if (!vocabulary.examples || vocabulary.examples.length === 0) {
      return {
        type: QUIZ_TYPES.FILL_BLANK,
        text: `단어 '${vocabulary.simplified}'가 들어갈 문장을 완성하세요.`,
        sentence: `____ 의 의미는 '${vocabulary.meaning}'입니다.`,
        blankWord: vocabulary.simplified,
        fullSentence: `${vocabulary.simplified} 의 의미는 '${vocabulary.meaning}'입니다.`
      };
    }
    
    // 랜덤으로 예문 선택
    const randomExample = vocabulary.examples[Math.floor(Math.random() * vocabulary.examples.length)];
    
    // 문장에서 단어 위치 찾기
    const sentence = randomExample.chinese;
    const word = vocabulary.simplified;
    
    // 단어를 포함하는지 확인하고 빈칸으로 대체
    if (sentence.includes(word)) {
      const blankSentence = sentence.replace(word, '____');
      
      return {
        type: QUIZ_TYPES.FILL_BLANK,
        text: '빈칸에 들어갈 단어를 입력하세요.',
        sentence: blankSentence,
        blankWord: word,
        fullSentence: sentence,
        pinyin: randomExample.pinyin,
        translation: randomExample.translation
      };
    } else {
      // 문장에 단어가 없는 경우 대체 문제 생성
      return {
        type: QUIZ_TYPES.FILL_BLANK,
        text: `단어 '${vocabulary.simplified}'가 들어갈 문장을 완성하세요.`,
        sentence: `____ 의 의미는 '${vocabulary.meaning}'입니다.`,
        blankWord: vocabulary.simplified,
        fullSentence: `${vocabulary.simplified} 의 의미는 '${vocabulary.meaning}'입니다.`
      };
    }
  };
  
  // 짝짓기 퀴즈 생성
  const generateMatchingQuestion = (vocabulary, allVocabulary) => {
    // 짝을 이루는 항목들
    const correctPair = {
      chinese: vocabulary.simplified,
      meaning: vocabulary.meaning
    };
    
    // 오답 항목들 (중복 없이)
    const incorrectPairs = [];
    const availableVocabulary = allVocabulary.filter(v => v.id !== vocabulary.id);
    
    for (let i = 0; i < 3; i++) {
      if (availableVocabulary.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * availableVocabulary.length);
      const randomVocabulary = availableVocabulary.splice(randomIndex, 1)[0];
      
      incorrectPairs.push({
        chinese: randomVocabulary.simplified,
        meaning: randomVocabulary.meaning
      });
    }
    
    // 중국어 항목들과 의미 항목들을 각각 섞기
    const allChineseItems = [correctPair.chinese, ...incorrectPairs.map(pair => pair.chinese)];
    const allMeaningItems = [correctPair.meaning, ...incorrectPairs.map(pair => pair.meaning)];
    
    // 배열 섞기
    for (let i = allChineseItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allChineseItems[i], allChineseItems[j]] = [allChineseItems[j], allChineseItems[i]];
    }
    
    for (let i = allMeaningItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allMeaningItems[i], allMeaningItems[j]] = [allMeaningItems[j], allMeaningItems[i]];
    }
    
    return {
      type: QUIZ_TYPES.MATCHING,
      text: '중국어와 그 의미를 올바르게 짝지으세요.',
      chineseItems: allChineseItems,
      meaningItems: allMeaningItems,
      correctPairs: [correctPair, ...incorrectPairs]
    };
  };
  
  // 답변 확인
  const checkAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    let correct = false;
    
    if (currentQuestion.type === QUIZ_TYPES.MULTIPLE_CHOICE) {
      // 선택형 문제 확인
      correct = selectedAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === QUIZ_TYPES.FILL_BLANK) {
      // 빈칸 채우기 문제 확인
      correct = userInput.trim() === currentQuestion.blankWord;
    } else if (currentQuestion.type === QUIZ_TYPES.MATCHING) {
      // 짝짓기 문제 확인 (선택된 항목들 비교)
      // 실제 구현에서는 더 복잡한 로직이 필요할 수 있음
      correct = true; // 임시
    }
    
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    
    // 일정 시간 후 다음 문제로 이동
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setUserInput('');
      } else {
        // 마지막 문제인 경우
        if (quizStage < 3) {
          // 다음 단계로 이동
          setQuizStage(quizStage + 1);
        } else {
          // 퀴즈 완료
          setQuizCompleted(true);
        }
      }
    }, 1500);
  };
  
  // 다시 시작
  const restartQuiz = () => {
    setQuizStage(1);
    setScore(0);
    setQuizCompleted(false);
  };
  
  // 현재 문제
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div className="loading">퀴즈를 준비하는 중...</div>;
  }
  
  // 퀴즈 완료 화면
  if (quizCompleted) {
    return (
      <div className="quiz-completed">
        <h3>퀴즈 결과</h3>
        <div className="final-score">
          <p>최종 점수: {score} / 9</p>
          <div className={`score-message ${score >= 7 ? 'high-score' : score >= 4 ? 'mid-score' : 'low-score'}`}>
            {score >= 7 ? '훌륭합니다!' : score >= 4 ? '좋은 시도입니다!' : '다시 도전해보세요!'}
          </div>
        </div>
        <button className="restart-button" onClick={restartQuiz}>다시 시작</button>
      </div>
    );
  }
  
  return (
    <div className="vocabulary-quiz">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span>단계 {quizStage}/3</span>
          <span>문제 {currentQuestionIndex + 1}/3</span>
        </div>
        <div className="quiz-score">점수: {score}</div>
      </div>
      
      <div className="quiz-question">
        <h3>{currentQuestion.text}</h3>
        
        {/* 선택형 퀴즈 */}
        {currentQuestion.type === QUIZ_TYPES.MULTIPLE_CHOICE && (
          <div className="multiple-choice">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${selectedAnswer === option.text ? 'selected' : ''} ${
                  isCorrect !== null ? (option.isCorrect ? 'correct' : 'incorrect') : ''
                }`}
                onClick={() => {
                  if (isCorrect === null) {
                    setSelectedAnswer(option.text);
                  }
                }}
                disabled={isCorrect !== null}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}
        
        {/* 빈칸 채우기 퀴즈 */}
        {currentQuestion.type === QUIZ_TYPES.FILL_BLANK && (
          <div className="fill-blank">
            <div className="sentence">
              {/* 전체 문장 표시 - 빈칸이 있는 부분만 강조 */}
              <p 
                className="chinese-sentence" 
                dangerouslySetInnerHTML={{ 
                  __html: currentQuestion.sentence.replace('____', '<span class="blank">____</span>') 
                }} 
              />
              
              {/* 병음과 번역 표시 */}
              {currentQuestion.pinyin && <p className="pinyin-sentence">{currentQuestion.pinyin}</p>}
              {currentQuestion.translation && <p className="translation-sentence">{currentQuestion.translation}</p>}
            </div>
            
            <div className="input-area">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="단어 입력"
                disabled={isCorrect !== null}
                className={isCorrect !== null ? (isCorrect ? 'correct-input' : 'incorrect-input') : ''}
              />
            </div>
            
            {isCorrect !== null && (
              <div className="feedback">
                <p>정답: {currentQuestion.blankWord}</p>
                <p>전체 문장: {currentQuestion.fullSentence}</p>
              </div>
            )}
          </div>
        )}
        
        {/* 짝짓기 퀴즈 */}
        {currentQuestion.type === QUIZ_TYPES.MATCHING && (
          <div className="matching">
            <div className="matching-columns">
              <div className="chinese-column">
                {currentQuestion.chineseItems.map((item, index) => (
                  <div key={index} className="matching-item">
                    {item}
                  </div>
                ))}
              </div>
              <div className="meaning-column">
                {currentQuestion.meaningItems.map((item, index) => (
                  <div key={index} className="matching-item">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <p className="matching-instruction">
              각 단어와 의미를 짝지어 주세요. (실제 짝짓기 기능은 구현 예정)
            </p>
          </div>
        )}
      </div>
      
      <div className="quiz-controls">
        {/* 선택형에서는 옵션 선택 후, 빈칸 채우기에서는 입력 후 확인 버튼 활성화 */}
        <button
          className="check-answer-button"
          onClick={checkAnswer}
          disabled={
            isCorrect !== null ||
            (currentQuestion.type === QUIZ_TYPES.MULTIPLE_CHOICE && !selectedAnswer) ||
            (currentQuestion.type === QUIZ_TYPES.FILL_BLANK && !userInput.trim())
          }
        >
          답변 확인
        </button>
      </div>
      
      {/* 정답/오답 표시 */}
      {isCorrect !== null && (
        <div className={`answer-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? '정답입니다!' : '틀렸습니다.'}
        </div>
      )}
    </div>
  );
}

export default VocabularyQuiz;