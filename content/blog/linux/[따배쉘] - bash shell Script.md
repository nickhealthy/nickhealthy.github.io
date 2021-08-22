---
title: '[따배쉘] - bash shell Script'
date: 2021-08-22 17:30:50
category: 🖥️ linux
thumbnail: { thumbnailSrc }
draft: false
---

## Shell Script 란 ?

- **<u>리눅스 command들을 모아 놓은 아스키 텍스트 파일</u>**
- **<u>실행 퍼미션을 할당해야 실행 가능</u>**
- Bash shell script에서 특별히 의미가 정해진 기능
  - `#` - comment(주석)
  - `#!/bin/bash` - 셔뱅, 해시뱅 등 스크립트를 실행할 **<u>sub shell 이름</u>**
- Shell 구문은 기본 top-down 방식으로 해석해서 실행됨

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

알고가기!

sub shell은 또 다른 하나의 shell 스크립트의 한 종류를 의미합니다. 예를 들어 현재 보고 있는 프롬프트 창에서 `/bin/bash` 명령어를 입력하였을 때, 바이너리로 이루어진 bash shell 프로그램이 하나 더 열리게 됩니다. 이것은 기존에 사용하는 것과 다른 쉘입니다. 쉘 안에 쉘이 있다고 하여 sub shell 이라고 부릅니다. 즉, 쉘 스크립트를 작성할 때 `#!/bin/bash` 구문을 적는 이유는 스크립트를 실행할 sub shell를 지정하는 것입니다.

</div>
</div>

## 조금 더 자세히 알아보기

- `PATH` 환경변수에 현재위치 등록하기
  - 현재 위치에 있는 폴더는 이제 해당 리눅스 어디에서 실행해도 실행이 이루어집니다.

![1  path 등록](https://user-images.githubusercontent.com/66216102/130347860-51091337-e209-44cb-bec0-b0ca7dad36f9.JPG)

- [sample.sh] 등록
  - 아래와 같이 comment를 이용해 설명해주는 것이 좋다.

![2  샘플쉘 입력](https://user-images.githubusercontent.com/66216102/130347862-10ae9637-6a79-4898-b443-06d362335c7c.JPG)
