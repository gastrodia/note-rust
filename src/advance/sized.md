# 动态大小类型

## 动态大小类型
只有在运行时才能知道数据大小
```rust
fn main() {
  /*
  fn dyn_arr(n: usize) {
    let arr = [1; n];
  }
  */

  
}
```
切片是动态类型

`str` 是动态类型,但`&str`拥有固定的类型大小（指针）

 固化动态数据的方法是，使用引用来指向动态数据。在引用中存储位置和大小信息。

rust中常见的动态类型：
- `str`
- `[T]`
- `dyn trait`
- 他们都无法单独使用，必须使用`Box`或引用来间接使用

## Sized
```rust
fn main() {
  fn foo<T>(_: T) {} // 泛型T是如何保证其为固定类型？
  // 在编译时Rust会给每个泛型添加trait约束，要求必须实现了Sized特征的类型才可传递给该函数
  fn bar<T: Sized>(_: T) {}
  // 日常中的类型都默认实现了Sized trait

  // 假设仍然想在函数中使用动态类型泛型 例如Unsize trait
  trait Unsize<T: ?Sized> {} //表面既可以是是动态大小也可以是固定大小
  fn fun<T: ?Sized>(_: &T) {} // 但需要通过引用来访问

  // Box<str>
  // 前面讲到无法单独使用 str类型 但可以通过Box包裹

  // let a = *"hello";
  //     ^ 无法在编译时知道其类型大小

  // let b = "hello" as str;
  //     ^ 无法在编译时知道其类型大小

  // let c: str = "hello".into();
  // str 没有实现From<&str>的trait



  let d: Box<str> = "hello".into();
  println!("{:?}", d)
}
```