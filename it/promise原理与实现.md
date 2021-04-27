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

2.要求

（1）一个 promise 必须有 3 个状态，pending，fulfilled(resolved)，rejected 当处于 pending 状态的时候，可以转移到 fulfilled(resolved)或者 rejected 状态。当处于 fulfilled(resolved)状态或者 rejected 状态的时候，就不可变。

（2）一个 promise 必须有一个 then 方法，then 方法接受两个参数：onFulfilled 方法表示状态从 pending——>fulfilled(resolved)时所执行的方法，而 onRejected 表示状态从 pending——>rejected 所执行的方法。

（3）为了实现链式调用，then 方法必须返回一个 promise

```js
promise2 = promise1.then(onFulfilled, onRejected);
```

## 实现一个 Promise

> 只要符合 Promise/A+规范，就是 Promise

### version01: 基础版本

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
myPromise.prototype.then = function (onFulfilled, onRejected) {
  const self = this;
  switch (self.status) {
    case 'resolved':
      onFulfilled(self.value);
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
const promise1 = new myPromise((resolve, reject) => {
  resolve('promise resolved');
});
promise1.then(console.log);

// output:
// promise resolved

const promise2 = new myPromise((resolve, reject) => {
  reject('promise rejected');
});
promise2.catch(console.log);

// output:
// promise rejected
```

测试结果确实是符合预期，在 myPromise 中状态发生改变，然后 then 方法里根据相应状态执行不同逻辑处理。但这个版本的 myPromise 还无法处理异步的 resolve。

```js
const promise = new myPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 1000);
});
promise.then(console.log);
// no output
```

### version02: 基于观察模式实现

为了解决处理异步问题，修改 myPromise，用 2 个数组 onFulfilledArray 和 onRejectedArray 来保存异步的方法。当状态发生改变，一次遍历执行数组中的方法。

```js
function myPromise(fn) {
  const self = this;
  self.status = 'pending'; // status有三种：pending/resolved/rejected
  self.value = undefined; // resolved状态的值
  self.reason = undefined; // rejected状态的值
  self.onFulfilledArray = [];
  self.onRejectedArray = [];
  const resolve = (value) => {
    // 当且仅单status为pending才能执行，表示状态改变不可以逆
    if (self.status === 'pending') {
      self.status = 'resolved';
      self.value = value;
      self.onFulfilledArray.forEach((f) => {
        f(self.value);
      });
    }
  };
  const reject = (reason) => {
    // 当且仅单status为pending才能执行，表示状态改变不可以逆
    if (self.status === 'pending') {
      self.status = 'rejected';
      self.reason = reason;
      self.onRejectedArray.forEach((f) => {
        f(self.reason);
      });
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
myPromise.prototype.then = function (onFulfilled, onRejected) {
  const self = this;
  switch (self.status) {
    case 'pending':
      self.onFulfilledArray.push(onFulfilled);
      self.onRejectedArray.push(onRejected);
      break;
    case 'resolved':
      onFulfilled(self.value);
      break;
    case 'rejected':
      onRejected(self.reason);
      break;
    default:
  }
};
```

通过增加 onFulfilledArray，onRejectedArray 两个数组，在状态发生改变之后再开始执行，确实解决了异步 resolve 无法调用的问题。

这样完成了吗？还没有，Promise/A+规范的最大的特点就是链式调用，也就是说 then 方法的返回也应该是 promise。

### version03: 实现 then 方法的链式调用

为了让 myPromise 的 then 方法支持链式调用，则必须让 then 方法返回 promise。

```js
myPromise.prototype.then = function (onFulfilled, onRejected) {
  const self = this;
  let promise;
  switch (self.status) {
    case 'pending':
      promise = new myPromise((resolve, reject) => {
        self.onFulfilledArray.push(function () {
          try {
            let temp = onFulfilled(self.value);
            resolve(temp);
          } catch (e) {
            reject(e); //error catch
          }
        });
        self.onRejectedArray.push(function () {
          try {
            let temp = onRejected(self.reason);
            reject(temp);
          } catch (e) {
            reject(e); // error catch
          }
        });
      });
      self.onFulfilledArray.push(onFulfilled);
      self.onRejectedArray.push(onRejected);
      break;
    case 'resolved':
      promise = new myPromise((resolve, reject) => {
        try {
          const temp = onFulfilled(self.value);
          resolve(temp);
        } catch (err) {
          reject(err);
        }
      });
      break;
    case 'rejected':
      promise = new myPromise((resolve, reject) => {
        try {
          const temp = onRejected(self.reason);
          reject(temp);
        } catch (err) {
          reject(err);
        }
      });
      break;
    default:
  }
  // 这里记得要把promise 返回出去
  return promise;
};
```

现在再测试一下。

```js
const promise = new myPromise((resolve, reject) => {
  resolve('success');
});
promise
  .then(() => {
    console.log('then 1');
  })
  .then(() => {
    console.log('then 2');
  });
// output:
// then 1
// then 2
```

现在支持 then 链式调用了，但是还有一个问题，就是在 Promise/A+规范中 then 函数里面的 onFulfilled 方法和 onRejected 方法的返回值可以是对象，函数，甚至是另一个 promise。

```js
const promise1 = new Promise((resolve, reject) => {
  resolve('hello world');
});
const promise2 = promise1.then(onFulfilled, onRejected);
```

1. 如果 **onFulfilled** 或者 **onRejected** 返回一个值 **x**，则运行下面的 Promise 解决过程[[Resolve]](promise2,x)

```js
const promise1 = new Promise((resolve, reject) => {
  resolve('resolved');
  // reject('rejected');
});
const promise2 = promise1.then(
  (v) => {
    console.log('promise1-then1', v);
  },
  (v) => {
    console.log('promise1-then2', v);
  }
);
promise2.then(
  (v) => {
    console.log('promise2-then1', v);
  },
  (v) => {
    console.log('promise2-then2', v);
  }
);

// output:
// promise1-then1 resolved
// promise2-then1 undefined

const promise1 = new Promise((resolve, reject) => {
  // resolve('resolved');
  reject('rejected');
});
const promise2 = promise1.then(
  (v) => {
    console.log('promise1-then1', v);
  },
  (v) => {
    console.log('promise1-then2', v);
  }
);
promise2.then(
  (v) => {
    console.log('promise2-then1', v);
  },
  (v) => {
    console.log('promise2-then2', v);
  }
);

// output:
// promise1-then2 rejected
// promise2-then1 undefined
```

2. 如果 **onFulfilled** 或者 **onRejected** 抛出一个异常 **e**，则 **promise2** 必须拒绝执行并返回拒绝原因 **e**

```js
const promise1 = new Promise((resolve, reject) => {
  resolve('resolved');
  // reject('rejected');
});
const promise2 = promise1.then(
  (v) => {
    // console.log('promise1-then1',v);
    throw new Error('promise-then1');
  },
  (v) => {
    console.log('promise1-then2', v);
  }
);
promise2.then(
  (v) => {
    console.log('promise2-then1', v);
  },
  (v) => {
    console.log('promise2-then2', v);
  }
);

// output:
// promise2-then2 Error: promise1-then1

const promise1 = new Promise((resolve, reject) => {
  // resolve('resolved');
  reject('rejected');
});
const promise2 = promise1.then(
  (v) => {
    console.log('promise1-then1', v);
  },
  (v) => {
    throw new Error('promise1-then2', v);
  }
);
promise2.then(
  (v) => {
    console.log('promise2-then1', v);
  },
  (v) => {
    console.log('promise2-then2', v);
  }
);

// output:
// promise2-then2 Error: promise1-then2
```

3. 如果 **onFulfilled** 不是函数且 **promise1** 成功执行，**promise2** 必须成功执行并返回相同的值

```js
const promise1 = new Promise((resolve, reject) => {
  resolve('resolved');
  // reject('rejected');
});
const promise2 = promise1.then(
  '1', // 不是函数就行
  (v) => {
    console.log('promise1-then2', v);
  }
);
promise2.then(
  (v) => {
    console.log('promise2-then1', v);
  },
  (v) => {
    console.log('promise2-then2', v);
  }
);

// output:
// promise2-then1 resolved
```

4. 如果 **onRejected** 不是函数且 **promise1** 拒绝执行，**promise2** 必须拒绝执行并返回相同的拒绝原因

```js
const promise1 = new Promise((resolve, reject) => {
  // resolve('resolved');
  reject('rejected');
});
const promise2 = promise1.then(
  (v) => {
    console.log('promise1-then1', v);
  },
  // (v) => {
  //   throw new Error('promise1-then2', v);
  // }
  '' //不是函数就行
);
promise2.then(
  (v) => {
    console.log('promise2-then1', v);
  },
  (v) => {
    console.log('promise2-then2', v);
  }
);

// output:
// promise2-then2 rejected
```

ps：promise1
