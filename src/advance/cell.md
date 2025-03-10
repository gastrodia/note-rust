# `Cell`/`RefCell`
在rust所有权系统中：
> 在同一时间，一个数据只能有一个可变引用（`&mut T`），或者多个不可变引用（`&T`），但不能同时存在两者。

```rust
fn main() {
    let mut a = 1;
    let b = &mut a;
    let c = &a;
    println!("{a}_{b}_{c}");
    // ^^^^^^^^^^^^^^^^^^^ 报错 因为同时存在可变引用和不可变引用
}
```


## `Cell<T>`

`Cell<T>` 没有借用检查规则，可以在拥有不可变引用的同时修改目标数据。

```rust
use std::cell::{Cell};

fn main() {
  let a = Cell::new("hello");
  let b = a.get(); // 读
  a.set("world"); // 写
  let c = a.get(); // 读
  println!("{:?} {b} {c}", a);
}
```
**但：`Cell<T>`要求使用者必须实现了`Copy` trait。**

## `RefCell<T>`

`RefCell` 实际上并没有解决可变引用和引用可以共存的问题，
只是将报错从编译期推迟到运行时，从编译器错误变成了 `panic` 异常。

```rust
use std::cell::{RefCell};

fn main() {
  let a = RefCell::new("hello");
  let b = a.borrow();
  let c = a.borrow_mut();
  println!("{:?} {b}, {c}", a);
  // 编译期间不报错，但运行时报错
}
```