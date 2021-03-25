---
title: '[programmers]삼각 달팽이'
date: 2021-02-02 12:30:50
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, 구현문제

## 문제 설명

정수 n이 매개변수로 주어집니다. 다음 그림과 같이 밑변의 길이와 높이가 n인 삼각형에서 맨 위 꼭짓점부터 반시계 방향으로 달팽이 채우기를 진행한 후, 첫 행부터 마지막 행까지 모두 순서대로 합친 새로운 배열을 return 하도록 solution 함수를 완성해주세요.

![examples.png](https://grepp-programmers.s3.ap-northeast-2.amazonaws.com/files/production/e1e53b93-dcdf-446f-b47f-e8ec1292a5e0/examples.png)

---

#### 제한사항

- n은 1 이상 1,000 이하입니다.

---

##### 입출력 예

| n   | result                                                    |
| --- | --------------------------------------------------------- |
| 4   | `[1,2,9,3,10,8,4,5,6,7]`                                  |
| 5   | `[1,2,12,3,13,11,4,14,15,10,5,6,7,8,9]`                   |
| 6   | `[1,2,15,3,16,14,4,17,21,13,5,18,19,20,12,6,7,8,9,10,11]` |

---

##### 입출력 예 설명

입출력 예 #1

- 문제 예시와 같습니다.

입출력 예 #2

- 문제 예시와 같습니다.

입출력 예 #3

- 문제 예시와 같습니다.

<br/>

## My Solution

```python
# 1
# 2 9
# 3 10 8
# 4 5 6 7
# 위의 식처럼 가정
# 각각의 위치를 표시할 2차원 배열 생성
def solution(n):
    triangle = [[0]*i for i in range(1, n+1)]
    row = 0
    col = 0
    num = 1
    for x in range(0, n):
        # down
        if x % 3 == 0:      # 아래 - 오른쪽 - 위의 순으로 반복 진행되므로 각각의 경로마다 'x % 3' 를 해준다.
            for i in range(0, n-x):     # 반시계방향으로 한 라인당 n, n-1, n-2 ... 식으로 반복
                triangle[row][col] = num
                num += 1
                row += 1
            row -= 1        # 24번째 줄에서 불필요한 row를 계산해주므로 index를 맞춰주기 위한 -1
            col += 1        # 다음 라인(오른쪽)으로 가기위해 +1
        # right
        elif x % 3 == 1:
            for i in range(0, n-x):
                triangle[row][col] = num
                num += 1
                col += 1
            row -= 1
            col -= 2
        # up
        else:
            for i in range(0, n-x):
                triangle[row][col] = num
                row -= 1
                col -= 1
                num += 1
            col += 1
            row += 2

    answer = [val for row in triangle for val in row]
    return answer
```

## Reference

[https://aropa.medium.com/%EC%82%BC%EA%B0%81-%EB%8B%AC%ED%8C%BD%EC%9D%B4-%EC%9B%94%EA%B0%84-%EC%BD%94%EB%93%9C-%EC%B1%8C%EB%A6%B0%EC%A7%80-cb59b17fa264](https://aropa.medium.com/%EC%82%BC%EA%B0%81-%EB%8B%AC%ED%8C%BD%EC%9D%B4-%EC%9B%94%EA%B0%84-%EC%BD%94%EB%93%9C-%EC%B1%8C%EB%A6%B0%EC%A7%80-cb59b17fa264)

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
