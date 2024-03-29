---
title: '[AWS] 엔드포인트 서비스로 프라이빗 링크 구성'
date: 2021-06-08 15:06:13
category: '☁️ cloud'
draft: false
---

엔드포인트 서비스 기능을 활용하여, 사용자가 생성한 VPC와 프라이빗 연결을 확인하고 통신되는 과정을 실습

## 실습과정

### 기본 환경 구성

1. CloudFormation 적용
2. 생성 자원 확인
3. 기본 환경 검증

### 엔드포인트 서비스 생성 및 연결

1. 엔드포인트 서비스 생성
2. 인터페이스 엔드포인트 생성 및 연결

### 엔드포인트 서비스 검증

### 자원삭제

## 기본 환경 구성

- 이전 실습 방법 참고

- AWS 인프라 자원을 생성할 [YAML 파일]

  - VPC : 2개 (My, Custom)

  - 퍼블릭 서브넷 2개 (My, Custom)

  - 라우팅 테이블 2개 (My, Custom)

  - 인터넷 게이트웨이 2개 (My, Custom)

  - 퍼블릭 EC2 인스턴스 3개 (My, Custom1, Custom2)

  - 네트워크 로드밸랜서(NLB) 1개 (타겟 - Custom1, Custom2)

    > NLB: 데이터의 부하를 분산해 주는 역할의 서비스 / 인스턴스로 데이터를 분산하여 전달

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
  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      Tags:
        - Key: Name
          Value: MyVPC

  CustomVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 20.0.0.0/16
      Tags:
        - Key: Name
          Value: CustomVPC

  MyIGW:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: My-IGW

  CustomIGW:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: Custom-IGW

  MyIGWAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref MyIGW
      VpcId: !Ref MyVPC

  CustomIGWAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref CustomIGW
      VpcId: !Ref CustomVPC

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

  CustomPublicRT:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref CustomVPC
      Tags:
        - Key: Name
          Value: Custom-Public-RT

  CustomDefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: CustomIGWAttachment
    Properties:
      RouteTableId: !Ref CustomPublicRT
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref CustomIGW

  MyPublicSN:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref MyVPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.0.0/24
      Tags:
        - Key: Name
          Value: My-Public-SN

  CustomPublicSN:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref CustomVPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 20.0.0.0/24
      Tags:
        - Key: Name
          Value: Custom-Public-SN

  MyPublicSNRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref MyPublicRT
      SubnetId: !Ref MyPublicSN

  CustomPublicSNRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref CustomPublicRT
      SubnetId: !Ref CustomPublicSN

  WebSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: WebSG
      VpcId: !Ref MyVPC
      GroupName: WebSG
      Tags:
        - Key: Name
          Value: WebSG
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '80'
          ToPort: '80'
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 0.0.0.0/0

  CustomWebSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: CustomSG
      VpcId: !Ref CustomVPC
      GroupName: CustomSG
      Tags:
        - Key: Name
          Value: Custom-WebSG
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '80'
          ToPort: '80'
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
            - !Ref WebSG
          AssociatePublicIpAddress: true

  CustomWeb1EC2:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: Custom-WEB-1
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref CustomPublicSN
          GroupSet:
            - !Ref CustomWebSG
          AssociatePublicIpAddress: true
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          (
          echo "qwe123"
          echo "qwe123"
          ) | passwd --stdin root
          sed -i "s/^PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd_config
          sed -i "s/^#PermitRootLogin yes/PermitRootLogin yes/g" /etc/ssh/sshd_config
          service sshd restart
          yum install -y httpd
          systemctl start httpd && systemctl enable httpd
          echo "<html><h1>Endpoint Service Lab - CloudNeta Web Server 1</h1></html>" > /var/www/html/index.html

  CustomWeb2EC2:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: Custom-WEB-2
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref CustomPublicSN
          GroupSet:
            - !Ref CustomWebSG
          AssociatePublicIpAddress: true
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          (
          echo "qwe123"
          echo "qwe123"
          ) | passwd --stdin root
          sed -i "s/^PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd_config
          sed -i "s/^#PermitRootLogin yes/PermitRootLogin yes/g" /etc/ssh/sshd_config
          service sshd restart
          yum install -y httpd
          systemctl start httpd && systemctl enable httpd
          echo "<html><h1>Endpoint Service Lab - CloudNeta Web Server 2</h1></html>" > /var/www/html/index.html

  CustomNLBTG:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: Custom-NLB-TG
      Port: 80
      Protocol: TCP
      VpcId: !Ref CustomVPC
      Targets:
        - Id: !Ref CustomWeb1EC2
          Port: 80
        - Id: !Ref CustomWeb2EC2
          Port: 80

  CustomNLB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Type: network
      Scheme: internet-facing
      Subnets:
        - !Ref CustomPublicSN
      Tags:
        - Key: Name
          Value: Custom-NLB

  NLBListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref CustomNLBTG
      LoadBalancerArn: !Ref CustomNLB
      Port: 80
      Protocol: TCP
