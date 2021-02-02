---
title: '[programmers]기능개발'
date: 2021-01-12 11:10:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, 스택, 큐

## 문제 설명

프로그래머스 팀에서는 기능 개선 작업을 수행 중입니다. 각 기능은 진도가 100%일 때 서비스에 반영할 수 있습니다.

또, 각 기능의 개발속도는 모두 다르기 때문에 뒤에 있는 기능이 앞에 있는 기능보다 먼저 개발될 수 있고, 이때 뒤에 있는 기능은 앞에 있는 기능이 배포될 때 함께 배포됩니다.

먼저 배포되어야 하는 순서대로 작업의 진도가 적힌 정수 배열 progresses와 각 작업의 개발 속도가 적힌 정수 배열 speeds가 주어질 때 각 배포마다 몇 개의 기능이 배포되는지를 return 하도록 solution 함수를 완성하세요.

#### 제한 사항

- 작업의 개수(progresses, speeds배열의 길이)는 100개 이하입니다.
- 작업 진도는 100 미만의 자연수입니다.
- 작업 속도는 100 이하의 자연수입니다.
- 배포는 하루에 한 번만 할 수 있으며, 하루의 끝에 이루어진다고 가정합니다. 예를 들어 진도율이 95%인 작업의 개발 속도가 하루에 4%라면 배포는 2일 뒤에 이루어집니다.

##### 입출력 예

| progresses               | speeds             | return    |
| ------------------------ | ------------------ | --------- |
| [93, 30, 55]             | [1, 30, 5]         | [2, 1]    |
| [95, 90, 99, 99, 80, 99] | [1, 1, 1, 1, 1, 1] | [1, 3, 2] |

##### 입출력 예 설명

입출력 예 #1
첫 번째 기능은 93% 완료되어 있고 하루에 1%씩 작업이 가능하므로 7일간 작업 후 배포가 가능합니다.
두 번째 기능은 30%가 완료되어 있고 하루에 30%씩 작업이 가능하므로 3일간 작업 후 배포가 가능합니다. 하지만 이전 첫 번째 기능이 아직 완성된 상태가 아니기 때문에 첫 번째 기능이 배포되는 7일째 배포됩니다.
세 번째 기능은 55%가 완료되어 있고 하루에 5%씩 작업이 가능하므로 9일간 작업 후 배포가 가능합니다.

따라서 7일째에 2개의 기능, 9일째에 1개의 기능이 배포됩니다.

입출력 예 #2
모든 기능이 하루에 1%씩 작업이 가능하므로, 작업이 끝나기까지 남은 일수는 각각 5일, 10일, 1일, 1일, 20일, 1일입니다. 어떤 기능이 먼저 완성되었더라도 앞에 있는 모든 기능이 완성되지 않으면 배포가 불가능합니다.

따라서 5일째에 1개의 기능, 10일째에 3개의 기능, 20일째에 2개의 기능이 배포됩니다.

<br/>

## My Solution

```python
def solution(progresses, speeds):
    answer = []
    for p, s in zip(progresses, speeds):
        count = 0
        while 1:
            if p >= 100:
                answer.append(count)
                break
            elif p < 100:
                p += s
                count += 1

    arr = [1]
    cnt = 1
    temp = answer[0]
    for i in range(1, len(answer)):
        if answer[i] > temp:
            arr.append(cnt)
            cnt = 1
            temp = answer[i]
        else:
            arr[-1] += 1

    return arr
```

## 문제풀이

1. `progresses` 리스트의 각 _index_ 값이 `100` 이상이 되면 작업이 끝마쳐지는 것을 이용해 `progresses[index]`가 100 미만이면
2. 계속해서 더해 준 뒤 작업에 걸린 시간을 구해주고, `answer` 리스트에 `append()` 시켜주었다.

3. 이후 `answer` 리스트를 순회하며,
4. 다음 프로세스의 **index** 값이 이전의 **index** 값보다 크다면 이전의 한 작업들의 개수를 카운트해 `arr` 배열에 넣어 `return` 해주었다.

## Oter Case

```python
def solution(progresses, speeds):
    Q=[]
    for p, s in zip(progresses, speeds):
        if len(Q)==0 or Q[-1][0]<-((p-100)//s):
            Q.append([-((p-100)//s),1])
        else:
            Q[-1][1]+=1
    return [q[1] for q in Q]
```

## 배운내용

Other Case와 비교하여 시간복잡도가 차이가 많이 날 것 같다.  
처음 설계할 때부터 노트와 펜을 이용해서 로직 구현을 제대로 해놓고 문제를 풀어야겠다는 생각을 했다.

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
