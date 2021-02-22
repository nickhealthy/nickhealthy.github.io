---
title: '[따배쿠] kubectl 명령어 사용하기'
date: 2021-02-22 17:34:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

kubectl 이란?

내가 원하는 걸 요청할 때 사용하는 명령어

기본구조는 `kubectl [command] [TYPE] [NAME] [flags]`

`command`: 자원(object)에 실행할 명령(createm getm delete, edit...)

`TYPE`: 자원의 타입(node, pod, service...)

`NAME`: 자원의 이름(사용자 정의)

`flags`: 부가적으로 설정할 옵션(--help, -o options...)

</div>
</div>

## kubectl

- `kubectl api-resources`: 약어 정보 및 리소스들을 확인해 볼 수 있다.
- `kubectl describe node master.example.com` : 해당하는 노드에 대해 자세한 정보를 확인

### 주요 명령어

<img width="786" alt="캡처" src="https://user-images.githubusercontent.com/66216102/108683288-c5126b80-7534-11eb-9e85-66555d8f3a97.PNG">

### 직접실행 - nginx pod 생성 및 동작 확인

1. nginx 실행

```bash
kubectl run webserver --image=nginx:1.14 --port 80
```

2. 명령어를 입력하면 실행과정을 자세하게 확인할 수 있다.

```bash
kubectl describe pods
```

3. IP주소 실행 중인 node 위치 등등 자세하게 확인할 수 있다.

```bash
kubectl get pods -o wide
```

4. `curl` 명령어로 파드의 IP 주소를 입력하면 nginx 초기 화면을 확인할 수 있다.
5. 좀 더 멋진 화면으로 보기 위해 `elinks` 설치: `sudo apt-get install elinks`
6. `elinks IP주소` : 웹 브라우저에서 보는 화면처럼 표시가 된다.

### 여러 개의 파드를 만들기

1. 위에서 만든 파드를 확인하기 위해 `kubectl get pods webserver`을 입력해본다.
2. `run` 명령어는 하나의 파드만 생성되기 때문에 여러개의 명령어를 사용하기 위해 `create` 명령어를 사용
3. 디플로이먼트 타입으로 httpd 이미지를 3개 실행하는 명령어

```bash
kubectl create deployment mainui --image=httpd --replicas=3
```

4. `kubectl get deployments.apps` : 파드 확인
5. `kubectl describe deployments.apps mainui` : 자세하게 확인

### 다양한 format으로 확인하기

- `kubectl get pod webserver -o yaml` : yaml 형태로 확인

- `kubectl get pod webserver -o json` : json 형태로 확인

### 컨테이너 내부로 들어가서 nginx 화면을 바꾸기

1. 해당 컨테이너의 이름(webserver) 입력 후, 도커와 마찮가지로 컨테이너 내부로 bash창 실행

```bash
kubectl exec webserver -it -- /bin/bash
```

2. `echo "Hello world" > index.html` : index.html 덮어쓰기
3. `exit` 명령어로 컨테이너를 빠져나온 뒤, `curl IP주소`로 바뀐 것을 확인

### 로그 확인하기

1. 해당 컨테이너의 로그 확인

```bash
kubectl logs webserver
```

2. 외부(엔드)유저들이 접근 가능하도록 포트포워딩 설정

```bash
kubectl port-forward webserver 8080:80
```

3. 새로운 터미널 창을 복사한 후, `curl localhost:8080` 으로 접속하면 같은 "Hello world"가 출력되는 것을 확인할 수 있다.

### yaml 파일을 수정해서 상태를 바꾸기

1. `kubectl edit deployments.apps mainui` : spec 탭에서 replicas 숫자를 수정
2. `kubectl get pods` : 파드의 개수 확인

### yaml 파일로 실행 - yaml 파일로 생성

1. yaml 파일로 만들 수 있는지 확인

```bash
kubectl run webserver --image=nginx:1.14 --port 80 --dry-run -o yaml
```

- `--dry-run`으로 옵션을 주면 실행이 가능한지 확인할 수 있다.(Ansible 과 똑같음)

2. yaml 형태로 만들기

```bash
kubectl run webserver --image=nginx:1.14 --port 80 --dry-run -o yaml > webserver.pod.yaml
```
