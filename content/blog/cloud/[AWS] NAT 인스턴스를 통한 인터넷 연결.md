---
title: '[AWS] NAT 인스턴스를 통한 인터넷 연결'
date: 2021-06-10 08:43:13
category: '☁️ cloud'
draft: false
---

NAT 인스턴스를 통하여 프라이빗 서브넷에 인스턴스가 외부 인터넷으로 통신을 가능하게 하는 실습

## 실습 단계

### 기본 환경 구성

1. CloudFormation 적용
2. 생성 자원 확인
3. 기본 환경 검증

### NAT 인스턴스 실습

1. NAT 인스턴스 동작을 위한 스크립트 확인
2. NAT 인스턴스 동작을 위한 설정
3. 프라이빗 서브넷에 위치한 인스턴스에서 외부로 통신 확인

### 자원 삭제

## 기본 환경 구성

### CloudFormation 스택 생성

- 이전 실습 방법 참고
- AWS 인프라 자원을 생성할 [YAML 파일]
  - VPC (_10.40.0.0/16_)
  - 인터넷 게이트웨이
  - 퍼블릭 서브넷
  - 퍼블릭 라우팅 테이블(_0.0.0.0(모든 네트워크)_)
  - 프라이빗 서브넷 (_10.40.2.0/24_)
  - 프라이빗 라우팅 테이블
  - 퍼블릭 인스턴스 1개, 프라이빗 인스턴스 2개
  - 보안그룹 2개

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
  VPC1:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.40.0.0/16
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: NATInstance-VPC1
  InternetGateway1:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: NATInstance-IGW1
  InternetGatewayAttachment1:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref InternetGateway1
      VpcId: !Ref VPC1

  RouteTable1:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC1
      Tags:
        - Key: Name
          Value: NATInstance-PublicRouteTable1
  DefaultRoute1:
    Type: AWS::EC2::Route
    DependsOn: InternetGatewayAttachment1
    Properties:
      RouteTableId: !Ref RouteTable1
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway1
  Subnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC1
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.40.1.0/24
      Tags:
        - Key: Name
          Value: NATInstance-VPC1-Subnet1
  Subnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref RouteTable1
      SubnetId: !Ref Subnet1

  RouteTable2:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC1
      Tags:
        - Key: Name
          Value: NATInstance-PrivateRouteTable1
  Subnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC1
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.40.2.0/24
      Tags:
        - Key: Name
          Value: NATInstance-VPC1-Subnet2
  Subnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref RouteTable2
      SubnetId: !Ref Subnet2

  Instance1ENIEth0:
    Type: AWS::EC2::NetworkInterface
    Properties:
      SubnetId: !Ref Subnet1
      Description: Instance1 eth0
      GroupSet:
        - !Ref SG1
      PrivateIpAddress: 10.40.1.100
      #SourceDestCheck: false
      Tags:
        - Key: Name
          Value: NAT-Instance eth0
  VPCEIP1:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc
  VPCAssociateEIP1:
    Type: AWS::EC2::EIPAssociation
    Properties:
      AllocationId: !GetAtt VPCEIP1.AllocationId
      NetworkInterfaceId: !Ref Instance1ENIEth0

  Instance1:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: t2.micro
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: NAT-Instance
      NetworkInterfaces:
        - NetworkInterfaceId: !Ref Instance1ENIEth0
          DeviceIndex: 0
      UserData:
        Fn::Base64: |
          #!/bin/bash
          hostname NAT-Instance
          cat <<EOF>> /etc/sysctl.conf
          net.ipv4.ip_forward=1
          net.ipv4.conf.eth0.send_redirects=0
          EOF
          sysctl -p /etc/sysctl.conf
          yum -y install iptables-services
          systemctl start iptables && systemctl enable iptables
          iptables -F
          iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
          service iptables save

  Instance2:
    Type: AWS::EC2::Instance
    DependsOn: Instance1
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: t2.micro
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: Private-EC2-1
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref Subnet2
          GroupSet:
            - !Ref SG2
          PrivateIpAddress: 10.40.2.101
      UserData:
        Fn::Base64: |
          #!/bin/bash
          (
          echo "qwe123"
          echo "qwe123"
          ) | passwd --stdin root
          sed -i "s/^PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd_config
          sed -i "s/^#PermitRootLogin yes/PermitRootLogin yes/g" /etc/ssh/sshd_config
          service sshd restart
          hostnamectl --static set-hostname Private-EC2-1

  Instance3:
    Type: AWS::EC2::Instance
    DependsOn: Instance1
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: t2.micro
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: Private-EC2-2
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref Subnet2
          GroupSet:
            - !Ref SG2
          PrivateIpAddress: 10.40.2.102
      UserData:
        Fn::Base64: |
          #!/bin/bash
          (
          echo "qwe123"
          echo "qwe123"
          ) | passwd --stdin root
          sed -i "s/^PasswordAuthentication no/PasswordAuthentication yes/g" /etc/ssh/sshd_config
          sed -i "s/^#PermitRootLogin yes/PermitRootLogin yes/g" /etc/ssh/sshd_config
          service sshd restart
          hostnamectl --static set-hostname Private-EC2-2

  SG1:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId: !Ref VPC1
      GroupDescription: VPC1-NATInstance-SecurityGroup
      Tags:
        - Key: Name
          Value: VPC1-NATInstance-SecurityGroup
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: '80'
          ToPort: '80'
          CidrIp: 10.40.0.0/16
        - IpProtocol: tcp
          FromPort: '443'
          ToPort: '443'
          CidrIp: 10.40.0.0/16
        - IpProtocol: udp
          FromPort: '0'
          ToPort: '65535'
          CidrIp: 10.40.0.0/16
        - IpProtocol: icmp
          FromPort: -1
          ToPort: -1
          CidrIp: 0.0.0.0/0

  SG2:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId: !Ref VPC1
      GroupDescription: VPC1-PrivateEC2-SecurityGroup
      Tags:
        - Key: Name
          Value: VPC1-PrivateEC2-SecurityGroup
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 10.40.0.0/0
        - IpProtocol: icmp
          FromPort: -1
          ToPort: -1
          CidrIp: 0.0.0.0/0
