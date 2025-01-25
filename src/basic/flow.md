# 流程控制

## if else 语句
```rust
fn main() {
    let condition = true;

    if condition {
        println!("condition is true");
    } else {
        println!("condition is false");
    }

    // 可以接收返回值
    let result = if condition { 1 } else { 0 };

    println!("result： {}", result);

    fn surplus(x: u8) {
        if x % 4 == 0 {
            println!("surplus 4");
        } else if x % 3 == 0 {
            println!("surplus 3");
        } else if x % 2 == 0 {
            println!("surplus 2");
        } else {
            println!("surplus ok");
        }
    }

    surplus(99);
}
```

rust一共有三种循环 loop while for

## for循环
```rust
fn main() {
    // for
    for item in 0..5 {
        println!("for item: {}", item);
    }

    for c in 'a'..'z' {
        // 打印 a到z
        println!("char: {}", c)
    }

    let arr = ['a', 'b', 'c'];
    for item in arr {
        println!("arr item: {}", item);
    }

    let str = "hello";

    for item in str.chars() {
        println!("str item: {}", item);
    }

    // 注意 for 会 移交所有权

    let str_arr: [String; 3] = std::array::from_fn(|_i| String::from("hello"));
    println!("str_arr: {:?}", str_arr);
    for item in str_arr {
        // 为了避免元素所有权被move 我们可以使用 for item in &str_arr
        println!("str_arr item: {}", item);
    }
    // println!("str_arr: {:?}", str_arr); // 这里就无法再访问str_arr 因为其内部元素所有权在for循环时被移走了

    let mut str_arr_new: [String; 10] = std::array::from_fn(|_| String::from("world"));

    for item in &str_arr_new {
        println!("str_arr_new item: {}", item);
    }
    println!("str_arr_new: {:?}", str_arr_new);

    // 循环时修改元素
    for (index, item) in str_arr_new.iter_mut().enumerate() {
        if index % 2 == 0 {
            item.push_str("_continue");
            continue; // 跳过本次循环
        }
        if index == 5 {
            println!("index == 5 退出循环");
            item.push_str("_break");
            break;
        };
        println!("index not %2: {}", index)
    }
    println!("str_arr_new: {:?}", str_arr_new);
}
```

## while循环
```rust
fn main() {
    let mut index = 0;
    while index <= 100 {
        index += 1;
        if index % 2 == 0 {
            continue;
        };
        if (index == 5) {
            break;
        };
        println!("index: {}", index);
    }
}
```

## loop循环
```rust
fn main() {
    let mut index = 0;
    let result = loop {
        index += 1;
        if index % 2 == 0 {
            continue;
        };
        if (index == 5) {
            break index;
        };
        println!("index: {}", index);
    };

    println!("result: {}", index);

    // break to label
    let value = 'outer: loop {
        'inner: loop {
            println!("inner run..");
            loop {
                break 'inner loop {
                    break 'outer 24; // 直接返回到外层 且返回值
                };
            };
            println!("inner next..");
        }
    };
    println!("value: {}", value);
}
```