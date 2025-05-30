
# import re
# import numpy as np

# issue_times = {}
# latencies = []

# cpu_last_sector = {}
# distance_logs = []

# # 1. 모든 latency 먼저 계산
# with open("test.txt") as f:
#     for line in f:
#         match = re.search(r'(\d+\.\d+): block_rq_(issue|complete):.*\) (\d+) \+ \d+', line)
#         if not match:
#             continue
#         timestamp = float(match.group(1))
#         event = match.group(2)
#         sector = int(match.group(3))

#         if event == "issue":
#             issue_times[sector] = timestamp
#         elif event == "complete" and sector in issue_times:
#             latency = timestamp - issue_times[sector]
#             latencies.append((sector, latency))

# # 2. I/O latency 출력
# print("== I/O Latency ==")
# for sector, latency in sorted(latencies):
#     print(f"Sector: {sector}, Latency: {latency * 1000:.3f} ms")

# # 3. sector 거리(distance) 계산해서 나중에 출력
# with open("test.txt") as f:
#     for line in f:
#         match = re.search(r'\[\s*(\d+)\].*?(\d+\.\d+): block_rq_issue:.*\) (\d+) \+ \d+', line)
#         if not match:
#             continue

#         cpu_id = int(match.group(1))
#         sector = int(match.group(3))

#         if cpu_id in cpu_last_sector:
#             prev_sector = cpu_last_sector[cpu_id]
#             distance = abs(sector - prev_sector)
#             distance_logs.append((cpu_id, prev_sector, sector, distance))

#         cpu_last_sector[cpu_id] = sector

# # 4. distance 출력
# print("\n== Access Sector Distance ==")
# for cpu_id, prev_sector, curr_sector, distance in distance_logs:
#     print(f"CPU {cpu_id}: Sector {prev_sector} -> {curr_sector}, Distance = {distance}")

# # 5. tail latency 통계 계산 및 출력
# latency_values = [lat for _, lat in latencies]
# if latency_values:
#     p95_latency = np.percentile(latency_values, 95) * 1000
#     p99_latency = np.percentile(latency_values, 99) * 1000
#     max_latency = max(latency_values) * 1000
#     sum_latency = sum(latency_values) * 1000
#     average_latency = sum(latency_values) * 1000 / len(latency_values)

#     print("\n== Tail Latency Statistics ==")
#     print(f"P95 Latency: {p95_latency:.3f} ms")
#     print(f"P99 Latency: {p99_latency:.3f} ms")
#     print(f"Max Latency: {max_latency:.3f} ms")
#     print(f"Total Latency: {sum_latency:.3f} ms")
#     print(f"Average Latency: {average_latency:.2f} ms")
# else:
#     print("\nLatency data is empty.")

# # 6. tail distance 통계 계산 및 출력
# distance_values = [dist for _, _, _, dist in distance_logs]
# if distance_values:
#     p95_distance = np.percentile(distance_values, 95)
#     p99_distance = np.percentile(distance_values, 99)
#     max_distance = max(distance_values)
#     sum_distance = sum(distance_values)
#     average_distance = sum(distance_values) / len(distance_values)

#     print("\n== Tail Distance Statistics ==")
#     print(f"P95 Distance: {p95_distance:.0f}")
#     print(f"P99 Distance: {p99_distance:.0f}")
#     print(f"Max Distance: {max_distance:.0f}")
#     print(f"Total Distance: {sum_distance:.0f}")
#     print(f"Average Distance: {average_distance:.0f}")
# else:
#     print("\nDistance data is empty.")
import re
import sys
import numpy as np

if len(sys.argv) < 2:
    print("사용법: python script.py <파일이름>")
    sys.exit(1)

filename = sys.argv[1]

issue_times = {}
latencies = []

cpu_last_sector = {}
distance_logs = []

# 1. 모든 latency 먼저 계산
with open(filename) as f:
    for line in f:
        match = re.search(r'(\d+\.\d+): block_rq_(issue|complete):.*\) (\d+) \+ \d+', line)
        if not match:
            continue
        timestamp = float(match.group(1))
        event = match.group(2)
        sector = int(match.group(3))

        if event == "issue":
            issue_times[sector] = timestamp
        elif event == "complete" and sector in issue_times:
            latency = timestamp - issue_times[sector]
            latencies.append((sector, latency))

# 2. I/O latency 출력
print("== I/O Latency ==")
for sector, latency in sorted(latencies):
    print(f"Sector: {sector}, Latency: {latency * 1000:.3f} ms")

# 3. sector 거리(distance) 계산해서 나중에 출력
with open(filename) as f:
    for line in f:
        match = re.search(r'\[\s*(\d+)\].*?(\d+\.\d+): block_rq_issue:.*\) (\d+) \+ \d+', line)
        if not match:
            continue

        cpu_id = int(match.group(1))
        sector = int(match.group(3))

        if cpu_id in cpu_last_sector:
            prev_sector = cpu_last_sector[cpu_id]
            distance = abs(sector - prev_sector)
            distance_logs.append((cpu_id, prev_sector, sector, distance))

        cpu_last_sector[cpu_id] = sector

# 4. distance 출력
print("\n== Access Sector Distance ==")
for cpu_id, prev_sector, curr_sector, distance in distance_logs:
    print(f"CPU {cpu_id}: Sector {prev_sector} -> {curr_sector}, Distance = {distance}")

# 5. tail latency 통계 계산 및 출력
latency_values = [lat for _, lat in latencies]
if latency_values:
    p95_latency = np.percentile(latency_values, 95) * 1000
    p99_latency = np.percentile(latency_values, 99) * 1000
    max_latency = max(latency_values) * 1000
    sum_latency = sum(latency_values) * 1000
    average_latency = sum(latency_values) * 1000 / len(latency_values)

    print("\n== Tail Latency Statistics ==")
    print(f"P95 Latency: {p95_latency:.3f} ms")
    print(f"P99 Latency: {p99_latency:.3f} ms")
    print(f"Max Latency: {max_latency:.3f} ms")
    print(f"Total Latency: {sum_latency:.3f} ms")
    print(f"Average Latency: {average_latency:.2f} ms")
else:
    print("\nLatency data is empty.")

# 6. tail distance 통계 계산 및 출력
distance_values = [dist for _, _, _, dist in distance_logs]
if distance_values:
    p95_distance = np.percentile(distance_values, 95)
    p99_distance = np.percentile(distance_values, 99)
    max_distance = max(distance_values)
    sum_distance = sum(distance_values)
    average_distance = sum_distance / len(distance_values)

    print("\n== Tail Distance Statistics ==")
    print(f"P95 Distance: {p95_distance:.0f}")
    print(f"P99 Distance: {p99_distance:.0f}")
    print(f"Max Distance: {max_distance:.0f}")
    print(f"Total Distance: {sum_distance:.0f}")
    print(f"Average Distance: {average_distance:.0f}")
else:
    print("\nDistance data is empty.")
