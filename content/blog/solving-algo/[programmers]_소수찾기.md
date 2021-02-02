---
title: '[programmers]소수찾기'
date: 2021-01-11 11:10:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, isPrime, 에라토스테네스의 체, 제곱근 함수math.sqrt(x)

## 문제 설명

한자리 숫자가 적힌 종이 조각이 흩어져있습니다. 흩어진 종이 조각을 붙여 소수를 몇 개 만들 수 있는지 알아내려 합니다.

각 종이 조각에 적힌 숫자가 적힌 문자열 numbers가 주어졌을 때, 종이 조각으로 만들 수 있는 소수가 몇 개인지 return 하도록 solution 함수를 완성해주세요.

#### 제한사항

- numbers는 길이 1 이상 7 이하인 문자열입니다.
- numbers는 0~9까지 숫자만으로 이루어져 있습니다.
- 013은 0, 1, 3 숫자가 적힌 종이 조각이 흩어져있다는 의미입니다.

##### 입출력 예

| numbers | return |
| ------- | ------ |
| 17      | 3      |
| 011     | 2      |

##### 입출력 예 설명

예제 #1
[1, 7]으로는 소수 [7, 17, 71]를 만들 수 있습니다.

예제 #2
[0, 1, 1]으로는 소수 [11, 101]를 만들 수 있습니다.

- 11과 011은 같은 숫자로 취급합니다.

<br/>

## Other Case

```python
from itertools import permutations
def solution(n):
    a = set()
    for i in range(len(n)):
        a |= set(map(int, map("".join, permutations(list(n), i + 1)))) # 모든 경우의 수를 만듬
    a -= set(range(0, 2)) # 숫자 0과 1은 제거

    # 모든 경우의 수에 대해서 소수 판정
    for i in range(2, int(max(a) ** 0.5) + 1):
        a -= set(range(i * 2, max(a) + 1, i))
    return len(a)
```

## 배운내용

에라토스테네스의 체는 가장 대표적인 소수(Prime Number)판별 알고리즘이다.  
소수란 <u>'양의 약수를 두 개만 가지는 자연수'</u>를 의미하며 2, 3, 5, 7, 11, ...등이 존재한다.

### 일반적인 소수 판별 알고리즘 예제

```python
def isPrimeNumber(x):
    end = int(math.sqrt(x))
    for i in range(2, end):
        if x % i == 0:
            return False
    return True
```

모든 경우의 수를 돌게 되면 시간복잡도가 `O(n)`이 되므로 효율적이지 않다.  
제곱근 `sqrt()` 함수를 사용해 시간 복잡도는 `O(n^(1/2))`로 구현이 가능하다.  
예를 들어 8의 경우 `2 * 4 = 4 * 2`와 같은 식으로 대칭을 이루기 때문이다.  
그러므로 특정한 숫자의 **제곱근까지만 약수의 여부를 검증**하면 된다.

반면 **에라토스테네스의 체**는 한 두개의 소수 판별이 아닌 <u>대량의 소수를 한꺼번에 판별하고자 할 때 사용한다.</u>  
프로세스는 다음과 같다.

1. 1은 제거 및 소수를 판별할 범위만큼 배열을 할당 후,
2. 그 인덱스에 해당하는 값을 넣어준다.
3. 2부터 시작해서 특정 숫자의 배수에 해당하는 숫자들을 모두 지워준다.(자기 자신은 제외)
4. 이미 지워진 숫자의 경우 건너뛴다.
5. 2부터 시작해서 남아있는 숫자들을 출력한다.

### 에라토스테네스의 체 알고리즘 예제

```python
number = 100000
a = [0] * number
def primeNumberSieve():
    for i in range(2, number):
        a[i] = i  # 모든 index에 값을 넣어줌
    for i in range(2, number):
        if a[i] == 0:  # 특정한 숫자들의 배수들을 지워주기
            continue  # 이미 지워진 숫자는 무시
        for j in range(i+i, number, i):  # 그 배수부터 출발해서 가능한 모든 숫자들을 지우기
            a[j] = 0
    for i in range(2, number):
        if a[i] != 0:  # index의 값이 0이 아닌 즉, 남은 소수들을 출력
            print(a[i])

primeNumberSieve()
```

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
