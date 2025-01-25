# 引用与借用

## 引用与借用
```rust
// 引用与借用
fn main() {
    // 一个变量获取另一个变量的引用， 称之为借用


    let x = 10;
    let y = &x; // y是x的引用

    assert_eq!(10, x);
    // assert_eq!(10, y); // 报错
    assert_eq!(10, *y); // 解引用
    assert_eq!(x, *y);
    println!("{}, {}", x, y);

    fn get_s1_len(s1: &String) -> usize {
        // 不可变引用
        // 允许你使用值，但是不获取所有权
        // 访问s1
        s1.len()
    }

    fn update_s1(s1: &mut String) {
        // 可变引用
        // 修改了外部传入的s1
        s1.push_str(" update_s1");
        println!("todo中的s1: {}", s1);
    }

    let mut s1 = String::from("hello");

    let s1_len = get_s1_len(&s1);

    // 可以继续访问 s1
    println!("s1: {} len: {}", s1, s1_len);

    update_s1(&mut s1);
    // 可以继续使用s1
    println!("{}", s1);
    s1.push_str(", world");
    // update_s1函数中的修改的s1在这里可以访问
    println!("{}", s1); // hello update_s1, world

    fn update_two_len(s1: &mut String, s2: &mut String) {
        s1.push_str("__1");
        s2.push_str("__2");
    }
    // 同一作用域 可变引用同时只能存在一个
    // update_two_len(&mut s1, &mut s1); // second mutable borrow occurs here

    fn update_and_get_len(s1: &String, s2: &mut String) -> usize {
        s2.push_str("__update_s2");
        s1.len()
    }

    // 可变引用与不可变引用不能同时存在
    // update_and_get_len(&s1, &mut s1); // mutable borrow occurs here

    // 悬垂引用: 返回一个变量的引用
    /*
    fn get_string() -> &String {
        let s = String::from("hello");
        &s
    }
    // 因为当get_string执行完成后内部变量s将被销毁释放 但却返回了变量s的引用 因此校验不通过
    let s3 = get_string();
    */
}


```

## 非词法生命周期
```rust
fn main() {
    // 非词法生命周期"(NLL)
    let mut s = String::from("hello");

    let r1 = &s;
    let r2 = &s;
    println!("{} and {}", r1, r2); // r1 和 r2 在这里是活跃的
    // 从这里开始 r1 和 r2 不再活跃，它们的生命周期结束了 r1和r2被drop
    // 编译器通过分析发现这两个引用在 println! 后不再被使用，所以认定它们的生命周期到此结束。
    let r3 = &mut s;
    // 若后面再使用 r1或r2 将会报错 因为会使得r1或r2与r3同时存在，违背了 可变引用与不可变引用不能同时存在 原则
    // println!("{} and {}", r1, r2); // 报错：可变引用与不可变引用不能同时存在
    println!("{}", r3);

    // 只有在可变引用与不可变引用
}
```