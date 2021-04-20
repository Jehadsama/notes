# Elasticsearch

> elasticsearch 是面向文档关系行数据库,一切都是 JSON

## 概念

1. 关系型数据库与 elasticsearch 相关概念

| mysql            | elasticsearch        |
| ---------------- | -------------------- |
| 数据库 databases | 索引 indices         |
| 表 tables        | 类型 types(逐步弃用) |
| 行 rows          | 文档 documents       |
| 字段 columns     | fields               |

## 物理设计

elasticsearch 在后台把每个索引划分为多个分片,每份分片可以在集群中的不同服务器之间迁移
一个服务也是一个集群!

## 分片索引(倒排索引)
