function ajax(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(this.statusText);
      }
    };
    xhr.send();
  });
}

ajax("/api/users.json").then(
  function (res) {
    console.log("result：", res);
  },
  function (error) {
    console.log(error);
  }
);

ajax("/api/users123.json").then(
  function (res) {
    console.log(res);
  },
  function (error) {
    console.log("内部捕获：", error);
  }
);

// 错误将被全局Promise异常捕获
ajax("/api/users123.json").then(function (res) {
  console.log(res);
});

// 全局promise异常处理器
window.addEventListener(
  "unhandledrejection",
  function (e) {
    const { reason, promise } = e;
    console.log("全局异常捕获：", reason, promise);
    // reason  失败原因，一般是一个错误对象
    // promise 出现异常的Promise对象
    e.preventDefault();
  },
  false
);
