---
title: 'KOSTA_Ansible을 이용한 AWS 클라우드 DevOps 자동화 구현-3'
date: 2021-09-16 18:41:13
category: ⛓️ devops
draft: false
---

### 학습목표

- AWS의 핵심 서비스 기능을 이해하기
- AWS 인스턴스(VM)의 라이프사이클을 관리하기
- AWS 인스턴스로 마이그레이션 하기
- AWS 서비스를 효율적으로 요금 설계하기

## 클라우드란?

- 관리 노력과 서비스 공급자의 상호 작용을 최소화하면서 신속하게 제공하거나 해제할 수 있는 구성 가능한 **컴퓨팅 리소스(CPU, RAM, 네트워크, 서버, 스토리지, 애플리케이션, 서비스 등)**의 공유 폴에 어디서나 편리하게 필요한 시점에 네트워크(인터넷)로 접근할 수 있게 하는 모델입니다.

### 클라우드 서비스 모델

- Infrastructure as a Service
  - 인프라 자원(서버, 네트워크, 스토리지, 가상화 등)을 구축해주는 것이 IaaS 입니다.
- Platform as a Service
  - <u>필요한 인프라 자원과 미들웨어, OS, 런타임 등까지 구축</u>해주는 것을 PaaS 서비스입니다. 즉, 애플리케이션과 데이터만 사용자 영역입니다.
  - AWS - beanstalk 서비스가 대표적인 PaaS
- Software as a Service
  - 소스코드까지 모든 작업을 완료된 상태로 제공하는 것이 SaaS 서비스입니다.

### AWS 란?

- 세계적으로 가장 포괄적이며, 널리 채택되고 있는 클라우드 플랫폼입니다.
- 현재 한국의 AWS의 가용 영역은 4개. 즉, 데이터 센터가 4개 있는 것입니다.

#### AWS 특장점

- 초기 비용 없이 사용한 만큼만 지불하는 <u>종량 과금제 방식</u>
- 온프레미스 서버 구축 기관과 비교하여 <u>빠른 인프라 구축 속도</u>
- 온프레미스 서버 환경의 리소스 확장 시와 달리 <u>사전 리소스 확보 불필요</u>
- 인스턴스(가상 서버) <u>라이프사이클의 손쉬운 관리</u>
- **<u>고가용성</u>** 및 무정지 장애허용 시스템 구축에 필요한 서비스 제공
- <u>API 제공으로 서비스 관리 자동화 용이</u>

### AWS EC2의 비용 - EC2 인스턴스 시작 유형

- 온디맨드 인스턴스 : 짧은 워크로드, 예측 가능한 가격
- 예약 인스턴스: 긴 워크로드에 적합(최소 1년)
  - 가변 예약 인스턴스 : 유연한 인스턴스가 있는 긴 워크로드
  - 스케줄 예약 인스턴스 : 예 - 매주 목요일 오후 3시에서 6시 사이
- 스팟 인스턴스: 짧은 워크로드, 저렴하지만 인스턴스를 잃을 수도 있음
- 전용 호스트: 전체 물리적 서버를 예약하고 인스턴스 배치를 제어합니다.

#### 조금 더 자세히 알아봅시다.

1. 온디맨드 인스턴스(주문형 - 실습용)

   - 사용한 만큼 지불하십시오
   - 비용은 가장 높지만 <u>선불 결제는 없습니다</u>.
   - 장기 약정이 없습니다.
   - 애플리케이션의 작동 방식을 예측할 수 없는 <u>단기 및 중단 없는 워크로드에 권장</u>됩니다.

2. 예약 인스턴스(실무용)
   - 주문형에 비해 <u>최대 75% 할인</u>
   - 장기 약정으로 사용한 것에 대해 <u>선결제</u>합니다.(공통)
   - 예약 기간은 <u>1년 또는 3년</u>입니다.
   - 특정 <u>인스턴스 유형을 예약</u>으로 선택 하십시오.
   - 정상 상태 사용 응용 프로그램(데이터베이스)에 권장됩니다.
   - 2가지의 종류가 존재함
   - 종류 1: 가변 예약 인스턴스
     - EC2 인스턴스 유형을 변경할 수 있습니다.
     - 최대 54% 할인
   - 종류 2 : 스케줄된 예약 인스턴스
     - 예약 한 시간 내에 시작하십시오.
