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
function co(generator) {
  const iterable = generator();
  const coWrap = function (result) {
    if (result.done) return;
    result.value.then(
      (data) => {
        coWrap(iterable.next(data));
      },
      (error) => {
        iterable.throw(error);
      }
    );
  };
  coWrap(iterable.next());
}

function* getPosts() {
  try {
    const post1 = yield ajax("http://jsonplaceholder.typicode.com/posts/1");
    console.log(post1);
    const post2 = yield ajax("http://jsonplaceholder.typicode.com/posts/2");
    console.log(post2);
  } catch (e) {
    console.log(e);
  }
}
co(getPosts);
