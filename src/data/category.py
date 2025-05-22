import json

# 파일 경로
input_path = "chengyu_data_merged.json"
output_path = "chengyu_data_numbered.json"

# JSON 파일 로드
with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# 각 항목에 'line' 필드 추가
for idx, item in enumerate(data, start=1):
    item["line"] = idx

# 저장
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ 완료: 총 {len(data)}개 항목에 line 번호 추가 → {output_path}")
