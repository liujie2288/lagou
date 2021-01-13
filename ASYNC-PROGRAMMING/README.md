# Javascript异步编程
---

几乎所有的的`Javascript`执行环境都是采用**单线程**（JS执行环境中负责执行代码的线程只有一个）的方式来执行`Javascript`代码。

采用单线程的方式是因为`Javascript`设计初衷是浏览器端的脚本语言，主要是用来为浏览器添加动态交互（表单验证、动效等）的，动态交互的本质又是`DOM`操作，如果采用多线程方式，当两个线程同时操作相同`DOM`时，不能确定以哪个线程操作为准，所以采用单线程的方式。

但是，单线程的工作方式就意味着所有的`Javascript`执行任务都必须要排队执行，当某一个任务执行时间过长，后面排队的任务就会一直等待，因此可能导致页面卡死等情况。

为了解决这一问题，`Javascript`使用了异步模式，将一些耗时任务（ajax，文件读写等）异步执行（不等待返回结果，代码继续往下执行，执行完成后再告诉主线程执行结果并执行相应回调函数）。

## 异步模式

`Javascript`执行环境将`Javascript`代码调用的API分为同步调用与异步调用，当JS执行到异步API时，会调用其它线程(事件线程、计时器线程等)执行该异步任务，执行完成后将带有执行结果的回调放到JS执行引擎的事件队列中，当主线程任务执行完成后，事件循环将从该事件队列中取出任务继续执行，直到主线程和事件队列中没有任务执行为止。

异步模式为单线程`Javascript`执行环境提供了处理耗时任务的能力。

## 回调函数、事件机制、发布订阅

常见处理异步的方式为回调函数，其变体有事件机制以及发布订阅模式（本质还是回调函数）。

事件机制与发布订阅模式区别：

事件机制：和`Javascript`中`Dom`事件类似，监听者和事件主体绑定，耦合在一起。

发布订阅：监听者和事件主体解偶，通过第三方的事件对象（自定义事件对象类，实现`listen`订阅，`trigger`发布，`remove`取消等功能）联系在这一起。

![img](./事件机制与发布订阅区别.png)

使用回调函数编写异步代码会出现回调地狱等问题，代码不易阅读与维护。因此`ECMAScript`提供了`Promise`、`Generator`、`Async Await`新语法来解决异步代码编写问题。

## Promise

### 定义

`Promise`是用于表示异步操作的最终完成（成功或失败）及其结果值的一个对象。

Promise的三种状态（必然是三种状态之一）

- `pedding`：初始状态，既没有成功，也没有失败
- `fulfilled`：成功状态，执行对应`onFulfilled`回调
- `rejected`：失败状态，执行对应`onReject`回调

Promise的注意事项：

- `then`,`finally`,`catch`会返回一个新的Promise对象，可链式调用。
- 当`Promise`的状态一旦确定后（`fulfilled`或`rejected`），就不能再发生改变。

- `new Promise(fn)`的处理器函数`fn`会同步执行，无论`fn`中是否有异步操作，`promise`的结果处理函数都会异步执行（在当前宏任务完成后，下个宏任务开始前，清空微任务队列）。

### Promise的基本使用

``` javascript
const promise = new Promise(function(resolve,reject){
  // 里面代码同步执行
  // 做一些异步操作，最终会调用下面两者之一
  resolve(value)
  // or
  rejct('error msg') // 或者通过throw 'error msg'
})

promise.then(function(res){
  // 成功执行
  // res为上slove中传递的值
  console.log('resolved',res);
},function(err){
  // 失败执行
  // err为上抛出的值
    console.log('rejectd',err);
})
```

想要某个函数拥有`Promise`功能，只需要返回一个`promise`。

```javascript
function ajax(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";
    xhr.onload(() => {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.statusText);
      }
    });
    xhr.onerror(() => {
      reject(xhr.statusText);
    });
    xhr.send();
  });
}

```

