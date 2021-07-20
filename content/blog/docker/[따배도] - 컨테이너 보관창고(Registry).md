---
title: '[따배도] - 컨테이너 보관창고(Registry)'
date: 2021-07-20 21:04:30
category: '🐳 docker'
thumbnail: { thumbnailSrc }
tags: [docker, linux]
draft: false
---

- 도커 이미지를 저장하는 Public 공간과(도커 허브) Private을 구축하는 방법을 알아봅시다.

## Docker Registry

### Registry

- 컨테이너 이미지를 저장하는 저장소

- Public은 Docker Hub, <u>**Private는 Registry 도커 공식 이미지를 사용합니다.**</u>
  - 아래는 도커 허브의 이미지 저장소입니다.

> Private 공간을 도커 허브 자체에서 사용할 수도 있지만 유료화라 비용을 지불해야 합니다.

![1  도커허브 이미지저장소](https://user-images.githubusercontent.com/66216102/126321344-c223fd65-58e6-4fcb-a058-8e9fb992d940.JPG)

## Private Registry 구축

- 도커 허브 공식 이미지에서 관리하는 `registry` 도커 이미지를 사용해 Private 이미지 저장소를 구축할 수 있습니다.

![1-1 프라이빗 레지스트리 컨테이너 이미지](https://user-images.githubusercontent.com/66216102/126321350-eb8b7d35-0e10-4ec1-88bb-b82846b8e588.JPG)

- 실행방법은 하단 참고

```bash
$ docker run -d -p 5000:5000 --restart always --name registry registry:2
```

### image repository

- 퍼블릭 공간인 도커 허브에 배포할 땐 `docker push <호스트네임>:<버전>` 형식으로 했지만,
- `<호스트네임>:<포트넘버>/<이미지 이름>:<버전>` 형식으로 입력해 주어야 도커 Private 이미지 컨테이너인 Registry에 이미지가 저장됩니다.

## 실습

### 퍼블릭 컨테이너 저장소

- `docker search 이미지` 명령어로 이미지 찾아보기
  - NAME 또는 DESCRIPTION 에 표시된 이미지들이 표시됨

```bash
$ docker pull httpd:latest
```

- 도커 허브에 로그인하고 내 레포지토리에 올리기

```bash
$ docker login # 도커 허브에 로그인하기
$ docker pull httpd:latest
```

- 도커 허브에 push하기 위한 새로운 tag 설정

![2  도커퍼블릭 실습](https://user-images.githubusercontent.com/66216102/126321351-792ea5e5-587d-4e78-9f11-29f55263f131.JPG)

- 도커 허브에 push
  - 해당 명령어가 완료되면 **나의 레포지토리**에 정상적으로 이미지가 올라간 것을 확인할 수 있습니다.

```bash
$ docker push alskadmlcraz/httpd:latest
```

### 프라이빗 컨테이너 저장소

- 도커 공식 이미지인 `registry` 컨테이너 이미지 실행

```bash
$ docker run -d -p 5000:5000 --restart always --name registry registry:2
```

- 위에서 설명한 것과 같이 형식을 맞춰 Tag 저장
  - `<호스트네임>:<포트넘버>/<이미지 이름>:<버전>`

```bash
$ docker tag httpd:latest localhost:5000/httpd:latest
```

- 프라이빗 컨테이너 저장소에 이미지가 잘 있는지 확인
  - 아래 경로에서 `ls` 명령어를 통해 확인 가능

```bash
$ /var/lib/docker/volumes/컨테이너ID/_data/docker/registry/v2/repositories
```

## Reference

[https://hub.docker.com/](https://hub.docker.com/)
