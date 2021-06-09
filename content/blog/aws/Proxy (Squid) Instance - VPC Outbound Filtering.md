---
title: 'Proxy (Squid) Instance - VPC Outbound Filtering'
date: 2021-06-09 14:43:13
category: '☁️ aws'
draft: false
---

Proxy 인스턴스를 통하여 외부 접속 시 지정한 URL 사이트만 접속을 허용하도록 실습

## 배경

- `Outbound 트패릭에 대한 감시`가 필요합니다.
  - IP 이외에 `FQDN을 통한 통제`가 필요합니다. - 무단 활동 감시
    - FQDN(Fully Qualified Domain Name): 일반적으로 웹 접속 사용하는 도메인 주소를 뜻함
  - 악성코드가 외부로 연결 시(데이터 유출) 차단을 합니다.
  - 모든 EC2 내부에 IPtable 만으로 관리의 복잡성이 증가합니다.

## 기능 구현을 위한 툴 소개

오픈소스 HTTP proxy Squid(v3.5) 사용

- Squid는 HTTP, HTTPS, FTP 등을 지원하는 `캐싱 프록시`입니다.
- 웹 페이지를 캐싱하고 재사용해 대역폭을 줄이고 응답 시간을 개선합니다.
- `엑세스 제어` 기능을 제공합니다. - 해당 기능을 아래 실습에서 활용
  - **`HTTP` 경우 Request URL 필드에 주소를 확인 후 통제합니다.**
  - `HTTPS` 경우 TLS CliendHello의 `SNI`의 Server Name에서 주소를 확인 후 통제합니다.

## 고려 사항

- Squid(Proxy)를 이용하는 모든 대상 클라이언트에 Proxy 주소 지정이 필요합니다.
- Squid가 Instance 기반에서 동작함으로 AZ별 배치가 되어야 하며, 성능에 따른 고려가 필요합니다.

## 실습 단계

### 기본 환경 구성

1. CloudFormation 적용
2. 생성 자원 확인
3. 기본 환경 검증

### Proxy 통신 실습

1. ProxyLab-Client 인스턴스에 Proxy 주소 설정 후 확인
2. Squid Allowlist에 허용할 URL(도메인) 추가 후 확인

### 자원 삭제

## 기본 환경 구성

### CloudFormation 스택 생성

- 이전 실습 확인
- AWS 인프라 자원을 생성할 [YAML 파일]
  - VPC (ProxyVPC - _10.40.x.x/16_)
  - 퍼블릭 서브넷
  - 퍼블릭 라우팅 테이블
  - 인터넷 게이트웨이
  - 프라이빗 서브넷(ProxyLAB - _10.40.2.x/24_)
  - 프라이빗 라우팅 테이블
  - EC2 인스턴스 2개 (ProxyLAB-Squid, ProxyLAB-Client)
  - 보안그룹 2개
