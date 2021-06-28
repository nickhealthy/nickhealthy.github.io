---
title: 'ALB와 NLB를 통한 로드밸런싱'
date: 2021-06-28 17:06:13
category: '☁️ aws'
draft: false
---

## 실습목표

- ELB의 3가지 유형의 로드밸런싱 중에 ALB와 NLB를 생성하여 부하 분산을 통한 고가용성 환경을 구성하고, 각 로드밸런서의 차이와 통신 과정을 살펴봄

## 실습 단계

### 기본 환경 구성

- CloudFormation 적용
- 생성 자원 확인
- 기본 환경 검증

### ALB를 통한 로드밸런싱

- ALB 생성
- ALB 검증

### NLB를 통한 로드밸런싱

- NLB 생성
- NLB 검증

### 자원 삭제

## 기본 환경 구성

### CloudFormation 적용

- 이전 실습 확인
- AWS 인프라 자원을 생성할 [YAML 파일]
  - VPC(10.0.0.0/16, 20.0.0.0/16)
  - 퍼블릭 서브넷(ELB-Public-SN-1, ELB-Public-SN-2, My-Public-SN)
  - 퍼블릭 라우팅 테이블(ELB-Public-RT, My-Public-RT)
  - 인터넷 게이트웨이(ELB-IGW, My-IGW)
  - 퍼블릭 EC2 인스턴스(My-EC2, ELB-EC2-1, ELB-EC2-2)
  - 보안그룹(ELB-SG) - 프로토콜: SSH, HTTP, SNMP/대상(0.0.0.0/0)

```yaml
Parameters:
  KeyName:
    Description: Name of an existing EC2 KeyPair to enable SSH access to the instances. Linked to AWS Parameter
    Type: AWS::EC2::KeyPair::KeyName
    ConstraintDescription: must be the name of an existing EC2 KeyPair.
  LatestAmiId:
    Description: (DO NOT CHANGE)
    Type: 'AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>'
    Default: '/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2'
    AllowedValues:
      - /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2

Resources:
  ELBVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      Tags:
        - Key: Name
          Value: ELB-VPC

  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 20.0.0.0/16
      Tags:
        - Key: Name
          Value: My-VPC

  ELBIGW:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: ELB-IGW

  MyIGW:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: My-IGW

  ELBIGWAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref ELBIGW
      VpcId: !Ref ELBVPC

  MyIGWAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref MyIGW
      VpcId: !Ref MyVPC

  ELBPublicRT:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref ELBVPC
      Tags:
        - Key: Name
          Value: ELB-Public-RT

  ELBDefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: ELBIGWAttachment
    Properties:
      RouteTableId: !Ref ELBPublicRT
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref ELBIGW

  MyPublicRT:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref MyVPC
      Tags:
        - Key: Name
          Value: My-Public-RT

  MyDefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: MyIGWAttachment
    Properties:
      RouteTableId: !Ref MyPublicRT
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref MyIGW

  ELBPublicSN1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref ELBVPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.0.0/24
      Tags:
        - Key: Name
          Value: ELB-Public-SN-1

  ELBPublicSN2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref ELBVPC
      AvailabilityZone: !Select [2, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      Tags:
        - Key: Name
          Value: ELB-Public-SN-2

  MyPublicSN:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref MyVPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 20.0.0.0/24
      Tags:
        - Key: Name
          Value: My-Public-SN

  ELBPublicSNRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref ELBPublicRT
      SubnetId: !Ref ELBPublicSN1

  ELBPublicSNRouteTableAssociation2:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref ELBPublicRT
      SubnetId: !Ref ELBPublicSN2

  MyPublicSNRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref MyPublicRT
      SubnetId: !Ref MyPublicSN

  MySG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable HTTP access via port 80 and SSH access via port 22
      VpcId: !Ref MyVPC
      Tags:
        - Key: Name
          Value: My-SG
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 0.0.0.0/0

  ELBSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable HTTP access via port 80 and SSH access via port 22
      VpcId: !Ref ELBVPC
      Tags:
        - Key: Name
          Value: ELBSG
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '80'
          ToPort: '80'
          CidrIp: 0.0.0.0/0
        - IpProtocol: udp
          FromPort: '161'
          ToPort: '161'
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 0.0.0.0/0

  MyEC2:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: My-EC2
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref MyPublicSN
          GroupSet:
            - !Ref MySG
          AssociatePublicIpAddress: true
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          yum install net-snmp-utils -y

  ELBEC21:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: ELB-EC2-1
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref ELBPublicSN1
          GroupSet:
            - !Ref ELBSG
          AssociatePublicIpAddress: true
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          hostname ELB-EC2-1
          yum install httpd -y
          yum install net-snmp net-snmp-utils -y
          yum install tcpdump -y
          service httpd start
          chkconfig httpd on
          service snmpd start
          chkconfig snmpd on
          echo "<h1>ELB-EC2-1 Web Server</h1>" > /var/www/html/index.html
          mkdir /var/www/html/dev
          echo "<h1>ELB-EC2-1 Dev Web Page</h1>" > /var/www/html/dev/index.html

  ELBEC22:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: ELB-EC2-2
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref ELBPublicSN2
          GroupSet:
            - !Ref ELBSG
          AssociatePublicIpAddress: true
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          hostname ELB-EC2-2
          yum install httpd -y
          yum install net-snmp net-snmp-utils -y
          yum install tcpdump -y
          service httpd start
          chkconfig httpd on
          service snmpd start
          chkconfig snmpd on
          echo "<h1>ELB-EC2-2 Web Server</h1>" > /var/www/html/index.html
          mkdir /var/www/html/mgt
          echo "<h1>ELB-EC2-2 Mgt Web Page</h1>" > /var/www/html/mgt/index.html
```

