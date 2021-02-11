---
title: 'Jenkins와 Git 연동 후 Docker Hub에 자동 배포'
date: 2021-02-10 15:03:30
category: '👨‍🍳 jenkins'
thumbnail: { thumbnailSrc }
draft: false
---

# 새로운 작업 생성하기

1. 새로운 작업을 선택합니다.

![1](https://user-images.githubusercontent.com/66216102/107378993-dc625980-6b2f-11eb-972f-616498fdebe5.PNG)

2. 작업의 이름 설정과 Freestyle project로 생성

![2](https://user-images.githubusercontent.com/66216102/107378999-dcfaf000-6b2f-11eb-8dc3-b37dccf96cdd.PNG)

# GitHub project와 연동

1. Jenkins와 연동할 GitHub Project의 URL를 입력해준다.

![3](https://user-images.githubusercontent.com/66216102/107379000-dd938680-6b2f-11eb-8a17-b40cbfe1f279.PNG)

2. 소스 코드를 관리해줄 `Repository URL`를 입력하고 `Credentials`에 사용자 정보를 등록한다.
   - 사용자 정보 등록은 `Add` 버튼을 통해 등록이 가능하다. (아래 사진 참고)
   - 또한 어떤 브랜치를 추적하고 빌드할 것인지 정해준다. (master로 지정)

![4](https://user-images.githubusercontent.com/66216102/107379002-dd938680-6b2f-11eb-82b5-7033841f80b1.PNG)

3. `Add` 버튼을 누르면 `Credentials`를 생성할 수 있는 창이 생성된다. 여기서 GitHub - Username, Password를 지정

![5](https://user-images.githubusercontent.com/66216102/107379008-de2c1d00-6b2f-11eb-8192-1a7c5a947cae.PNG)

# 빌드할 내용을 정의

1. Build 탭에 들어가 `Add build step` 창을 눌러보면 작업을 정의할 수 있습니다.
   - 저는 Repository - master 브랜치에서 커밋이 발생하면 dockerHub에 이미지를 빌드하고 자동 배포가 되도록 설정하기 위해 `Execute shell`을 선택 후 해당 스크립트를 작성하였습니다.

![6](https://user-images.githubusercontent.com/66216102/107599344-8a225500-6c63-11eb-92ae-13d1c0595f26.PNG)

> docker hub에 배포하기 위해선 `docker login`이 필요한데 이때 젠킨스 내부에서는 tty(**Teletypewriter**)를 따로 설정해주는 창이 없는거 같아 한번에 로그인 하기위해 `docker login -u "userID" -p "userPASSWORD"` 를 입력해주었다.

# Jenkins - Build Now로 테스트

### docker.sock: connect: permission denied 에러 날때

1. `var/run/docker.sock` 파일의 권한을 666으로 변경하여 **그룹 내 다른 사용자도 접근 가능하게 변경**
   - `sudo chmod 666 /var/run/docker.sock`
2. 또는 `chown` 으로 group ownership 변경
   - `sudo chown root:docker /var/run/docker.sock`

1) 젠킨스에 빌드한 내용을 정의한 것처럼 등록한 git repository에서 소스코드를 가져오고,
2) 도커 파일 이미지를 빌드한 뒤,
3) Docker Hub에 `push` 중인 상황입니다.

### 도커 파일 이미지 빌드

![7](https://user-images.githubusercontent.com/66216102/107599348-8abaeb80-6c63-11eb-8eb4-faf87a7d494c.PNG)

### Login + Pushing[docker hub]

![8](https://user-images.githubusercontent.com/66216102/107599349-8b538200-6c63-11eb-843c-7ca30690b7ec.PNG)

### SUCCESS

![9](https://user-images.githubusercontent.com/66216102/107599750-ed60b700-6c64-11eb-90d4-54a036e9125a.PNG)

### Docker Hub - Repositories

![10](https://user-images.githubusercontent.com/66216102/107599754-ee91e400-6c64-11eb-843b-24610250ae08.PNG)

빌드가 정상적으로 완료되고, docker hub - repositories에 정상적으로 올라온 모습이 보입니다.

젠킨스를 활용해서 간단한 CI를 구현했지만, 서비스가 점점 커지면서 **파이프라인을 구축해** 좀 더 활용도 높게 개선해야 할 것 같습니다.

다음 포스팅에서는 `github - webhook`을 설정할 예정!

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
