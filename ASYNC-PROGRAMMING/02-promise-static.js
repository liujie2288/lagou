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

// 静态方法: Promise.resolve
Promise.resolve('foo').then(res => { 
  console.log(res)
})

// 如果Promise.resolve()接受一个Promise对象，将原样返回传入的Promise对象
var a = new Promise(function(resolve,reject){
  resolve('foo')
});

console.log(Promise.resolve(a) === a) 

// 接受一个有then方法的对象，兼容Promise之前的社区方案，快速将对象转换Promise对象
Promise.resolve({
  then: (resolve, reject)=>{ 
    resolve("123")
  }
}).then(res => { 
  console.log(res); // 123
})