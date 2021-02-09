---
title: '장고프로젝트 docker로 배포하기 with elasticsearch'
date: 2021-02-02 00:07:30
category: '🐳 docker'
thumbnail: { thumbnailSrc }
draft: false
---

멀티캠퍼스 클라우드 교육과정을 들으면서 도커, 쿠버네티스, 클라우드 등 전반적으로 많은 것을 배웠다.
그 중 1차 프로젝트는 장고 웹 프로젝트였는데 이때는 파이썬, 웹 스크래핑, 데이터 조작을 위한 pandas, 장고, SQL/NoSQL 정도만 배웠다.
그리고 이후에 2차 3차 프로젝트를 수행했을 때 AWS 서비스를 이용하면서 클라우드쪽은 건드려 본것 같은데 가상화 컨테이너의 기술로서는 프로젝트를 진행해보지 않은 것 같아 수료 이후 도커를 공부할 겸 배포해보기로 했다.

> 해결하는데 생각보다 정말 오래걸렸다... DB와 장고 서버 `Dockerfile` 작성 및 `docker-compose` 연동은 비교적 쉽게 되었지만 `elasticsearch` 컨테이너와의 연동이 안되었던 것..
>
> 결과적으로 해결되었고 에러를 해결하느라 돌고 돌아 리눅스, 도커 네트워크, 엘라스틱 서치 등등 많은 것을 공부해서 손해는 아니라고 생각한다.

## 방법1. Dockerfile 정의

처음에는 도커 파일을 개별적으로 정의해 **각각의 컨테이너들을 연결해보았다.**

> 여기서부터 DB, 장고는 연동이 완료 되었고, 장고 서버도 정상적으로 돌아갔지만 엘라스틱서치는 안되는 상태였음

- 엘라스틱 서버 실행 확인 명령어

```bash
curl http://localhost:9200/_cluster/health?pretty
```

1. mariaDB 서버 실행

```bash
$ docker run --rm --name db -e MYSQL_ROOT_PASSWORD=project -e MYSQL_DATABASE=project_db -e MYSQL_USER=project -e MYSQL_PASSWORD=project mariadb
```

> mariaDB는 딱히 도커 파일을 안만들어줘도 될거같아서 공식 이미지를 다운받는 동시에 서버를 실행시켰다.

2. backend `Dockerfile` 정의

```dockerfile
FROM python:3.8.5

RUN apt-get -y update
RUN pip install --upgrade pip
# 프로젝트 특성상 필요한 비디오 인코딩 파일 설치
RUN apt-get install -y ffmpeg

WORKDIR /usr/src/app
COPY requirements.txt /usr/src/app
# 프로젝트에 필요한 패키지를 가상환경으로 한번에 설치 및 관리
RUN pip install -r requirements.txt
COPY . /usr/src/app
```

3. backend `Dockerfile` 이미지를 빌드

```bash
$ docker build -t backend .
```

4. mariaDB와 backend 연동 및 실행

```bash
$ docker run -it -d --rm --name backend -p 8000:8000 --link db -e DJANGO_DB_HOST=db -e DJANGO_DEBUG=True backend
```

> --link: 연결할 컨테이너 이름

5. 컨테이너 실행 여부 확인

```bash
$ docker ps -a
```

6. backend 컨테이너 내 진입

```bash
$ docker exec -it backend bash
```

7. django 서버를 실행하기 전 필요한 설정 명령어 & django 서버 실행

```bash
$ python manage.py makemigrations
$ python manage.py migrate
$ python manage.py runserver 0:8000
```

8. localhost에서 접속되는 것을 확인
   - 웹 브라우저에서 `localhost:8000` 입력 후 접속

## docker-compose로 변경

이렇게까지 해서 각각의 도커 컨테이너들끼리 디비와 장고가 연동되었고 서비스를 실행할 수 있었다.(검색엔진인 엘라스틱서치 서버를 제외하고)

하지만 컨테이너 내에 진입해서 설정을 해주는 것도 많고 복잡하다. 이제 이것을 docker-compose를 이용해 좀 더 수월하게 여러 컨테이너들을 한꺼번에 빌드하고 서버까지 바로 실행되도록 해보았다.

backend `Dockerfile` 수정

```dockerfile
FROM python:3.8.5

RUN apt-get -y update
RUN pip install --upgrade pip
# 프로젝트 특성상 필요한 비디오 인코딩 파일 설치
RUN apt-get install -y ffmpeg

WORKDIR /usr/src/app
COPY requirements.txt /usr/src/app
# 프로젝트에 필요한 패키지를 가상환경으로 한번에 설치 및 관리
RUN pip install -r requirements.txt
COPY . /usr/src/app

RUN python manage.py migrate # 명령어 추가
```

