// === 自己实现一个Promise类 ===

// 常见问题：
// 1. error是如何冒泡的，为什么catch能捕捉到前面任意promise发生的错误？
// 答： 可以理解为`catch`同`then`一样，只是为前一个promise注册回调，那么要想catch捕捉到最前的错误，只需要前面then返回的Promise
//      都返回这个错误，那么最后的catch就能接收到该错了，也就是所谓的错误冒泡了。
// 2. promise是如何实现延迟调用的？
// 答： `then`注册的回调，可以先保存，然后当状态发生变化后，循环调用then注册的一次或多次回调。
// 3. then回调中返回Promise是如何同then返回的Promise状态同步的？
// 答： 通过将then中创建的Promise`resolve`和`reject`函数作为then回调返回Promise的then的回调，当该Promise状态被确定，
//      就自动调用传入的resolve或reject，从而改变then中返回的Promise状态，做到状态同步。
// 4. then回调中抛出异常是如何导致Promise状态变为rejected？
// 答： 通过`try catch`捕捉到错误后，然后调用`reject`来改变then中返回的Promise状态

// 注意事项：
// 1. Promise里面的执行器是立即调用的
// 2. 就算执行器中没有异步代码，通过Promise的then方法添加的回调也会异步调用（添加进微任务队列中）
// 3. then方法是在为调用它的Promise注册回调，当调用它的Promise状态被确定，则执行对应的回调
// 4. 程序执行时，then方法会立即返回一个Promise，如果该promise的状态已经确定，对应回调会被立即添加进微任务队列，否则待确定后，执行该添加操作
// 5. 在每次执行宏每一个宏任务之前，都会先清空微任务队列，如果微任务又产生了新的微任务，也需要等待新的微任务执行完毕后，再执行下一个宏任务
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
        this.onResolvedArr.push((value) =>
          // 因为是微任务异步调用，需要包裹成微任务
          queueMicrotask(() => {
            // 捕获then中onResolve异步调用中通过throw抛出的错误
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
          })
        );
        this.onRejectedArr.push((value) =>
          // 因为是微任务异步调用，需要包裹成微任务
          queueMicrotask(() => {
            // 捕获then中onReject异步调用中通过throw抛出的错误
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
          })
        );
      }
    });
    // 因为Promise的then方法是支持链式调用的，所以需要返回新的Promise对象。
    return chainPromise;
  }

  catch(callback) {
    return this.then(undefined, callback);
  }

  // ======== finally方法要点 ========
  // 1. 无论当前Promise对象状态是什么，回调都会被执行
  // 2. 由于无法知道promise最终状态，finally的回调中不接受任务参数，
  // 3. 与`Promise.resolve(2).then(()=>{},()=>{})`(结果为resolved undefined)不同，
  //    `Promise.resolve(2).finally(()=>{})`的结果为resolved 2;
  // 4. 与`Promise.reject(3).then(()=>{},()=>{})`(结果为rejected undefined)不同，
  //    `Promise.reject(3).finally(()=>{})`的结果为rejected 3;
  // 5. finally方法中只有返回错误的值（通过rejct或throw），才会更改finally返回的Promise状态以及值，
  //    如果直接return或通过resolve返回，并不会更改finally返回的Promise状态，保留调用finally的Promise状态
  finally(callback) {
    // === 实现1: 不简单等于与下面的代码（最开始的思路） ====
    // 不能解决上面3，4点的问题
    // return this.then(callback, callback);
    // === 实现2: 不能解决上面5点的问题 ====
    // return this.then(
    //   (res) => {
    //     callback();
    //     // finally 后面的then要拿到前面Promise的结果（上面3，4点的要求）
    //     // 所以需要返回值
    //     return res;
    //   },
    //   (reason) => {
    //     callback();
    //     // finally 后面的then要拿到前面Promise的结果（上面3，4点的要求）
    //     // 所以需要抛出错误
    //     throw reason;
    //   }
    // );
    // === 实现3: 终版 ====
    return this.then(
      (res) => {
        const result = callback();
        if (result instanceof MyPromise) {
          return result.then(
            () => res,
            // 可省略，then可选参数
            (reason) => {
              throw reason;
            }
          );
        }
        // 所以需要返回值
        return res;
      },
      (reason) => {
        const result = callback();
        if (result instanceof MyPromise) {
          return result.then(
            () => {
              throw reason;
            },
            // 可省略，then可选参数
            (reason) => {
              throw reason;
            }
          );
        }
        // 所以需要抛出错误
        throw reason;
      }
    );
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
    // if (!iterable) throw new TypeError("undefined is not iterable");
    if (!isIterable(iterable))
      throw new TypeError(typeof iterable + " is not iterable");
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
  // 1. 返回一个表示每一个Promise结果的对象数组(顺序同Promise传入顺序)的Promise对象
  // 2. 返回的结果数组中结构Array<{status:'fulfilled'|'rejected',value?:any,reason?:any}> (成功返回value，失败返回reason)
  // 应用场景：
  // 多个彼此不依赖的异步任务成功完成或想知道每个Promise的结果（无论成功，失败）。
  static allSettled(iterable) {
    if (!isIterable(iterable))
      throw new TypeError(typeof iterable + " is not iterable");
    return new MyPromise(function (resolve) {
      if (iterable.length === 0) {
        resolve([]);
        return;
      }
      const state = { count: 0, values: [] };
      const resolveCallback = (result, index) => {
        state.count++;
        state.values[index] = result;
        if (iterable.length === state.count) {
          resolve(state.values);
        }
      };
      iterable.forEach((promise, index) => {
        if (promise instanceof MyPromise) {
          promise.then(
            (value) =>
              resolveCallback({ status: FULFILLED, value: value }, index),
            (reason) =>
              resolveCallback({ status: REJECTED, reason: reason }, index)
          );
        } else {
          resolveCallback({ status: FULFILLED, value: promise }, index);
        }
      });
    });
  }
  // 1. 返回一个Promise实例
  // 2. 迭代器中任何一个Promise变成fullfilled或rejected，那么返回的Promise就变成对应该Promise对应状态
  // race： 竞赛（比速度），看谁先返回。
  // 注意：
  // 1. iterable如果为空，返回的Promise的永远等待
  // 2. iterable中包含非Promise或者已经确定的Promise，则返回
  // 应用场景
  // 可以做请求超时判断，如果过了一段时间请求还没有返回，就返回包装超时的Promise信息，否则返回请求的数据
  static race(iterable) {
    if (!isIterable(iterable))
      throw new TypeError(typeof iterable + " is not iterable");
    return new MyPromise(function (resolve, reject) {
      iterable.forEach((item) => {
        if (item instanceof MyPromise) {
          item.then(resolve, reject);
        } else {
          resolve(item);
        }
      });
    });
  }
  // 返回一个给定值的Promise对象
  // 注意：
  // 1. 如果传入的值为Promise，将原样返回
  // 2. 如果传入的值为一个`thenable`，返回的Promise将采用它最终的状态
  static resolve(value) {
    if (value instanceof MyPromise) return value;
    if (typeof value === "object" && "then" in value) {
      return new MyPromise(value.then);
    }
    return new MyPromise(function (resolve) {
      resolve(value);
    });
  }

  // 返回一个带有拒绝原因的Promise对象。
  static reject(reason) {
    return new MyPromise(function (resolve, reject) {
      reject(reason);
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

// 判断一个值是否是可迭代的
function isIterable(obj) {
  return obj != null && typeof obj[Symbol.iterator] === "function";
}

// module.exports = MyPromise;
// export default MyPromise;

// === 测试用例 ===
// 用例11：测试allsettled方法
const promise1 = MyPromise.resolve(3);
const promise2 = new MyPromise((resolve, reject) =>
  setTimeout(reject, 100, "foo")
);
const promises = [promise1, promise2];

var a11 = MyPromise.allSettled(promises).then(
  (results) => console.log(results)
  // results.forEach((result) => console.log(result.status))
);

console.log(a11);
setTimeout(() => {
  console.log(a11);
}, 1000);

/*
// 用例10: 测试race方法(异步特性)
var resolvedPromisesArray = [MyPromise.resolve(33), MyPromise.resolve(44)];

var p = MyPromise.race(resolvedPromisesArray);
// immediately logging the value of p
console.log(p);

// using setTimeout we can execute code after the stack is empty
setTimeout(function () {
  console.log("the stack is now empty");
  console.log(p);
});
// 测试race方法,结合setTimeout方法;
var p1 = new MyPromise(function (resolve, reject) {
  setTimeout(resolve, 500, "one");
});
var p2 = new MyPromise(function (resolve, reject) {
  setTimeout(resolve, 100, "two");
});

MyPromise.race([p1, p2]).then(function (value) {
  console.log(value); // "two"
  // 两个都完成，但 p2 更快
});

var p3 = new MyPromise(function (resolve, reject) {
  setTimeout(resolve, 100, "three");
});
var p4 = new MyPromise(function (resolve, reject) {
  setTimeout(reject, 500, "four");
});

MyPromise.race([p3, p4]).then(
  function (value) {
    console.log(value); // "three"
    // p3 更快，所以它完成了
  },
  function (reason) {
    // 未被调用
  }
);

var p5 = new MyPromise(function (resolve, reject) {
  setTimeout(resolve, 500, "five");
});
var p6 = new MyPromise(function (resolve, reject) {
  setTimeout(reject, 100, "six");
});

MyPromise.race([p5, p6]).then(
  function (value) {
    // 未被调用
  },
  function (reason) {
    console.log(reason); // "six"
    // p6 更快，所以它失败了
  }
);
*/
/*
// 用例9: 测试reject方式
console.log(
  MyPromise.reject(new Error("123")).then(
    () => {
      console.log("resolved");
    },
    (reason) => {
      console.log("reject", reason);
    }
  )
);
*/
/*
// 用例8: 测试finally方法
var a8 = new MyPromise(function (resolve, reject) {
  setTimeout(() => {
    resolve("1");
  }, 300);
}).finally((res) => {
  return new MyPromise(function (resolve, reject) {
    setTimeout(() => {
      reject("123");
    }, 300);
  });
  // return MyPromise.resolve("123");
});
console.log(a8);
setTimeout(() => {
  console.log(a8);
}, 3000);

console.log(MyPromise.resolve(3).finally(() => { }));
*/
// 用例7: 测试resolve方法
/*
var a7 = MyPromise.resolve("123");
console.log(a7, MyPromise.resolve(a7) === a7);

var a71 = MyPromise.resolve({
  then: function (resolve, reject) {
    setTimeout(() => {
      resolve("123");
    }, 3000);
  },
});
console.log(a71);
setTimeout(() => {
  console.log(a71);
}, 3100);
*/

// 用例6: 测试all方法

/*
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
*/

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
