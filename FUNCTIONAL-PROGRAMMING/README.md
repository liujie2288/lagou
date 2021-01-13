
[TOC]

# 函数式编程（Functional Programming）

------

## 为什么要使用函数式编程

- 现在流行库（`react`，`vue`，`lodash`，`udnerscroe`，`ramda`等）对函数式编程友好
- 函数式编程可以忽略`javascript`中`this`问题
- 打包时可以利用`tree shaking`过滤无用代码
- 方便测试，方便并行处理，可读性好，易维护，代码更简洁
- 有很多库帮助我们进行函数式开发[lodash](https://www.lodashjs.com/)，[underscore](https://underscorejs.net/)，[ramda](https://ramda.cn/)，[folktale](https://folktale.origamitower.com/)

## 什么是函数式编程

函数式编程是一种**编程范式**，一种如何编写程序的方法论。类似于面向过程编程、面向对象编程。

**面向过程编程**：按照步骤一步步实现功能。

**面向对象编程**：将现实世界事物，抽象成程序世界中的类和对象，再通过封装、继承、多态来表示事物与事物之间的联系。

**面向函数编程**：对运算过程进行抽象。

**注意**

- **函数式编程中的函数不是指程序中的函（方）数（法）**，而是数学中的函数，表示一种映射关系，例如: y = sin(x)，x与y的关系。（程序中的函数是函数编程的具体应用）
- [**函数式编程关心数据的映射，命令式编程关心解决问题的步骤**](https://www.zhihu.com/question/28292740?sort=created)。

``` javascript
// 非函数式 (面向过程编程)
let num1 = 2;
let num2 = 3;
let sum = num1 + num2;
console.log(sum)

// 函数式编程(对求和的运算过程抽象封装，方便复用)
function getSum(num1,num2){
  return num1 + num2;
}
console.log(getSum(1,2))
```

## 前置知识

在使用函数式编程过程中，会基于几个前置的概念，"函数是一等公民"、"高阶函数"、"闭包"。

### 函数是一等公民（First Class）

> [当一门编程语言中的函数可以被当作变量来使用时，我们称该门语言拥有头等函数](https://developer.mozilla.org/zh-CN/docs/Glossary/First-class_Function)。

所谓"一等公民"，指的是函数和其它数据类型一样，处于平等地位。

在`javascript`中**函数就是一个普通的对象**，可以把函数存储在变量/数组中，还可以作为函数的参数和返回值，甚至在程序运行时通过`new Function('alert(1)')`来构建新的函数。

**特点**

- 函数可以存储在变量中

  ``` javascript
  // 把函数赋值给变量
  let fn = function () {
    console.log("函数是一等公民")
  }
  fn();
  
  // bad
  // 这里使用了一个间接函数包裹，徒增了代码量，提高了维护和检索代码成本。
  httpGet('/post/2', json => renderPost(json));
  // 如果一个函数被不必要的包裹起来，那么当该函数发生改动，包裹函数也会相应变更
  // eg: httpGet可能抛出一个err异常，那么相应改动
  httpGet('/post/2', (json,err) => renderPost(json,err));
  
  // better
  // 写成一等公民函数的形式，要做的改动将会少得多
  httpGet('/post/2', renderPost);
  ```

- 函数可以被当作参数

- 函数可以作为返回值

### 高阶函数（Higher-order function）

定义：可以接受一个或多个函数作为参数的函数，或者可以返回一个函数的函数，我们称为"高阶函数"。比如`map`、`reduce`、`forEach`函数。

**函数作为参数：**

``` javascript
// forEach实现
function myForEach(arr, cb) {
  for (let i = 0; i < arr.length; i++) {
    cb(arr[i], i, arr);
  }
}

// filter实现
function myFilter(arr, cb) {
  let results = [];
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (cb(item, i, arr)) {
      results.push(item);
    }
  }
  return results;
}
```

函数作为参数可以使调用函数更灵活，同时也隐藏了函数内部细节。

**函数作为返回值：**

``` javascript
function makeFn () {
  let msg = "hello higher-order function";
  return () => {
    console.log(msg)
  }
}

function once (cb) {
  let isDone = false;
  return (...args)=>{
    if(!isDone){
      isDone = true;
      return cb.apply(null,args);
    }
  }
}
```

函数作为返回值形成**闭包**，可以在外部作用域访问内部作用域的变量对象，延长内部作用域的挂载时间。

使用高阶函数的意义：

- 抽象可以帮我们屏蔽细节，只需要关注于我们的目标。
- 高阶函数是用来抽象通用的问题，比如`forEach`是对遍历数组的抽象。
- 代码量减少，更清晰，易维护

``` javascript
// 面向过程的方式
// 需要自己维护管理循环相关变量
let arr = [1,2,3];
for(let i=0;i<arr.length;i++){
  console.log(arr[i])
}
// 高阶函数方式
// 屏蔽了内部实现细节，使用时候只需要关注我们的实现
// 同时这也使得函数更灵活，可以用来解决一类问题，比如: forEach、filter、map等
let arr = [1,2,3];
forEach(arr,(item)=>{console.log(item)}
```

常用高阶函数模拟实现：[代码示例](https://github.com/fe-jay/lagou/blob/master/FUNCTIONAL-PROGRAMMING/01-array-method.js)

### 闭包（Closure）

**定义**：**<u>闭包就是</u>**能够读取其它函数内部变量的**<u>函数</u>**。可以理解为"定义在一个函数内部的函数"。在本质上，闭包是将函数内部与外部联系起来的桥梁。

[形成闭包的基础在于`javascript`中词法作用域和函数是一等公民](https://www.zhihu.com/question/34210214/answer/93590294)。

形成闭包的原因在于函数执行后，内部的函数对该函数中的活动对象依然存在引用，导致该函数中的活动对象一直保存在内存中不能被销毁。

**用途**：

1. 可以读取函数内部的变量
2. 让这些变量的值保存在内存中（默认函数执行完后将会销毁内部活动对象，同时弹出调用栈）

案例：

<img src="./closure.png" alt="closure" style="zoom:50%;" />



## 纯函数

### 什么是纯函数

**相同的输入永远会得到相同的输出**，没有任何<u>可观察</u>的**<u>副作用</u>**。

纯函数类似数学中的函数，用来描述输入与输出的关系。例如：y=f(x)。

<img src="./pure-function.png" alt="函数映射关系" style="zoom:50%;" />

示例：

``` javascript
// ---- 示例1 ----
var arr = [1,2,3,4];
// 纯函数，每次结果都一样
console.log(arr.slice(0,3))
console.log(arr.slice(0,3))
// 不纯函数，每次结果不一样
console.log(arr.splice(0,3))
console.log(arr.splice(0,3))
// ---- 示例2 ----
var minimun = 20;
// 不纯的，相同的输入不一定得到相同的输出，依赖于外部变量
var checkNum  = function(num){
  return num > minimun;
}
// 纯的，不依赖外部，相同输入都能得到相同输出
var checkNum = function(num){
  // 这是是硬编码，后续可通过柯里化解决
  let minimun = 21;
  return checkNum > minimun;
}
```

### 可观察

比如`slice`和`splice`,`slice`相同的输入就会返回相同的输出，但是splice每次都会改变原数组，这就产生了可观察的副作用，即这个数组永久的改变了。

### 副作用

"作用"可以理解为一切除结果计算之外发生的事情，"副作用"是指在计算过程中，系统状态的一种变化，或者与外部环境发生的可观察交互。

所有的外部交互都有可能出现副作用，副作用使得函数的通用性下降，不适合扩展和重用。同时副作用会给程序带来安全隐患（获取用户输入可能会带来跨站脚本攻击等等），不确定性。

比如：

- 更改文件系统
- 往数据库插入记录
- 发送一个HTTP请求
- 可变数据
- 打印/log
- 获取用户输入
- DOM查询
- 访问系统状态
- ...

### 纯函数的好处

1. 可缓存：相同输入都会有相同输出，那么可以根据输入来缓存结果，避免没必要的运算。
2. 自文档化：纯函数依赖明确，内部需要的状态都可通过参数传递，因此更易于观察和理解。
3. 可移值：纯函数与业务逻辑解耦，可在多个项目中重复使用。
4. 可测试：针对输入和输出可以方便的使用单元测试断言结果，不需要在配置函数/功能所以依赖的环境。
5. 透明性：可以将一段纯函数的调用直接替换为结果，而不会影响整个程序的运行。
6. 可并行：在多线程的环境下并行操作共享内存可能会出现意外情况，纯函数不需要访问共享内存，可以并行运行纯函数（web worker）。

### 总结

在程序开发中，纯函数给我们带来了许多好处，但是程序开发中也不能完全避免副作用（比如获取用户输入的账号密码），所以需要尽量将副作用控制在可控范围内。

## 柯里化（Curry）

### 什么是柯里化

当一个函数有多个参数，可以先传递部分参数（这部分参数以后永远不变），然后返回一个接受部分或者全部参数的函数，直到传递所有参数后返回结果。

```javascript
const checkAge = function(min){
  return (age)=>{
    return age > min;
  }
}
// 箭头函数简写形式
const checkAge = min => age => age > min;

const checkAge18 = checkAge(18);
const checkAge22 = checkAge(22);
console.log(checkAge18(22))
console.log(checkAge22(22))
```

函数柯里化可以将一个多元函数最终转换为一个一元函数，方便函数组合。

### 柯里化案例

```javascript
const _ = require("lodash");

// 通过闭包简单实现函数参数的缓存
function match(reg) {
  return (str) => {
    return str.match(reg);
  };
}

// 通过lodash中curry函数可实现任意数量参数缓存
const curryMatch = _.curry((reg, str) => {
  return str.match(reg);
});

// 调用函数返回了一个具有特定功能的新函数
const hasSpace = match(/\s+/g);
const hasSpace1 = curryMatch(/\s+/g);
const hasNumber = match(/\d+/g);
const hasNumber1 = curryMatch(/\d+/g);

console.log(hasSpace("sdf adf"));
console.log(hasSpace1("sdf adf"));
console.log(hasNumber("12agc"));
console.log(hasNumber1("12agc"));

// 通过func来抽离公用filter逻辑
function filter(func, arr) {
  return arr.filter(func);
}

// 将函数柯里化
const filterCurry = _.curry(filter);

// 通过curry预设filter筛选空白字符函数
// 复用了hasSpace1逻辑
const findSpace = filterCurry(hasSpace1);

console.log(findSpace(["a", "a b", "a c"]));

```

### 自己实现一个柯里化函数

``` javascript
function myCurry(fn) {
  return function inner(...args) {
    if (args.length >= fn.length) {
      return fn.apply(fn, args);
    } else {
      return inner.bind(inner, ...args);
    }
  };
}
```

### 总结

1. 柯里化可以给一个函数传递部分参数，然后返回了一个记住了这些参数的新函数。
2. 这是一种对函数参数的缓存。
3. 让函数变得更灵活，让函数的粒度更小。
4. 可以把多元函数转换为一元函数，可以组合使用函数产生更强大的函数。

## 函数组合（Compose）

纯函数和柯里化容易写出嵌套代码。比如，获取数组最后一个元素，去除前后空格后转换为大写：`_.toUpper(_.trim(_.last(arr)))`。

### 什么是函数组合

如果一个函数要经过多个函数处理才能得到最终结果，这时可以把中间过程的函数合并成一个函数。

-  函数就像是数据的管道，函数组合就是把这些管道连接起来，让数据穿过多个管道形成最终结果
- **函数组合默认时从右向左执行**

``` javascript
// x,y是函数，value就是在他们之间传输的值
// compose可以组合任意函数
function compose(x,y){
  return (value)=>{
    return x(y(value))
  }
}

function trim(str){
  return str.trim()
}
function toUpper(str){
  return str.toUpperCase()
}

// 多个函数组合生成一个新的函数
const newFn = compose(toUpper,trim);
console.log(newFn(' ha ha  '));
```

Lodash中的组合函数

```javascript
const _ = require("lodash");

const first = (arr) => arr[0];
const reverse = (arr) => arr.reverse();
const toUpper = (str) => str.toUpperCase();

const fn = _.flowRight(toUpper, first, reverse);
console.log(fn(["one", "two", "three"]));
```

### 自己实现一个compose函数

```javascript
function flow(...fns) {
  return (isRight = true) => {
    return (...args) => {
      fns = isRight ? fns.reverse() : fns;
      return fns.slice(1).reduce((prev, item) => {
        return item(prev);
      }, fns[0](...args));
    };
  };
}
const first = (arr) => arr[0];
const reverse = (arr) => arr.reverse();
const toUpper = (str) => str.toUpperCase();

const fn = flow(reverse, first, toUpper)(false);
const fnRight = flow(toUpper, first, reverse)();
console.log(fn(["one", "two", "three"]));
console.log(fnRight(["one", "two", "three"]));
```

### 结合律

函数的组合满足结合律

``` javascript
compose(compose(f,h),g) === compose(f,compose(h,g)) === compose(f,h,g)
```

### 调试（debug）

使用函数组合后，执行的结果得不到预期，可以通过自定义一个函数来调试，打印中间结果。

``` javascript
function trace(tag,value){
  console.lgo(tag,value)
  return value
}

let fn = compose(f,trace('g执行后的结果'),g,trace('g执行后的结果'),h);
fn(1,2,3);
```

### lodash/fp模块

lodash/fp模块中提供实用的对**函数编程友好**的方法，同时自动柯里化，遵循迭代器优先，数据置后原则（和lodash相反），方便函数组合。

  ```javascript
const _ = require('lodash');
const fp = require('lodash/fp');

_.map([1,2,3],function(item){
	console.log(item)      
})

// 自动柯里化，数据置后
const mapCurry = fp.map((item)=>{console.log(item)});
mapCurry([4,5,])
  ```

### Point Free

定义：我们可以把数据处理的过程定义成与数据无关的合成运算，不需要用到代表数据的那个参数，只要把简单的运算步骤合在一起，在使用这种模式之前我们需要定义一些辅助的基本函数。

- 不需要指明处理的数据
- 只需要合成运算过程
- 需要定义一些辅助的基本函数

案例演示（将`Hello World => hello_world`）

```javascript
// 非point free,因为提到了数据word
function f(word){
  return word.toLowerCase().replace(/\s+/g,'_');
}

// point free
const fp = require('lodash/fp');
// 定义这个函数不需要指明所需要处理的数据
const f = fp.flowRight(fp.replace(/\s+/g,'_'),fp.toLower);
console.log(f('Hello World'));
```

point free模式的函数中，不需要`word`参数就能构造函数。在非point free版本中，需要要有word才能进行一切操作。

函数式编程的核心就是把运算过程抽象成函数，point free就相当于把这些抽象函数再合成一个新的函数，这个合成的过程又是一个抽象的过程，在这个抽象过程中，我们不需要关心数据。

**参考链接**

- [函数式编程指北-pointfree](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch5.html#pointfree)
- [Pointfree 编程风格指南](http://www.ruanyifeng.com/blog/2017/03/pointfree.html)

## 函数式编程示例应用

### 声明式代码

不再指示计算机如何工作（命令式编程），而是指出我们明确希望得到的结果。

与命令式不同，声明式意味着我们要写表达式，而不是一步步的指示。

示例：

```javascript
var cars = [{name:'benz'},{name:'bmw'},{name:'audi'}]
// 命令式
var names = [];
for(var i = 0; i< cars.length; i++){
  names.push(cars[i].name)
}
// 声明式
var names = cars.map(item=>item.name);
```

`map`函数隐藏循环实现细节，开发者不用关心循环怎么实现，而是关心用循环要去做的事情。

相比于命令式，声明式更强调***做什么***，而不是***怎么做***。

比如我们要从[flickr](https://www.flickr.com/)上获取获取图片展示在页面上。具体要做的事情：

1. 构建搜索关键字URL
2. 请求filckr
3. 把返回的数据转为html图片
4. 把图片显示放到屏幕上

``` javascript
// 将不纯的操作单独封装
var Impure = {
  getJSON: _.curry(function(callback, url) {
    $.getJSON(url, callback);
  }),

	setHtml: _.curry(function(sel, html) {
    $(sel).html(html);
  })
};

// 构建IMG对象
var img = function (url) {
  return $('<img />', { src: url });
};

////////////////////////////////////////////

// 构造URL
var url = function (t) {
	return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' + t + '&format=json&jsoncallback=?';
};

// 取值，获取对象属性
var mediaUrl = _.compose(_.prop('m'), _.prop('media'));
var srcs = _.compose(_.map(mediaUrl), _.prop('items'));
// 构建图片对象数组
var images = _.compose(_.map(img), srcs);
// 渲染图片到页面中
var renderImages = _.compose(Impure.setHtml("body"), images);
// 组合上面操作
var app = _.compose(Impure.getJSON(renderImages), url);
// 开始执行
app("cats");
```

具体实现可参考[函数式编程指北](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch6.html#%E4%B8%80%E4%B8%AA%E5%87%BD%E6%95%B0%E5%BC%8F%E7%9A%84-flickr)。

### 总结

函数式编程，即通过管道把数据在一系列的纯函数中传递的程序，这些程序就是声明式的行为规范。

## 函子（Functor）

### 为什么要学函子

函子可以解决函数式编程中，控制流、异常处理、异步操作、副作用等问题。

函数式编程的运算不直接操作值，而是由函子完成。

### 什么是函子

函子是一个特殊的容器（包含值和值的变形关系 — 函数），通过一个对象来实现，该对象有`map`方法，可以运行一个函数对值就行处理。

示例：

```javascript
class Container(){
  // 避免使用new来创建对象，尽量避免带入面向对象思想
  static of(value) {
    return new Container(value);
  }
  constructor(value){
    // 内部维护，不对外暴露
    this._value = value
  }
  // 对外暴露处理值的方法，接收函数处理内部的值
  map(fn){
    return Container.of(fn(this._value));
  }
}
Container.of(10).map(value=> value + 10);
```

把值装进一个容器，而且只能使用 `map` 来处理它，这么做的理由是什么？或者说，让容器自己去运用函数能给我们带来什么好处？

是抽象，对于函数运用的抽象。当 `map` 一个函数的时候，我们请求容器来运行这个函数。

总结

- 函数式编程运算不直接操作值，而是由函子完成
- 函子就是实现了`map`契约的对象
- 可以把函子想象成一个盒子，这个盒子里面封装了一个值
- 想要处理盒子中值，我们可以给盒子`map`方法传递一个处理值的函数
- 最终`map`方法返回一个包含新值的函子

### Point函子

实现了`of`静态方法的函子，上面的示例中实现了该方法。`of`方法是为了避免使用`new`来创建对象，更深层的含义是将值放到一个上下文Context中。（把值放到容器中，使用map来处理值）

### MayBe函子（处理异常）

通过函子对值进行处理的时候，很容易传人一个空值，导致后面程序异常。

MayBe函子就是在Container函子的基础上，添加一层为空值的判断。外部传入空值，可以认为是一种副作用，maybe函子可以解决这种副作用。

示例：

```javascript
class MayBe{
  static of(value){
    return new MayBe(value)
  }
  constructor(value){
    this._value = value
  }
  map(fn){
    return MayBe.of(this._value?fn(this._value):null)
  }
}

// 报错，异常
console.log(Container.of(null).map((item) => item.toUpperCase()));
// 正常执行，返回`null`
// 这里的`null`不一定是手动传入，可能是在程序执行中传入了一个`null`的结果
console.log(MayBe.of(null).map((item) => item.toUpperCase()));

```

在MayBe函子中，我们很难确认是哪一步产生的空值的问题，比如

```javascript
MayBe.of('hello world')
			.map(value=>value.toUpperCase())
			.map(value=>null)
			.map(value=>value.splice(" "));
// => MayBe { _value: null }
```

### Either函子（异常处理）

Either函子类似于if...else..的处理，可以用来做异常处理。

``` javascript
class Left {
  static of(value) {
    return new Left(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return this;
  }
}

class Right {
  static of(value) {
    return new Right(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return Right.of(fn(this._value));
  }
}

// Either函子来处理解析异常
function parseStr(str) {
  try {
    return Right.of(JSON.parse(str));
  } catch (error) {
    return Left.of({ err: error.message });
  }
}

console.log(parseStr("{name:'jay'}").map((item) => item.name.toUpperCase()));
// Left { _value: { err: 'Unexpected token n in JSON at position 1' } }
console.log(parseStr('{"name":"jay"}').map((item) => item.name.toUpperCase()));
// Right { _value: 'JAY' }
```

### IO函子（副作用控制）

IO函子中的`_value`是一个函数，可以把不纯的动作存储到`_value`中，延迟执行这个不纯的操作（惰性执行），把不存的操作交给调用者来处理。

```javascript
const fp = require("lodash/fp");
// IO函子
class IO {
  // 接收一个值,包装到函数中，延迟执行
  static of(value) { 
    return new IO(function () { 
      return value;
    })
  }
  //期望接收一个函数来处理不纯的操作
  constructor(fn) {
    this._value = fn;
  }
  map(fn) { 
    // 注意这里没有调用of方法
    // 而是通过将传入的fn和value组合成一个新的函数，而不是调用函数
    // 最终延迟调用执行，将不纯的操作交给调用者来执行
    return new IO(fp.flowRight(fn, this._value));
  }
}

let io = IO.of(process).map(item => item.execPath);
console.log(io);
// IO { _value: [Function] }
console.log(io._value())
// /Users/Jay/.nvm/versions/node/v12.18.3/bin/node
// 返回启动 Node.js 进程的可执行文件的绝对路径名（根据自身电脑安装nodejs路径决定）
```

### Task函子（异步控制）

异步任务，避免回调地狱，可以使用Task函子。因为`Task`函子相对复杂，这里将使用[`folktale`](https://folktale.origamitower.com/)中的Task来演示。

> `folktale`是一个标准的函数式编程库，没有提供很多类似`lodash`的功能函数，只提供了一些函数式处理的操作。例如`compose`、`curry`等，一些函子`Task`，`Maybe`，`Either`等

`folktale`使用示例：

```javascript
const { compose, curry } = require("folktale/core/lambda");
const { toUpper, first } = require("lodash");

// 第一个是参数数量和lodash不同
// 这个参数应该是folktale用来判断继续返回函数还是返回结果的标识
const getSum = curry(2, function (a, b) {
  return a + b;
});

console.log(getSum(1)(3));

const f = compose(toUpper, first);

console.log(f(["jay", "smith"]));
```

使用`folktale`中的`task`函子获取`packjson`中的`version`数据

``` javascript
const { task } = require("")
```

### Monad函子

在使用IO函子时容易得到嵌套的函子，这样在延迟调用时候，需要一层层调用函子中`_value`属性对应的函数。比如

```javascript
const fs = require('fs')
const fp = require('lodash/fp')
let readFile = function (filename) { 
  return new IO(function() {
    return fs.readFileSync(filename, 'utf-8') 
  })
}
let print = function(x) { return new IO(function() {
  console.log(x)
  return x })
}
// IO(IO(x))
let cat = fp.flowRight(print, readFile)
// 调用
let r = cat('package.json')._value()._value();
console.log(r)
```

一个函子如果具有`join`和`of`两个方法并遵守一些定律就是一个`Monad`函子，`Monad`函子可以变扁平。

