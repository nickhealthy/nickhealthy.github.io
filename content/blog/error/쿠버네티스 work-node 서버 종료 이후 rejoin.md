---
title: '쿠버네티스 work-node 서버 종료 이후 rejoin'
date: 2021-10-05 17:40:13
category: '🤔 error'
draft: false
---

## 문제발생

- 클라우드 서버를 이용해서 쿠버네티스를 구축했는데, 클라우드 서비스의 이용 가격 때문에 워커노드를 종료시켰습니다. 하지만 워커노드를 재시작하였을 때, 컨트롤 플래인(마스터 노드)랑 연결이 안되는 문제가 있었습니다. **<u>이를 해결한 방법을 잊지 않기 위해 적어봅니다.</u>**

![1  masterNode 확인](https://user-images.githubusercontent.com/66216102/135989726-b02faeca-519f-4dc5-83bd-04fe0708b10f.JPG)

## 해결방안

### 마스터노드에서 진행

1. 현재 조인되어 있는 워커노드들을 삭제

```bash
$ kubectl delete nodes [워커노드 이름]
```

2. 현재 조인이 가능한 토큰 확인

```bash
$ kubeadm token list
```

3. 토큰 생성

```bash
$ kubeadm token create
```

4. 토큰 값을 해쉬 값으로 변경
   - [쿠버네티스 공식 홈페이지 참조](https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-join/)

```bash
$ openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'
```

![2  토큰생성](https://user-images.githubusercontent.com/66216102/135989733-a01de6d2-27bf-4d13-a909-413a885b9ffb.JPG)

### 워커노드에서 진행

1. 기존에 연결된 클러스터를 리셋

```bash
$ kubeadm reset
# "y" 입력
```

![3  쿠버네티스 리셋](https://user-images.githubusercontent.com/66216102/135989735-1bef8c4a-b7b4-454b-8e44-8efd90ed124e.JPG)

2. 리셋 후 메뉴얼에 따라 환경설정 파일도 모두 삭제

```bash
$ rm -rf $HOME/.kube/
```

![3-1  쿠버네티스 리셋](https://user-images.githubusercontent.com/66216102/135989736-d967a30f-19a3-4426-9879-cd4654aba519.JPG)

3. `free` 명령어로 swap 메모리 사용중인지 확인 및 swap 사용 중지

```bash
# swap 메모리 확인
$ free
# swap 메모리 중지
$ swapoff -a
```

4. `kubeadm` 명령어로 쿠버네티스 클러스터 조인하기
   - kubeadm join --discovery-token [토큰명] --discovery-token-ca-cert-hash sha256:[해쉬값 ][마스터 노드ip주소:포트번호]
   - IP주소를 확인하는 방법은 `ifconfig` 명령어로 _eth0_ 네트워크 카드 주소를 확인하면 됨
   - 6443 포트 : Kubernetes API Server / Used By All - 마스터노드에서 필수적으로 사용해야 하는 포트번호

```bash
kubeadm join --discovery-token m5j2gy.cjmczii6g5ivsu77 --discovery-token-ca-cert-hash sha256:cafed3e44fafa2b149dd00dbef6752ce3bb2c422be91e4478d04ac59e9c38db8 172.27.0.126:6443
```

5. 검증 - 워커노드가 정상적으로 연결됨

![4  확인](https://user-images.githubusercontent.com/66216102/135989740-83533031-89dc-46b0-abf2-8512655beae0.JPG)

## 번외 - reference

> [블로그 글](https://medium.com/finda-tech/overview-8d169b2a54ff)
>
> 쿠버네티스가 사용하는 포트번호를 검색하다가 상세하게 설명한 좋은 블로그 글이 있어서 참조함

#### 마스터 노드에서는 6443, 2379~2380, 10250, 10251, 10252 포트가 사용되고 있지 않아야 한다.

- [마스터 노드에서 필요한 필수 포트](https://www.notion.so/1076e23a862f4fd79d69d51f23644ac3)
- 6443 포트 : Kubernetes API Server / Used By All
- 2379~2380 포트 : etcd server client API / Used By kube-apiserver, etcd
- 10250 포트 : Kubelet API / Used By Self, Control plane
- 10251 포트 : kube-scheduler / Used By Self
- 10252 포트 : kube-controller-manager / Used By Self

#### 워커 노드에서는 10250, 30000~32767 포트가 사용되고 있지 않아야 한다.

- [워커 노드에서 필요한 필수 포트](https://www.notion.so/6fc66804433d494187d8bce9b041b63c)
- 10250 포트 : Kubelet API / Used By Self, Control plane
- 30000~32767 포트 : NodePort Services / Used By All

#### 스왑 메모리 비활성화

- 서버를 끄지 않고 계속 사용한다면 `swapoff -a`의 명령어도 충분하지만, 매번 껐다 켜야 할 경우 아래의 명령어를 추천
- _/etc/fstab_ 파일은 해당 서버가 사용하는 스토리지에 대한 정보를 작성하는 곳으로 **<u>루트 파티션의 정보가 들어있는 정보를 주석으로 처리할 시 서버가 먹통이 될 수 있으므로 매우 조심</u>**
- 아래의 명령어는 1번째 줄의 명령어 앞에 #(주석)를 붙이는 명령어임

```bash
$ sed -i '1s/^/#/' /etc/fstab
```
