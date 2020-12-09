// === 自己实现一个Promise类 ===

// 常见问题：
// 1. error是如何冒泡的，为什么catch能捕捉到前面任意promise发生的错误？
// 答： 可以理解为`catch`同`then`一样，只是为前一个promise注册回调，那么要想catch捕捉到最前的错误，只需要前面then返回的Promise
//      都返回这个错误，那么最后的catch就能接收到该错了，也就是所谓的错误冒泡了。
// 2. promise是如何实现延迟调用的？
// 答： `then`注册的回调，可以先保存，然后当状态发生变化后，循环调用then注册的一次或多次回调。

// 注意：
// 1. Promise里面的执行器是立即调用的
// 2. 就算执行器中没有异步代码，通过Promise的then方法添加的回调也会异步调用（添加进微任务队列中）
// 3. 程序执行时，then方法会立即返回一个Promise，如果该promise的状态已经确定，对应回调会被立即添加进微任务队列，否则确定后，执行该添加操作
// 4. 在每次执行宏每一个宏任务之前，都会先清空微任务队列，如果微任务又产生了新的微任务，也需要等待新的微任务执行完毕后，再执行下一个宏任务
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
            // resolve(onRejected(value))
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

  // 1. 返回一个Promise实例
  // 2. 传入的Promise**都完成**，该Promise变为resolve状态，其`resolveValue`为按传入顺序排列的每个Promise的`resolveValue`
  // 3. 有任务一个失败，该Promise状态变为reject，同时`reject reason`为第一个Promise失败时候的结果
  // 注意：
  // 1. iterable必传
  // 2. iterable中可以包含或者全是非promise,这些值会仍然被放到返回数组中
  // 3. iterable如果为空，返回的Promise的状态会**同步**的更改为'resolved'，
  // 4. iterable传入的 promise 都变为完成状态，或者传入的可迭代对象内没有 promise，Promise.all 返回的 promise 异步地变为完成。
  static all(iterable) {
    if (!iterable) throw new TypeError("undefined is not iterable");
    const state = { count: 0, values: [] };
    return new MyPromise((resolve, reject) => {
      if (iterable.length === 0) {
        resolve([]);
        return;
      }
      const resolveCallback = (res, index) => {
        state["count"] = state["count"] + 1;
        state["values"][index] = res;
        if (state["count"] === iterable.length) {
          resolve(state["values"]);
        }
      };
      iterable.forEach((promise, index) => {
        if (promise instanceof MyPromise) {
          promise.then(
            (res) => resolveCallback(res, index),
            (reason) => {
              reject(reason);
            }
          );
        } else {
          resolveCallback(promise, index);
        }
      });
    });
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
    resolve(result);
  }
}

// module.exports = MyPromise;

// === 测试用例 ===
// 用例6: 测试all方法

// MyPromise.all();
// MyPromise.all([]);
var p1 = new MyPromise(function (resolve, reject) {
  setTimeout(() => {
    reject(123);
  }, 3000);
});
MyPromise.all([p1, 3]).then(
  (res) => {
    console.log(res);
  },
  (reason) => {
    console.log(reason);
  }
);

var p2 = new MyPromise(function (resolve, reject) {
  resolve("haha");
});
MyPromise.all([p2, 3]).then(
  (res) => {
    console.log(res);
  },
  (reason) => {
    console.log(reason);
  }
);

// 用例5: 捕获错误
/*
console.log(
  new MyPromise(function (resolve, reject) {
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
*/
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
