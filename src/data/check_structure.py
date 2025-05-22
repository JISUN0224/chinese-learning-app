import json

# merged_vocab.json 파일 구조 확인
with open('merged_vocab.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total vocabulary count: {len(data)}")
print(f"First 3 items: {data[:3]}")
if data:
    print(f"Sample structure keys: {list(data[0].keys())}")

# HSK 레벨 분포 확인
hsk_levels = {}
for item in data:
    if 'hsk' in item and item['hsk']:
        level = item['hsk']
        hsk_levels[level] = hsk_levels.get(level, 0) + 1

print(f"HSK level distribution: {hsk_levels}")

# 구조 예시
print(f"\nSample item: {data[0]}")
