# macro

## 声明式宏
使用`macro_rules!`来定义一个声明式宏。

### 模拟实现一个`vec!`宏
```rust
#[macro_export]
macro_rules! wow {
    ( $( $x:expr ),* ) => {
      {
        let mut temp = Vec::new();
        $(
            temp.push($x);
        )*
        temp
      }
    };
}

fn main() {
    let t = wow![1, 2, 3];
    println!("wow = {:?}", t);
}
```

```rust
// 宏导出属性：使这个宏可以被其他 crate 使用
#[macro_export]
// 定义一个名为 wow 的声明式宏
macro_rules! wow {
    // 宏的模式匹配规则
    ( $( $x:expr ),* ) => {
//  | |  |  |     | |
//  | |  |  |     | └─→ * 表示重复零次或多次
//  | |  |  |     └───→ , 表示重复项之间的分隔符（逗号）
//  | |  |  └─────────→ expr 是片段说明符，表示匹配一个表达式
//  | |  └────────────→ $x 是捕获的变量名，用于引用匹配到的表达式
//  | └───────────────→ $(...) 定义一个重复模式
//  └─────────────────→ 外层括号定义宏调用时的语法结构
      {
        // 创建一个新的可变 Vec
        let mut temp = Vec::new();
        // 展开重复模式：对每个捕获的表达式 $x 执行以下操作
        $(
            temp.push($x);  // 将每个表达式的值推入向量
            //           ^ 注意这里的分号是必不可少的
        )*  // 重复执行，次数与输入的参数个数相同
        temp  // 返回构建好的向量
      }
    };
}

// 使用示例：
// let v = wow![1, 2, 3];
// 展开后相当于：
// {
//     let mut temp = Vec::new();
//     temp.push(1);
//     temp.push(2);
//     temp.push(3);
//     temp
// }
```

### 实现一个自己的`sum!`宏
```rust
macro_rules! sum {
    ( $( $x:expr ),*) => {
      {
        let mut num = 0;
        $(
            num += $x;
        )*
        num
      }
    };
}

fn main() {
    let s = sum!(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    println!("sum = {}", s);
}
```

## 过程宏
过程宏必须放在独立的包中。
因为需要先将将宏编译完成后，再使用编译后的宏来对使用该宏的代码进行展开。
### `derive`派生宏
1. 首先我们需要为我们的项目创建一个crate
```bash
cargo new say_hi_derive --lib
```
得到以下目录
```text
.
├── Cargo.toml
├── say_hi_derive
│   ├── Cargo.toml
│   └── src
│       └── lib.rs
└── src
    └── main.rs
```

2. 我们将这个crate作为主项目的依赖, 修改`./Cargo.toml`
```toml
[dependencies]
say_hi_derive = { path = "./say_hi_derive" }
```

3. 修改`./say_hi_derive/Cargo.toml`
```toml
[lib]
# 声明这是一个过程宏 crate
# proc-macro = true 告诉编译器这个 crate 用于定义过程宏
# 过程宏 crate 只能导出过程宏，不能导出其他普通函数或类型
proc-macro = true


[package]
name = "say_hi_derive"
version = "0.1.0"
edition = "2024"

[dependencies]
# syn: 用于解析 Rust 代码，将 TokenStream 转换为 AST（抽象语法树）
# - version: 指定版本号
# - features: 启用额外的功能特性
#   - "extra-traits": 为 AST 节点实现额外的 trait（如 Debug, Eq 等），方便调试
syn = { version = "2.0.96", features = ["extra-traits"] }

# quote: 用于生成 Rust 代码，将 AST 转换回 TokenStream
# 提供了 quote! 宏，可以用类似模板的方式编写代码生成逻辑
quote = "1.0.38"
```

