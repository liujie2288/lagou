/*
在 urls 数组中存放了 10 个接口地址。同时还定义了一个 loadDate 函数，这个函数接受一个 url 参数，返回一个 Promise 对象，该 Promise 在接口调用成功时返回 resolve，失败时返回 reject。

要求：任意时刻，同时下载的链接数量不可以超过 3 个。 试写出一段代码实现这个需求，要求尽可能快速地将所有接口中的数据得到。
*/
var urls = [
  "http://jsonplaceholder.typicode.com/posts/1",
  "http://jsonplaceholder.typicode.com/posts/2",
  "http://jsonplaceholder.typicode.com/posts/3",
  "http://jsonplaceholder.typicode.com/posts/4",
  "http://jsonplaceholder.typicode.com/posts/5",
  "http://jsonplaceholder.typicode.com/posts/6",
  "http://jsonplaceholder.typicode.com/posts/7",
  "http://jsonplaceholder.typicode.com/posts/8",
  "http://jsonplaceholder.typicode.com/posts/9",
  "http://jsonplaceholder.typicode.com/posts/10",
];

function loadData(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.responseText);
    };
    xhr.open("GET", url);
    xhr.send();
  });
}

// 实现

function batch(urls, maxlength) {
  const promises = [];
  const remianUrls = urls.slice(maxlength);
  const results = [];
  const loadDataWrap = (url, index) => {
    if (!url) return;
    return loadData(url).then(
      (res) => {
        results[index] = res;
        return loadDataWrap(
          remianUrls.shift(),
          urls.length - remianUrls.length - 1
        );
      },
      (reason) => {
        results[index] = reason;
        return loadDataWrap(
          remianUrls.shift(),
          urls.length - remianUrls.length - 1
        );
      }
    );
  };
  for (let index = 0; index < maxlength; index++) {
    const url = urls[index];
    promises.push(loadDataWrap(url, index));
  }
  return Promise.all(promises).then(() => results);
}
batch(urls, 3).then((res) => {
  console.log(res);
  return res;
});
