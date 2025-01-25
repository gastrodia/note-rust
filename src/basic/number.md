# 数值类型
数值类型分为：
- 有符号 负数 0 正数
- 无符号 0 正数

- `i8` -128 ~ 127
- `u8` 0 ~ 255
- `i16` -32768 ~ 32767
- `u16` 0 ~ 65535
- `i32` -2147483648 ~ 2147483647
- `u32` 0 ~ 4294967295
- `i64` -9223372036854775808 ~ 9223372036854775807
- `u64` 0 ~ 18446744073709551615
- `i128` -170141183460469231731687303715884105728 ~ 170141183460469231731687303715884105727
- `u128` 0 ~ 340282366920938463463374607431768211455
- `isize` 和 `usize` 是根据当前操作系统位数决定的，32位系统是i32，64位系统是i64


```rust
fn main() {
    const A:(i8, i8) = (-128, 127);
    const B:(u8, u8) = (0, 255);

    println!("常量A: {:?}", A);
    println!("常量B: {:?}", B);

    let a:isize = 1;
    let b:usize = 1;

    println!("变量a: {:?}", a);
    println!("变量b: {:?}", b);

    // 获取当前操作系统位数
    println!("当前操作系统位数: {}", isize::BITS);


    /* 
    Rust 整型默认使用 i32，
    例如 let i = 1，那 i 就是 i32 类型，
    因此你可以首选它，同时该类型也往往是性能最好的。
    isize 和 usize 的主要应用场景是用集合的索引。
     */

    let mut c:i8 = 127;
    // c = c + 1; // stack backtrace 溢出
    c = c - 1;
    println!("变量c: {:?}", c);
    c = c.wrapping_add(4); // 溢出时补码循环 -126
    println!("变量c: {:?}", c);


    println!("{}", "-----------浮点型-------------");

    let d = 3.14;

    let e = 3.14f32;

    println!("变量d: {:?}", d);
    println!("变量e: {:?}", e);


    let abc: (f32, f32, f32) = (0.1, 0.2, 0.3);
    let bcd: (f64, f64, f64) = (0.1, 0.2, 0.3);

    let abc_sum = abc.0 + abc.1;
    let bcd_sum = bcd.1 + bcd.1;

    println!("abc.0 + abc.1 = {}", abc_sum); // 0.3
    println!("bcd.0 + bcd.1 = {}", bcd_sum); // 0.4

    assert_eq!(abc_sum, abc.2);

    println!("{} __ {}", abc.2.to_bits(), abc_sum.to_bits()); // 值相同
    println!("{} __ {}", bcd.2.to_bits(), bcd_sum.to_bits()); // 值不同

    // assert_eq!(bcd_sum, bcd.2); // 断言不通过

    // NaN
    let f = (-1f32).sqrt();
    println!("对负数取平方根：{}, {}", f, f.is_nan());

    // 运算
    let num_sum = 1 + 1;
    let num_diff = 5 - 2;
    let num_product =  3 * 3;
    let num_quotient = 12 / 2;
    let num_remainder = 5 % 2;

    println!("num_sum: {}", num_sum);
    println!("num_diff: {}", num_diff);
    println!("num_product: {}", num_product);
    println!("num_quotient: {}", num_quotient);
    println!("num_remainder: {}", num_remainder);

    // 只有同样类型，才能运算
    // let r1 = 1 + 1.1; // 会报错

    // 对于较长的数字，可以用_进行分割，提升可读性
    let g = 1_000_000;

    // println控制小数位数
    println!("保留两位小数 {:.2}", std::f64::consts::PI);


    // 位运算
    let a = 0b0000_0010;
    let b = 0b0000_0011;

    println!("a:{} {:b}", a, a);
    println!("b:{} {:b}", b, b);

    println!("a & b = {}", a & b);
    println!("a | b = {}", a | b);
    println!("a ^ b = {}", a ^ b);
    println!("!a = {}", !a);
    println!("a << 2 = {} {}", a << 2, 0b1000);
    println!("a >> 2 = {} {}", a >> 2, 0b0000);


    // Range
    // 打印1到5的数字
    /*for i in 1..=5 {
        println!("{}", i);
    }*/
    
    // 打印乘法表
    for x in 1..=9 {
        for y in 1..=x {
            print!("{} * {} = {}\t", y, x, x * y);
        }
        println!();
    }

    // 甚至可以是字符 a-z
    for code_char in 'a' ..= 'z' {
        print!("{} ", code_char);
    }
}
```
