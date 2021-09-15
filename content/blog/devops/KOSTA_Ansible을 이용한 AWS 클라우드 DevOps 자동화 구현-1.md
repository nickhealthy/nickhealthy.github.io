---
title: 'KOSTA_Ansible을 이용한 AWS 클라우드 DevOps 자동화 구현-1'
date: 2021-09-16 16:41:13
category: ⛓️ devops
draft: false
---

## Ansible 소개

- IaC(Ansible) - 코드로써 인프라를 다루는 도구입니다.
  - **<u>환경의 배포와 구성을 규격화 된 코드로 정의해 사용하는 것을 의미</u>**합니다.
- 여러 개의 서버를 효율적으로 관리할 수 있게 해주는 환경 구성 자동화 도구입니다.
  - 인프라의 상태를 코드로 작성하고, 이를 <u>**모든 서버에 배포함으로써 특정 환경을 동일하게 유지할 수 있도록 돕는 도구**</u>
- 앤서블은 플레이북이라는 파일에 실행할 구성을 선언해 놓으면, 필요할 때 마다 자동으로 실행시킬 수 있는 것이 가장 큰 특징입니다.
  - 예를 들어, 웹 서버의 구성과, DB 서버의 구성을 선언해 놓으면 관리자들은 필요할 때마다 그 구성대로 서버의 설정을 배포할 수 있게 해주는 것입니다.

> AWS에서의 비슷한 자동화 도구로 _OpsWorks_ 서비스가 존재하고,  
> 이는 chef, puppet(openstack - packstack) 기술로 이루어져 있습니다.

### 용어 정리

- 앤서블은 크게 3가지인 <u>인벤토리, 플레이북, 모듈</u>로 이루어져 있습니다.

- 인벤토리 : 어디서 수행할 것인지?
  - 관리해야 되는 서버 리스트
- 플레이북 : 무엇을 수행할 것인지?
- 모듈 : 어떻게 수행할 것인지? 를 정의합니다.
  - 즉, 보다 효율적으로 운영하기 위한 앤서블이 정의한 모듈이 있습니다.

### 인벤토리(inventory)

- 인벤토리는 앤서블에 의해 <u>제어될 대상</u>을 정의합니다.
  - 인벤토리를 만들어 놓지 않으면 관리할 대상이 없기 때문에 앤서블을 사용할 수 없습니다.
- 일반으로 <u>hosts.ini</u> 파일에 정의해 사용합니다.
- 여러 서버들의 <u>SSH 접근 IP, 포트, 사용자와 같은 접속 정보를 정의</u>합니다.
  - 또한 관리할 그룹, 제어할 서버 이름을 정의해서 사용할 수 있습니다.

### 플레이북(playbook)

- 플레이북(각본)은 인벤토리 파일에서 정의한 대상들이 <u>무엇을 수행할 것인지 정의하는 역할</u>입니다.
- 데이터 정의 형식은 `yaml` 포맷으로 설정합니다.
- 플레이북은 앤서블의 핵심 역할을 하는 것이며, 단독으로 사용하는 것이 아닌, <u>인벤토리와 플레이북의 조합으로 사용</u>됩니다.
  - `name`: 플레이명
  - `hosts` : 인벤토리에 정의한 그룹명 지정 또는 관리할 서버의 대상을 작성
  - `become` : 권한 상승 역할(sudo)
  - `tasks` : 실제 어떤 일을 수행할 것인지 해야할 일들을 정의

### 모듈(Module)

- 묘듈은 플레이북에서 `task`가 <u>어떻게 수행될지를 정의하는 요소</u>입니다.
  - 타켓 호스트로 실제 작업을 처리하는 단위로 이 Module이라는 개념을 사용합니다.
- 앤서블은 많은 모듈을 보유하고 있고 해당 모듈을 이용해 사용하는 것입니다.
  - 예를 들어, yum 명령어를 통해 패키지를 설치할 때 앤서블에서는 <u>yum 모듈</u>을 정의하고 사용하면 되는 방식입니다.

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

참고하기

앤서블에서 <u>Agent의 역할을 수행하는 것은 python 입니다.</u>  
즉, python 설치는 필수적으로 필요하지만 리눅스 환경에서는 파이썬이 기본적으로 설치되어 있기 때문에 앤서블은 agent가 없다고도 말합니다.

