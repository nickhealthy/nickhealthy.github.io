---
title: 'Ubuntu 기본 미러 사이트 변경'
date: 2021-01-30 20:48:50
category: 🖥️ linux
thumbnail: { thumbnailSrc }
draft: false
---

기존에 기본적으로 설정되어 있던 미러사이트 `kr.archive.ubuntu.com`는 너무 느려서 카카오 미러 사이트로 변경하였다.

`/etc/apt/sources.list`에 기본 미러 사이트 주소가 설정되어 있고, 이를 변경하면 된다.

1. sources.list 파일 수정

```bash
$ sudo vi /etc/apt/sources.list
```

2. 파일 내에 있는 모든 저장소 주소를 `mirror.kakao.com`으로 변경

```bash
:%s/kr.archive.ubuntu.com/mirror.kakao.com
```

> 명령어 모드 `:` 로 진행
>
> `%s/(변경할 대상)/(변경할 값)` 명령어를 사용하면 된다.

다 됐으면 apt-get update를 통해 이를 적용한다.
