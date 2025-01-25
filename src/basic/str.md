# 字符串与切片

Rust的字符串类型是`String`。
str是一个不可变的字符串切片，通常以引用的形式出现，`&str`。

## 切片
```rust
// 字符串
fn main() {
    // 切片
    let s = String::from("hello world");

    // let s = "hello world"; // 效果一致

    let s1 = &s[..2]; // 0到 索引2前面一位
    let s2 = &s[3..]; // 3到 末尾
    let s3 = &s[6..9]; // 6 到 8
    let s4 = &s[..]; // 完整的

    println!("s: {}", s);
    println!("s1: {}", s1);
    println!("s2: {}", s2);
    println!("s3: {}", s3);
    println!("s4: {}", s4);
    println!("s: {}", s); // 不会影响原 s
}
```

## 中文字符串切片问题
```rust
fn main() {
    println!("---chinese_error---");
    let s = "这么难吗";
    // let s1 = &s[..2]; // 会报错

    // 每个汉字占用三个字节
    // 若切的不是三的倍数 会使得下刀处不在边界上 切不出完整的汉字 则报错
    /*
    因为在 Rust 中，
    字符串是 UTF-8 编码的，
    而 s[..2] 试图对字符串切片时以字节为单位，
    而不是以字符为单位。
    这会导致潜在的无效切片，
    因为 UTF-8 编码的字符可能占用多个字节。
    例如，中文字符通常占用 3 个字节。
    */

    let s1 = &s[..3]; // 切出 【这】 字
    println!("s1: {}", s1);
}
```

## 切片问题
```rust
fn main() {
    println!("---easy_error---");
    fn slice_str(s: &String, stat: usize, end: usize) -> &str {
        &s[stat..end]
    }

    let mut s = String::from("hello");

    let world = slice_str(&s, 1, 3); // 这里有不可变引用
                                     // s.clear(); // 这里存在可变引用
                                     // 违背了可变与不可变同时存在原则
    println!("world: {}", world);
    // world 生命周期结束 不可变引用被释放
    s.clear(); // 不会报错
}
```

## 字符串操作
```rust
fn main() {
    println!("---update_string---");

    let mut s = String::from("hello");

    println!("s: {}", s);
    // 追加
    s.push_str(", world!");
    println!("s追加字符串: {}", s);

    // 插入
    s.insert_str(0, "before ");
    println!("s插入: {}", s);

    // 替换1 [replace](适用于String 于 &str) ( 将返回一个新的String 而不是修改原值
    let s1 = s.replace("hello", "hi");
    println!("s替换hello为hi后s1: {}", s1);

    let s2 = "hello rust, I love rust, rust_over";
    let s3 = s2.replace("rust", "R_U_S_T"); // 所有匹配的字符都将替换

    println!("s3:{} => {}", s2, s3);

    // 替换2 [replacen] (适用于String 于 &str) ( 需要指定次数 将返回一个新的String 而不是修改原值
    let s4 = s2.replacen("rust", "PYTHON", 2); // 前两个匹配的被替换，后面的不替换
    println!("s4:{} => {}", s2, s4);

    // 替换3 [replace_range](只适用String)(会直接修改原值不会返回新类型 但要注意字符边界问题
    let mut s5 = String::from("rust好难");
    s5.replace_range(7.., "简单");
    println!("s5:{}", s5);

    // 删除
    /*
    以下方法都是直接修改原值，所以只适用于String
    pop 删除并返回最后一个字符
    remove 删除并返回指定位置的字符 (注意字符边界问题
    truncate 删除指定位置后的字符串 没有返回值 (注意字符边界问题
    clear 清空 没有返回值
    */
    let mut s6 = String::from("在很久很久以前");
    let s6_pop = s6.pop();
    println!("s6 pop:{}, {:?}", s6, s6_pop);

    let s6_remove = s6.remove(0);
    println!("s6 remove:{}, {:?}", s6, s6_remove);

    s6.truncate(6);
    println!("s6 truncate:{}", s6);

    s6.clear();
    println!("s6 clear:{}", s6);

    // 连接
    // 使用 + 运算符  加号的左边只能是String类型 且运算后会移交所有权至等号左边的新变量 加号的右边必须为 字符串切片类型
    let s7 = String::from("一二三");
    let s8 = String::from("四五六");
    let s9 = "七八九";

    let s10 = s7 + &s8; // s7的所有权move到s10上了
                        // println!("s7: {}", s7); // 这里将无法再访问s7
    println!("s8: {}", s8); // 不会影响s8 因为在上面的 +运算 中 s8是不可变引用 不移交所有权
    println!("s10: {}", s10);
    let s11 = s10 + s9;
    println!("s11: {}", s11);

    let s12 = String::from(" ");
    let s13 = String::from("world");
    // 亦或 format
    let s14 = format!(
        "{}{}{}{}",
        s12,
        "hello",
        &s13,
        "!"
    );
    println!("s14: {}", s14);
    println!("s13: {}", s13);
    println!("s12: {}", s12);
    // 为什么这里可以继续使用s12 不应该是s12的所有权被移交给format函数了吗
    // 答：format! 是一个宏 与普通函数不同，不会将变量的所有权移动到参数上
}
```

## 字符与字节
```rust
fn string_char() {
    println!("---update_string---");
    let s1 = "rust好难";
    for char in s1.chars() {
        println!("char: {}", char);
    }

    for byte in s1.bytes() {
        println!("byte: {}", byte);
    }
}

```