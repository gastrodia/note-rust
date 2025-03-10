# `&'static` 和 `T: 'static`


## 通过裸指针窥探到内存中真实的值
```rust
use std::slice::from_raw_parts;
use std::str::from_utf8_unchecked;
fn main() {
    fn analyze() -> (*const u8, usize) {
        let string = "你好世界";
        let ptr: *const u8 = string.as_ptr();
        let len = string.len();
        // string 变量的生命周期已经结束，但是其值&'static str 仍然存在
        (ptr, len)
    }
    fn peeking(ptr: *const u8, len: usize) -> &'static str {
        // 通过裸指针窥探到其真实的值
        unsafe {
            let something = from_raw_parts(ptr, len);
            // println!("{:?}", something);
            from_utf8_unchecked(something)
        }
    }

    let (ptr, len) = analyze();
    println!("{:p} {len}", ptr);
    let world = peeking(ptr, len);
    println!("{}", world);
    println!("{}", peeking(ptr, 3 * 2)); // 缩短长度还能截取部分
    // println!("{}", peeking(ptr, 100)); // 取出来了一些奇怪的东西
    // println!("{}", peeking(0x111111111111 as *const u8, 100)); // 取出来了一些奇怪的东西 而且程序报错退出
}
```
事实证明：\
字符串字面量永远不会被 drop，但是引用他们的变量仍然遵循生命周期原则。


## 相同的 &'static str 他们的ptr和len相同
```rust
fn main() {
    let s1 = "你好你好";
    fn get_str() -> &'static str {
        "你好你好"
    }
    let s2 = get_str();
    let s1_ptr = s1.as_ptr();
    let s2_ptr = s2.as_ptr();
    println!("{:p} -> {:p}", s1, s2);
    assert_eq!(s1_ptr, s2_ptr); // 事实证明 相同的 &'static str 他们的ptr和len相同
}
```

```
+------------------+  高地址
|      Stack       |  (栈：局部变量、函数调用信息等)
|        ↓         |   - 函数内的局部变量（例如基本类型、结构体等）
|                  |   - 动态分配的类型的元数据（例如 `String` 的指针、长度、容量）
+------------------+
|        ↑         |
|       Heap       |  (堆：动态分配的内存，通常通过 Box、Vec、String 等分配)
|                  |   - `Box::new`、`Vec::new`、`String::from` 创建的内容
|                  |   - 对象的数据存储位置
+------------------+
|       BSS        |  (未初始化的静态/全局变量)
|                  |   - `static mut COUNT: u32;` 等未初始化的变量
+------------------+
|      Data        |  (已初始化的静态/全局变量)
|                  |   - `static NUMBERS: [i32; 3] = [1, 2, 3];` 等初始化的变量
+------------------+
|     .rodata      |  (只读数据段：常量、字符串字面量等)
|                  |   - 字符串字面量 `let s = "hello";`
|                  |   - `const SIZE: u16 = 1024;`
+------------------+
|      Text        |  (代码段：存放编译后的机器码)
|                  |   - 函数的机器码
|                  |   - 程序执行的指令
+------------------+  低地址
```

## 静态生命周期
```rust
use std::fmt::Debug;
const SIZE: u16 = 1024;
fn main() {
    fn print_t_1<T: Debug>(t: &'static T) {
        // t 必须是一个 'static 生命周期的引用，
        // 它是一个全局的静态变量或者常量，
        // 或者它的生命周期与程序的整个生命周期一样长。
        println!("{:?}", t);
    }
    fn print_t_2<T: Debug + 'static>(t: &T) {
        // t 引用指向的对象本身必须是 'static 生命周期的，
        // 即该对象的生命周期必须等于或长于程序的整个生命周期。
        println!("{:?}", t);
    }

    fn print_t_3<T: Debug + 'static>(t: T) {
        // T 的生命周期是 'static
        // t 不是引用，而是直接拥有 T 的所有权。
        // 这里 t 直接获得 T 的所有权，
        // 因此 T 必须是 'static 类型，即它的生命周期和程序一样长。
        println!("{:?}", t);
    }

    fn print_t_4<T: Debug + 'static>(t: &'static T) {
        println!("{:?}", t);
    }

    // 总结：
    // <T>(t: &'static T) 具有 'static 生命周期的引用
    // <T: 'static>(t: &T) 值必须是静态的 传入应用
    // <T: 'static>(t: T) 值必须是静态的 传入所有权
    // <T: 'static>(t: &'static T) // 'static 生命周期

    // 值是静态的，引用不一定是静态的，
    // 但是如果引用是静态的，那么引用的值必须是静态的。

    let s1 = 10;

    // print_t_1(&s1); // Err: s1的生命周期不够长 print_t_1需要一个静态的引用
    print_t_1(&SIZE);
    print_t_2(&s1);
    print_t_3(&SIZE);
    print_t_4(&SIZE);


    let s2;
    let s3;
    {
        static X: u8 = 10;
        s2 = &X;
        let y = "hello";
        s3 = y;
        // 因为X和y是静态的，因此在改作用域结束时，不会销毁其值本身，但会变量仍会被销毁
    }
    println!("s2: {}", s2);
    println!("s3: {}", s3);
}
```