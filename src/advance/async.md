# async

## 定义`async`函数
```toml
[dependencies]
futures = "0.3.31"
```

```rust
use futures::executor::block_on;

fn main() {
  async fn async_fn() {
//^^^^^ ^^ 使用async fn 定义一个异步函数，返回一个Future
    println!("async fn run..");
  }

  println!("1");
  let f = async_fn(); // 异步函数是惰性的，不会立即执行
  println!("2");
  block_on(f);
  //^^^^^^^^ block_on 会阻塞当前线程 直到异步函数完成
  println!("3");
}
```

## 使用`.await`
```rust
use futures::executor::block_on;
fn main() {
  // async fn b -> async fn a
  async fn a() {
    println!("a run ..");
  }
  async fn b() {
    // a();
    println!(">1");
    a().await; // await 会等待a函数完成，并返回a函数的返回值
    //  ^^^^^ await  不会阻塞当前线程，而是让出控制权给执行器
    println!(">2");
    println!("b run ..")
  }

  block_on(b());
}
```

## 使用`join!`并发异步

### `block_on`的缺陷
```rust
use futures::executor::block_on;
fn main() {
  struct Song {
    author: String,
    name: String,
    lyrics: String,
  }
  async fn learn_song() -> Song {
    println!("我学会了一首歌");
    Song {
      author: "cxk".to_owned(),
      name: "鸡你太美".to_owned(),
      lyrics: "鸡你太美~ baby ~".to_string(),
    }
  }

  async fn sing_song(song: &Song) {
    println!("为大家带来一首{}的《{}》，{}", song.author, song.name, song.lyrics);
  }

  async fn dance() {
    println!("~跳舞🕺🏀~");
  }

  // 我们需要在sing_song使用learn_song的返回值
  let song = block_on(learn_song());
  block_on(sing_song(&song));
  block_on(dance());
  // 以上是顺序执行的
  // 因为block_on会阻塞当前线程，则其是顺序执行的 learn_song → sing_song -> dance (完全串行)
  // 而事实上 dance 与 learn_song 和 sing_song 并无依赖关系，但也被迫等待，浪费了并发执行的机会
}

```

### 使用`join!`并发异步

```rust
use futures::executor::block_on;
fn main() {
  struct Song {
    author: String,
    name: String,
    lyrics: String,
  }
  async fn learn_song() -> Song {
    println!("我学会了一首歌");
    Song {
      author: "cxk".to_owned(),
      name: "鸡你太美".to_owned(),
      lyrics: "鸡你太美~ baby ~".to_string(),
    }
  }

  async fn sing_song(song: &Song) {
    println!("为大家带来一首{}的《{}》，{}", song.author, song.name, song.lyrics);
  }

  async fn dance() {
    println!("~跳舞🕺🏀~");
  }

  async fn learn_and_sing() {
    sing_song(&learn_song().await).await;
  }

  async fn run() {
    futures::join!(learn_and_sing(), dance());
  //^^^^^^^^^^^^^^^ join! 会等待所有任务完成 类似 javascript 的 Promise.all
  }

  block_on(run());
}
```

## 使用`tokio`更直观的看上面的例子
```rust
use std::time::Instant;
use tokio;

fn main() {
  println!("========== 顺序执行 (block_on) ==========");
  block_on_task();
  
  println!("\n========== 并发执行 (await + join!) ==========");
  await_task();
}

// 创建一个简单的 block_on 函数，使用 tokio runtime
fn block_on<F: std::future::Future>(future: F) -> F::Output {
  tokio::runtime::Runtime::new()
    .unwrap()
    .block_on(future)
}

struct Song {
  author: String,
  name: String,
  lyrics: String,
}

  async fn learn_song() -> Song {
    println!("[learn_song] 开始学歌...");
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    println!("[learn_song] ✅ 我学会了一首歌 (耗时2秒)");
    Song {
      author: "cxk".to_owned(),
      name: "鸡你太美".to_owned(),
      lyrics: "鸡你太美~ baby ~".to_string(),
    }
  }

  async fn sing_song(song: &Song) {
    println!("[sing_song] 开始唱歌...");
    tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
    println!("[sing_song] ✅ 为大家带来一首{}的《{}》，{} (耗时3秒)", song.author, song.name, song.lyrics);
  }

  async fn dance() {
    println!("[dance] 开始跳舞...");
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    println!("[dance] ✅ ~跳舞🕺🏀~ (耗时2秒)");
  }

fn block_on_task() {
  let start = Instant::now();
  
  // 我们需要在sing_song使用learn_song的返回值
  let song = block_on(learn_song());
  block_on(sing_song(&song));
  block_on(dance());
  
  let elapsed = start.elapsed();
  println!("⏱️  总耗时: {:.2}秒", elapsed.as_secs_f64());
  // 以上是顺序执行的
  // 因为block_on会阻塞当前线程，则其是顺序执行的 learn_song → sing_song -> dance (完全串行)
  // 预计总耗时: 2 + 3 + 2 = 7秒
  // 而事实上 dance 与 learn_song 和 sing_song 并无依赖关系，但也被迫等待，浪费了并发执行的机会
}


fn await_task() {
  async fn learn_and_sing() {
    let song = learn_song().await;
    sing_song(&song).await
  }
  async fn run() {
    futures::join!(learn_and_sing(), dance());
  //^^^^^^^^^^^^^^^ join! 会等待所有任务完成 类似 javascript 的 Promise.all
  // sing_song 和 dance 并发执行，总耗时取决于两者中较慢的一个
  }

  let start = Instant::now();
  block_on(run());
  let elapsed = start.elapsed();
  
  println!("⏱️  总耗时: {:.2}秒", elapsed.as_secs_f64());
  // 优化后的执行流程:
  // 1. learn_song (2秒) - 必须先执行
  // 2. sing_song (3秒) 和 dance (2秒) 并发执行，耗时 max(3, 2) = 3秒
  // 预计总耗时: 2 + 3 = 5秒 (相比顺序执行的7秒，节省了2秒!)
}

```

```text
========== 顺序执行 (block_on) ==========
[learn_song] 开始学歌...
[learn_song] ✅ 我学会了一首歌 (耗时2秒)
[sing_song] 开始唱歌...
[sing_song] ✅ 为大家带来一首cxk的《鸡你太美》，鸡你太美~ baby ~ (耗时3秒)
[dance] 开始跳舞...
[dance] ✅ ~跳舞🕺🏀~ (耗时2秒)
⏱️  总耗时: 7.01秒

========== 并发执行 (await + join!) ==========
[learn_song] 开始学歌...
[dance] 开始跳舞...
[learn_song] ✅ 我学会了一首歌 (耗时2秒)
[sing_song] 开始唱歌...
[dance] ✅ ~跳舞🕺🏀~ (耗时2秒)
[sing_song] ✅ 为大家带来一首cxk的《鸡你太美》，鸡你太美~ baby ~ (耗时3秒)
⏱️  总耗时: 5.00秒
```