3. 스팟 인스턴스

   - 주문형에 비해 <u>최대 90% 할인</u>을 받을 수 있습니다.
   - 최대 가격이 현재 스팟 가격보다 낮은 경우 언제든지 "<u>손실</u>"할 수 있는 인스턴스
     - 즉, 경매에 의해 언제든지 다른 사용자에게 뺏길 수 있는 인스턴스
   - AWS에서 <u>가장 비용 효율적인 인스턴스</u>입니다.
   - 장애에 탄력적인 워크로드에 유용합니다. - 장애가 나도 상관이 없는 작업들
     - Batch 작업
     - 데이터 분석
     - 이미지 처리
   - **<u>중요한 작업이나 데이터베이스에는 적합하지 않습니다.</u>**
     - **<u>주로 EKS, ECS 상품에 많이 사용됨</u>**
   - 그레이트 콤보: 기준선 + 예약 주문형 및 피크에 대한 스팟 예약 인스턴스

4. 전용 호스트
   - 한 사용자를 위한 <u>물리적 전용 EC2 서버</u>
   - EC2 인스턴스 배치를 완전히 제어합니다.
   - 3년 동안 사용자의 계정에 할당됩니다.
   - <u>복잡한 라이선싱 모델(BYOL : 기존 보유 라이선스 사용)이 있는 소프트웨어에 유용</u>합니다.
   - <u>또는 강력한 규제 또는 규정 준수 요구가 있는 회사의 경우 유용</u>

## Amazon VPC

- 사용자가 정의한 가상 네트워크로 AWS 리소스를 시작할 수 있습니다.
- Virtual Private Cloud(VPC) : <u>사용자의 AWS 계정 전용 가상 네트워크</u>입니다.
- 전체 네트워크 주소 범위는 <u>172.31.0.0/16</u>입니다. (리전 단위)
  - 서브넷: **<u>각각의 AZ에 1개씩 네트워크 주소가 할당된 VPC의 IP 주소 범위</u>**입니다.
  - AZ 단위: 172.31.0.0/20=a, 172.31.16.0/20=b, 172.31.32.0/20=c, 172.31.48.0/20=d

### 용어 정리

- 라우팅 테이블
  - <u>네트워크 트래픽을 전달할 위치를 결정</u>하는데 사용되는 라우팅이라는 <u>규칙 집합</u>입니다.
  - 172.31.0.0/16(서브넷 단위)
- 인터넷 게이트웨이
  - <u>VPC의 리소스와 인터넷 간의 통신을 활성화</u>하기 위해 VPC에 연결하는 게이트웨이입니다.
  - 라우팅 테이블에 할당됩니다.(VPC 단위)
- Network ACL
  - 인바운드(내부로의 통신) , 아웃바운드(외부로의 통신)를 기반으로 모든 통신을 허가합니다.(서브넷 단위)
- Security Group
  - 인바운드의 기본 값은 모든 통신을 거부합니다.
  - 아웃바운드는 모든 통신을 허가합니다.(인스턴스 단위)

## LAB 1 - VPC를 이용해서 네트워크 대역대를 바꾸기

#### 172.31.0.0/16의 기본 네트워크 대역대를 192.168.0.0/16 대역으로 바꾸기

> 정의 순서
>
> 1. vpc 네트워크 생성
> 2. 서브넷 생성
> 3. 인터넷 게이트웨이 생성
> 4. 라우팅 테이블 생성
> 5. 네트워크 ACL 설정
> 6. 보안그룹 설정

