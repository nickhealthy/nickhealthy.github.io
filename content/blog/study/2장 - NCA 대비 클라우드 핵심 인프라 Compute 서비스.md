---
title: '2장 - NCA 대비 클라우드 핵심 인프라 Compute 서비스'
date: 2021-07-17 18:21:13
category: '📚 study'
draft: false
---

클라우드 서비스의 가장 베이스가 되면서 핵심 서비스인 Compute 서비스에 대해 배워봅시다.

## Compute 상품

### 기본적인 서버를 생성하고 관리하는 상품

- 서비스 규모와 사용목적에 적합한 성능의 서버를 선택할 수 있도록 다양한 서버 타입 제공
- 일반적인 2vCPU ~ 16vCPU 상품부터 High Memory 서버, VDS, HPC, GPU 등 다양한 상품 라인업이 준비
  - `High Memory 서버` : DB 및 애플리케이션 등 메모리가 많이 드는 서비스에 적합한 컴퓨팅
  - `VDS` : 금융권과 같은 외부 네트웍에 민감한 서비스 산업에 적합
  - `HPC` : 컴퓨팅 파워가 좋은 컴퓨터
  - `GPU` : 머신러닝이나 AI에 많이 사용되는 GPU 컴퓨팅
- 네이버 클라우드 플랫폼 체험용 서버인 마이크로 서버 제공

### 요금 구성

- 컴퓨팅(CPU, 메모리), 네트워크(outbound), 스토리지 요금이 발생
- 서버 정지 시 컴퓨팅, 네트웍 요금은 발생하지 않으나 스토리지 비용 발생(Micro, Ciompact, Standard)

### SSD, HDD 디스크 타입 제공

- IO 퍼포먼스 차별화
- SSD 사용 시 최대 IOPS 보장
  - 디스크 용량에 따라 가변적

### 서버 스펙

- _Micro, Compact, High Memory_ 등 서버 스펙이 서로 상이한 것끼린 스펙 변경이 불가하다. 대신 같은 스펙을 갖고 있는 것끼린 컴퓨팅 자원을 올릴 수 있다.

<img width="572" alt="2-1" src="https://user-images.githubusercontent.com/66216102/126180341-3441d6ba-8888-4c3d-8583-8a9f1d6ebcf6.PNG">

## Bare Metal Server

- **<u>단독으로 사용할 수 있는 고성능 물리 서버를 클라우드 형태로 제공</u>**
  - 물리 서버에 하이퍼바이저 없이 바로 운영 체제를 설치하여 제공
  - 적합한 RAID 구성 방식을 선택할 수 있습니다.(RAID1 +0 / RAID5)
  - 단독 서버를 사용하는 것이기 때문에 성능에 민감한 서비스도 안정적으로 운영 가능
  - CentOS, ORACLE Linux와 windows 제공
  - 네이버 클라우드 플랫폼의 다양한 서비스와 연계 가능(단, 내서버 이미지, 스냅샷, 추가스토리지 기능 제외)

> RAID란 ?
>
> - Redundant Array of Independent Disk (독립된 디스크의 복수 배열)
> - Redundant Array of Inexpensive Disk (저렴한 디스크의 복수 배열)

## GPU 서버

- **<u>GPU 카드 스펙을 고르게 되면 자동으로 서버 스펙이 결정되는 형태의 컴퓨팅 서비스</u>**

<img width="571" alt="2-2" src="https://user-images.githubusercontent.com/66216102/126180349-ed093f79-1d28-48ec-a7a5-3cd981460614.PNG">

## 서버 Operation 방법

> AWS 클라우드 서비스와 비슷함

<img width="569" alt="2-3" src="https://user-images.githubusercontent.com/66216102/126180351-d7aff926-5c61-49d4-99b0-f20356b79ac3.PNG">

## LAB 1

> 랩 시작하기 전에 앞서, 회원가입 후 결제등록을 해야 서비스 이용이 가능함

- **<u>Micro 서버를 사용해야 프리티어로 1년간 무료로 사용가능!</u>**

<img width="858" alt="2-4" src="https://user-images.githubusercontent.com/66216102/126180354-a277aa05-a7aa-4c43-a249-25649f86253d.PNG">

- 포트포워딩 및 ACG 설정
  - 아래 포트포워딩 레퍼런스 참고

<img width="1049" alt="2-5" src="https://user-images.githubusercontent.com/66216102/126180357-0bc6e227-5a59-4395-b8c6-668968bd0021.PNG">

## Reference

[https://harryp.tistory.com/806](https://harryp.tistory.com/806)

[edwith.org/ncloudassociate/lecture/61956/?isDesc=false](edwith.org/ncloudassociate/lecture/61956/?isDesc=false)

[네이버클라우드 - 포트포워딩 레퍼런스](https://guide.ncloud-docs.com/docs/ko/compute-compute-2-2-v2)
