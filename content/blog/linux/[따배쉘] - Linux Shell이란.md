---
title: '[따배쉘] - Linux Shell이란?'
date: 2021-07-21 09:25:50
category: 🖥️ linux
thumbnail: { thumbnailSrc }
draft: false
---

+ 리눅스를 능숙하게 다루기 위해서 쉘 스크립트를 배워봅시다.

## Shell의 역할

+ 사용자 명령어 해석기
+ 사용자가 프롬프트에 입력한 명령을 해석해서 운영체제에 전달하는 역할

## Shell의 종류와 역사

+ 현재 `bash Shell`을 표준으로 사용하고 있습니다.

![1  쉘의 종류](https://user-images.githubusercontent.com/66216102/126410404-b9d4097d-fe76-43ea-8ebf-7947e063c54f.png)

## 기본 Shell 구성하기

+ 현재 사용할 수 있는 쉘을 확인하는 명령어
  + `/etc` 폴더는 리눅스의 **<u>시스템 설정에 관련된 각종 파일들이 저장되는 곳</u>**

```bash
$ cat /etc/shells
```

+ 현재 사용하고 있는 쉘 확인하기

```bash
$ echo $SHELL
```

+ `chsh` 명령어를 통해 로그인 되어있는 유저 쉘 변경

```bash
$ sudo chsh [username]
```

+ `grep` 필터링을 통한 현재 쉘 확인

```bash
$ sudo grep [username] /etc/passwd
```

<img width="228" alt="2  사용하고 있는 쉘 필터링으로 확인하기" src="https://user-images.githubusercontent.com/66216102/126410408-125114eb-b265-4e5d-a610-d9c93ade8fd6.PNG">
