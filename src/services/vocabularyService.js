// vocabularyService.js
import mergedVocabData from '../data/merged_vocab_recategorized.json';

// merged_vocab.json에서 HSK 레벨 추출
const extractLevels = () => {
  const levels = new Map();
  
  mergedVocabData.forEach(vocab => {
    if (vocab.level) {
      // level 필드에서 HSK 레벨 추출 (예: "new-1", "old-2" 등)
      let hskLevel = null;
      let levelType = '';
      let levelId = '';
      
      if (vocab.level.startsWith('new-')) {
        const levelNum = vocab.level.replace('new-', '').replace('+', '');
        if (levelNum === '7') {
          // new-7+는 신HSK 고급으로 처리
          levelId = 'new-advanced';
          hskLevel = '고급';
          levelType = '신HSK';
        } else if (!isNaN(levelNum) && parseInt(levelNum) >= 1 && parseInt(levelNum) <= 6) {
          hskLevel = parseInt(levelNum);
          levelType = '신HSK';
          levelId = `new-${hskLevel}`;
        }
      } else if (vocab.level.startsWith('old-')) {
        // 구HSK는 모두 통합
        levelId = 'old-integrated';
        hskLevel = '2~6급 통합';
        levelType = '구HSK';
      }
        
      if (levelId && hskLevel) {
        if (!levels.has(levelId)) {
          let name, description, order;
          
          if (levelType === '신HSK') {
            if (hskLevel === '고급') {
              name = '신HSK 고급';
              description = 'HSK 고급 필수 단어';
              order = 7;
            } else {
              name = `신HSK ${hskLevel}급`;
              description = `HSK ${hskLevel}급 필수 단어`;
              order = hskLevel;
            }
          } else if (levelType === '구HSK') {
            name = '구HSK(2~6급 통합)';
            description = 'HSK 구버전 필수 단어';
            order = 8; // 마지막에 표시
          }
          
          levels.set(levelId, {
            id: levelId,
            name: name,
            description: description,
            order: order,
            wordCount: 1
          });
        } else {
          const level = levels.get(levelId);
          level.wordCount++;
        }
      }
    }
  });
  
  console.log('추출된 HSK 레벨:', Array.from(levels.values()));
  
  // 디버그: 각 레벨별 실제 데이터 확인
  Array.from(levels.values()).forEach(level => {
    console.log(`${level.name}: ${level.wordCount}개 단어`);
  });
  
  return Array.from(levels.values()).sort((a, b) => a.order - b.order);
};

// 테마는 category 필드를 기반으로 실제 데이터에서 추출
const extractThemes = () => {
  const categories = new Map();
  
  mergedVocabData.forEach(vocab => {
    if (vocab.category) {
      const categoryName = vocab.category.trim();
      if (!categories.has(categoryName)) {
        categories.set(categoryName, {
          id: categoryName.toLowerCase().replace(/[^a-z0-9가-힣]/g, '_'),
          name: categoryName,
          description: `${categoryName} 관련 어휘`,
          wordCount: 1
        });
      } else {
        const category = categories.get(categoryName);
        category.wordCount++;
      }
    }
  });
  
  // 단어 수가 많은 순으로 정렬
  const sortedCategories = Array.from(categories.values())
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 15); // 상위 15개 카테고리만 표시
  
  console.log('추출된 카테고리:', sortedCategories);
  
  return sortedCategories;
};

// HSK 레벨 추출 헬퍼 함수
const extractHskLevel = (vocab) => {
  if (vocab.level) {
    if (vocab.level.startsWith('new-') || vocab.level.startsWith('old-')) {
      const levelNum = vocab.level.replace(/^(new-|old-)/, '').replace('+', '');
      if (!isNaN(levelNum)) {
        const num = parseInt(levelNum);
        if (num >= 1 && num <= 6) {
          return num;
        }
      }
    }
  }
  return 1; // 기본값
};

