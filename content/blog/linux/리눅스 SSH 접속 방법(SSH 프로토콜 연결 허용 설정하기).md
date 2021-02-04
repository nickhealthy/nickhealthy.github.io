---
title: '리눅스 SSH 접속 방법(SSH 프로토콜 연결 허용 설정하기)'
date: 2021-01-28 20:48:50
category: 🖥️ linux
thumbnail: { thumbnailSrc }
draft: false
---

## SSH Server 설치

원격 서버에서 SSH 프로토콜을 사용하여 터미널에 접속하려면 다음과 같은 조건이 필요하다.

- **22번 TCP 포트**가 방화벽에서 열려있어야 한다.
- SSH 서버 프로그램이 **설치 및 구동**되고 있어야 한다.
- SSH 프로토콜로 접속할 수 있는 **SSH 클라이언트**가 필요하다.

> **카페24, 고대디, 가비아** 등의 **호스팅 서비스**나 **AWS, Azure, GCP**와 같은 **클라우드 서비스**를 제공하는 업체는 SSH 서비스를 기본 설치된 상태로 제공

- CentOS, RedHat Enterprise Linux (yum 패키지 관리자인 경우)

```bash
$ yum install openssh-server
```

- Ubuntu, Debian (apt 패키지 관리자의 경우)

```bash
$ apt install openssh-server
```

> `which` 명령어를 사용하여 설치가 완료되었는지 확인이 가능

## SSH 접속을 위한 설정

SSH 서버를 구동하기 전, 방화벽 프로그램에서 **tcp 포트 22번을 허용**해주어야 한다.

운영체제마다 기본으로 사용되는 프로그램이 다를 수 있으므로 구동되고 있는 방화벽이 어떤 것인지 확인한 후 아래 각 방화벽 프로그램 별 명렁어를 입력해야한다. 아래 과정은 모두 **root 권한**으로 실행

- iptables의 경우

```bash
[root@localhost ~]# iptables -A INPUT -p tcp -m tcp --dport 22 -j ACCEPT
```

- firewalld의 경우 (예: CentOS 7 이상)

```bash
[root@localhost ~]# firewall-cmd --zone=public --add-port=22/tcp --permanent
```

- ufw의 경우 (예: Ubuntu)

```bash
[root@localhost ~]# ufw allow 22/tcp
```

## 서비스 변경사항 적용 및 확인

이제 모든 설정이 완료되었다. **SSHD 서비스를 시작**하여 다른 PC에서 접속할 수 있도록 설정

```bash
[root@localhost ~]# service sshd start (또는 systemctl start sshd)
```

> 만약 위 명령어로 서비스가 인식되지 않는 경우 **sshd** 대신 **ssh**로 입력하여 시도 (service ssh start)

### ps 명령어 이용

결과가 나타난다면 서비스가 구동 중인 것임

```bash
[root@localhost ~]# ps -aef | grep sshd
root       5255      1  1 17:54 ?        00:00:00 /usr/sbin/sshd -D
```

### service 명령어 이용

Active: active 로 나타난다면 서비스가 구동 중인 것임

```bash
[root@localhost ~]# service sshd status
```

### Systemctl 명령어 이용

Active: active 로 나타난다면 서비스가 구동 중인 것임

```bash
[root@localhost ~]# systemctl status sshd
```

## SSH 접속

**호스트 주소(IP 또는 도메인)와 사용자 정보(Credential)**가 있으면 접속이 가능하다. 각각의 SSH 클라이언트 프로그램 마다 접속 방법이 다를 수 있다. (PUTTY 추천)

`ifconfig` 또는 `ip addr` 명령어로 **ens33 또는 eth0** 항목의 **inet** 항목의 값을 참고하여 접속하면 된다.

## Reference

[https://jootc.com/p/201808031462](https://jootc.com/p/201808031462)
