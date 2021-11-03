---
title: '[AWS] CloudFormation으로 인프라 자동 구축(EC2 웹서버)'
date: 2021-06-01 14:43:13
category: '☁️ cloud'
draft: false
---

<div class="quote-block">
<div class="quote-block__emoji">💡</div>
<div class="quote-block__content" markdown=1>

CloudFormation 이란

- AWS 인프라에 대해 코드로 개략적인 선언을 하는 방법
- AWS 인프라 자원을 코드로 정의하여 자동으로 정의된 자원을 생성하거나 삭제할 수 있습니다.(IaC - Infrastructure as Code)

</div>
</div>

---

CloudFormation 스택을 생성하여 인프라를 자동으로 생성하고,  
CloudFormation 스택을 삭제하여 생성된 인프라를 자동으로 삭제하는 실습

## YAML 파일 생성

### 템플릿

- Json이나 YAML 파일 형식의 코드로 작성할 수 있습니다.

### 스택 생성

- 템플릿을 CLoudFormation에 업로드하여 스택을 생성할 수 있습니다.
- 템플릿에 정의된 AWS 인프라 자원에 대해 순서대로 자동 생성합니다.

### 스택 삭제

- 스택 생성에 의해 생성된 AWS 인프라 자원을 순서대로 자동 삭제합니다.

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
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: t2.micro
      KeyName: !Ref KeyName
      Tags:
        - Key: Name
          Value: WebServer
      SecurityGroups:
        - !Ref MySG
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          yum install httpd -y
          systemctl start httpd && systemctl enable httpd
          echo "<h1>Test Web Server</h1>" > /var/www/html/index.html

  MySG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Enable HTTP access via port 80 and SSH access via port 22
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          CidrIp: 0.0.0.0/0
```

## 템플릿을 이용해 CloudFormation 스택 생성 & 확인

1. 콘솔 서비스 - CloudFormation - 스택생성 클릭
2. YAML 파일을 업로드 해 스택생성
   - 준비된 템플릿 - 템플릿 파일 업로드 - 파일선택(JSON 또는 YAML 파일로 작성된 코드 업로드)

![1-1 스택생성](https://user-images.githubusercontent.com/66216102/120592246-7d2aab00-c478-11eb-8dc5-8ced3473d46c.JPG)

3. 스택이름 설정 & 키페어 설정

![1-2키페어선택](https://user-images.githubusercontent.com/66216102/120592250-7e5bd800-c478-11eb-9c96-96802b1f24eb.JPG)

4. 시간이 지나고 자동으로 스택이 생성되고 있는 모습

![1-3스택생성완료](https://user-images.githubusercontent.com/66216102/120592251-7e5bd800-c478-11eb-9da7-342f253b2513.JPG)

5. EC2 생성 완료 및 SSH를 이용해 진입

![1-4인스턴스실행중](https://user-images.githubusercontent.com/66216102/120592254-7ef46e80-c478-11eb-96b0-6e40bb1cd7b1.JPG)

6. YAML파일에 작성한 코드가 자동으로 실행되어진 모습(웹 서버)

![1-5자동으로 실행된 모습](https://user-images.githubusercontent.com/66216102/120592256-7f8d0500-c478-11eb-9f05-2da2d4558bd9.JPG)

## CloudFormation 삭제

CloudFormation을 삭제하면 자원을 일일이 삭제할 필요 없이 **생성된 자원 순서대로 삭제된다.**

- 서비스 - CloudFormation - 스택 - 생성한 스택 선택 - 삭제 - 스택삭제
