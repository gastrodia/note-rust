# 错误处理

## 错误处理

```rust
use std::{env, fs};
use std::fs::File;
use std::io::{Error, ErrorKind, Read, Write};

fn main() {
    println!("current dir: {:?}", env::current_dir());
    read_file("src/main.rs");
    read_file("src/_.txt"); // 路径错误,文件不存在

    // 错误传染

    let content = error_up("src/_.txt");
    match content {
        Ok(c) => {
            println!("[error_up] content: {}", c);
        }
        Err(e) => {
            println!("[error_up] error: {}", e);
        }
    }

    let main_rs = error_up("src/main.rs");
    match main_rs {
        Ok(c) => {
            println!("[error_up] content: {}", c);
        }
        Err(e) => {
            println!("[error_up] error: {}", e);
        }
    }


    // 链式调用的错误传染
}

fn read_file(path: &str) {
    let file = File::open(path);

    match file {
        Ok(f) => {
            println!("Reading file: {:?}", f);
        }
        Err(e) => match e.kind() {
            /*
            ErrorKind::NotFound => match File::create(path) { // 没有找到文件就创建文件 (丝滑小连招)
                Ok(mut f) => {
                    f.write_fmt(format_args!("fn main() {{}}")).unwrap();
                    println!("Created file: {:?}", f);
                },
                Err(e) => {
                    println!("Error creating file: {:?}", e);
                },
            }
            */
            other_error => {
                println!("other_error: {:?}", other_error)
            }
        },
    }
}

// 错误向上
fn error_up(path: &str) -> Result<String, Error> {
    let mut file = File::open(path)?; // 使用?号将错误传染出去
    let mut content = String::new();
    file.read_to_string(&mut content)?; // 使用?号将错误传染出去
    Ok(content)
}

```

### ?.
```rust

fn read_file(path: &str) -> Result<String, Error> {
    let mut content = String::new();
    // 在会发生错误的函数使用 ?. 若发生错误,这终止并返回错误,若未终止则继续向后执行
    File::open(path)?.read_to_string(&mut content)?;
    // ? 需要一个变量承载正确的值 如果正确则继续执行, 如果错误就return错误
    // Option枚举也能使用?宏

    Ok(content)
    // fs::read_to_string(path)
}
```