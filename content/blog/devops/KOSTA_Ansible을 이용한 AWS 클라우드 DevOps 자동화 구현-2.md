---
title: 'KOSTA_Ansible을 이용한 AWS 클라우드 DevOps 자동화 구현-2'
date: 2021-09-16 17:41:13
category: ⛓️ devops
draft: false
---

- `gather_facts` : 관리할 수 있는 정보들 중(ip정보, mac 정보, 호스트네임 등) 인벤토리 서버의 정보를 변수로 활용 가능한 것들

## LAB 1 - playbook의 when 조건과 변수 사용하기

#### `action`, `when` 조건과 인벤토리 정보를 담고 있는 _fact.txt_ 파일을 이용해 동적으로 playbook 작성하기

- 애드혹 방식으로 `setup` 모듈을 이용해 인벤토리 서버에 대한 정보 가져오기

```bash
$ ansible all -m setup >> facts.txt
```

- 플레이북에 사용할 yaml 파일 작성
  - 중괄호에 들어가 있는 것이 `gather_facts`에서 활용하는 변수를 의미함

```bash
$ vi test.yml

# [test.yml]
---
- name: Install nginx on the nodes
  hosts: all
  become: yes

  tasks:
    - name: install epel-release for CentOS
      action: "{{ ansible_pkg_mgr }} name=epel-release state=latest"
      when: ansible_distribution == 'CentOS'

    - name: install nginx web server for CentOS
      action: "{{ ansible_pkg_mgr }} name=nginx state=present"
      when: ansible_distribution == 'CentOS'

    - name: upload default index.html for web server
      get_url: url=https://www.nginx.com dest=/usr/share/nginx/html/ mode=0644
      when: ansible_distribution == 'CentOS'

    - name: start nginx web server
      service: name=nginx state=started
      when: ansible_distribution == 'CentOS'

    - name: install nginx web server for Ubuntu
      action: "{{ ansible_pkg_mgr }} name=nginx state=present update_cache=yes"
      when: ansible_distribution == 'Ubuntu'

    - name: upload default index.html for web server
      get_url: url=https://www.nginx.com dest=/usr/share/nginx/html/
               mode=0644 validate_certs=no
      when: ansible_distribution == 'Ubuntu'

```

- 작성한 플레이북 구동

```bash
$ ansible-playbook test.yml
```

- 검증
  - `gather_facts` 의 기본 값은 yes이며, 위에서 정보를 표시해줍니다. 빠른 성능과 정보가 필요 없다면 no로 설정하는 것이 좋습니다.
  - `when` 조건에 맞지 않는 것은 skipping 된 것을 확인할 수 있습니다. 아래 예제에선 centos 조건문을 걸었는데 스킵 된 인벤토리 서버는 ubuntu임

![1  플레이북 변수정보 활용하기](https://user-images.githubusercontent.com/66216102/133713417-63f482b3-8d8d-47b5-a185-920765b50a9b.JPG)

- 플레이북을 이용해 삭제하기

```bash
$ vi test_remove.yml
# [test_remove.yml]

---
- name: Remove nginx on the nodes
  hosts: all
  become: yes

  tasks:
    - name: remove epel-release for CentOS
      action: "{{ ansible_pkg_mgr }} name=epel-release state=absent"
      when: ansible_distribution == 'CentOS'

    - name: remove nginx web server for CentOS
      action: "{{ ansible_pkg_mgr }} name=nginx state=absent"
      when: ansible_distribution == 'CentOS'

    - name: remove nginx web server
      action: "{{ ansible_pkg_mgr }} name=nginx state=absent autoremove=yes"
      when: ansible_distribution == 'Ubuntu'
...

```

- 작성된 플레이북 실행

```bash
$ ansible-playbook test_remove.yml
```

## LAB 2 - playbook을 이용해 nfs 구축 및 multi-play 구현

#### nfs를 localhost에 만들고, 인벤토리 서버들을 해당 nfs에 마운트하기

- 플레이북에 사용할 yaml 파일 작성
  - `mode: 0777` 옵션 : chmod 777과 동일
  - `/etc/exports` 옵션 : 접속이 허용된 대역을 추가하기 위한 설정
  - _설치할 유틸리티나 버전 등의 작성 등, 우분투와 센트OS는 조금씩 다릅니다._

```bash
$ vi nfs.yml

# [nfs.yml]
- name: Setup for nfs server
  hosts: localhost # ansible 서버인 localhost에 설치
  gather_facts: no

  tasks:
    - name: make nfs_shared directory
      file:  # file 모듈
        path: /root/nfs_shared
        state: directory
        mode: 0777 # chmod 777과 동일
    - name: configure /etc/exports # 접속이 허용된 대역을 추가하기 위한 설정
      lineinfile:
        path: /etc/exports
        line: /root/nfs_shared 192.168.56.0/24(rw,sync)
    - name: install NFS
      yum:
        name: nfs-utils # nfs 서버 설치
        state: present
    - name: nfs service start
      service:
        name: nfs-server
        state: restarted
        enabled: yes

- name: Setup for nfs clients
  hosts: centos
  gather_facts: no

  tasks:
    - name: make nfs_client directory
      file:
        path: /root/nfs
        state: directory
    - name: install NFS
      yum:
        name: nfs-utils
        state: present
    - name: mount point directory as client
      mount:
        path: /root/nfs
        src: 192.168.56.105:/root/nfs_shared # ansible의 ip를 할당
        fstype: nfs
        state: mounted

- name: Setup for nfs clients Ubuntu
  hosts: ubuntu
  gather_facts: no

  tasks:
    - name: make nfs_client directory
      file:
        path: /root/nfs
        state: directory

    - name: Install NFS-Utils
      apt:
        pkg: nfs-common
        state: present
        update_cache: yes # apt update -y

    - name: mount point directory as client
      mount:
        path: /root/nfs
        src: 192.168.56.105:/root/nfs_shared
        fstype: nfs
        opts: nfsvers=3
        state: mounted
```

- 작성된 플레이북 실행하기

```bash
$ ansible-playbook nfs.yml
```

- 확인하기

![2  nfs 마운트정보](https://user-images.githubusercontent.com/66216102/133713419-720df8bf-f5aa-4666-a425-22f731a58d8c.JPG)
