# 加解密模块 crypto

> `crypto`加密模块是 C／C++ 实现这些算法后，暴露为 javascript 接口的模块, 提供了加密功能，其中包括了用于 OpenSSL 散列、HMAC、加密、解密、签名、以及验证的函数的一整套封装。

## 查看系统支持的加密算法

`openssl list -cipher-algorithms`

## Cipher

> Cipher 类用于加密数据，属于对称密钥加密，假设通信双方 A、B 通讯方 A 使用 key 对明文进行加密传输，通讯方 B 接收到密文后，使用同样的 key 进行解密得到明文。

### Cipher 加解密实例演示

注意：crypto.createCipher 已废弃，推荐使用 crypto.createCipheriv

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
