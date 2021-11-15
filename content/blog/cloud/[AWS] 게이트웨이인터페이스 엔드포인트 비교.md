---
title: '[AWS] 게이트웨이/인터페이스 엔드포인트 비교'
date: 2021-06-03 18:26:13
category: '☁️ cloud'
draft: false
---

VPC 엔드포인트의 **게이트웨이 엔드포인트와 인터페이스 엔드포인트 기능 활용**하여, AWS 특정 서비스에 대한 프라이빗 연결을 확인하고 통신 과정을 실습

## 실습과정

### 기본 환경 구성

1. CloudFormation 적용
2. 생성 자원 확인
3. 기본 환경 검증

### 게이트웨이 엔드포인트 생성 및 검증

1. 게이트웨이 엔드포인트 생성
2. 게이트웨이 엔드포인트 검증

### 인터페이스 엔드포인트 생성 및 검증

1. 인터페이스 엔드포인트 생성
2. 인터페이스 엔드포인트 검증

### 자원 삭제

## 기본 환경 구성

### CloudFormation 자원 적용

- 경로: 서비스 - CloudFormation - 스택 - 스택 생성 클릭

- AWS 인프라 자원을 생성할 [YAML 파일]

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
  CloudNetaVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      Tags:
        - Key: Name
          Value: CloudNeta-VPC

  CloudNetaIGW:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: CloudNeta-IGW

  CloudNetaIGWAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref CloudNetaIGW
      VpcId: !Ref CloudNetaVPC

  CloudNetaPublicRT:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref CloudNetaVPC
      Tags:
        - Key: Name
          Value: CloudNeta-Public-RT

  DefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: CloudNetaIGWAttachment
    Properties:
      RouteTableId: !Ref CloudNetaPublicRT
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref CloudNetaIGW

  CloudNetaPrivateRT:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref CloudNetaVPC
      Tags:
        - Key: Name
          Value: CloudNeta-Private-RT

  CloudNetaPublicSN:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref CloudNetaVPC
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.0.0.0/24
      Tags:
        - Key: Name
          Value: CloudNeta-Public-SN

  CloudNetaPrivateSN:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref CloudNetaVPC
      AvailabilityZone: !Select [2, !GetAZs '']
      CidrBlock: 10.0.1.0/24
      Tags:
        - Key: Name
          Value: CloudNeta-Private-SN

  CloudNetaPublicSNRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref CloudNetaPublicRT
      SubnetId: !Ref CloudNetaPublicSN

  CloudNetaPrivateSNRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref CloudNetaPrivateRT
      SubnetId: !Ref CloudNetaPrivateSN

  CloudNetaSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable HTTP access via port 80 and SSH access via port 22
      VpcId: !Ref CloudNetaVPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '80'
          ToPort: '80'
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 0.0.0.0/0

  CloudNetaPublicEC2:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: CloudNeta-Public-EC2
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref CloudNetaPublicSN
          GroupSet:
            - !Ref CloudNetaSecurityGroup
          AssociatePublicIpAddress: true

  CloudNetaPrivateEC2:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: !Ref LatestAmiId
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: CloudNeta-Private-EC2
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref CloudNetaPrivateSN
          GroupSet:
            - !Ref CloudNetaSecurityGroup
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
```

- YAML 템플릿을 업로드하여 설정

![1-1클라우드포메이션 스택생성](https://user-images.githubusercontent.com/66216102/120621413-d1458780-c498-11eb-8ef6-0d426541b3b3.JPG)

- 스택 세부정보 설정
  - 이름, 생성한 키페어 설정

![1-2클라우드포메이션 스택설정](https://user-images.githubusercontent.com/66216102/120621416-d276b480-c498-11eb-8e7b-3ced0b988e29.JPG)

### 생성된 자원으로 통신 확인

- 처음 퍼블릭 EC2에 접근 후 _AWS-S3_ 서비스로 통신 확인
  - ping 반환을 통해 통신이 잘 되는 것을 확인
- SSH 프로토콜을 통해 **로컬 네트워크로 프라이빗 EC2 접근(암호 입력 방식)**
  - ping 반환이 안되는 것을 확인(퍼블릭 IP에 대한 접근 불가능)
  - 프라이빗 라우팅 테이블에는 **외부와 통신할 수 있는 NAT 게이트웨이 등이 설정되어 있지 않음**
- 위와 같은 환경에서 **모든 네트워크가 S3와 통신이 가능하고, 외부 인터넷이 아닌 AWS 내부 네트워크를 통해 통신하기를 원한다면 VPC 엔드포인트 기능을 활용**

![1-3퍼블릭,프라이빗통신확인](https://user-images.githubusercontent.com/66216102/120621418-d30f4b00-c498-11eb-90c4-6963c9352c25.JPG)

## 게이트웨이 엔드포인트 생성 및 검증

- VPC 엔드포인트는 **AWS 대상 서비스에 따라 게이트웨이, 인터페이스 타입으로 나뉨**
- 이중 게이트웨이 엔드포인트는 S3, DynamoDB 서비스에 대해 연결이 가능(S3 서비스 사용예정)
- 경로: 서비스 - VPC - 가상 프라이빗 클라우드 - 엔드포인트 - 엔드포인트 생성 클릭

![1-4엔드포인트생성](https://user-images.githubusercontent.com/66216102/120621422-d3a7e180-c498-11eb-8c98-064341116043.JPG)

### 프라이빗 라우팅테이블 정보확인

- 이전에 프라이빗 라우팅에는 로컬 네트워크만 등록되어 있던 상태
  - 따라서 S3 버킷 객체를 URL로 외부 통신할 수 없었음
- 엔드포인트 생성과 함께 S3 서비스를 엔드포인트에 등록, 프라이빗 라우팅 테이블도 등록
  - 밑에 사진에 S3 서비스에 대한 경로가 세부정보에 추가된 모습

![1-5라우팅테이블-라우팅정보확인](https://user-images.githubusercontent.com/66216102/120621425-d4407800-c498-11eb-9d02-a9a5857950e3.JPG)

- 퍼블릭 라우팅 테이블 또한 S3에 대한 경로가 추가된 모습

![1-6라우팅테이블-정보확인](https://user-images.githubusercontent.com/66216102/120621430-d4d90e80-c498-11eb-86d1-a7923e434049.JPG)

### 게이트웨이 엔드포인트 검증

- S3 서비스 연결을 위해 **게이트웨이 엔드포인트를 생성**, 실제 EC2 인스턴스에 접속하여 통신 검증
  - 퍼블릭 EC2 통신은 기존과 같이 잘 되는 모습
  - 프라이빗 EC2 통신은 **AWS의 내부 네트워크를 통해 S3와 통신**

![1-7 통신확인](https://user-images.githubusercontent.com/66216102/120621434-d4d90e80-c498-11eb-9bb0-0b4da67b128c.JPG)

## 인터페이스 엔드포인트 생성 및 검증

### 인터페이스 엔드포인트 생성

- 이번 실습에서는 S3와 DynamoDB가 아닌 CloudFormation 서비스로 변경하여 통신을 실험
  - 아까도 말했듯이, **AWS의 서비스에 따라 엔드포인트의 종류가 바뀜**
- `dig` 명령어를 통해 CloudFormation DNS 주소에 대한 IP 주소를 확인
  - 퍼블릭 EC2와 프라이빗 EC2 각각 체크
  - **현재 DNS 주소는** 퍼블릭 IP 주소로 매핑되어 있어 **외부 인터넷 구간을 통해 통신하는 환경**

```bash
$ dig +short cloudformation.ap-northeast-2.amazonaws.com
```

![1-8디그명령어를 통해 아이피주소확인](https://user-images.githubusercontent.com/66216102/120621435-d60a3b80-c498-11eb-8455-4ae61f429484.JPG)

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

중요내용

- <u>**AWS 서비스는 리전별로 기본 DNS 호스트 주소를 가지고 있습니다**.</u>
- 여기에 VPC 인터페이스 엔드포인트를 생성하면, **엔드포인트 전용 DNS 호스트가 생성됩니다**.

- 인터페이스 엔드포인트의 설정 값중에 **프라이빗 DNS 활성화 설정** 여부에 따라 통신흐름이 바뀌게 됩니다.
  - 프라이빗 DNS 활성화 시 기본 DNS, 엔드포인트 전용 DNS 모두 <u>**인터페이스 엔드포인트를 통한 프라이빗 통신**</u>
  - 프라이빗 DNS 비활성화 시 <u>**기본 DNS 주소는 인터넷 구간을 통한 퍼블릭 통신**</u>

</div>
</div>

### 프라이빗 DNS 활성화

- 경로: 서비스 - VPC - 가상 프라이빗 클라우드 - VPC - 작업 - DNS 호스트 이름 편집 클릭
- 프라이빗 DNS 활성화하려면 **DNS 호스트 이름 활성화**을 체크해야 합니다.

![1-9프라이빗디엔에스활성화](https://user-images.githubusercontent.com/66216102/120621442-d6a2d200-c498-11eb-9acf-ba1d580bb147.JPG)

- 위 작업 완료 후 경로: 서비스 - VPC - 가상 프라이빗 클라우드 - 엔드포인트 - 엔드포인트 생성 클릭
- 필터링 검색으로 인터페이스 엔드포인트 선택, 퍼블릭/프라이빗 서브넷 선택, **프라이빗 DNS 이름 활성화 체크**

![1-10인터페이스엔드포인트생성](https://user-images.githubusercontent.com/66216102/120621449-d73b6880-c498-11eb-84d6-4a832ca82930.JPG)

- 기본 DNS 호스트는 동일한 형태이지만, 엔드포인트 전용 DNS 호스트는 **개별적으로 다른 형태의 주소를 가집니다.**
  - 아래 사진에서 <u>_Private DNS names_ 부분이 기본 DNS 호스트</u>
- 해당 인터페이스 엔드포인트는 **프라이빗 서브넷 내에 배치되었으며, CloudFormation과 연결되어 있습니다.**
  - 위에서 중요 내용으로 언급한 것과 마찮가지로 **프라이빗 DNS 활성화를 통해** 퍼블릭이 아닌 VPC 내부 인터넷으로 통신하는 것(퍼블릭EC2, 프라이빗EC2 둘다)
  - 추가로, 프라이빗 DNS 활성화 시키면 <u>**기본 DNS, 인터페이스 DNS 모두 인터페이스 엔드포인트를 통해 통신**</u>한다고 하였다.(밑에 사진에 나옴 - 기억해두기)

![1-11인터페이스엔드포인트확인](https://user-images.githubusercontent.com/66216102/120621454-d9052c00-c498-11eb-9efe-00870b192d17.JPG)

### 인터페이스 엔드포인트 검증

- CloudFormation 서비스 연결을 위해 인터페이스 엔드포인트 생성 완료
- 실제 EC2 환경에서 **CloudFormation의 DNS 주소에 대한 매핑 정보를 검증**하고, **최초 환경과 통신 흐름을 비교**
  - DNS 매핑 주소를 `dig` 명령어를 통해 검증
  - 최초의 퍼블릭 IP로 나오던 주소가 바뀌게 되었습니다. (각각 퍼블릭, 프라이빗)
  - 사진에도 보듯이 프라이빗 IP 대역으로 IP가 바뀌었음 / 해당 IP 주소는 **인터페이스 엔드포인트의 주소**
- 인터페이스 엔드포인트를 통해 **외부 네트워크를 사용하지 않고, AWS의 내부 네트워크로 CloudFormation이랑 통신을 한 것**

![1-12 인터페이스 엔드포인트 검증](https://user-images.githubusercontent.com/66216102/120621459-d99dc280-c498-11eb-8f48-6f6e8f5d399e.JPG)

### 번외: 프라이빗 DNS 이름을 비활성화한다면

- 기존에 생성한 인터페이스 엔드포인트 삭제 후 재생성
  - 이때, **프라이빗 DNS 활성화 체크 해제 후**, 다시 테스트

![1-13 프라이빗 디엔에스 이름 체크해제](https://user-images.githubusercontent.com/66216102/120621465-daceef80-c498-11eb-8ae5-54afa3f3e557.JPG)

- 재생성 후, 테스트 결과
  - **프라이빗 DNS 이름 비활성화**에 의해 기본 DNS 호스트는 퍼블릭 IP로 퍼블릭 통신을,
  - 엔드포인트 전용 DNS 호스트 이용시 프라이빗 IP로 프라이빗 통신을 합니다.
  - **즉, 프라이빗 DNS 이름 비활성화 설정에 따라 기본 DNS 통신과 엔드포인트 DNS 통신이 다른 형태를 가지게 됩니다.**

![1-14 프라이빗 디엔에스 비활성화](https://user-images.githubusercontent.com/66216102/120621470-dc001c80-c498-11eb-8db0-1dd0e4868f69.JPG)

## 자원 삭제

- 엔드포인트 삭제
- CloudFormation 삭제

## Reference

따라하며 배우는 AWS 네트워크 입문
