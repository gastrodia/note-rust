每种语言的第一课就是Hello World程序。这个程序会输出"Hello, World!"到屏幕上。

我们安装好Rust环境后，可以使用`cargo`来创建一个新的Rust项目。

```bash
cargo new rust-demo
```

这个命令会在当前目录下创建一个名为`rust-demo`的文件夹，里面包含了一个`Cargo.toml`文件和一个`src`文件夹。

`Cargo.toml`文件是Rust项目的配置文件，类似于`package.json`文件。

`src`文件夹是Rust项目的源代码文件夹。

我们可以在`src`文件夹下创建一个`main.rs`文件，默认生成了下面的代码：

```rust
fn main() {
    println!("Hello, World!");
}
```

我们可以使用`cargo run`命令来运行这个程序。

```bash
cd rust-demo
cargo run
```

这个命令会编译并运行`src/main.rs`文件。

如果一切正常，你会在终端上看到`Hello, World!`的输出。

厉害了。又精通了一门语言的Hello World！🐶