---
title: '[이코테-DFS/BFS]_음료수 얼려 먹기'
date: 2021-03-29 11:02:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

## 문제 설명

0과 1로 이루어진 얼음판에서 인접 노드끼리(상, 하, 좌, 우) 0으로 처리되어 있는 것은 하나의 얼음판으로 보고 count를 해 총 몇개의 얼음판이 있는지 세는 문제이다.

## My Solution

```python
n, m = map(int, input().split())

arr = []
for _ in range(n):
    arr.append(list(map(int, input())))

def dfs(x, y):
    if x <= -1 or x >= n or y <= -1 or y >= m:
        return False

    if arr[x][y] == 0:
        arr[x][y] = 1
        dfs(x, y + 1)
        dfs(x, y - 1)
        dfs(x + 1, y)
        dfs(x - 1, y)
        return True
    return False

result = 0
for i in range(n):
    for j in range(m):
        if dfs(i, j) == True:
            result += 1

print(result)
```

## 문제 풀이

- 상, 하, 좌, 우를 탐색해야 한다는 점에서 dfs 탐색으로 풀었으며, 각 행, 열를 체크해 아직 방문하지 않은 곳이라면, 방문한다.
- 방문할 때 이미 방문한 곳 또는 얼음판 범위(n, m)를 넘어서면 False로 처리해 count가 세는걸 방지했다.
- 상, 하, 좌, 우 모두 dfs 함수를 통과했다면 True를 반환해 count를 하나씩 증가시켜 최종적으로 출력했다.
