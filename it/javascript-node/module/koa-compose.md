# koa-compose

## 背景

读了一下 koa 的源码,其中了解到 koa 的中间件机制是通过 koa-compose 实现。koa-compose 的源码非常简短.

## 开始

### 一个简单的 koa 服务

```js
// app.js
const koa = require('koa');
const app = new koa();

app.use(async (ctx, next) => {
  console.log('1');
  next();
  console.log('8');
});

app.use(async (ctx, next) => {
  console.log('2');
  next();
  console.log('7');
});

app.use((ctx, next) => {
  console.log('3');
  next();
  console.log('6');
});

app.use((ctx) => {
  console.log('4');
  ctx.body = 'hello';
  console.log('5');
});

app.listen(3000);
```

node 启动 app.js 后, 发起请求`curl http://127.0.0.1:3000`,命令窗口将打印结果：1 2 3 4 5 6 7 8

### 代码解释

`app.use()` 方法,用来将中间件(其实就是函数)添加到队列中

当有请求时，会按添加的顺序依次触发队列中的中间件

在每个中间件函数中执行 next()函数时,是把控制权交到下一个中间件(实际上是调用 next 函数后,会调用下一个中间件函数)

如果不调用 next()函数,则不能调用下一个中间件函数

### koa 的局部代码

1. `app.use()` 添加中间件

   ```js
   // ...
   use (fn) {
       if (typeof fn !== 'function') throw new TypeError('middleware must be a function!')
       debug('use %s', fn._name || fn.name || '-')
       this.middleware.push(fn)
       return this
   }
   // ...
   ```

1. koa-compose 模块把这个中间件数组合并成一个大的中间件函数

   ```js
   // ...
   const fn = compose(this.middleware);
   // ...
   ```

而这里的 compose 才是本文主要分享的

## compose 源码及注释

koa-compose 源码地址：[https://github.com/koajs/compose/blob/master/index.js](https://github.com/koajs/compose/blob/master/index.js)

```js
'use strict';

/**
 * Expose compositor.
 */
module.exports = compose;

/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param {Array} middleware
 * @return {Function}
 * @api public
 */
// compose函数需要传入一个数组队列 [fn,fn,fn,fn]
function compose(middleware) {
  // middleware不是数组会报错
  if (!Array.isArray(middleware))
    throw new TypeError('Middleware stack must be an array!');
  // middleware数组有一项不是函数会报错
  for (const fn of middleware) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!');
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */
  // compose函数调用后,返回的是以下这个匿名函数
  // 匿名函数第一次调用时候并不需要传入next参数,所以next是undefined,这个匿名函数返回一个promise
  return function (context, next) {
    // last called middleware #
    // 初始化index为-1
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      // i<=index代表执行两次next,会报错,确保在每个中间件中next只能调用一次
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'));

      // 执行一遍next之后,这个index值将改变
      index = i;

      // 获取中间件
      let fn = middleware[i];

      // 当i===数组长度,说明中间件都执行结束,执行结束后把fn设置为undefined
      // TODO:问题：本来middleware[i]如果i为length的话取到的值已经是undefined了,为什么要重新给fn设置为undefined呢？
      if (i === middleware.length) fn = next;

      // 如果中间件遍历到最后了,返回一个成功状态的promise
      if (!fn) return Promise.resolve();

      // 调用后依然返回一个成功的状态的Promise对象
      // 调用中间件,第一个参数传入context,第二个参数是一个next函数,中间件中调用这个next函数
      // 调用next函数后,递归调用dispatch函数,目的是执行下一个中间件
      // next函数在中间件调用后返回的仍然是一个promise对象
      try {
        return Promise.resolve(
          fn(context, function next() {
            return dispatch(i + 1);
          })
        );
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
```

```js
function one(ctx, next) {
  console.log('第一个');
  next(); // 控制权交到下一个中间件（实际上是可以执行下一个函数）
  // next(); // 这一行放开会报错 next() called multiple times
}
function two(ctx, next) {
  console.log('第二个');
  next();
}
function three(ctx, next) {
  console.log('第三个');
  next();
}

const middlewares = compose([one, two, three]);
middlewares().then(function () {
  console.log('队列执行完毕');
});
```

## 结尾

最后附上一张 koa 的洋葱模型图

![koa onion model](https://cdn.jsdelivr.net/gh/Jehadsama/myImages@master/images/koa-onion-model.1a72mq3lkti8.png)
