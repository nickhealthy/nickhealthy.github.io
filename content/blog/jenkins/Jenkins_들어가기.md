---
title: 'Jenkins 들어가기'
date: 2021-02-09 12:03:30
category: '👨‍🍳 jenkins'
thumbnail: { thumbnailSrc }
draft: false
---

# Jenkins란 ?

> `automation server` 즉 자동화 기능을 제공해주는 서버 프로그램이다.  
> `Why Jenkins?`
>
> - CI/CD와 관련된 수많은 플러그인들을 제공해주기에 CI/CD 서버로 각광 받는다.
> - 오픈소스고 공짜다.
> - 플랫폼 독립적

젠킨스는 소프트웨어 개발 시 지속적 통합(Continuous Integrations, CI)와 지속적 배포(Continuous Delivery, CD)를 위한 대표적인 도구입니다.  
 다수의 개발자들이 하나의 프로그램을 개발할 때 **버전 충돌을 방지하기 위해** 각자 작업한 내용을 공유영역에 있는 저장소에 빈번히 업로드함으로써 지속적 통합이 가능하도록 해줍니다. 젠킨스와 같은 CI툴이 등장하기 전에는 일정시간마다 빌드를 실행하는 방식이 일반적이었습니다. 특히 개발자들의 작성한 소스들의 커밋이 모두 끝난 심야 시간대에 이러한 빌드가 타이머에 의해 집중적으로 진행되었는데, 이를 `nightly-build`라 합니다.  
 하지만, **젠킨스는 정기적인 빌드에서 한발 나아가 서브버전, Git과 같은 버전관리시스템과 연동하여 소스의 커밋을 감지하면 자동적으로 자동화 테스트가 포함된 빌드가 작동되도록 설정할 수 있습니다.**

# 젠킨스가 주는 이점

- 빌드, 테스트, 배포 프로세스를 자동화하여 소프트웨어 품질 향상과 개발 생산성 향상에 도움을 줍니다.
- 개발중인 프로젝트에서 커밋은 매우 빈번하게 일어나기 때문에 커밋 횟수만큼 빌드 하는 것이 아닌 **작업이 큐잉되어 자신이 실행될 차례를 기다리게 됩니다.**
- 프로젝트 표준 컴파일 환경에서의 컴파일 오류 검출
- 자동화 테스트 수행
- 정적 코드 분석에 의한 코딩 규약 준수여부 체크
- 프로파일링 툴을 이용한 소스 변경에 따른 성능 변화 감시
- 결합 테스트 환경에 대한 배포작업

# 젠킨스의 주요 기능

- 형상관리 도구와의 연동
- 소스 코드 체크아웃
- 웹 인터페이스
- 테스트 보고서 생성
- 빌드 및 테스트 자동화
- 실행 결과 통보
- 코드 품질 감시
- 다양한 인증 기반과 결합한 인증 및 권한 관리
- 배포 관리 자동화
- 분산 빌드(마스터 슬레이브)
- 그루비 스크립트를 이용한 자유로운 잡 스케줄링

젠킨스는 개발자가 소스코드를 추가, 수정한 뒤 형상관리 도구에 저장하면 자동으로 읽어 빌드 및 테스트를 실행합니다.

# 젠키스 기능 알아보기

### 1. 프로젝트 만들기

`New_Item` 또는 `새로운 Item` 만들기를 눌러보면 이런 화면을 볼 수 있습니다.

![1](https://user-images.githubusercontent.com/66216102/107602960-a4156500-6c6e-11eb-9e0a-26a4cbf9b74f.PNG)

**Freestyle project**는 Jenkins의 주요 기능이며, 프로젝트를 내가 자동화하고자 하는 행위의 한단위로 보면 됩니다. 이런 프로젝트들을 여러개로 이어 붙여서 거대한 자동화의 흐름을 만들어냅니다.

### 1-1. 프로젝트 설정화면

설명에 프로젝트에 대한 설명이나 소개를 메모하면 됩니다.

소스 코드 관리는 **내가 자동화할 프로젝트의 소스코드를 가져오는 곳이며, GitHub에서 프로젝트를 가져오기 위해 URL 설정, 자격 증명을 추가해야합니다.** (ID/PW 설정 등이 필요합니다.)

![2](https://user-images.githubusercontent.com/66216102/107602963-a5469200-6c6e-11eb-8649-49d20ecaaf95.PNG)

### 빌드 트리거(Build Triggers)

빌드 트리거, 말 그대로 빌드를 누가 촉발 시켜줄 것인가 결정하는 것입니다. 주기적으로 repository에 push가 일어나면 촉발되는 등 여러가지 선택지가 있습니다.

![3](https://user-images.githubusercontent.com/66216102/107602966-a5469200-6c6e-11eb-8695-43d8c3cfa44d.PNG)

> 오른쪽에 있는 `?` 버튼을 눌러보면 설명서를 볼 수 있습니다.

### 빌드 환경(Build Environment) & Build

이 프로젝트가 어떤 tool를 활용해서, 어떤 행동을 하는지 선택하면 됩니다. 각자 프로젝트의 기능에 맞게 설정하면 됩니다.

![4](https://user-images.githubusercontent.com/66216102/107602968-a5df2880-6c6e-11eb-9c78-0c6bebb73f9b.PNG)

### 빌드 후 조치(Post-build Actions)

현재 프로젝트의 정의된 내용대로 build 작업이 끝나면 그 다음 행동은 어떤 것을 할지 정하는 것입니다.

보통 여러 프로젝트끼리 체인처럼 엮고, 선후 관계를 정하는 것을 많이합니다.

그 외에도 다양한 선택지가 있습니다.

![5](https://user-images.githubusercontent.com/66216102/107602969-a5df2880-6c6e-11eb-8bb9-3cb66c441c70.PNG)

멀티캠퍼스에서 실습을 통해 Jenkins가 CI/CD 기능을 해주는 TOOL 정도로만 알고 있었는데, 이번에 이전에 했던 프로젝트를 docker로 배포, Jenkins 설정을 하려고 하다보니 많은 것을 알게 된 것 같습니다. 다음에는 실제로 프로젝트 환경에 맞게 CI/CD 배포를 해봐야겠습니다.

# Reference

[https://ict-nroo.tistory.com/31](https://ict-nroo.tistory.com/31)

[https://jongmin92.github.io/2018/08/09/Tool/jenkins/](https://jongmin92.github.io/2018/08/09/Tool/jenkins/)

[https://gist.github.com/MinSikMoon/86f6b34ead68cf79cfb5fe6275a2647c](https://gist.github.com/MinSikMoon/86f6b34ead68cf79cfb5fe6275a2647c)

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
