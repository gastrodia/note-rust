# 深入了解特征


## 关联类型
```rust
use std::fmt::Debug;

fn main() {

    trait GoGo {
        type Output; // 一个占位符
        fn go_go(&mut self) -> Self::Output;
    }

    impl GoGo for u8 {
        type Output = u8; // 告诉trait占位符真实的类型
        fn go_go(&mut self) -> Self::Output {
            *self += 1;
            *self
        }
    }

    let mut num = 1_u8;
    println!("num: {}", num);
    num.go_go(); // 2
    num.go_go(); // 3
    num.go_go(); // 4
    let num2 = num.go_go(); // 5
    println!("num: {}", num);
    println!("num2: {}", num2);

    // 如果使用泛型：
    trait ToTo<T> {
        fn to_to(&mut self) -> T;
    }

    impl ToTo<u8> for u8 {
        fn to_to(&mut self) -> u8 {
            *self += 1;
            *self
        }
    }

    let mut val = 1_u8;
    println!("val: {}", val);
    val.to_to(); // 2
    val.to_to(); // 3
    val.to_to(); // 4
    let val2 = val.to_to(); // 5
    println!("val: {}", val);
    println!("val2: {}", val2);
}
```

## 默认泛型类型参数
```rust
use std::fmt::Debug;

fn main() {
    // 这里没有指定泛型T的默认类型
    trait Up<T>: Debug { // 特征约束。要求实现Up trait的数据都必须实现Debug trait
        type Output;
        fn up(&self, t: &T, separator: &str) -> Self::Output;
    }

    // 这里指定了泛型T的默认类型为 Self 即实现该trait的那个类型
    trait Down<T = Self>: Debug {
        type Output;
        fn down(&self, t: &T, separator: &str) -> Self::Output;
    }

    #[derive(Debug)]
    struct Point<T> {
        x: T,
        y: T
    }

    // 这里 因为Up的泛型没有默认值 所以需要手动传入泛型参数
    impl Up<Point<u8>> for Point<String> {
        type Output = Point<String>;
        fn up(&self, target: &Point<u8>, separator: &str) -> Self::Output {
            Point {
                x: format!("{}{}{}", self.x, separator, target.x),
                y: format!("{}{}{}", self.y, separator, target.y)
            }
        }
    }

    // 不为Down指定具体的类型，Down会取默认值Self类型
    impl Down for Point<String> {
        type Output = Self;
        fn down(&self, target: &Self, separator: &str) -> Self::Output {
            Point {
                x: format!("{}{}{}", self.x, separator, target.x),
                y: format!("{}{}{}", self.y, separator, target.y)
            }
        }
    }

    let p1 = Point { x: "a".to_string(), y: "b".to_string() };
    let p2 = Point { x: 1, y: 2 };
    let p3 = p1.up(&p2, "+");
    println!("p3 {:?}", p3);
    let p4 = Point { x: "2".to_string(), y: "3".to_string() };
    let p5 = p1.down(&p4, "-");
    // 因为我们在为Point实现Down时，没有为Down传入泛型参数，
    // 因此 down函数的第一个参数只能是与p1相同的类型 即 String 类型。而不能传入其他类型
    println!("p5 {:?}", p5);
}
```

## 完全限定
```rust
use std::fmt::Debug;

fn main() {

    trait A {
        fn fly(&self) {
            println!("A fly...");
        }
        fn run() {
            println!("A Run...");
        }
    }

    trait B {
        fn fly(&self) {
            println!("B fly...");
        }
    }

    struct Ta {}

    impl A for Ta {}
    impl B for Ta {}
    impl Ta {
        fn fly(&self) {
            println!("Ta...");
        }
    }

    let ta = Ta {};
    ta.fly();

    A::fly(&ta); // 手动指定&self
    B::fly(&ta); // 手动指定&self

    // A::run() // 这样就不行了
    <Ta as A>::run(); // 完全限定语法，告诉编译器A就是Ta
}

```