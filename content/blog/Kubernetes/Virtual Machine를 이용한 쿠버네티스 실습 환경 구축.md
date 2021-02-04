---
title: 'Virtual Machine를 이용한 쿠버네티스 실습 환경 구축'
date: 2021-01-30 23:55:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

## 설치과정

![1](https://user-images.githubusercontent.com/66216102/106359524-ba5e1f80-6356-11eb-9390-1c51569b858e.PNG)

- **Control plane VM: 쿠버네티스 클러스터를 관리하는 관리자**
  - 마스터 노드가 이 역할을 가진다.

![2](https://user-images.githubusercontent.com/66216102/106359526-bb8f4c80-6356-11eb-86b1-0dfa5b95a733.PNG)

## 스왑 메모리 비활성화

```bash
$ sudo swapoff -a


$ vi /etc/fstab 에서 swap.img 관련된 명령어 주석 처리
```

## iptables가 브리지 된 트래픽을 보게하기

### br_netfilter 활성화

> Make sure that the `br_netfilter` module is loaded. This can be done by running `lsmod | grep br_netfilter`. To load it explicitly call `sudo modprobe br_netfilter`.

```bash
$ sudo modprobe br_netfilter
```

### bridged traffic 활성화

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sudo sysctl --system
```

## docker 설치 및 부팅 시 docker-engine 자동 실행 설정

### SET UP THE REPOSITORY

1. 도커 설치

```bash
$ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
```

2. Docker’s official GPG key 등록

```bash
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

$ sudo apt-key fingerprint 0EBFCD88
```

3. stable repository 등록

```bash
$ sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
```

### INSTALL DOCKER ENGINE

1. 도커 엔진 설치

```bash
$ sudo apt-get update
$ sudo apt-get install docker-ce docker-ce-cli containerd.io
```

2. 부팅 시 docker-engine 자동 실행

```
$ sudo systemctl enable docker
```

## 고정 IP 설정

1. 아이피 설정 창으로 이동

```bash
$ vi /etc/netplan/00-installer-config.yaml
```

2. IP를 고정으로 설정

```bash
network:
  ethernets:
    enp0s3:
      addresses: [192.168.219.144/24]
      gateway4: 192.168.219.1
      nameservers:
        addresses: [8.8.8.8, 168.126.63.1]
  version: 2
```

> `enp0s3`은 사용자마다 다를 수 있으므로 `ifconfig` or `ip addr` 명렁어로 확인

## 쿠버네티스 설치

1. 쿠버네티스 공식 홈페이지에 있는 명령어

```bash
$ sudo apt-get update && sudo apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.list
deb https://apt.kubernetes.io/ kubernetes-xenial main
EOF
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

> 위 명령어를 한줄씩 입력해도 되지만 한번에 실행되기 위해서 스크립트 형식으로 바꾼 내용은 아래에 있다.

2. 위의 명령어를 `cat` 명령어로 하나의 쉘 스크립트 안에 덮어쓰기

```bash
$ cat > install_kubernetes.sh

sudo apt-get update && sudo apt-get install -y apt-transport-https curlcurl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -cat <<EOF | sudo tee /etc/apt/sources.list.d/kubernetes.listdeb https://apt.kubernetes.io/ kubernetes-xenial mainEOFsudo apt-get updatesudo apt-get install -y kubelet kubeadm kubectlsudo apt-mark hold kubelet kubeadm kubectl
```

3. `chmod` 명령어로 파일에 대한 실행 권한을 준 뒤 실행

```bash
$ chmod +x ./install_kubernetes.sh

$ sudo ./install_kubernetes.sh
```

## 워커 노드 설정

1. VM에 있는 Clone 기능을 이용해 마스터 노드와 동일한 환경상태를 갖는다.

2. 워커 노드의 호스트 명과 네트워크도 동일하기 때문에 이를 바꾸어 주어야 한다.

```bash
$ sudo vi /etc/hostname
# 접속 후 원하는 호스트명 입력
```

```bash
$ sudo vi /etc/netplan/00-installer-config.yaml
# 네트워크 ip 주소 변경
```

> 이때, **포트포워딩도 따로 설정해 주어야 함**

```bash
$ sudo reboot
```

## 클러스터 생성

**하나의 쿠버네티스를 제어하는 영역을 만드는 과정**

- Control plane VM에 해당함
  - **쿠버네티스 클러스터를 관리하는 관리자**

```bash
sudo kubeadm init --apiserver-advertise-address="10.0.2.4" --apiserver-cert-extra-sans="10.0.2.4" --node-name "master" --pod-network-cidr=172.16.0.0/16
```

- `--apiserver-advertise-address`의 IP는 VM IP입니다.

- `--apiserver-cert-extra-sans`의 IP는 VM IP입니다.

- `--pod-network-cidr`는 쿠버네티스에 설치될 컨테이너 IP대역입니다. 조금 있다 설치할 CNI 네트워크 대역을 피하기 위해 172.16.0.0/16로 설정합니다. 만약 192.168.0.x대역으로 하면 CNI와 충돌나서 다시 클러스터를 생성해야 합니다.

설치 이후 커맨드 창에 이러한 명령어를 실행하라고 나온다. 그대로 명령어를 실행해 주면 된다.

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

- `.kube` 디렉토리와 `config` 파일을 홈 디렉토리에 생성
  - 클러스터에 들어가기 위한 인증정보들
  - **config 파일이 있거나 토큰 값을 이용해 클러스터에 접속이 가능하다.**

## 클러스터에 워커 노드를 추가

1. 마스터 노드에 클러스터를 생성한 이후에 나오는 **토큰 값** 그대로 입력 및 적용

```bash
$ sudo 토큰 값
```

2. 마스터 노드에서 확인이 가능
   - 클러스터에 워커 노드를 추가

```bash
$ kubectl get nodes
```

> 하지만 아직 STATUS는 NOT READY 상태로 나온다. 이는 서로 통신이 안되는 상태이다.
>
> 이럴 때 **CNI**를 설치해주어야 한다.

## CNI 설치(CALICO)

1. 공식 홈페이지의 명령어 입력 및 yaml 파일을 통한 설치

```bash
$ curl https://docs.projectcalico.org/manifests/calico.yaml -O
$ kubectl apply -f callico.yaml
```

2. 다음의 명령어를 통해 `callico` 파드가 실행중인 것을 확인
   - 시간이 조금 소모되며, RUNNING 상태로 변경되면 완료된 것이다.

```bash
$ kubectl get pod -n kube-system
```

3. 아래의 명령어로 STATUS 상태가 READY로 바뀐 것을 확인

```BASH
$ kubectl get no
```

> no 는 노드를 뜻함.

이렇게해서 쿠버네티스가 모두 설치 완료되었다.

## 별첨 - contrlplane VM에서 조인 명령어를 생성할 수 있다.

```bash
$ sudo kubeadm token create --print-join-command
```

## Reference

[https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

[https://docs.docker.com/engine/install/ubuntu/](https://docs.docker.com/engine/install/ubuntu/)

[https://docs.projectcalico.org/getting-started/kubernetes/self-managed-onprem/onpremises](https://docs.projectcalico.org/getting-started/kubernetes/self-managed-onprem/onpremises)

[https://blog.naver.com/kgg1959/222170803683](https://blog.naver.com/kgg1959/222170803683)

[https://www.youtube.com/watch?v=2-ebS1NuTW8&t=46s](https://www.youtube.com/watch?v=2-ebS1NuTW8&t=46s)
