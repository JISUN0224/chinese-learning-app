import json
import google.generativeai as genai
import time
import os
from typing import List, Dict, Any
from datetime import datetime

# Gemini API 설정
GEMINI_API_KEY = "AIzaSyDuYkCYdaSeR_M-ADD8ylwmpKWbku61u00"  # 여기에 실제 API 키를 입력하세요
genai.configure(api_key=GEMINI_API_KEY)

# 카테고리 정의
CATEGORIES = [
    "학교·교육",
    "직장·비즈니스", 
    "여행·교통",
    "음식·요리",
    "건강·병원",
    "감정·성격",
    "자연·날씨",
    "기타"
]

# 설정
CONFIG = {
    "batch_size": 15,  # 한 번에 처리할 어휘 수 (안전하게 줄임)
    "delay": 2,        # API 호출 간 대기 시간 (초)
    "save_interval": 5,  # 몇 배치마다 중간 저장할지
    "backup_folder": "backup_categorization"  # 백업 폴더명
}

class VocabularyCategorizer:
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
        return os.path.join(self.backup_folder, f"{base_name}_progress.json")
    
    def save_progress(self, vocab_data: List[Dict], progress_file: str, current_batch: int, total_batches: int):
        """진행상황 저장"""
        progress_info = {
            "timestamp": datetime.now().isoformat(),
            "current_batch": current_batch,
            "total_batches": total_batches,
            "processed_count": sum(1 for vocab in vocab_data if 'category' in vocab),
            "total_count": len(vocab_data)
        }
        
        # 데이터와 진행상황을 함께 저장
        backup_data = {
            "progress": progress_info,
            "vocab_data": vocab_data
        }
        
        with open(progress_file, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 진행상황 저장됨: 배치 {current_batch}/{total_batches}")
    
    def load_progress(self, progress_file: str) -> tuple:
        """진행상황 로드"""
        if not os.path.exists(progress_file):
            return None, 0
        
        try:
            with open(progress_file, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)
            
            vocab_data = backup_data.get("vocab_data", [])
            progress = backup_data.get("progress", {})
            current_batch = progress.get("current_batch", 0)
            
            print(f"📂 이전 진행상황 발견:")
            print(f"   - 마지막 처리 배치: {current_batch}")
            print(f"   - 처리된 어휘: {progress.get('processed_count', 0)}개")
            print(f"   - 마지막 저장시간: {progress.get('timestamp', 'Unknown')}")
            
            return vocab_data, current_batch
            
        except Exception as e:
            print(f"⚠️ 진행상황 로드 실패: {e}")
            return None, 0
    
    def estimate_cost_and_time(self, total_vocab: int) -> dict:
        """비용 및 시간 예상"""
        total_batches = (total_vocab + self.batch_size - 1) // self.batch_size
        
        # Gemini 1.5 Flash 예상 비용 (2024년 기준, 실제와 다를 수 있음)
        estimated_tokens_per_batch = 1000  # 대략적인 토큰 수
        total_tokens = total_batches * estimated_tokens_per_batch
        
        # 시간 예상 (배치 처리 시간 + 대기 시간)
        estimated_time_minutes = (total_batches * (3 + self.delay)) / 60
        
        return {
            "total_batches": total_batches,
            "estimated_time_minutes": round(estimated_time_minutes, 1),
            "estimated_tokens": total_tokens
        }
        
    def create_categorization_prompt(self, vocab_batch: List[Dict]) -> str:
        """배치 단위로 카테고리 분류 프롬프트 생성"""
        
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
다음 중국어 어휘들을 아래 8개 카테고리 중 하나로 분류해주세요:

카테고리:
1. 학교·교육 - 학교, 공부, 교육, 학습 관련
2. 직장·비즈니스 - 회사, 업무, 경제, 금융 관련  
3. 여행·교통 - 여행, 교통수단, 숙박, 관광 관련
4. 음식·요리 - 음식, 요리, 식당, 식재료 관련
5. 건강·병원 - 건강, 의료, 병원, 약품 관련
6. 감정·성격 - 감정, 성격, 심리상태 관련
7. 자연·날씨 - 자연, 날씨, 환경, 동식물 관련
8. 기타 - 위 카테고리에 해당하지 않는 일반적인 단어

분류할 어휘:
{vocab_list}

응답 형식: 각 어휘 번호와 카테고리명을 정확히 매칭해서 다음과 같이 답해주세요:
1: 카테고리명
2: 카테고리명
3: 카테고리명
...

주의사항:
- 반드시 위의 8개 카테고리 중에서만 선택하세요
- 어휘의 의미와 사용 맥락을 고려해서 가장 적절한 카테고리를 선택하세요
- 모든 어휘에 대해 응답해주세요
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
        """배치 단위로 어휘 카테고리 분류"""
        try:
            prompt = self.create_categorization_prompt(vocab_batch)
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
    
    def categorize_vocabulary_file(self, input_file: str, output_file: str):
        """전체 어휘 파일 카테고리 분류"""
        print(f"📂 파일 로딩: {input_file}")
        
        # 진행상황 파일 경로
        progress_file = self.create_progress_file(output_file)
        
        # 이전 진행상황 확인
        vocab_data, start_batch = self.load_progress(progress_file)
        
        if vocab_data is None:
            # 새로 시작하는 경우
            with open(input_file, 'r', encoding='utf-8') as f:
                vocab_data = json.load(f)
            start_batch = 0
            print(f"📊 새로운 작업 시작 - 총 어휘 수: {len(vocab_data)}개")
        else:
            print(f"🔄 이전 작업 이어서 진행 - 총 어휘 수: {len(vocab_data)}개")
            
            # 계속 진행할지 확인
            response = input("이전 작업을 이어서 진행하시겠습니까? (y/n): ")
            if response.lower() != 'y':
                print("❌ 작업을 취소합니다.")
                return
        
        # 비용 및 시간 예상
        estimates = self.estimate_cost_and_time(len(vocab_data))
        total_batches = estimates["total_batches"]
        
        print(f"\n📊 작업 예상 정보:")
        print(f"   - 총 배치 수: {total_batches}개")
        print(f"   - 예상 소요 시간: {estimates['estimated_time_minutes']}분")
        print(f"   - 예상 토큰 사용량: {estimates['estimated_tokens']:,}개")
        print(f"   - 배치당 대기 시간: {self.delay}초")
        print(f"   - 중간 저장 주기: {self.save_interval}배치마다")
        
        # 시작 확인
        if start_batch == 0:
            response = input("\n작업을 시작하시겠습니까? (y/n): ")
            if response.lower() != 'y':
                print("❌ 작업을 취소합니다.")
                return
        
        print(f"🔄 배치 크기: {self.batch_size}개씩 처리")
        
        # 기존에 category가 있는지 확인 (새 작업인 경우만)
        if start_batch == 0:
            existing_categories = sum(1 for vocab in vocab_data if 'category' in vocab)
            if existing_categories > 0:
                print(f"✅ 이미 카테고리가 있는 어휘: {existing_categories}개")
                response = input("기존 카테고리를 덮어쓰시겠습니까? (y/n): ")
                if response.lower() != 'y':
                    print("❌ 작업을 취소합니다.")
                    return
        
        # 배치별로 처리
        processed_count = sum(1 for vocab in vocab_data if 'category' in vocab)
        
        try:
            for batch_idx in range(start_batch, total_batches):
                start_idx = batch_idx * self.batch_size
                end_idx = min(start_idx + self.batch_size, len(vocab_data))
                batch = vocab_data[start_idx:end_idx]
                
                print(f"\n🔄 배치 {batch_idx + 1}/{total_batches} 처리 중... ({start_idx+1}-{end_idx})")
                
                # 이미 카테고리가 있는 어휘는 건너뛰기 (선택사항)
                batch_to_process = []
                batch_indices = []
                for i, vocab in enumerate(batch):
                    if 'category' not in vocab or vocab.get('category') == '':
                        batch_to_process.append(vocab)
                        batch_indices.append(start_idx + i)
                
                if batch_to_process:
                    print(f"   📝 실제 처리할 어휘: {len(batch_to_process)}개")
                    
                    # 카테고리 분류
                    categories = self.categorize_batch(batch_to_process)
                    
                    # 결과 적용
                    for i, category in enumerate(categories):
                        vocab_data[batch_indices[i]]['category'] = category
                        processed_count += 1
                else:
                    print(f"   ⏭️ 이미 처리된 배치 건너뛰기")
                
                # 진행상황 출력
                print(f"✅ 완료: {processed_count}/{len(vocab_data)} ({(processed_count/len(vocab_data)*100):.1f}%)")
                
                # 중간 저장
                if (batch_idx + 1) % self.save_interval == 0 or batch_idx == total_batches - 1:
                    self.save_progress(vocab_data, progress_file, batch_idx + 1, total_batches)
                
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
            self.save_progress(vocab_data, progress_file, batch_idx, total_batches)
            print(f"💾 오류 발생 전까지의 진행상황이 저장되었습니다.")
            return
        
        # 최종 결과 저장
        print(f"\n💾 최종 결과 저장: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(vocab_data, f, ensure_ascii=False, indent=2)
        
        # 백업 파일도 저장
        backup_final = os.path.join(self.backup_folder, f"final_{os.path.basename(output_file)}")
        with open(backup_final, 'w', encoding='utf-8') as f:
            json.dump(vocab_data, f, ensure_ascii=False, indent=2)
        
        # 카테고리별 통계
        category_stats = {}
        for vocab in vocab_data:
            category = vocab.get('category', '미분류')
            category_stats[category] = category_stats.get(category, 0) + 1
        
        print("\n📈 카테고리별 분류 결과:")
        for category, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"  {category}: {count}개")
        
        # 진행상황 파일 정리
        if os.path.exists(progress_file):
            os.remove(progress_file)
            print(f"🗑️ 진행상황 파일 정리 완료")
        
        print(f"\n🎉 완료! 총 {len(vocab_data)}개 어휘가 분류되었습니다.")
        print(f"📁 백업 파일: {backup_final}")

def main():
    """메인 실행 함수"""
    print("🚀 중국어 어휘 카테고리 자동 분류기")
    print("=" * 50)
    
    # API 키 확인
    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("❌ Gemini API 키를 설정해주세요!")
        print("코드 상단의 GEMINI_API_KEY 변수에 실제 API 키를 입력하세요.")
        return
    
    # 파일 경로 설정
    input_file = "merged_vocab.json"  # 입력 파일명
    output_file = "merged_vocab_categorized.json"  # 출력 파일명
    
    # 입력 파일 존재 확인
    if not os.path.exists(input_file):
        print(f"❌ 입력 파일을 찾을 수 없습니다: {input_file}")
        print("파일 경로를 확인해주세요.")
        return
    
    # 분류기 실행
    categorizer = VocabularyCategorizer()
    
    try:
        categorizer.categorize_vocabulary_file(input_file, output_file)
    except KeyboardInterrupt:
        print("\n⏹️ 사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    main()