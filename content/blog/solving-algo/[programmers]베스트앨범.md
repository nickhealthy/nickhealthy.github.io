---
title: '[programmers]베스트 앨범'
date: 2021-01-07 15:01:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, Hash, enmerate(), lambda()

## 문제 설명

스트리밍 사이트에서 장르 별로 가장 많이 재생된 노래를 두 개씩 모아 베스트 앨범을 출시하려 합니다. 노래는 고유 번호로 구분하며, 노래를 수록하는 기준은 다음과 같습니다.

1. 속한 노래가 많이 재생된 장르를 먼저 수록합니다.
2. 장르 내에서 많이 재생된 노래를 먼저 수록합니다.
3. 장르 내에서 재생 횟수가 같은 노래 중에서는 고유 번호가 낮은 노래를 먼저 수록합니다.

노래의 장르를 나타내는 문자열 배열 genres와 노래별 재생 횟수를 나타내는 정수 배열 plays가 주어질 때, 베스트 앨범에 들어갈 노래의 고유 번호를 순서대로 return 하도록 solution 함수를 완성하세요.

#### 제한사항

- genres[i]는 고유번호가 i인 노래의 장르입니다.
- plays[i]는 고유번호가 i인 노래가 재생된 횟수입니다.
- genres와 plays의 길이는 같으며, 이는 1 이상 10,000 이하입니다.
- 장르 종류는 100개 미만입니다.
- 장르에 속한 곡이 하나라면, 하나의 곡만 선택합니다.
- 모든 장르는 재생된 횟수가 다릅니다.

##### 입출력 예

| genres                                          | plays                      | return       |
| ----------------------------------------------- | -------------------------- | ------------ |
| ["classic", "pop", "classic", "classic", "pop"] | [500, 600, 150, 800, 2500] | [4, 1, 3, 0] |

##### 입출력 예 설명

classic 장르는 1,450회 재생되었으며, classic 노래는 다음과 같습니다.

- 고유 번호 3: 800회 재생
- 고유 번호 0: 500회 재생
- 고유 번호 2: 150회 재생

pop 장르는 3,100회 재생되었으며, pop 노래는 다음과 같습니다.

- 고유 번호 4: 2,500회 재생
- 고유 번호 1: 600회 재생

따라서 pop 장르의 [4, 1]번 노래를 먼저, classic 장르의 [3, 0]번 노래를 그다음에 수록합니다.

<br/>

## My Solution 1

```python
def solution(genres, plays):
    di = {}

    for idx, genre in enumerate(genres):
        if genre not in di.keys():
            di[genre] = [(idx, plays[idx])]
        else:
            di[genre].append((idx, plays[idx]))

    for i in di.keys():
        di[i].sort(key=lambda x : x[1], reverse=True)


    sorted_di= sorted(list(di.values()), key=lambda x : sum(x2[1] for x2 in x), reverse=True)

    answer = []

    for i in sorted_di:
        for j in i[:2]:
            answer.append(j[0])

    return answer
```

### 문제풀이

우선 문제에서 결과 값으로 요구하는 사항이 _index_ 인 것을 감안해 `enumerate()`를 사용하였다.

1. 그 후 `genres`배열의 값을 `di.keys()`로 지정해 주고, `plays` 배열의 값을 해당 하는 _key_ 값에 맞도록 순차적으로 넣어준 뒤,
2. 문제에서 요구하는 조건에 맞도록 `sort()`, `sorted()`, `lambda()`를 사용해 배열의 순서를 정렬하였다.

<br />

## 배운 내용

사실 문제에서 결과 값을 _index_ 로 줘야 한다고해서 바로 `enumerate()`가 생각나지는 않았었다.  
처음에는 `for`문과 `range()` 이용해서 _index_ 를 따로 줄까 생각했었다..  
알고리즘은 역시 많이 풀어보고, 감을 익힌다음에 센스를 발휘하는 것이 빛을 발하는게 아닐까 생각한다.

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
