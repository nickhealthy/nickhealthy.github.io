---
title: 'Practice - 데이터베이스(MySQL)와 장고 연결하기'
date: 2021-01-29 15:07:30
category: '🐳 docker'
thumbnail: { thumbnailSrc }
draft: false
---

## 준비사항

도커 컴포즈용 예시 프로젝트 저장소 클론

```bash
$ git clone https://github.com/raccoonyy/django-sample-for-docker-compose.git
```

## 도커 이미지 빌드

1. 프로젝트의 루트 디렉토리에서 도커 이미지 생성

```bash
$ docker build -t django-sample .
```

2. 도커 이미지 확인

```bash
$ docker image ls | grep django-sample
```

## Django 앱 컨테이너 실행

1. Django 앱 컨테이너 실행, 다음 명령은 django-sample 이미지를 컨테이너로 실행하는 명령어

```bash
$ docker run -it --rm \
    -p 8000:8000 \
    django-sample \
    ./manage.py runserver 0:8000
```

2. 데이터베이스에 연결되지 않았기 때문에, 마지막 부분에 에러 화면 표시

```bash
django.db.utils.OperationalError: could not connect to server: Connection refused
    Is the server running on host "localhost" (127.0.0.1) and accepting
    TCP/IP connections on port 5432?
could not connect to server: Cannot assign requested address
    Is the server running on host "localhost" (::1) and accepting
    TCP/IP connections on port 5432?
```

## 데이터베이스 컨테이너 실행

데이터베이스 컨테이너를 새로 생성한 후 도커 명령어로 실행

```bash
$ docker run -it --rm postgres
```

- 데이터베이스 서버가 실행되지만, 앱 개발 서버는 여전히 동작하지 않는다.

## Django앱과 데이터베이스 연결하기

**기본적으로 도커 컨테이너들은 각각 격리된 환경에서 실행된다.** 다시 말해, 별도의 옵션을 지정하지 않으면 다른 컨테이너의 존재를 알 수 없음. 앞에서는 앱 컨테이너에 별 옵션을 지정하지 않고 실행한 후, 데이터베이스 컨테이너를 실행했다. 따라서 앱 컨테이너는 PostgreSQL 컨테이너가 실행되었는지 여부를 알지 못한다.

앱 컨테이너에게 데이터베이스 컨테이너의 존재를 알려주기 위해서는 다음 과정을 거쳐야 한다.

1. 데이터베이스 컨테이너를 실행하면서 컨테이너 이름을 붙이고(db라고 지정),
2. 앱 컨테이너를 실행할 때 db 컨테이너를 연결해 준다.

데이터베이스 컨테이너 실행

```bash
$ docker run --rm \
    --name db \
    -e POSTGRES_DB=djangosample \
    -e POSTGRES_USER=sampleuser \
    -e POSTGRES_PASSWORD=samplesecret \
    postgres
```

- 이번에는 `-it` 옵션을 삭제하여, 컨테이너를 데몬 형태로 실행
- `--name`: 데이터베이스 컨테이너에 `db`라는 이름을 붙임
- `-e`: 환경변수를 설정하여 컨테이너를 실행할 수 있다.
  - 여기서는 컨테이너 시작과 함께 `djangosample` 데이터베이스를 만들고(`POSTGRES_DB`),
  - `sampleuser`라는 사용자에게 접속 권한을 부여(`POSTGRES_USER`, `POSTGRES_PASSWORD`)한다.

> 참고로, 여기서 설정한 사용자 이름이나 비밀번호, 데이터베이스 이름 같은 환경변수들은 djangosample/settings.py 파일 안에 설정해 둔 기본값들이다.

이제 앱 컨테이너를 실행하면서 `db` 컨테이너를 연결(link)한다.

```bash
$ docker run -it --rm \
    -p 8000:8000 \
    --link db \
    -e DJANGO_DB_HOST=db \
    -e DJANGO_DEBUG=True \
    django-sample \
    ./manage.py runserver 0:8000
```

- `--link`: 참조할 다른 컨테이너를 지정한다.

<br />

> 정상적으로 실행되는 것을 확인할 수 있음

<img alt="캡처" src="https://user-images.githubusercontent.com/66216102/106259706-ebf5be80-6262-11eb-8ab3-ef00b992e520.PNG">

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
