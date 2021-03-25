---
title: '[programmers]완주하지 못한 선수'
date: 2021-01-04 11:10:50
category: '💯 solving-algo'
tags:
  - 'Python'
  - 'Algorithm'
draft: false
---

> Algorithm, Python, Hash, import collection.Counter

## 문제 설명

수많은 마라톤 선수들이 마라톤에 참여하였습니다. 단 한 명의 선수를 제외하고는 모든 선수가 마라톤을 완주하였습니다.

마라톤에 참여한 선수들의 이름이 담긴 배열 participant와 완주한 선수들의 이름이 담긴 배열 completion이 주어질 때, 완주하지 못한 선수의 이름을 return 하도록 solution 함수를 작성해주세요.

#### 제한사항

- 마라톤 경기에 참여한 선수의 수는 1명 이상 100,000명 이하입니다.
- completion의 길이는 participant의 길이보다 1 작습니다.
- 참가자의 이름은 1개 이상 20개 이하의 알파벳 소문자로 이루어져 있습니다.
- 참가자 중에는 동명이인이 있을 수 있습니다.

##### 입출력 예

| participant                             | completion                       | return |
| --------------------------------------- | -------------------------------- | ------ |
| [leo, kiki, eden]                       | [eden, kiki]                     | leo    |
| [marina, josipa, nikola, vinko, filipa] | [josipa, filipa, marina, nikola] | vinko  |
| [mislav, stanko, mislav, ana]           | [stanko, ana, mislav]            | mislav |

##### 입출력 예 설명

예제 #1
leo는 참여자 명단에는 있지만, 완주자 명단에는 없기 때문에 완주하지 못했습니다.

예제 #2
vinko는 참여자 명단에는 있지만, 완주자 명단에는 없기 때문에 완주하지 못했습니다.

예제 #3
mislav는 참여자 명단에는 두 명이 있지만, 완주자 명단에는 한 명밖에 없기 때문에 한명은 완주하지 못했습니다.

<br/>

## My Solution 1 (Fail)

```python
def solution(participant, completion):
  participant.sort()
  completion.sort()

    for i in range(len(participant)):
        if participant[i] not in completion:
            return participant[i]
```

## 문제풀이

우선 문제에서 중요한 힌트 중 하나인  
"단 한 명의 선수를 제외하고는 모든 선수가 마라톤을 완주하였습니다."  
위의 구문을 참고해 정렬 시킨 후 중복되는 값을 고려하지 않고 `completion`의 배열 안에 없으면  
`return` 하도록 하였다. 3개의 테스트 케이스 중 2개는 통과하였고,  
나머지 하나는 중복되는 동명이인이 있어 `NULL`이 값이 나오며 풀리지 않았다.

<br/>

## My Solution 2

```python
def solution(participant, completion):
    participant.sort()
    completion.sort()

    for i, z in zip(participant, completion):
        print(i, z)
        if i != z:
            return i
    return participant[-1]
```

- 두 개의 리스트 모두 정렬화 시킨 후,
- `completion` 리스트에서 `participant`에만 단 하나의 인덱스만 추가적으로 많으므로,
- `zip()`함수로 결과 값이 틀린 것은 **완주하지 못한 선수**.
- `competion` 리스트의 인덱스가 끝날 때까지 결과 값이 같으면,
- `participant` 리스트에서 마지막 값이 **완주하지 못한 선수** 이므로 `participant[-1]`를 해주어 문제 해결!

<br/>

## Other Case

```python
from collections import Counter

def solution(participant, completion):
    ans = Counter(participant) - Counter(completion)
    return list(ans)[0]
```

<br/>

## 배운 내용

`collections` 모듈에서 `Counter` 이라는 메서드를 제공해준다.  
`Counter`는 엄밀히 말해 `dict()`는 아니지만 `dict()` 형태로 값을 변환해주고,  
우리가 쉽게 해당 데이터에 대해서 몇개가 있는지 개수 파악을 하고 hash문제 풀이에 용이할 것 같다.

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
