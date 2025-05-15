import argparse
import csv

def parse_vdbe_out(src):
    with open(src, 'r', encoding='utf-8') as txt_file:
        lines = [line.strip() for line in txt_file]

    statistics = {}

    csv_file_path = src.replace('.out', '.csv')

    for line in lines:
        splited = line.split()

        # 조건 검사
        if len(splited) < 5:
            continue
        if '-' in splited[0]:
            statistics = {}
            continue
        
        key = splited[4]
        index = splited[3]
        value = int(splited[1])

        if key in statistics:
            statistics[key] += value
        else:
            statistics[key] = value

    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(['key', 'value'])
        for statistic in statistics:
            writer.writerow([statistic, statistics[statistic]])

def main():
    parser = argparse.ArgumentParser(description='VDBe 파일 처리 스크립트')
    parser.add_argument('path', type=str, help='VDBe 파일의 경로')
    args = parser.parse_args()
    
    parse_vdbe_out(args.path)

if __name__ == '__main__':
    main()
