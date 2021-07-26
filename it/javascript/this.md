# 关于 this

## this 的几种绑定规则

### 默认绑定

当函数调用属于独立调用（不带函数引用的调用），无法调用其他的绑定规则，我们给它一个称呼 “默认绑定”

#### 非严格模式调用

在非严格模式下绑定到全局对象。
在浏览器环境下会将 a 绑定到 window.a，以下代码使用`var`声明的变量 a 会输出 1。

```js
function test() {
  console.log(this.a); // 1
}
var a = 1;
test();
```

需要指出的是，如果使用的不是`var`而是`let`或`const`，结果输出 undefined
这里其实涉及到一个顶层对象的概念。
顶层对象（浏览器环境指 window、Node.js 环境指 Global）的属性和全局变量属性的赋值是相等价的，使用`var`和`function`声明的是顶层对象的属性，而`let`就属于 ES6 规范了，但是 ES6 规范中 `let` `const` `class`这些声明的全局变量，不再属于顶层对象的属性。

#### 严格模式调用

在使用了严格模式 (use strict) 下绑定到 undefined。

```js
'use strict';
function test() {
  console.log(this.a); // TypeError: Cannot read property 'a' of undefined
}
var a = 1;
test();
```

### 隐式绑定

在函数的调用位置处被某个对象包含，拥有上下文

```js
function child() {
  console.log(this.name);
}
let parent = {
  name: 'javascript',
  child,
};
parent.child(); // javascript
```

函数在调用时会使用 parent 对象上下文来引用函数 child，可以理解为 child 函数被调用时 parent 对象拥有或包含它。
但隐式调用有一个不好的地方，容易因为因为一些不小心的操作会丢失绑定对象，此时就会应用最开始讲的绑定规则中的默认绑定。

```js
function child() {
  console.log(this.name);
}
let name = 'js';
let parent = {
  name: 'javascript',
  child,
};
let func = parent.child;
func(); // js
```

将 parent.child 函数本身赋给 func，调用 func() 其实是一个不带任何修饰的函数调用，因此会应用默认绑定。

### 显式绑定

需要引用一个对象时进行强制绑定调用，js 有提供`call` `apply`方法，ES5 中也提供了内置的方法 `Function.prototype.bind`。
`call` `apply` 这两个函数的第一个参数都是设置 this 对象，区别是`call`是一个一个传递，而`apply`传递参数是按照数组传递。

```js
function fruit(...args) {
  console.log(this.name, args);
}
var apple = {
  name: '苹果',
};
var banana = {
  name: '香蕉',
};
fruit.call(apple, 'a', 'b'); // 苹果 [ 'a', 'b' ]
fruit.apply(banana, ['a', 'b']); // 香蕉 [ 'a', 'b' ]
```

bind 只是将一个值绑定到函数的 this 上，并将绑定好的函数返回

```js
function fruit() {
  console.log(this.name);
}
var apple = {
  name: '苹果',
};
fruit = fruit.bind(apple);
fruit(); // 苹果
```

除了以上 call、apply、bind 还可以通过上下文 context

```js
function fruit(name) {
  console.log(`${this.name}: ${name}`);
}
const obj = {
  name: '这是水果',
};
const arr = ['苹果', '香蕉'];
arr.forEach(fruit, obj);
// 这是水果: 苹果
// 这是水果: 香蕉
```

### new 绑定

一个构造函数，每一次 new 绑定都会创建一个新对象。

```js
function Fruit(name) {
  this.name = name;
}
const f1 = new Fruit('apple');
const f2 = new Fruit('banana');
console.log(f1.name, f2.name); // apple banana
```

### 优先级

如果 this 的调用位置同时应用了多种绑定规则，它是有优先级的：new 绑定 -> 显示绑定 -> 隐式绑定 -> 默认绑定。

### 箭头函数

箭头函数并非使用`function`关键字进行定义，也不会使用上面所讲解的 this 四种标准规范，箭头函数会继承自外层函数调用的 this 绑定。
执行`fruit.call(apple)`时，箭头函数 this 已被绑定，无法再次被修改。

```js
function fruit() {
  return () => {
    console.log(this.name);
  };
}
var apple = {
  name: '苹果',
};
var banana = {
  name: '香蕉',
};
var fruitCall = fruit.call(apple);
fruitCall.call(banana); // 苹果
```

### this 常见使用问题

#### 通过函数和原型链模拟类

```js
function Fruit(name) {
  this.name = name;
}
Fruit.prototype.info = function () {
  console.log(this.name);
};
const f1 = new Fruit('Apple');
f1.info(); // Apple
const f2 = { name: 'Banana' };
f2.info = f1.info;
f2.info(); // Banana
```

原因是 info 方法里的 this 对应的不是定义时的上下文，而是调用时的上下文，对应的是隐式绑定规则。

#### 原型链上使用箭头函数

如果使用构造函数和原型链模拟类，不能在原型链上定义箭头函数，因为箭头函数的里的 this 会继承外层函数调用的 this 绑定。

```js
function Fruit(name) {
  this.name = name;
}
Fruit.prototype.info = () => {
  console.log(this.name);
};
var name = 'Banana';
const f1 = new Fruit('Apple');
f1.info();
```

两种方式：
node 文件：undefined
在 repl(命令行进入 node)：Banana

#### 在事件中的使用

举一个 Node.js 示例，在事件中使用时，当监听器被调用时，如果声明的是普通函数，this 会被指向监听器所绑定的 EventEmitter 实例，如果使用的箭头函数方式 this 不会指向 EventEmitter 实例。

```js
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {
  constructor() {
    super();
    this.name = 'myEmitter';
  }
}
const func1 = () => console.log(this.name);
const func2 = function () {
  console.log(this.name);
};
const myEmitter = new MyEmitter();
myEmitter.on('event', func1); // undefined
myEmitter.on('event', func2); // myEmitter
myEmitter.emit('event');
```

#### 其他问题
