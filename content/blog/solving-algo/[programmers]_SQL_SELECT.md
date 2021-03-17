---
title: '[programmers]SQL_SELECT'
date: 2021-03-12 15:01:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

## [모든 레코드 조회하기](https://programmers.co.kr/learn/courses/30/lessons/59034)

```MYSQL
SELECT * from ANIMAL_INS;
```

## [역순 정렬하기](https://programmers.co.kr/learn/courses/30/lessons/59035)

```mysql
SELECT NAME, DATETIME from ANIMAL_INS order by ANIMAL_ID desc
```

## [아픈 동물 찾기](https://programmers.co.kr/learn/courses/30/lessons/59036)

```mysql
SELECT ANIMAL_ID, NAME FROM ANIMAL_INS WHERE INTAKE_CONDITION = 'Sick' ORDER BY ANIMAL_ID
```

## [어린 동물 찾기](https://programmers.co.kr/learn/courses/30/lessons/59037)

```mysql
SELECT ANIMAL_ID, NAME FROM ANIMAL_INS WHERE INTAKE_CONDITION <> 'Aged'
```

## [동물의 아이디와 이름](https://programmers.co.kr/learn/courses/30/lessons/59403)

```mysql
SELECT ANIMAL_ID, NAME FROM ANIMAL_INS ORDER BY ANIMAL_ID
```

## [여러 기준으로 정렬하기](https://programmers.co.kr/learn/courses/30/lessons/59404)

```mysql
SELECT ANIMAL_ID, NAME, DATETIME
FROM ANIMAL_INS
ORDER BY NAME, DATETIME DESC
```

## [상위 n개 레코드](https://programmers.co.kr/learn/courses/30/lessons/59405)

```mysql
SELECT NAME
FROM ANIMAL_INS
ORDER BY DATETIME
LIMIT 1
```
