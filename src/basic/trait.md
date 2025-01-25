# 特征

## 定义trait
 定义特征

 抽象某类行为

 例如 文章和短视频 我们都可以总结其内容
```rust
use std::fmt::{Display, Formatter};
use std::ops::{Add};

fn main() {
    trait Summary {
        // 总结文章内容
        fn summarize(&self) -> String;

        fn owner(&self) -> &str;

        // 关注作者
        fn follow(&self)  {
            println!("成功关注了 {}", self.owner())
        }
    }

    #[derive(Debug)]
    struct Article {
        author: String,
        title: String,
        content: String
    }
    struct Vlog {
        up: String,
        title: String
    }

    impl Summary for Article {
        fn summarize(&self) -> String {
            format!("{}发布了文章《{}》：\"{}\"", self.author, self.title, self.content)
        }
        fn owner(&self) -> &str {
            &(self.author)
        }
    }

    impl Summary for Vlog {
        fn summarize(&self) -> String {
            format!("{}发布了新作品<{}>，快去看看吧~", self.up, self.title)
        }

        fn owner(&self) -> &str {
            &(self.up)
        }

        // 重写
        fn follow(&self) {
            println!("您已经关注过 {} 了", self.owner())
        }
    }

    let rust_hi = Article {
        author: "哆啦B梦".to_string(),
        title: "你好，Rust".to_string(),
        content: "rust 有点难".to_string()
    };

    let manba = Vlog {
        up: "不吃香菜".to_string(),
        title: "爱吃肘击".to_string()
    };

    println!("{}", rust_hi.summarize());
    println!("{}", manba.summarize());
    rust_hi.follow();
    manba.follow();


    // 使用特征作为函数的参数

    // 只要实现了该特征的任何结构体都能作为该函数的参数
    fn broadcast(message: &impl Summary) {
        println!("震惊：{}", message.summarize());
    }

    broadcast(&rust_hi);
    broadcast(&manba);

    // 作为泛型
    fn notify<T: Summary>(a: &T, b: &T) {
        println!("你关注的 {} 和 {} 发布了新作品", a.owner(), b.owner())
    }

    let bang = Article {
        author: "GGBond".to_string(),
        title: "超级棒棒糖".to_string(),
        content: "很好吃".to_string()
    };
    notify(&rust_hi, &bang);
    // 但是
    // notify(&rust_hi, &manba); // 会报错
    // 这是因为：在notify参数中， a 和 b 必须是完全相同的类型 T。
    // 虽然 Article 和 Vlog 都实现了 Summary trait，但它们是两个不同的类型。

    // 多重约束
    fn show<T: Clone + std::fmt::Debug + std::fmt::Pointer>(data: T) {
        let new_data = data.clone(); // 这里其实克隆的是引用
        println!("{:?}", new_data);
        // 打印内存地址
        println!("原始数据指针: {:p}", data);
        println!("克隆后指针: {:p}", new_data);
        // 所以我们克隆的只是引用
    }

    println!("rust_hi数据指针: {:p}", &rust_hi);
    show(&rust_hi);

    println!("{:?}", rust_hi);

    // 使用where改写多重约束
    fn show_v2<T>(data: T)
    where
        T: Clone + std::fmt::Debug
    {
        let new_data = data.clone();
        println!("v2_: {:?}", new_data);
    }

    show_v2(&rust_hi);

    // 函数返回特征

    fn get_summary() -> impl Summary + std::fmt::Debug {
     /*   if is_vlog {
            return Vlog {
                up: "光头强".to_string(),
                title: "可恶的小熊熊".to_string()
            }
        }*/
        // 虽然 Vlog 和 Article 都实现了Summary特征
        // 但它们任然是两个类型 函数任然不能动态的返回两个类型
        // Rust 编译器需要在编译时就知道确切的返回类型

        Article {
            author: "光头强".to_string(),
            title: "可恶".to_string(),
            content: "可恶的小熊熊".to_string()
        }
    }

    println!("{:?}", get_summary());
}
```

## 有条件的实现trait
```rust
use std::fmt::{Display, Formatter};
use std::ops::{Add};

fn main() {
    #[derive(Debug)]
    struct Storage<T> {
        x: T,
        y: T
    }

    impl <T>Storage<T> {
        fn new(x: T, y: T) -> Self {
            Storage {
                x,
                y
            }
        }
    }

    impl <T: Add<Output = T> + Copy> Storage<T> {
        fn sum_x_and_y(&self) -> T {
            self.x + self.y
        }
    }

    impl <T: Copy + ToString>Storage<T> {
        fn put_x_and_y(&self) -> String {
            self.x.to_string() + &(self.y.to_string())
        }
    }

    impl Storage<bool> {
        fn every(&self) -> bool {
            self.x && self.y
        }
    }

    let s1 = Storage::new(2, 1);
    println!("{}", s1.sum_x_and_y());
    let s2 = Storage::new("熊大", "熊二");
    println!("{}", s2.put_x_and_y());
    // println!("{}", s2.sum_x_and_y()); // 会报错 因为s2没有实现 Add trait
    // println!("{}", s2.every()); // 会报错  因为s2不属于 bool类型
    let s3 = Storage::new(true, true);
    println!("{}", s3.every());
    println!("{}", s3.put_x_and_y()); // bool 可以 toString

    // 为自定义结构体实现加法运算
    impl <T: Add<Output = T>>Add for Storage<T> {
        type Output = Storage<T>;

        fn add(self, rhs: Storage<T>) -> Storage<T> {
            Storage {
                x: self.x + rhs.x,
                y: self.y + rhs.y
            }
        }
    }

    let s4 = Storage::new(1, 2);
    let s5 = Storage::new(1, 2);
    let s6 = s4 + s5;
    println!("{:?}", s6);
    // 这里就无法再访问s4 s5了 因为他们在做加法运算时 所有权被移走了
    // println!("{}", s4);
    // println!("{}", s5);

    // 为自定义结构体实现Display

    impl <T: Display> Display for Storage<T> {
        fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
            write!(f, "<x: {}, y: {}>", self.x, self.y)
        }
    }

    let s7 = Storage::new("哈哈", "大笑");
    println!("{:?}", s7);
    println!("{}", s7); // 因为Storage实现了Display特征 所以我们输出时可以不需要:?
}

```