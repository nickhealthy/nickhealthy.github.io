---
title: '[이코테-DP]_효율적인 화폐'
date: 2021-04-01 16:20:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

## 문제 설명

N의 화폐들 중 최소한의 화폐 개수로 M를 만들어라

## My Solution

```python
n, m = map(int, input().split())

arr = []
[arr.append(int(input())) for _ in range(n)]
# 한번 계산된 결과를 저장하기 위한 DP테이블
d = [10001] * (m + 1)

# 다이나믹 프로그래밍 진행 (보텀업)
d[0] = 0
for i in range(n):
    for j in range(arr[i], m + 1):
        if d[j - arr[i]] != 10001: # (i - k)원을 만드는 방법이 존재하는 경우
            d[j] = min(d[j], d[j - arr[i]] + 1)

# 계산된 결과를 출력
if d[m] == 10001:   # 최종적으로 M원을 만드는 방법이 없는 경우
    print(-1)
else:
    print(d[m])
```

## 문제 풀이

- M은 최대 금액이 10,000원을 넘지 않는다 하였으므로, `dp_table`를 10,001로 초기화
  - 단, d[0]은 0원이라는 가정하에 0을 대입
- 이중 for문으로 **모든 화폐 금액(종류)에 대해서 목표 금액을 만들 때 가장 작은 화페의 개수로 만들 수 있는지 체크**
  - 최종적으로 min함수에 의해 가장 적은 화폐를 사용한 개수가 누적됨
- 또한 마지막 최종 목표 금액에서 초기화 했던 10,001 값이 들어 있다면, 이 값은 현재의 화폐 종류들로 만들 수 없다는 걸 의미해 `-1`를 출력, 만들 수 있다면 마지막 인덱스의 값 출력
