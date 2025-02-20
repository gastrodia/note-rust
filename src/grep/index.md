# 一个简单的demo 文件搜索工具


## /src/lib.rs
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let keyword = "hello";
        let content = "\
hi rust:
I can print \"hello world!\"
Great!!";
        assert_eq!(vec!["I can print \"hello world!\""], grep::search(keyword, content, false));
    }
}

pub mod grep {
    use std::env;
    use std::env::Args;
    use std::fs::File;
    use std::io::{Error, Read};

    #[derive(Debug)]
    pub struct Config {
        pub path: String,
        pub keyword: String,
        pub ignore_case: bool,
    }

    impl Config {
        pub fn new(mut args: Args) -> Result<Self, &'static str> {
            args.next();
            let keyword = args.next().ok_or("Please provide a keyword")?;
            let path = args.next().ok_or("Please provide a path")?;
            Ok(Config {
                path,
                keyword,
                ignore_case: env::var("IGNORE_CASE").is_ok(),
            })
        }
    }

    pub fn run(config: &Config) -> Result<String, Error> {
        let mut content = String::new();
        File::open(&config.path)?.read_to_string(&mut content)?;
        Ok(content)
    }

    pub fn search<'a>(keyword: &'a str, content: &'a str, ignore_case: bool) -> Vec<&'a str> {
        let word = if ignore_case {
            keyword.to_lowercase()
        } else { keyword.to_string() };

        content.lines().filter(|line| {
            let line_lowercase = if ignore_case {
                line.to_lowercase()
            } else { line.to_string() };
            line_lowercase.contains(&word)
        }).collect()
    }
}
```

## /src/main.rs
```
use std::{process, env};
use mini_grep::grep;

fn main() {
    let config = grep::Config::new(env::args()).unwrap_or_else(|err| {
        eprintln!("ERROR: {}", err);
        process::exit(1);
    });

    let content = grep::run(&config).unwrap_or_else(|err| {
        eprintln!("ERROR: {}", err);
        process::exit(1);
    });

    let result = grep::search(&config.keyword, &content, config.ignore_case);
    for item in result {
        println!("{}", item);
    }
}

```

## poem.txt
```
I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us - don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

## start.sh
```sh
#!/bin/sh
IGNORE_CASE=1 cargo run -- to poem.txt > output.txt
```

## run
```bash
chmod u+x ./start.sh & ./start.sh
```

## output
```
Are you nobody, too?
How dreary to be somebody!
To tell your name the livelong day
To an admiring bog!
```