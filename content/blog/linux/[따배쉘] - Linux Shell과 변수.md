---
title: '[따배쉘] - Linux Shell과 변수'
date: 2021-07-21 09:25:50
category: 🖥️ linux
thumbnail: { thumbnailSrc }
draft: false
---

리눅스를 능숙하게 다루기 위해서 쉘 스크립트를 배워봅시다.  
쉘의 의미, 쉘 변수, 환경변수를 알아봅시다!

## Shell의 역할

- 사용자 명령어 해석기
- 사용자가 프롬프트에 입력한 <u>**명령을 해석해서 운영체제에 전달하는 역할**</u>

## Shell의 종류와 역사

- 현재 **<u>bash Shell을 표준</u>**으로 사용하고 있습니다.

![1  쉘의 종류](https://user-images.githubusercontent.com/66216102/126410404-b9d4097d-fe76-43ea-8ebf-7947e063c54f.png)

## 기본 Shell 구성하기

- 현재 사용할 수 있는 쉘을 확인하는 명령어
  - _/etc_ 폴더는 리눅스의 **<u>시스템 설정에 관련된 각종 파일들이 저장되는 곳</u>**

```bash
$ cat /etc/shells
```

- 현재 사용하고 있는 쉘 확인하기

```bash
$ echo $SHELL
```

- `chsh` 명령어를 통해 로그인 되어있는 유저 쉘 변경

```bash
$ sudo chsh [username]
```

- `grep` 필터링을 통한 현재 쉘 확인

```bash
$ sudo grep [username] /etc/passwd
```

![1  현재 쉘 확인](https://user-images.githubusercontent.com/66216102/130335324-312db778-0197-4f6e-bb74-b464d7c93a53.JPG)

## 쉘 변수란 ?

- 데이터를 넣는 그릇
- 다이나믹 타이핑 언어 - 변수에 넣는 <u>**데이터 타입에 따라서 알아서 타입을 지정**</u>

### 변수 사용 방법

- 변수 선언 방법 : [변수명]=[값]

```bash
$ myname=swjoo
```

- 변수 확인 방법 : `echo $`[변수명]

```bash
$ echo $myname
```

- 변수 목록 확인 : `set` 명령어를 통해 확인 가능
  - `set` 명령어는 **<u>환경변수, 일반변수, 함수 모두 표시해 줍니다.</u>**

```bash
$ set | grep myname
```

- 변수 제거 : `unset` [변수명]

```bash
$ unset myname
```

### 쉘 환경 변수

- <u>**동작 되는 프로그램에게 영향을 주는 변수**</u>
- 환경변수 선언 : `export` [변수명]=[값]

```bash
$ export myname=swjoo
```

- 시스템에 적용된 환경변수 확인

```bash
$ env
```

- `env` 명렁어를 입력하면, **<u>`PATH` 항목을 볼 수 있는데 매우 중요</u>**
  - 리눅스에서 사용하는 명령어의 위치를 기억하는 환경변수(윈도우의 환경변수 PATH와 동일)
  - 순서는 앞에 있는 것부터 찾고, `:`를 기준으로 그 이후에 것을 찾음

![2  PATH 환경변수](https://user-images.githubusercontent.com/66216102/130335326-6c63a1af-2d2b-4ca9-81c2-7d78ecc1cfdd.JPG)
