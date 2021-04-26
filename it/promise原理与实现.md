# Promise 原理与实现

## 什么是 Promise

Promise 与其链式调用方式，令“callback hell”问题得以解决，尤其是在异步过程中，使用 Promise 可以保证代码的整洁性以及可读性。这里基于 Promise/A+规范实现一个 Promise。

目前主流的浏览器基本已经支持 Promise,使用方式如下：

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 1000);
  console.log('create a promise');
});

promise.then((value) => {
  console.log(value);
});

// output：
// create a promise
// success
```

从例子中可以看出，Promise 方便了异步操作处理。另外，Promise 还支持链式调用：

```js
const promise = new Promise((resolve, reject) => {
  resolve();
});
promise.then(...).then(...).then(...)
```

Promise 还支持 resolve，all，race 等方法。

## Promise/A+规范

Promise/A+规范扩展了早期的 Promise/A proposal 提案。
[Promise/A+规范（英文版）](https://promisesaplus.com/)
[Promise/A+规范（中文版）](https://promisesaplus.cn/)

1.术语
（1）"promise"是一个对象或者函数，该对象或者函数有一个 then 方法

（2）"thenable"是一个对象或者函数，用来定义 then 方法

（3）"value"是 promise 状态成功时的值

（4）"reason"是 promise 状态失败时的值

我们明确术语的目的，是为了在自己实现 promise 时，保持代码的规范性（也可以跳过此小节）

2.要求
（1）一个 promise 必须有 3 个状态，pending，fulfilled(resolved)，rejected 当处于 pending 状态的时候，可以转移到 fulfilled(resolved)或者 rejected 状态。当处于 fulfilled(resolved)状态或者 rejected 状态的时候，就不可变。

promise 英文译为承诺，也就是说 promise 的状态一旦发生改变，就永远是不可逆的。

（2）一个 promise 必须有一个 then 方法，then 方法接受两个参数：

promise.then(onFulfilled,onRejected)
其中 onFulfilled 方法表示状态从 pending——>fulfilled(resolved)时所执行的方法，而 onRejected 表示状态从 pending——>rejected 所执行的方法。

（3）为了实现链式调用，then 方法必须返回一个 promise

```js
promise2 = promise1.then(onFulfilled, onRejected);
```

## 实现一个 Promise

> 只要符合 Promise/A+规范，就是 Promise

version01: 基础版本

```js
function myPromise(fn) {
  const self = this;
  self.status = 'pending'; // status有三种：pending/resolved/rejected
  self.value = undefined; // resolved状态的值
  self.reason = undefined; // rejected状态的值
  const resolve = (value) => {
    // 当且仅单status为pending才能执行，表示状态改变不可以逆
    if (self.status === 'pending') {
      self.status = 'resolved';
      self.value = value;
    }
  };
  const reject = (reason) => {
    // 当且仅单status为pending才能执行，表示状态改变不可以逆
    if (self.status === 'pending') {
      self.status = 'rejected';
      self.reason = reason;
    }
  };
  // 这里需要针对构造异常的情况catch error
  try {
    fn(resolve, reject);
  } catch (err) {
    reject(err);
  }
}
// myPromise的原型上定义链式调用的then方法
myPromise.prototype.then = function (onFullfilled, onRejected) {
  const self = this;
  switch (self.status) {
    case 'resolved':
      onFullfilled(self.value);
      break;
    case 'rejected':
      onRejected(self.reason);
      break;
    default:
  }
};

//========================
// todo: class 版本待实现
// class myPromise {
//   constructor(fn) {
//     this.status = 'pending'; // status有三种：pending/resolved/rejected
//     this.value = undefined;
//     this.reason = undefined;
//   }
//   resolve(value) {
//     if (this.status === 'pending') {
//       this.status = 'resolved';
//       this.value = value;
//     }
//   }
//   reject(reason) {
//     if (this.status === 'pending') {
//       this.status = 'rejected';
//       this.reason = reason;
//     }
//   }

//   try{
//       fn(resolve,reject);
//   }catch(err){
//       reject(err)
//   }
// }
```

让我们测试一下。

```js
const promise1 = new Promise((resolve, reject) => {
  resolve('promise resolved');
});
promise1.then(console.log);

// output:
// promise resolved

const promise2 = new Promise((resolve, reject) => {
  reject('promise rejected');
});
promise2.catch(console.log);

// output:
// promise rejected
```

测试结果确实是符合预期，在 myPromise 中状态发生改变，然后 then 方法里根据相应状态执行不同逻辑处理。但这个版本的 myPromise 还无法处理异步的 resolve。

```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 1000);
});
promise.then(console.log);
```