> 아주 살짝 수정하였지만 docker-compose.yml에서 `depends_on` 을 설정해 주었으므로 장고 컨테이너가 실행된 후 컨테이너 내부 진입으로 migrate 해줄 필요없이 자동적으로 실행이 되도록하였다.
>
> 또한 docker-compose.yml에서 runserver 까지 선언했기 때문에 **docker-compose up 명령으로 위에서와는 다르게 한번에 정상적으로 서버가 실행된다.**

`docker-compose.yml`

```dockerfile
version: '3'
services:
  # DB 컨테이너 이름 정의
  database:
    # db 서비스에서 사용할 도커 이미지
    image: 'mariadb'
    environment:
      - MYSQL_ROOT_PASSWORD=project
      - MYSQL_DATABASE=project_db
      - MYSQL_USER=project
      - MYSQL_PASSWORD=project

# 엘라스틱 서치 컨테이너 연동이 안되는 문제로 DB와 django만 실행할 수 있도록 주석 처리해놓았다.
  # elasticsearch:
  #   image: docker.elastic.co/elasticsearch/elasticsearch:7.10.2
  #   ports:
  #     - '9200:9200'
  #     - '9300:9300'
  #   expose:
  #     - '8000'
  #   environment:
  #     - 'ES_JAVA_OPTS=-Xms512m -Xmx512m'
  #     - discovery.type=single-node

  # 앱 컨테이너 이름 정의
  backend:
  	# 데이터베이스 서비스가 실행된 후 장고 서버를 실행하도록 설정
    depends_on:
      - database
      - elasticsearch
    # Dockerfile이 있는 위치
    build: .
    ports:
      - '8000:8000'
    environment:
      - DJANGO_DB_HOST=database
      - DJANGO_DEBUG=True
    command: python manage.py runserver 0:8000
```

1. `docker-compose build` 명령어로 빌드를 진행
2. `docker-compose up` 명령어로 실행

정상적으로 서버가 실행된다. 또한 위의 도커 파일에서는 `--link` 라는 옵션을 줘서 각 컨테이너를 연결시켜주었는데 해당 `docker-compose.yml` 을 보면 옵션이 빠져있다.

**그 이유는 docker-compose에서는 별도의 네트워크 옵션을 설정해주지 않으면 기본적으로 동일한 네트워크에 서로 연결되어 있기 때문이다.**



## 방법2. 엘라스틱서치까지 추가

우선 무작정 찍듯이 하지말고, 원인을 파악하자고 생각했다. 안되는 이유를 알기 위해서 고심해보다가 기존에 호스트 PC에서는 정상적으로 서비스 실행이 된다는 것을 생각하고 **로컬 호스트에서 엘라스틱 서버가 어떻게 작동하는지 먼저 파악**하기로 했다. **즉, 로컬 환경에서 작동방식을 보고 테스트했다는 얘기**

우선 우리 프로젝트는 엘라스틱 서치 서버와 장고서버가 같이 움직인다는 점에서 연관된 기능들은 하나의 컨테이너에 담자는 생각을 했다. (항상 엘라스틱 서치를 먼저 실행하고 장고 서버를 실행한다는 점에서) 그리고 엘라스틱 서치 공식이미지를 사용하였을 때 장고 프로젝트에 필요한 모듈과 패키지들은 아래의 내용과 같다. 또한 `RUN` 명령어를 사용할 경우 도커 이미지에서는 특정 레이어를 생성한다고 한다. 이 레이어는 한번 정의하고 빌드했을 때 그 상태를 고정/유지하며, 여러 개의 RUN 명령어를 남발할 경우 레이어가 여러개가 된다는 사실이다. 그래서 최대한 효율적으로 빌드하기 위해 하나의 `RUN` 명령어 안에서 빌드해 주었다.

[Dockerfile] 수정

```dockerfile
FROM elasticsearch:7.10.1

WORKDIR /usr/src/app
COPY requirements.txt /usr/src/app

RUN yum install -y gcc openssl-devel bzip2-devel libffi-devel wget make && \
    wget https://www.python.org/ftp/python/3.8.5/Python-3.8.5.tgz && \
    tar xzf Python-3.8.5.tgz && \
    Python-3.8.5/configure --enable-optimizations && \
    make altinstall Python-3.8.5 && \
    ln -s /usr/local/bin/python3.8 /bin/python3.8 && \
    yum install -y python3-devel mysql-devel && \
    pip3.8 install --upgrade pip && \
    pip3.8 install -r requirements.txt && \
    wget https://raw.githubusercontent.com/q3aql/ffmpeg-install/master/ffmpeg-install && \
    chmod a+x ffmpeg-install && \
    ./ffmpeg-install --install release

COPY . /usr/src/app
CMD ["python3.8", "manage.py", "runserver", "0:8000"]

```

