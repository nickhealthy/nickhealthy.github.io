---
title: '[이코테-DFS/BFS]_미로 탈출'
date: 2021-03-29 11:08:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

## 문제 설명

`N*M` 이루어진 맵에서 괴물들이 있는 위치`(1)`로 표시된 곳을 피해 최소의 움직임을 카운트 해 출력하는 문제

## My Solution

```python
from collections import deque

n, m = map(int, input().split())

arr = []
for _ in range(n):
    arr.append(list(map(int, input())))

# 상, 하, 좌, 우
dx = [-1, 1, 0, 0] # row
dy = [0, 0, -1, 1] # col
step_count = 0

def bfs(x, y):
    queue = deque()
    queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        for i in range(4):
            nx = x + dx[i]
            ny = y + dy[i]
            # 범위를 초과하면 넘긴다.
            if nx < 0 or ny < 0 or nx >= n or ny >= m:
                continue
            # 괴물이 있다면 넘긴다.
            if arr[nx][ny] == 0:
                continue
            # 해당 노드를 처음 방문하는 경우에만, 그 전 노드 값 + 1
            if arr[nx][ny] == 1:
                arr[nx][ny] = arr[x][y] + 1
                queue.append((nx, ny))
    return arr[n - 1][m - 1]
print(bfs(0, 0))
```

## 문제 풀이

- BFS 탐색으로 최적의 경로를 탐색한다.
- 이때, 현 위치에서 네 방향으로 괴물이 없는 곳을 탐색 해 움직인다.
- 해당 지점을 방문했을 시 이전 지점에서 `+1`를 해줘서 카운트를 진행한다.
