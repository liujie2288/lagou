const MyPromise = require("./07-promise-realize");

// 用例1: 测试promise对象reject后，被then方法捕捉后返回的Promise状态为fulfilled

// new MyPromise(function (resolve, reject) {
//   // setTimeout(() => {
//   reject("12");
//   // }, 300);
// })
//   .then(
//     (res) => {},
//     (reason) => {
//       console.log("own", reason);
//       return "哈哈哈";
//     }
//   )
//   .then();

// test("promise reject")

test("MyPromise异步调用", async function () {
  const b = await new MyPromise(function (resolve, reject) {
    setTimeout(() => {
      resolve("2");
    }, 2000);
  });
  expect(b).toBe("2");
});
