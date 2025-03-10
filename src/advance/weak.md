# `Weak` 与循环引用

## `Rust`链表

如何在`rust`中实现链表？

```rust
use std::cell::RefCell;
use std::rc::Rc;

#[derive(Debug)]
enum List<T> {
  Cons(T, RefCell<Rc<List<T>>>),
  Nil
}

impl<T> List<T> {
  fn tail(&self) -> Option<&RefCell<Rc<List<T>>>> {
    match self {
      Self::Cons(_, item) => Some(item),
      Self::Nil => None
    }
  }
}
```
既然存在链表，就可能存在循环自引用的情况。

## 循环引用导致内存泄漏
```rust
use std::cell::RefCell;
use std::rc::Rc;

# #[derive(Debug)]
# enum List<T> {
#   Cons(T, RefCell<Rc<List<T>>>),
#   Nil
# }
# 
# impl<T> List<T> {
#   fn tail(&self) -> Option<&RefCell<Rc<List<T>>>> {
#     match self {
#       Self::Cons(_, item) => Some(item),
#       Self::Nil => None
#     }
#   }
# }


fn main() {
  let a = Rc::new(List::Cons(1, RefCell::new(Rc::new(List::Nil))));

  // b 指向 a
  let b = Rc::new(List::Cons(2, RefCell::new(Rc::clone(&a))));

  let link = a.tail().unwrap();

  // a 再指向 b
  *link.borrow_mut() = Rc::clone(&b);

  // 循环引用
  println!("a: {}", Rc::strong_count(&a));
  println!("b: {}", Rc::strong_count(&b));

  println!("----------");

  println!("a next item = {:?}", a.tail());
  // 为什么执行 a.tail 会导致内存溢出
}
```

**为什么执行 `a.tail` 会导致内存溢出？**

- 创建 `a` 后：`Rc::strong_count(&a) = 1`
- 创建 `b` 后：`b` 内部指向 `a → a.count = 2`
- 修改 `a` 指向 `b` 后：`b.count = 2`
- 最终形成 `a → b → a` 的闭环


```text
a 结构：
Cons(1, RefCell { value: Rc(b) })
           ▲               │
           └───────┐       │
                   │       ▼
b 结构：    Cons(2, RefCell { value: Rc(a) })

```

当执行 `println!("a next item = {:?}", a.tail())` 时
`Debug` 实现会自动展开嵌套结构：
`a.tail() → RefCell { value: Rc(b) } → b.tail() → RefCell { value: Rc(a) } → a.tail()...`
形成无限递归链，直到栈空间耗尽


**那为何`Rc::strong_count(&a)`和`Rc::strong_count(&a)`不会无限增长？而是为`2`？**

- 引用计数只在调用`Rc::clone()` 时增加
- 每个节点仅被克隆一次 → 形成稳定闭环
- 没有新的克隆操作 → 计数保持 2 不变

此时两个对象的实际引用计数都无法归零 → 内存无法释放 → 但计数本身保持稳定!

因此，我们可以得出结论：**内存安全 不等于 无内存泄漏**。

## 使用`Weak<T>`规避内存泄漏

```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
enum List<T> {
  Cons(T, RefCell<Weak<List<T>>>),
  Nil
}

impl<T> List<T> {
  fn tail(&self) -> Option<&RefCell<Weak<List<T>>>> {
    match self {
      Self::Cons(_, item) => Some(item),
      Self::Nil => None
    }
  }
}

fn main() {
  let a = Rc::new(List::Cons(1, RefCell::new(Weak::new())));
  let b = Rc::new(List::Cons(2, RefCell::new(Weak::new())));

  // 建立弱连接
  *a.tail().unwrap().borrow_mut() = Rc::downgrade(&b); // a -> b
  *b.tail().unwrap().borrow_mut() = Rc::downgrade(&a); // b -> a

  // 强连接
  println!("a strong: {}", Rc::strong_count(&a));  // 输出 1
  println!("b strong: {}", Rc::strong_count(&b));  // 输出 1

  // 弱连接
  println!("a weak: {}", Rc::weak_count(&a));      // 输出 1
  println!("b weak: {}", Rc::weak_count(&b));      // 输出 1


  println!("a next item = {:?}", a.tail());
  println!("a next item = {:?}", a.tail().unwrap().borrow().upgrade()); // 可看到 a指向b
}
```