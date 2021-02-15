---
title: '[따배쿠] virtual machine 설치 및 세팅'
date: 2021-02-16 00:22:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

# 네트워크 구성

- 도구 - 환경설정 - 네트워크 만들기
  - 네트워크 이름: k8s Network
  - 네트워크 CIDR(10.100.0.0/24)

# 포트포워딩

|  이름  | 프로토콜 | 호스트IP  | 호스트포트 |  게스트 IP   | 게스트 포트 |
| :----: | :------: | :-------: | :--------: | :----------: | :---------: |
| master |   TCP    | 127.0.0.1 |    104     | 10.100.0.104 |     22      |
| node1  |   TCP    | 127.0.0.1 |    101     | 10.100.0.101 |     22      |
| node2  |   TCP    | 127.0.0.1 |    102     | 10.100.0.102 |     22      |

# 가상환경 안에서 네트워크

### DHCP 자동 네트워크 구성을 static address로 변경

설정 - 네트워크 - IPv4 - 수동선택

- 주소: 10.100.0.104
- G/W: 10.100.0.1
- 네트마스크: 24
- 네임서버(DNS): 10.100.0.1

# 터미널에서 호스트명 변경

`sudo vi /etc/hostname` 명령어 입력 후 호스트명 입력 및 저장

# 내 호스트이름이랑 다른 호스트들 이름 등록(DNS가 없으니 이걸로 사용)

`sudo vi /etc/hosts`에 IP주소 / 호스트명 / 별칭 등록

- ex) 10.100.0.104 / master.example.com / master
- 10.100.0.101 / node1.example.com / node1
- 10.100.0.102 / node2.example.com / node2

# Ping Test

```bash
$ ping -c 2 8.8.8.8
$ ping -c 2 www.google.com
```

# 해상도 조절, 스크린세이버 해제

- 설정 - 개인정보 - 화면 잠금 - 빈 화면 지연시간 - 안함 클릭
- 디스플레이 - 해상도 설정

# Ubunt20.04 LTS 정보보기

- 커널 버전확인 : `uname -r`
- 메모리 확인: `free -h`
- CPU 정보 확인: `lscpu`
- OS 정보 확인: `cat /etc/os-release`

# SSH Server 설치 및 서비스 동작

```bash
$ sudo apt-get update
$ sudo apt-get install -y openssh-server curl vim tree
```

# root 패스워드 설정

> 우분투 OS는 기본적으로 관리자 계정 하나만 만듬  
> 기본적으로 root 로그인이 안되고, root 패스워드가 없으니 switch도 안되는 것임

```bash
$ sudo passwd root
```

암호 설정 후 root 계정 전환을 시도하면 성공적으로 들어가진다.

# Virtualbox 구성 - 클립보드 공유설정

- 윈도우와 리눅스 가상머신 간에 copy & paste 설정하는 것

  - 장치 - 게스트 확장 이미지 CD 삽입 - 암호 입력 및 설치 - 리부팅

- Virtualbox 설정 - 일반 - 고급 탭 - 클립보드(양방향), 드래그 앤 드롭(양방향)

# 가상머신 부팅 방식을 GUI에서 CLI 변경

> GUI는 리소스가 많이 사용됨  
> CLI 환경으로 변경
>
> - `multi-user.target`가 text 부팅으로 구성하는 것
> - `graphical.target`은 GUI 부팅

```bash
$ systemctl set-default multi-user.target
$ systemctl isolate multi-user.target
```

# Xshell 다운로드

[Xshell](https://www.netsarang.com/ko/downloading/?token=RVQ1Q083aFJDU3FLRWlXaTRhd1Awd0AtR0JoRG9RTzFkSzU2Vi1ONzVkUnBB)

- 호스트 이름 설정

- 네트워크 설정
  - 우리는 Virtualbox에서 구성한 네트워크(포트포워딩)를 따라하면 된다.
  - 호스트 IP: 127.0.0.1 / 포트번호: 104

# docker install

https://docs.docker.com/engine/install/ubuntu/ 참고

설치 후 확인

```bash
$ systemctl status docker
```

# 가상 머신 복제

> node1, node2를 만들기 위함

1. 우분투에서 `init 0` 명령어 입력
2. Virtualbox - master 가상머신에서 복제 클릭
3. 이름 변경, 네트워크 (모든 네트워크)로 바꿔준 후 완전 복제 클릭 후 복제
4. 복제 후 환경구성 변경 - ipaddress, hostname
5. 변경사항을 쉽게 하기 위해 GUI 버전 로그인 `systemctl isolate graphical.target` 입력
6. 네트워크 구성에서 ip변경, `/etc/hostname` 에서 hostname 변경
7. node2도 동일하게 설정
