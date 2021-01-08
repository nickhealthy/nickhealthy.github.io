---
title: '[programmers]모의고사'
date: 2021-01-08 12:45:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, 완전탐색, from itertools import cycle

## 문제 설명

수포자는 수학을 포기한 사람의 준말입니다.  
수포자 삼인방은 모의고사에 수학 문제를 전부 찍으려 합니다.  
수포자는 1번 문제부터 마지막 문제까지 다음과 같이 찍습니다.

1번 수포자가 찍는 방식: 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, ...  
2번 수포자가 찍는 방식: 2, 1, 2, 3, 2, 4, 2, 5, 2, 1, 2, 3, 2, 4, 2, 5, ...  
3번 수포자가 찍는 방식: 3, 3, 1, 1, 2, 2, 4, 4, 5, 5, 3, 3, 1, 1, 2, 2, 4, 4, 5, 5, ...

1번 문제부터 마지막 문제까지의 정답이 순서대로 들은 배열 answers가 주어졌을 때,  
가장 많은 문제를 맞힌 사람이 누구인지 배열에 담아 return 하도록 solution 함수를 작성해주세요.

#### 제한 조건

- 시험은 최대 10,000 문제로 구성되어있습니다.
- 문제의 정답은 1, 2, 3, 4, 5중 하나입니다.
- 가장 높은 점수를 받은 사람이 여럿일 경우, return하는 값을 오름차순 정렬해주세요.

##### 입출력 예

| answers     | return  |
| ----------- | ------- |
| [1,2,3,4,5] | [1]     |
| [1,3,2,4,2] | [1,2,3] |

##### 입출력 예 설명

입출력 예 #1

- 수포자 1은 모든 문제를 맞혔습니다.
- 수포자 2는 모든 문제를 틀렸습니다.
- 수포자 3은 모든 문제를 틀렸습니다.

따라서 가장 문제를 많이 맞힌 사람은 수포자 1입니다.

입출력 예 #2

- 모든 사람이 2문제씩을 맞췄습니다.

<br/>

## My Solution

```python
def solution(answers):
    correct = [0, 0, 0]
    first = [1, 2, 3, 4, 5]
    second = [2, 1, 2, 3, 2, 4, 2, 5]
    third = [3, 3, 1, 1, 2, 2, 4, 4, 5, 5]

    # zip() 함수의 특성상 가장 짧은 리스트의 길이 만큼 순회하고 끝남
    # > answers'list 보다 부족한만큼 채워주기
    if len(first) < len(answers):
        for i in range(len(answers) - len(first)):
            first.append(first[i])

    if len(second) < len(answers):
        for j in range(len(answers) - len(second)):
            second.append(second[j])

    if len(third) < len(answers):
        for k in range(len(answers) - len(third)):
            third.append(third[k])

    for i, j, k, z in zip(first, second, third, answers):
        if i == z:
            correct[0] += 1
        if j == z:
            correct[1] += 1
        if k == z:
            correct[2] += 1

    answer = []
    [answer.append(idx + 1) for idx, ans in enumerate(correct) if ans == max(correct)]
    return answer
```

## 문제풀이

가장 많은 문제를 맞힌 사람이 누구인지 _index_ 형태로 return : `enumerate()` 사용  
제한 조건 중 가장 높은 점수를 받은 사람이 여럿일 경우, 오름차순 정렬 : `reverse()`

1번, 2번, 3번 수포자의 반복되는 각 배열의 숫자가 다르기 때문에 배열의 숫자를 맞춰주자.  
`zip()` 함수를 이용해 answer와 1, 2, 3 번 배열의 _index_ 를 각각 매핑해서 탐색 및 동일하다면 `==` 정답 개수 검출

## Other Case 1

```python
from itertools import cycle

def solution(answers):
    a1 = [1,2,3,4,5]
    a2 = [2,1,2,3,2,4,2,5]
    a3 = [3,3,1,1,2,2,4,4,5,5]
    winner = []
    correct = [0, 0, 0]
    for i, j, k, z in zip(cycle(a1), cycle(a2), cycle(a3), answers):
        if i == z : correct[0] += 1
        if j == z : correct[1] += 1
        if k == z : correct[2] += 1

    for inx, score in enumerate(correct):
        if score == max(correct):
            winner.append(inx+1)

    return winner
```

## Other Case 2

```python
# 안예진
def solution(answers):
    p1 = [1,2,3,4,5]
    p2 = [2,1,2,3,2,4,2,5]
    p3 = [3,3,1,1,2,2,4,4,5,5]
    answer = [0,0,0]

    for x in range(len(answers)):
        if p1[x%5] == answers[x]:
            answer[0] += 1
        if p2[x%8] == answers[x]:
            answer[1] += 1
        if p3[x%10] == answers[x]:
            answer[2] += 1

    maxSort = []

    for idx in range(1,len(answer)+1):
        if len(maxSort) == 0 or answer[maxSort[0]-1] < answer[idx-1]:
            maxSort = [idx]
        elif answer[maxSort[0]-1] == answer[idx-1]:
            maxSort.append(idx)

    return sorted(maxSort)
```

## 배운내용

`from itertools` 모듈 안에 `cycle()` 이란 메서드가 있었는데 `zip()` 함수의 특성상 가장 작은 리스트를 기준으로 순회하고 끝나는 문제를 해결해준다.  
즉, **가장 긴 리스트를 기준으로 반복적으로 순회해줘서** 상대적으로 길이가 짧은 1번 수포자의 리스트를 여러번 돌아줄 수 있다.

또한 `%` 모듈러 연산을 이용해 리스트에 부족한 수만큼 추가하는 연산을 하지 않고, 계산하는 방법도 가능했다.

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