### Promise链式调用

使用`Promise`常见错误是在`then`中串联调用`Promise`生成函数。例如：

```javascript
ajax("/api/users.json").then(res=>{
  ajax("/api/user-info.json").then(res=>{
  	ajax("/api/user-hobby.json").then(res=>{
  		...
		})
	})
})
```

如果同上面方式编写程序，那么就回到了以前通过回调函数来编写异步代码的形式，并没有解决回调地狱问题。

`Promise`提供了链式调用的方式，可以扁平化调用，避免回调嵌套。

1. 调用`then`方法回返回一个全新的`Promise`对象，因此`then`后面还可以继续调用then方法
2. 每个`then`方法是在为它上一个`then`方法返回的`Promise`添加回调
3. 前面then方法中回调函数的返回值将作为后面`then`方法回调的参数
4. `then`方法中返回一个`Promise`，那么当前的`Promise`和返回的`Promise`状态将会一致。后面链式调用的then方法回调会等待返回的Promise结束后执行。（[MDN中Promise.then详细介绍](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)）

例如：

```javascript
ajax("/api/user.json").then(res=>{
  return ajax("/api/user-info.json");
}).then(()=>{
  return ajax("/api/user-hobby.json");
}).then(()=>{
  // 等待/api/user-hobby.json执行
})
```

### Promise异常处理

在`Promise`的处理器函数中产生的异常（throw、代码异常等）都会被该`Promise`注册的失败回调所捕获。

```javascript
new Promise(function(){
    console.log(a)
}).then(()=>{},(err)=>{
  // ReferenceError: a is not defined
  console.log(err)
}) 
```

Promise中产生的异常，会在链条上传递，直到被`onReject`和`catch`捕获，捕获后状态变为`fulfilled`。

`onReject`函数只为当前`Promise`绑定失败处理回调，`catch`可以为当前`Promise`链条指定失败处理函数（更通用）。除此之外，还可以为全局对象添加`unhandledrejection`事件来处理代码中没有被捕获的异常。

```javascript
// 浏览器中
window.addEventListener(
  "unhandledrejection",
  function (e) {
    const { reason, promise } = e;
    console.log(reason, promise);
    // reason  失败原因，一般是一个错误对象
    // promise 出现异常的Promise对象
    e.preventDefault();
  },
  false
);
// Node中
process.on("unhandledRejection",(reason,promise)=>{
  console.log(reason,promise);
})
```

全局捕获异常方式（不推荐），最好的方式是在代码中明确捕获每一个可能的异常。

### Promise静态方法

- `Promise.resolve(value)`：快速将一个值转换为一个`fulfilled`状态的`Promise`对象，`value`将作为该`Promise`返回的值。

  ```javascript
  Promise.resolve('foo').then(value=>{
    console.log(value) // foo
  })
  // 等价于
  new Promise(function(resolve,reject){
    resolve('foo')
  }).then(value=>{
    console.log(value) // foo
  })
  
  // 如果Promise.resolve()接受一个Promise对象，将原样返回传入的Promise对象
  var a = new Promise(function(resolve,reject){
    resolve('foo')
  });
  
  console.log(Promise.resolve(a) === a) // true
  
  // 接受一个有then方法的对象，兼容Promise之前的社区方案，快速将对象转换Promise对象
  Promise.resolve({
    then: (resolve, reject)=>{ 
      resolve("123")
    }
  }).then(res => { 
    console.log(res); // 123
  })
  ```

- `Promise.reject(reason)`：快速返回一个包含`rejected`的Promise对象。

### Promise并行执行

同时调用多个接口来实现并行请求，需要通过设置一个计数器，来确定请求是否都已完成，同时对错误处理不友好。

`Promise`中通过`Promise.all([promise1,promise2...])`方法来监听一组`Promise`的状态，返回一个新的`Promise`对象，只有当里面所有的`Promise`对象都成功时，该`Promise`状态将变为`fulfilled`，返回值是一个按`Promise`传入顺序的结果数组。否则只要有任意一个失败，该`Promise`状态将变为`rejectd`，返回值是第一个触发失败的`Promise`对象中的错误信息。

