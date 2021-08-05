---
title: '#1 Kubernetes Pod'
date: 2021-08-04 14:00:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

쿠버네티스를 실습할 수 있는 환경을 구성하고,  
전체적인 개념과 구성을 알아보고 실습을 통해 자세히 살펴봅시다.  
<ins style="text-decoration:line-through">사실 공부한지가 너무 오래되서 다시 공부를 시작...</ins>

## 쿠버네티스 기본 개념

### 클러스터

- 마스터노드와 워커노드가 묶여 있는 집합 및 공간

### 네임스페이스

- 클러스터 내에서 독립된 공간을 제공

### 실행 방식

- 많은 컨테이너 플랫폼이 존재하지만 도커를 기본으로 사용하고 있으며, Pod를 실행 시 dockerhub에서 도커 이미지를 받아와 쿠버네티스의 가장 작은 단위 배포인 Pod로 실행 및 운영합니다.

> 당연히 사내 hub를 통해 컨테이너 이미지를 관리할 수 있습니다.

## 도커 & 쿠버네티스 설치 스크립트

- 우분투 18.04 LTS 기준으로 스크립트 작성

> 마스터노드와 워커 노드에 스크립트를 작성하면 됩니다.

- 스크립트 파일 생성

```bash
cat > install.sh
# 아래 내용을 복사
sudo apt-get update
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
swapoff -a && sed -i '/swap/s/^/#/' /etc/fstab
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sudo sysctl --system
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
# Enter 이후, Ctrl + D
```

- 실행 권한 설정

```bash
$ chmod +x install.sh
```

- 스크립트 실행 및 설치완료

```bash
$ sh install.sh
```

## Lab1 - Pod 실습

#### 파드를 생성하고, 도커허브에서 가져온 도커 파일을 통해 컨테이너 통신이 되는지 확인해 봅시다.

- [pods.yaml] 파일 작성
  - 하나의 pod에 2개의 컨테이너 생성
  - 각각의 포트는 _8000, 8080_

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-1
spec:
  containers:
    - name: container1
      image: kubetm/p8000
      ports:
        - containerPort: 8000
    - name: container2
      image: kubetm/p8080
      ports:
        - containerPort: 8080
```

- .yaml 파일로 만들어진 pods 을 실행

```bash
$ kubectl create -f pods.yaml
```

- 생성된 pod 확인

```bash
$ kubectl get pods -o wide
$ kubectl describe pods
```

- `curl` 명령어로 컨테이너 포트 확인
  - 정상적으로 통신이 되며, 포트를 알려주는 컨테이너 생성이 완료되었습니다.

![1  파드 생성 후 테스트](https://user-images.githubusercontent.com/66216102/128293088-d68cb9ed-3424-44dc-bdf3-e8d478cc62d9.JPG)

### Pod 재생성 시 IP가 바뀌는지 TEST

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

알아두면 좋은 것!

Pod 재생성 시 <u>Pod의 IP는 자동으로 바뀝니다.</u>

</div>
</div>

- [replica.yaml] 파일 생성

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: replication-1
spec:
  replicas: 1
  selector:
    app: rc
  template:
    metadata:
      name: pod-1
      labels:
        app: rc
    spec:
      containers:
        - name: container
          image: kubetm/init
```

- 레플리카 컨트롤러 실행

```bash
$ kubectl create -f replica.yaml
```

- Pod를 삭제 후, 레플리카에 의해 다시 생성된 pod의 ip 정보를 확인

```bash
$ kubectl delete pod pod1
```

## Lab2 - Pod_Label

#### 파드 라벨을 통해 Service에 묶인 Pod를 실습하면서 라벨 개념에 대해 알아봅시다.

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

알아두면 좋은 것!

라벨을 사용하는 이유는 <u>**목적에 따라 Object들을 따로 분류하고, 편하게 관리하기 위함입니다.**</u>

</div>
</div>

- [Pods2.yaml] 파일 생성
  - 총 6개의 라벨 생성
  - web, db, server - dev버전, production 버전

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-1(2,3,4,5,6)
  labels:
    type: web(db, server)
    lo: dev(production)
spec:
  containers:
    - name: container
      image: kubetm/init
```

- Pods 생성 및 확인

```bash
$ kubectl create -f pods2.yaml
$ kubectl get pod
```

![2  pods 확인](https://user-images.githubusercontent.com/66216102/128293090-8da13af2-865f-4eab-a2d9-d3d2133417ad.JPG)

- [Service Object yaml] 생성

```yaml
apiVersion: v1
kind: Service
metadata:
  name: svc-1
spec:
  selector:
    type: web
  ports:
    - port: 8080
```

- Service 실행

```bash
$ kubectl create -f  service.yaml
```

- Service 라벨링으로 묶인 Pods들을 조회

```bash
$
```

## Lab3 - Pod_NodeSelector

#### 워커노드를 스케줄러가 정해주는 것 대신 노드라벨을 통해 워커 노드를 직접 지정 후 파드를 배치해 봅시다.

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

들어가기 전에..

워커 노드를 직접 지정하는 것이 아니라면 스케줄러는 각각의 노드들의 자원을 점수로 환산해  
<u>**가장 좋은 점수를 받은 워커 노드에 자원을 자동으로 배치해 줍니다.**</u>

</div>
</div>

- 현재 노드의 라벨들을 확인
  - 기본적으로 설정된 라벨이 있습니다.

```bash
$ kubectl get nodes --show-labels
```

![3  nodeselector 확인](https://user-images.githubusercontent.com/66216102/128293093-91875ef7-de9b-486a-9c3e-ea0491b325a0.JPG)

- yaml 파일에 *slavenod - nodeSelector*의 라벨을 설정

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod-7
spec:
  nodeSelector: kubernetes.io/hostname=slavenod # 이쪽 부분
  containers:
    - name: container
      image: kubetm/init
```

- 검증 - *slavenod*에 생성되는 것을 확인할 수 있습니다.

![4  nodeselector 설정](https://user-images.githubusercontent.com/66216102/128293094-97f80d04-7092-43b0-8a69-fc180a13789c.JPG)
