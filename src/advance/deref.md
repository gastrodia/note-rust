# Deref

## 为自定义类型实现`Deref`
```rust
use std::ops::{Deref};

fn main() {
  struct Wrapper<T>(T);

  impl<T> Wrapper<T> {
    fn new(t: T) -> Wrapper<T> {
      Wrapper(t)
    }
  }

  let a = Wrapper::new(10);
  // assert_eq!(10, *a); // 没有实现Deref trait

  impl <T>Deref for Wrapper<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
      &self.0
    }
  }

  assert_eq!(10, *a);
  // 实现了 Deref trait 就可以使用解引用了

  // 解引用的本质是rust自动调用了目标的deref方法

  assert_eq!(*a, *(a.deref()));
}
```


## `Deref` 的隐式转换行为
```rust
fn main() {
  let a = String::from("hello");
  let b = &a;
  let c = "hello";

  assert_eq!(b, c);

  // b为 &String 类型
  // c为 &str 类型
  // 但是它们可以通过断言，是因为String实现了Deref<Target = str> trait
  // 在 &String 与 &str 发生比较时，会触发隐式类型转换，&String会自动调用解引用为&str类型

  // 且其可以触发连续的隐式类型转换(解引用)

  let d = Box::new(String::from("hello"));
  let e = &d;

  fn foo(v: &str) {
    assert_eq!("hello", v);
  }

  foo(e); // foo的参数要求为&str类型
  // 但 e 的类型为 &Box<String>，断言却可以通过
  // 这是因为，编译器发现类型不匹配时，Deref会发生连续的隐式转换，会查找可能的Deref路径，直到找到合适的类型则停止

  /*
  foo(e);
  // 实际上会被转换为：
  foo(&**e)
  */
}
```
解引用链：`Box<T>` -> `T` -> `T`的`Deref`目标

具体步骤：
- `&Box<String>` → `Box<String>`（自动解引用）
- `Box<String>` → `String`（通过`Deref`实现）
- `String` → `&str`（通过`Deref`实现）

## `Deref`发生规则
```rust
fn main() {
  // 归一化
  let a = 1;
  let b = &&&&&&&&&&a;
  fn foo(v: &i32) {
    assert_eq!(v, &1);
  }
  foo(b);
  // b将会被归一化为&a
}
```

## `Deref`的三种转换
```rust
use std::ops::{Deref, DerefMut};

fn main() {
  #[derive(Debug)]
  struct Wrapper<T>(T);

  impl<T> Wrapper<T> {
    fn new(t: T) -> Wrapper<T> {
      Wrapper(t)
    }
  }

  impl<T> Deref for Wrapper<T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
      println!("发生了deref");
      &self.0
    }
  }

  impl<T> DerefMut for Wrapper<T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
      println!("发生了mut deref");
      &mut self.0
    }
  }

  let mut a = Wrapper::new(1);

  // 当 T: Deref<Target=U>，可以将 &T 转换成 &U
  let b = &a;
  println!("b = {:?}", b);
  let c: &i32 = b; // 从&Wrapper(i32) 变为了 &i32
  println!("c = {}", c);

  // 当 T: DerefMut<Target=U>，可以将 &mut T 转换成 &mut U
  let d = &mut a;
  println!("d = {:?}", d);
  let e: &mut i32 = d;  // 从&mut Wrapper(i32) 变为了 &mut i32
  println!("e = {}", e);

  // 当 T: Deref<Target=U>，可以将 &mut T 转换成 &U
  let f = &mut a;
  println!("f = {:?}", f);
  let g: &i32 = f;   // 从&mut Wrapper(i32) 变为了 &i32
  println!("g = {}", g);
}
```