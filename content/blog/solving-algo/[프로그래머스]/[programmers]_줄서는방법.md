---
title: '[programmers]줄서는 방법'
date: 2021-02-11 11:34:14
category: "\U0001F4AF solving-algo"
thumbnail: { thumbnailSrc }
draft: false
---

> algorithm, python, divmod, 구현

## 문제 설명

n명의 사람이 일렬로 줄을 서고 있습니다. n명의 사람들에게는 각각 1번부터 n번까지 번호가 매겨져 있습니다. n명이 사람을 줄을 서는 방법은 여러가지 방법이 있습니다. 예를 들어서 3명의 사람이 있다면 다음과 같이 6개의 방법이 있습니다.

- [1, 2, 3]
- [1, 3, 2]
- [2, 1, 3]
- [2, 3, 1]
- [3, 1, 2]
- [3, 2, 1]

사람의 수 n과, 자연수 k가 주어질 때, 사람을 나열 하는 방법을 사전 순으로 나열 했을 때, k번째 방법을 return하는 solution 함수를 완성해주세요.

##### 제한사항

- n은 20이하의 자연수 입니다.
- k는 n! 이하의 자연수 입니다.

---

##### 입출력 예

| n   | k   | result  |
| --- | --- | ------- |
| 3   | 5   | [3,1,2] |

##### 입출력 예시 설명

입출력 예 #1
문제의 예시와 같습니다.

<br />

## My Solution

```python
import math
def solution(n, k):
    answer = []
    num = [i for i in range(1, n+1)]
    while num:
        # fac(n - 1)의 몫과 나머지를 구함
        # > 여기서 share의 값은 가장 앞의 값이며, 반복
        share, remainder = divmod(k, math.factorial(len(num) - 1))
        if remainder == 0:
            share -= 1
        answer.append(num.pop(share))
        k = remainder

    return answer
```

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
