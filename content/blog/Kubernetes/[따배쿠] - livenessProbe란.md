---
title: '[따배쿠] - livenessProbe란'
date: 2021-10-06 17:34:30
category: '🧭 Kubernetes'
thumbnail: { thumbnailSrc }
draft: false
---

- livenessProbe의 개념을 익히고, 연습해 봅시다.

* <u>해당 파드가 정상 동작을 하는지 주기적으로 체크하는 기능</u>

### livenessProbe의 매커니즘

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

중요!

여기서 중요한 점은 <u>파드가 아닌 컨테이너 자체가 재시작</u> 되는 것이며, 따라서 IP의 주소 또한 바뀌지 않습니다.

</div>
</div>

- `httpGet` : 지정한 IP 주소, port, path에 HTTP GET 요청을 보내, 해당 컨테이너가 응답하는지를 확인합니다.
  - 반환코드가 **200이 아닌 값이 나오면 오류. 컨테이너를 다시 시작합니다.**
  - default: 요청의 오류가 연속으로 3번 이상 발생한다면, 컨테이너 자체를 다시 `restart` 시켜주는 것입니다.
- `tcpSocket` : 지정된 포트에 TCP 연결을 시도합니다.
  - **연결되지 않으면 컨테이너를 다시 시작합니다.**
  - default: 요청의 오류가 연속으로 3번이상 발생한다면, 컨테이너 자체를 다시 `restart` 시켜주는 것입니다.
- `exec` : exec 명령을 전달하고 명령의 종료코드가 **0이 아니면 컨테이너를 다시 시작합니다.**

## LAB 1 - livenessProbe 사용하기

- _pod-nginx-liveness.yaml_ 파일 생성

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod-liveness
spec:
  containers:
    - name: nginx-container
      image: nginx:1.14
      ports:
        - containerPort: 80
          protocol: TCP
      livenessProbe:
        httpGet:
          path: /
          port: 80
```

- pod 생성 및 상세정보 출력
  - yaml 파일에 설정한 값 이외에 자동 생성된 default 값을 확인(아래의 사진에 보이는 토대로 작성함)
    - `delay` : pod 구동 후 0초 후 상태 체크를 실행하는 것을 의미함
    - `timeout` : health-check 한 후 응답을 기다리는 1초 동안 반응하지 않으면 실패로 간주
    - `period` : 10초마다 한번씩 상태 체크
    - `success` : 1번만 성공하면 성공으로 간주
    - `failure` : 연속에서 3번 요청이 실패하면 컨테이너 재시작

```bash
$ kubectl create -f pod-nginx-liveness.yaml
$ kubectl describe pods nginx-pod-liveness
```

![1  파드 상세정보](https://user-images.githubusercontent.com/66216102/136168008-db00f7b4-335b-41c2-a08e-7a00ecb3078c.JPG)

- 파드 상세 정보를 yaml 파일 확인
  - 이를 복사해 새로운 yaml파일을 작성할 수 있습니다.

```bash
$ kubectl get pods nginx-pod-liveness -o yaml
```

![2  파드 상세정보](https://user-images.githubusercontent.com/66216102/136167991-4d2ef278-8f95-4b6f-81d9-1329485e11dc.JPG)

### 검증

- smlinux/unhealthy 해당 이미지는 5번의 요청만을 허용해주고, 이후 500번의 에러코드를 응답하는 컨테이너임

* 해당 컨테이너의 _app.js_ 코드

```javascript
const http = require('http')
const os = require('os')

console.log('Kubia server starting...')

var requestCount = 0

var handler = function(request, response) {
  console.log('Received request from ' + request.connection.remoteAddress)
  requestCount++
  if (requestCount > 5) {
    response.writeHead(500)
    response.end("I'm not well. Please restart me!")
    return
  }
  response.writeHead(200)
  response.end("You've hit " + os.hostname() + '\n')
}

var www = http.createServer(handler)
www.listen(8080)
```

- _pod-liveness.yaml_ 파일 생성

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: liveness-pod
spec:
  containers:
    - name: unhealthy-container
      image: smlinux/unhealthy
      ports:
        - containerPort: 8080
          protocol: TCP
      livenessProbe:
        httpGet:
          path: /
          port: 8080
```

- 50초 동안은 오류로 취급안하고 정상 작동하는 모습
  - 위에서 default로 설정된 `period` 시간은 10초이고, 5번 응답하는 이미지 이므로 대략 50초 가량은 오류가 나지 않음

![3  라이브니스 상세정보확인](https://user-images.githubusercontent.com/66216102/136167999-44cff26e-f621-4333-b02f-539c0af6bccd.JPG)

- 50초 이후부터 오류가 발생하고, 3번 이상 오류 발생 시 컨테이너가 재생성되는 모습
  - default 값의 실패 3번 이후, 컨테이너가 재시작됨

![4  검증](https://user-images.githubusercontent.com/66216102/136168005-46631e25-1f24-44a7-9dc6-bc06f90c9040.JPG)
