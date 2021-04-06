# docker version for elk

> ps: elasticsearch's version should be equal with kibana

## install

1. [download ik analyzer](https://github.com/medcl/elasticsearch-analysis-ik)
1. mount volumes: plugins
1. environments:

   - Chinese: `i18n.locale:zh-CN`
   - elasticsearch hosts: `elasticsearch.hosts=http://elasticsearch:9300`

1. docker-compose up
