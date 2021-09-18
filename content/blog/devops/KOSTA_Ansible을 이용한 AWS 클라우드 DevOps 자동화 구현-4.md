---
title: 'KOSTA_Ansible을 이용한 AWS 클라우드 DevOps 자동화 구현-4'
date: 2021-09-17 16:41:13
category: ⛓️ devops
draft: false
---

### 학습목표

- AWS CLI를 이용하여 자원(서비스) 다뤄보기

## AWS CLI 설치와 설정

- AWS 명령줄 인터페이스(CLI)는 AWS 서비스를 관리하는 통합 도구입니다.
  - 편한 방식으로 OpenStack이 있는데 이는 웹 UI에서 서비스를 관리할 수 있는 것을 제공해줍니다. 하지만 클라우드 자원을 다룰 수 있는 범위가 대략 80% 정도입니다.
- 도구 하나만 다운로드하여 구성하면 여<u>러 AWS 서비스를 명령줄에서 제어하고 스크립트를 통해 자동화</u>할 수 있습니다.
  - AWS CLI를 사용하여 서비스의 기능을 살펴보고 리소스를 관리할 셀 스크립트를 개발할 수 있습니다.

### CLI 설치 및 CLI 로그인

- AWS-SDK boto3 및 AWS-CLI 설치

```bash
$ sudo yum install python-pip
$ sudo pip install boto
$ curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
$ unzip awscliv2.zip
$ sudo ./aws/install
```

- CLI를 다루기 위한 서버 설정
  - `complete -C '/usr/local/bin/aws_completer' aws` : bash 쉘 자동완성 하기 위한 설정

```bash
$ sudo vi ~/.bash_profile
# .bash_profile에 해당 명령어 넣기 >> complete -C '/usr/local/bin/aws_completer' aws
# PATH=$PATH:$HOME/bin
# export PATH
$ source ~/.bash_profile
```

- CLI를 사용하기 위한 AWS 계정 로그인

```bash
# aws에 로그인하기 위한 명령어
$ aws configure
$ 엑세스 키, 시크릿 키 입력
$ Default region name [None]: 리전 네임입력
$ Default output format [None]: 데이터 포맷을 결정
```

