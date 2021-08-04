# 加解密模块 crypto

> `crypto`加密模块是 C／C++ 实现这些算法后，暴露为 javascript 接口的模块, 提供了加密功能，其中包括了用于 OpenSSL 散列、HMAC、加密、解密、签名、以及验证的函数的一整套封装。

## 查看系统支持的加密算法

`openssl list -cipher-algorithms`

## Cipher

> Cipher 类用于加密数据，属于对称密钥加密，假设通信双方 A、B 通讯方 A 使用 key 对明文进行加密传输，通讯方 B 接收到密文后，使用同样的 key 进行解密得到明文。

### Cipher 加解密实例演示

注意：`crypto.createCipher`已废弃，推荐使用`crypto.createCipheriv`

#### 数据加密

`crypto.createCipheriv(algorithm, pwd, iv)` 指定算法、密码、向量创建 cipher 加密对象

```js
const crypto = require('crypto');
const cipher = crypto.createCipheriv('rc4', '123456', '');
function encrypt(str) {
  /**
   * update方法
   * 第一个参数代表加密的数据
   * 第二参数代表传入数据的格式，可以是'utf8', 'ascii', 'latin1'
   * 第三个参数代表加密数据的输出格式，可以是'latin1'， 'base64' 或者 'hex'。没有执行则返回Buffer
   */
  let encrypted = cipher.update(str, 'utf8', 'hex');
  // final方法，返回任何加密的内容,参数可以是'latin1', 'base64' 或者 'hex'，没有指定返回Buffer
  encrypted += cipher.final('hex');
  return encrypted;
}
encrypt('hello world'); // 689d120b4b1362f30d5b46
```

#### 数据解密

`crypto.createDecipheriv(algorithm, pwd, iv)` 指定算法、密码、向量创建 decipher 解密对象

```js
const crypto = require('crypto');
const decipher = crypto.createDecipheriv('rc4', '123456', '');
function decrypt(encrypted) {
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
decrypt('689d120b4b1362f30d5b46'); // hello world
```

## MD5 加密

> 是让大容量信息在数字签名软件签署私人秘钥前被 “压缩” 成一种保密格式，也就是把一个任意长度的字节串变换成一定长度的十六进制数字串（32 个字符） 一致性验证

全称:message-digest algorithm 5,翻译过来就是:信息、摘要、算法、5。

### 特点与作用

- 长度固定:不管多长的字符串,加密后长度都是一样长

  作用:方便平时信息的统计和管理

- 易计算:字符串和文件加密的过程是容易的.

  作用: 开发者很容易理解和做出加密工具

- 细微性:一个文件,不管多大,小到几 k,大到几 G,你只要改变里面某个字符,那么都会导致 MD5 值改变.

  作用:很多软件和应用在网站提供下载资源,其中包含了对文件的 MD5 码,用户下载后只需要用工具测一下下载好的文件,通过对比就知道该文件是否有过更改变动.

- 不可逆性:你明明知道密文和加密方式,你却无法反向计算出原密码.

  作用:基于这个特点,很多安全的加密方式都是用到.大大提高了数据的安全性

### MD5 实现方式

> 参数 algorithm 可选择系统上安装的 OpenSSL 版本所支持的算法。例如：sha1、md5、sha256、sha512 等。
> 在近期发行的版本中，openssl list-message-digest-algorithms 会显示这些可用的摘要算法。

`crypto.createHash(algorithm)`创建并返回一个 hash 对象，它是一个指定算法的加密 hash，用于生成 hash 摘要。
`hash.update(data)`更新 hash 的内容为指定的 data。当使用流数据时可能会多次调用该方法。
`hash.digest(encoding='binary')`计算所有传入数据的 hash 摘要。参数 encoding（编码方式）可以为 hex、binary、base64。

### MD5 加解密实例演示

```js
const crypto = require('crypto');
const md5 = (str) => crypto.createHash('md5').update(str, 'utf8').digest('hex');
// 尽管输入长度不同,但是输出长度相同
md5('1234567890'); // e807f1fcf82d132f9bb018ca6738a19f
md5('1'); // c4ca4238a0b923820dcc509a6f75849b
```
