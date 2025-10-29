# `Send` 与 `Sync` 特征

- 实现`Send`的类型可以在**线程间**安全的传递其所有权
- 实现`Sync`的类型可以在**线程间**安全的共享(通过引用)
- 若类型 `T` 的引用`&T`是`Send`，则`T`是`Sync`。因为共享的前提是要能发送。
## 将`Rc`传递到子线程中

```rust
use std::rc::Rc;
use std::thread;

fn main() {
  let demo = Rc::new(0);
  thread::spawn(move || {
    //          ^^^^ `Rc<i32>` cannot be sent between threads safely
    println!("{}", *demo);
  });
}
```
是因为`Rc`没有实现`Send`和`Sync`这两个`trait`

## 模拟实现不能移入子线程的数据
手动实现 `Send` 和 `Sync` 是不安全的。

```rust
#![feature(negative_impls)]
use std::{marker, thread};

fn main() {
    #[derive(Debug)]
    struct Demo ();

    impl Demo {
        fn new() -> Demo {
            Demo ()
        }
    }

    // 强调 Demo 不实现Sync 与 Send
    impl !marker::Sync for Demo {}
    impl !marker::Send for Demo {}

    let demo: Demo = Demo::new();
    // 下面这行会编译失败，因为 Demo 不是 Send
    thread::spawn(move || {
      //          ^^^^ 这里将会报错 Dome不能在线程之间安全发送 
        println!("move to: {:?}", demo);
    });
}
```
若复合类型的所有成员都是`Send`或`Sync`，那么该复合类型自动拥有`Send`或`Sync`。（自动派生）
同理。只要复合类型中有一个成员不是`Send`或`Sync`，那么该复合类型也就不是`Send`或`Sync`。

## 裸指针也不能在线程间传递共享
```rust

```