```

### 기본 환경 검증

- MyVPC에 존재하는 EC2 인스턴스에서 CustomVPC에 존재하는 웹 서버 인스턴스로 통신을 확인
- NLB 자원에 대한 정상적인 서비스 상태를 확인 후 검증
  - 경로: 서비스 - EC2 - 로드밸런싱 - 대상 그룹 - 대상 그룹 선택

![1  로드밸런싱 인스턴스 상태확인](https://user-images.githubusercontent.com/66216102/121131585-f8220600-c86a-11eb-95d2-73f303a6ef3d.JPG)

- 실습을 위해 Custom-NLB의 DNS 주소 먼저 확인
  - 경로: 서비스 - EC2 - 로드밸런싱 - 로드밸런서

![1-1  로드밸런싱 디엔에스 주소확인](https://user-images.githubusercontent.com/66216102/121131587-f8ba9c80-c86a-11eb-85c8-d8acc293cffe.JPG)

- *MyVPC*에서 _CustomVPC - NLB_ DNS의 IP주소 확인, 웹 통신 확인
  - 모두 퍼블릭 서브넷에 존재하기 때문에 **인터넷 게이트웨이를 통한 외부 인터넷으로 통신한 것**
  - 현재 MyVPC의 서브넷 대역은 _10.0.0.0/24_ 임
  - 프라이빗 통신을 위해서 **엔드포인트를 활용한 <u>프라이빗 링크</u>를 통해 해결 가능**

![1-2 도메인 네임 아이피확인, 컬명령어로 웹통신 확인](https://user-images.githubusercontent.com/66216102/121131590-f9533300-c86a-11eb-8530-c72ca2cc3273.JPG)

## 엔드포인트 서비스 생성 및 연결

### 엔드포인트 서비스 생성

- 엔드포인트 서비스를 생성하여 VPC간 프라이빗 링크 연결을 위한 환경 구성
- 경로: 서비스 - VPC - 가상 프라이빗 클라우드 - 엔드포인트 서비스 생성 클릭

![1-3 엔드포인트서비스 생성](https://user-images.githubusercontent.com/66216102/121131593-f9ebc980-c86a-11eb-898d-58ca33b8471c.JPG)

- 엔드포인트 서비스 생성 확인
  - 엔드포인트 서비스를 생성하여 CustomVPC의 NLB와 연결완료
  - 이를 통해 **인터페이스 엔드포인트와 프라이빗 링크**를 연결할 수 있음
  - 이전 실습의 차이점은 **이전에는 AWS 서비스 엔드포인트 연결에 대한 엔드포인트 실습**이고,
  - 해당 실습은 **사용자가 만든 VPC에 대한 엔드포인트 연결에 대한 엔드포인트 실습**입니다.

![1-4 엔드포인트 서비스 생성확인](https://user-images.githubusercontent.com/66216102/121131596-fa846000-c86a-11eb-9375-30c8dcfe0f8b.JPG)

### 인터페이스 엔드포인트 생성 및 연결

- 엔드포인트 서비스를 통해 CustomVPC-NLB에 연결했다면, MyVPC에 인터페이스 엔드포인트를 생성하여 연결해야합니다.
- 경로: 서비스 - VPC - 가상 프라이빗 클라우드 - 엔드포인트 생성 클릭

![1-5 엔드포인트끼리 연결을 위한 엔드포인트생성](https://user-images.githubusercontent.com/66216102/121131599-fa846000-c86a-11eb-8dd5-3a736da847c1.JPG)

- 하단에 내려가서 보안그룹 선택

![1-5-1 엔드포인트끼리 연결을 위한 엔드포인트생성](https://user-images.githubusercontent.com/66216102/121131600-fb1cf680-c86a-11eb-9886-8270a02e52f3.JPG)

- 생성된 엔드포인트 확인
  - 수락 대기 중인 **엔드포인트 서비스를 수락**해줘야 사용 가능
  - 약 2분 후 사용 가능으로 변경

![1-6엔드포인트생성 확인](https://user-images.githubusercontent.com/66216102/121131603-fbb58d00-c86a-11eb-963d-0fbab5d6cf4c.JPG)

- 엔드포인트 서비스에서 수락을 통해 엔드포인트 연결

![1-7 엔드포인트서비스 수락](https://user-images.githubusercontent.com/66216102/121131606-fc4e2380-c86a-11eb-8231-97c0ab673635.JPG)

## 엔드포인트 서비스 검증

- MyVPC의 EC2 인스턴스에서 통신을 확인
  - 확인에 앞서 **엔드포인트 DNS 이름을 확인**

![1-8 엔드포인트 도메인네임 주소 복사](https://user-images.githubusercontent.com/66216102/121131608-fc4e2380-c86a-11eb-9fed-4f0bb65828ab.JPG)

- `dig`, `curl` 명령어를 DNS의 주소를 통해 검증
  - 서브넷 대역대가 *MyVPC*의 대역대로 달라진 것을 확인할 수 있음(10.0.0.x)
  - 인터넷 게이트웨이가 아닌 **<u>엔드포인트 서비스의 프라이빗 링크</u>**를 통해 통신 확인

![1-9 엔드포인트(프라이빗 링크) 통신확인](https://user-images.githubusercontent.com/66216102/121131579-f6f0d900-c86a-11eb-83b6-99b4063c1018.JPG)

## 자원 삭제

- 엔드포인트 삭제
- 엔드포인트 서비스 삭제
- CloudFormation 스택 삭제
