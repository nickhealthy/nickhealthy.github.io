---
title: '[programmers]카펫'
date: 2021-01-20 10:20:14
category: "\U0001F4AF solving-algo"
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, exhaustive search

## 문제 설명

Leo는 카펫을 사러 갔다가 아래 그림과 같이 중앙에는 노란색으로 칠해져 있고 테두리 1줄은 갈색으로 칠해져 있는 격자 모양 카펫을 봤습니다.

![carpet.png](https://grepp-programmers.s3.ap-northeast-2.amazonaws.com/files/production/b1ebb809-f333-4df2-bc81-02682900dc2d/carpet.png)

Leo는 집으로 돌아와서 아까 본 카펫의 노란색과 갈색으로 색칠된 격자의 개수는 기억했지만, 전체 카펫의 크기는 기억하지 못했습니다.

Leo가 본 카펫에서 갈색 격자의 수 brown, 노란색 격자의 수 yellow가 매개변수로 주어질 때 카펫의 가로, 세로 크기를 순서대로 배열에 담아 return 하도록 solution 함수를 작성해주세요.

#### 제한사항

- 갈색 격자의 수 brown은 8 이상 5,000 이하인 자연수입니다.
- 노란색 격자의 수 yellow는 1 이상 2,000,000 이하인 자연수입니다.
- 카펫의 가로 길이는 세로 길이와 같거나, 세로 길이보다 깁니다.

##### 입출력 예

| brown | yellow | return |
| ----- | ------ | ------ |
| 10    | 2      | [4, 3] |
| 8     | 1      | [3, 3] |
| 24    | 24     | [8, 6] |

<br />

## My Solution

```python
import math


def solution(brown, yellow):
    # 가로와 세로 길이 구하기
    for i in range(1, int(math.sqrt(yellow)) + 1):
        # 모듈러 연산으로 즉, 0으로 떨어지는 값은 가로 * 세로의 수식이 성립됨
        if not yellow % i:
            # i는 세로의 길이, length는 가로의 길이
            length = yellow // i
            # total_squre - yellow == brown이라면 맞는 값을 찾은 것임
            if ((length+2) * (i+2)) - (length * i) == brown:
                # 또한 가로의 길이는 세로의 길이보다 같거나 길 수 있다 하였으므로
                # 즉, 가로의 길이가 세로의 길이보단 작을 순 없으므로 max, min 함수로
                # 가로와 세로의 길이를 맞춰준다.
                return [max(length + 2, i + 2), min((length + 2, i + 2))]
```

## 풀이방법

return의 [x * y] 값은 == brown + yellow의 값  
yellow 부분의 가로 `*` 세로 부분을 구한다면  
brown의 가로+2, 세로+2 +4 의 값이 == yellow 와 같다.

> brown이 위,아래와 왼쪽,오른쪾으로 쌓여 있기 때문에 \*2 / +4는 각 모퉁이의 총합

## Reference

[https://m.blog.naver.com/PostView.nhn?blogId=jaeyoon_95&logNo=221742960068&proxyReferer=https:%2F%2Fwww.google.co.kr%2F](https://m.blog.naver.com/PostView.nhn?blogId=jaeyoon_95&logNo=221742960068&proxyReferer=https:%2F%2Fwww.google.co.kr%2F)

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
