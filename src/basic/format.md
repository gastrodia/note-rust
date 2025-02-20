# 格式化输出

```rust
use std::f32::consts::PI;

fn main() {
    println!("hello");
    print!("hello\n");
    eprintln!("error");
    eprint!("error\n");

    println!("{:#?}", vec![1, 2, 3]);

    println!("{0}_{1}", "位置", "参数");

    println!("{x}_{y}", y = "参数", x = "具名");

    println!("{:.2}__{:.3}", PI, PI);
    println!("{:.3}", 3.1); // 不足则0补位

    println!("{:.2}", "不要断章取义");

    println!("_{:5}_{:5}_", "ok", "好"); // 至少五位，如果不够就在后面补空格

    println!("_{:width$}_{:width$}_", "ok", "好", width=5); // 指定宽度


    println!("{:+}", 100);

    println!("{:05}", 1); //输出5位，不足则向前面补0

    println!("| {:<100} |", "左对齐");
    println!("| {:>100} |", "右对齐");
    println!("| {:^100} |", "居中对齐");


    println!("{:#b}", 100); // 二进制
    println!("{:#o}", 100); // 八进制
    println!("{:#x}", 1000); // 十六进制小写
    println!("{:#X}", 1000); // 十六进制大写
    println!("{:x}", 1000); // 不含0x十六进制

    println!("{:e}", 100000);  // 对数
    println!("{:E}", 100000);  // 对数

    println!("{:p}", String::from("world").as_ptr()); //指针

    let world = String::from("world");
    println!("hello, {world}")
}
```