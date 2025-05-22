// firebase.js - 로컬 개발용 더미 파일
// 이 프로젝트는 로컬 JSON 데이터를 사용하므로 Firebase는 사용하지 않습니다.

// 로컬 개발용 더미 Firestore DB 객체
export const db = {
  // 더미 함수들
  collection: () => ({
    where: () => ({
      get: async () => ({ 
        empty: false,
        forEach: (cb) => {}
      })
    }),
    get: async () => ({
      empty: false,
      forEach: (cb) => {}
    })
  })
};