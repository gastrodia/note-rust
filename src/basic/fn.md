# 函数

```rust
fn main() {
    fn todo(x: i32) -> i32 {
        if x > 5 {
            return x - 5
        }
        x + 5
    }

    let a = todo(12);
    let b = todo(1);

    println!("a: {}", a);
    println!("b: {}", b);

    // 若不指定函数的返回值类型 则函数会隐式的返回一个单元类型（空元组）

    fn undo() {}
    assert_eq!(undo(), ());

    // 用不返回的的发散函数

    fn never() -> ! {
        panic!("this is never");
        // 若调用never则程序崩溃
    }

    // never();

    // 死循环也将永无返回值
    fn forever() -> ! {
        loop {
        }
        // println!("无法到达")
    }
    // forever()

}
```