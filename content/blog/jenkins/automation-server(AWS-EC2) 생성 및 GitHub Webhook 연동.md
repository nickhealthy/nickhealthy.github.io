---
title: 'automation-server(AWS-EC2) 생성 및 GitHub Webhook 연동'
date: 2021-02-11 18:00:30
category: '👨‍🍳 jenkins'
thumbnail: { thumbnailSrc }
draft: false
---

> 사실 이전에 Jenkins를 이용해서 docker를 자동으로 빌드하는 것을 테스트 해보았는데 생각해보니 webhook을 연동하려면 웹 호스팅이 필요했다. 로컬의 VM으로는 불가능... 결국 AWS-EC2로 빠르게 설정하고 테스트해보았다.

# AWS - EC2 생성

이때동안 우분투 `AMI`만 사용했기에 빠른 시작 탭에서 이미지를 구할 수 있었는데 `centos` 이미지는 AWS-Marketplace에서 찾을 수 있다.

<img width="606" alt="1" src="https://user-images.githubusercontent.com/66216102/107617093-9c67b780-6c92-11eb-97fc-0a22986eadce.PNG">

이후 젠키스의 기본 포트는 `8080` 포트이기 때문에 보안 그룹.인바운드에서 `8080` 포트를 개방해 주었다.

**Jenkins와 github webhook를 위한 것**이기 때문에 자세한 EC2 생성은 생략

# EC2 Putty 접속 후 Jenkins 설치

1. yum 패키지 매니저를 최신으로 업데이트

```bash
$ sudo yum -y update
```

2. Jenkins는 자바 기반으로 돌아가는 오픈 소스이기 때문에 자바가 설치되어 있어야한다. 자바설치
   - JAVA 8 버전 이상부터 가능

```bash
$ sudo yum install java-1.8.0
```

3. 외부로 부터 파일을 다운받기 위한 wget 패키지 설치

```bash
$ sudo yum install -y wget
```

4. yum이 어디서 Jenkins를 설치해야할 지 알 수 있도록 jenkins - repo 추가

```bash
$ sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
```

5. Jenkins 를 설치할 때, 파일들이 신뢰할 수 있는 source 로 부터 제공됨을 증명하기 위해 로컬 GPG 키링에 Jenkins GPG key 를 추가해준다.

```bash
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
```

6. Jenkins 설치

```bash
$ sudo yum install jenkins
```

7. Jenkins 서버 확인 및 시작

```bash
$ sudo systemctl status jenkins
$ sudo systemctl start jenkins
```

8. `8080` 포트 LISTENING 중인지 확인

```bash
$ netstat -na | grep 8080
```

# Jenkins 로그인

1. 초기 접속 비밀번호 확인

```bash
$ sudo cat /var/lib/jenkins/secrets/initialAdminPasswor
```

2. 비밀번호 입력 후 기본 플러그인 설치 및 사용자 계정 생성 후 로그인

# GitHub과 연동 및 Webhook Setting

> Webhook은 웹상의 Trigger 같은 존재입니다. GitHub의 지정한 브랜치에 소스가 push 되면 webhook으로 젠킨스에게 알려주어 빌드를 유발하도록 설정합니다.

1. Jenkins [새로운 item - Freestyle project] 생성
   - 소스코드를 가져온 repo 지정
   - 자격 증명을 해야하므로 깃헙 아이디/비밀번호 입력

<img width="553" alt="1-1" src="https://user-images.githubusercontent.com/66216102/107614945-a5568a00-6c8e-11eb-92a6-43f34acf7685.PNG">

2. [중요] 젠키스가 동작하려면 "어떤 신호를 받아야하는데" 우리는 github의 webhook을 이용하므로 `GitHub hook trigger for GITScm polling`를 체크

<img width="560" alt="1-2" src="https://user-images.githubusercontent.com/66216102/107614948-a5ef2080-6c8e-11eb-9fc6-57e1f2bbbca8.PNG">

3. 빌드할 내용을 정의
   - 단지 테스트용이라 화면에 내용이 출력만 되도록 설정하였다.

<img width="547" alt="1-3" src="https://user-images.githubusercontent.com/66216102/107614949-a687b700-6c8e-11eb-8879-866588502c56.PNG">

4. GitHub의 Webhook 세팅
   - webhook를 설정한 repo - settings - Webhooks창에 들어간다.
   - `Add webhook` 버튼을 클릭

<img width="610" alt="2-1" src="https://user-images.githubusercontent.com/66216102/107614955-a7204d80-6c8e-11eb-8061-3b7804c61bd6.PNG">

> Payload URL에 나의 젠키스 서버 주소를 입력 + `/github-webhook/` 뒤에 추가적으로 입력해주어야 한다.
>
> `Active` 버튼을 클릭해 활성화

5. 해당 프로젝트의 git를 PUSH
6. 젠키스 화면을 보면 자동으로 빌드가 되고 있는 것을 확인할 수 있다.

<img width="628" alt="3" src="https://user-images.githubusercontent.com/66216102/107614958-a7b8e400-6c8e-11eb-8e74-db2a7d57b786.PNG">

7. 젠키스 Console Output 화면 - 정상적으로 SUCCESS가 되며 위에 `echo`로 적은 명령어도 정상 출력되었다.

<img width="536" alt="4" src="https://user-images.githubusercontent.com/66216102/107614959-a7b8e400-6c8e-11eb-8f22-dafc0f1ab443.PNG">

8. 깃헙 페이지에서도 동일하게 체크 모양으로 바뀌며, 빌드가 성공적으로 된 것을 확인할 수 있다.

<img width="628" alt="2" src="https://user-images.githubusercontent.com/66216102/107614950-a687b700-6c8e-11eb-88f0-96f955e93512.PNG">

# Reference

[https://yaboong.github.io/jenkins/2018/05/14/github-webhook-jenkins/](https://yaboong.github.io/jenkins/2018/05/14/github-webhook-jenkins/)

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
