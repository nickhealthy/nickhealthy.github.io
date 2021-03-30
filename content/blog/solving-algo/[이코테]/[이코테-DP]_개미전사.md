---
title: '[이코테-DP]_개미 전사'
date: 2021-03-30 12:02:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

## 문제 설명

일렬로 된 배열에서`(arr)` 인접한 인덱스를 제외하고, 더했을 때 가장 높은 값을 구하는 문제

## My Solution

```python
n = int(input())
arr = list(map(int, input().split()))
dp_table = [0] * 100

dp_table[0] = arr[0]
dp_table[1] = max(arr[0], arr[1])

for i in range(2, n):
    dp_table[i] = max(arr[i], arr[i - 2] + arr[i])

print(dp_table[n - 1])
```

## 문제 풀이

- `dp_table`를 선언해 각 배열의 인덱스에 얼마의 값이 들어가 있는지 확인한다.
- `a0 + a2` 번째 배열과 `a1` 번째 배열 중 더 큰 값을 찾아 더하는 것을 반복해 가장 마지막의 인덱스를 출력한다.
  - `[0] + [2]` 인덱스와 `[1]`의 인덱스는 문제에서 제시한 인접한 인덱스가 아니므로 둘 중 더 큰 값을 누적시키면 된다.
