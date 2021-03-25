---
title: '[programmers]정수 삼각형'
date: 2021-02-16 16:10:14
category: "\U0001F4AF solving-algo"
thumbnail: { thumbnailSrc }
draft: false
---

> algorithm, python, DP

# 문제 설명

![스크린샷 2018-09-14 오후 5.44.19.png](https://grepp-programmers.s3.amazonaws.com/files/production/97ec02cc39/296a0863-a418-431d-9e8c-e57f7a9722ac.png)

위와 같은 삼각형의 꼭대기에서 바닥까지 이어지는 경로 중, 거쳐간 숫자의 합이 가장 큰 경우를 찾아보려고 합니다. 아래 칸으로 이동할 때는 대각선 방향으로 한 칸 오른쪽 또는 왼쪽으로만 이동 가능합니다. 예를 들어 3에서는 그 아래칸의 8 또는 1로만 이동이 가능합니다.

삼각형의 정보가 담긴 배열 triangle이 매개변수로 주어질 때, 거쳐간 숫자의 최댓값을 return 하도록 solution 함수를 완성하세요.

#### 제한사항

- 삼각형의 높이는 1 이상 500 이하입니다.
- 삼각형을 이루고 있는 숫자는 0 이상 9,999 이하의 정수입니다.

##### 입출력 예

| triangle                                                | result |
| ------------------------------------------------------- | ------ |
| [[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]] | 30     |

<br />

# My Solution

```python
def solution(triangle):
    # 처음 시작할 땐 '루트'의 값을 각각 더해준다.
    # 가장 끝에 있는 왼쪽과 오른쪽은 '전 트리의 가장 왼쪽 끝과 오른쪽 끝을 더해준다.'
    # 중간에 있는 트리들은 '전 트리의 왼쪽, 오른쪽 값 중 큰 값을 비교해서 넣어준다.'
    for i in range(1, len(triangle)):           # 전 값을 계산해 주기 위해 'index 1부터 시작한다.'
        for j in range(i + 1):
            if j == 0:
                triangle[i][j] += triangle[i-1][j]
            elif i == j:
                triangle[i][j] += triangle[i-1][j-1]
            else:
                triangle[i][j] += max(triangle[i-1][j-1], triangle[i-1][j])
    return max(triangle[-1])

print(solution([[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]]))
```

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

TIP, 주의 사항

가장 끝에 있는 왼쪽/오른쪽 노드는 전 트리 단계의 **가장 끝에 있는 왼쪽/오른쪽**을 택해야하며, 중간에 있는 값들은 전 트리 단계의 왼쪽, 오른쪽 중 큰 값을 택해야한다. 예시 `max([i-1][j], [i-1][j-1])`

<br />

두 번째 for 문에서 `range` 범위는 끝에 인덱스를 포함하지 않기 때문에 `+1`를 해주어야 한다. 예를 들어, 1 ~ 10을 출력하고자 할 땐 `for i in range(1, 11)`처럼 범위 지정을 해야 `[1 ~ 10]` 값이 출력된다.

</div>
</div>

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
