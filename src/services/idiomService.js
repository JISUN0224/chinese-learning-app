// idiomService.js
import idiomData from '../data/chengyu_data.json';

// 성어 데이터 로드 (로컬 JSON 파일 사용)
export const loadIdiomData = async () => {
  try {
    console.log('성어 데이터 로드, 전체 개수:', idiomData.length);
    console.log('첫 번째 성어 샘플:', idiomData[0]);
    console.log('중간 성어 샘플:', idiomData[Math.floor(idiomData.length / 2)]);
    
    // 카테고리 별 개수 확인
    const categoryCount = {};
    idiomData.forEach(idiom => {
      if (idiom.category) {
        categoryCount[idiom.category] = (categoryCount[idiom.category] || 0) + 1;
      }
    });
    console.log('카테고리별 개수:', categoryCount);
    
    return idiomData || [];
  } catch (error) {
    console.error('Error loading idiom data:', error);
    return [];
  }
};

// Sub Category별 성어 데이터 가져오기 (실제로는 메인 카테고리별 필터링)
export const getIdiomsBySubCategory = async (subCategory) => {
  try {
    console.log('getIdiomsBySubCategory 호출됨, subCategory:', subCategory);
    
    if (!subCategory || subCategory === 'all') {
      console.log('전체 성어 반환');
      return idiomData;
    }
    
    // 즐겨찾기 처리
    if (subCategory === 'favorites') {
      const favorites = JSON.parse(localStorage.getItem('favoriteIdioms') || '[]');
      return idiomData.filter(idiom => favorites.includes(idiom.line || idiom.id));
    }
    
    // 메인 카테고리별 필터링 (category 기준) - 모든 카테고리 처리
    console.log('카테고리로 필터링:', subCategory);
    const filtered = idiomData.filter(idiom => idiom.category === subCategory);
    console.log('필터링된 성어 개수:', filtered.length);
    console.log('첫 번째 성어 샘플:', filtered[0]);
    return filtered;
  } catch (error) {
    console.error('Error getting idioms by sub category:', error);
    return [];
  }
};

// Category별 성어 데이터 가져오기 (기존 함수 유지)
export const getIdiomsByCategory = async (categoryId) => {
  try {
    if (!categoryId) return [];
    
    // 즐겨찾기 처리
    if (categoryId === 'favorites') {
      // localStorage에서 즐겨찾기 목록 가져오기
      const favorites = JSON.parse(localStorage.getItem('favoriteIdioms') || '[]');
      return idiomData.filter(idiom => favorites.includes(idiom.line || idiom.id));
    }
    
    // 카테고리별 필터링 (category 필드 사용)
    return idiomData.filter(idiom => 
      idiom.category === categoryId
    );
  } catch (error) {
    console.error('Error getting idioms by category:', error);
    return [];
  }
};

// 성어 카테고리 목록 가져오기  
export const getIdiomCategories = () => {
  try {
    // 성어 데이터에서 고유한 카테고리 추출
    const categories = new Map();
    
    idiomData.forEach(idiom => {
      // category 필드 처리
      if (idiom.category) {
        const categoryId = idiom.category;
        if (!categories.has(categoryId)) {
          categories.set(categoryId, {
            id: categoryId,
            name: categoryId, // 실제 카테고리 이름 사용
            description: getCategoryDescription(categoryId),
            wordCount: 1
          });
        } else {
          const category = categories.get(categoryId);
          category.wordCount++;
        }
      }
    });
    
    return Array.from(categories.values()).sort((a, b) => b.wordCount - a.wordCount);
  } catch (error) {
    console.error('Error loading idiom categories:', error);
    return [];
  }
};

// Sub Category 목록 가져오기 (실제로는 메인 카테고리 목록)
export const getIdiomSubCategories = () => {
  try {
    // 성어 데이터에서 고유한 category 추출
    const subCategories = new Map();
    
    idiomData.forEach(idiom => {
      // category 필드 처리
      if (idiom.category) {
        const categoryId = idiom.category;
        if (!subCategories.has(categoryId)) {
          subCategories.set(categoryId, {
            id: categoryId,
            name: categoryId,
            wordCount: 1
          });
        } else {
          const category = subCategories.get(categoryId);
          category.wordCount++;
        }
      }
    });
    
    return Array.from(subCategories.values()).sort((a, b) => b.wordCount - a.wordCount);
  } catch (error) {
    console.error('Error loading idiom sub categories:', error);
    return [];
  }
};

// 카테고리 ID에 따른 설명 반환
function getCategoryDescription(categoryId) {
  const categoryDescriptions = {
    '수량/숫자 표현': '숫자를 포함한 수량 표현 성어',
    '동물/자연 관련': '동물이나 자연을 소재로 한 성어',
    '인물/행동 관련': '인물의 행동이나 성격을 나타내는 성어',
    '기타/비유/고사': '비유나 고사에서 유래된 성어'
  };
  
  return categoryDescriptions[categoryId] || `${categoryId} 관련 성어`;
}