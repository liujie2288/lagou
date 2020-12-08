// === 自己实现一个Promise类 ===

// 问题1: 如何隐藏这些实例属性
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  status = PENDING;
  value = undefined;
  onResolvedArr = [];
  onRejectedArr = [];
  constructor(exector) {
    // 捕获执行器中的错误，如有错误，该Promise将直接返回reject，同时将抛出的错误作为拒绝状态的回调函数参数值
    try {
      // `new`时候立刻执行该执行器，并传入内部改变状态的方法
      exector(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }
  // 因为该方法要传递给外部调用，所以需要绑定`this`
  // 可使用 bind，或者如下使用箭头函数（方便，简单，更推荐）
  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    // 解决该对象注册多个成功回调问题
    while (this.onResolvedArr.length) {
      this.onResolvedArr.shift()(value);
    }
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.value = reason;
    // 解决该对象注册多个失败回调问题
    while (this.onRejectedArr.length) {
      this.onRejectedArr.shift()(reason);
    }
  };

  then(onFulfilled, onRejected) {
    // 因为Promise的then方法是支持链式调用的，所以需要返回新的Promise对象。
    let chainPromise = new MyPromise((resolve, reject) => {
      // **参数可选**
      // 注意：如果忽略针对某个状态的回调函数参数，或者提供非函数 (nonfunction) 参数，那么 then 方法将会丢失关于该状态的回调函数信息，但是并不会产生错误。
      // 如果调用 then 的 Promise 的状态（fulfillment 或 rejection）发生改变，但是 then 中并没有关于这种状态的回调函数，那么 then 将创建一个没有经过回调函数处理的新 Promise 对象，这个新 Promise 只是简单地接受调用这个 then 的原 Promise 的终态作为它的终态
      onFulfilled =
        typeof onFulfilled === "function" ? onFulfilled : (value) => value;
      onRejected =
        typeof onRejected === "function"
          ? onRejected
          : (reason) => reject(reason);
      // 因为这里是立即执行，所以可以放到执行器里面来执行
      if (this.status === FULFILLED) {
        // 如果这里的result返回一个值，那么直接调用resolve并传入值
        // 如果这里的reulst返回一个Promise对象，那么该Promise的状态以及value将同步返回给该Promise(chainPromise)
        // 参考MDN地址：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/then#%E8%BF%94%E5%9B%9E%E5%80%BC
        // 因为是微任务异步调用，需要包裹成微任务
        queueMicrotask(() => {
          // 捕获`then`中resolve回调的错误，如有错误，该Promise将直接返回reject，同时将抛出的错误作为拒绝状态的回调函数参数值
          try {
            let result = onFulfilled(this.value);
            resolveChainPromise(chainPromise, result, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
      if (this.status === REJECTED) {
        // 因为是微任务异步调用，需要包裹成微任务
        queueMicrotask(() => {
          // 捕获`then`中reject回调的错误，如有错误，该Promise将直接返回reject，同时将抛出的错误作为拒绝状态的回调函数参数值
          try {
            let result = onRejected(this.value);
            // 被onRejected捕获后，返回的Promise中的status将变为fulfilled，所以这里使用resolve方法
            // resolve(result);
            resolveChainPromise(chainPromise, result, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      }
      // 如果还是`pending`状态则先记录下来，等待fulfilled时候执行对应的回调
      // 因为该Promise可以被多次调用then方法，所以需要用数组保存回调
      if (this.status === PENDING) {
        // 这里通过包装函数，接收一个延迟设置chainPromise状态的值
        // 这样就可以在该Promise中异步更改（该Promise中的reslove,reject方法中更改chainPromise的值）chainPromise中的状态
        this.onResolvedArr.push((value) => {
          // 捕获then中onResolve异步调用中抛出的错误
          try {
            // resolve(onFulfilled(value));
            resolveChainPromise(
              chainPromise,
              onFulfilled(value),
              resolve,
              reject
            );
          } catch (error) {
            reject(error);
          }
        });
        this.onRejectedArr.push((value) => {
          // 捕获then中onReject异步调用中抛出的错误
          try {
            // reject(onRejected(value))
            resolveChainPromise(
              chainPromise,
              onRejected(value),
              resolve,
              reject
            );
          } catch (error) {
            reject(error);
          }
        });
      }
    });
    // 因为Promise的then方法是支持链式调用的，所以需要返回新的Promise对象。
    return chainPromise;
  }

  catch(callback) {
    return this.then(undefined, callback);
  }
}

// 判断then方法中的返回值是否是Promise还是普通值
function resolveChainPromise(chainPromise, result, resolve, reject) {
  // 这里主要处理在then里面返回自身，导致的循环引用问题
  if (chainPromise === result) {
    return reject(
      new TypeError("Chaining cycle detected for promise #<Promise>")
    );
  }
  if (result instanceof MyPromise) {
    // if (result.status === FULFILLED) {
    //   resolve(result.value);
    // } else if (result.status === REJECTED) {
    //   reject(result.value);
    // } else {
    //   result.then(resolve, reject);
    // }

    // 上面的写法可以简写（自己实现的时候的思路）
    // 因为不管返回的result的状态已经被设置了，还是`pending`，
    // 当最终状态被确定后，传入的resolve,reject都会被执行，所以不用根据状态取手动判断
    // 直接传入Promise确定后的回调，让Promise自己调用
    result.then(resolve, reject);
  } else {
    console.log("123");
    resolve(result);
  }
}

// module.exports = MyPromise;

// === 测试用例 ===
// 用例5: 捕获错误
console.log(
  new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve("1");
    });
  }).then(() => {
    foo();
  })
);
// .catch((res) => {
//   console.log(res);
//   return "123";
// });
// 用例4:测试then方法回调异步调用(微任务)
/*
setTimeout(() => {
  Promise.resolve("1").then((res) => {
    console.log(res);
  });
}, 300);

var a4 = new MyPromise(function (resolve) {
  setTimeout(() => {
    resolve("a4 promise resolve");
  }, 300);
});

a4.then((res) => {
  console.log("成功微任务异步调用", res);
});
console.log("a4", a4);
*/

/*
// 用例3:测试在then方法中返回自身
// 原生Promise,报错，循环调用 TypeError: Chaining cycle detected for promise #<Promise>
// var a = Promise.resolve("1").then((res) => {
//   return a;
// });
var a3 = new MyPromise(function (resolve) {
  setTimeout(() => {
    resolve("1");
  }, 300);
}).then(() => {
  return a3;
});

a3.then(
  (res) => {
    console.log("a3 resolve", res);
  },
  (reason) => {
    console.log("a3 reject", reason);
  }
);
console.log("a3", a3);
*/

/*
// 用例2:async await 测试MyPromise
const bb = async () => {
  // await 后面可以是一个Promise或者任何要等待的值
  // 如果是promise，则等待该promise处理完成。
  // 若Promise的状态为`fulfilled`，则将内部的value（不严谨，但是可以这么理解）作为await表达式值
  // 如Promise的状态为'rejected'，await表达式会把Promise的异常抛出。可能会导致后面代码不能执行。
  // 如果await后面返回的是一个值，则原样返回该值本身

  // 黑科技：
  // await也可是一个thenable接口的对象，内部会自动转换为Promise，所以上面实现的MyPromise可以使用async，await方式同步书写代码
  let a = await new MyPromise(function (resolve, reject) {
    setTimeout(() => {
      resolve("是否可就是大家反馈");
    }, 5000);
  });
  console.log("biubiu", a);
};
bb();
// 用例1: 测试`then`方法返回Promise对象状态是不是和内部返回的Promise一致
const b = new MyPromise(function (resolve, reject) {
  resolve("2");
}).then(() => {
  return new MyPromise(function (resolve, reject) {
    setTimeout(() => {
      resolve("123");
    }, 5000);
  });
});

console.log(b);
setTimeout(() => {
  console.log(b);
}, 5500);
*/