또한 여러 개의 특정 작업 처리를 위해 RUN 명령어 대신 하나의 쉘 스크립를 만들어 모두 처리하도록 하였다. sleep 시간은 각각의 명령어 처리를 위해 기다릴 수 있도록 하기 위함이다.

또한 `/usr/local/bin/docker-entrypoint.sh &` 이 명령어는 엘라스틱 서치를 데몬(daemon)으로 돌리기 위함이며 포그라운드로 도는 서버는 장고 서버이다.

[server_start.sh] 생성

```shell
#!/bin/bash -x

sleep 15

python3.8 manage.py migrate

/usr/local/bin/docker-entrypoint.sh &

sleep 25

python3.8 manage.py search_index -f --rebuild

sleep 5

python3.8 manage.py runserver 0:8000
```

처음에는 DB, 엘라스틱 서치, 백엔드(장고)로 나누어 총 3개의 컨테이너를 컴포즈 파일에 정의했었다. 하지만 동일한 네트워크에 (컴포즈에 묶는 컨테이너 파일들을 기본적으로 동일한 네트워크에 묶이게 된다.) 컨테이너가 있고 서로 통신이 되는 것을 확인해봐도 엘라스틱 서치가 작동을 하지 않았다. 나중에야 알게 된 사실이지만 컴포즈 파일을 실행(up) 한 뒤 `exec service명칭` 명령하면 되는 것 같았지만, 나는 `docker-compose up` 명령어를 쳤을 때 내부적으로 설정해 줘야하는 빌드도 자동화하고 싶어 이렇게 설계하게 되었다. 아래에 있는 컴포즈 파일은 MariaDB 공식 이미지를 사용해 환경변수를 추가하고 DB가 실행되었을 때 아래 `backend` 서비스가 실행하는 형식으로 구성했다.

[docker-compose.yml]

```dockerfile
version: '3'
services:
  # DB 컨테이너 이름 정의
  database:
    # db 서비스에서 사용할 도커 이미지
    image: 'mariadb'
    environment:
      - MYSQL_ROOT_PASSWORD=project
      - MYSQL_DATABASE=project_db
      - MYSQL_USER=project
      - MYSQL_PASSWORD=project

  # 앱 컨테이너 이름 정의
  backend:
    depends_on:
      - database
    # Dockerfile이 있는 위치
    build: .
    ports:
      - '8000:8000'
    environment:
      - DJANGO_DB_HOST=database
      - DJANGO_DEBUG=True
      - 'ES_JAVA_OPTS=-Xms512m -Xmx512m'
      - discovery.type=single-node
    command: ./server_start.sh


```

이렇게 모두 작성하고 `docker-compose.yml` 파일이 있는 곳에서 `docker-compose up` 명령어를 치면 정상적으로 도커로 만든 장고 프로젝트가 실행되는 것을 확인해 볼 수 있었다.

# Reference

[https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#\_set_vm_max_map_count_to_at_least_262144](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html#_set_vm_max_map_count_to_at_least_262144)

[https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html](https://www.elastic.co/guide/en/elasticsearch/reference/current/vm-max-map-count.html)

[https://msyu1207.tistory.com/entry/Elasticsearch-%EC%84%A4%EC%B9%98-%EB%B0%8F-%EC%99%B8%EB%B6%80-%ED%97%88%EC%9A%A9](https://msyu1207.tistory.com/entry/Elasticsearch-%EC%84%A4%EC%B9%98-%EB%B0%8F-%EC%99%B8%EB%B6%80-%ED%97%88%EC%9A%A9)

[https://okayjava.tistory.com/30](https://okayjava.tistory.com/30)

[https://mentha2.tistory.com/177](https://mentha2.tistory.com/177)

[https://medium.com/@ian.nam.kr/elasticsearch-%EC%84%A4%EC%B9%98-973fb438f2](https://medium.com/@ian.nam.kr/elasticsearch-%EC%84%A4%EC%B9%98-973fb438f2)

[https://jhnyang.tistory.com/268](https://jhnyang.tistory.com/268)

[https://www.youtube.com/watch?v=xFcJPwVPc1o&t=1449s](https://www.youtube.com/watch?v=xFcJPwVPc1o&t=1449s)