// 어휘 묶음 가져오기 (HSK 레벨 또는 테마별)
export const loadVocabularyByLevelOrTheme = async (levelId, themeId) => {
  try {
    console.log('loadVocabularyByLevelOrTheme 호출:', { levelId, themeId });
    
    let filteredVocab = [];
    
    if (levelId) {
      console.log('찾는 레벨 ID:', levelId);
      
      // 디버그: 첫 10개 데이터의 level 필드 확인
      console.log('첫 10개 데이터의 level 필드:', 
        mergedVocabData.slice(0, 10).map(item => ({
          simplified: item.simplified,
          level: item.level
        }))
      );
      
      // levelId에 따라 필터링
      if (levelId === 'new-advanced') {
        // 신HSK 고급 (new-7+)
        filteredVocab = mergedVocabData.filter(vocab => 
          vocab.level === 'new-7+'
        );
      } else if (levelId === 'old-integrated') {
        // 구HSK 통합 (old-2~6)
        filteredVocab = mergedVocabData.filter(vocab => 
          vocab.level && vocab.level.startsWith('old-')
        );
      } else if (levelId.startsWith('new-')) {
        // 신HSK 1~6급
        const levelNum = levelId.replace('new-', '');
        filteredVocab = mergedVocabData.filter(vocab => 
          vocab.level === `new-${levelNum}`
        );
      }
      
      console.log(`레벨 ${levelId} 단어 로드:`, filteredVocab.length, '개');
      
    } else if (themeId) {
      // 테마별은 category 필드를 기반으로 필터링
      const categoryName = themeId;
      filteredVocab = mergedVocabData.filter(vocab => 
        vocab.category && vocab.category.trim() === categoryName
      );
      console.log(`테마 ${themeId} 단어 로드:`, filteredVocab.length, '개');
    } else {
      // 기본값: 신HSK 1급 단어
      filteredVocab = mergedVocabData.filter(vocab => 
        vocab.level === 'new-1'
      );
    }
    
    // 데이터 구조 정규화
    const normalizedVocab = filteredVocab.map((vocab, index) => ({
      id: vocab.id || `vocab_${index}`,
      simplified: vocab.simplified || '',
      pinyin: vocab.pinyin || '',
      meaning: vocab.meaning?.ko || vocab.meaning || '',
      hsk: extractHskLevel(vocab),
      example: vocab.example || '',
      category: vocab.category || '',
      audio: vocab.audio || null
    }));
    
    console.log('정규화된 어휘 샘플:', normalizedVocab.slice(0, 3));
    return normalizedVocab; // 최대 50개로 제한
    
  } catch (error) {
    console.error('어휘 로딩 오류:', error);
    return [];
  }
};

// 한자와 관련된 어휘 로드
export const loadVocabularyByHanzi = async (hanzi) => {
  try {
    if (!hanzi) return [];
    
    // 단어 중에 해당 한자가 포함된 것 찾기
    const filteredVocab = mergedVocabData.filter(vocab => 
      vocab.simplified && vocab.simplified.includes(hanzi)
    );
    
    // 데이터 구조 정규화
    const normalizedVocab = filteredVocab.slice(0, 20).map((vocab, index) => ({
      id: vocab.id || `vocab_${index}`,
      simplified: vocab.simplified || '',
      pinyin: vocab.pinyin || '',
      meaning: vocab.meaning?.ko || vocab.meaning || '',
      hsk: extractHskLevel(vocab),
      example: vocab.example || '',
      category: vocab.category || '',
      audio: vocab.audio || null
    }));
    
    console.log(`한자 '${hanzi}' 관련 단어 로드:`, normalizedVocab.length, '개');
    return normalizedVocab;
  } catch (error) {
    console.error('한자 어휘 로딩 오류:', error);
    return [];
  }
};

// 전체 어휘 수 확인
export const countTotalVocabulary = async () => {
  try {
    return mergedVocabData.length;
  } catch (error) {
    console.error('어휘 개수 확인 오류:', error);
    return 0;
  }
};

// 어휘 학습 레벨 로드
export const loadVocabularyLevels = async () => {
  try {
    return extractLevels();
  } catch (error) {
    console.error('어휘 레벨 로딩 오류:', error);
    return [];
  }
};

// 어휘 테마(주제) 로드
export const loadVocabularyThemes = async () => {
  try {
    return extractThemes();
  } catch (error) {
    console.error('어휘 테마 로딩 오류:', error);
    return [];
  }
};