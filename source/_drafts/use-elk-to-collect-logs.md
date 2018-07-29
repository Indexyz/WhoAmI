---
title: 在 Linux 上使用 ELK 进行日志收集
tags: 
    - ELK
    - Linux
categories:
    - Linux
date: 2017-08-09 17:41:58
updated: 2017-09-01 18:19:10
---

在我们服务过多并分散到多个机器上的时候, 这时候要查看相应的日志就要到相应的服务器上去查看, 所以我们很可能想把这些日志归集到一个中心的地方去查看和处理, 
这时候最常见的系统就是 ELK 了.

<!-- more -->

ELK 是 Elasticsearch, Logstash 和 Kibana 三款软件组合而成的日志收集处理套件, 我自己是使用 Docker 来部署了 单个 Master 节点 单个 Data 节点的 
Elasticsearch 集群, 下文中也是借此进行介绍.

# 安装
在这里使用 Docker 进行安装 可以参考我的 `docker-compose.yml`
```yaml
version: '2'
services:
  kibana:
    image: docker.elastic.co/kibana/kibana:6.3.1
    environment:
      ELASTICSEARCH_URL: http://elasticsearch:9200
    links:
    - elasticsearch-master:elasticsearch
  elasticsearch-master:
    image: docker.elastic.co/elasticsearch/elasticsearch:6.3.1
    environment:
      cluster.name: docker-cluster
      node.name: hetzner-hdd-01
      network.publish_host: elasticsearch
      node.master: 'true'
      ES_JAVA_OPTS: -Xms8g -Xmx8g
    volumes:
    - /data/elk/elasticsearch:/usr/share/elasticsearch/data
  redis:
    image: redis
    command:
    - --requirepass
    - password
  logstash:
    image: docker.elastic.co/logstash/logstash:6.3.1
    volumes:
    - /data/elk/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    links:
    - elasticsearch-master:elasticsearch
    - redis:redis
  elasticsearch-data:
    image: docker.elastic.co/elasticsearch/elasticsearch:6.3.1
    environment:
      cluster.name: docker-cluster
      discovery.zen.ping.unicast.hosts: elasticsearch
      node.name: hetzner-ssd-01
      node.master: 'false'
      network.publish_host: elasticsearch-worker
      ES_JAVA_OPTS: -Xms16g -Xmx16g
    volumes:
    - /data/elk/elasticsearch:/usr/share/elasticsearch/data
    links:
    - elasticsearch-master:elasticsearch
```

## 配置 Logstash
Logstash 需要我们进行单独设置来运行 这里我采用了 redis 进行中间缓存

因为 redis 链接是可以加入身份验证的, 如果可以的话在内网环境下也可以直接使用 syslog 之类的方式进行收集日志

下面为我的 logstash.conf 配置文件
```text
input {
    redis {
        data_type => "pattern_channel"
        key => "logstash-*"
        host => "redis"
        password => "password"
        port => 6379
        threads => 1
    }
}

filter {
    json {
        source => "message"
    }
}

output {
    stdout { codec => rubydebug }
    elasticsearch {
        hosts => [ "elasticsearch:9200" ]
        index => "logstash-%{+YYYY.MM.dd}"
    }
}
```

# 使用
