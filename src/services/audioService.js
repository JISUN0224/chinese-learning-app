// 오디오 관련 서비스 함수들

// TTS(Text-to-Speech) 음성 재생
export const playChineseAudio = async (text, speed = 'normal') => {
  if (!text) {
    console.warn('재생할 텍스트가 없습니다.');
    return;
  }

  try {
    // Web Speech API 지원 확인
    if (!('speechSynthesis' in window)) {
      throw new Error('브라우저가 음성 합성을 지원하지 않습니다.');
    }

    // 진행 중인 음성 정지
    window.speechSynthesis.cancel();

    // 음성 합성 설정
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 중국어 음성 설정
    utterance.lang = 'zh-CN'; // 중국어 (간체)
    
    // 속도 설정
    if (speed === 'slow') {
      utterance.rate = 0.6; // 천천히
    } else {
      utterance.rate = 0.8; // 보통 속도
    }
    
    utterance.pitch = 1; // 음조
    utterance.volume = 1; // 음량

    // 음성 재생
    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        console.log('음성 재생 완료:', text);
        resolve();
      };
      
      utterance.onerror = (error) => {
        console.error('음성 재생 실패:', error);
        reject(error);
      };
      
      window.speechSynthesis.speak(utterance);
    });
    
  } catch (error) {
    console.error('중국어 음성 재생 실패:', error);
    throw error;
  }
};

// 음성 재생 정지
export const stopAudio = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// 기존 오디오 재생 (파일 기반)
export const playAudio = async (audioElement, audioUrl) => {
  if (!audioElement || !audioUrl) return;
  
  try {
    audioElement.src = audioUrl;
    await audioElement.play();
  } catch (error) {
    console.error('오디오 재생 실패:', error);
    throw error;
  }
};

// 성어 오디오 URL 가져오기
export const getIdiomAudio = async (idiomId) => {
  // 실제로는 서버에서 오디오 URL을 가져와야 함
  // 현재는 테스트를 위해 더미 데이터 사용
  console.log(`Audio requested for idiom ID: ${idiomId}`);
  
  // 임시로 null 반환 (실제 구현에서는 서버에서 URL 제공)
  return null;
};

// 발음 녹음
export const recordPronunciation = (onRecordingComplete) => {
  // 실제로는 브라우저의 MediaRecorder API를 사용해야 함
  console.log('Recording started...');
  
  // 녹음 시작 후 3초 뒤에 완료 시뮬레이션
  setTimeout(() => {
    console.log('Recording completed');
    if (onRecordingComplete) {
      onRecordingComplete();
    }
  }, 3000);
};

// 녹음된 발음 분석 (실제로는 AI 서비스를 사용해야 함)
export const analyzePronunciation = async (recordedAudio, correctAudio) => {
  // 실제로는 서버에 녹음된 오디오를 전송하고 분석 결과를 받아와야 함
  console.log('Analyzing pronunciation...');
  
  // 더미 분석 결과 반환
  return {
    score: Math.floor(Math.random() * 40) + 60, // 60-100 사이 랜덤 점수
    feedback: '발음이 좋습니다. 계속 연습하세요.'
  };
};