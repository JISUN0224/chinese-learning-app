// hanziService.js

// GitHub에서 데이터 가져오기
const fetchHSKData = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json');
    if (!response.ok) {
      throw new Error('Failed to fetch HSK data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching HSK data:', error);
    return [];
  }
};

// 기본 한자 데이터 생성
const generateHanziData = (hskData) => {
  const hanziMap = new Map();
  
  console.log('HSK 데이터 샘플 확인:', hskData.slice(0, 3));
  
  // HSK 데이터에서 개별 한자 추출
  hskData.forEach((vocab, vocabIndex) => {
    if (vocab.simplified) {
      Array.from(vocab.simplified).forEach((char, charIndex) => {
        // 한자 유니코드 범위 확인
        if (/[\u4e00-\u9fff]/.test(char)) {
          if (!hanziMap.has(char)) {
            // 한자 데이터 구조 생성 (GitHub 구조 기반)
            const hanziData = {
              id: `hanzi_${char}`,
              simplified: char,
              level: vocab.level ? (Array.isArray(vocab.level) ? vocab.level[0] : vocab.level) : 'unknown',
              forms: [{
                traditional: vocab.forms && vocab.forms[0] && vocab.forms[0].traditional 
                  ? vocab.forms[0].traditional.charAt(charIndex) || vocab.forms[0].traditional.charAt(0) 
                  : char,
                transcriptions: {
                  pinyin: vocab.forms && vocab.forms[0] && vocab.forms[0].transcriptions && vocab.forms[0].transcriptions.pinyin
                    ? vocab.forms[0].transcriptions.pinyin.split(' ')[charIndex] || vocab.forms[0].transcriptions.pinyin.split(' ')[0]
                    : ''
                },
                meanings: vocab.forms && vocab.forms[0] && vocab.forms[0].meanings 
                  ? vocab.forms[0].meanings.slice(0, 2) // 처음 2개 의미만 사용
                  : ['의미 없음']
              }],
              radical: vocab.radical || '',
              pos: vocab.pos || [],
              frequency: vocab.frequency || 9999
            };
            
            // 첫 몇 개 샘플 로그
            if (hanziMap.size < 5) {
              console.log(`한자 ${char} 데이터:`, hanziData);
            }
            
            hanziMap.set(char, hanziData);
          }
        }
      });
    }
  });
  
  // Map 객체를 배열로 변환하고 빈도수로 정렬
  const result = Array.from(hanziMap.values()).sort((a, b) => a.frequency - b.frequency);
  console.log('생성된 한자 데이터 총 개수:', result.length);
  console.log('첫 번째 한자 예시:', result[0]);
  console.log('마지막 한자 예시:', result[result.length - 1]);
  
  return result;
};

// 한자 데이터 캐싱
let cachedHanziData = null;
let cachedHSKData = null;

// 한자 데이터 불러오기 (빈도수 기반 분류)
export const loadHanziData = async (level = 'top-30') => {
  try {
    // 캐시된 데이터가 없으면 생성
    if (!cachedHSKData) {
      cachedHSKData = await fetchHSKData();
      console.log('HSK 데이터 로드 완료:', cachedHSKData.length, '개');
    }
    
    if (!cachedHanziData) {
      cachedHanziData = generateHanziData(cachedHSKData);
      console.log('생성된 한자 데이터:', cachedHanziData.length, '개');
    }
    
    // 빈도수 기반으로 분류
    const totalCount = cachedHanziData.length;
    let filtered = [];
    
    switch (level) {
      case 'top-30':
        // 상위 30% 한자
        filtered = cachedHanziData.slice(0, Math.floor(totalCount * 0.3));
        break;
      case 'top-60':
        // 상위 60% 한자 (30%~60%)
        filtered = cachedHanziData.slice(Math.floor(totalCount * 0.3), Math.floor(totalCount * 0.6));
        break;
      case 'others':
        // 나머지 한자 (60%~100%)
        filtered = cachedHanziData.slice(Math.floor(totalCount * 0.6));
        break;
      default:
        // 기본적으로 상위 30% 반환
        filtered = cachedHanziData.slice(0, Math.floor(totalCount * 0.3));
        break;
    }
    
    console.log(`레벨 ${level}에 해당하는 한자:`, filtered.length, '개 / 전체:', totalCount, '개');
    return filtered;
  } catch (error) {
    console.error('한자 데이터 로드 오류:', error);
    return [];
  }
};

// 특정 한자 또는 카테고리에 해당하는 어휘 데이터 불러오기
export const loadVocabularyByHanzi = async (hanzi) => {
  try {
    if (!hanzi) return [];
    
    // 캐시된 HSK 데이터가 없으면 로드
    if (!cachedHSKData) {
      cachedHSKData = await fetchHSKData();
    }
    
    // 단어 중에 해당 한자가 포함된 것 찾기
    return cachedHSKData.filter(vocab => 
      vocab.simplified && vocab.simplified.includes(hanzi)
    );
  } catch (error) {
    console.error('어휘 데이터 로드 오류:', error);
    return [];
  }
};

export default {
  loadHanziData,
  loadVocabularyByHanzi
};