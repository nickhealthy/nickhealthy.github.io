---
title: '[programmers]입국심사'
date: 2021-02-18 17:45:14
category: "\U0001F4AF solving-algo"
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, 이진 탐색, max // 2

## 문제 설명

n명이 입국심사를 위해 줄을 서서 기다리고 있습니다. 각 입국심사대에 있는 심사관마다 심사하는데 걸리는 시간은 다릅니다.

처음에 모든 심사대는 비어있습니다. 한 심사대에서는 동시에 한 명만 심사를 할 수 있습니다. 가장 앞에 서 있는 사람은 비어 있는 심사대로 가서 심사를 받을 수 있습니다. 하지만 더 빨리 끝나는 심사대가 있으면 기다렸다가 그곳으로 가서 심사를 받을 수도 있습니다.

모든 사람이 심사를 받는데 걸리는 시간을 최소로 하고 싶습니다.

입국심사를 기다리는 사람 수 n, 각 심사관이 한 명을 심사하는데 걸리는 시간이 담긴 배열 times가 매개변수로 주어질 때, 모든 사람이 심사를 받는데 걸리는 시간의 최솟값을 return 하도록 solution 함수를 작성해주세요.

#### 제한사항

- 입국심사를 기다리는 사람은 1명 이상 1,000,000,000명 이하입니다.
- 각 심사관이 한 명을 심사하는데 걸리는 시간은 1분 이상 1,000,000,000분 이하입니다.
- 심사관은 1명 이상 100,000명 이하입니다.

##### 입출력 예

| n   | times   | return |
| --- | ------- | ------ |
| 6   | [7, 10] | 28     |

##### 입출력 예 설명

가장 첫 두 사람은 바로 심사를 받으러 갑니다.

7분이 되었을 때, 첫 번째 심사대가 비고 3번째 사람이 심사를 받습니다.

10분이 되었을 때, 두 번째 심사대가 비고 4번째 사람이 심사를 받습니다.

14분이 되었을 때, 첫 번째 심사대가 비고 5번째 사람이 심사를 받습니다.

20분이 되었을 때, 두 번째 심사대가 비지만 6번째 사람이 그곳에서 심사를 받지 않고 1분을 더 기다린 후에 첫 번째 심사대에서 심사를 받으면 28분에 모든 사람의 심사가 끝납니다.

<br />

## 첫 번째 풀이

```python
import copy

def solution(n, times):
    n -= len(times)

    times.sort()
    time_count = 0
    temp = copy.deepcopy(times)

    while n:
        time_count += 1

        for i in range(len(times)):
            if time_count == times[i]:
                n -= 1
                times[i] += temp[i]

        if n == 0:
            s = times[0] - (times[-1] - temp[-1])
            time_count += temp[0] + s

    return time_count
```

## Other Case

```python
def solution(n, times):
    answer = 0

    leng = len(times)
    left = 1
    right = (leng+1) * max(times) # 최대 범위

    while left <= right:
        mid = (left + right) // 2

        count = 0
        for time in times:
            count += mid // time
            # 심사 인원수를 넘으면 다음 단계
            if count >= n: break

        # n명을 심사 할 수 있는 경우
        # 한 심사관에게 주어진 시간을 줄여본다.
        if count >= n:
            answer = mid
            right = mid - 1
        # 없는 경우
        elif count < n:
            left = mid + 1

    return answer
```

## 문제 풀이

이진 탐색을 처음 접해 보았는데, 처음에는 하나씩 `time_counts`를 늘려가며 심사를 처리해줄 수 있는 심사관들에게 한명씩 배당하는 식의 풀이로 접근했다.  
하지만 시간 초과는 물론이고, 정답 또한 정확하지 않았다. 찾아 본 결과 이진 탐색이라는 말에 걸맞게 `min`, `max` 값을 구해서 더한 후, `/2`를 통하여

- `n`명을 심사할 수 있다면, 최대 범위를 줄여 보고,
- `n`명을 심사할 수 없다면, 최소 범위를 늘리는 식으로 풀었다.
