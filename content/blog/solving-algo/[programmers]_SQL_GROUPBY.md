## [고양이와 개는 몇 마리 있을까](https://programmers.co.kr/learn/courses/30/lessons/59040)

```mysql
SELECT ANIMAL_TYPE, COUNT(ANIMAL_ID) AS 'count'
FROM ANIMAL_INS 
GROUP BY ANIMAL_TYPE
ORDER BY ANIMAL_TYPE
```

## [동명 동물 수 찾기](https://programmers.co.kr/learn/courses/30/lessons/59041)

```mysql
SELECT NAME, COUNT(NAME) AS COUNT
FROM ANIMAL_INS 
GROUP BY NAME
HAVING COUNT(NAME) >=2 
ORDER BY NAME
```

## [입양 시각 구하기(1)](https://programmers.co.kr/learn/courses/30/lessons/59412)

```mysql
SELECT HOUR(DATETIME) as HOUR, COUNT(ANIMAL_ID) as COUNT
FROM ANIMAL_OUTS 
GROUP BY HOUR(DATETIME)
HAVING  HOUR >= 9 and HOUR <= 19
ORDER BY HOUR
```

## [입양 시각 구하기(2)](https://programmers.co.kr/learn/courses/30/lessons/59413)

```mysql
SET @hour := -1; -- 변수 선언

SELECT (@hour := @hour + 1) as HOUR,
(SELECT COUNT(*) FROM ANIMAL_OUTS WHERE HOUR(DATETIME) = @hour) as COUNT
FROM ANIMAL_OUTS
WHERE @hour < 23
```

