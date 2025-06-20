# 线程同步：锁、Condvar 和信号量


## `Mutex` 锁🔒
```rust
use std::sync::{Mutex};

fn main() {
  let m = Mutex::new(0);
  {
    let mut lock = m.lock().unwrap();
    //       |                   ^^^^^^^ 使用lock方法向Mutex申请锁
    //       |                           lock方法调用时会阻塞当前线程，直到获取到锁
    //       ^ 获取到了锁。
    // 因此当多个线程同时访问该数据时，
    // 只有一个线程能获取到锁，其它线程只能阻塞着等待，
    // 直到这个锁被当前线程释放，其他某一线程才可获取到这个锁
    *lock = 1;
    // ^^^^^^ 修改被锁保护的值
  } // ← 当 lock 离开作用域后。lock被自动drop。锁被释放

  println!("{:?}", *m.lock().unwrap());
}
```

## 单线程死锁
```rust
use std::sync::{Mutex};

fn main() {
  let m = Mutex::new(0);
  let mut lock1 = m.lock().unwrap();
  *lock1 = 1;
  // ^^^^ lock1 没有被drop

  // drop(lock1);
  // ^^^^ 除非手动销毁锁

  {
    let mut lock2 = m.lock().unwrap();
    // ^^^^ lock1 没有被drop 就申请第二把锁
    *lock2 = 2;
  }
  println!("{:?}", m);
}
```
**总结： 只有再上把锁被`drop`后才能再次获取锁，否则将造成死锁。**

## 多线程间修改数据（共享所有权）
```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
  let counter = Arc::new(Mutex::new(0));
  let mut handles = vec![];

  for _ in  0..10 {
    let counter = Arc::clone(&counter);
    let handle = thread::spawn(move || {
      let mut mun = counter.lock().unwrap();

      *mun += 1;
    });

    handles.push(handle);
  }

  for handle in handles {
    handle.join().unwrap();
  }
  println!("{:?}", *counter.lock().unwrap());
}
```

总结：
- `Rc<T>`和`RefCell<T>`用于单线程内部可变性;
- `Arc<T>`和`Mutex<T>`用于多线程间的内部可变性。


