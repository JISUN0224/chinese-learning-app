// 임시로 vocabularyService를 수정해서 데이터 구조 디버깅
// vocabularyService.js
import mergedVocabData from '../data/merged_vocab.json';

// 데이터 구조 확인 함수
const debugDataStructure = () => {
  console.log('=== merged_vocab.json 데이터 구조 분석 ===');
  console.log('Total items:', mergedVocabData.length);
  
  if (mergedVocabData.length > 0) {
    console.log('First item keys:', Object.keys(mergedVocabData[0]));
    console.log('First item:', mergedVocabData[0]);
    console.log('Second item:', mergedVocabData[1]);
    console.log('Third item:', mergedVocabData[2]);
  }
  
  // HSK 관련 필드 찾기
  const possibleHskFields = ['hsk', 'HSK', 'level', 'Level', 'hsk_level', 'HSK_level', 'hsk_old', 'hsk_new'];
  const foundFields = {};
  
  mergedVocabData.slice(0, 50).forEach((item, index) => {
    possibleHskFields.forEach(field => {
      if (item.hasOwnProperty(field) && item[field] !== undefined && item[field] !== null && item[field] !== '') {
        if (!foundFields[field]) {
          foundFields[field] = [];
        }
        foundFields[field].push(`item${index}: ${item[field]}`);
      }
    });
  });
  
  console.log('Found HSK fields:', foundFields);
  
  // 첫 10개 항목에서 모든 고유한 키들 수집
  const allKeys = new Set();
  mergedVocabData.slice(0, 10).forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  console.log('All unique keys in first 10 items:', Array.from(allKeys));
};

// merged_vocab.json에서 HSK 레벨 추출 (수정된 버전)
const extractLevels = () => {
  // 먼저 데이터 구조 디버깅
  debugDataStructure();
  
  const levels = new Map();
  
  // 다양한 HSK 필드명 시도
  const hskFields = ['hsk', 'HSK', 'level', 'Level', 'hsk_level', 'HSK_level', 'old', 'new'];
  
  mergedVocabData.forEach((vocab, index) => {
    let hskValue = null;
    
    // 가능한 HSK 필드들을 순서대로 확인
    for (const field of hskFields) {
      if (vocab[field] !== undefined && vocab[field] !== null && vocab[field] !== '') {
        hskValue = vocab[field];
        break;
      }
    }
    
    if (hskValue) {
      // HSK 값 정리 (숫자만 추출)
      let levelNum = null;
      if (typeof hskValue === 'number') {
        levelNum = hskValue;
      } else if (typeof hskValue === 'string') {
        // "hsk1", "HSK 1", "1급" 등에서 숫자 추출
        const match = hskValue.match(/(\d+)/);
        if (match) {
          levelNum = parseInt(match[1]);
        }
      }
      
      if (levelNum && levelNum >= 1 && levelNum <= 6) {
        const levelId = `hsk${levelNum}`;
        if (!levels.has(levelId)) {
          levels.set(levelId, {
            id: levelId,
            name: `HSK ${levelNum}급`,
            description: `HSK ${levelNum}급 필수 단어`,
            order: levelNum,
            wordCount: 1
          });
        } else {
          const level = levels.get(levelId);
          level.wordCount++;
        }
      }
    }
  });
  
  console.log('Extracted levels:', Array.from(levels.values()));
  
  // 레벨이 없으면 기본 레벨 추가
  if (levels.size === 0) {
    console.log('No HSK levels found, adding default levels');
    for (let i = 1; i <= 6; i++) {
      levels.set(`hsk${i}`, {
        id: `hsk${i}`,
        name: `HSK ${i}급`,
        description: `HSK ${i}급 필수 단어`,
        order: i,
        wordCount: Math.floor(mergedVocabData.length / 6) // 균등 분배
      });
    }
  }
  
  return Array.from(levels.values()).sort((a, b) => a.order - b.order);
};

