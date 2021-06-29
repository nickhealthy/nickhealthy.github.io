---
title: 'Route53 구성 및 라우팅 정책'
date: 2021-06-29 18:22:13
category: '☁️ aws'
draft: false
---

### 실습 목표

- AWS 클라우드 네트워크를 구성하고, Route53의 도메인을 활용하여 연결하는 실습 진행
- 추가로, 장애 조치 라우팅 정책을 통해 Failover 환경 구성

## 실습 단계

### 기본 환경 구성

- CloudFormation 적용
- 생성 자원 확인
- 기본 환경 검증

### Route53과 ALB 연결

- Route53 레코드 생성(단순 라우팅)
- Route53 단순 라우팅 검증

### Route53 장애 조치 라우팅 정책

- Route53 레코드 생성(장애 조치 라우팅)
- Route53 장애 조치 라우팅 검증

### 자원 삭제

## 기본 환경 구성

### CloudFormation 적용

- 적용 방법 이전 실습 참고

- AWS 인프라 자원을 생성할 [YAML 파일]
  - VPC(My-VPC)
  - 퍼블릭 서브넷(My-Public-SN-1, My-Public-SN-2)
  - 퍼블릭 라우팅 테이블(My-Public-RT)
  - 인터넷게이트웨이
  - 퍼블릭 EC2 인스턴스(EC2-1, EC2-2)
  - ALB(대상 그룹: EC2-1, EC2-2)
  - 보안그룹(WEB-SG)

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
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: My-VPC

  MyIGW:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: My-IGW

  MyIGWAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref MyIGW
      VpcId: !Ref MyVPC

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

  MyPublicSN1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref MyVPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.0.0/24
      Tags:
        - Key: Name
          Value: My-Public-SN-1

  MyPublicSN2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref MyVPC
      AvailabilityZone: !Select [2, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      Tags:
        - Key: Name
          Value: My-Public-SN-2

  MyPublicSNRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref MyPublicRT
      SubnetId: !Ref MyPublicSN1

  MyPublicSNRouteTableAssociation2:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref MyPublicRT
      SubnetId: !Ref MyPublicSN2

  WEBSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable HTTP access via port 80 and SSH access via port 22
      VpcId: !Ref MyVPC
      Tags:
        - Key: Name
          Value: WEBSG
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '80'
          ToPort: '80'
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 0.0.0.0/0

  MYEC21:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: EC2-1
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref MyPublicSN1
          GroupSet:
            - !Ref WEBSG
          AssociatePublicIpAddress: true
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          hostname EC2-1
          yum install httpd -y
          service httpd start
          chkconfig httpd on
          echo "<h1>CloudNet@ EC2-1 Web Server</h1>" > /var/www/html/index.html

  MYEC22:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: EC2-2
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref MyPublicSN2
          GroupSet:
            - !Ref WEBSG
          AssociatePublicIpAddress: true
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          hostname ELB-EC2-2
          yum install httpd -y
          service httpd start
          chkconfig httpd on
          echo "<h1>CloudNet@ EC2-2 Web Server</h1>" > /var/www/html/index.html

  MyEIP1:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc

  MyEIP1Assoc:
    Type: AWS::EC2::EIPAssociation
    Properties:
      InstanceId: !Ref MYEC21
      AllocationId: !GetAtt MyEIP1.AllocationId

  MyEIP2:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc

  MyEIP2Assoc:
    Type: AWS::EC2::EIPAssociation
    Properties:
      InstanceId: !Ref MYEC22
      AllocationId: !GetAtt MyEIP2.AllocationId

  ALBTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: My-ALB-TG
      Port: 80
      Protocol: HTTP
      VpcId: !Ref MyVPC
      Targets:
        - Id: !Ref MYEC21
          Port: 80
        - Id: !Ref MYEC22
          Port: 80

  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: My-ALB
      Scheme: internet-facing
      SecurityGroups:
        - !Ref WEBSG
      Subnets:
        - !Ref MyPublicSN1
        - !Ref MyPublicSN2

  ALBListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref ALBTargetGroup
      LoadBalancerArn: !Ref ApplicationLoadBalancer
      Port: 80
      Protocol: HTTP
```

### 기본 환경 검증

- 사용자 PC에서 ALB DNS 주소로 웹 접근하여 로드밸런싱 되는 기본 환경을 검증
  - ALB DNS 이름 확인
  - 경로: 서비스 - EC2 - 로드밸런싱 - 로드밸런서 - 로드밸런서 생성
- 라운드 로빈 형태로 주소가 번갈아 가면서 라우팅되는 모습

![1  ALB-DNS 확인](https://user-images.githubusercontent.com/66216102/123772268-aec35480-d906-11eb-9af6-48517aaf4d3b.JPG)

![1-1](https://user-images.githubusercontent.com/66216102/123772277-aff48180-d906-11eb-8380-9a89e0d56126.JPG)

## Route53과 ALB 연결

- Route53에서 Alias를 통해 ELB, CloudFront, S3 등의 서비스와 연결할 수 있습니다.
- 해당 기능을 이용해 ALB 와 연결
- 경로: 서비스 - Route53 - 호스팅 영역 생성 - 기존에 만들어 둔 도메인 선택 - 레코드 생성 버튼 클릭

### Route53 레코드 생성(단순 라우팅)

- 단순 라우팅 선택 후 생성

![2  레코드 생성](https://user-images.githubusercontent.com/66216102/123772281-aff48180-d906-11eb-90b3-ee8cc2559718.JPG)

- 단순 레코드 정의
  - <u>값/트래픽 라우팅 대상에서 사용할 alias 서비스 리전 및 서비스 선택</u>

![2-1](https://user-images.githubusercontent.com/66216102/123772285-b125ae80-d906-11eb-88ec-182c696305af.JPG)

### Route53 단순 라우팅 검증

- 성공적으로 생성한 레코드 이름을 통해 라운드 로빈 방식을 통해 접속 되는 모습
- 결론적으로 사용자 PC에서 ALB를 통해 2대의 웹 서버로 로드밸런싱 되어 통신합니다.

![3-1  DNS 테스트](https://user-images.githubusercontent.com/66216102/123772287-b1be4500-d906-11eb-9d26-35e935ae3d9a.JPG)

![3  DNS 테스트](https://user-images.githubusercontent.com/66216102/123772286-b125ae80-d906-11eb-8692-47d2c2b7760d.JPG)

### 정리하기

1. 사용자 PC에서 test2.nickhealthy.shop 주소의 대상을 알기 위해 <u>DNS 질의를 DNS 해석기로 전달</u>
2. DNS 해석기는 <u>**루트 네임 서버로 DNS 질의를 하고**</u>, .shop TLD 네임 서버의 주소를 받음. DNS 해석기는 다시 .shop <u>**TLD 네임 서버로 DNS 질의를 하며**</u>, Route53의 호스팅 영역의 네임 서버 주소를 받음
3. DNS 해석기는 Route53 호스팅 영역의 네임 서버로 test2.nickhealthy.shop에 대한 DNS 질의를 하고, 응답을 받음
4. DNS 해석기는 사용자PC로 DNS 질의에 대한 응답을 전달합니다.

## Route53 장애 조치 라우팅 정책

- 2대의 EC2 인스턴스를 연결하여 주 대상(Primary) 보조 대상(Secondary) 형태의 장애 조치 라우팅을 구성합니다.
  - 주 대상은 EC2-1, 보조 대상은 EC2-2

### Route53 레코드 생성(장애 조치 라우팅)

- 장애 조치 라우팅을 통해 Failover 환경을 구성하기 위해선 **<u>대상의 상태를 확인하는 동작이 필요합니다.</u>**
- 경로: 서비스 - Route53 - 상태 검사 - 상태 검사 생성 클릭

![4  장애조치라우팅 설정](https://user-images.githubusercontent.com/66216102/123772290-b256db80-d906-11eb-864e-43fe08082f1a.JPG)

- 주 대상(Primary-Check), 보조 대상(Secondary-Check) 상태 생성
  - `/index` 경로를 주기적으로 상태 검사함

![4-1 장애조치 상태 검사 생성](https://user-images.githubusercontent.com/66216102/123772293-b256db80-d906-11eb-9409-901e01884bb5.JPG)

- 장애 조치 라우팅 생성
  - 경로: 서비스 - Route53 - 호스팅 영역 생성 - 레코드 생성

![5  장애조치라우팅 생성](https://user-images.githubusercontent.com/66216102/123772296-b2ef7200-d906-11eb-9175-113c5c7978f0.JPG)

- 레코드 정의 클릭
  - 주 대상, 보조 대상 각각 생성

![5-1  장애조치라우팅 생성](https://user-images.githubusercontent.com/66216102/123772298-b3880880-d906-11eb-984c-cf7c7d6b7de7.JPG)

- 장애 조치 레코드 생성 확인

![5-2  장애조치라우팅 생성](https://user-images.githubusercontent.com/66216102/123772302-b3880880-d906-11eb-9e23-86da3299d858.JPG)

### Route53 장애 조치 라우팅 검증

- 사용자 PC의 인터넷 브라우저에서 설정한 장애 조치 라우팅 레코드의 도메인 이름으로 접속(test3.nickhealthy.shop)
- 장애가 없을 시, 여러번 방문하여도 로드밸런싱이 되지 않고 주 대상으로만 연결된 모습

![6  장애조치 라우팅 검증](https://user-images.githubusercontent.com/66216102/123772304-b4209f00-d906-11eb-8fdf-b3e323602957.JPG)

- 주 대상 장애를 일으키기 위해 EC2-1 인스턴스 중지 후 테스트
  - 보조 대상으로만 연결되는 모습(EC2-2)

![6-1  장애조치 라우팅 검증](https://user-images.githubusercontent.com/66216102/123772307-b4209f00-d906-11eb-9639-50794cca3002.JPG)

- 상태 검사 확인
  - 상태 검사에서도 주 대상이 **비정상**인 것을 확인할 수 있음

![7  상태 검사 확인](https://user-images.githubusercontent.com/66216102/123772309-b4b93580-d906-11eb-9285-58d5299a6b6b.JPG)

> 상태 검사 주기에 따라 인스턴스의 상태를 확인하고 파악하는데 약간의 딜레이가 발생할 수 있습니다. 원하는 동작이 이루어지지 않았을 때 잠시 후 다시 시도해봐야 합니다.

## 자원 삭제

- Route53 상태 검사 삭제
- 호스팅 영역 레코드 삭제
- 호스팅 영역 삭제
- CloudFormation 자원 삭제