`Promise`中还提供一个`Promise.race()`方法，用于确定一组`Promise`中，**最快**返回的的那个`Promise`，该方法可用于请求超时控制。例如：

```javascript
const request = ajax("/api/users.json");
const timeout = new Promise(function (resolve, reject) {
  setTimeout(() => {
    reject(new Error("timtout"));
  }, 500);
});
Promise.race([request, timeout]).then(
  (value) => {
    console.log(value);
  },
  (error) => {
    console.log(error); // 当网络慢时，将返回timeout
  }
);
```

### Promise执行时序 / 宏任务、微任务

即使`Promise`处理器函数中没有任何的异步操作，通过`then`方法添加的回调函数也会进入任务队列（微任务队列），等待当前宏任务执行完后，才会被调用执行。

微任务主要用于提高整体的响应能力。API中`Promise`、`MutationObserver`、`Process.nextTick(Node中)`都是微任务API。微任务会在当前宏任务结束后，立即调用执行，微任务执行完后（微任务也可能产生新的微任务，也需要先把新产生的微任务执行完），再调用下一个宏任务，宏任务执行完，再执行当前宏任务产生的微任务，如此循环。

[练习1](https://github.com/fe-jay/lagou/blob/master/ASYNC-PROGRAMMING/04-promise-interviews-1.js) [练习2](https://github.com/fe-jay/lagou/blob/master/ASYNC-PROGRAMMING/05-promise-interviews-2.js)

```javascript
console.log("AAAA");
setTimeout(() => console.log("BBBB"), 1000);
const start = new Date();
while (new Date() - start < 3000) {}
console.log("CCCC");
setTimeout(() => console.log("DDDD"), 0);
new Promise((resolve, reject) => {
  console.log("EEEE");
  foo.bar(100);
})
  .then(() => console.log("FFFF"))
  .then(() => console.log("GGGG"))
  .catch(() => console.log("HHHH"));
console.log("IIII");

// AAAA CCCC EEEE IIII HHHH BBBB DDDD
```

**JS引擎运行原理**

<img src="./event-loop.png" alt="js事件循环"  />

**宏任务与微任务对比**

|          | **宏任务（macrotask）**                                      | **微任务（microtask）**                                      |
| :------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| 谁发起的 | 宿主（Node、浏览器）                                         | JS引擎                                                       |
| 具体事件 | 1. script (可以理解为外层同步代码) <br/>2. setTimeout/setInterval <br/>3. UI rendering/UI事件 <br/>4. postMessage，MessageChannel <br/>5. setImmediate，I/O（Node.js） | 1. Promise<br/>2. MutaionObserver<br/>3. Object.observe（已废弃；`Proxy` 对象替代）<br/>4. process.nextTick（Node.js） |

### [自己实现Promise类](https://github.com/fe-jay/lagou/blob/master/ASYNC-PROGRAMMING/07-promise-realize.js)

## 生成器（Generator）

### 为什么会有生成器

1. 简化了编写迭代器的任务。
2. 生成一系列结果而不是单个值的函数。

通过`for`循环遍历数组，需要追踪下标位置，还要判断循环何时结束。为了简化写法，降低出错几率，ES6引入了新语法`iterator`。

`iterator`表示一种对象，包含`next`方法，调用返回一个`{done:boolean, value:any}`的对象。比如：

```javascript
function createIterator(items) {
  var i = 0;
  return {
    next: function () {
      var done = (i >= items.length);
      var value = !done ? items[i++] : undefined; return {
        done: done,
        value: value
      };
    }
  };
}
 
var iterator = createIterator([1, 2, 3]);
console.log(iterator.next()); // "{ value: 1, done: false }"
console.log(iterator.next());  // "{ value: 2, done: false }"
console.log(iterator.next());  // "{ value: 3, done: false }"
console.log(iterator.next());  // "{ value: undefined, done: true }"
// 后续的所有调用返回的结果都一样

```

如上，只需调用`next`方法，比`for`循环简单一些。

但是手动书写`iterator`相对麻烦，所以ES6提供了`Generator`来快速创建一个`iterator`对象。

### 什么是生成器

生成器是一个返回迭代对象的函数。该函数不同于普通函数，在形式上需要在`function`关键后添加`*`来表示，在结构上，生成器函数一个包含多个状态的状态机。代码如下

```javascript
function* createIterator () {
  // yield声明向外返回的值
  // 外部next调用传入的value
  try {
  	const value = yield 1;
    console.log('外面传入的value',value)
  	yield 2;
  	yield 3;
  } catch(e) {
    console.log(e); 
  }
}
const iterator = createIterator();
console.log(iterator.next()) // {value:1,done:false}
// 继续调用，同时向上次next调用传递返回值
iterator.next("jay")
// 向Gennerator内部抛出一个错误，在内部通过try catch捕获
iterator.throw(new Error('Generator error'))
```

生成器函数调用时，不会立即执行代码体，而是返回了一个可迭代的对象。当调用返回对象的`next`方法，才开始执行。

在函数内部可以通过`yield`关键字，向外返回值。每次调用`next`方法，都会在`yield`处执行停止，下次调用时将继续从该位置往下执行。

## Generator异步编程

`Promise`异步编程方案，可以通过**链式调用**来解决回调函数嵌套的问题。虽然使用`then`的串联调用解决了回调函数嵌套问题，但是还是存在着很多回调函数，相对来说不直观，不简洁，没有达到同步代码那样的可读性。

通过`generator`可以实现以同步的方式，书写异步代码。

```javascript
// Promise和Generator异步编程方式对比

// Promise串联调用
ajax("/api/user/1")
  .then(value=>{
  	return ajax("/api/user/2")
  })
  .then(value=>{
  	return ajax("/api/user/3")
  })
  .catch(error=>{
		console.log(error)
  })

// Generator方式
function* getUser(){
  yield ajax("/api/user/1");
  yield ajax("/api/user/2");
  yield ajax("/api/user/3");
}
const useIterator = getUser();
useIterator.next();
useIterator.next();
```

封装生成器自执行函数：

```javascript
function co (generator){
  const iterable = generator();
  const coWrap = function(result){
    if(result.done) return;
    result.value.then((data)=>{
        coWrap(iterable.next(data))
    },(error)=>{
      iterable.throw(error)
    })
  }
  coWrap(iterable.next())
}

function* getPosts() {
  try {
    const post1 = yield ajax("http://jsonplaceholder.typicode.com/posts/1");
    console.log(post1);
    const post2 = yield ajax("http://jsonplaceholder.typicode.com/posts/2");
    console.log(post2);
  }catch(e){
     console.log(e);
  }
}
co(getPosts);
```

`Generator`异步编程方案，通过扁平化的书写，使得代码更容易理解。

## Async/Await 语法糖

使用`Generator`执行异步编程，需要编写一个执行器函数（`CO`函数）。在`es2017`新增了一个语言层面的原生语法`async/await`，使用更加方便，其工作原理同`generator`相同。

```javascript
// 去掉`*`，用async代替
// 用`await`代替`yield`关键字
async function getPosts() {
  try {
    const post1 = await ajax("http://jsonplaceholder.typicode.com/posts/1");
    console.log(post1);
    const post2 = await ajax("http://jsonplaceholder.typicode.com/posts/2");
    console.log(post2);
  }catch(e){
     console.log(e);
  }
}
```

`async`函数会返回一个`Promise`，返回的`Promise`会等待内部执行完成后状态才被设置。函数内部可以通过`return`或`throw`来确定`Promise`最终返回的结果。

