# 静态常量`const` 与 静态变量`static`

## `const` 静态常量 
- 只能是字面量或常量表达式
- 必须显式指定类型
- 不可修改
- 生命周期贯穿整个程序，会被内联到使用处（每次使用可能在不同的内存地址）

```rust
const MAX_NUM: usize = usize::MAX / 2;

fn main() {
    println!("MAX_NUM / 2 = {}", MAX_NUM);
    println!("MAX_NUM address: {:p}", &MAX_NUM as *const usize);
}
```

## 静态变量`static`
- 不会被内联，全局只有一个实例（所有引用指向同一个内存地址）
- 可被修改
- 当添加 `mut` 设为可变时，读写都需要使用 `unsafe` 块

```rust
static TIMES: u8 = 10;
static mut COUNTER: u8 = 0;

fn main() {
    println!("TIMES = {}", TIMES);

    for _ in 0..TIMES {
        unsafe {
            COUNTER += 1;
        }
    }

    println!("COUNTER = {}", unsafe { COUNTER });
}
```

## 自增`id`生成器
方式1: 使用 `static mut` (需要 `unsafe`，且在多线程下不安全)

```rust
use std::thread;

static mut AUTO_ID: usize = 0;

const MAX_ID: usize = 10;

fn main() {
    struct AutoId(usize);
    impl AutoId {
        fn new() -> AutoId {
            AutoId(Self::generate())
        }

        fn generate() -> usize {
            unsafe {
                AUTO_ID += 1;
                let next = AUTO_ID;
                if next > MAX_ID {
                    panic!("AutoId({}) exceeded maximum ID limit.", next);
                }
                next
            }
        }

        fn value(&self) -> usize {
            self.0
        }
    }

    // 单线程测试
    println!("=== 单线程测试 ===");
    for _ in 0..5 {
        let id = AutoId::new();
        println!("{}", id.value());
    }

    println!("\n=== 多线程测试（5个线程，每个生成1个ID）===");
    let mut handles = vec![];
    for i in 0..5 {
        let handle = thread::spawn(move || {
            let id = AutoId::new();
            println!("线程 {}: ID = {}", i, id.value());
        });
        handles.push(handle);
    }
    for handle in handles {
        handle.join().unwrap();
    }

    println!("\n最终 AUTO_ID 值: {}",  unsafe { AUTO_ID });

}
```
    
如果使用 `static mut`，在多线程环境下**可能会**有**数据竞争**，导致`ID`重复或未定义行为！

--------

方式2: 使用 `AtomicUsize` (推荐) - 线程安全
```rust
use std::sync::atomic::{AtomicUsize, Ordering};
use std::thread;

static AUTO_ID: AtomicUsize = AtomicUsize::new(0);

const MAX_ID: usize = 10;

fn main() {
    struct AutoId(usize);
    impl AutoId {
        fn new() -> AutoId {
            AutoId(Self::generate())
        }

        fn generate() -> usize {
            let current = AUTO_ID.fetch_add(1, Ordering::SeqCst);
            let next = current + 1;
            if next > MAX_ID {
                panic!("AutoId({}) exceeded maximum ID limit.", next);
            }
            next
        }

        fn value(&self) -> usize {
            self.0
        }
    }

    // 单线程测试
    println!("=== 单线程测试 ===");
    for _ in 0..5 {
        let id = AutoId::new();
        println!("{}", id.value());
    }

    println!("\n=== 多线程测试（5个线程，每个生成1个ID）===");
    let mut handles = vec![];
    for i in 0..5 {
        let handle = thread::spawn(move || {
            let id = AutoId::new();
            println!("线程 {}: ID = {}", i, id.value());
        });
        handles.push(handle);
    }
    for handle in handles {
        handle.join().unwrap();
    }

    println!("\n最终 AUTO_ID 值: {}", AUTO_ID.load(Ordering::SeqCst));
}

```


## 惰性初始化`static`

```rust
// static变量必须在编译时就能确定其值，但是Box::new(1)是一个运行时函数调用，不是编译时常量。
static DEMO: Box<i32> = Box::new(1);
fn main() {
    println!("{}", *DEMO);
}
```

### 使用`lazy_static`
```toml
[dependencies]
lazy_static = "1.5.0"
```
```rust
use lazy_static::lazy_static;
// 使用lazy_static这个crate可以实现惰性初始化 将static变量初始化延迟到运行时
lazy_static! {
        static ref DEMO: Box<i32> = Box::new(1);
  //    ^^^^^^ ^^^ lazy_static!创建的是 静态引用 因此所以定义的静态变量都是不可变引用
}
fn main() {
    println!("{}", *DEMO);
}
```
`lazy_static`在第一次访问时会被初始化，而后续的访问会引用同一个值，这样可以有效地避免每次访问时重新初始化或创建对象。

### `lazy_static` 示例
```rust
use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
    static ref CONFIG: HashMap<&'static str, u8> = {
        println!("CONFIG初始化");
        let mut config = HashMap::new();
        config.insert("Apple", 1);
        config.insert("Orange", 2);
        config.insert("Banana", 3);
        config
    };
}

fn main() {
    println!("CONFIG还未初始化");
    println!("Banana: {:?}", CONFIG.get("Banana").unwrap()); // 在此次访问时才会初始化 然后获取值
    println!("Orange: {:?}", CONFIG.get("Orange").unwrap()); // 直接获取值
}
```

## `Box::laek`
`Box::laek` 通过泄漏内存，可将一个值转换为`'static`生命周期；
转换后该值将不会被回收，直至程序本身结束。
```rust
#[derive(Debug)]
struct Demo(u8);
impl Demo {
  fn from(v: u8) -> Self {
    Demo(v)
  }

  fn update(&mut self, v: u8) {
    self.0 = v
  }
}
static mut WRAPPER: Option<&mut Demo> = None;
fn main() {
  let mut demo = Demo::from(0);
  unsafe {
    demo.update(100);
    // WRAPPER = Some(&mut demo);
    //             ^^^^^^^^^ demo 的生命周期不够长
    WRAPPER = Some(Box::leak(Box::new(demo)));
    //             ^^^^^^^^^^^^^^^^^^^^^^^^^ 使用Box::leak将demo转换为'static生命周期
  }

  unsafe {
    println!("WRAPPER: {:?}", *(&raw const WRAPPER));
    if let Some(demo_) = WRAPPER.as_mut() {
      demo_.update(10);
    }
    println!("WRAPPER: {:?}", *(&raw const WRAPPER));
  }
}
```