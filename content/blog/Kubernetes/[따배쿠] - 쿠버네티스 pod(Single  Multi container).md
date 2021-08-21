---
title: '[따배쿠] - 쿠버네티스 pod(Single / Multi container)'
date: 2021-08-22 00:20:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

쿠버네티스 파드에 대해 알아보고, 싱글-멀티 컨테이너 파드 차이점에 대해 알아봅시다.

## Pod 개념 및 사용하기

### Pod 란?

- 컨테이너를 표현하는 <u>**K8S API의 최소 단위**</u>
  - Pod에는 하나 또는 여러 개의 컨테이너가 포함될 수 있음
- 파드를 생성한는 방법은 2가지 - **<u>CLI 또는 정의된 yaml 파일을 통해서 실행이 가능</u>**
  - 도커로 생각해봤을 때, CLI, Dockerfile로 생각하면 간편합니다.

## 싱글 컨테이너 파드

- CLI 명령어로 nginx 파드 생성하기
  - CLI 명령어는 즉시 실행

```bash
$ kubectl run web1 --image=nginx:1.14 --port=80
```

- [nginx.yaml] 파일 생성

```yaml
$ cat > web2.yaml

apiVersion: v1
kind: Pod
metadata:
  name: web2
spec:
  containers:
  - image: nginx:1.14
    name: web2
    ports:
    - containerPort: 80
      protocol: TCP

```

- [nginx.yaml] 파일을 통해 파드 생성

```bash
$ kubectl create -f web2.yaml
```

- CLI 명령어로 만들어진 web1 파드의 정보를 yaml 형태로 확인하기

```bash
$ kubectl get pods web1 -o yaml
# 필요한 정보만 찾고 싶을 땐, grep -i 명령어가 유용
$ kubectl get pods web1 -o | grep -i podip
```

## 멀티 컨테이너 파드

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

멀티 컨테이너 파드 사용방식

서로 **<u>유기적인 컨테이너 또는 결합도가 강한 애플리케이션 환경</u>**이라면 Multiple-Pod의 형태로 구성합니다.

</div>
</div>

- Multi-Container Pod 생성하기

```yaml
$ cat > multi_pod.yaml

apiVersion: v1
kind: Pod
metadata:
  name: multipod
spec:
  containers:
  - image: nginx:1.14
    name: nginx-container
    ports:
    - containerPort: 80
  - image: centos:7
    name: centos-container
    command:
    - sleep
    - "10000"
```

- 위에서 만들었던 싱글 파드와 멀티 파드의 차이점 확인
  - 멀티 파드는 여러 개의 컨테이너를 담고 있지만, **<u>동일한 pod이름, IP를 사용합니다.</u>**

![1  멀티 컨테이너](https://user-images.githubusercontent.com/66216102/130325713-094798c7-d90b-4895-a1ac-0019671504f1.JPG)

- `describe` 명령어를 통해 조금 더 자세히 확인해보기
  - Containers 안에 2개의 컨테이너가 있는 것을 확인할 수 있습니다.

![2  자세히 확인](https://user-images.githubusercontent.com/66216102/130325715-cf47c16a-9656-4e43-92d3-c4adfb05032e.JPG)

- `exec` 명령어를 통해 2개의 컨테이너 중 nginx 컨테이너 접속
  - `-c` 옵션은 container를 의미

```bash
$ kubectl exec multipod -c nginx-container -it -- bash
```

- `curl` 명령어로 동작확인
  - 사진은 없지만, nginx 기본 화면이 출력 됨

```bash
$ curl 10.36.0.2
```

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

알고가기

멀티 파드인 `multipod`는 nginx, centos 2개의 컨테이너를 가지고 있는데, centos 컨테이너 안에서도 동일하게 `curl 10.36.0.2:80` 명령어가 동일하게 수행됩니다. 그 이유는 **<u>하나의 파드 안에서 동일한 네트워크를 사용</u>**하고 있기 때문입니다.

</div>
</div>

- `logs` 명령어를 이용해 해당 컨테이너 로그 확인
  - 싱글 파드는 `-c` 옵션이 불필요함

```bash
$ kubectl logs multipod -c ngunx-container
```

![3  multi-logs 확인](https://user-images.githubusercontent.com/66216102/130325716-0d51d4de-08e8-43b1-9fcc-c84d157aca9b.JPG)
