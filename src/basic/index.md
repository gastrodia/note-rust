# Rust 基本概念
```rust
fn main() {
    println!("Hello, world!");
    println!("----------");
    say_hi();
    println!("----------");
    say_line();
    println!("----------");
    hi_1();
}

fn say_hi() {
    let en = "Hello world";
    let cn = "你好，世界";
    let regions = [en, cn];

    for item in regions.iter() {
        println!("{}", &item);
    }
}

fn say_line() {
    let title = "
    hi,
    I am very happy.
    ";

    println!("{}", &title);
}

fn add(args: &[i32]) -> i32 {
    let mut result = 0;
    for arg in args {
        result += arg;
    }
    return result;
}

fn hi_1() {
    let a = 10;

    let b: i32 = 20;

    let mut c = 30;

    let d = 40i32;

    let e = 50_i32;

    c = add(&vec![a, b, c, d, e]);

    println!("{}", c);
}
```