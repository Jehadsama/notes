function myPromise(fn) {
  const self = this;
  self.status = 'pending'; // status有三种：pending/resolved/rejected
  self.value = undefined; // resolved状态的值
  self.reason = undefined; // rejected状态的值
  self.onFullfilledArray = [];
  self.onRejectedArray = [];
  const resolve = (value) => {
    // 当且仅单status为pending才能执行，表示状态改变不可以逆
    if (self.status === 'pending') {
      self.status = 'resolved';
      self.value = value;
      self.onFullfilledArray.forEach((f) => {
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
// myPromise.prototype.then = function (onFullfilled, onRejected) {
//   const self = this;
//   switch (self.status) {
//     case 'pending':
//       self.onFullfilledArray.push(onFullfilled);
//       self.onRejectedArray.push(onRejected);
//       break;
//     case 'resolved':
//       onFullfilled(self.value);
//       break;
//     case 'rejected':
//       onRejected(self.reason);
//       break;
//     default:
//   }
// };
myPromise.prototype.then = function (onFullfilled, onRejected) {
  const self = this;
  let promise;
  switch (self.status) {
    case 'pending':
      promise = new myPromise((resolve, reject) => {
        self.onFullfilledArray.push(function () {
          try {
            let temp = onFullfilled(self.value);
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
      self.onFullfilledArray.push(onFullfilled);
      self.onRejectedArray.push(onRejected);
      break;
    case 'resolved':
      promise = new myPromise((resolve, reject) => {
        try {
          const temp = onFullfilled(self.value);
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
  return promise;
};

myPromise.prototype.resolvePromise = (promise, x, resolve, reject) => {
  if (promise === x) {
    throw new Error('promise and x refer to the same object');
  }

  let isCalled = false;
  // x是对象或函数，因为typeof null是object，所以需要排除一下
  if (x != null && (typeof x === 'function' || typeof x === 'object')) {
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          function (y) {
            if (isCalled) return;
            isCalled = true;
            //返回的y有可能是Promise或者普通值，需要继续递归处理
            resolvePromise(promise, y, resolve, reject);
          },
          function (err) {
            if (isCalled) return;
            isCalled = true;
            reject(err);
          }
        );
      } else {
        // 是对象或者函数，但没有thenable，那就直接返回
        resolve(x);
      }
    } catch (err) {
      if (isCalled) return;
      isCalled = true;
      reject(err);
    }
  } else {
    // 那就是普通值了
    resolve(x);
  }
};

const p = new myPromise(function (resolve, reject) {
  //   setTimeout(function () {
  resolve('hello world');
  //   }, 1000);
});
