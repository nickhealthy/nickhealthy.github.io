---
title: '도커 네트워크'
date: 2021-02-03 00:07:30
category: '🐳 docker'
thumbnail: { thumbnailSrc }
tags: [docker, linux]
draft: false
---

도커를 공부할 겸 이전에 했던 프로젝트를 도커로 배포하고 싶어서 docker network를 공부하게 되었다.

프로젝트를 진행할 때 검색 엔진을 위해 `elasticsearch` 를 이용했는데 나머지 컨테이너들은 서로 연결이 되었지만 `elasticsearch` 컨테이너는 연결이 안됬었다...

트러블 슈팅도 할겸 이참에 docker network도 배우기위해 시작한다!

## 네트워크 조회

현재 생성되어 있는 Docker network 목록 조회

```bash
$ docker network ls
```

`bridge`, `host`, `none` 은 Docker 데몬이 실행되면서 기본적으로 생성되는 네트워크이다.

대부분의 경우에는 디폴트 네트워크를 사용하는 것 보다는 사용자가 직접 네트워크를 생성해서 사용하는 것이 권장된다.

## 네트워크 종류

Docker 네트워크는 `bridge`, `host`, `overlay` 등 목적에 따라 다양한 종류의 네트워크 드라이버(driver)를 지원한다.

- `bridge` 네트워크는 하나의 호스트 컴퓨터 내에서 여러 컨테이너들이 서로 소통할 수 있도록 해준다.
- `host` 네트워크는 컨터이너를 호스트 컴퓨터와 동일한 네트워크에서 컨테이너를 돌리기 위해서 사용된다.
- `overlay` 네트워크는 여러 호스트에 분산되어 돌아가는 컨테이너들 간에 네트워킹을 위해서 사용된다.

## 네트워크 상세 정보

`docker network ls` 명령을 통해서 조회 된 네트워크 상세정보를 확인해볼 수 있다.

```bash
$ docker network inspect '네트워크이름 or ID'
```

- 이 명령어를 사용하면 다양한 정보들이 포함되어 있지만 **어떤 컨테이너들이 연결되어 있는지도 확인**이 가능하다.
- 또는 해당 컨테이너에 대한 상세정보와 네트워크도 아래의 명령어를 통해 확인이 가능하다.
  - `$ docker inspect '컨테이너이름 or ID'`

## 네트워크 생성

`docker network create '네트워크이름'` 명령어를 이용하면 된다.

추가된 네트워크는 `docker network ls` 커맨드로 확인할 수 있다. 또한 `-d` 옵션을 사용하지 않았기 때문에 기본값인 `bridge` 네트워크로 생성된다.

## 네트워크에 컨테이너 연결

컨테이너를 실행할 때 `--network` 옵션을 명시해주지 않으면, **기본적으로 `bride`라는 이름의 디폴트 네트워크에 붙게 된다.**

해당 컨테이너를 생성한 Docker 네트워크에 연결하기 위해서는 `docker network connect` 커맨드를 사용한다.

```bash
$ docker network connect '생성한네트워크이름' '컨테이너이름 or ID'
```

## 네트워크로부터 컨테이너 연결 해제

하나의 컨테이너는 여러 개의 네트워크에 동시에 연결할 수 있다.

Docker 네트워크로부터 컨테이너의 연결을 끊을 때는 `docker network disconnect` 커맨드를 사용한다.

```bash
$ docker network disconnect '연결을 끊을 네트워크이름' '컨테이너이름 or ID'
```

## 컨테이너 간 네트워킹

> 해당 테스트를 하기 위해서는 하나의 네트워크 안에 두 개 이상의 컨테이너가 존재해야 함.

`one`, `two` 컨테이너가 존재한다고 가정하고 `ping` 명령어를 실행

- 컨테이너 이름을 호스트네임(hostname)처럼 사용이 가능하다.

```bash
$ docker exec one ping two
```

해당 명령어는 `one` 컨테이너가 `two` 컨테이너를 상대로 `ping`를 날리는 것이다.

반대로 `two` 컨테이너가 `one` 컨테이너를 상대로 `ping` 명령어를 날릴건데 컨테이너 이름 대신에 IP를 사용 또한 가능하다.

> ip 확인은 해당 컨테이너의 `inspect`명령어를 통해서 확인이 가능

```bash
$ docker exec two ping 172.19.x.x
```

## 네트워크 제거

`docker network rm '네트워크이름'` 명령어를 이용하면 된다.

**네트워크 상에서 실행 중인 컨테이너가 있을 때는 제거가 되지 않는다.** 해당 네트워크에 연결되어 실행 중인 모든 컨테이너를 먼저 중지 시키고, 네트워크를 삭제해야 한다.

```bash
$ docker stop '컨테이너 이름'
```

## 네트워크 청소

하나의 호스트 컴퓨터에서 다수의 컨테이너를 돌리다 보면 불필요한 리소스가 낭비될 수 있다. 아무 컨테이너도 연결되어 있지 않은 네트워크를 제거 할 때는 `docker network prune` 커맨드를 이용해서 불필요한 네트워크를 한번에 모두 제거할 수 있다.

#### TIP

그 이외에도 모든 불필요한 리소스를 한번에 정리하고 싶다면 `docker system prune -a` 명령어를 이용하면 한번에 처리된다.
