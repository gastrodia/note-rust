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
```text
a → Cons(1) → Weak(b)---弱连接---→ Cons(2) → Weak(a)
   ▲                                         │
   └----------------弱连接--------------------┘
```

## 验证`Weak`手动释放
```rust
use std::rc::{Rc, Weak};

fn main() {
  let a = Rc::new(String::from("hello"));
  let b = Rc::downgrade(&a);

  println!("[初始状态] a strong: {}", Rc::strong_count(&a));  // 1
  println!("[初始状态] a weak: {}", Rc::weak_count(&a));      // 1
  println!("[初始状态] b upgrade: {}", b.upgrade().is_some()); // true


  match b.upgrade() {
    Some(v) => println!("[初始状态] b weak: {v}"),
    None => println!("[初始状态] no upgrade")
  }

  // 手动释放a
  drop(a);

  println!("[释放后状态] b upgrade: {}", b.upgrade().is_some()); // false
  match b.upgrade() {
    Some(v) => println!("[释放后状态] b weak: {v}"),
    None => println!("[释放后状态] no upgrade")
  }
}
```
- 当我们读取`Weak`引用的值时，会得到`Option`，强制我们进行结果检查。
- 如果值存在，则返回`Some<T>`
- 如过访问被销毁的引用时，会得到`None`。

## `Rc`与`Weak`对比

| **特性**            | **Rc<T>** (强引用)                          | **Weak<T>** (弱引用)                          |
|---------------------|--------------------------------------------|--------------------------------------------|
| **所有权**           | 共享数据所有权                             | 无所有权，仅观察                          |
| **强引用计数影响**   | 创建时 +1，克隆时 +1                      | **不改变强引用计数**                      |
| **弱引用计数影响**   | 不改变弱引用计数                           | 创建时 +1，释放时 -1                      |
| **内存释放条件**     | 当 strong_count = 0 时立即释放            | 不影响释放时机                            |
| **升级能力**         | 可直接访问数据                             | 需调用 `upgrade()` 返回 `Option<Rc<T>>`    |
| **循环引用风险**     | 直接使用会导致内存泄漏                     | **安全**，不会形成强引用闭环               |
| **典型使用场景**     | 共享数据结构、多所有者模型                 | 观察者模式、缓存、树结构的父节点引用        |

## `Rc`与`Weak`的使用场景

| **场景**                    | **推荐选择** | **原因说明**                     |
|----------------------------|-------------|----------------------------------|
| 需要长期持有数据           | Rc          | 维持数据生命周期                 |
| 需要避免循环引用           | Weak        | 打破强引用闭环                   |
| 缓存系统                   | Weak        | 允许主数据释放后自动清理缓存      |
| 树结构的父节点引用         | Weak        | 子节点不应阻止父节点释放          |
| 多线程环境（需并发）        | Arc + Mutex | Rc/Weak 非线程安全               |

## 树结构
```rust
use std::cell::RefCell;
use std::rc::{Rc, Weak};
use std::ops::Index;

#[derive(Debug)]
struct Node<T> {
    value: T,
    parent: RefCell<Weak<Node<T>>>,
    children: RefCell<Vec<Rc<Node<T>>>>,
}

impl<T> Node<T> {
  fn new(value: T) -> Rc<Self> {
      Rc::new(Node {
          value,
          parent: RefCell::new(Weak::new()),
          children: RefCell::new(Vec::new()),
      })
  }

  fn add_child(parent: &Rc<Self>, child: Rc<Self>) {
      *child.parent.borrow_mut() = Rc::downgrade(parent);
      parent.children.borrow_mut().push(child);
  }

  fn get_parent(&self) -> Option<Rc<Node<T>>> {
      self.parent.borrow().upgrade()
  }
}

fn main() {
  let root = Node::new("root");
  println!("[root]: {:?}", root);
  println!("[root parent]: {:?}", root.get_parent());

  let child = Node::new("child");
  Node::add_child(&root, child.clone());

  println!("[root]: {:?}", root);
  let binding = root.children.borrow();
  let root_child = binding.index(0);
  println!("[root children]: {:?}", root_child);
  let root_child_parent = root_child.get_parent();
  println!("[root children parent]: {:?}", root_child_parent);
}

```