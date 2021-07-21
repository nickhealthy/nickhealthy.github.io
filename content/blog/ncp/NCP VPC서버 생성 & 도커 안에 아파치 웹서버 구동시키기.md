---
title: 'NCP VPC서버 생성 & 도커 안에 아파치 웹서버 구동시키기'
date: 2021-07-21 21:25:30
category: '🧶 ncp'
thumbnail: { thumbnailSrc }
tags: [docker, linux]
draft: false
---

- 네이버 클라우드 플랫폼에서 VPC-Server(Standard) 스펙으로 생성 후, 해당 서버에 도커 설치 및 아파치 웹서버를 구성해봅시다.

## NCP VPC - Server 생성

- 경로 : Products & Services - VPC 선택 - Server 선택
  - CentOS 7.8 버전으로 진행

![1  ncp_Server 생성](https://user-images.githubusercontent.com/66216102/126489252-436061df-2685-49f1-929b-86a49c89a9e8.JPG)

- 서버 설정
  - VPC, Subnet, Network Interface는 사전에 설정해두어야 서버 생성이 가능합니다.

![3  Server설정](https://user-images.githubusercontent.com/66216102/126489260-2c92bade-9317-4a3c-9965-92e26c48a405.JPG)

- VPC 및 서브넷 생성

![2  SN 설정](https://user-images.githubusercontent.com/66216102/126489258-bcb0a3a4-26b0-4d8d-9600-9f74cc5faea3.JPG)

- 인증키 설정
  - 기존 보안 인증키가 있다면 위에 버튼을 선택해도 무방

![3-1  Server설정](https://user-images.githubusercontent.com/66216102/126489262-c39b1723-0285-4fbb-b2ca-17b60cb0368a.JPG)

- 네트워크 접근 설정
  - 따로 설정해 둔 ACG(Access Control Group)을 설정하지 않았기에 기본값으로 설정

![3-2  Server설정](https://user-images.githubusercontent.com/66216102/126489263-7171afe5-3dde-4dfb-9429-5b235917c4e3.JPG)

- 서버 생성 완료 및 상세 내역
  - 현재 공인 IP는 할당되지 않은 상태

![4  Server생성완료](https://user-images.githubusercontent.com/66216102/126489266-2360e419-8b76-4c56-9ba1-afefb3411031.JPG)

- 공인 IP 생성

![5  공인 아이피생성](https://user-images.githubusercontent.com/66216102/126489269-f6445d12-9978-4173-bed0-72083fd96c6a.JPG)

- 이후 서비스를 위해 ACG 설정이 필요합니다.

![5-1  공인 아이피생성](https://user-images.githubusercontent.com/66216102/126489272-dcb7af86-9276-4839-9f60-1bcb272230bb.JPG)

- 공인 IP 생성 완료 및 상세내역

![5-2  공인 아이피생성](https://user-images.githubusercontent.com/66216102/126489275-91284ad4-a786-471b-a019-1e553b9fd354.JPG)

- 서버 접속을 위해 관리자 비밀번호 확인 버튼 클릭
  - 이전에 생성한 인증키 `PEM` 키를 등록해 관리자 비밀번호를 획득 후, 비밀번호 변경

![6  관리자비밀번호 생성](https://user-images.githubusercontent.com/66216102/126489277-02120424-4ed1-44fa-b473-948455ecbf9d.JPG)

![6-1  관리자비밀번호 생성](https://user-images.githubusercontent.com/66216102/126489279-45d5cfa6-d791-4135-b1dc-44abae40bc6f.JPG)

- 정상적으로 서버에 접속된 모습
  - 기본 업데이트 및 업그레이드

```bash
$ yum -y update && yum -y upgrade
```

![6-2  정상적으로 서버에 접속된 모습](https://user-images.githubusercontent.com/66216102/126489282-adc391b9-159e-4980-b38c-4e1ba5238c6c.JPG)

## 도커 설치 및 테스트

> 도커 설치 내용은 페이지 제일 하단 레퍼런스 참고

- `curl`명령어와 `docker ps`를 통한 작동 테스트

![7  도커 설치 후 아파치 컨테이너 실행](https://user-images.githubusercontent.com/66216102/126489286-22aed997-8e87-4bf3-ab7d-65e3c4fe3e75.JPG)

## 웹서버 접속을 위한 포트포워딩

- NCP 포트포워딩 설정
  - **웹서버의 80 포트 설정**
  - 실행중인 컨테이너에서도 확인할 수 있듯이 호스트 포트번호를 `80`으로 설정함

![8  포트포워딩 설정](https://user-images.githubusercontent.com/66216102/126489287-c06a4f20-e8e8-4a27-b249-d64f8c06eeb3.JPG)

- 웹서버 컨테이너에 접속 및 검증
  - 정상적으로 실행되는 것을 확인

![9  검증](https://user-images.githubusercontent.com/66216102/126489288-db9a7d55-7966-44bb-8e74-fc0cb04787bf.JPG)

- 이렇게해서 NCP - VPC 설정 및 생성과 도커를 통한 아파치 웹서버를 구동시킨 후, 공인 IP로 접속해 보았습니다.

## Reference

[NCP 서버 생성](https://guide.ncloud-docs.com/docs/compute-compute-3-1-v2#)

[NCP 네트워크 인터페이스](https://guide.ncloud-docs.com/docs/compute-compute-7-1)

[NCP 공인IP 생성](https://guide.ncloud-docs.com/docs/ko/compute-compute-2-1-v2)

[도커설치 레퍼런스](https://docs.docker.com/engine/install/centos/) (CentOS 버전)
