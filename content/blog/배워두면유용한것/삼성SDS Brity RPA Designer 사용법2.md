---
title: '삼성SDS Brity RPA Designer 사용법2'
date: 2021-07-01 18:50:30
category: '✔️ 배워두면유용한것'
thumbnail: { thumbnailSrc }
draft: false
---

## 기본 라이브러리

### Net 라이브러리

- 브라우저 실행/종료, 메일 송/수신 등 Web을 제어하는 Activity card의 집합
- `SendMail`
  - smtp 주소와 포트번호 입력
  - 네이버 메일 **<u>환경 설정에서 smtp와 pop 설정을 해줘야 합니다.</u>**
- `RecieveMail`
  - sendmail과 동일
  - pop3 address 설정
- `DownloadMailAttachment`
  - 파일을 로컬 PC로 다운로드 하는 액티비티 카드

> 아이디/비밀번호 입력 후, 봇 인식으로 막힌다면 `SetClipboard` 카드를 이용해 복사/붙여넣기 식으7로 설정해 우회할 수 있다.

### 엑셀라이브러리

![image-20210701131412574](https://user-images.githubusercontent.com/66216102/125651741-614c8fa6-9f16-4e48-880a-65c24a7f6127.png)

- `SetStyleRange` - 지정한 영역에 스타일 서식
- `SetBorderRange` - 엑셀 지정한 영역에 테두리 그리기

### ImageRecognition 라이브러리

- `ImageClick` - `click` 액티비 카드로 영역 지정이 안될시, 드래그 영역 지정을 통한 객체생성으로 이미지 영역을 설정할 수 있음
  - 사용방법: 드래그 후, 빨간 버튼으로 활성화 되면 클릭

> 번외: `click` 카드를 이용해서 **상대 좌표** 설정이 가능
>
> - 영역이 잘 지정되는 것을 선택 후, 원하는 클릭 위치까지 쭉 드래그해서 놓으면 됨

- `ImageTextInput` - 마찮가지로 영역 지정 후, 텍스트 입력할 곳을 지정

### System 라이브러리

![image-20210701153543217](https://user-images.githubusercontent.com/66216102/125651752-86291bd6-94dd-41ba-ab19-990c02b0449d.png)

- `IsFileExist` - 파일이 존재하면 `True`, 아니면 `False` 출력

## Q & A

#### Q. textInput, setText 의 차이점은?

- **<u>textInput은 한글자씩 입력되고, setText는 한꺼번에 들어가는 차이가 있습니다.</u>**
- 속성과 적용가능한 유즈케이스에서 약간의 차이가 있습니다.
  - 예를 들어, 입력값을 체크하는 로직이 들어있는 폼에 값을 넣을 때, setText로 하면 변경인식이 안 되어서 textInput을 써야 하는 경우도 있습니다.
  - 길이가 너무 긴 텍스트는 textinput이 느리니까 setText를 쓰기도 합니다. 쓰시다보면 차차 약간의 차이를 발견하실거예요.

#### Q. 엑셀에 텍스트 입력시 셀넓이를 글자에 맞게끔 조정할 수 있나요?

- `setStyleRange` 카드로 컬럼넓이 등 모양을 조정할 수 있습니다

#### Q. 타사 엑셀 확장자 사용이 가능한가요?

- Excel라이브러리는 MS Excel을 지원하고 타사의 스프레드시트는 아쉽지만 지원하지 않습니다.
