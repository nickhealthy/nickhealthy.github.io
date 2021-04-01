---
title: '[이코테-DP]_금광 문제'
date: 2021-04-01 16:25:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

## 문제 설명

`n, m`으로 이루어진 배열에서 **오른쪽 위, 오른쪽, 오른쪽 아래로만** 이동이 가능하다고 할 때, 가장 많이 캘 수 있는 금광 개수는 ?

## My Solution

```python
# 테스트 케이스 입력
for tc in range(int(input())):
    # 금광 정보 입력
    n, m = map(int, input().split())
    array = list(map(int, input().split()))
    # 다이나믹 프로그래밍을 위한 2차원 DP 테이블 초기화
    dp = []
    index = 0
    for i in range(n):
        dp.append(array[index:index + m])
        index += m

    # 다이나믹 프로그래밍 진행
    for j in range(1, m):
        for i in range(n):
            # 왼쪽 위에서 오는 경우
            if i == 0:
                left_up = 0
            else:
                left_up = dp[i - 1][j - 1]
            # 왼쪽 아래에서 오는 경우
            if i == n - 1:
                left_down = 0
            else:
                left_down = dp[i + 1][j - 1]
            # 왼쪽에서 오는 경우
            left = dp[i][j - 1]
            dp[i][j] = dp[i][j] + max(left_up, left_down, left)

    result = 0
    for i in range(n):
        result = max(result, dp[i][m - 1])
    print(result)
```

## 문제 풀이

- 오른쪽 위, 오른쪽, 오른쪽 아래로만 이동이 가능할 때 최대 값을 찾아내는 것이므로, **왼쪽의 위, 왼쪽, 왼쪽의 아래**에서 올 수 있는 값 중 **현재의 위치에서 가장 큰 값을 더해주면 된다.**
  - 하지만 2차원 배열의 범위를 초과할 수 있기 때문에 **예외처리는 해주어야 한다.**
- 2차원 배열이지만 입력 값이 하나의 배열 형태로(1차원)으로 주어진다. 따라서 `index` 변수를 임의로 줘서 슬라이싱을 통해 2차원 배열을 dp 변수에 만들어주었다.
- 이중 for문에서 **각 행마다 왼쪽의 위, 왼쪽, 왼쪽의 아래**를 탐색해서 **현재 위치 + 왼쪽에서 가장 큰 값(max함수)**를 더한다.
- 최종적으로 각 행의 끝의 열에서 가장 큰 값을 출력하면 된다.