</div>
</div>

## LAB 1 - 앤서블 코어 설치 및 애드혹 명령어 실습

#### ANSIBLE-CORE, server01(Centos), server02(우분투) 총 3대의 서버 환경을 구축 후 앤서블 다뤄보기

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

애드혹이란?

애드혹은 라틴어로서 "이것을 위해"라는 뜻을 가지고 있고, <u>명령어 한줄 단위로 작업하는 것을 말합니다.</u>  
한줄로 처리하기 번거롭고, **자주 있을 반복적인 작업은 playbook 을 활용해야 합니다.**  
애드혹의 명령어 사용법은 `ansible "all 또는 인벤토리" -m "모듈명" [-a] [구문 명령어]`

</div>
</div>

- 실습 환경에 맞게 호스트 이름 변경

```bash
$ hostnamectl set-hostname "호스트명 지정"
```

- epel repo 등록하기
  - yum repo에서 직접 관리하는 곳 외에 *epel repo*에 ensible이 존재하기 때문에 레포를 등록해줌

```bash
yum install epel-release -y
```

- epel repo에서 ansible 패키지 다운로드

```bash
$ yum --enablerepo=epel -y install ansible
```

- 앤서블 버전 확인

```bash
$ ansible --version
```

- 인벤토리 설정
  - 관리할 서버의 리스트를 맨 하단에 추가

```bash
$ vi /etc/ansible/hosts

...
ansible-ip 등록 # 현재는 실습상 ansible도 하나의 관리할 서버로 가정하고 넣었음
server01-ip 등록
server02-ip 등록
```

### 애드혹 - ping 모듈

- 등록한 서버의 ping 모듈을 통한 테스트
  - `-m` 옵션은 모듈을 뜻하고, 여기서 `ping` 자체가 모듈 이름임(즉, <u>ICMP 프로토콜을 이용하는 것이 아닙니다.</u>)
  - 첫 SSH 접속을 위한 fingerprint을 한 뒤, <u>Permission Denied</u>가 나오는데 <u>비밀번호를 입력하지 않아서</u> 그렇습니다.

```bash
$ ansible all -m ping
```

- 비밀번호를 입력하기 위해 `-k` 옵션 부여 후, 비밀번호 입력
  - `-k` 옵션은 ask를 뜻함
  - 정상적으로 잘 작동된 모습

```bash
$ ansible all -m ping -k
```

