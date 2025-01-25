# 泛型

## 定义泛型
```rust
use std::any::type_name;
use std::ops::{Add, Mul};

fn main() {
    // 泛型T 且对 T 进行类型约束，
    // 因为T可以是任何类型，但不是所以有类型都能做加法运算，因此限制T为只能做加法运算的类型
    fn add<T: Add<Output = T>>(a: T, b: T) -> T {
        a + b
    }
    let d1 = add(1, 2);
    println!("d1: {}", d1);
    let d2 = add(1_u8, 2_u8);
    println!("d2: {}", d2);

    // 显式指定泛型
    fn plus<T>(x: T) -> T
    where
        T: Mul<Output = T> + From<u8> + std::fmt::Debug,
    {
        let n = 2;
        let m = T::from(n); // 这样将m转为T类型
        println!("m: {:?}, m type: {}", m, type_name::<T>()); // 可以看到m的类型是由x决定的
        x * m
    }

    let d3 = 100; // 因为下一行我们手动指定了类型为u8, d3被类型则自动推断出来了
    let d4 = plus::<u8>(d3);
    println!("d4: {:?} \n", d4); // 200 u8
    let d5 = plus(2.5_f64);
    println!("d5: {:?} \n", d5); // 5.0 f64
    let d6 = plus(-5);
    println!("d6: {:?} \n", d6); // 10 i32
}

```

## 结构体泛型
```rust
use std::ops::{Add, Mul};

fn main() {
    #[derive(Debug)]
    struct Circle<T> {
        x: T,
        y: T,
        radius: f64,
    }

    impl<T> Circle<T>
    where
        T: Copy,
        T: Add<Output = T>,
        T: Mul<Output = T>,
        T: Into<f64>,
    {
        fn new(x: T, y: T, radius: f64) -> Circle<T> {
            Circle { x, y, radius }
        }

        fn distance(&self) -> f64 {
            let x = self.x.into();
            let y = self.y.into();

            (x.powi(2) + y.powi(2)).sqrt()
        }
    }

    let c = Circle::new(1, 1, 2.0);
    println!("c: {:?}", c);

    println!("distance: {}", c.distance());
}

```

## 常量泛型
```rust
fn main() {
    fn debugger_arr<T, const N: usize>(arr: [T; N])
    where
        T: std::fmt::Debug,
    {
        // 可以在运行时读取到N的值
        println!("arr: {:?} len: {}", arr, N);
    }

    let arr1 = [1, 2, 3];
    debugger_arr(arr1);
    println!("{:?}", arr1);
}

```

## const fn
```rust
fn main() {
    const M_SIZE: usize = 8;

    // const fn 在编译期执行
    const fn g_size(b: usize) -> usize {
        b * M_SIZE
    }

    const G_SIZE:usize = g_size(2);


    #[derive(Debug)]
    struct BufferArr<const S: usize> {
        data: [u8; S],
    }

    let bff = BufferArr::<G_SIZE> {
        data: [0; G_SIZE],
    };

    println!("bff: {:?}, len: {}", bff, bff.data.len());
}
```