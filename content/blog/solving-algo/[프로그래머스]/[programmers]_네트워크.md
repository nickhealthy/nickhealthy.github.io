---
title: '[programmers]네트워크'
date: 2021-02-04 11:30:30
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, product(), (DFS/BFS)

## 문제 설명

네트워크란 컴퓨터 상호 간에 정보를 교환할 수 있도록 연결된 형태를 의미합니다. 예를 들어, 컴퓨터 A와 컴퓨터 B가 직접적으로 연결되어있고, 컴퓨터 B와 컴퓨터 C가 직접적으로 연결되어 있을 때 컴퓨터 A와 컴퓨터 C도 간접적으로 연결되어 정보를 교환할 수 있습니다. 따라서 컴퓨터 A, B, C는 모두 같은 네트워크 상에 있다고 할 수 있습니다.

컴퓨터의 개수 n, 연결에 대한 정보가 담긴 2차원 배열 computers가 매개변수로 주어질 때, 네트워크의 개수를 return 하도록 solution 함수를 작성하시오.

#### 제한사항

- 컴퓨터의 개수 n은 1 이상 200 이하인 자연수입니다.
- 각 컴퓨터는 0부터 `n-1`인 정수로 표현합니다.
- i번 컴퓨터와 j번 컴퓨터가 연결되어 있으면 computers[i][j]를 1로 표현합니다.
- computer[i][i]는 항상 1입니다.

##### 입출력 예

| n   | computers                         | return |
| --- | --------------------------------- | ------ |
| 3   | [[1, 1, 0], [1, 1, 0], [0, 0, 1]] | 2      |
| 3   | [[1, 1, 0], [1, 1, 1], [0, 1, 1]] | 1      |

##### 입출력 예 설명

예제 #1
아래와 같이 2개의 네트워크가 있습니다.
![image0.png](https://grepp-programmers.s3.amazonaws.com/files/ybm/5b61d6ca97/cc1e7816-b6d7-4649-98e0-e95ea2007fd7.png)

예제 #2
아래와 같이 1개의 네트워크가 있습니다.
![image1.png](https://grepp-programmers.s3.amazonaws.com/files/ybm/7554746da2/edb61632-59f4-4799-9154-de9ca98c9e55.png)

<br />

## My Solution

```python
from collections import deque

def solution(n, computers):
    answer = 0              # 네트워크의 개수를 저장할 변수
    bfs = deque()           # 탐색을 위한 큐
    visited = [0] * n       # 방문한 노드를 체크해 둘 리스트

    while 0 in visited:          # visited 리스트의 모든 값에 방문 표시가 되어있을 때까지 반복
        x = visited.index(0)     # 큐에 첫 노드(인덱스) 추가
        bfs.append(x)            # 첫 노드 방문 표시
        visited[x] = 1

        while bfs:                  # 큐가 값이 존재하면 반복문 수행
            node = bfs.popleft()    # 큐의 앞에서부터 노드(인덱스) 꺼내기
            for i in range(n):      # 꺼낸 노드의 인접 노드를 방문하기 위한 반복문 수행
                if visited[i] == 0 and computers[node][i] == 1: # 인접 노드이고, 방문된 적이 없는 경우
                    bfs.append(i)   # 큐에 추가
                    visited[i] = 1  # 방문했음을 표시

        answer += 1
    return answer
```

<br />
<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
