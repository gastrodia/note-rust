# 方法 Method

## 定义方法
```rust
use std::f64::consts::PI;

fn main() {;
    #[derive(Debug)]
    struct Circle {
        x: f64,
        y: f64,
        radius: f64
    }

    impl Circle {
        // 关联函数 类似构造函数
        fn new(x: f64, y: f64, radius: f64) -> Circle {
            Circle {
                x,
                y,
                radius
            }
        }

        // 关联函数 类似静态方法
        fn get_pi() -> f64 {
            PI
        }

        // 方法 读取自身属性
        fn get_area(&self) -> f64 {
            Circle::get_pi() * self.radius.powf(2.0)
        }

        // 方法 修改自身属性
        fn move_to(&mut self, x: f64, y:f64) {
            self.x = x;
            self.y = y;
        }
    }

    // 可以有多个impl
    impl Circle {
        fn scale(&mut self, s: f64) -> f64 {
            self.radius *= s;
            self.radius
        }
    }


    let mut c = Circle::new(0.0, 0.0, 2.0);
    println!("c: {:?}", c);
    let c_area = c.get_area();
    println!("c_area: {}", c_area);
    c.move_to(1.0, 1.0);
    c.scale(2.0);
    println!("c: {:?}", c);
    println!("c.radius : {:?}", c.radius);
}

```

## 为枚举实现方法
```rust
fn main() {
    enum Action {
        MoveTo {x: f64, y: f64}
    }

    impl Action {
        fn new(x: f64, y: f64) -> Action {
            Action::MoveTo {x, y}
        }

        fn get_position(&self) -> (f64, f64) {
            match self {
                Action::MoveTo {x, y} => (*x, *y)
            }
        }
    }

    let action = Action::new(1.0, 1.0);
    let (x, y) = action.get_position();
    println!("x: {:?}, y: {:?}", x, y);
}
```