- VPC 생성 시 자동 생성되는 항목
  - 기본 라우팅 테이블
  - 기본 네트워크 ACL
  - 보안그룹(생성 후 상세화면 페이지에선 안보임)

1. VPC 네트워크 생성

![1  브이피시생성](https://user-images.githubusercontent.com/66216102/135949486-1e86925d-c5fa-4798-beb7-5514b6bbbc33.JPG)

2. 서브넷 생성
   - CIDR 값은 상황에 맞게 필요한대로 설정

![2  SUBNET-create](https://user-images.githubusercontent.com/66216102/135949493-239081f1-1e7a-447a-8f1b-cbef7de74995.JPG)

3. 인터넷 게이트웨이 생성

![3  internetGateway-create](https://user-images.githubusercontent.com/66216102/135949494-dfe76da2-2c61-44f8-b1ba-b45199bfdb63.JPG)

4. 인터넷 게이트웨이 생성 후, VPC에 연결해주어야 함

![3-1  internetGateway-create](https://user-images.githubusercontent.com/66216102/135949495-d298e1e3-7cb4-4793-9c1d-7ed02824b426.JPG)

5. 라우팅 테이블 설정
   - 인터넷 게이트웨이를 추가

![4  RoutingTable](https://user-images.githubusercontent.com/66216102/135949496-9dda41a8-61cf-4add-a42e-497f1e263da9.JPG)

![4-1  RoutingTable](https://user-images.githubusercontent.com/66216102/135949501-57f95517-fa0e-4c81-8679-3dcdcb226c6b.JPG)

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

알고가기!

라우팅 테이블 생성시 기본의 "예" 와 "아니요"로 표시가 되는데, 이것은 <u>명시적 서브넷를 할당하지 않아도 자동으로 생성한 VPC의 서브넷과 연결된 것을 의미</u>합니다.("예 일때")

</div>
</div>

#### 번외 - 사용자 VPC 생성 시, 기본 VPC와 동일하게 공인 IP 자동 할당을 활성화 시키는 방법

- 서버 생성 시 기본 VPC를 사용하게 되면 <u>퍼블릭 IP 자동 할당</u>이 활성화가 되어 있지만 <u>새롭게 생성되는 VPC를 사용하게 되면 따로 활성화 버튼을 눌러줘야합니다.</u>
- 이를 자동 할당으로 변경하기 위해선
  1. 새롭게 만든 서브넷의 <u>작업 - 자동 할당 IP 설정 수정 - 자동 할당 IPv4 정보 체크</u> 하면 됩니다.

![1  자동할당 아이피 추가](https://user-images.githubusercontent.com/66216102/135949492-923b362a-b22a-4509-8d6c-735d3ec2d6cd.JPG)

#### 번외 - DNS 호스트 이름 활성화 하는 방법

- AWS는 서버를 만들게 되면 무료로 DNS를 하나 만들어주게 되는데, 새로운 VPC를 만들고 별다른 설정 없이 서버에 이용하게 되면 DNS가 생성되지 않습니다.
  1. 무료로 제공해주는 DNS의 기능을 사용하기 위해 새로운 VPC 생성 후,
  2. 해당 VPC의 <u>작업 - DNS호스트 이름 편집 - DNS 호스트 이름 활성화 체크</u> 하면 됩니다.

![1  dns-host](https://user-images.githubusercontent.com/66216102/135941302-cf344d16-47a2-4a31-b18a-8b4c71de7ada.JPG)

![1-1  dns-host](https://user-images.githubusercontent.com/66216102/135941304-3e69dfc7-6a56-4546-99f3-2e8910321e7a.JPG)

## EBS(Elastic Block Store)

- 인스턴스에 사용할 수 있는 <u>블록 수준 스토리지</u> 볼륨을 제공합니다.
  - 블록 수준 스토리지 : 일정 수준의 블록 단위로 나누어 놓는 것을 의미함
- EBS 볼륨은 형식이 지정되지 않은 원시 블록 디바이스처럼 동작합니다.
  - 인스턴스에 <u>디바이스로 마운트할 수 있습니다.</u>
  - 동일한 인스턴스에 여러 볼륨을 탑재하고, 한 번에 여러 인스턴스에 볼륨을 탑재할 수 있습니다.
  - **<u>볼륨 연결은 인스턴스와 동일한 가용 영역에 만들어줘야 편합니다.</u>**

## LAB 2 - EBS 생성 및 서버 마운트

- 나중에 작성

## EBS Snapshot

- EBS 볼륨의 특정 시점 스냅샷을 생성하여 <u>새 볼륨이나 데이터 백업의 기준으로 사용</u>할 수 있습니다.
  - **다른 리전에서 활용이 가능합니다.**
- 볼륨의 스냅샷이 주기적으로 생성되는 경우 스냅샷은 증분식 이어서 **<u>새 스냅샷은 마지막 스냅샷 이후 변경된 블록만 저장</u>**합니다.
- 연결되어 사용중인 볼륨의 스냅샷을 만들 수 있습니다.
- 하지만 스냅샷은 snapshot 명령을 실행할 때 Amazon EBS 볼륨에 기록된 데이터만 캡처합니다.
  - 이때 애플리케이션이나 운영체제에 의해 캐시된 데이터가 제외될 수 있습니다.

## LAB 3 - EBS Snapshot 생성

#### 스냅샷을 활용하는 3가지 방법

- 아래 3가지 내용은 조금씩 성격이 다르지만, 모두 <u>복원</u>에 초점이 맞춰져 있음
  - 스냅샷을 이용한 볼륨 생성 - 인스턴스의 볼륨 마운트
  - 스냅샷을 이용한 이미지 생성 - 새로운 인스턴스를 생성할 때
  - 다른 리전으로 스냅샷 복사 - 리전 간 이동

## IAM(identity and Access Management)

- AWS 서비스에 대한 액세스를 안전하게 제어하는 웹 서비스입니다.
  - IAM을 통해 사용자, 액세스 키와 같은 보안 자격 증명, <u>사용자와 애플리케이션이 어떤 AWS 리소스에 액세스 할 수 있는지 제어하는 권한을 한 곳에서 관리</u>할 수 있습니다.
  -

## LAB 4 - IAM 그룹 및 사용자 추가

- IAM 진입 및 사용자 그룹 생성
  - 그룹의 권한 정책은 _AdministratorAccess_
- 사용자 생성
  - 엑세스 유형은 <u>엑세스 키, 관리 콘솔로 나뉘어 집니다.</u>

![1  iam 사용자추가](https://user-images.githubusercontent.com/66216102/133713294-68d0a8dc-0c10-4b98-bf70-d48b3f5d4427.JPG)

- 그룹에 사용자 추가
  - 위에서 만든 *admin그룹의 - AdministratorAccess*을 자동으로 할당 받습니다.
  - 따로 기존 사용자에 권한을 복사할 수도 있고,
  - <u>그룹 권한 이외에, 해당 사용자만 따로 정책을 추가해줄 수 있습니다.</u>

![1-1  iam 사용자추가](https://user-images.githubusercontent.com/66216102/133713299-b7830035-5b93-430a-b198-540a8611a4b3.JPG)

- \*_.csv_ 확장자의 파일을 다운로드 해주세요.
  - 해당 파일은 새롭게 만든 사용자의 정보를 담고 있는 엑셀 파일입니다.
  - <u>유저 이름, 엑세스 키, 비밀번호, 관리 콘솔 링크</u>의 정보를 담고 있습니다.

![1-2  iam 사용자추가](https://user-images.githubusercontent.com/66216102/133713300-35ba1e61-773e-4e92-8d7d-72e72840bdfb.JPG)

- IAM 사용자를 이용해서 접속하기
  - IAM 사용자로 라디오 박스를 바꿔주신 후,
  - 계정(12자리)는 root 사용자의 계정 ID 정보를 입력해주시면 됩니다.
    - 해당 내용은 엑셀 파일에서 <u>콘솔 관리 링크 탭의 숫자 12자리 입니다.</u>

![2  iam 사용자 접속](https://user-images.githubusercontent.com/66216102/133713302-3c428918-309d-49b4-95b4-b978f859f13b.JPG)

- IAM 사용자 아이디, 비밀번호를 통해 로그인하기
  - 사용자 ID, 비밀번호를 입력 후 로그인하면 정상적으로 로그인이 완료됩니다.

![2-1  iam 사용자 접속](https://user-images.githubusercontent.com/66216102/133713305-ad7a016c-1773-4c7a-b8c2-d1f7fa7a8b98.JPG)

#### 번외 - MFA 설정을 통해 보안을 강화할 수 있습니다.

- 암호 정책 설정 - 정형화 된 암호 설정을 의미함
- OTP - 2차 인증 등

## RDS(Relational Database Service)

- 관계형 데이터베이스를 더 쉽게 설치, 운영 및 확장할 수 있는 웹서비스입니다.
- DB 인스턴스는 AWS에 있는 격리된 데이터베이스 환경입니다.
  - DB 인스턴스에 사용자가 만든 여러 개의 데이터베이스가 포함될 수 있습니다.
- 독립 실행형 DB 인스턴스와 함께 사용하는 것과 동일한 도구 및 애플리케이션을 사용하여 DB 인스턴스에 액세스 할 수 있습니다.

## LAB 5 - RDS를 활용하여 워드프레스 만들기

#### RDS와 워드프레스를 설정 및 구동하여 웹 서비스 하기

- MySQL에 접속하기 위한 서버에 DB 클라이언트를 설치하기

```bash
$ sudo yum install -y mysql
```

- RDS에 접속하기 전, <u>보안그룹을 수정</u>해 주어야 함
  - 자동으로 <u>나의 PC의 IP주소</u>로 설정되어 있지만, 서버의 IP주소로 접속해야 하기 때문에 <u>**서버 IP주소를 해당 보안그룹의 인바운드에 추가**</u>해 주어야 합니다.
- RDS mysql 설정

```bash
# RDS 접속
mysql -h "접속 호스트명" -u "userID" -p
# DB 외부 접속 가능한 사용자 만들기
CREATE USER 'nickhealthy'@'%' IDENTIFIED BY '비밀번호';
CREATE DATABASE IF NOT EXISTS wordpress;
# wordpress-DB의 사용자 권한 설정 - 아래는 모든 권한을 다 줌
GRANT ALL PRIVILEGES ON wordpress.* TO 'nickhealthy'@'%';
quit

```

- 워드프레스 설치 및 실행

```bash
# 워드프레스 설치(WEB01)
$ sudo yum install -y httpd php php-mysql php-gd php-mbstring wget unzip
$ sudo wget https://ko.wordpress.org/wordpress-4.8.2-ko_KR.zip
$ cd /var/www/html
$ sudo unzip /home/ec2-user/wordpress-4.8.2-ko_KR.zip
$ sudo chown -R apache:apache wordpress
$ sudo systemctl restart httpd
$ sudo systemctl enable httpd
# 웹브라우저 http://ip.shop/wordpress
```

- 정상 작동 확인

![1  wordpress](https://user-images.githubusercontent.com/66216102/133717228-a6032bb5-aa4a-4a66-ada2-29c20b969a13.JPG)

## S3(Simple Storage Service)

- 확장성과 데이터 가용성 및 보안과 성능을 제공하는 <u>객체 스토리지 서비스</u>입니다.
- 조직 및 규정 준수 요구 사항에 따라 <u>데이터를 조직화하고 세부적인 액세스 제어</u>를 구성할 수 있습니다.

## LAB 6 - S3 웹 호스팅

#### S3 버킷 생성 및 객체 암호화 후 정적 웹 호스팅 서비스를 통해 웹 서비스 해보기

- 버킷 설정 - 객체 퍼블릭 액세스 설정
  - 해당 버튼을 체크 해제하면 모든 객체는 <u>자동으로 퍼블릭으로 설정됨</u>

![1  s3 퍼블릭](https://user-images.githubusercontent.com/66216102/133725612-df479ae9-96ca-4c67-b2a3-b49b599abd67.JPG)

- 버킷 버전 관리, 태그, 기본 암호화
  - 버전관리를 통해 **<u>복원</u>**을 실현할 수 있음
  - 태그 - 객체에 대한 태그
  - 기본 암호화 - 객체에 대한 암호화 설정
    - S3는 S3 버킷 자체에서 암호화 하는 방식
    - KMS - 서버 단에서 암호화 하는 방식

![2  s3 상세설정](https://user-images.githubusercontent.com/66216102/133725615-d4a8490b-8aa8-4b9f-95c0-f2d3336dc9a7.JPG)

- 객체가 <u>일정 시간 또는 무기한으로 삭제 및 덮어쓰는 것을 방지</u>하기 위한 설정 부분

![2-1  s3 상세설정](https://user-images.githubusercontent.com/66216102/133725617-3ce22afe-a438-41b0-b87d-0b7ff625cf41.JPG)

- S3 버킷 내에서 폴더 생성

![3  폴더 생성](https://user-images.githubusercontent.com/66216102/133725619-aa86a3da-6428-4d08-aee6-c228ef5feac5.JPG)

- 폴더 내에 사진 업로드

![4  업로드](https://user-images.githubusercontent.com/66216102/133725621-45d970d2-bbcd-41c3-9511-9eaa18f1bcf8.JPG)

- 이미지 객체에 대한 퍼블릭 설정

![4-1  업로드](https://user-images.githubusercontent.com/66216102/133725622-0bab4533-c485-4aba-8244-1971e827774e.JPG)

- 정적 웹 호스팅에 사용할 HTML 생성
  - 아래에 이미지 태그 `src`는 방금 전 업로드 한 이미지의 URL주소

```bash
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
<title>My Website Home Page</title>
</head>
<body>
<h1>Welcome to my website</h1>
<p>Now hosted on Amazon S3!</p>
<p>I Love AWS</p>
<p>I Love AWS</p>
<p><img src="https://nickhealthy20210917.s3.ap-northeast-2.amazonaws.com/images/two-rabbit.jpg" alt="my test image"></p>
</body>
</html>
```

- index.html 파일 업로드
  - 정적 웹 호스팅을 하기 위해선 `root` 에 위치시켜야 합니다. 즉, S3 폴더의 최상위 디렉토리
  - 해당 파일도 호스팅 하기 위한 퍼블릭으로 설정

![4-2  업로드](https://user-images.githubusercontent.com/66216102/133725624-3d5990d0-d1a9-4aa8-ba2c-af2d466d6cda.JPG)

- 정적 웹 호스팅 설정
  - "속성" 탭 하단에 존재함
  - 정적 웹 호스팅 활성화 후, 정적 웹 사이트 호스팅 체크
  - "인덱스 문서" 란에 가장 먼저 보여질 파일을 추가해야 주소 입력 시, _/index.html_ 주소가 보이지 않게 할 수 있습니다.

![5  정적웹사이트호스팅](https://user-images.githubusercontent.com/66216102/133725625-92cf6c2a-c269-4b54-b0b6-6fb70a835409.JPG)

- 정적 웹 사이트 정보 확인
  - 정적 웹 사이트 호스팅이 <u>활성화</u> 되어 있음

![5-1  정적웹사이트호스팅](https://user-images.githubusercontent.com/66216102/133725626-ec62d0b6-ab17-4142-aaf5-451d0adca4e0.JPG)

- 검증 - 홈페이지 접속
  - 주소에 index.html 이 없고, 정상적으로 나오는 모습
  - 아래는 업로드 한 이미지 사진

![6  검증](https://user-images.githubusercontent.com/66216102/133725627-7a49b2ce-cab4-4d1e-a78d-0dd5e140a829.JPG)
