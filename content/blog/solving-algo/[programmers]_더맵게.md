---
title: '[programmers]더맵게'
date: 2021-01-15 10:30:30
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, heap

## 문제 설명

매운 것을 좋아하는 Leo는 모든 음식의 스코빌 지수를 K 이상으로 만들고 싶습니다. 모든 음식의 스코빌 지수를 K 이상으로 만들기 위해 Leo는 스코빌 지수가 가장 낮은 두 개의 음식을 아래와 같이 특별한 방법으로 섞어 새로운 음식을 만듭니다.

```
섞은 음식의 스코빌 지수 = 가장 맵지 않은 음식의 스코빌 지수 + (두 번째로 맵지 않은 음식의 스코빌 지수 * 2)
```

Leo는 모든 음식의 스코빌 지수가 K 이상이 될 때까지 반복하여 섞습니다.
Leo가 가진 음식의 스코빌 지수를 담은 배열 scoville과 원하는 스코빌 지수 K가 주어질 때, 모든 음식의 스코빌 지수를 K 이상으로 만들기 위해 섞어야 하는 최소 횟수를 return 하도록 solution 함수를 작성해주세요.

#### 제한 사항

- scoville의 길이는 2 이상 1,000,000 이하입니다.
- K는 0 이상 1,000,000,000 이하입니다.
- scoville의 원소는 각각 0 이상 1,000,000 이하입니다.
- 모든 음식의 스코빌 지수를 K 이상으로 만들 수 없는 경우에는 -1을 return 합니다.

##### 입출력 예

| scoville             | K   | return |
| -------------------- | --- | ------ |
| [1, 2, 3, 9, 10, 12] | 7   | 2      |

##### 입출력 예 설명

1. 스코빌 지수가 1인 음식과 2인 음식을 섞으면 음식의 스코빌 지수가 아래와 같이 됩니다.
   새로운 음식의 스코빌 지수 = 1 + (2 \* 2) = 5
   가진 음식의 스코빌 지수 = [5, 3, 9, 10, 12]
2. 스코빌 지수가 3인 음식과 5인 음식을 섞으면 음식의 스코빌 지수가 아래와 같이 됩니다.
   새로운 음식의 스코빌 지수 = 3 + (5 \* 2) = 13
   가진 음식의 스코빌 지수 = [13, 9, 10, 12]

모든 음식의 스코빌 지수가 7 이상이 되었고 이때 섞은 횟수는 2회입니다.

<br/>

## My Solution

```python
def solution(scoville, K):
tmp = 0
count = 0
scoville.sort() # 가장 작은 스코빌, 두번째로 작은 스코빌을 찾기 위해 오름차순 정렬

    try:  # 밑에서 리스트 원소를 del 해준 부분에서 밑의 for문의 len()에 적용이 안되서 예외 처리
        for i in range(len(scoville) - 1):
            if K > scoville[i]:
                while True:
                    if len(scoville) == 1 and scoville[i] < K:
                        return -1
                    if scoville[i] >= K:
                        break
                    tmp = scoville[i] + (scoville[i+1]*2)
                    scoville[i] = tmp  # 가장 작은 스코빌 + (두번째로 작은 스코빌*2) 값
                    del scoville[i+1]  # 계산된 값 빼기
                    scoville.sort()  # 모든 원소가 K 이상이여야 하므로 재정렬 / 위의 if 구문에서 방금 계산한 tmp 값만 읽고 break 할 수 있기 때문에
                    count += 1
        return count
    except:
        return count
```

## 문제풀이

<b>첫번째 솔류션에서는...</b>
처음에 문제를 풀었을 땐 Heap 알고리즘을 몰라서 `sort()` 정렬을 이용해 풀었다.  
문제에 설명 된 대로 "가장 작은 스코빌" + "두번째로 작은 스코빌\*2" 을 계산하고,  
그 값을 첫번째 _index_ 에 넣어준 뒤, 계산에 쓰인 _index+1_ 를 `del` 함수로 지웠다.  
또한 `K` 값 이상에 도달하지 못한다면 `return -1`를 해서! 테스트 케이스는 모두 통과할 수 있었다.

## Other Case

```python
import heapq
def solution(scoville, K):
answer = 0
heapq.heapify(scoville)

 while scoville[0] < K:
mix = heapq.heappop(scoville) + (heapq.heappop(scoville) \* 2)
heapq.heappush(scoville, mix)
answer += 1
if len(scoville) == 1 and scoville[0] < K:
return -1

 return answer
```

## 배운내용

Heap를 이용할 시 <b>최소값과 최대값은</b> 상수 시간 `O(1)` 이라고 한다.  
또한 Heap 정렬을 이용할 시 트리 구조로 변수를 별도로 생성하지 않고 해당 변수에서 처리가 가능했다.

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
