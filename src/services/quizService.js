// quizService.js
// 퀴즈 문제 생성 서비스

// 퀴즈 문제 생성 함수
export const generateQuizQuestions = (vocabList, quizType = 'vocabulary') => {
  if (!vocabList || vocabList.length === 0) {
    console.error('Empty vocabulary list for quiz generation');
    return [];
  }
  
  const questions = [];
  let questionNumber = 1;
  
  // 1단계: 단어에서 의미 찾기 (기본)
  vocabList.forEach((vocab) => {
    if (!vocab.simplified || !vocab.meaning) return;
    
    const correctAnswer = vocab.meaning;
    const options = generateOptions(vocabList, vocab, 'meaning');
    
    questions.push({
      questionType: 'word-to-meaning',
      questionNumber: questionNumber++,
      questionText: `"${vocab.simplified}" (${vocab.pinyin})의 의미는 무엇인가요?`,
      levelIndex: 1,
      levelDisplay: '기본 난이도',
      options,
      correctAnswer,
      relatedVocabId: vocab.id,
      wordData: vocab  // 원본 단어 데이터 저장
    });
  });
  
  // 2단계: 의미에서 단어 찾기 (중급)
  vocabList.forEach((vocab) => {
    if (!vocab.simplified || !vocab.meaning) return;
    
    const correctAnswer = vocab.simplified;
    const options = generateOptions(vocabList, vocab, 'simplified');
    
    questions.push({
      questionType: 'meaning-to-word',
      questionNumber: questionNumber++,
      questionText: `"${vocab.meaning}"를 중국어로 어떻게 표현하나요?`,
      levelIndex: 2,
      levelDisplay: '중급 난이도',
      options,
      correctAnswer,
      relatedVocabId: vocab.id,
      wordData: vocab  // 원본 단어 데이터 저장
    });
  });
  
  // 3단계: 문맥 속에서 단어 찾기 (고급)
  vocabList.forEach((vocab) => {
    if (!vocab.examples || vocab.examples.length === 0) return;
    
    // 성어 학습이면 더 많은 예문 문제 추가
    const exampleCount = quizType === 'idiom' ? Math.min(vocab.examples.length, 2) : 1;
    
    for (let i = 0; i < exampleCount; i++) {
      if (i >= vocab.examples.length) break;
      
      const example = vocab.examples[i];
      if (!example.chinese || !example.translation) continue;
      
      const correctAnswer = vocab.simplified;
      const options = generateOptions(vocabList, vocab, 'simplified');
      
      questions.push({
        questionType: 'context-sentence',
        questionNumber: questionNumber++,
        questionText: `다음 문장에서 "${vocab.meaning}"에 해당하는 중국어 ${quizType === 'idiom' ? '성어' : '단어'}는 무엇인가요?`,
        levelIndex: 3,
        levelDisplay: '고급 난이도',
        options,
        correctAnswer,
        context: {
          sentence: example.chinese,
          translation: example.translation
        },
        relatedVocabId: vocab.id,
        wordData: vocab  // 원본 단어 데이터 저장
      });
    }
  });
  
  // 성어 학습의 경우, 빈칸 채우기 문제 추가
  if (quizType === 'idiom') {
    vocabList.forEach((vocab) => {
      if (!vocab.simplified || !vocab.meaning || vocab.simplified.length !== 4) return;
      
      // 성어에서 한 글자 가리기 (마지막 글자를 가림)
      const correctAnswer = vocab.simplified[3]; // 마지막 글자
      
      // 한자로 된 4개의 옵션 생성
      const options = [correctAnswer];
      const otherIdioms = vocabList.filter(v => v.id !== vocab.id && v.simplified && v.simplified.length === 4);
      
      // 다른 성어의 글자 중 일부를 옵션으로 추가
      if (otherIdioms.length > 0) {
        const shuffle = [...otherIdioms].sort(() => 0.5 - Math.random());
        for (let i = 0; i < Math.min(shuffle.length, 5); i++) {
          const randomChar = shuffle[i].simplified[Math.floor(Math.random() * 4)];
          if (!options.includes(randomChar)) {
            options.push(randomChar);
          }
          if (options.length >= 4) break;
        }
      }
      
      // 옵션이 충분하지 않으면 추가 한자 보충
      while (options.length < 4) {
        const fillChars = ['人', '月', '日', '大', '心', '山', '水', '木'];
        const randomChar = fillChars[Math.floor(Math.random() * fillChars.length)];
        if (!options.includes(randomChar)) {
          options.push(randomChar);
        }
      }
      
      // 빈칸 문제 생성
      questions.push({
        questionType: 'fill-in-blank',
        questionNumber: questionNumber++,
        questionText: `다음 성어의 빈 칸에 들어갈 글자는 무엇인가요?`,
        levelIndex: 2,
        levelDisplay: '중급 난이도',
        options: shuffleArray(options),
        correctAnswer,
        context: {
          sentence: `${vocab.simplified.substring(0, 3)}□`,
          translation: vocab.meaning
        },
        relatedVocabId: vocab.id,
        wordData: vocab  // 원본 단어 데이터 저장
      });
    });
  }
  
  // HSK 단어 학습인 경우 청취 문제 추가
  if (quizType === 'vocabulary' || quizType === 'hsk') {
    const vocabWithAudio = vocabList.filter(v => v.audioUrl);
    
    vocabWithAudio.forEach((vocab) => {
      if (!vocab.simplified || !vocab.meaning) return;
      
      const correctAnswer = vocab.simplified;
      const options = generateOptions(vocabList, vocab, 'simplified');
      
      questions.push({
        questionType: 'listening',
        questionNumber: questionNumber++,
        questionText: '다음 들리는 단어로 알맞은 것은?',
        levelIndex: 3,
        levelDisplay: '청취 문제',
        options,
        correctAnswer,
        audioUrl: vocab.audioUrl,
        relatedVocabId: vocab.id,
        wordData: vocab  // 원본 단어 데이터 저장
      });
    });
  }
  
  // 문제 섞기
  return shuffleArray(questions);
};

// 옵션 생성 함수
function generateOptions(vocabList, currentVocab, fieldName) {
  const correctOption = currentVocab[fieldName];
  const options = [correctOption];
  
  // 다른 어휘에서 랜덤하게 옵션 가져오기
  const filteredVocab = vocabList.filter(v => v.id !== currentVocab.id && v[fieldName]);
  
  // 충분한 옵션이 없는 경우
  if (filteredVocab.length < 3) {
    // 가짜 옵션 생성
    if (fieldName === 'simplified') {
      // 단어인 경우 '가짜' 한자어 추가
      options.push('我们', '你好', '中国');
    } else {
      // 의미인 경우 가짜 의미 추가
      options.push('가다', '말하다', '사과하다');
    }
  } else {
    // 충분한 옵션이 있는 경우, 랜덤하게 선택
    const shuffled = [...filteredVocab].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    selected.forEach(vocab => {
      options.push(vocab[fieldName]);
    });
  }
  
  // 옵션 섞기 (정확한 개수 맞추기)
  return shuffleArray(options).slice(0, 4); // 총 4개 옵션으로 제한
}

// 배열 섞기 함수
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}