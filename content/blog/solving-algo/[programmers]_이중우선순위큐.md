---
title: '[programmers]이중우선순위큐'
date: 2021-01-19 10:20:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> algorithm, python, heap, split

## 문제 설명

이중 우선순위 큐는 다음 연산을 할 수 있는 자료구조를 말합니다.

| 명령어 | 수신 탑(높이)                  |
| ------ | ------------------------------ |
| I 숫자 | 큐에 주어진 숫자를 삽입합니다. |
| D 1    | 큐에서 최댓값을 삭제합니다.    |
| D -1   | 큐에서 최솟값을 삭제합니다.    |

이중 우선순위 큐가 할 연산 operations가 매개변수로 주어질 때, 모든 연산을 처리한 후 큐가 비어있으면 [0,0] 비어있지 않으면 [최댓값, 최솟값]을 return 하도록 solution 함수를 구현해주세요.

#### 제한사항

- operations는 길이가 1 이상 1,000,000 이하인 문자열 배열입니다.
- operations의 원소는 큐가 수행할 연산을 나타냅니다.
  - 원소는 “명령어 데이터” 형식으로 주어집니다.- 최댓값/최솟값을 삭제하는 연산에서 최댓값/최솟값이 둘 이상인 경우, 하나만 삭제합니다.
- 빈 큐에 데이터를 삭제하라는 연산이 주어질 경우, 해당 연산은 무시합니다.

##### 입출력 예

| operations          | return |
| ------------------- | ------ |
| [I 16,D 1]          | [0,0]  |
| [I 7,I 5,I -5,D -1] | [7,5]  |

##### 입출력 예 설명

16을 삽입 후 최댓값을 삭제합니다. 비어있으므로 [0,0]을 반환합니다.
7,5,-5를 삽입 후 최솟값을 삭제합니다. 최대값 7, 최소값 5를 반환합니다.

<br />

## My Solution

```python
def solution(operations):
    new_operations = []
    for i in operations:
        # 삽입, 최댓값 삭제, 최솟값 삭제 구분하기
        a, b = i.split(" ")
        # 삽입이라면
        if a == "I":
            new_operations.append(int(b))
        # 최솟 값 삭제, 최댓 값 삭제
        else:
            if len(new_operations) >= 1:
                # 최댓 값이라면 삭제
                if b == "1":
                    new_operations.pop()
                # 최솟 값이라면 삭제(밑에 오름차순 정렬했기떄문에 '0' index를 pop)
                else:
                    new_operations.pop(0)
            else:
                pass

        new_operations.sort()
    # 배열이 비어있다면 return
    if not new_operations:
        return [0, 0]
    # 아니라면 max, min 각각 뽑아주기
    else:
        return [max(new_operations), min(new_operations)]
```

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
