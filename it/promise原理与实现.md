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