```

### 기본 환경 검증

- 기본적으로 프라이빗 EC2 인스턴스 2개는 **외부에서 접근이 불가능합니다.**
  - NAT 인스턴스(퍼블릭)을 통해 SSH로 로컬 접속
- NAT 인스턴스의 <u>프라이빗 IP 정보 확인</u> & NAT 인스턴스에 연결된 <u>탄력적 IP 정보 확인</u>

![1  넷 인스턴스의 정보 확인](https://user-images.githubusercontent.com/66216102/121612695-de183b80-ca95-11eb-87a4-8af459d8c359.JPG)

- 프라이빗 EC2 인스턴스 정보 확인
  - 2개의 프라이빗 EC2 모두 외부와 연결이 되지 않습니다.

![1-1  프라이빗 이씨투 확인](https://user-images.githubusercontent.com/66216102/121612701-df496880-ca95-11eb-813c-23de1a8b9168.JPG)

## NAT 인스턴스 실습

### NAT 인스턴스 동작을 위한 스크립트 확인

- NAT 인스턴스 동작을 위해서 `IPv4 라우팅 처리`와 `IP masquerade` 동작을 확인

![1-2 인스턴스 동작을 위한 스크립트 확인](https://user-images.githubusercontent.com/66216102/121612704-df496880-ca95-11eb-839f-3a0ad168693f.JPG)

> IP masquerade: 리눅스에서 지원하는 네트워킹의 한 기능
>
> - 내부 인스턴스의 IP와 포트를 NAT 인스턴스의 IP와 포트로 변환(PAT)

### NAT 인스턴스 동작을 위한 설정

- NAT 인스턴스 동작을 위한 설정은 **<u>프라이빗 서브넷에 라우팅 정보 추가</u>**, **<u>소스/대상 확인 비활성화</u>**를 2 단계를 통해 이루어짐

#### 프라이빗 서브넷에 라우팅 정보 추가

- 현재 프라이빗 서브넷에 외부 인터넷과 통신하기 위한 라우팅 정보가 없기 때문에 해당 정보를 추가해야 합니다.
- 경로: 서비스 - VPC - 가상 프라이빗 클라우드 - 라우팅 테이블 - NATInstance-PrivateRT1 선택 - 라우팅 탭 선택 - 라우팅 편집 클릭

![1-3 프라이빗-라우팅테이블 설정](https://user-images.githubusercontent.com/66216102/121612705-dfe1ff00-ca95-11eb-9267-50a6648a6c56.JPG)

- 외부 통신을 위한 라우팅 정보 추가

![1-4 외부 통신을 위한 라우팅테이블 설정](https://user-images.githubusercontent.com/66216102/121612706-dfe1ff00-ca95-11eb-8473-a4e19bda96bb.JPG)

#### 소스/대상 확인 비활성화(중지)

- 기본적으로 인스턴스로 인입되거나 나가는 **트래픽이(자신의 - 출발지IP, 목적지IP)가 아닐 경우 폐기**합니다.
  - 해당 기능은 **<u>소스/대상 확인</u>**이며, 기본적으로 VPC의 네트워크 인터페이스(ENI)는 활성화 상태입니다.
- 소스/대상 확인을 비활성화 해야, **<u>자신이 목적지가 아닌 트래픽이 NAT 인스턴스를 경유해서 외부로 나갈 수 있기 때문입니다.</u>**
- 경로: 서비스 - EC2 - 인스턴스 - 인스턴스(NAT-Instance) - 작업 - 네트워킹 - 소스/대상 확인 변경 선택 클릭

![1-5 nat-instance 소스,대상 확인 비활성화](https://user-images.githubusercontent.com/66216102/121612707-e07a9580-ca95-11eb-8057-afe8930404fe.JPG)

- 프라이빗 서브넷 라우팅 정보 추가, 소스/대상 확인 비활성화 작업을 통해 NAT 인스턴스 동작 설정 완료

### 프라이빗 서브넷에 위치한 인스턴스에서 외부로 통신 확인

- 외부와 ping(ICMP) 모두 확인

> ICMP[Internet Control Message Protocol]: 인터넷 제어 메시지 프로토콜
>
> - 용도
>   - 오류 메시지를 전송받는 데 주로 이용
>   - **ICMP 프로토콜은 Network 계층에 속하며 IP 프로토콜과 같이 사용한다!**
> - 사용 명령어
>   - Ping 명령어: 상대방 호스트의 작동 여부 및 응답시간 측정
>   - Tracert 명령어: 목적지까지의 라우팅 경로 추적을 하기 위해 사용

![1-6 외부로 통신확인](https://user-images.githubusercontent.com/66216102/121612709-e07a9580-ca95-11eb-9c2e-2baad70ec56f.JPG)

#### NAT 인스턴스에서 tcpdump 명령어로 트래픽이 경유하는지 확인

- `tcpdump` 명령어를 통해 NAT-Instance에서 경유하는지 확인
  - 사진에서 보듯이 프라이빗 EC2(102번)이 NAT-Instance를 거쳐 외부와 연결을 주고 받는 모습입니다.
  - <u>**_10.40.2.101_ 출발지 IP가 _10.40.1.100_ 으로 변환되는 것을 확인**</u>

![1-7 tcpdump 명령어를 사용해 트래픽 경유확인](https://user-images.githubusercontent.com/66216102/121612711-e1132c00-ca95-11eb-913e-cdc5703afa5d.JPG)

### 자원 삭제

- CloudFormation 스택 삭제

## Reference

https://run-it.tistory.com/31