### 기본 환경 검증

- My-EC2 인스턴스에서 *ELb-EC2-1과 ELB-EC2-2*로 HTTP 서비스와 SNMP 서비스 확인
- 각 인스턴스의 퍼블릭 IP 확인한 후 My-EC2 인스턴스에서 SSH로 접근

![1 기본환경검증](https://user-images.githubusercontent.com/66216102/123649312-a0bcf780-d864-11eb-9daf-ff3844796dbd.JPG)

## ALB를 통한 로드밸런싱

### ALB 생성

- 경로: 서비스 - EC2 - 로드밸런싱 - 로드밸런서 - 로드밸런서 생성 클릭

![2  에이엘비로드밸런서생성](https://user-images.githubusercontent.com/66216102/123649316-a1ee2480-d864-11eb-859c-6edff407e15d.JPG)

- 핵심 구성요소로 **<u>리스너와 대상 그룹 존재</u>**
- 서비스 대상 프로토콜과 포트 설정

![2-1](https://user-images.githubusercontent.com/66216102/123649318-a286bb00-d864-11eb-8611-b608d422d31a.JPG)

- VPC 및 가용 영역 설정

![2-2](https://user-images.githubusercontent.com/66216102/123649321-a286bb00-d864-11eb-90b7-370c4889ea5e.JPG)

- ALB는 보안 그룹을 설정해 주어야 합니다.
- 보안 그룹은 서비스 대상을 지정하여 허용하는 필터링 기능입니다.(CloudFormation에 만든 자원을 설정)

![3  보안그룹 설정](https://user-images.githubusercontent.com/66216102/123649323-a31f5180-d864-11eb-9093-34cd2b71ba3e.JPG)

- 라우팅 구성 설정
  - **<u>대상 그룹과 상태 검사 설정을 합니다.</u>**

![4  대상그룹설정](https://user-images.githubusercontent.com/66216102/123649325-a31f5180-d864-11eb-8c00-04c4ecadf089.JPG)

- 대상 그룹 대상 설정
  - ELB-EC2-1, ELB-EC2-2

![5  대상그룹 등록설정](https://user-images.githubusercontent.com/66216102/123649327-a3b7e800-d864-11eb-8492-6fd30529ee2f.JPG)

- ALB 생성 시, **프로비저닝 상태**로 정상적인 동작 상태가 아님
  - 정상 동작을 한다면 곧 **active**상태로 변경
- 기다리는 동안, 대상 그룹을 확인
  - 경로: 서비스 - EC2 - 로드밸런싱 - 대상그룹
- 초기 **intial** 상태로 상태 검사가 진행중인 상태임, 인스턴스 상태가 확인되지 않은 것을 의미
  - 시간이 지난 후, **healthy**로 상태 변경

![6  대상그룹확인](https://user-images.githubusercontent.com/66216102/123649331-a4507e80-d864-11eb-8bb2-066d6a76262f.JPG)

### ALB 검증

- ALB DNS 주소 확인

![7  에이엘비 검증](https://user-images.githubusercontent.com/66216102/123649336-a4e91500-d864-11eb-80e3-56321f42aaff.JPG)

- My-EC2 인스턴스에서 ALB 검증
  - EC2-1, EC-2 인스턴스가 번갈아 가면서 접속됨

![7-1](https://user-images.githubusercontent.com/66216102/123649339-a4e91500-d864-11eb-9985-34a1598ebd0a.JPG)

> ALB의 기본적인 로드밸런싱 알고리즘은 **라운트 로빈 방식을 취하고 있음**

### 경로 기반 라우팅 기능

- 현재 EC2-1, EC2-2 모두 _index.html_ 페이지를 보유중인데,
  - EC2-1에는 _dev/index.html_,
  - EC2-2에는 _mgt/index.html_ 각각 보유중임
  - 해당 경로를 같은 대상그룹으로 묶은 ALB로 시험
- **dev, mgt 각각 한번은 경로를 찾고, 한번은 경로를 찾지 못함**
  - 이러한 것을 해결하기 위한 기능이 **<u>경로 기반 라우팅 기능입니다.</u>**
  - 해당 기능을 사용하기 위해 대상그룹을 분리 해야 함
  - 경로: 서비스 - EC2 - 로드밸런싱 - 대상그룹 - 대상그룹생성

![8  경로기반라우팅설정](https://user-images.githubusercontent.com/66216102/123649342-a581ab80-d864-11eb-90cc-6205610b7291.JPG)

- 대상 그룹 분리 및 생성
  - Dev, Mgt 모두 대상그룹을 각각 생성

![8-1](https://user-images.githubusercontent.com/66216102/123649347-a61a4200-d864-11eb-943f-0686d9cd57e1.JPG)

![8-2](https://user-images.githubusercontent.com/66216102/123649349-a61a4200-d864-11eb-9fa0-31f1b479ff95.JPG)

- **생성한 ALB 페이지의 리스너에서 경로 기반 라우팅을 설정**

![8-3](https://user-images.githubusercontent.com/66216102/123649356-a6b2d880-d864-11eb-9f9f-be31ce87ed6a.JPG)

- 규칙 삽입, 조건 삽입, 경로 삽입, 대상 그룹 설정
- 마찮가지로 Mgt도 규칙 생성
  - /dev/ 경로로 향하는 URL 주소는 Dev-Group에 속한 인스턴스로 전달하고,
  - /mgt/ 경로로 향하는 URL 주소는 Mgt-Group에 속한 인스턴스로 전달하라는 의미임

![8-4](https://user-images.githubusercontent.com/66216102/123649358-a74b6f00-d864-11eb-8849-d0aee1bec550.JPG)

- 각각 총 5번씩 테스트 진행, 모두 정상적으로 트래픽이 라우팅 되는 모습
  - dev 경로는 EC2-1 으로,
  - mgt 경로는 EC2-2 으로,
  - index.html은 양쪽 번갈아가며 트래픽이 유입됩니다.

![8-5](https://user-images.githubusercontent.com/66216102/123649359-a74b6f00-d864-11eb-9828-85f47b572567.JPG)

## NLB를 통한 로드밸런싱

### NLB 생성

- 경로: 서비스 - EC2 - 로드밸런싱 - 로드밸런서 - 로드밸런서 생성 클릭

![9  NLB 생성](https://user-images.githubusercontent.com/66216102/123649361-a7e40580-d864-11eb-9d73-a97d997730b5.JPG)

- NLB 이름 설정 및 인터넷 경계 설정
  - 이전 ALB와 설정 화면이 조금 다르다.

![9-1  NLB 생성](https://user-images.githubusercontent.com/66216102/123649363-a87c9c00-d864-11eb-81b8-24f1b5e12b76.JPG)

- ELB VPC 선택 및 가용영역 / 서브넷 선택

![9-2  NLB 생성](https://user-images.githubusercontent.com/66216102/123649366-a87c9c00-d864-11eb-9ed4-339242c5734f.JPG)

- 리스너 라우팅 설정
  - 해당 설정도 기존과 좀 다르다.
  - 대상 그룹이 사전에 만들어져 있어야 함
  - _Default action_ 에서 만든 해당 그룹을 선택해야 함

![9-3  NLB 생성](https://user-images.githubusercontent.com/66216102/123649368-a9153280-d864-11eb-8247-554cd7bdf187.JPG)

- NLB 대상 그룹 생성 / (위 사진에서 Create target group를 눌러 대상그룹을 NLB 생성 중간 과정에 만들었다.)
  - 그룹 이름 설정
  - 포트 설정
  - VPC 선택

![9-4  NLB 타켓그룹설정](https://user-images.githubusercontent.com/66216102/123649369-a9adc900-d864-11eb-8906-c10249aead4d.JPG)

- 대상 그룹 헬스체크 설정, 상태 검사 프로토콜 포트 HTTP 포트로 재정의

![9-5  NLB 타켓그룹설정](https://user-images.githubusercontent.com/66216102/123649373-a9adc900-d864-11eb-9690-e8e15fcc5595.JPG)

- 대상 그룹 타겟을 설정 후, 대상 그룹에 정상적인 상태를 확인한 모습

![9-6  엔엘비 대상그룹 확인](https://user-images.githubusercontent.com/66216102/123649375-aa465f80-d864-11eb-838c-3ddf3133634e.JPG)

- NLB 검증을 위해 NLB의 DNS 주소 복사

![9-7  NLB 확인](https://user-images.githubusercontent.com/66216102/123649377-aa465f80-d864-11eb-8851-daf86f233128.JPG)

### NLB 검증

- SNMP 서비스를 확인
- `snmpget` 명령어로 NLB DNS 주소로 시스템 이름(SNMP OID 1.3.6.1.2.1.1.5.0)을 요청 시, *ELB-EC2-1, ELB-EC2-2*가 번갈아 응답합니다.
  - **<u>즉, UDP 프로토콜 161 포트로 전달하는 SNMP 요청을 NLB가 부하 분산하여 대상 그룹에 속한 2개의 인스턴스로 부하 분산하는 것입니다.</u>**

![10  NLB 검증](https://user-images.githubusercontent.com/66216102/123649383-aadef600-d864-11eb-8099-f18007f104e4.JPG)

- 추가로 사용자가 전달하는 요청에 대해 NLB 로드 밸런서를 거쳐갈 때, 출발지 IP를 어떻게 전달하는지 확인
  - `3.35.55.43 > 10.0.0.57` 은 출발지 IP가 `3.35.x.x` 라는 것으로 해당 IP는 *My-EC2*에 해당
  - **<u>즉, NLB는 출발지 IP를 사용자의 퍼블릭 IP를 그대로 유지하여 전달하는 특징이 있음</u>**
  - 반면, ALB는 출발지 IP를 사용자의 IP 주소가 아닌, ALB 자신의 로컬 IP로 통신하는 특징이 있음

![11  엔엘비 로드밸런서 출발지 아이피확인](https://user-images.githubusercontent.com/66216102/123649385-ab778c80-d864-11eb-8947-0d9ad3e65ee0.JPG)

### 결론

- ALB는 HTTP(S)에 특화되어 상세한 제어가 가능한 로드밸런서
- NLB는 TCP, UDP 모든 포트에 대하여 빠른 처리 속도의 로드밸런서
- 또한, NLB는 클라이언트 IP를 보존하지만,
- ALB는 클라이언트 IP를 보존하지않고, 자신의 IP로 대체하여 전달하는 차이가 있음

> 클라이언트 IP를 보존하지 않으면, 서버 입장에서는 어떤 대상의 IP가 접근했는지 알 수 없습니다.
>
> 이런 부분을 해결하기 위해 ALB에서는 X-Forwarded-For 헤더라는 곳에 클라이언트 IP정보를 담아 전달합니다.

## 자원 삭제

- 로드 밸런서 삭제
- 대상 그룹 삭제
- CloudFormation 삭제
