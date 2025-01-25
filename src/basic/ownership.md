# 所有权

```rust
// 所有权
fn main() {
    // 使用字符串字面量创建一个String
    let mut st = String::from("hello");
    println!("{}", st);
    // String
    st.push_str(" world;");
    st.push_str(" RUST");

    println!("{}", st);

    let s1 = String::from("hello");

    let s2 = s1;

    // 当我们把s1赋值给s2后，s1将失去变量所有权,（被销毁）。
    // 无法再次访问s1
    // 这个过程称为move 而非浅拷贝

    // println!("s1: {}", s1);

    println!("s2: {}", s2);

    // 深拷贝（克隆）

    let mut s3 = s2.clone();
    s3.push_str("_ from s3"); // 向s3追加内容不会对s2产生影响

    println!("s2: {}_________s3: {}", s2, s3);

    // 浅拷贝

    let x1 = "rust";
    let x2 = x1;
    // 与let s2 = s1 不同，x1并没有字符串“rust”的所有权。x1对“rust”也只是引用。 x2也是如此

    // 这是因为 String 属于复杂类型 存储在堆中
    // 而int 或切片字符串，属于简单数据类型 存储在栈中 拷贝的速度是非常快的
    println!("x1: {} ____ x2: {}", x1, x2);

    /*
    任何基本类型的组合可以 Copy ，不需要分配内存或某种形式资源的类型是可以 Copy 的。如下是一些 Copy 的类型：

    所有整数类型，比如 u32
    布尔类型，bool，它的值是 true 和 false
    所有浮点数类型，比如 f64
    字符类型，char
    元组，当且仅当其包含的类型也都是 Copy 的时候。比如，(i32, i32) 是 Copy 的，但 (i32, String) 就不是
    不可变引用 &T ，但是：可变引用 &mut T 是不可以 Copy的
    */

    // 函数的传值与返回

    fn todo() {
        let s1 = String::from("hello");
        // s1将会发生move
        use_todo_s1(s1);
        // 这里将不能再使用s1
        // println!("s1: {}", s1);

        let s2 = "hello";
        use_todo_s2(s2);
        // 仍然可以继续使用s2
        println!("todo 中的 s2: {}", s2);
    }

    fn use_todo_s1(mut s1: String) {
        s1.push_str(" use_todo_s1");
        println!("use_todo_s1 中的 s1: {}", s1);
    }

    fn use_todo_s2(mut s2: &str) {
        s2 = "hello use_todo_s2";
        println!("use_todo_s2 中的 s2: {}", s2);
    }

    todo()
}
```