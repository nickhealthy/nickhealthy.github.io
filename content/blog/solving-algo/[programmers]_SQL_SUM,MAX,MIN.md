## [최대값 구하기](https://programmers.co.kr/learn/courses/30/lessons/59415)

```mysql
SELECT MAX(DATETIME) AS '시간'
FROM ANIMAL_INS
```

## [최솟값 구하기](https://programmers.co.kr/learn/courses/30/lessons/59038)

```mysql
SELECT MIN(DATETIME) AS '시간'
FROM ANIMAL_INS
```

## [동물 수 구하기](https://programmers.co.kr/learn/courses/30/lessons/59406)

```mysql
SELECT COUNT(ANIMAL_ID) AS 'count'
FROM ANIMAL_INS
```

## [중복 제거하기](https://programmers.co.kr/learn/courses/30/lessons/59408)

```mysql
SELECT COUNT(DISTINCT NAME)
FROM ANIMAL_INS 
WHERE NAME IS NOT NULL
```

