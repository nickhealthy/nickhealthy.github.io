---
title: 'Kubernetes 기본 명령어'
date: 2021-02-08 18:30:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

대부분의 Kubernetes 작업에 **kubectl 명령**을 사용합니다.

|                                                    명령어                                                    |                                                 설명                                                  |
| :----------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------: |
|      kubectl get node<br />kubectl get pod<br />kubectl get svc<br />kubectl get namespaces (기본 4개)       |                   노드 조회<br />파드 조회<br />서비스 조회<br />네임스페이스 조회                    |
|    kubectl describe nodes \| grep -i Taint<br />kubectl taint nodes --all node-role.kubernetes.io/master-    |                       Taint가 설정된 노드 확인<br />모든 노드에서 taint를 허용                        |
|                                            kubectl api-resources                                             |                                        사용 가능한 리소스 확인                                        |
|                                        kubectl create -f 'name'.yaml                                         |                              생성 된 YAML 파일을 사용하여 새 포드를 생성                              |
|                                       kubectl describe pod 'pod-name'                                        |                                      파드 이름으로 상세정보 조회                                      |
| kubectl delete pod 'pod-name'<br />kubectl delete svc 'service-name'<br />kubectl delete deploy 'deployment' |                           파드 삭제<br />서비스 삭제<br />디플로이먼트 삭제                           |
|                                           kubectl get pod -o wide                                            |                   -o wide 옵션을 사용하여 포드에 할당 된 **내부 IP도 확인**합니다.                    |
|                                      kubectl get 'obj' --all-namespaces                                      | --all-namespaces 옵션을 사용하면 해당하는 모든 오브젝트들이 어느 네임스페이스 안에 있는지 나타내준다. |

> 기본적으로 마스터 노드는 보안상의 이유로 일반 컨테이너 배포를 허용하지 않습니다. `taint`를 허용하는 컨테이너만이 노드에서 예약됩니다.

### 단축키

- ReplicaSet : `rs`
- Pod : `po`
- Service : `svc`
- deployment : `deploy`
- endpoint : `ep`
