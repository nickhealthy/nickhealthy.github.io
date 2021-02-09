---
title: 'Jenkins 실습환경 구축'
date: 2021-02-09 14:16:59
category: '🧱 infra'
thumbnail: { thumbnailSrc }
draft: false
---

# VM - Ubuntu 설치 및 환경설정

> Virtual Machine과 Ubuntu 18.04 버전을 이용해서 설치하였습니다.

1. 우분투 사이트 접속 후 18.04 ISO 파일 다운로드 https://releases.ubuntu.com/18.04/
2. VM 환경 설정
   1. 도구 > 환경 설정 > 네트워크 > NAT network
   2. 포트 포워딩 > 포트 포워딩 규칙 설정에서 **호스트 IP(자신의 컴퓨터 IP)**, **호스트 포트(자신의 컴퓨터에서 연결할 포트)**, **게스트 IP(VM 우분투 안에서 ifconfig 명령어로 확인가능)**, **게스트 포트(SSH - 22번)**을 설정한 후 Putty로 접속해 작업하였습니다.

### 예시)

![1](https://user-images.githubusercontent.com/66216102/107371287-783b9780-6b27-11eb-9a43-aea982d534f6.PNG)

# OpenJDK 설치

Jenkins를 설치하기 위해선 자바 엔진이 설치 되어 있어야합니다.

https://bell-sw.com/pages/downloads/ 사이트로 들어가 자신의 OS에 맞도록 설치해주면 됩니다.

### Ubuntu - APT Repository (.deb-based Linux distributions)

> Add BellSoft official GPG key and setup the repository
>
> GPG 키를 등록하고 OpenJDK 파일이 있는 저장소를 등록한 후 설치할 수 있습니다.

1. GPG 키 등록 및 저장소 등록

```bash
$ wget -q -O - https://download.bell-sw.com/pki/GPG-KEY-bellsoft | sudo apt-key add -
$ echo "deb [arch=amd64] https://apt.bell-sw.com/ stable main" | sudo tee /etc/apt/sources.list.d/bellsoft.list
```

2. 저장소 위치를 등록하고 `apt-get` 패키지 관리자가 해당 저장소를 읽을 수 있도록 update 및 설치

```bash
$ sudo apt-get update
$ sudo apt-get install bellsoft-java11
```

3. 자바 버전확인

```bash
$ java --version
```

# Jenkins 설치

이제 Jenkins를 설치할 준비를 마쳤다.

설치는 Jenkins [공식 홈페이지](https://www.jenkins.io/download/)를 참조하였다.

> Debian 버전의 패키지 설치입니다.
>
> The gpg key use to sign our packages has been updated on 16th of April 2020, therefore you need to reimport it if you imported before this date.
>
> 공홈에 패키지 서명은 2020년 4월 16일에 업데이트 되어 날짜 이전에 가져온 경우 다시 가져와야한다고 나와 있습니다.

1. GPG 키 등록 및 저장소 등록

```bash
$ wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
# 저장소를 직접 등록하였다.
$ sudo vi /etc/apt/sources.list
# 마지막 부분에 아래의 명령어를 추가
$ deb https://pkg.jenkins.io/debian-stable binary/
```

2. 저장소 위치를 등록하고 `apt-get` 패키지 관리자가 해당 저장소를 읽을 수 있도록 update 및 설치

```bash
$ sudo apt-get update
$ sudo apt-get install jenkins
```

3. 젠킨스 서버 실행

```bash
# 젠킨스 서버 실행
$ sudo systemctl start jenkins
# 젠킨스 서버 실행여부를 확인
$ sudo systemctl status jenkins
```

# 방화벽 해지 및 접속

우분투의 방화벽을 해제해줘야 젠킨스에 접속이 가능합니다.

젠킨스의 기본 포트는 `8080` 포트이며, `/etc/default/jenkins` 경로에서 `HTTP_PORT` 설정을 통해 포트를 설정해줄 수 있습니다.

1. 해당 포트에 대한 방화벽 해지

```bash
$ sudo ufw allow 8080(포트번호)
```

2. 젠킨스 재시작 & 실행확인

```bash
$ sudo systemctl restart jenkins
$ sudo systemctl status jenkins
```

3. 젠킨스 접속

> 브라우저에 호스트IP와 포트번호를 적어줍니다.
>
> ex) 192.168.x.x:8080

4. 최초 접속시 비밀번호 입력

![2](https://user-images.githubusercontent.com/66216102/107371289-796cc480-6b27-11eb-8bed-9364ac19d4d7.PNG)

젠키스는 서버 실행시 logs에 접속 비밀번호를 알려주는데 `sudo cat /var/lib/jenkins/secrets/initialAdminPassword` 명령어로 확인할 수 있습니다.

![3](https://user-images.githubusercontent.com/66216102/107371295-7a055b00-6b27-11eb-8567-162e580d2776.PNG)

5. 이후 기본 플러그인 설치(`Install suggested plugins`)와 선택 설치(`Select plugins to install`)를 선택해 설치합니다.
6. 설치가 완료되면 접속할 사용자 계정 생성 후 젠킨스를 이용할 수 있습니다.

## 젠킨스 접속 화면

![4](https://user-images.githubusercontent.com/66216102/107371297-7a055b00-6b27-11eb-9ea0-4b7fce1cbc52.PNG)

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
