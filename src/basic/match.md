# 模式匹配

## match
```rust
enum Direction {
    Left,
    Right,
    Top(u8),
    Bottom
}

fn main() {
    fn match_direction(direction: Direction) -> Option<u8> {
        match direction {
            Direction::Top(x) => {
                println!("top");
                Some(x) // 可以有返回值
            },
            // 使用|匹配多种情况
            Direction::Left | Direction::Right => {
                println!("left or right");
                Some(20)
            },
            _ => { // 剩余情况
                println!("other");
                None
            }
        }
    }
    println!("Left: {:?}", match_direction(Direction::Left));
    println!("Right: {:?}", match_direction(Direction::Right));
    println!("Top: {:?}", match_direction(Direction::Top(99)));
    println!("Bottom: {:?}", match_direction(Direction::Bottom));
}

```

## if let
```rust
enum Direction {
    Left,
    Right,
    Top(u8),
    Bottom
}

fn main() {
    fn is_direction_top(d: Direction) -> u8 {
        if let Direction::Top(x) = d  {
            println!("{} is top", x);
            x
        } else { 0 }
    }

    println!("is_direction_top: {}", is_direction_top(Direction::Bottom));
    println!("is_direction_top: {}", is_direction_top(Direction::Top(20)));
}

```

## match! 宏
```rust
enum Direction {
    Left,
    Right,
    Top(u8),
    Bottom
}
fn main() {
    let card1  = Direction::Top(1);

    // 我们不能直接用 == 判断枚举是否相等
    // let r = card1 == Direction::Top(1);

    println!("{}", matches!(card1, Direction::Top(1))); // true
    println!("{}", matches!(card1, Direction::Top(2))); // false
    println!("{}", matches!(card1, Direction::Top(_))); // true // 表示忽略携带的值
    println!("{}", matches!(card1, Direction::Bottom)); // false
}
```
## let else
可以理解为反向匹配 匹配不满足的情况 忽略所有满足的情况
```rust
enum Direction {
    Left,
    Right,
    Top(u8),
    Bottom
}
fn main() {
    fn do_not(d: Direction) -> Option<bool> {
        let Direction::Top(x) = d else {
            // 这里访问不到x
            return Some(true); // 必须为发散模式
        };
        println!("在这里可以访问到x: {}", x);
        Some(false)
    }

    println!("Top: {:?}", do_not(Direction::Top(1)));
    println!("Bottom: {:?}", do_not(Direction::Bottom));
}
```

## while let
```rust
fn main() {
    let arr = [10, 20, 30, 40, 50];
    let mut index = 0;

    // 循环匹配 直至匹配不中
    while let Some(n) = arr.get(index) {
        index += 1;
        println!("{}", n);
    }
}
```

## 匹配守卫
```rust
fn main() {
    fn match_x(x: Option<i32>) {
        match x {
            Some(v) if v > 0 => println!("x 大于0： {}", v), // 当if后的条件为true时才进入
            Some(v) => println!("x 小于等于0：{}", v),
            None => println!("none")
        }
    }

    match_x(Some(5));
    match_x(Some(0));
}

```

## @绑定
```rust
fn main() {
    fn match_x(x: Option<i32>) {
        match x {
            Some(v @ 5..10 ) => println!("5-10内: {}", v),
            Some(v) => println!("不在5-10之内: {}", v),
            None => ()
        }
    }

    match_x(Some(12));
    match_x(Some(6));

    #[derive(Debug)]
    enum  Action {
        Move {x: i32, y: i32}
    }

    fn match_struct(action: Action) {
        match action {
            Action::Move {x: a, y : b @ 1..10} => {
                println!("action move 在 1到10： {}", b);
            }
            ac @ Action::Move {x, y: b @ 10..20} => {
                println!("action move 10到20： {}, {:?}", b, ac);
                // println!("action: {:?}", action); // 这里访问不了action了因为他的所有权被移动到ac上了
            }
            ref ac @ Action::Move {x: a, y: b} => {
                println!("在这之外： {:?} {:?}", ac, action);
                println!("action: {:?}", action); // 这里还能继续访问action。 因为ac只是对action引用
            }
        }
    }

    let action1 = Action::Move {x: 10, y: 6};
    let action2 = Action::Move {x: 10, y: 15};
    let action3 = Action::Move {x: 100, y: 100};

    println!("action1: {:?}, action2: {:?}, action3: {:?}", action1, action2, action3);
    match_struct(action1);
    match_struct(action2);
    match_struct(action3);


    // 搭配guard

    #[derive(Debug)]
    struct Member {
        name: String,
        age: u8,
        is_vip: bool
    }

    // 用来配合 guard 条件
    fn match_member(member: &Member) {
        match member {
            m @ Member {
                age: 18..60,
                ..
            } if m.is_vip => {
                println!("{}是18岁以上的vip用户", m.name);
            }
            _ => {
                println!("ignore")
            }
        }
    }

    let m1 = Member {
        name: "cxk".to_string(),
        age: 19,
        is_vip: true
    };

    match_member(&m1);

    println!("m1: {:?}", m1);
}

```