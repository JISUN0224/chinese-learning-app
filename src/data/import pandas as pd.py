import pandas as pd
import json
import os


# 엑셀 파일 경로 (파일 경로를 본인의 환경에 맞게 수정하세요)
excel_file_path = 'C:/Users/jisun/Desktop/firebase_project/3_word/chinese-learning-project-1/public/data/chengyuxlsx.xlsx'


# 엑셀 파일 읽기
df = pd.read_excel(excel_file_path)

# NaN 값을 None으로 변환 (JSON으로 변환할 때 NaN 값이 문제가 될 수 있음)
df = df.where(pd.notnull(df), None)

# 데이터프레임을 딕셔너리 리스트로 변환
chengyu_list = df.to_dict(orient='records')

# JSON 파일로 저장
output_file_path = 'chengyu_data.json'
with open(output_file_path, 'w', encoding='utf-8') as f:
    json.dump(chengyu_list, f, ensure_ascii=False, indent=2)

print(f"변환 완료: '{output_file_path}' 파일이 생성되었습니다.")
print(f"총 {len(chengyu_list)}개의 성어가 변환되었습니다.")

# 변환된 데이터 예시 출력
if chengyu_list:
    print("\n첫 번째 항목 예시:")
    print(json.dumps(chengyu_list[0], ensure_ascii=False, indent=2))