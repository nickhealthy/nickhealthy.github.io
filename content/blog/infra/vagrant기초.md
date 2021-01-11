---
title: 'Vagrant 기초'
date: 2021-01-11 12:03:30
category: '🧱 infra'
thumbnail: { thumbnailSrc }
draft: false
---

## Vagrant 란 ?

가상화(Virtualization)는 실제 운영체제 위에 가상화 소프트웨어를 설치한 후에 소프트웨어를 통해 하드웨어(CPU, Memory, Disk, NIC 등)를 에뮬레이션한 후에 이 위에 운영체제(Guest OS)를 설치하는 것을 의미한다.  
**가상화를 해 주는 소프트웨어를 하이퍼바이저(Hypervisor)** 라고 하며,  
종류로는 이 책에서 사용하는 VirtualBox, 그리고 VMWare, Xen 등이 있다.

여러 운영체제와 애플리케이션을 구동하는 개발 환경 등 복잡한 환경을 추상화할 수 있는 좋은 방법이지만  
**매번 가상 머신을 설치하고 관리해야 하는 부담이 있고 대상이 PC에서 가상 머신으로 옮기는 작업을 했을 뿐이다.**

<b style="color:red">Vagrant 는 이런 문제를 해결하기 위한 솔루션으로 설정 스크립트를 기반으로 특정 환경의 가상 머신을 만들어서 신속하게 개발 환경을 구축하고 공유할 수 있게 만들어진 솔루션이다.</b>  
쉽게 말해 vagrant는 [HashiCorp](https://www.vagrantup.com/) 사에서 제공하는 **가상 환경 구축 도구**이다.

> Vagrant vs Terraform  
> Vagrant는 개발 환경 관리에 중점을 둔 도구이고, Terraform은 인프라 구축을위한 도구입니다.  
> Terraform의 주요 용도는 AWS와 같은 클라우드 공급자의 원격 리소스를 관리하는 것입니다.  
> Vagrant는 주로 최대 소수의 가상 머신 만 사용하는 로컬 개발 환경을 위해 설계되었습니다.
> [https://www.vagrantup.com/intro/vs/terraform](https://www.vagrantup.com/intro/vs/terraform)

## Vagrantfile로 인프라를 구성했을 때 장점

- 환경 구축 작업이 간소
- 환경 공유 용이
- 환경 파악 용이
- 팀 차원의 유지보수 가능

## Vagrant 명령어

|       명령어       |                                설명                                |
| :----------------: | :----------------------------------------------------------------: |
|    vagrant init    |                     Vagrantfile 템플릿을 생성                      |
|     vagrant up     |                      가성머신을 생성하고 가동                      |
| vagrant ssh-config |      SSH 접속을 위한 프라이빗 키 파일이 있는 위치를 확인 가능      |
|  vagrant snapshot  |                            스냅샷 생성                             |
|    vagrant halt    |                          가상 머신을 중지                          |
|  vagrant destroy   |                          가상 머신을 삭제                          |
| vagrant provision  | 프로비저닝 스크립트 추가 후, 작성된 내용을 가성머신에 반영 및 실행 |

## Box 개념

스크립트에 적힌 `.box` 파일 확장자는  
VM를 만들기 위한 기본 OS 이미지를 포함한 VM 설정(CPU, 메모리 사이즈 등)에 대한 기본 템플릿이다.  
[http://www.vagrantbox.es](http://www.vagrantbox.es/) 에 보면 공개된 box 파일 확인이 가능  
또한 VM에 대한 하드웨어 설정을 재정의 할 수도 있다.

## Provisioning 개념

개발환경을 구축하려면 **각각 목적에 맞게 필요한 설치 파일 & 설정을 다르게 구성**해야한다.  
물론 미리 필요한 파일들을 설정해놓고 VM를 가동 시킬 수도 있지만, 이럴경우 매번 다른 VM 이미지를 만들어놔야 하기 때문에 번거로운 작업이 될 수 있다.  
이것을 해결하기 위해 고안된게 provisioning 기능이다.  
VM이 가동된 후에 `Vagrantfile`에 정의된 `provisioning script`를 수행해 준다.

## Vagrantfile 작성 예제

```vagrant
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
# config.vm.box = "centos/7"
  config.vm.box = "generic/centos7"
  config.vm.hostname = "demo"
  config.vm.network "private_network", ip: "192.168.33.10"
  config.vm.synced_folder ".", "/home/vagrant/sync", disabled: true
  # 프로비저닝 추가
  config.vm.provision "shell", inline: $script
end

# 프로비저닝 스크립트 추가
$script = <<SCRIPT
  yum install -y epel-release
  yum install -y nginx
  echo "Hello, Vagrant" > /usr/share/nginx/html/index.html
  systemctl start nginx
SCRIPT
```

## ⭐ 별첨 vagrant init시 내용

```vagrant
# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://vagrantcloud.com/search.
  config.vm.box = "base"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # NOTE: This will enable public access to the opened port
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine and only allow access
  # via 127.0.0.1 to disable public access
  # config.vm.network "forwarded_port", guest: 80, host: 8080, host_ip: "127.0.0.1"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
  #   vb.memory = "1024"
  # end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Enable provisioning with a shell script. Additional provisioners such as
  # Ansible, Chef, Docker, Puppet and Salt are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", inline: <<-SHELL
  #   apt-get update
  #   apt-get install -y apache2
  # SHELL
end

```

<br />

### 참고 사이트

[멀티캠퍼스 교육](#)  
[https://www.lesstif.com/laravelprog/vagrant-24445417.html](https://www.lesstif.com/laravelprog/vagrant-24445417.html)  
[https://bcho.tistory.com/806](https://bcho.tistory.com/806)

<br />
<a href='#'><small class='up-button'>위로 올라가기💨</small></a>
<br />
