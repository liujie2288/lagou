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

