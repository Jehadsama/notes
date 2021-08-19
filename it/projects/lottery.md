# lottery 抽奖

> 最近重新看了之前做的抽奖项目代码(后端服务)，重新学习一下

## 需求

### 描述

简单地说，实现活动期间，消耗积分/分享可以获得抽奖机会，在一系列限制条件下抽奖

### 限制条件

- 活动时间内

- 用户账号

- 游戏机会来源：

  1. 每天消耗积分可增加 1 次

  1. 微信分享可增加 1 次

- 中奖概率：

  1. 奖品概率

  1. 奖品中奖的时间线分布(这个比较重要!!!)，目前粒度是小时

  1. 上一时间区间的奖品未发完则顺延下一时间区间

  1. 上一天的奖品未发完则顺延下一天

  1. 已中奖则不能再抽中

## 实现

### 数据模型

ps:几个数据模型，这里仅记录一些主要字段

#### 游戏模型

|    字段     |  类型  |   解释   |                       备注                        |
| :---------: | :----: | :------: | :-----------------------------------------------: |
|    name     | string |   名称   |                                                   |
|    code     | string |   代码   |                                                   |
| description | string |   描述   |                                                   |
|   status    | string |   状态   | pending 未开始/start 进行中/end 结束,默认 pending |
| start_time  |  date  | 开始时间 |                                                   |
|  end_time   |  date  | 结束时间 |                                                   |

#### 机会规则模型

|       字段       |  类型   |            解释            |                       备注                        |
| :--------------: | :-----: | :------------------------: | :-----------------------------------------------: |
|       name       | string  |            名称            |                                                   |
|     game_id      | string  |        游戏模型 id         |                                                   |
|      status      | string  |            状态            | valid 有效的 <br> invalid 无效的<br> 默认 invalid |
|       kind       | string  |          机会来源          |           jifen 积分消耗<br> share 分享           |
|   jifen_amount   | number  |        每次消耗积分        |                                                   |
|   jifen_times    | number  |          最大次数          |                                                   |
| jifen_times_unit | string  |        机会次数单位        |                day 天<br> month 月                |
| rule_whole_valid | boolean | 这条规则是否整场活动都有效 |                    默认 false                     |

#### 用户机会模型

|      字段      |  类型  |       解释       |                                                            备注                                                            |
| :------------: | :----: | :--------------: | :------------------------------------------------------------------------------------------------------------------------: |
|    user_id     | string |     用户 id      |                                                                                                                            |
|    game_id     | string |   游戏模型 id    |                                                                                                                            |
| game_chance_id | string | 机会规则模型 id  |                                                                                                                            |
|     status     | string |       状态       | invalid 未购买<br> pending 未使用<br> using 使用中<br> used 已使用<br> epxired 已过期<br> failed 创建失败<br> 默认 invalid |
|   pending_at   |  date  |   机会创建时间   |                                                                                                                            |
|   expired_at   |  date  | 机会被使用后时间 |                                                                                                                            |

#### 奖品模型

|              字段              |  类型  |           解释           |                                                    备注                                                    |
| :----------------------------: | :----: | :----------------------: | :--------------------------------------------------------------------------------------------------------: |
|              name              | string |         奖品名称         |                                                                                                            |
|            game_id             | string |       游戏模型 id        |                                                                                                            |
|             status             | string |           状态           |                              valid 有效的<br> invalid 无效的<br> 默认 invalid                              |
|           start_time           |  date  |         开始时间         |                                                                                                            |
|            end_time            |  date  |         结束时间         |                                                                                                            |
|             power              | number |           权重           |               本奖品的中奖权重。 <br> 如果全部产品权重加起来是 1，那这个就是百分比下的概率了               |
|           rule_total           | number |         总数控制         |                                                0 代表不限制                                                |
|        rule_user_total         | number |     每人中奖次数限制     |                                                    >=0                                                     |
|        rule_daily_total        | number |     每天中奖次数限制     |                                                    >=0                                                     |
|     rule_daily_total_power     | array  |     每小时的奖品权重     |                                                                                                            |
| rule_daily_total_power[].hour  | number |      具体到哪个小时      |                                                    0-23                                                    |
| rule_daily_total_power[].power | number | 具体到哪个小时对应的权重 |                                                默认是 1/24                                                 |
|  rule_daily_total_adjustment   | number |      动态调整的数量      | 在只有总量控制(rule_total>0,rule_daily_total>0)的情况下， <br> 这个地方才会被被调整,作用是动态调整奖品库存 |

#### 中奖记录模型

|      字段      |  类型  |      解释       |                             备注                              |
| :------------: | :----: | :-------------: | :-----------------------------------------------------------: |
|    user_id     | string |     用户 id     |                                                               |
|      name      | string |    奖品名称     |                                                               |
|    game_id     | string |   游戏模型 id   |                                                               |
| user_chance_id | string | 用户机会模型 id |                                                               |
| game_prize_id  | string |   奖品模型 id   |                                                               |
|     status     | string |      状态       | created 刚被创建/delivered 已发放/invalid 不合法,默认 created |
|   start_time   |  date  |    开始时间     |                                                               |
|    end_time    |  date  |    结束时间     |                                                               |
|   prized_at    |  date  |    中奖时间     |                                                               |
|     secret     | string |  奖品密钥之类   |                                                               |

### 思路
