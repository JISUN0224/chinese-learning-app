import json
import google.generativeai as genai
import time
import os
from typing import List, Dict, Any
from datetime import datetime

# Gemini API 설정
GEMINI_API_KEY = "AIzaSyDuYkCYdaSeR_M-ADD8ylwmpKWbku61u00"  # 여기에 실제 API 키를 입력하세요
genai.configure(api_key=GEMINI_API_KEY)

# 확장된 카테고리 정의
CATEGORIES = [
    "학교·교육",
    "직장·비즈니스", 
    "여행·교통",
    "음식·요리",
    "건강·병원",
    "감정·성격",
    "자연·날씨",
    "일상생활·가정",  # 새로 추가된 카테고리
    "기타"
]

# 설정
CONFIG = {
    "batch_size": 10,  # 기타 재분류용으로 더 작게 설정
    "delay": 2,        # API 호출 간 대기 시간 (초)
    "save_interval": 3,  # 몇 배치마다 중간 저장할지
    "backup_folder": "backup_recategorization"  # 백업 폴더명
}

class VocabularyRecategorizer:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.batch_size = CONFIG["batch_size"]
        self.delay = CONFIG["delay"]
        self.save_interval = CONFIG["save_interval"]
        self.backup_folder = CONFIG["backup_folder"]
        
        # 백업 폴더 생성
        if not os.path.exists(self.backup_folder):
            os.makedirs(self.backup_folder)
    
    def create_progress_file(self, output_file: str) -> str:
        """진행상황 파일 경로 생성"""
        base_name = os.path.splitext(os.path.basename(output_file))[0]
        return os.path.join(self.backup_folder, f"{base_name}_recategorize_progress.json")
    
    def save_progress(self, vocab_data: List[Dict], etc_indices: List[int], progress_file: str, current_batch: int, total_batches: int):
        """진행상황 저장"""
        progress_info = {
            "timestamp": datetime.now().isoformat(),
            "current_batch": current_batch,
            "total_batches": total_batches,
            "processed_count": sum(1 for i in etc_indices if vocab_data[i].get('category') != '기타'),
            "total_etc_count": len(etc_indices)
        }
        
        # 데이터와 진행상황을 함께 저장
        backup_data = {
            "progress": progress_info,
            "vocab_data": vocab_data,
            "etc_indices": etc_indices
        }
        
        with open(progress_file, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 진행상황 저장됨: 배치 {current_batch}/{total_batches}")
    
    def load_progress(self, progress_file: str) -> tuple:
        """진행상황 로드"""
        if not os.path.exists(progress_file):
            return None, None, 0
        
        try:
            with open(progress_file, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)
            
            vocab_data = backup_data.get("vocab_data", [])
            etc_indices = backup_data.get("etc_indices", [])
            progress = backup_data.get("progress", {})
            current_batch = progress.get("current_batch", 0)
            
            print(f"📂 이전 진행상황 발견:")
            print(f"   - 마지막 처리 배치: {current_batch}")
            print(f"   - 재분류된 어휘: {progress.get('processed_count', 0)}개")
            print(f"   - 총 기타 어휘: {progress.get('total_etc_count', 0)}개")
            print(f"   - 마지막 저장시간: {progress.get('timestamp', 'Unknown')}")
            
            return vocab_data, etc_indices, current_batch
            
        except Exception as e:
            print(f"⚠️ 진행상황 로드 실패: {e}")
            return None, None, 0
    
    def find_etc_vocabulary(self, vocab_data: List[Dict]) -> List[int]:
        """기타 카테고리로 분류된 어휘들의 인덱스 찾기"""
        etc_indices = []
        for i, vocab in enumerate(vocab_data):
            if vocab.get('category') == '기타':
                etc_indices.append(i)
        return etc_indices
    
    def create_recategorization_prompt(self, vocab_batch: List[Dict]) -> str:
        """기타 재분류용 개선된 프롬프트 생성"""
        
        vocab_list = ""
        for i, vocab in enumerate(vocab_batch, 1):
            simplified = vocab.get('simplified', '')
            meaning = vocab.get('meaning', {}).get('ko', '')
            example_zh = vocab.get('example', {}).get('zh', '')
            example_ko = vocab.get('example', {}).get('ko', '')
            
            vocab_list += f"{i}. {simplified} - {meaning}\n"
            if example_zh and example_ko:
                vocab_list += f"   예문: {example_zh} ({example_ko})\n"
            vocab_list += "\n"
        
        prompt = f"""
다음 중국어 어휘들을 아래 9개 카테고리 중 하나로 분류해주세요. 
이 어휘들은 이전에 "기타"로 분류되었지만, 더 구체적인 카테고리로 재분류하려고 합니다.

카테고리:
1. 학교·교육 - 학교, 공부, 교육, 학습, 시험, 책, 연필, 교실, 선생님, 학생 관련
2. 직장·비즈니스 - 회사, 업무, 경제, 금융, 사무용품, 회의, 계약, 돈, 은행 관련
3. 여행·교통 - 여행, 교통수단, 숙박, 관광, 비행기, 기차, 버스, 호텔, 공항 관련
4. 음식·요리 - 음식, 요리, 식당, 식재료, 맛, 주방용품, 음료, 과일, 야채 관련
5. 건강·병원 - 건강, 의료, 병원, 약품, 증상, 치료, 운동, 몸, 의사 관련
6. 감정·성격 - 감정, 성격, 심리상태, 기분, 성향, 태도, 느낌 관련
7. 자연·날씨 - 자연, 날씨, 환경, 동식물, 계절, 바람, 비, 산, 바다, 꽃 관련
8. 일상생활·가정 - 집, 가족, 일상용품, 생활용품, 가구, 전자제품, 옷, 청소, 요리도구, 침실, 거실 관련
9. 기타 - 위 8개 카테고리에 정말로 해당하지 않는 매우 추상적이거나 특수한 단어

분류할 어휘:
{vocab_list}

분류 지침:
- 단어의 핵심 의미와 가장 일반적인 사용 맥락을 고려하세요
- 여러 카테고리에 해당할 수 있다면, 가장 대표적인 카테고리를 선택하세요
- "일상생활·가정" 카테고리를 적극 활용하세요 (가정용품, 생활용품, 의류, 가구 등)
- "기타"는 정말로 분류가 불가능한 경우에만 사용하세요
- 구체적인 사물이나 행동은 가능한 한 구체적 카테고리에 배정하세요

응답 형식: 각 어휘 번호와 카테고리명을 정확히 매칭해서 다음과 같이 답해주세요:
1: 카테고리명
2: 카테고리명
3: 카테고리명
...

주의사항:
- 반드시 위의 9개 카테고리 중에서만 선택하세요
- 모든 어휘에 대해 응답해주세요
- 카테고리명은 정확히 위에 제시된 이름과 일치해야 합니다
"""
        return prompt
    
    def parse_gemini_response(self, response: str, vocab_batch: List[Dict]) -> List[str]:
        """Gemini 응답을 파싱해서 카테고리 목록 반환"""
        categories = []
        lines = response.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if ':' in line:
                try:
                    # "1: 학교·교육" 형태에서 카테고리 추출
                    category = line.split(':', 1)[1].strip()
                    if category in CATEGORIES:
                        categories.append(category)
                    else:
                        print(f"⚠️ 알 수 없는 카테고리: {category}")
                        categories.append("기타")
                except:
                    categories.append("기타")
        
        # 응답이 부족한 경우 "기타"로 채우기
        while len(categories) < len(vocab_batch):
            categories.append("기타")
            
        return categories[:len(vocab_batch)]
    
    def categorize_batch(self, vocab_batch: List[Dict]) -> List[str]:
        """배치 단위로 어휘 카테고리 재분류"""
        try:
            prompt = self.create_recategorization_prompt(vocab_batch)
            response = self.model.generate_content(prompt)
            
            if response.text:
                categories = self.parse_gemini_response(response.text, vocab_batch)
                return categories
            else:
                print("⚠️ Gemini 응답이 비어있습니다.")
                return ["기타"] * len(vocab_batch)
                
        except Exception as e:
            print(f"❌ Gemini API 오류: {e}")
            return ["기타"] * len(vocab_batch)
    
    def recategorize_etc_vocabulary(self, input_file: str, output_file: str):
        """기타 카테고리 어휘들만 재분류"""
        print(f"📂 파일 로딩: {input_file}")
        
        # 진행상황 파일 경로
        progress_file = self.create_progress_file(output_file)
        
        # 이전 진행상황 확인
        vocab_data, etc_indices, start_batch = self.load_progress(progress_file)
        
        if vocab_data is None:
            # 새로 시작하는 경우
            with open(input_file, 'r', encoding='utf-8') as f:
                vocab_data = json.load(f)
            
            # 기타 카테고리 어휘들 찾기
            etc_indices = self.find_etc_vocabulary(vocab_data)
            start_batch = 0
            
            print(f"📊 분석 결과:")
            print(f"   - 전체 어휘 수: {len(vocab_data)}개")
            print(f"   - 기타 카테고리 어휘: {len(etc_indices)}개")
            print(f"   - 재분류 비율: {len(etc_indices)/len(vocab_data)*100:.1f}%")
            
            if len(etc_indices) == 0:
                print("✅ 기타 카테고리로 분류된 어휘가 없습니다!")
                return
        else:
            print(f"🔄 이전 작업 이어서 진행 - 기타 어휘: {len(etc_indices)}개")
            
            # 계속 진행할지 확인
            response = input("이전 작업을 이어서 진행하시겠습니까? (y/n): ")
            if response.lower() != 'y':
                print("❌ 작업을 취소합니다.")
                return
        
        # 배치 계산
        total_batches = (len(etc_indices) + self.batch_size - 1) // self.batch_size
        
        print(f"\n📊 재분류 작업 정보:")
        print(f"   - 처리할 어휘 수: {len(etc_indices)}개")
        print(f"   - 총 배치 수: {total_batches}개")
        print(f"   - 배치당 어휘 수: {self.batch_size}개")
        print(f"   - 배치간 대기시간: {self.delay}초")
        
        # 시작 확인
        if start_batch == 0:
            print(f"\n📋 확장된 카테고리:")
            for i, cat in enumerate(CATEGORIES, 1):
                if cat == "일상생활·가정":
                    print(f"   {i}. {cat} ⭐ (새로 추가됨)")
                else:
                    print(f"   {i}. {cat}")
            
            response = input("\n기타 카테고리 재분류 작업을 시작하시겠습니까? (y/n): ")
            if response.lower() != 'y':
                print("❌ 작업을 취소합니다.")
                return
        
        # 배치별로 처리
        recategorized_count = 0
        
        try:
            for batch_idx in range(start_batch, total_batches):
                start_idx = batch_idx * self.batch_size
                end_idx = min(start_idx + self.batch_size, len(etc_indices))
                
                # 현재 배치의 어휘들 가져오기
                batch_vocab_indices = etc_indices[start_idx:end_idx]
                batch_vocab = [vocab_data[i] for i in batch_vocab_indices]
                
                print(f"\n🔄 배치 {batch_idx + 1}/{total_batches} 처리 중... ({len(batch_vocab)}개 어휘)")
                
                # 어휘 미리보기
                print("   📝 처리할 어휘들:")
                for vocab in batch_vocab[:3]:  # 처음 3개만 미리보기
                    simplified = vocab.get('simplified', '')
                    meaning = vocab.get('meaning', {}).get('ko', '')
                    print(f"      - {simplified} ({meaning})")
                if len(batch_vocab) > 3:
                    print(f"      ... 외 {len(batch_vocab)-3}개")
                
                # 카테고리 재분류
                new_categories = self.categorize_batch(batch_vocab)
                
                # 결과 적용 및 통계
                batch_stats = {}
                for i, new_category in enumerate(new_categories):
                    vocab_data[batch_vocab_indices[i]]['category'] = new_category
                    batch_stats[new_category] = batch_stats.get(new_category, 0) + 1
                    if new_category != '기타':
                        recategorized_count += 1
                
                # 배치 결과 출력
                print(f"   ✅ 배치 결과:")
                for cat, count in batch_stats.items():
                    if cat != '기타':
                        print(f"      - {cat}: {count}개 ⭐")
                    else:
                        print(f"      - {cat}: {count}개")
                
                # 전체 진행상황 출력
                processed_batches = batch_idx + 1
                total_processed = processed_batches * self.batch_size
                if total_processed > len(etc_indices):
                    total_processed = len(etc_indices)
                
                print(f"📊 전체 진행상황: {total_processed}/{len(etc_indices)} ({total_processed/len(etc_indices)*100:.1f}%)")
                print(f"🎯 재분류 성공: {recategorized_count}개")
                
                # 중간 저장
                if (batch_idx + 1) % self.save_interval == 0 or batch_idx == total_batches - 1:
                    self.save_progress(vocab_data, etc_indices, progress_file, batch_idx + 1, total_batches)
                
                # API 호출 제한을 위한 대기
                if batch_idx < total_batches - 1:  # 마지막 배치가 아닌 경우
                    print(f"⏳ {self.delay}초 대기 중...")
                    time.sleep(self.delay)
        
        except KeyboardInterrupt:
            print(f"\n⏹️ 사용자에 의해 중단되었습니다.")
            print(f"💾 현재까지의 진행상황이 저장되었습니다: {progress_file}")
            print(f"🔄 다시 스크립트를 실행하면 이어서 진행할 수 있습니다.")
            return
        
        except Exception as e:
            print(f"❌ 오류 발생: {e}")
            self.save_progress(vocab_data, etc_indices, progress_file, batch_idx, total_batches)
            print(f"💾 오류 발생 전까지의 진행상황이 저장되었습니다.")
            return
        
        # 최종 결과 저장
        print(f"\n💾 최종 결과 저장: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(vocab_data, f, ensure_ascii=False, indent=2)
        
        # 백업 파일도 저장
        backup_final = os.path.join(self.backup_folder, f"final_recategorized_{os.path.basename(output_file)}")
        with open(backup_final, 'w', encoding='utf-8') as f:
            json.dump(vocab_data, f, ensure_ascii=False, indent=2)
        
        # 재분류 결과 통계
        final_category_stats = {}
        for vocab in vocab_data:
            category = vocab.get('category', '미분류')
            final_category_stats[category] = final_category_stats.get(category, 0) + 1
        
        print("\n📈 최종 카테고리별 분류 결과:")
        for category, count in sorted(final_category_stats.items(), key=lambda x: x[1], reverse=True):
            if category == "기타":
                print(f"  {category}: {count}개 (재분류 후)")
            else:
                print(f"  {category}: {count}개")
        
        # 재분류 성과 요약
        remaining_etc = final_category_stats.get('기타', 0)
        original_etc = len(etc_indices)
        success_rate = (recategorized_count / original_etc * 100) if original_etc > 0 else 0
        
        print(f"\n🎉 재분류 완료!")
        print(f"  📊 원래 기타: {original_etc}개")
        print(f"  ✅ 재분류 성공: {recategorized_count}개")
        print(f"  📉 남은 기타: {remaining_etc}개") 
        print(f"  🎯 성공률: {success_rate:.1f}%")
        
        # 진행상황 파일 정리
        if os.path.exists(progress_file):
            os.remove(progress_file)
            print(f"🗑️ 진행상황 파일 정리 완료")
        
        print(f"📁 백업 파일: {backup_final}")

def main():
    """메인 실행 함수"""
    print("🔄 중국어 어휘 기타 카테고리 재분류기")
    print("=" * 60)
    
    # API 키 확인
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("❌ Gemini API 키를 설정해주세요!")
        print("코드 상단의 GEMINI_API_KEY 변수에 실제 API 키를 입력하세요.")
        return
    
    # 파일 경로 설정
    input_file = r"C:\Users\jisun\Desktop\firebase_project\3_word\chinese-learning-project-1\src\data\merged_vocab_categorized.json"
    output_file = "merged_vocab_recategorized.json"  # 재분류 결과 파일
    
    # 입력 파일 존재 확인
    if not os.path.exists(input_file):
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        print("파일 경로를 확인해주세요.")
        return
    
    # 재분류기 실행
    recategorizer = VocabularyRecategorizer()
    
    try:
        recategorizer.recategorize_etc_vocabulary(input_file, output_file)
    except KeyboardInterrupt:
        print("\n⏹️ 사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    main()