![1  aws 로그인](https://user-images.githubusercontent.com/66216102/133728195-10115cef-043c-4af2-a353-3dba7d2f3060.JPG)

- CLI를 이용하여 S3 버킷 조회

![2  s3 버킷조회](https://user-images.githubusercontent.com/66216102/133728198-293f2580-270f-4371-b6a3-9b04dec1ffd1.JPG)

## LAB 1 - CLI 를 활용하여 VPC와 서브넷 생성하기

#### AWS-CLI를 이용하여 VPC와 서브넷 자원을 생성해 봅시다.

- VPC를 CIDR 값을 정해 만들기
  - `--output` 옵션 : 결과물을 테이블 형식으로 보기

```bash
$ aws ec2 create-vpc --cidr-block 172.16.0.0/16 --output table
$ aws ec2 describe-vpcs --output table
```

![1  vpc 생성](https://user-images.githubusercontent.com/66216102/133732739-67aa606a-0241-479a-878e-2fea073d4478.JPG)

- 서브넷 만들기
  - AZ - a, c 두 개의 서브넷 생성

```bash
# 변수 선언
$ MY_VPC=vpc-035eb45dd473aa061
# 서브넷 생성
$ aws ec2 create-subnet --vpc-id $MY_VPC --cidr-block 172.16.0.0/20 --availability-zone ap-northeast-2a --output table
$ aws ec2 create-subnet --vpc-id $MY_VPC --cidr-block 172.16.32.0/20 --availability-zone ap-northeast-2c --output table
```

![2  서브넷 설정](https://user-images.githubusercontent.com/66216102/133732748-a91cf6ef-9d75-4f90-9211-69c7bedba268.JPG)

- 상세 정보 보기 (필터링 포함)
  - MY_VPC의 서브넷 두개가 생성된 것을 확인할 수 있음

![3  상세정보보기](https://user-images.githubusercontent.com/66216102/133732749-c2927641-3969-4c6d-b497-4192c33e1191.JPG)

## LAB 2 - 서브넷을 퍼블릭 서브넷으로 만들기

#### 앞서 만들었던 프라이빗 서브넷을 퍼블릭 서브넷으로 만들기

- 인터넷 게이트웨이 만들기

```bash
$ aws ec2 create-internet-gateway --output table
# 상세 정보 확인
$ aws ec2 describe-internet-gateways --output table
```

- 인터넷 게이트웨이를 VPC에 연결하기

```bash
$ aws ec2 attach-internet-gateway --vpc-id $MY_VPC --internet-gateway-id $MY_IGW
$ aws ec2 describe-internet-gateways --output table
```

![4  인터넷게이트웨이 생성 및 어태치](https://user-images.githubusercontent.com/66216102/133732751-a53599dc-fd8c-4fb3-b13b-7a00893c2bcf.JPG)

- 라우팅 테이블 만들기

```bash
$ aws ec2 create-route-table --vpc-id $MY_VPC --output table
$ aws ec2 describe-route-tables --output table
```

![5  라우팅 테이블 생성](https://user-images.githubusercontent.com/66216102/133732753-d5cf2278-ac53-4d9f-9e0a-5562ec0e401a.JPG)

- 라우팅 테이블에 인터넷 게이트웨이를 추가
  - 리턴 결과 true 출력

```bash
# 변수 설정
$ MY_RTB=rtb-0ff265e3570259a34
$ aws ec2 create-route --route-table-id $MY_RTB --destination-cidr-block 0.0.0.0/0 \
--gateway-id $MY_IGW --output table
```

![6  인터넷 게이트웨이 라우팅에 연결](https://user-images.githubusercontent.com/66216102/133732754-9cd0aa24-db3f-4b86-8f65-825406ab4502.JPG)

- 라우팅 테이블 안에 인터넷 게이트웨이가 추가 된 것을 확인

```bash
# 상세정보 확인
$ aws ec2 describe-route-tables --route-table-id $MY_RTB --output table
$ aws ec2 describe-subnets --filters "Name=vpc-id,Values=$MY_VPC" \
--query 'Subnets[*].{ID:SubnetId,CIDR:CidrBlock}'
```

![6-1  인터넷 게이트웨이 라우팅에 연결](https://user-images.githubusercontent.com/66216102/133732757-02a28c48-acbd-4032-83f2-73eb9d7c1252.JPG)

- 서브넷을 라우팅에 테이블 연결

```bash
# 변수 설정
$ MY_SID1=subnet-0775ed14f85759e14
$ MY_SID2=subnet-08c42a258a37d56e1

$ aws ec2 associate-route-table --subnet-id $MY_SID1 --route-table-id $MY_RTB
$ aws ec2 associate-route-table --subnet-id $MY_SID2 --route-table-id $MY_RTB
```

![7  서브넷과 라우팅 테이블 연결](https://user-images.githubusercontent.com/66216102/133732758-4d56ddb7-c99b-4ed6-9f3b-4d04092a23cf.JPG)

- VPC-Subnet에 <u>자동 할당 IP</u> 수정을 해주는 것
  - <u>앞 수업 시간에 설명했던 "공인 IP 활성화" 부분을 뜻함</u>

```bash
$ aws ec2 modify-subnet-attribute --subnet-id $MY_SID1 --map-public-ip-on-launch
$ aws ec2 modify-subnet-attribute --subnet-id $MY_SID2 --map-public-ip-on-launch
```

- VPC-DNS 호스트 이름 편집
  - 공인 IP 생성 시 자동으로 생성해주는 DNS 설정을 하는 것임

```bash
$ aws ec2 modify-vpc-attribute --vpc-id $MY_VPC --enable-dns-hostnames
```

## LAB 3 - 키페어, 보안그룹 만들기

- 키페어 생성 후, 키를 해당 서버에 저장하기
  - `--output`를 text 형식으로 만들어서 \*_.pem_ 파일을 생성

```bash
$ aws ec2 create-key-pair --key-name MyKeyPair --query 'KeyMaterial' \
--output text > MyKeyPair.pem
```

- 키 페어에 대한 권한 설정

```bash
$ chmod 400 MyKeyPair.pem
```

- 보안그룹 생성

```bash
$ aws ec2 create-security-group --group-name HTTP_SSH_Access \
--description "Security group for HTTP_SSH access" --vpc-id $MY_VPC
$ aws ec2 describe-security-groups --output table
```

![8  보안그룹 생성 및 설정](https://user-images.githubusercontent.com/66216102/133739462-d7019b0b-5eba-433a-a155-2b9d0d06a441.JPG)

- EC2 서버의 아이피 추출하기

```bash
$ MY_IP=$(curl http://checkip.amazonaws.com/)
# 서버의 아이피 - 13.125.xxx.133
$ curl http://checkip.amazonaws.com/
```

![9  나의 아이피 추출](https://user-images.githubusercontent.com/66216102/133739454-9715687b-f922-48b2-97fd-81b7a1c2a74a.JPG)

- 보안 그룹 인바운드 설정
  - 인바운드는 `ingress`, 아웃바운드는 `egress` 명령어

```bash
$ MY_SG=sg-05b321deb1c4e237d
# SSH 포트와 HTTP 포트를 설정
$ aws ec2 authorize-security-group-ingress --group-id $MY_SG --protocol tcp \
--port 22 --cidr $MY_IP/32
$ aws ec2 authorize-security-group-ingress --group-id $MY_SG --protocol tcp \
--port 80 --cidr 0.0.0.0/0
```

![10  보안그룹 인바운드 설정](https://user-images.githubusercontent.com/66216102/133739456-f9e6a69b-42a1-452d-9329-c79c4c0d17a0.JPG)

## LAB 4 - 볼륨 및 인스턴스 만들기

- 추가 볼륨을 생성할 json 파일 생성

```json
$ vi mapping.json

[
   {
     "DeviceName": "/dev/xvda",
     "Ebs": {
       "VolumeSize": 8
     }
   },
   {
     "DeviceName": "/dev/sdh",
     "Ebs": {
       "VolumeSize": 8
     }
   }
]
```

- AMI 이미지 검색하기

```bash
$ aws ec2 describe-images \
--owners amazon \
--filters 'Name=name,Values=amzn2-ami-hvm-2.0.????????.?-x86_64-gp2' 'Name=state,Values=available' \
--query 'reverse(sort_by(Images, &CreationDate))[:1].ImageId' \
--output text
```

![11  ami 이미지 추출](https://user-images.githubusercontent.com/66216102/133739457-32b39321-3a59-40f2-817d-341ff163ec4b.JPG)

- EC2 생성하기
  - 해당 `--image-id` 옵션의 값은 <u>**자주 바뀌니 주의**</u>

```bash
$ aws ec2 run-instances --image-id ami-08c64544f5cfcddd0 \
--count 1 --instance-type t2.micro --key-name MyKeyPair \
--security-group-ids $MY_SG \
--subnet-id $MY_SID1 \
--block-device-mappings file://mapping.json
```

- EC2 상세 정보 조회
  - 새롭게 만들어진 EC2 서버의 상세 정보에서 퍼블릭 IP 확인하기

```bash
$ MY_IID=i-0c463c0c5951523b1
$ aws ec2 describe-instances --instance-id $MY_IID
```

- SSH 프로토콜을 통하여 새롭게 만들어진 EC2 접속

```bash
$ ssh -i "MyKeyPair.pem" ec2-user@3.36.99.213
```

![12  ssh 서버 접속](https://user-images.githubusercontent.com/66216102/133739460-8b6d3c9c-2f88-4ddf-b1d7-34930416be7b.JPG)

- EC2에 웹 서버 설치 및 구동

```bash
$ sudo yum install -y httpd
$ sudo systemctl enable --now httpd
$ curl 3.36.99.213
$ exit
```

## LAB 5 - 자원 정리하기

#### 현재까지 만든 자원을 CLI 을 이용하여 지워봅시다.

- EC2 자원 삭제하기 및 상세 조회

```bash
$ aws ec2 terminate-instances --instance-id $MY_IID
$ aws ec2 describe-instances --instance-ids $MY_IID
```

- 서브넷 삭제하기

```bash
$ aws ec2 delete-subnet --subnet-id $MY_SID1
$ aws ec2 delete-subnet --subnet-id $MY_SID2
```

- 라우팅 테이블 삭제

```bash
$ aws ec2 delete-route-table --route-table-id $MY_RTB
```

- VPC와 인터넷 게이트웨이 detach

```bash
$ aws ec2 detach-internet-gateway --internet-gateway-id $MY_IGW --vpc-id $MY_VPC
```

- 인터넷 게이트웨이 삭제

```bash
$ aws ec2 delete-internet-gateway --internet-gateway-id $MY_IGW
```

- VPC 삭제하기

```bash
$ aws ec2 delete-vpc --vpc-id $MY_VPC
```

## LAB 5 - Ansible을 활용한 EC2 인스턴스와 AWS 도커 관리

> **<u>EC2의 클라우드 환경에서는 인벤토리를 관리할 필요가 없습니다.</u>**
>
> 온프레미스처럼 기존에 가지고 있는 서버가 없기 때문입니다. 따라서 hosts는 localhost로 작업을 진행하면 됩니다.

- 앤서블 설치
  - epel-release 레포를 사용해도 무방합니다.
  - <u>알아서 다른 레포를 추천해줌</u>

```bash
$ sudo amazon-linux-extras install ansible2
```

- AWS 이미지 검색

```bash
$ aws ec2 describe-images \
--owners amazon \
--filters 'Name=name,Values=amzn2-ami-hvm-2.0.????????.?-x86_64-gp2' 'Name=state,Values=available' \
--query 'reverse(sort_by(Images, &CreationDate))[:1].ImageId' \
--output text
```

- 플레이북에 활용한 yaml 파일 만들기
  - `hosts: localhost` 옵션은 EC2 서버가 앤서블의 코어로 동작하는 것을 의미합니다.
  - `wait` 옵션 : <u>수행 결과를 기다리는 것임</u>

```yaml
$ vi ec2.yml

- name: launch webservers instance
  hosts: localhost
  tasks:
  - name: start the instance
    ec2:
      region: ap-northeast-2
      image: ami-08c64544f5cfcddd0
      instance_type: t2.micro
      exact_count: 1
      count_tag: { type: web }
      vpc_subnet_id: subnet-3ec34455
      assign_public_ip: True
      user_data: "{{ lookup('file', 'user_data.sh') }}"
      instance_tags: { Name: WEB }
      group: SG-WEB
      key_name: 0916
      wait: yes

```

- 유저 데이터 만들기

```bash
$ vi user_data.sh

#!/bin/bash
yum install -y httpd
systemctl start httpd && sudo systemctl enable httpd
echo "WEB" > /var/www/html/index.html

```

- 플레이북 실행

```bash
$ ansible-playbook ec2.ym
```

![1  앤서블 서버 생성](https://user-images.githubusercontent.com/66216102/133746396-7e53732e-fd9c-4480-a0c3-c4da3da0074d.JPG)
