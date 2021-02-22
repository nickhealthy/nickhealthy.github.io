---
title: '[따배쿠]쿠버네티스 아키텍처 - k8s 동작원리'
date: 2021-02-22 19:38:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

## 쿠버네티스 동작과정(원리)

1. 컨테이너 이미지 저장소에 이미지 push 및 pull
   - 컨테이너 이미지 저장소는 사내망이 될 수도, 도커허브처럼 퍼블릭 공간도 될 수 있다.
2. 개발자나 운영자가`kubectl`의 yaml 형태든, CLI 형태든 명령어를 입력하게 되면,
3. 마스터 노드 즉, control-plane 노드의 `REST API Server`가 명령어를 받아서 명령어에 맞게 요청을 받아준다.
   - etcd의 상태 정보를 확인한다.
4. 이때 어느 노드에 배치하는 것이 가장 좋은지 판단 및 배치 해주는 것이 `Scheduler` 이다. 스케줄러는 REST API Server에게 적절하게 판단해 응답해준다.
5. 그럼 REST API Server는 적절한 node의 `kubelet`에게 요청을 한다.
6. 요청을 받은 kubelet은 해당 명령어를 `docker` 명령어로 변환한다.
7. 도커 데몬은 최종적으로 이미지 저장소에서 컨테이너를 적절히 불러와 실행시켜 준다.
8. 컨트롤러는 지속적으로 감시해 파드 개수를 보장해준다.

## 컴포넌트 종류와 구성

<img width="509" alt="캡처" src="https://user-images.githubusercontent.com/66216102/108697082-b8e2da00-7545-11eb-8d07-41a7c6ed4987.PNG">

- etcd 저장소는 하드웨어의 상태, 이미지 정보 등을 저장하고 관리하고 있다. 이러한 정보를 REST API Server가 kubectl 명령어와 비교하고 확인해 적절한 형태로 만들어준다.

## 애드온

<img width="454" alt="캡처1" src="https://user-images.githubusercontent.com/66216102/108697078-b7b1ad00-7545-11eb-8120-4a3d5208b72b.PNG">

> - 대시보드, 클러스터 로깅 같은 경우에는 기본적으로 설치되어 있지 않다. 따로 설치를 해야함
>
> - 클러스터 로깅 같은 경우, 여러 개의 노드를 관리해야하는 쿠버네티스의 특성상 한곳에 로그에서 관리할 수 있다는 점에서 아주 유용하다.
> - 컨테이너 자원 모니터링(cAdvisor)는 kubelet에 포함되어 있다.

#### 이런 식의 구성을 하게 되면 운영, 서비스, 로깅 등을 한번에 할 수 있게 된다.

## Namespace란 ?

- K8S API 종류 중 하나

- 클러스터 하나를 **여러 개의 논리적인 단위로 나눠서 사용**
- 쿠버네티스 클러스터 하나를 **여러 팀이나 사용자가 함께 공유**
- **용도에 따라 실행해야 하는 앱**을 구분할 때 사용
- 클러스터를 구성하게 되면 기본적으로 4개의 네임스페이스가 존재하고, `default` 네임스페이스를 이용한다.

#### 물리적으로 하나의 클러스터(서버)가 있더라도 네임스페이스를 통해 논리적으로 구분해 줄 수 있다.

### 네임스페이스 만드는 법

- CLI 방식

  - ```bash
    $ kubectl create namespace blue
    $ kubectl get namespaces
    ```

- yam 방식

  - ```bash
    $ kubectl create namespace green --dry-run -o yaml > green-ns.yaml
    $ vim green-ns.yaml
    $ kubectl create -f green-ns.yaml
    ```

## 실습

1. yaml 파일로 만들기

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports:
        - containerPort: 80
        - containerPort: 443
```

2. yaml 파일로 실행 및 확인

```bash
$ kubectl create -f nginx.yaml
$ kubectl get pods -n default
```

> 아무 옵션도 주지 않았으므로 default 네임스페이스에 생성됨

3. blue 네임스페이스 생성

```bash
$ kubectl create namespace blue
```

4. orange 네임스페이스에 yaml 파일로 생성 & 실행

```bash
$ kubectl create namespace orange --dry-run -o yaml > orange-ns.yaml
$ kubectl create -f orange-ns.yaml -n orange
```

> --dry-run 옵션은 실제로 실행하지 않고, 실행여부를 확인

5. blue 네임스페이스에서 실행하기

```bash
$ kubectl create -f nginx.yaml -n blue
```

6. yaml 파일 안에 네임스페이스를 지정해 실행

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
  namespace: orange # 오렌지 네임스페이스에 지정했다.
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports:
        - containerPort: 80
        - containerPort: 443
```

#### CLI, yaml, yaml 파일 안에 정의 등을 통해서 다양하게 실행할 수 있다.

## Base 네임스페이스 변경하기(switch)

하나의 context를 config에 등록하여 default 클러스터를 스위칭할 수 있다.

1. 기존의 config 확인

```bash
$ kubectl config view
```

2. 새로운 context를 추가

```bash
$ kubectl config set-context blue@kubernetes --cluster=kubernetes --user=kubernetes-admin --namespace=blue
```

> blue@kubernetes : 이름
>
> --cluster= 클러스터 이름
>
> --user : 쿠버네티스 유저
>
> --namespace : 지정할 네임스페이스

3. default 네임스페이스에서 blue 네임스페이스를 기본으로 스위칭

```bash
$ kubectl config use-context blue@kubernetes
```

4. 현재 지정된 네임스페이스 확인

```bash
$ kubectl config current-context
```

5. 파드들을 생성할 때 아무 옵션을 주지 않는다면, 이제 blue 네임스페이스에 생성된다.

6. 다시 원래 default 클러스터로 돌리기

```bash
$ kubectl config use-context kubernetes-admin@kubernetes
```

## 네임스페이스 삭제하기

하나의 네임스페이스 안에 여러 리소스가 존재하게 되는데, 네임스페이스를 지우게 된다면 안에 있는 리소스 모두 같이 삭제된다.

```bash
$ kubectl delete namespace blue
```
