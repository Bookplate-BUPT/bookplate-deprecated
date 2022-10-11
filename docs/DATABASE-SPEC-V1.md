# **DB-SPEC-V1**

[toc]

## USERS 用户

| 属性名   | 数据库数据类型 | 是否为空 | 类型    | 备注                   |
| -------- | -------------- | -------- | ------- | ---------------------- |
| _id      | string         | not null | primary | 用户ID                 |
| _openid  | string         | not null |         | 用户设备的唯一标识符   |
| username | string         | not null |         | 用户昵称，可以随意更改 |
| avatar   | string         | not null |         | 用户头像的src          |
| grade    | string         | not null |         | 表示用户的届级         |
| college  | string         | not null |         | 表示用户的学院         |
| major    | string         | not null |         | 表示用户的专业         |



## GOODS 商品

| 属性名              | 数据库数据类型 | 是否为空 | 类型    | 备注                                 |
| ------------------- | -------------- | -------- | ------- | ------------------------------------ |
| _id                 | string         | not null | primary | 商品ID                               |
| _openid             | string         | not null |         | 指卖家的设备                         |
| author              | string         | not null |         | 书本的作者                           |
| price               | number         | not null |         | 商品的价格                           |
| original_price      | number         | not null |         | 书本的原价                           |
| name                | string         | not null |         | 书本的名字                           |
| isbn                | string         | not null |         | 书本的ISBN码                         |
| description         | string         | not null |         | 卖家对商品的描述                     |
| introduction        | string         | not null |         | 书中内容的简介                       |
| image_list          | array          | not null |         | 商品多张图片src的数组                |
| state               | number         | not null |         | 商品的状态，0表示未售出，1表示已锁定 |
| views               | number         | not null |         | 商品的点击量                         |
| favorites           | number         | not null |         | 商品的收藏量                         |
| post_date           | date           | not null |         | 商品的发布时间                       |
| publisher           | string         | not null |         | 书本的出版社                         |
| book_publish_date   | date           | not null |         | 书本的发行时间                       |
| college             | string         | not null |         | 书本适用的学院                       |
| major               | string         | not null |         | 书本适用的专业                       |
| trade_spot          | string         |          |         | 卖家可以交易的地点                   |
| contact_information | string         |          |         | 卖家的联系方式                       |



## TRADE 交易

| 属性名              | 数据库数据类型 | 是否为空 | 类型    | 备注                                                         |
| ------------------- | -------------- | -------- | ------- | ------------------------------------------------------------ |
| _id                 | string         | not null | primary | 交易ID                                                       |
| _openid             | string         | not null | foreign | 买家ID                                                       |
| goods_id            | string         | not null | foreign | 商品ID                                                       |
| seller_openid       | string         | not null | foreign | 卖家ID                                                       |
| trade_time(废除)    | date           | not null |         | 交易时间                                                     |
| trade_price         | string         | not null |         | 交易价格                                                     |
| trade_spot          | string         | not null |         | 交易地点                                                     |
| state               | number         | not null |         | 交易的状态，0表示未完成，1表示待收货，2表示已完成，3表示已取消但用户未读，4表示已取消但用户已读 |
| bookDetail          | object         | not null |         | 存放书籍的详细信息                                           |
| buyer_openid        | string         | not null |         | 存放买家的_openid，用来控制按钮的文案显示、随时取消预订      |
| contact_information | string         |          |         | 买家的联系方式                                               |



## CART 购物车

| 属性名   | 数据库数据类型 | 是否为空 | 类型    | 备注                 |
| -------- | -------------- | -------- | ------- | -------------------- |
| _id      | string         | not null | primary | 购物车ID             |
| _openid  | string         | not null |         | 用户ID               |
| goods_id | string         | not null |         | 商品ID               |
| add_time | date           | not null |         | 商品加入购物车的时间 |



## CHAT 聊天消息

| 属性名    | 数据库数据类型 | 是否为空 | 类型    | 备注                               |
| --------- | -------------- | -------- | ------- | ---------------------------------- |
| _id       | string         | not null | primary | 消息ID                             |
| sender    | string         | not null | foreign | 消息发送者ID                       |
| recipient | string         | not null | foreign | 消息接受者ID                       |
| sendTime  | date           | not null |         | 消息发送时间                       |
| content   | string         | not null |         | 消息内容                           |
| type      | number         | not null |         | 0 为普通文字消息，1 暂定为图片消息 |



## RELATIONSHIP 关系

| 属性名                 | 数据库数据类型 | 是否为空 | 类型    | 备注                                 |
| ---------------------- | -------------- | -------- | ------- | ------------------------------------ |
| _id                    | string         | not null | primary | 关系ID                               |
| _openid                | string         | not null |         | 用户ID                               |
| last_content           | string         | not null |         | 记录聊天中最后一条发送的消息的内容   |
| last_conversation_time | date           | not null |         | 最后一条消息的发送时间               |
| user1                  | string         | not null |         | 用户 1 的 openid                     |
| user2                  | string         | not null |         | 用户 2 的 openid                     |
| last_content_type      | number         | not null |         | 最后一条消息类型                     |
| last_sender            | string         | not null |         | 最后一条消息的发送者 openid          |
| is_readed              | boolean        | not null |         | 最后一次消息是否被接受者阅读         |
| last_send_number       | number         | not null |         | 当一方未读时，其所积累的未读信息条数 |



## HISTORY 浏览历史

| 属性名    | 数据库数据类型 | 是否为空 | 类型    | 备注           |
| --------- | -------------- | -------- | ------- | -------------- |
| _id       | string         | not null | primary | 历史ID         |
| _openid   | string         | not null |         | 用户ID         |
| goods_id  | string         | not null |         | 商品ID         |
| view_time | date           | not null |         | 浏览商品的时间 |


## SEEK 求书

| 属性名       | 数据库数据类型 | 是否为空 | 类型    | 备注                  |
| ------------ | -------------- | -------- | ------- | --------------------- |
| _id          | string         | not null | primary | 消息ID                |
| _openid      | string         | not null |         | 用户ID                |
| author       | string         | not null |         | 书籍作者              |
| imageList    | array          | nullable |         | 商品多张图片src的数组 |
| introduction | string         | nullalbe |         | 书中内容的简介        |
| isbn         | string         | nullable |         | 书本的ISBN码          |
| name         | string         | not null |         | 书本的名字            |
| needs        | string         | nullable |         | 买家对二手书籍的需求  |
| publishDate  | date           | nullable |         | 书本的发行时间        |
| publisher    | string         | nullable |         | 书本的出版社          |

## 注意事项

- 在微信开发者工具中，数据库的数据类型被定义为 `string` , `number` , `boolean` , `null` , `array` , `object` , `date` , `geopoint` ，不存在 `varchar` 等。

