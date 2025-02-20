# 注释和文档
````rust
fn main() {
    // 使用 cargo doc --open 将注释构建成html网页文档
    foo();

    // 支持markdown 语法 将危险函数标注出来
    bar();

    // 支持单元测试 cargo test 只在lib create中才能生效
    // rust_main_mod::doc_test();
}

/// 第一行是对函数的简短描述。
///
/// # Examples
/// 支持`markdown`语法
/// ![image](https://img.jiajiwei.top/file/007dd079e2f7aa7d17cdd.jpg)
///
/// ```rust
/// # foo(); // 这一行在生成的文档中看不到
/// foo();
/// ```
///
/// ```text
/// # 使用#号开头的行会在文档中隐藏
/// // 这是注释
/// ```
/// 支持跳转到对应mod
/// [`self::bar`]
/// [`bar`]
/// [`std::io`]
fn foo() {
    // todo!()
}


/** `bar` bar方法
# Examples
```
bar()
```

# Panics
这个函数可能会发生panic
```
panic!("panic");
```

# Errors
这个函数可能存在`Error`错误

# Safety
这个函数使用了不安全的代码
*/
fn bar() {
    panic!("panic");
}

/*
// 只在lib create时才能使用
pub mod rust_main_mod {
    /// `doc_test` 文档测试
    /// 支持单元测试用例
    ///
    /// # Examples
    ///
    /// ```
    /// let result = rust_main_mod::doc_test();
    /// assert_eq!(11, result);
    /// ```
    pub fn doc_test() -> u8 {
        println!("测试正在执行！");
        12
    }
}
*/
````

![image](./images/docs/1.png)
![image](./images/docs/2.png)
