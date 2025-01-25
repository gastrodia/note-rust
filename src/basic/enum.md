# 枚举

## 定义枚举
```rust
fn main() {
    #[derive(Debug)]
    enum Poker {
        Clubs,
        Spades,
        Diamonds
    }

    let card = Poker::Clubs;
    println!("card: {:?}", card);
    println!("spades: {:?}", Poker::Spades);

    fn log(hearts: Poker) {
        println!("hearts: {:?}", hearts)
    }

    log(Poker::Diamonds);
}
```

## 枚举值
```rust
fn main() {
    #[derive(Debug)]
    struct User {
        name: String,
        age: u8
    }
    #[derive(Debug)]
    struct RGB(u8, u8, u8);
    #[derive(Debug)]
    enum Poker {
        Clubs(u8),
        Spades(bool),
        Diamonds(String),
        Hearts {x: u8, y: u8},
        User(User),
        Rgb(RGB)
    }

    // 我们可以将Poker枚举看作一个信封，而每个枚举值就是信封里的卡片
    // 每个卡片的内容可以不同，有的是数字，有的是字符串，有的是结构体


    // 我们可以在同种类型卡片上填写相关的信息 得到一个填写了信息的卡片
    let card1 = Poker::Clubs(1);
    let card2 = Poker::Spades(false);
    let card3 = Poker::Diamonds(String::from("Diamonds"));
    let card4 = Poker::Hearts {x:3, y:4};

    let card5 = Poker::User(User {
       name: String::from("cxk"),
        age: 18
    });
    let card6 = Poker::Rgb(RGB(0, 0, 0));
    println!("card1: {:?}", card1);
    println!("card2: {:?}", card2);
    println!("card3: {:?}", card3);
    println!("card4: {:?}", card4);
    println!("card5: {:?}", card5);
    println!("card6: {:?}", card6);

    if let Poker::User(user) = card5 {
        // 假设你有一个信封(Poker)，里面可能装着一张名片(User)
        // if let 就相当于在说：
        // "如果这个信封里确实装着名片，
        // 那么把名片取出来（命名为user），
        // 然后我要看看这张名片上的姓名和年龄"
        println!("card5 user: {} {}", user.name, user.age);
    }

    if let Poker::Hearts {x, y} = card4 {
        println!("card 4: x: {} y: {}", x, y);
    }

    if let Poker::Rgb(rgb) = card6 {
        let RGB(r, g, b) = rgb;
        println!("card6: {}_{}_{}", r, g, b)
    }

    // 使用match匹配 枚举值
    match card1 {
        Poker::Clubs(c) => println!("card1 clubs: {}", c),
        _ => {} // 表示忽略其他情况
    }

    match card2 {
        Poker::Spades(s) => println!("card2: {}", s),
        _ => {}
    }

    // match匹配时，可以将匹配到的值绑定到一个变量上
    let card3_result = match card3 {
        Poker::Diamonds(d) => {
            println!("card3: {}", d);
            d
        },
        _ => String::from("None")
    };

    println!("card3_result: {}", card3_result);
}

```

## Option
在rust预导入模块中 有一个Option枚举

Option::Some(T) 和 Option::None

Some表示有值，None表示没有值 类似于null
```rust
fn main() {
    let car = Some("car");
    let null: Option<i8> = None;
    println!("car: {:?}", car);
    println!("null: {:?}", null);

    if let Some(target) = car {
        println!("car target: {}", target);
    }
}
```