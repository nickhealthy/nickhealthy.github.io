---
title: '[programmers]SQL_JOIN'
date: 2021-03-19 15:01:59
category: '💯 solving-algo'
thumbnail: { thumbnailSrc }
draft: false
---

## [루시와 엘라 찾기](https://programmers.co.kr/learn/courses/30/lessons/59046)

```mysql
-- 코드를 입력하세요
SELECT ANIMAL_ID, NAME, SEX_UPON_INTAKE
FROM ANIMAL_INS
WHERE NAME IN('Lucy', 'Ella', 'Pickle', 'Rogan', 'Sabrina', 'Mitty')
```

## [**이름에 el이 들어가는 동물 찾기**](https://programmers.co.kr/learn/courses/30/lessons/59047)

```mysql
-- 코드를 입력하세요
SELECT ANIMAL_ID, NAME
FROM ANIMAL_INS
WHERE
  ANIMAL_TYPE = 'Dog'
AND
  NAME LIKE '%EL%'
ORDER BY NAME
```

## [중성화 여부 파악하기](https://programmers.co.kr/learn/courses/30/lessons/59409)

```mysql
-- 코드를 입력하세요
SELECT ANIMAL_ID, NAME, CASE
WHEN SEX_UPON_INTAKE LIKE "%Neutered%" OR SEX_UPON_INTAKE LIKE "%Spayed%"
  THEN 'O'
ELSE 'X'
END AS '중성화'
FROM ANIMAL_INS

# SELECT ANIMAL_ID, NAME, CASE
# WHEN SEX_UPON_INTAKE LIKE "%Neutered%" OR SEX_UPON_INTAKE LIKE "%Spayed%"
#   THEN "O"
#   ELSE 'X' END AS "중성화"
# FROM ANIMAL_INS
```

## [오랜 기간 보호한 동물(2)](https://programmers.co.kr/learn/courses/30/lessons/59411)

```mysql
-- 코드를 입력하세요
SELECT OUTS.ANIMAL_ID, OUTS.NAME
FROM ANIMAL_OUTS AS OUTS
LEFT JOIN ANIMAL_INS AS INS
ON OUTS.ANIMAL_ID = INS.ANIMAL_ID
WHERE INS.DATETIME IS NOT NULL
ORDER BY INS.DATETIME - OUTS.DATETIME
LIMIT 2
```

## [**DATETIME에서 DATE로 형 변환**](https://programmers.co.kr/learn/courses/30/lessons/59414)

```mysql
-- 코드를 입력하세요
SELECT ANIMAL_ID, NAME, DATE_FORMAT(DATETIME, '%Y-%m-%d') AS 날짜
FROM ANIMAL_INS
ORDER BY ANIMAL_ID
```