- _ProxyLAB-Squid EC2 인스턴스_ 에 Squid 설정을 *userdata*를 통해 미리 설정해둠

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
  VPC01:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.40.0.0/16
      Tags:
        - Key: Name
          Value: ProxyVPC
  InternetGateway0101:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: ProxyLAB-IGW
  InternetGatewayAttachment0101:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref InternetGateway0101
      VpcId: !Ref VPC01
  PublicRouteTable0101:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC01
      Tags:
        - Key: Name
          Value: ProxyLAB-Public-Routes
  DefaultPublicRoute0101:
    Type: AWS::EC2::Route
    DependsOn: InternetGatewayAttachment0101
    Properties:
      RouteTableId: !Ref PublicRouteTable0101
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway0101
  Subnet0101:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC01
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.40.1.0/24
      Tags:
        - Key: Name
          Value: ProxyLAB-Subnet0101
  Subnet0101RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PublicRouteTable0101
      SubnetId: !Ref Subnet0101

  PrivateRouteTable0101:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC01
      Tags:
        - Key: Name
          Value: ProxyLAB-Private-Routes
  Subnet0102:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC01
      AvailabilityZone: !Select [0, !GetAZs '']
      CidrBlock: 10.40.2.0/24
      Tags:
        - Key: Name
          Value: ProxyLAB-Subnet0102
  Subnet0102RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PrivateRouteTable0101
      SubnetId: !Ref Subnet0102

  Instance0101:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: t2.micro
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: ProxyLAB-Squid
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref Subnet0101
          GroupSet:
            - !Ref SG0101
          AssociatePublicIpAddress: true
          PrivateIpAddress: 10.40.1.100
      UserData:
        Fn::Base64: |
          #!/bin/bash
          hostnamectl --static set-hostname ProxyInstance
          yum install -y squid iptraf
          openssl req -x509 -newkey rsa:4096 -keyout /etc/squid/cert.pem -out /etc/squid/cert.pem -days 3650 -subj "/C=XX/ST=XX/L=squid/O=squid/CN=squid" -nodes
          cat <<EOT> /etc/squid/squid.allowed.sites.txt
          .amazonaws.com
          EOT
          mv /etc/squid/squid.conf /etc/squid/squid.conf.bak
          cat | tee /etc/squid/squid.conf <<EOT
          acl localnet src 10.0.0.0/8	# RFC1918 possible internal network
          acl localnet src 127.0.0.1
          acl SSL_ports port 443
          acl Safe_ports port 80		# http
          acl Safe_ports port 443		# https
          acl CONNECT method CONNECT
          http_access deny !Safe_ports
          http_access deny CONNECT !SSL_ports
          http_access allow localhost manager
          http_access deny manager
          acl allowed_http_sites dstdomain "/etc/squid/squid.allowed.sites.txt"
          http_access allow allowed_http_sites
          http_access deny all
          http_port 0.0.0.0:3128 ssl-bump cert=/etc/squid/cert.pem
          acl allowed_https_sites ssl::server_name "/etc/squid/squid.allowed.sites.txt"
          acl step1 at_step SslBump1
          acl step2 at_step SslBump2
          acl step3 at_step SslBump3
          ssl_bump peek step1 all
          ssl_bump peek step2 allowed_https_sites
          ssl_bump splice step3 allowed_https_sites
          ssl_bump terminate step2 all
          coredump_dir /var/spool/squid
          refresh_pattern ^ftp:  1440  20%  10080
          refresh_pattern ^gopher:  1440  0%  1440
          refresh_pattern -i (/cgi-bin/|\?) 0  0%  0
          refresh_pattern .  0  20%  4320
          EOT
          systemctl start squid && systemctl enable squid
  SG0101:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId: !Ref VPC01
      GroupDescription: EC2-ProxyInstance-SG
      Tags:
        - Key: Name
          Value: EC2-ProxyInstance-SG
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: '3128'
          ToPort: '3128'
          CidrIp: 10.40.0.0/16

  Instance0102:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: t2.micro
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: ProxyLAB-Client
      NetworkInterfaces:
        - DeviceIndex: 0
          SubnetId: !Ref Subnet0102
          GroupSet:
            - !Ref SG0102
          PrivateIpAddress: 10.40.2.100
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
          hostnamectl --static set-hostname ClientInstance
  SG0102:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId: !Ref VPC01
      GroupDescription: EC2-ClientInstance-SG
      Tags:
        - Key: Name
          Value: EC2-ClientInstance-SG
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 10.40.0.0/16
```

### 기본 환경 검증

- Proxy 동작을 확인 하기 전에 기본적인 상태를 확인합니다.
- 먼저 ProxyLAB-Squid 에 SSH 접근을 수행합니다. ProxyLAB-Client 인스턴스는 ProxyLAB-Squid 를 통해서 접근합니다.
  - Squid(HTTP&HTTPS Proxy)가 정상 동작하고 있음

![1 프록시 서버 확인](https://user-images.githubusercontent.com/66216102/121612488-7a8e0e00-ca95-11eb-9713-dfde1a9311fc.JPG)

- 프록시 통신 테스트

![1-1 프록시 통신 테스트](https://user-images.githubusercontent.com/66216102/121612496-7bbf3b00-ca95-11eb-99b3-df1ea93615d1.JPG)

## 프록시 통신 실습

- ProxyLAB-Client 인스턴스에 Proxy 주소 설정 후 확인
- ProxyLAB-Client 인스턴스 SSH 터미널
  - bash 창 위에서 보다시피 해당 명령어의 형식으로 프록시를 설정

![1-2 프록시 주소 설정 후 확인](https://user-images.githubusercontent.com/66216102/121612500-7c57d180-ca95-11eb-8198-d1a90df89e6a.JPG)

### 외부 통신 흐름

1. 클라이언트 인스턴스는 HTTP(S) 통신 트래픽을 Proxy 인스턴스(10.40.1.100)으로 보냅니다.
2. Proxy 인스턴스는 클라이언트 인스턴스에서 보낸 HTTP(S) 내용을 확인하여 허용된 URL(도메인)의 경우 Proxy 인스턴스에서 직접 외부(인터넷)으로 연결을 합니다.
3. 인터넷 게이트웨이에서 Proxy 인스턴스에 연결된 '퍼블릭 IP 혹은 탄력적 IP' 로 출발지 IP를 변경하여 외부(인터넷)으로 통신을 합니다.

### Squid Allowlist에 허용할 URL(도메인) 추가 후 확인

- 위는 ProxyLAB-Squid 인스턴스 SSH 터미널
- 아래는 ProxyLAB-Client 인스턴스 SSH 터미널
- Squid EC2 인스턴스에 **_allowlist_ 설정 변경 후, Client 서버에서 모두 접속**이 되는 것을 확인할 수 있습니다.

![1-3 프록시 설정 변경 후 테스트](https://user-images.githubusercontent.com/66216102/121612504-7cf06800-ca95-11eb-945a-dc0a1110b886.JPG)

> - TCP_DENIED : 클라이언트 요청을 Squid 의 Access Control 에 의해서 차단될 경우
> - TCP_MISS : HTTP 요청만 해당, 클라이언트 요청한 컨텐츠가 Squid Cache 에 없어서 실제 외부서버로 요청을 하여 응답한 경우
> - TCP_TUNNEL : HTTPS 요청만 해당, 클라이언트와 외부서버간 정상 연결한 경우
> - TCP_MEM_HIT : HTTP 요청만 해당, 클라이언트 요청한 컨텐츠가 Squid Memory Cache 에 있어서 바로 클라이언트 인스턴스에 응답결과를 전송하는 경우

## 자원 삭제

- CloudFormation 스택 삭제