// 어휘 묶음 가져오기 (수정된 버전)
export const loadVocabularyByLevelOrTheme = async (levelId, themeId) => {
  try {
    console.log('loadVocabularyByLevelOrTheme called with:', { levelId, themeId });
    
    let filteredVocab = [];
    
    if (levelId) {
      // HSK 레벨 추출 (예: "hsk1" -> 1)
      const hskLevel = parseInt(levelId.replace('hsk', ''), 10);
      console.log('Looking for HSK level:', hskLevel);
      
      // 다양한 필드명으로 HSK 레벨 필터링
      const hskFields = ['hsk', 'HSK', 'level', 'Level', 'hsk_level', 'HSK_level', 'old', 'new'];
      
      filteredVocab = mergedVocabData.filter(vocab => {
        for (const field of hskFields) {
          const value = vocab[field];
          if (value !== undefined && value !== null && value !== '') {
            // 숫자 비교
            if (typeof value === 'number' && value === hskLevel) {
              return true;
            }
            // 문자열에서 숫자 추출 후 비교
            if (typeof value === 'string') {
              const match = value.match(/(\d+)/);
              if (match && parseInt(match[1]) === hskLevel) {
                return true;
              }
            }
          }
        }
        return false;
      });
      
      console.log(`HSK ${hskLevel}급 단어 로드:`, filteredVocab.length, '개');
      
      // 만약 특정 HSK 레벨을 찾지 못했다면, 전체에서 일부를 가져오기
      if (filteredVocab.length === 0) {
        console.log('No specific HSK level found, using random subset');
        const startIndex = (hskLevel - 1) * Math.floor(mergedVocabData.length / 6);
        const endIndex = startIndex + Math.floor(mergedVocabData.length / 6);
        filteredVocab = mergedVocabData.slice(startIndex, endIndex);
        console.log(`Using random subset: ${filteredVocab.length} words`);
      }
      
    } else if (themeId) {
      // 테마별은 임시로 전체 데이터에서 랜덤 선택
      const shuffled = [...mergedVocabData].sort(() => 0.5 - Math.random());
      filteredVocab = shuffled.slice(0, 50);
      console.log(`테마 ${themeId} 단어 로드:`, filteredVocab.length, '개');
    } else {
      // 기본값: 처음 100개 단어
      filteredVocab = mergedVocabData.slice(0, 100);
    }
    
    // 데이터 구조 정규화
    const normalizedVocab = filteredVocab.map((vocab, index) => ({
      id: vocab.id || `vocab_${index}`,
      simplified: vocab.simplified || vocab.word || vocab.chinese || vocab.hanzi || '',
      pinyin: vocab.pinyin || vocab.pronunciation || vocab.romanization || '',
      meaning: vocab.meaning || vocab.definition || vocab.korean || vocab.english || vocab.translation || '',
      hsk: extractHskLevel(vocab),
      example: vocab.example || vocab.sentence || '',
      audio: vocab.audio || null
    }));
    
    console.log('Normalized vocab sample:', normalizedVocab.slice(0, 3));
    return normalizedVocab.slice(0, 50); // 최대 50개로 제한
    
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    return [];
  }
};

// HSK 레벨 추출 헬퍼 함수
const extractHskLevel = (vocab) => {
  const hskFields = ['hsk', 'HSK', 'level', 'Level', 'hsk_level', 'HSK_level'];
  
  for (const field of hskFields) {
    const value = vocab[field];
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'number' && value >= 1 && value <= 6) {
        return value;
      }
      if (typeof value === 'string') {
        const match = value.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num >= 1 && num <= 6) {
            return num;
          }
        }
      }
    }
  }
  return 1; // 기본값
};

// 테마는 임시로 만든 기본 테마 사용
const extractThemes = () => {
  const defaultThemes = [
    { id: 'daily', name: '일상생활', description: '일상생활에서 자주 사용하는 표현', wordCount: 150 },
    { id: 'study', name: '학습', description: '학교와 학습에 관련된 표현', wordCount: 120 },
    { id: 'travel', name: '여행', description: '여행에서 유용한 표현', wordCount: 100 },
    { id: 'food', name: '음식', description: '음식과 요리에 관련된 표현', wordCount: 80 },
    { id: 'business', name: '비즈니스', description: '비즈니스와 직장에서 쓰이는 표현', wordCount: 90 }
  ];
  
  return defaultThemes;
};

// 한자와 관련된 어휘 로드
export const loadVocabularyByHanzi = async (hanzi) => {
  try {
    if (!hanzi) return [];
    
    // 단어 중에 해당 한자가 포함된 것 찾기
    const filteredVocab = mergedVocabData.filter(vocab => {
      const text = vocab.simplified || vocab.word || vocab.chinese || vocab.hanzi || '';
      return text.includes(hanzi);
    });
    
    // 데이터 구조 정규화
    const normalizedVocab = filteredVocab.slice(0, 20).map((vocab, index) => ({
      id: vocab.id || `vocab_${index}`,
      simplified: vocab.simplified || vocab.word || vocab.chinese || vocab.hanzi || '',
      pinyin: vocab.pinyin || vocab.pronunciation || vocab.romanization || '',
      meaning: vocab.meaning || vocab.definition || vocab.korean || vocab.english || vocab.translation || '',
      hsk: extractHskLevel(vocab),
      example: vocab.example || vocab.sentence || '',
      audio: vocab.audio || null
    }));
    
    console.log(`한자 '${hanzi}' 관련 단어 로드:`, normalizedVocab.length, '개');
    return normalizedVocab;
  } catch (error) {
    console.error('Error loading vocabulary for hanzi:', error);
    return [];
  }
};

// 전체 어휘 수 확인
export const countTotalVocabulary = async () => {
  try {
    return mergedVocabData.length;
  } catch (error) {
    console.error('Error counting vocabulary:', error);
    return 0;
  }
};

// 어휘 학습 레벨 로드
export const loadVocabularyLevels = async () => {
  try {
    return extractLevels();
  } catch (error) {
    console.error('Error loading vocabulary levels:', error);
    return [];
  }
};

// 어휘 테마(주제) 로드
export const loadVocabularyThemes = async () => {
  try {
    return extractThemes();
  } catch (error) {
    console.error('Error loading vocabulary themes:', error);
    return [];
  }
};