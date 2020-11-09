function compose(f,g,h){
  return function(v){
    return f(g(h(v)))
  }
}

// 获取一个数组的最后一个元素并大写
// 纯函数1
function first(arr){
  return arr[0]
}

// 纯函数2
function reverse(arr){
  return arr.reverse()
}

// 纯函数3
function upper(str){
  return str.toUpperCase();
}

var result = upper(first(reverse(['a', 'b', 'c'])));
console.log(result);
// 对比
var fn = compose(upper,first,reverse);
var result = fn(['a', 'b', 'c']);
console.log(result);