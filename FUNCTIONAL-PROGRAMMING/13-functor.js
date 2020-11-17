class Container {
  static of(value) {
    return new Container(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return MayBe.of(fn(this._value));
  }
}

console.log(Container.of(3));

class MayBe {
  static of(value) {
    return new MayBe(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return MayBe.of(this._value ? fn(this._value) : null);
  }
}

// console.log(Container.of(null).map((item) => item.toUpperCase()));
console.log(MayBe.of(null).map((item) => item.toUpperCase()));

console.log(
  MayBe.of("hello world")
    .map((value) => value.toUpperCase())
    .map((value) => null)
    .map((value) => value.splice(" "))
);

// Either 函子
class Left {
  static of(value) {
    return new Left(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return this;
  }
}

class Right {
  static of(value) {
    return new Right(value);
  }
  constructor(value) {
    this._value = value;
  }
  map(fn) {
    return Right.of(fn(this._value));
  }
}

// Either函子来处理解析异常
function parseStr(str) {
  try {
    return Right.of(JSON.parse(str));
  } catch (error) {
    return Left.of({ err: error.message });
  }
}

console.log(parseStr("{name:'jay'}").map((item) => item.name.toUpperCase()));
console.log(parseStr('{"name":"jay"}').map((item) => item.name.toUpperCase()));

const fp = require("lodash/fp");
// IO函子
class IO {
  // 接收一个值,包装到函数中，延迟执行
  static of(value) { 
    return new IO(function () { 
      return value;
    })
  }
  //期望接收一个函数来处理不纯的操作
  constructor(fn) {
    this._value = fn;
  }
  map(fn) { 
    // 注意这里没有调用of方法
    // 而是通过将传入的fn和value组合成一个新的函数，而不是调用函数
    // 最终延迟调用执行，将不纯的操作交给调用者来执行
    return new IO(fp.flowRight(fn, this._value));
  }
}

let io = IO.of(process).map(item => item.execPath);
console.log(io);
console.log(io._value())



