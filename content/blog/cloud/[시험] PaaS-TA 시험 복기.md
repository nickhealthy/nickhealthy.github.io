---
title: '[시험] PaaS-TA 시험 복기'
date: 2021-10-25 17:20:13
category: '☁️ cloud'
draft: false
---

## 사전 준비사항

- boshVM 재기동

```bash
$ vboxmanage startvm $(bosh int warden/state.json --path /current_vm_cid) --type headless
```

- bosh cli 로그인

```bash
# 해당 경로에 진입 후, 로그인 쉘 스크립트 진행
$ cd ~/workspace/paasta-5.5/deployment/bosh-deployment
$ source login.sh
```

- IP 라우팅 확인 및 등록

```bash
# ip 라우팅 목록 확인
$ sudo ip route
# 없을 시 등록
$ sudo ip route add   10.244.0.0/16 via 10.0.1.6
```

- cf-cli 로그인

```bash
$ cf login # 아이디/패스워드 입력
```

## 1번 - uaa VM에 접속 후, 실행중인 process를 출력하시오.

- 현재 boshVM에서 기동중인 VM 목록 확인

```bash
$ bosh -e micro-bosh vms
```

![1  1번 문제](https://user-images.githubusercontent.com/66216102/138801290-59263c9f-42f7-4e14-ac5c-a4a1d63c9df9.JPG)

- uaa 해당 VM에 진입
  - `-d` 옵션은 deployment의 이름을 의미함

```bash
$ bosh -e micro-bosh -d paasta ssh uaa
```

- root 권한 부여 및 실행중인 process 목록 확인

```bash
$ sudo su
$ monit summary
```

![1-1  1번 문제](https://user-images.githubusercontent.com/66216102/138801284-f93720f0-2930-49b7-a9ed-f9ab85229b30.JPG)

## 2번 - boshVM를 배포하게 될 땐 release 파일을 이용하게 되는데 현재 사용중인 diego의 버전을 출력하시오.(grep 명령어 사용 필수)

- 배포된 release 목록 확인

```bash
$ bosh -e micro-bosh releases
```

![1-2  1번 문제](https://user-images.githubusercontent.com/66216102/138801286-daec129b-99b9-43ba-b5f1-2b67ad2fcf75.JPG)

- diego 버전 출력

```bash
$ bosh -e micro-bosh releases | grep diego
```

![1-3  1번 문제](https://user-images.githubusercontent.com/66216102/138801289-21345703-48c5-4223-bd7d-3756529a6393.JPG)

## 3번 - credhub를 이용해 cf-mysql-admin-password를 출력하시오.(HINT: credhub command) 이용

- credhub-cli 로그인 및 로그인 확인
  - `credhub --version` 명령어를 입력했을 때, <u>서버 버전이 나온다면 로그인이 정상적으로 된 것</u>

```bash
$ source credhub_login.sh
$ credhub --version
```

- PaaS-TA 인증정보 저장소(credhub) 목록 조회

```bash
$ credhub find
```

![1  3번 문제](https://user-images.githubusercontent.com/66216102/138801283-d50ca481-fc6b-41b8-b49c-ef504cb0fdd8.JPG)

- 혹은 grep 명령어 사용

```bash
$ credhub find | grep cf_mysql_mysql_admin_password
```

## 4번 - cf user, org, org_role, space, space_role 생성 및 권한 적용

> 요구사항
>
> ID : paasta
> PWD : test
> ORG : edu
> ORG_ROLE : OrgManager
> SPACE : dev
> SPACE_ROLE : SpaceDeveloper

- 현재 로그인 정보 및 org & space 확인

```bash
$ cf target
```

![1  4번 문제](https://user-images.githubusercontent.com/66216102/138911624-686bb1e3-984c-4f67-90d2-7a80bbb1bc41.JPG)

- 새로운 Org 생성

```bash
$ cf create-org edu
```

![1-1  4번 문제](https://user-images.githubusercontent.com/66216102/138911627-9e98a0c8-d455-4e08-8e18-f60ad9f89eaa.JPG)

- 새롭게 생성한 Org(edu)에 space 생성
  - `-o` 옵션 : Organizaion 옵션으로 == Org 임

```bash
$ cf create-space dev -o edu
```

![1-2  4번 문제](https://user-images.githubusercontent.com/66216102/138911629-202e1d8b-3ad3-46f2-a5ce-1d69e3302409.JPG)

- 현재 로그인 되어있는 target을 새롭게 생성한 Org(edu)로 전환

```bash
$ cf target -o edu
```

![1-3  4번 문제](https://user-images.githubusercontent.com/66216102/138911633-774ec812-0cbe-4ed8-b75c-33704c8d2d3c.JPG)

- paasta 계정 생성
  - 명령어 뒤에 순서는 <u>아이디 비밀번호</u> 순

```bash
$ cf create-user paasta test
```

- Org-Role 적용 및 확인
  - `org-users` 명령어 뒤에 Org 이름을 입력하면 현재 적용된 롤의 계정을 확인해볼 수 있음

```bash
$ cf set-org-role paasta edu OrgManager
$ cf org-users edu
```

![1-4  4번 문제](https://user-images.githubusercontent.com/66216102/138911634-32b52104-b641-4056-9e58-6c90eec6e829.JPG)

- Space-Role 적용 및 확인
  - 마찮가지로 space-users <ORG> <SPACE 이름> 입력 시 확인 가능

```bash
$ cf space-role paasta edu dev SpaceDeveloper
$ cf space-users edu dev
```

![1-5  4번 문제](https://user-images.githubusercontent.com/66216102/138911635-2b8ce5f3-b014-4167-886f-af96d15b8011.JPG)

- 최종 확인

![1-6  4번 문제](https://user-images.githubusercontent.com/66216102/138911636-252bf9b1-ce6f-4ace-b7ed-a0f1b2653867.JPG)

> 중간에 paasta 계정 오류로 paasta2로 진행함

## 5번 - spring-music app 배포하기

> 요구사항
> Disk : 2G
> Memory : 2G
> Instance : 2개
> route : 설정 안함

- 해당 명령어 및 --help 명령어 참고

```bash
$ cf push -i 2 -m 2G -k 2G --no-route
```
