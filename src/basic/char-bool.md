# 字符、布尔、单元类型

## 字符类型
```rust
fn main() {
    let a = 'a';
    let b = '*';
    let c = '我'; // 单引号是char

    let d = "我"; // 双引号是字符串

    let f = '😘'; //

    println!("{}", a);
    println!("{}", b);
    println!("{}", c);
    println!("{}", d);
    println!("{}", f);


    println!("c占用{}个字节", std::mem::size_of_val(&c)); // 4
    println!("d占用{}个字节", std::mem::size_of_val(&d)); // 16
}
```

## 布尔类型
```rust
fn main() {
    let g = true;
    let h = false;

    println!("{}", g);
    println!("{}", h);
}
```

## 单元类型
```rust
fn main() {
    let i = ();
    println!("{:?}", i);
    fn todo() {};
    let j = todo();
    println!("{:?}", j);
}
```

