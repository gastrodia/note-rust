# 语句和表达式

```rust
fn main() {
    fn todo() -> i32 {
        let x = 10; // 语句
        x + 1 // 表达式 // 末尾不能加分号
    }

    let a = todo();

    println!("{}", a);


    fn un_type(num: i32) -> &'static str {
        if num % 2 == 0 { "even" } else { "odd" }
    }

    println!("{} {}", un_type(12), un_type(13));
}
```
