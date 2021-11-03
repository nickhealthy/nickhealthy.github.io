---
title: '[AWS] 가비아 도메인 구입 후 AWS-Route53 연결하기'
date: 2021-06-29 14:22:13
category: '☁️ cloud'
draft: false
---

### 가비아에서 DNS 도메인 구입하기

- 설명 생략

### AWS Route53에서 호스팅 영역 추가

- 경로: 서비스 - Route53 - 호스트 영역 - 호스트 영역 생성

![1  호스팅영역생성](https://user-images.githubusercontent.com/66216102/123772969-3dd06c80-d907-11eb-88dd-05f663e3a936.JPG)

- 호스팅 사이트에서 구입한 도메인 이름 입력 및 생성 버튼 클릭

![1-1](https://user-images.githubusercontent.com/66216102/123772951-39a44f00-d907-11eb-9292-63d6fbf205e0.JPG)

- 호스트 영역 생성 확인

![1-2](https://user-images.githubusercontent.com/66216102/123772956-3ad57c00-d907-11eb-9a20-172472d4aaf9.JPG)

### DNS의 네임 서버 지정

> 도메인을 구입한 곳에(가비아) 네임서버를 등록하면 됩니다.

- AWS 네임 서버 정보 확인

![3  Name Server 등록](https://user-images.githubusercontent.com/66216102/123772965-3d37d600-d907-11eb-9e05-367a9685d785.JPG)

- 도메인 구입한 곳에 네임 서버 등록

![3-1](https://user-images.githubusercontent.com/66216102/123772968-3d37d600-d907-11eb-86ba-bb39a11f74c7.JPG)

### Route 53에서 A 레코드 추가하기

> A 레코드는 IPv4를 의미함

- 생성한 도메인의 호스팅 영역에서 A 레코드 추가
- 경로: 서비스 - Route53 - 호스트 영역 생성 - 해당하는 도메인 세부정보 클릭 - 레코드 생성 클릭

![2  레코드 생성](https://user-images.githubusercontent.com/66216102/123772957-3b6e1280-d907-11eb-81d3-742046649611.JPG)

- 단순 라우팅 선택

![2-1](https://user-images.githubusercontent.com/66216102/123772961-3b6e1280-d907-11eb-9c44-d02de4c0732d.JPG)

- 단순 레코드 정의 클릭 후 정보 입력

![2-2](https://user-images.githubusercontent.com/66216102/123772963-3c06a900-d907-11eb-84fc-a60a25dfcc51.JPG)

- 생성된 A 레코드 확인
  - test.nickhealthy.shop의 A 레코드는 `8.8.8.8`

![2-3 생성된 레코드 확인](https://user-images.githubusercontent.com/66216102/123772964-3c9f3f80-d907-11eb-8842-e9402372a111.JPG)

### 검증

- CMD 창에서 `nslookup` 명령어를 통해 test.nickhealthy.shop를 확인하고, `ping`을 통해 매핑된 IP로 통신되는지 확인

![4  검증- 응답확인](https://user-images.githubusercontent.com/66216102/123775138-0ebafa80-d909-11eb-9f64-9a7990101cf2.JPG)

### 자원 삭제

- 해당 레코드 선택 후 삭제 버튼 클릭
- 경로: 서비스 - Route53 - 호스트 영역 - 레코드 선택

## Reference

[https://aws.amazon.com/ko/route53/pricing/](https://aws.amazon.com/ko/route53/pricing/)
