---
title: '[programmers]타겟 넘버'
date: 2021-02-03 11:30:30
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, product(), (DFS/BFS)

## 문제 설명

n개의 음이 아닌 정수가 있습니다. 이 수를 적절히 더하거나 빼서 타겟 넘버를 만들려고 합니다. 예를 들어 [1, 1, 1, 1, 1]로 숫자 3을 만들려면 다음 다섯 방법을 쓸 수 있습니다.

```
-1+1+1+1+1 = 3
+1-1+1+1+1 = 3
+1+1-1+1+1 = 3
+1+1+1-1+1 = 3
+1+1+1+1-1 = 3
```

사용할 수 있는 숫자가 담긴 배열 numbers, 타겟 넘버 target이 매개변수로 주어질 때 숫자를 적절히 더하고 빼서 타겟 넘버를 만드는 방법의 수를 return 하도록 solution 함수를 작성해주세요.

#### 제한사항

- 주어지는 숫자의 개수는 2개 이상 20개 이하입니다.
- 각 숫자는 1 이상 50 이하인 자연수입니다.
- 타겟 넘버는 1 이상 1000 이하인 자연수입니다..

##### 입출력 예

| numbers         | target | return |
| --------------- | ------ | ------ |
| [1, 1, 1, 1, 1] | 3      | 5      |

##### 입출력 예 설명

문제에 나온 예와 같습니다.

<br />

## My Solution

```python
from itertools import product

def solution(numbers, target):
    count = 0
    # 곱집합인 product() 사용을 위해 2차원 배열 생성
    arr = [[x, -x] for x in numbers]
    prod_arr = list(product(*arr))  # 모든 경우의 수 생성
    for i in prod_arr:
        if sum(i) == target:    # target에 부합할 시 count +1
            count += 1

    return count
```

## Other Case

```python
import collections
def solution(numbers, target):
    answer = 0
    stack = collections.deque([(0, 0)])
    while stack:
        current_sum, num_idx = stack.popleft()

        if num_idx == len(numbers):
            if current_sum == target:
                answer += 1
        else:
            number = numbers[num_idx]
            stack.append((current_sum+number, num_idx + 1))
            stack.append((current_sum-number, num_idx + 1))

    return answer
```

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
