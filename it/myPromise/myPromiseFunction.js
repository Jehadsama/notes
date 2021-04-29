function myPromise(fn) {
  const self = this;
  self.status = 'pending';
  self.value = undefined;
  self.reason = undefined;

  self.resolveCallbacks = [];
  self.rejectCallbacks = [];

  function resolve(value) {
    self.status = 'resolved';
    self.value = value;
    self.resolveCallbacks.forEach(function (f) {
      f(self.value);
    });
  }

  function reject(reason) {
    self.status = 'rejected';
    self.reason = reason;
    self.rejectCallbacks.forEach(function (f) {
      f(self.reason);
    });
  }

  try {
    fn(resolve, reject);
  } catch (err) {
    reject(err);
  }
}

myPromise.prototype.resolvePromise = function (promise, x, resolve, reject) {
  if (promise === x) {
    throw new Error('promise and x refer to the same object');
  }

  let isCalled = false;

  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          function (y) {
            if (isCalled) return;
            isCalled = true;
            self.resolvePromise(promise, y, resolve, reject);
          },
          function (err) {
            if (isCalled) return;
            isCalled = true;
            reject(err);
          }
        );
      } else {
        if (isCalled) return;
        isCalled = true;
        resolve(x);
      }
    } catch (err) {
      if (isCalled) return;
      isCalled = true;
      reject(err);
    }
  } else {
    resolve(x);
  }
};

myPromise.prototype.then = function (onFulfilled, onRejected) {
  const self = this;
  const promise = new myPromise(function (resolve, reject) {
    switch (self.status) {
      case 'pending':
        self.resolveCallbacks.push(function () {
          try {
            const x = onFulfilled(self.value);
            self.resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        self.rejectCallbacks.push(function () {
          try {
            const x = onRejected(self.reason);
            self.resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        break;
      case 'resolved':
        self.resolvePromise(promise, onFulfilled(self.value), resolve, reject);
        break;
      case 'rejected':
        self.resolvePromise(promise, onRejected(self.reason), resolve, reject);
        break;
      default:
    }
  });
  return promise;
};

module.exports = myPromise;
