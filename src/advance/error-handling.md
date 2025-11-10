# 错误处理
## 组合器

- [`option`的逻辑运算](#option的逻辑运算)
- [`result`的逻辑运算](#result的逻辑运算)
- [`or_else`](#or_else)
- [`and_then`](#and_then)
- [`filter`](#option的filter)
- [`map`](#result和option的map)
- [`map_err`](#result的map_err)
- [`map_or`](#result和option的map_or)
- [map_or_else`](#result和option的map_or_else)
- [`ok_or`](#option的ok_or)
- [`ok_or_else`](#option的ok_or_else)

### `Option`的逻辑运算
```rust
fn main() {
    type V = Option<&'static str>;

    let n: V = None;
    let s1: V = Some("hello");
    let s2: V = Some("world");

    // or 遵循 或运算 （短路运算）
    assert_eq!(n.or(s1), s1); // None || Some1 => Some1
    assert_eq!(s1.or(s2), s1); // Some1 || Some2 => Some1
    assert_eq!(n.or(n), n); // None || None => None

    // and 遵循 且运算 （短路运算）
    assert_eq!(n.and(s1), n); // None && Some1 => None
    assert_eq!(s1.and(s2), s2); // Some1 && Some2 => Some2
    assert_eq!(n.and(n), n); // None && None => None
}
```

### `Result`的逻辑运算

```rust
fn main() {
    type V = Result<&'static str, &'static str>;
    let e1: V = Err("error1");
    let e2: V = Err("error2");
    let o1: V = Ok("ok1");
    let o2: V = Ok("ok2");

    assert_eq!(e1.or(e2), e2); // Error1 || Error2 => Error2
    assert_eq!(e1.or(o1), o1);// Error1 || Ok1 => Ok1
    assert_eq!(o1.or(o2), o1);// Ok1 || Ok2 => Ok1

    assert_eq!(e1.and(e2), e1);// Error1 && Error2 => Error1
    assert_eq!(e1.and(o1), e1);// Error1 && Ok1 => Error1
    assert_eq!(o1.and(o2), o2);// Ok1 && Ok2 => Ok2
}
```

### `or_else`
与`or`逻辑相同，但参数是闭包
```rust
fn main() {
    type V = Option<&'static str>;
    let n: V = None;
    let s1: V = Some("hello");
    let s2: V = Some("world");

    // or_else 使用 || 的原因：
    // or_else 的闭包签名是 FnOnce() -> Option<T>
    // 因为 or_else 只在 None 时调用，没有值可传，所以不需要参数
    let fn_n = || None; // 闭包不需要参数
    let fn_s = || s1;

    // 与 or 相似 只不过其参数为闭包
    assert_eq!(n.or_else(fn_n), n); // None 或 || None => None
    assert_eq!(n.or_else(fn_s), s1);  // None 或 || Some1 => Some1
    assert_eq!(s1.or_else(fn_n), s1); // Some1 或 || None => Some1
    assert_eq!(s2.or_else(fn_s), s2); // Some2 或 || Some1 => Some2
}
```
`Result`同上

### `and_then`
与`and`逻辑相同，但参数是闭包
```rust
fn main() {
    type V = Option<&'static str>;
    let n: V = None;
    let s1: V = Some("hello");
    let s2: V = Some("world");

    // and_then 需要 |_| 的原因：
    // and_then 的闭包签名是 FnOnce(T) -> Option<U>
    // 因为 and_then 只在 Some(value) 时调用，会把 value 传给闭包
    // 即使不使用这个值，也必须接受参数（可以用 |_| 忽略）
    let fn_n = |_| None; // 闭包必须接受一个参数
    let fn_s = |_| s1;   // 即使不使用参数值，也要用 |_| 接受
    
    assert_eq!(n.and_then(fn_n), n); // None 且 |_| None => None
    assert_eq!(n.and_then(fn_s), n); // None 且 |_| Some1 => None
    assert_eq!(s1.and_then(fn_n), n); // Some1 且 |_| None => None
    assert_eq!(s2.and_then(fn_s), s1); // Some2 且 |_| Some1 => Some1
    
    // 实际使用示例：and_then 可以访问并转换 Some 中的值
    let num_str = Some("42");
    let num = num_str.and_then(|s| s.parse::<i32>().ok());
    assert_eq!(num, Some(42));
    
    // 对比：or_else 使用 || 是因为：
    // or_else 的闭包签名是 FnOnce() -> Option<T>
    // 因为 or_else 只在 None 时调用，没有值可传，所以不需要参数
}
```
`Result`同上


### `Option`的`filter`
根据条件过滤 `Option` 中的值
闭包签名：`FnOnce(&T) -> bool`
- 如果 `Option` 是 `None，直接返回` None（不调用闭包）
- 如果 `Option` 是 `Some(value)`，调用闭包判断：
  * 闭包返回 `true`：保留，返回 `Some(value)`
  * 闭包返回 `false`：过滤掉，返回 `None`
```rust
fn main() {
  
    type V = Option<u8>;

    let n: V = None;
    let s1: V = Some(1);
    let s2: V = Some(2);

    // 定义过滤条件：判断是否为偶数
    let is_even = |x: &u8| x % 2 == 0;
    
    // None 值无法过滤，直接返回 None
    assert_eq!(n.filter(is_even), n); // None => 没有值可过滤 => None
    
    // Some(1) 不满足条件（不是偶数），被过滤掉，返回 None
    assert_eq!(s1.filter(is_even), n); // Some(1) => 不是偶数 => None
    
    // Some(2) 满足条件（是偶数），保留，返回 Some(2)
    assert_eq!(s2.filter(is_even), s2); // Some(2) => 是偶数 => Some(2)
    
    // 实际应用场景示例：
    // 1. 验证年龄是否满足要求
    let age = Some(25);
    let adult = age.filter(|&a| a >= 18); // 只保留 18 岁以上的
    assert_eq!(adult, Some(25));
    
    // 2. 过滤空字符串
    let name = Some("Alice");
    let non_empty = name.filter(|s| !s.is_empty());
    assert_eq!(non_empty, Some("Alice"));
    
    // 3. 链式调用：先转换再过滤
    let input = Some("42");
    let even_number = input
        .and_then(|s| s.parse::<i32>().ok())  // 先转换为数字
        .filter(|&n| n % 2 == 0);              // 再过滤偶数
    assert_eq!(even_number, Some(42));
}
```

### `Result`和`Option`的`map`
- `.map()` 方法用于对容器（如 `Result` 和 `Option`）中的值进行操作：
    - 如果容器是有效的（如 `Ok` 或 `Some`），则执行传入的闭包，并将结果包装到新的容器中返回。
    - 如果容器是无效的（如 `Err` 或 `None`），则直接返回原来的容器，不执行闭包。
```rust
fn main() {
    type V = Result<&'static str, &'static str>;
    type S = Option<u8>;

    let e1: V = Err("error1");
    let o1: V = Ok("ok1");
    let s1: S = Some(1);
    let n1: S = None;
    let fn_r = |_| "^_^";
    assert_eq!(o1.map(fn_r), Ok("^_^")); // Ok1 -> 闭包执行 —> 返回值 -> 新Ok
    assert_eq!(e1.map(fn_r), e1); // Err1  -> 闭包不执行 -> Err1

    let fn_o = |v| v + 1;
    assert_eq!(s1.map(fn_o), Some(2)); // 同上
    assert_eq!(n1.map(fn_o), n1);
}
```

### `Result`的`map_err`
- 如果当前值是 `Ok`，则直接返回原值，不会调用闭包。
- 如果当前值是 `Err`，则会将 `Err` 的值传递给闭包，并将闭包的返回值作为新的 `Err` 值。
```rust
fn main() {
    type V = Result<&'static str, &'static str>;

    let e1: V = Err("error1");
    let o1: V = Ok("ok1");
    let fn_r = |_| "^_^";

    // map_err 将Err的值修复
    assert_eq!(o1.map_err(fn_r), o1); // Ok1 -> 闭包不执行 -> Ok1
    assert_eq!(e1.map_err(fn_r), Err("^_^")); // Err1 -> 闭包指向 -> 返回闭包执行结果 -> 新Err
}
```

### `Result`和`Option`的`map_or`
- `map_or` 和`map`相似
- 但`map_or`多了一个默认值
    - `map`返回的是`Result<T>` 或 `Option<T>`
    - `map_or`返回`T`类型
    - 如果当前值是`Ok`或`Some`，则应用闭包，返回闭包的返回值
    - 如果当前值是`Err`或`None`，则直接返回默认值
```rust
fn main() {
    type V = Result<&'static str, &'static str>;
    type S = Option<u8>;
    let e1: V = Err("error1");
    let o1: V = Ok("ok1");
    let s1: S = Some(1);
    let n1: S = None;
    let str1 = "^_^";
    let default_str = "default";
    let fn_r = |_| str1;

    let default_num = 0;
    let fn_o = |v| v + 1;

    assert_eq!(o1.map_or(default_str, fn_r), str1); // Ok1 -> 应用闭包 -> str1
    assert_eq!(e1.map_or(default_str, fn_r), default_str); // Err1 -> 返回默认值 -> default_str

    assert_eq!(s1.map_or(default_num, fn_o), 2); // Some1 -> 应用闭包 -> v + 1
    assert_eq!(n1.map_or(default_num, fn_o), default_num); // None -> 应用默认值 -> default_num
}

```

### `Result`和`Option`的`map_or_else`
- `map_or_else` 和`map_or`相似
- 但`map_or_else`的默认值为闭包
- 判断逻辑一致
```rust
fn main() {
    type V = Result<&'static str, &'static str>;
    type S = Option<u8>;
    let e1: V = Err("error1");
    let o1: V = Ok("ok1");
    let s1: S = Some(1);
    let n1: S = None;
    let str1 = "^_^";
    let default_str = "default";
    let fn_r = |_| str1;
    let fn_default_str = |_| default_str;

    let default_num = 0;
    let fn_o = |v| v + 1;
    let fn_default_num = || default_num;

    assert_eq!(o1.map_or_else(fn_default_str, fn_r), str1); // Ok1 -> 应用第二个闭包处理值 -> 返回闭包的值
    assert_eq!(e1.map_or_else(fn_default_str, fn_r), default_str); // Err1 -> 应用第一个闭包(默认) -> 返回默认闭包的结果

    assert_eq!(s1.map_or_else(fn_default_num, fn_o), 2); // Some1 -> 应用第二个闭包处理值 -> 返回闭包的值
    assert_eq!(n1.map_or_else(fn_default_num, fn_o), default_num); // None -> 应用第二个闭包处理值 -> 返回闭包的值
}
```

### `Option`的`ok_or`
- 可以将`Option`转为`Result`
-  并且接收一个默认值`E`，当为`None`时返回这个`Err<E>`
```rust
fn main() {
    type S = Option<u8>;
    let s1: S = Some(1);
    let n1: S = None;

    let none_msg = "empty";
    assert_eq!(s1.ok_or(none_msg), Ok(1)); // Some1 -> 不应用闭包 -> 返回转换后的Ok1
    assert_eq!(n1.ok_or(none_msg), Err(none_msg)); // Nome -> 应用闭包 -> Err<应用默认值>
}
```

### `Option`的`ok_or_else`
- 与`ok_or`相似 但默认值是闭包
- 当为`None`时应用这个默认值为`Err`并返回

```rust
fn main() {
    type S = Option<u8>;
    let s1: S = Some(1);
    let n1: S = None;

    let none_msg = "empty";
    let fn_none_msg = || none_msg;

    assert_eq!(s1.ok_or_else(fn_none_msg), Ok(1)); // Some<T> -> 不应用闭包 -> Ok<T>
    assert_eq!(n1.ok_or_else(fn_none_msg), Err(none_msg)); // None -> 应用闭包 -> Error<闭包的返回值>
}
```


## 自定义错误类型

自定义错误类型需要实现`Debug`和`Display`.

### 通过派生宏自动实现`Debug`
```rust
use std::fmt::{Debug, Display, Formatter};

fn main() {
    #[derive(Debug)] // 通过派生宏自动实现Debug
    struct FetchError {
        code: usize,
        message: String,
    }

    impl Display for FetchError {
        fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
            //                                  ^^^^^^^^^^^^^^^^ 注意这里不是 std::result::Result
            write!(f, "Display: FetchError error!, code {}, message {}", self.code, self.message)
        }
    }

    let result: Result<(), FetchError> = Err(FetchError {
        code: 404,
        message: "Not Found".to_string(),
    });

    println!("{:#?}", result);

    if let Err(err_msg) = result {
        println!("{}", err_msg);
    }
}
```
### 手动实现`Debug`

```rust
use std::fmt::{Debug, Display, Formatter};

fn main() {
    struct FetchError {
        code: usize,
        message: String,
    }

    impl Display for FetchError {
        fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
            let msg = match self.code {
                404 => "Not Found",
                _ => "Error"
            };
            write!(f, "Display: FetchError error!, code {}, message {}", self.code, msg)
        }
    }

    // 手动实现Debug
    impl Debug for FetchError {
        fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
            write!(f, "Debug: FetchError {{ code: {}, message: {} }}", self.code, self.message)
        }
    }

    let result: Result<(), FetchError> = Err(FetchError {
        code: 404,
        message: "page not found".to_string(),
    });

    println!("{:#?}", result);

    if let Err(err_msg) = result {
        println!("{}", err_msg);
    }

}
```

## 将其他错误类型转为自定义错误类型

```rust
fn main() {
    #[derive(Debug)]
    struct AppError {
        from: &'static str,
        message: String,
    }
    
    // 实现From trait 将io::Error转换为AppError
    impl std::convert::From<std::io::Error> for AppError {
        fn from(value: std::io::Error) -> Self {
            AppError {
                from: "io",
                message: value.to_string(),
            }
        }
    }

    // 实现From trait 将env::VarError转换为AppError
    impl std::convert::From<std::env::VarError> for AppError {
        fn from(value: std::env::VarError) -> Self {
            AppError {
                from: "env",
                message: value.to_string(),
            }
        }
    }

    fn look_file() -> Result<(), AppError> {
        let file = std::fs::File::open("test.txt")?;
        println!("file {:?}", file);
        Ok(())
    }

    fn look_env() -> Result<(), AppError> {
        let env = std::env::var("TEST")?;
        println!("env {:?}", env);
        Ok(())
    }

    fn match_app(result: &Result<(), AppError>) {
        match result {
            Ok(()) => println!("success"),
            Err(err) => {
                match err {
                    AppError { from: "io", message } => println!("io error: {}", message),
                    AppError { from: "env", message } => println!("env error: {}", message),
                    other => println!("unknown error: {:?}", other),
                }
            },
        }
    }

    match_app(&look_file());
    match_app(&look_env());
}
```

## 错误归一化
当某个函数内部可能发生多种不同类型的错误时，**将这些不同类型的错误统一转换为一个统一的错误类型**，使函数只返回一个错误类型。
```rust
fn main() {
    fn happen_error() -> Result<(), std::error::Error> {
        //                          ^^^^^^^^^^^^^^^^^  std::error::Error 是一个 trait，不是具体类型
        std::fs::File::open("test.txt")?; // io::Error
        std::env::var("TEST")?; // env::VarError
        Ok(())
    }

    let result = happen_error();
    println!("happen_error {:?}", result);
}
```

### 使用`Box<dyn std::error::Error>`
```rust
fn main() {
    fn happen_error() -> Result<(), Box<dyn std::error::Error>> {
        std::fs::File::open("test.txt")?; // io::Error
        std::env::var("TEST")?; // env::VarError
        Ok(())
    }

    let result = happen_error();
    println!("happen_error {:?}", result);
}
```

### 使用自定义错误类型
正如[将其他错误类型转为自定义错误类型](#将其他错误类型转为自定义错误类型)
通过为自定义错误类型实现`From` trait，将其他错误类型转换为自定义错误类型
当使用 `?` 操作符时，Rust 会：
1. 检查是否有错误
2. 如果有错误，自动调用 `From trait` 将错误类型转换为函数返回的错误类型
3. 提前返回转换后的错误
```rust
use std::fmt::{Debug, Display, Formatter};

fn main() {
    #[derive(Debug)]
    enum AppError {
        IOError(std::io::Error),
        VarError(std::env::VarError)
    }

    // 实现From trait 将io::Error转换为AppError
    impl std::convert::From<std::io::Error> for AppError {
        fn from(value: std::io::Error) -> Self {
            AppError::IOError(value)
        }
    }

    // 实现From trait 将env::VarError转换为AppError
    impl std::convert::From<std::env::VarError> for AppError {
        fn from(value: std::env::VarError) -> Self {
            AppError::VarError(value)
        }
    }

    fn happen_error() -> Result<(), AppError> {
        std::fs::File::open("test.txt")?; // 自动调用form将io::Error转为AppError::IOError
        std::env::var("TEST")?; // 自动调用form将env::VarError转为AppError::VarError
        Ok(())
    }

    if let Err(payload) = happen_error() {
        match payload {
            AppError::IOError(err) => println!("io error: {}", err),
            AppError::VarError(err) => println!("var error: {}", err)
        }
    }
}
```

### 使用`thiserror`
```toml
[dependencies]
thiserror = "2.0.11"
```

```rust
use thiserror;
fn main() {
    #[derive(Debug, thiserror::Error)]
    enum AppError {
        #[error(transparent)]
        IOError(#[from] std::io::Error),
        #[error("var not found: {0}")]
        VarError(#[from] std::env::VarError)
    }

    fn happen_error() -> Result<(), AppError> {
        std::env::var("TEST")?; // env::VarError
        std::fs::File::open("test.txt")?; // io::Error
        Ok(())
    }
    if let Err(payload) = happen_error() {
        match payload {
            AppError::IOError(err) => println!("> io error: {}", err),
            AppError::VarError(err) => println!("> var error: {}", err)
        }
    }
}
```

### 使用`anyhow`
```toml
[dependencies]
anyhow="1.0.95"
```

```rust
use anyhow;

fn main() {
    fn happen_error() -> anyhow::Result<()> {
        std::fs::File::open("test.txt")?; // io::Error
        std::env::var("TEST")?; // env::VarError
        Ok(())
    }
    if let Err(payload) = happen_error() {
        println!("anyhow: {:?}", payload);
    }
}
```