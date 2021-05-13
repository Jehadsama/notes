# nodejs 面试题

1. 解释 setTimeout, setImmediate, process.nextTick 区别

1. 在 Node 下，如何处理 child threads?

1. 在 Node 下， 未捕获的异常怎么处理?

1. 在 Node 下， 回调函数通常第一个参数是什么？

1. 什么是回调地狱，如何解决？/怎么解决 javascript 嵌套回调问题?

1. 编写代码实现，每隔一分钟异步读取一次 file.logs 文件 ，输出文件中的信息。

1. 写出 Math Array String 自带的方法，各五个

1. 给 String,添加一个 getLength()方法，例如 var str ='sss'; str.getLength();，结果为 3。

1. 用 javascript 实现数组去重

1. 说说你对闭包的理解以及闭包的好处

1. session 的原理，客户端禁用 cookie 后怎么使用 session

1. 遍历一个 javascript 对象，例如：`{name:'lucy',age:15}`

1. express 怎么获取 get 和 post 方式的传参？

1. 书写正则表达式，匹配浮点数

1. 下列代码的输出结果是什么？

   ```js
   var User = {
     count: 1,
     getCount: function () {
       return this.count;
     },
   };
   console.log(User.getCount());
   var func = User.getCount;
   console.log(func());
   ```

   答：先输出 1，在输出 undefined

1. 完成一个函数,接受数组作为参数,数组元素为整数或者数组,数组元素包含整数或数组,函数返回扁平化后的数组，例如：`[1, [2, [ [3, 4], 5], 6]] => [1, 2, 3, 4, 5, 6]`

1. 思考下面的代码， 为什么这段代码的运行时间在 chrome 下比在 node.js 环境下需要更多？ 解释原因，即使他们都是用 v8 javascript 引擎。

   ```js
   console.time('loop');
   for (var i = 0; i < 1000000; i += 1) {
     // Do nothing
   }
   console.timeEnd('loop');
   ```