4. 在`./say_hi_derive/lib.rs`中编写过程宏代码
```rust

// 引入过程宏所需的核心库
extern crate proc_macro;

// 导入必要的类型和函数
use proc_macro::TokenStream;  // TokenStream 是过程宏的输入输出类型
use syn::{parse, DeriveInput}; // syn 用于解析 Rust 代码的 AST（抽象语法树）
use quote::quote;              // quote 用于生成 Rust 代码

// 定义一个派生宏（derive macro），名为 SayHi
// 使用方式：#[derive(SayHi)]
#[proc_macro_derive(SayHi)]
//                  |
//                  └─→ 宏的名称，用户通过 #[derive(SayHi)] 来使用
pub fn say_hi_derive(input: TokenStream) -> TokenStream {
//     |             |                       |
//     |             |                       └─→ 返回生成的代码（TokenStream 格式）
//     |             └─────────────────────────→ 输入：用户写的结构体代码
//     └───────────────────────────────────────→ 过程宏的实现函数

    // 1. 解析输入的 TokenStream，转换为 DeriveInput（结构化的 AST）
    let ast: DeriveInput = parse(input).unwrap();
//       |                |       |       
//       |                |       |       
//       |                |       └─────────→ input 是用户编写的结构体代码的 token 流
//       |                └───────────────→ parse() 将 TokenStream 解析为类型化的 AST
//       └────────────────────────────────→ DeriveInput 包含结构体的完整信息（名称、属性、字段等）

    // 调试输出：打印解析后的 AST 结构（编译时输出）
    println!("{:?}", ast);
    /*
    示例输出：
    DeriveInput {
        attrs: [],                              // 属性（如 #[cfg(...)]）
        vis: Visibility::Inherited,             // 可见性（pub/private）
        ident: Ident { ident: "Person", ... },  // 结构体名称
        generics: Generics { ... },             // 泛型参数
        data: Data::Struct {                    // 数据类型（struct/enum/union）
            struct_token: Struct,
            fields: Fields::Unit,               // 字段（这里是单元结构体）
            semi_token: Some(Semi)
        }
    }
    */

    // 2. 提取结构体的名称（标识符）
    let name = &ast.ident;
//       |         |
//       |         └─→ ast.ident 是使用者结构体的名称
//       └───────────→ 使用引用，避免所有权转移

    // 3. 使用 quote! 宏生成 Rust 代码
    let block = quote! {
//      |      |
//      |      └─→ quote! 宏将内部的代码转换为 TokenStream
//      └────────→ 存储生成的代码

        // 为目标结构体实现 SayHiTrait trait
        impl SayHiTrait for #name {
//                          |
//                          └─→ #name 是插值语法，会被替换为实际的结构体名称
//                              类似于声明宏中的 $name

            // 实现 trait 的 say_hi 方法
            fn say_hi(&self) {
                // 打印问候语，stringify! 将标识符转为字符串字面量
                println!("Hi, I am {}", stringify!(#name));
//                                      |         |
//                                      |         └─→ #name 会被替换为结构体名称
//                                      └───────────→ stringify! 将标识符转为 &str
            }
        }
    };

    // 4. 将生成的代码转换为 TokenStream 并返回
    block.into()
//  |     |
//  |     └─→ into() 将 quote! 生成的类型转换为 TokenStream
//  └───────→ 返回生成的代码，编译器会将其插入到原始代码中
}
```
5. 在主程序`./src/main.rs`中使用

```rust
use say_hi_derive::SayHi; // 导入宏
trait SayHiTrait { // 在当前域中定义我们在宏中的trait （放在其他位置导入也可以）
    fn say_hi(&self);
}

#[derive(SayHi)] // 通过 derive 使用我们定义的宏
struct Person();

#[derive(SayHi)]
struct Animal();

fn main() {
  let person = Person();
  person.say_hi(); // 自动为结构体实现了say_hi方法

  let animal = Animal();
  animal.say_hi();
}
```
5. 使用`cargo run`可以看到
```text
Hi, I am Person
Hi, I am Animal
```
#### 使用`cargo-expand`观察宏展开后的代码
``` bash
cargo install cargo-expand
```
安装成功后
```bash
cargo expand
```
输出：

```rust
#![feature(prelude_import)]
#[macro_use]
extern crate std;
#[prelude_import]
use std::prelude::rust_2024::*;
use say_hi_derive::SayHi;
trait SayHiTrait {
    fn say_hi(&self);
}
struct Person();
impl SayHiTrait for Person {
    fn say_hi(&self) {
        {
            ::std::io::_print(format_args!("Hi, I am {0}\n", "Person"));
        };
    }
}
struct Animal();
impl SayHiTrait for Animal {
    fn say_hi(&self) {
        {
            ::std::io::_print(format_args!("Hi, I am {0}\n", "Animal"));
        };
    }
}
fn main() {
    let person = Person();
    person.say_hi();
    let animal = Animal();
    animal.say_hi();
}

```

#### 过程宏的执行流程
```text
┌─────────────────────────────────────────────────────────┐
 第一阶段：编译过程宏 crate                                
├─────────────────────────────────────────────────────────┤
 say_hi_derive/src/lib.rs                                
         ↓ rustc 编译                                     
 libsay_hi_derive.so (动态库，运行在宿主机器)              
└─────────────────────────────────────────────────────────┘
                       ↓ 编译完成
┌─────────────────────────────────────────────────────────┐
 第二阶段：编译主程序                                      
├─────────────────────────────────────────────────────────┤
 src/main.rs                                             
   #[derive(SayHi)]  ← 触发宏                            
         ↓                                               
   加载 libsay_hi_derive.so                              
         ↓                                               
   执行 say_hi_derive 函数                               
         ↓                                               
   生成 impl SayHiTrait for Person { ... }               
         ↓                                               
   继续编译生成的代码                                     
         ↓                                               
   最终二进制文件 (运行在目标平台)                        
└─────────────────────────────────────────────────────────┘
```

### 类属性宏
// TODO
### 类函数宏
// TODO