# 变量绑定与解构

## 变量的绑定
```rust
fn main() {
    let (a, mut b): (i32, i32) = (1, 2);
    println!("b的初始值: {}", b);
    b = 3;
    assert_eq!(a, 1);
    assert_eq!(b, 3);
    println!("a:{}", a);
    println!("b:{}", b);

    /*

        assert_eq! 是 Rust 的一个宏，用于断言两个表达式是否相等
    如果相等，则继续执行；如果不相等，则程序会 panic
    主要用于测试和调试代码
    返回值是 ()，即 Rust 中的空元组（unit type）
         */

    // print! - 打印文本但不换行
    // println! - 打印文本并换行
    /*
    为什么要加 !
    在 Rust 中，带 ! 的表示这是一个宏（macro），而不是普通函数。
    主要原因是：
    宏更灵活 - 宏可以接受可变数量的参数，而普通函数必须有固定的参数数量
    编译时展开 - 宏在编译时被展开成实际的代码，可以生成多行代码
    格式化字符串检查 - 编译器可以在编译时检查格式化字符串的正确性
    比如这些都是合法的宏调用：
    如果 println 是普通函数，就无法实现这种灵活的参数处理。这就是为什么 Rust 选择使用宏来实现打印功能。
     */
    print!("不会换行");
    print!("不会换行");
    println!("不会换行");
    print!("被上面的println换行了");
}
```


## 解构
```rust
struct Struct {
    // 定义一个结构体
    e: i32,
    f: bool,
}

const MAX_SIZE: i32 = 30; // 常量可以定义在函数体外部
// let size = 20; // let 变量不可定义在函数体外部


fn main() {
    let (a, b, c, d, e, f);
    (a, b) = (1, 2); // 给 a 和 b 赋值

    [c, .., d, _] = [true, false, true]; // c 表示取第一个值，..表示忽略中间的值，d 表示取倒数第二个值，_ 表示忽略最后一个值
    Struct { e, f, .. } = Struct { e: 1, f: true }; // e 表示取 e 的值，f 表示取 f 的值，.. 表示忽略剩下的值
    println!("a与b: {} {}", a, b);
    println!("{} {}", 'c', c);
    println!("{} {}", 'd', d);
    println!("{} {}", 'e', e);
    println!("{} {}", 'f', f);
    println!("-------");

    assert_eq!((a, b, c, d, e, f), (1, 2, true, false, 1, true)); // 正确：元组可以包含不同类型
                                                                  // assert_eq!([a, b, c, d, e, f], [1, 2, true, false, 1, true]); // 错误：数组必须是相同类型
    assert_eq!([a, b], [1, 2]);

    assert_eq!(e, 1);

    assert_eq!(f, true);

    /*
    {:?} 的含义:
    {:?} 是一个调试格式化标记（Debug formatting）
    用于打印实现了 Debug trait 的类型
    普通的 {} 不能打印 () 类型，必须使用 {:?}
     */

    println!("data {:?}", (a, b));

    // 声明常量
    const MAX_POINTS: u32 = 100000; // 必须注明类型
                                    // MAX_POINTS = 110000; // 错误：常量不能被修改
                                    // const MAX_POINTS: u32 = 110000; // 不可重复声明
    println!("常量: {}", MAX_POINTS);
    println!("常量MAX_SIZE: {}", MAX_SIZE);

    // 声明变量
    let x = 5; // 类型可以推断 自动推断为 i32
    println!("变量x: {}", x);
    // x = 6; // 错误
    let x = x + 1; // 变量遮蔽
    println!("变量x: {}", x);
    // 且变量遮蔽可以覆盖类型
    let x = "hello"; // 把i32类型的变量变成了str类型
    println!("变量x: {}", x);

    let mut x = false; // 可以将let变量遮蔽为mut变量
    println!("变量x: {}", x);
    x = true;
    println!("变量x: {}", x);

    let mut y = 10;
    println!("变量y: {}", y);
    y = y + 1;
    println!("变量y: {}", y);
    let y = y + 1; // 可以将mut变量遮蔽为let变量
    // y = y + 1;
    println!("变量y: {}", y);
}
```


`const` 必须注明类型，而 `let` 可以类型推断 \
常量命名通常使用全大写字母(如 `MAX_POINTS`)

常量在编译时必须确定值 \
变量可以在运行时计算值
```rust
const MAX_POINTS: u32 = 100 * 1000;  // OK：编译时可计算
const RANDOM: i32 = rand::random();   // 错误：运行时才能确定

let x = rand::random();  // OK：运行时计算没问题
```



常量没有固定的内存地址，编译器会在使用处内联其值 \
变量有具体的内存地址


常量可以在任何作用域中定义，包括全局作用域 \
变量只能在函数内部或代码块中定义


常量不能被重影（重新声明） 变量遮蔽(`shadowing`) \
`let` 变量可以通过重新声明来重影

变量遮蔽与`mut`的区别
- 第二个 `let` 生成了完全不同的新变量，
- 两个变量只是恰好拥有同样的名称，
- 涉及一次内存对象的再分配 ，
- 而 `mut` 声明的变量，
- 可以修改同一个内存地址上的值，
- 并不会发生内存对象的再分配，性能要更好。