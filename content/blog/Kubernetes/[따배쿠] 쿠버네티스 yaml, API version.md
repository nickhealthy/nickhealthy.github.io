---
title: '[따배쿠]쿠버네티스 yaml, API version'
date: 2021-02-23 20:38:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

## yaml 템플릿

`TOP-DOWN` 방식이 아니고, 통째로 쿠버네티스가 API에 맞게 문법이 잘 되어있는지 확인한다.

- `key : value` 가 하나로 된 형식은 **스칼라 문법**이다.

* `-`를 붙여 여러 개를 만들면 **배열 문법이라고 불린다.**

<img width="348" alt="캡처" src="https://user-images.githubusercontent.com/66216102/108838429-f7949500-7616-11eb-9176-f138dad6fcf9.PNG">

## API version

- CNCF 재단에 의해 alpha, beta, stable 버전 과정을 수많은 컨트리뷰터에 의해 만들어지고, 발표된다.

- 많은 버전들이 있고 `explain` 명령어를 통해 정보를 확인 가능하다.

  - 쿠버네티스 버전 정보에 따라 api version이 다를 수 있으므로 조심

- 리소스의 정보(Documentation) 출력 (버전 정보 확인)

```bash
$ kubectl explain pod[오브젝트명]
```

<img width="433" alt="API version" src="https://user-images.githubusercontent.com/66216102/108838434-f8c5c200-7616-11eb-8416-1850241795cd.PNG">
