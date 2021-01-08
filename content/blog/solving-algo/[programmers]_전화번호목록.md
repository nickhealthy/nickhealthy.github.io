---
title: '[programmers]전화번호목록'
date: 2021-01-05 22:01:14
category: "\U0001F4AF solving-algo"
thumbnail: { thumbnailSrc }
draft: false
---

> Algorithm, Python, Hash, range(len(iterable) - 1)

## 문제 설명

전화번호부에 적힌 전화번호 중, 한 번호가 다른 번호의 접두어인 경우가 있는지 확인하려 합니다.
전화번호가 다음과 같을 경우, 구조대 전화번호는 영석이의 전화번호의 접두사입니다.

- 구조대 : 119
- 박준영 : 97 674 223
- 지영석 : 11 9552 4421

전화번호부에 적힌 전화번호를 담은 배열 phone_book 이 solution 함수의 매개변수로 주어질 때, 어떤 번호가 다른 번호의 접두어인 경우가 있으면 false를 그렇지 않으면 true를 return 하도록 solution 함수를 작성해주세요.

#### 제한 사항

- phone_book의 길이는 1 이상 1,000,000 이하입니다.
- 각 전화번호의 길이는 1 이상 20 이하입니다.

##### 입출력 예제

| phone_book                  | return |
| --------------------------- | ------ |
| [119, 97674223, 1195524421] | false  |
| [123,456,789]               | true   |
| [12,123,1235,567,88]        | false  |

##### 입출력 예 설명

입출력 예 #1
앞에서 설명한 예와 같습니다.

입출력 예 #2
한 번호가 다른 번호의 접두사인 경우가 없으므로, 답은 true입니다.

입출력 예 #3
첫 번째 전화번호, “12”가 두 번째 전화번호 “123”의 접두사입니다. 따라서 답은 false입니다.

<br/>

## My Solution 1 (Fail)

```python
def solution(phone_book):
    phone_book.sort()

    for i in range(len(phone_book) - 1):
        if phone_book[i] in phone_book[i + 1]:
            return False
    return True
```

## 문제풀이

접두사를 기준으로 포함이 되어 있는지 안되어 있는지를 확인하기 위해 `sort()` 함수를 이용해 우선 정렬했다.

> 문자열은 사전순으로 정렬이 되기 때문에 찾기 쉬울 것이라 가정

처음에는 `range()`를 이용해 앞뒤를 검사하는데 `out of range` error가 발생했다.  
당연한 말이지만 기존 배열에서 마지막 *index + 1*은 범위를 초과할 수 밖에 없다.  
그래서 고안한 방법이 처음 for 문에서 `range()` 범위를 지정해줄 때 `-1`를 해주어 맨 마지막의 *index*까지 탐색이 가능했다.  
이 테크닉은 앞으로 유용하게 쓰일 것 같다.

> 어차피 동일한 리스트 안에서 탐색하는 것이기 때문에 상관이 없었다.

## Other Case 1

```python
def solution(phone_book):
    for i in range(len(phone_book)):
        pivot = phone_book[i]
        for j in range(i+1, len(phone_book)):
            strlen = min(len(pivot), len(phone_book[j]))
            if pivot[:strlen] == phone_book[j][:strlen]:
                return False
        return True
```

## Other Case 2

```python
def solution(phone_book):
    for x in range(len(phone_book)-1):
         for y in range(x+1,len(phone_book)):
                x_len = len(phone_book[x])
                y_len = len(phone_book[y])
                if x_len <= y_len and phone_book[x] == phone_book[y][:x_len]:
                    return False
                elif phone_book[y] == phone_book[x][:y_len]:
                    return False

    return True
```

## 배운 내용

`sort()` 함수 등 정렬을 이용하면 Big O 표기법으로 `O(n log n)`의 시간 복잡도가 발생한다고 알고 있다.  
위의 Other Case에서 2중 for 문을 써서 `O(n^2)`의 시간 복잡도를 예상했지만, 내 코드보다 더 작은 시간 복잡도를 가지고 있어 의문이었다.  
고민하던 중 나의 코드에서도 for문 안에 `in`이 들어간걸 감안했을 때,  
`in`은 `O(n)`의 시간 복잡도를 가지고 있지만 for 문 안에 들어있으므로 똑같이 `O(n^2)`이라는걸 유추할 수 있었다.  
그런데 나는 `sort()` 함수로 정렬까지 했으니 시간 복잡도가 당연히 더 복잡해진걸 알 수 있었다.

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
