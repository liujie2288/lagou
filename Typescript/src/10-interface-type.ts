// 函数类型

export {}; // 确保跟其它示例没有冲突

// 这里隐性的要求，传入的post是一个对象，需要包含`title`和`body`属性
// function printPost(post) {
//   console.log(post.title);
//   console.log(post.body);
// }

// 通过接口明确要求参数类型
interface IPost {
  // 成员的约定
  title: string;
  body: string;
}

function printPost(post: IPost) {
  console.log(post.title);
  console.log(post.body);
}
// 现在调用printPost时，如果传入的对象没有接口约定的成员，将提示错误。
printPost({ title: "标题", body: "内容" });
printPost({ name: "jay" }); // 报错

// ==== 动态成员 ====
interface ICache {
  // 这里的 'props'可以是任意的字符串，这里只是用来表示是一个属性
  // props后的`string`用来约束属性名都是`string`类型
  // `number`则用来约束属性值都是`number`类型
  [props: string]: number;
}
const cache: ICache = {};
cache.foo = 1;
cache.bar = 2;
cache.else = "string"; // 报错
