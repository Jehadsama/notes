class myPromise {
  constructor(fn) {
    this.status = 'pending';
    this.reason = undefined;
    this.value = undefined;
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];

    try {
      fn(this.resolve.bind(this), this.reject.bind(this));
    } catch (err) {
      this.reject(err);
    }
  }

  resolve(value) {
    this.status = 'resolved';
    this.value = value;
    this.resolveCallbacks.forEach(function (f) {
      f(value);
    });
  }

  reject(reason) {
    this.status = 'rejected';
    this.reason = reason;
    this.rejectCallbacks.forEach(function (f) {
      f(reason);
    });
  }

  resolvePromise(promise, x, resolve, reject) {
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
              this.resolvePromise(promise, y, resolve, reject);
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
  }

  then(onFulfilled, onRejected) {
    const self = this;
    onFulfilled =
      typeof onFulfilled === 'function'
        ? onFulfilled
        : function (val) {
            return val;
          };
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : function (err) {
            throw err;
          };
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
          self.resolvePromise(
            promise,
            onFulfilled(self.value),
            resolve,
            reject
          );
          break;
        case 'rejected':
          self.resolvePromise(
            promise,
            onRejected(self.reason),
            resolve,
            reject
          );
          break;
        default:
      }
    });
    return promise;
  }
}

module.exports = myPromise;
