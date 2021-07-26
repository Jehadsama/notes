# 关于 this

## this 的几种绑定规则

### 默认绑定

当函数调用属于独立调用（不带函数引用的调用），无法调用其他的绑定规则，我们给它一个称呼 “默认绑定”

#### 非严格模式调用

在非严格模式下绑定到全局对象。
在浏览器环境下会将 a 绑定到 window.a，以下代码使用 var 声明的变量 a 会输出 1。

```js
function test() {
  console.log(this.a); // 1
}
var a = 1;
test();
```

需要指出的是，如果使用的不是`var`而是`let`或`const`，结果输出 undefined
这里其实涉及到一个顶层对象的概念。
顶层对象（浏览器环境指 window、Node.js 环境指 Global）的属性和全局变量属性的赋值是相等价的，使用 var 和 function 声明的是顶层对象的属性，而 let 就属于 ES6 规范了，但是 ES6 规范中 let、const、class 这些声明的全局变量，不再属于顶层对象的属性。

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
