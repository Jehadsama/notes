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

### 1.术语

（1）"promise"是具有 then 方法的对象或者函数

（2）"thenable"是定义 then 方法的对象或者函数（ps：我理解的 thenable 应该是包含 Promise 的，所以有些文章会形容为“有 then 方法且看上去像 Promise”）

（3）"value"是 promise 状态成功时的值，任意合法的 javascript 值（包括 undefined/thenable/promise 等）

（4）"exception"是 使用 throw 语句抛出的一个值

（5）"reason"是 promise 状态失败时的值，表明 promise 被拒绝的原因

### 2.要求

（1）一个 promise 必须有 3 个状态，pending，fulfilled(resolved)，rejected 当处于 pending 状态的时候，可以转移到 fulfilled(resolved)或者 rejected 状态。当处于 fulfilled(resolved)状态或者 rejected 状态的时候，就不可变。

（2）一个 promise 必须有一个 then 方法，then 方法接受两个参数：onFulfilled 方法表示状态从 pending——>fulfilled(resolved)时所执行的方法，而 onRejected 表示状态从 pending——>rejected 所执行的方法。

（3）为了实现链式调用，then 方法必须返回一个 promise

```js
promise2 = promise1.then(onFulfilled, onRejected);
```

**根据已知的信息来逐步实现一个 promise**

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

### 3.then 方法的定义

#### promise 必须提供一个 **then** 方法去访问当前或最终成功的结果或者失败的原因

Promise 的**then**方法接受两个参数：

```js
promise.then(onFulfilled, onRejected);
```

1. **onFulfilled**和**onRejected**都是可选参数，如果不是函数，则将被忽略
1. 如果**onFulfilled**/**onRejected**是一个函数：

   1）此函数在 promise 成功（fulfilled）/失败（rejected）时被调用，并把 promise 的成功值（value）/失败原因（reason）当成它第一个参数

   2）在 promise 成功（fulfilled）/失败（rejected）之前一定不能提前被调用

   3）该函数只执行一次

1. **onFulfilled**和**onRejected**只有在执行上下文 堆栈仅包含平台代码时才可被调用
1. **onFulfilled**和**onRejected**必被作为函数调用（尽管没有**this**值）
1. **then**方法可以被同一个 promise 多次调用，

   1）当 promise 成功时，所有**onFulfilled**回调函数需按照最原始的 then 顺序调用

   2）当 promise 失败时，所有**onRejected**回调函数需按照其对**then**的原始调用顺序执行

1. **then**必须返回一个 promise，这样 promise 才支持链式调用

   ```js
   const promise = new Promise((resolve, reject) => {
     resolve('hello world');
   });
   promise1.then(onFulfilled, onRejected).then(onFulfilled, onRejected);
   ```

   1）如果 **onFulfilled** 或者 **onRejected** 返回一个值 **x**，则运行下面的 Promise 解决过程`[[Resolve]](promise2,x)`

   - 若**x**不是**Promise**,则使**x**直接作为新返回的**Promise**对象的值，即新的**onFulfilled** 或者 **onRejected**函数的参数
   - 若**x**是**Promise**（**thenable**）,这时后一个回调函数就会等待该**Promise**对象（即**x**）的状态发生改变之后才会被调用，并且新的**Promise**的状态和 **x**的状态相同

   ```js
   const promise1 = new Promise((resolve, reject) => {
     resolve('resolved');
   });
   const promise2 = promise1.then(() => {
     return 'This is a common value';
   });
   promise2.then(console.log);
   // output:
   // This is a common value

   const promise1 = new Promise((resolve, reject) => {
     resolve('rejected');
   });
   const promise2 = promise1.then(
     (v) =>
       new Promise((resolve, reject) => {
         resolve('This is a promise');
       })
   );
   promise2.then((v) => {
     console.log(v);
   });
   // output:
   // This is a promise

   const promise1 = new Promise((resolve, reject) => {
     resolve('rejected');
   });
   const promise2 = promise1.then((v) => ({
     then(resolve, reject) {
       resolve('This is a thenable object');
     },
   }));
   promise2.then((v) => {
     console.log(v);
   });
   // output:
   // This is a thenable object
   ```

   2） 如果 **onFulfilled** 或者 **onRejected** 抛出一个异常 **e**，则 **promise2** 必须拒绝执行并返回拒绝原因 **e**

   ```js
   const promise1 = new Promise((resolve, reject) => {
     resolve('resolved');
   });
   const promise2 = promise1.then(
     (v) => {
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

   3） 如果 **onFulfilled** 不是函数且 **promise1** 成功执行，**promise2** 必须成功执行并返回相同的值

   ```js
   const promise1 = new Promise((resolve, reject) => {
     resolve('resolved');
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

   4） 如果 **onRejected** 不是函数且 **promise1** 拒绝执行，**promise2** 必须拒绝执行并返回相同的拒绝原因

   ```js
   const promise1 = new Promise((resolve, reject) => {
     reject('rejected');
   });
   const promise2 = promise1.then(
     (v) => {
       console.log('promise1-then1', v);
     },
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

#### Promise 处理过程

> Promise 处理过程是一个抽象的动作，其需输入一个**promise**和一个值，我们表示为`[[Resolve]](promise,x)`，如果**x**有**then**方法且看上去像一个 Promise（即 thanable 对象），处理程序将以这个**promise**对象的**then**返回值继续传递下去，如果**x**是一个普通值，则用成功的回调传递下去

### version04: then 方法 的 onFullfilled、onRejected 的返回值完善
