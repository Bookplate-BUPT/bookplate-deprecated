# **DB-SPEC-V1**

[toc]

## USERS 用户

| 属性名   | 数据库数据类型 | 是否为空 | 类型    | 备注                   |
| -------- | -------------- | -------- | ------- | ---------------------- |
| _id      | string         | not null | primary | 用户ID                 |
| _openid  | string         | not null |         | 用户设备的唯一标识符   |
| username | string         | not null |         | 用户昵称，可以随意更改 |
| avatar   | string         | not null |         | 用户头像的src          |
| grade    | string         | not null |         | 表示用户的年级         |
| school   | string         | not null |         | 表示用户的学院         |



## GOODS 商品

| 属性名            | 数据库数据类型 | 是否为空 | 类型    | 备注                                              |
| ----------------- | -------------- | -------- | ------- | ------------------------------------------------- |
| _id               | string         | not null | primary | 商品ID                                            |
| _openid           | string         | not null |         | 指卖家的设备                                      |
| price             | number         | not null |         | 商品的价格                                        |
| original_price    | number         | not null |         | 书本的原价                                        |
| name              | string         | not null |         | 书本的名字                                        |
| isbn              | string         | not null |         | 书本的ISBN码                                      |
| description       | string         | not null |         | 卖家对商品的描述                                  |
| introduction      | string         | not null |         | 书中内容的简介                                    |
| image_list        | array          | not null |         | 商品多张图片src的数组                             |
| state             | number         | not null |         | 商品的状态，0表示未售出，1表示已售出，2表示已下架 |
| views             | number         | not null |         | 商品的点击量                                      |
| favorites         | number         | not null |         | 商品的收藏量                                      |
| post_date         | date           | not null |         | 商品的发布时间                                    |
| book_publish_date | date           | not null |         | 书本的发行时间                                    |



## TRADE 交易

| 属性名     | 数据库数据类型 | 是否为空 | 类型    | 备注                                              |
| ---------- | -------------- | -------- | ------- | ------------------------------------------------- |
| _id        | string         | not null | primary | 交易ID                                            |
| _openid    | string         | not null | foreign | 买家ID                                            |
| goods_id   | string         | not null | foreign | 商品ID                                            |
| trade_time | date           | not null |         | 交易时间                                          |
| state      | number         | not null |         | 交易的状态，0表示未完成，1表示已完成，2表示已取消 |



## CART 购物车

| 属性名   | 数据库数据类型 | 是否为空 | 类型    | 备注                 |
| -------- | -------------- | -------- | ------- | -------------------- |
| _id      | string         | not null | primary | 购物车ID             |
| _openid  | string         | not null |         | 用户ID               |
| goods_id | string         | not null |         | 商品ID               |
| add_time | date           | not null |         | 商品加入购物车的时间 |



## CHAT 聊天消息

| 属性名    | 数据库数据类型 | 是否为空 | 类型    | 备注         |
| --------- | -------------- | -------- | ------- | ------------ |
| _id       | string         | not null | primary | 消息ID       |
| sender    | string         | not null | foreign | 消息发送者ID |
| recipient | string         | not null | foreign | 消息接受者ID |
| send_time | date           | not null |         | 消息发送时间 |



## 注意事项

- 在微信开发者工具中，数据库的数据类型被定义为 `string` , `number` , `boolean` , `null` , `array` , `object` , `date` , `geopoint` ，不存在 `varchar` 等。

