---
title: '[따배쉘] - bash shell의 기능'
date: 2021-08-22 11:47:50
category: 🖥️ linux
thumbnail: { thumbnailSrc }
draft: false
---

bash 쉘의 기능 및 사용법을 조금 더 구체적으로 배워봅시다!

- 리눅스 예약어, 이스케이프 문자, alias, prompt, redirection, pipeline

## Quoting Rule

### Metacharacters

- shell에서 특별한 의미를 정해 놓은 문자들
  - 저는 예약어와 비슷한 의미로 이해했습니다.
  - `\`, `?`, `()`, `$`, `...`, `*`, `%`, `{}`, `[]` 등

### Quoting Rule - 이스케이프 문자

- <u>**메타문자의 의미를 제거하고 단순 문자로 변경**</u>
- Backslash(`\`)
  - `\` 바로 뒤의 메타 문자는 특별한 의미를 제거

![1  이스케이프문자 확인](https://user-images.githubusercontent.com/66216102/130340208-186382c3-7992-4b98-aef3-9c638f40bbf6.JPG)

- Double Quotes(`""`)
  - `" "`내의 모든 메타문자의 의미를 제거. 단 ` $, `` `은 제외

![1-1  이스케이프문자 확인](https://user-images.githubusercontent.com/66216102/130340210-18b67b22-8b08-424b-8c03-66fa68890c3f.JPG)

- Single Quotes(`''`)
  - `''`내의 모든 메타문자의 의미를 제거
  - <u>Double Quotes(`""`) 와의 차이점은 ` $, `` `</u>

## Nesting Commands

- 리눅스 명령어를 함께 사용하고 싶을 때 사용
  - **<u>앞서 언급했던 Single Quotes(`''`) 에서는 적용이 안되고 그대로 텍스트로 출력하는 모습을 확인</u>**

![2  Nesting command](https://user-images.githubusercontent.com/66216102/130340211-50830304-a698-4dc4-b585-2bc2a2ac5c0a.JPG)

- 응용버전
  - 회사에서 로그나, 이슈 상황에서 쉘 스크립트를 통해 지정이 가능

![2-1  Nesting command](https://user-images.githubusercontent.com/66216102/130340212-76167bdf-d2eb-497b-9886-601a1e140dc3.JPG)

## Alias

- <u>**Shell의 명령에 새로운 이름을 부여**</u>
- 명령들을 조합하여 새로운 이름의 명령을 생성

### alias 관리 명령

- alias 등록

```bash
$ alias [이름]=['원하는 명령어']
```

- alias 확인

```bash
$ alias or alias [이름]
```

- alias 삭제

```bash
$ unalias [이름]
```

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

좋은 팁!

리눅스의 `rm` 명령어는 일반적으로 묻지도 따지지도 않고 바로 지워버리는데, 이를 방지하는 기능이 `-i` 옵션입니다. 이를 매번 입력하기 귀찮으니 `alias rm='rm -i'`를 기본값으로 등록해서 사용합시다.

</div>
</div>

## 프롬프트 변경

- `PS1` 변수를 이용해 shell의 기본 프롬프트 모양을 설정
- Bash shell에서만 Prompt 모양에 적용 가능한 특수 문자가 존재

| 특수문자 |           의미           |
| :------: | :----------------------: |
|   `\h`   |       호스트 이름        |
|   `\u`   |       사용자 이름        |
|   `\w`   | 작업 디렉토리 - 절대경로 |
|   `\W`   | 작업 디렉토리 - 상대경로 |
|   `\d`   |        오늘 날짜         |
|   `\t`   |        현재 시간         |
|   `\$`   | \$ 또는 # 프롬프트 모양  |

- 프롬프트 수정
  - `PS1` 변수에 [사용자 이름, 호스트 이름, 상대경로], 프롬프트 모양 표시를 넣었습니다.

![3  prompt 수정](https://user-images.githubusercontent.com/66216102/130340213-d076ac97-fa4b-4609-b77a-6ebf31bd65c0.JPG)

- `.bashrc` 파일에 등록하여 영구적으로 반영하기
  - 현재 로그인 된 화면에서 로그아웃 시, alias 프롬프트 등의 설정이 초기화 되는데 <u>**영구적으로 반영하려면 bash shell의 구성을 담당하는 파일을 수정해야 합니다.**</u>

## Redirection

- <u>**입출력 방향을 바꾸는 것을 의미함**</u>

- 바꾸기 전 기본형

  - stdin은 프로그램에 입력하는 방식
  - stdout, stderr은 프로그램이 화면에 출력하는 방식

- 입출력 방향을 반대로 바꾸는 redirection 기호

  - stdin - `0<` : 입력을 키보드가 아닌 **파일을 통해 받음**

  ```bash
  $ mysql 0< test.sql
  ```

  - stdout - `1>` : 표준 출력을 터미널이 아닌 **파일로 출력**

  ```bash
  $ cat 1> test.txt
  ```

  - stderr - `2>` : 표준 에러 출력을 터미널이 아닌 **파일로 출력**

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

알고가기!

- 리다이렉션에서 0과 1은 생략이 가능합니다.
- 에러메시지를 없애는 방법은 `/dev/null` 경로에 `commands 2> /dev/null` 형태로 넣으면 에러메시지가 보이지 않습니다.
  - `/dev/null` 파일은 안에 어떤 파일이든 지워버리는 소각장 같은 개념

</div>
</div>

## Pipeline

- <u>리눅스의 명령어를 조합하여 사용하거나, 명령의 실행결과를 다음 명령어에 응용할 수 있는 개념</u>
- 기호는 `|`를 사용합니다.
  - 사실 파이프라인은 여러 가지의 의미가 있지만, bash shell에서는 위의 설명과 같은 의미로 해석하시면 됩니다.

### 사용 예시 2가지

1. `wc -l` 명령어를 사용한 예시

- 총 라인의 수를 알아보고 싶을 때 `wc -l` 명령어를 사용하게 되는데, 이것을 파이프라인을 이용해 응용하면 다음과 같은 작업을 할 수 있습니다.

```bash
# 1. ls 명령어로 현재 디렉토리의 파일을 보여줌
# 2. 이전의 ls 명령을 이어받아 wc -l 명령어를 통해 출력되는 라인의 수를 치환해줍니다.
# 결과: 4 - 현재 디렉토리 폴더에 파일이 4개 있는 것을 의미
$ ls | wc -l
```

2. `/etc/passwd` 파일 안에 사용자의 수를 확인하고 싶을 때
   - 아무 옵션을 주지 않았으므로 cat 명령어에 의해 모든 정보를 표시

```bash
$ cat /etc/passwd
```

![1  기본 명령어](https://user-images.githubusercontent.com/66216102/130341128-14f81e22-1a29-4039-929d-e6a9972a5ab2.JPG)

- `cut` 명령어 추가로 사용자만 출력
  - `-d` : split를(구분) 위한 값 명시, 여기서는 `:`로 사용됨, 아무 설정이 없다면 기본값은 TAB
  - `-f` : n번째 필드를 의미

```bash
$ cat /etc/passwd | cut -d: -f 1
```

![2  cut 명령어 추가](https://user-images.githubusercontent.com/66216102/130341126-81ad4eb8-050b-4da6-b1ae-8a20454d9c01.JPG)

- `wc -l` 명령까지 사용해 사용자 개수를 출력

![3  wc-l까지 적용](https://user-images.githubusercontent.com/66216102/130341127-e51be46e-c6aa-4e24-a807-f791cbd7023e.JPG)