![1  핑테스트](https://user-images.githubusercontent.com/66216102/133497722-c2075551-73bc-4063-bd35-e68c22afedff.JPG)

#### 번외 1 - 비밀번호 인가 절차 없이 키를 등록해 인벤토리의 서버에 진입하기

- RSA key 만들기
  - `ssh-keygen` : key generate
  - `-t` : 타입을 뜻함

```bash
$ ssh-keygen -t rsa
```

- 만들어진 키를 확인

```bash
$ ls -al .ssh/
```

- 만들어진 키를 인벤토리 서버에 복사

```bash
$ ssh-copy-id root@"서버ip"
```

- 검증 - 패스워드 없이 키 방식으로 접속이 되는 것을 확인
  - 패스워드 치지 않고 접속이 잘 됩니다.

```bash
$ ansible all -m ping
```

![2  알에스에이 키](https://user-images.githubusercontent.com/66216102/133497727-568023ea-438d-4f5e-bc8f-639122e034ed.JPG)

#### 번외 2 - _hosts_ 파일의 인벤토리에 등록하지 않고, 따로 인벤토리 정보를 가진 파일을 만들어 관리하기

- 인벤토리 서버의 ip주소 정보가 있는 파일 만들기

```bash
$ echo "192.168.56.101" >> inventory.list
$ echo "192.168.56.113" >> inventory.list

cat inventory.list
```

- 해당 파일에 있는 정보를 가지고 ping 모듈 테스트
  - `-i` 옵션 :

```bash
$ ansible all -i inventory.list -m ping
```

- 특정 인벤토리의 서버ip만 가지고 테스트

```bash
$ ansible 192.168.56.113 -i inventory.list -m ping
```

#### 번외 3 - `--list-hosts` 명령어를 통해 관리하고 있는 호스트의 ip주소를 확인하기

```bash
$ ansible 192.168.56.113 -i inventory.list -m ping --list-hosts
```

### 애드혹 - Shell 모듈

> `CHANGE` 표시가 뜨는 것은 <u>**어떤 변화가 있을 때**</u>를 나타냅니다.

- `uptime` 명령어를 통해 인벤토리 서버의 시간 확인하기
  - `-a` 옵션 : <u>리눅스 명령어 구문 입력을 의미함</u>

```bash
$ ansible all -m shell -a "uptime"
```

- `df -h` 명령어를 통해 현재 인벤토리 서버의 디스크 사용량 확인하기

```bash
$ ansible all -m shell -a "df -h"
```

![3  shell 모듈 명령어](https://user-images.githubusercontent.com/66216102/133497732-2486cf97-ea67-4f5c-927e-d702aa8c20f3.JPG)

- 위에서 `key-keygen` 명령어를 통해 만들어진 키가 잘 들어있는지 확인하는 등 응용이 가능합니다.
  - _authorized_keys_ 는 public 키입니다.

![2-1  확인](https://user-images.githubusercontent.com/66216102/133497729-c0fca993-dd19-421a-985b-b5ad723be857.JPG)

### 애드혹 - User 모듈

- 인벤토리 서버에 유저 추가하기

```bash
$ ansible all -m user -a "name=kosta"
```

- 검증 - 사용자 확인

```bash
$ ansible all -m shell -a "tail -n 1 /etc/passwd"
```

- 인벤토리 서버에 추가한 유저 삭제하기
  - <u>`absent` 명령어는 삭제하는 명령어임</u>

```bash
$ ansible all -m user -a "name=kosta state=absent"
# 확인
$ ansible all -m shell -a "tail -n 1 /etc/passwd"
```

### 애드혹 - yum 모듈

- 인벤토리 서버에 yum 모듈을 사용해 설치하기
  - <u>`present` 명령어는 추가하는 명령어</u>

```bash
$ ansible all -m yum -a "name=httpd state=present"
```

- `curl` 명령어를 통해 _index.html_ 파일을 만들기
  - `-o` 옵션은 output의 의미
  - 해당 명령어를 통해 index.html 파일이 생성

```bash
$ curl https://www.nginx.com -o index.html
```

### 애드혹 - copy 모듈

- 인벤토리 서버에 위에서 만든 _index.html_ 파일을 copy 하기
  - `src` 옵션 : source를 의미함
  - `dest` 옵션 : destination를 의미함

```bash
$ ansible all -m copy -a "src=index.html dest=/var/www/html/index.html"
```

### 애드혹 - service 모듈

- 인벤토리 서버에서 httpd 웹 서버를 위에서 만든 *index.html*로 구동시키기
  - `started` 옵션 : 서비스를 실행하는 명령어
  - `stopped` 옵션 : 서비스를 중지하는 명령

```bash
$ ansible all -m service -a "name=httpd state=started"
```

- 검증

![4  웹서버 구동](https://user-images.githubusercontent.com/66216102/133497733-d07f8cdb-c979-40e7-998c-011d76e5624d.JPG)

- 인벤토리 httpd 웹서버 종료

```bash
$ ansible all -m service -a "name=httpd state=stopped"
```

- 인벤토리 htppd 웹서버 remove 하기

```bash
$ ansible all -m yum -a "name=httpd state=absent"
```

### 애드혹 - apt 모듈

- 인벤토리 서버 중 <u>우분투 [ubuntu]로 이름 지정된 서버만</u> 구동시키기
  - `pkg` 옵션 : package를 의미함 (yum에서는 name으로 지정했었음)

```bash
# cat 명령어를 통해 확인
$ cat /etc/ansible/hosts
# ubuntu로 지정된 이름의 서버만 apt로 아파치2를 설치
$ ansible ubuntu -m apt -a "pkg=apache2 state=present"
```

![5  우분투 이름의 서버만 설치하기](https://user-images.githubusercontent.com/66216102/133497735-2f1a4428-b1ee-4ac4-8f02-6098a68edd94.JPG)

- COPY 모듈을 사용해 우분투 웹서버에 반영 시키기

```bash
$ ansible ubuntu -m copy -a "src=index.html dest=/var/www/html/index.html"
```

- 인벤토리 서버의 웹서버 구동 종료 및 지우기

```bash
$ ansible ubuntu -m apt -a "name=apache2 state=stopped"
$ ansible ubuntu -m apt -a "name=apache2 state=absent"
```

## LAB 2 - 멱등성 알아보기 및 테스트

- 같은 일을 반복하는 작업을 **<u>멱등성이 없다</u>**라고 합니다. 즉, 멱등성은 <u>**동일한 작업은 건너띄고 수행하지 않는 것을 의미합니다.**</u>

  - 모듈마다 멱등성이 있는 것도, 없는 것도 존재합니다.

- 하나의 파일 안에 같은 내용이 있는지 파악 및 내용 추가하기. 즉, `lineinfile` 모듈의 멱등성 테스트
  - `localhost` 옵션 : 현재 작업하고 있는 앤서블 코어의 로컬을 의미
  - `-c` 옵션 : <u>ssh 프로토콜을 이용하지 않겠다는 의미</u>
  - `lineinfile` 옵션 : 파일 안에서 <u>라인 한줄을 추가하겠다는 의미</u>

> 현재 192.168.56.113 라인이 3개 존재하고 있음

```bash
$ ansible localhost -c local -m lineinfile -a "path=inventory.list line=192.168.56.113"
```

- 검증 - 똑같이 3라인만 존재하는 것을 확인
  - <u>해당 LAB을 통해 `lineinfile` 모듈은 멱등성이 있는 모듈이라고 판단할 수 있습니다.</u>

![5-1 멱등성확인](https://user-images.githubusercontent.com/66216102/133497737-d98cc455-9eae-4286-8e45-e10aa59e979f.JPG)

## LAB 3 - playbook을 활용해 nginx 설치 및 삭제하기(centos, ubuntu)

> 플레이북은 한줄씩 명령어를 실행한 앞선 애드혹과 다르게 한번에 스크립트를 작성해 자동화 하는 것을 의미합니다.

### CentOS - nginx 설치, 구동 및 삭제

- 플레이북 작업에 사용할 디렉토리 생성 및 진입
  - `&_` 옵션 : 직전에 생성한 디렉토리 진입

```bash
$ mkdir playbook && cd $_
```

- 플레이북에 사용할 yaml 파일 작성
  - `gather_facts` 옵션 :

```yaml
$ vi nginx_install.yaml
# [nginx_install.yaml]
---
- name: Install nginx on CentOS
  hosts: centos
  gather_facts: no

  tasks:
    - name: install epel-release
      # ansible centos -m yum -a "name=epel-release state=latest" 와 의미가 같음
      yum: name=epel-release state=latest
    - name: install nginx web server
      yum: name=nginx state=present
    - name: upload default index.html for web server
      # get_url : 해당 url를 가져옴 / mode : chmod 644 명령어와 동일
      get_url: url=https://www.nginx.com dest=/usr/share/nginx/html mode=0644
    - name: start nginx web server
      service: name=nginx state=started
```

- 작성한 플레이북을 실행하기
  - 로그를 보고 싶다면 뒤에 `-v` 옵션을 부여하면 됨

```bash
$ ansible-playbook nginx_install.yaml
```

- 제거하는 플레이북을 yaml 파일 만들기

```yaml
$ vi remove_nginx
# [remove_nginx.yaml]
---
- name: Remove nginx on CentOS
  hosts: centos
  gather_facts: no

  tasks:
    - name: remove epel-release
      yum: name=epel-release state=absent
    - name: remove nginx web server
      yum: name=nginx state=absent
```

- 제거하는 플레이북 실행

```bash
$ ansible-playbook remove_nginx.yaml
```

### Ubuntu - nginx 설치, 구동 및 삭제

- 플레이북에 사용할 yaml 파일 작성

```yaml
# ansible f
```

## 번외 : 필드(온프레미스 환경)에서 가상화 관리

#### 베어메탈 방식의 하이퍼바이저 : TYPE1

- KVM : 리눅스 베이스로 무료
- 아래는 VMWare 베이스로 유료
  - ESXI - Vcenter
  - XEN - Xcenter
  - Hyper-v
