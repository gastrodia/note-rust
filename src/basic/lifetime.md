# 认识生命周期


## 声明周期基础
通常来说: \
当一个函数返回一个引用时,该应用的来源只有两种情况
1. 来自函数参数
2. 来自函数内部新创建的变量

- 第一种情况需要我们显式的标注生命周期，
- 第二种情况是永远不被允许的。除非为 'static
```rust
fn main() {
    // 例如比较两个字符串切片的长度，返回长的那个
    /*
    fn longest(x: &str, y: &str) -> &str {
        if(x.len() > y.len()) {
            x
        } else {
            y
        }
    }
    */

    // 因为返回的是一个引用类型 编译器无法知晓其被引用的变量存活状态
    // 因此我们要显式的标注返回值与函数参数直接的生命周期关系
    fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
        if x.len() > y.len() {
            x
        } else {
            y
        }
    }
    // 将x的作用域记作 'a, y也为'a, 表示他们在同一个作用域中，拥有相同的生命周期
    // 表示x和y至少活得和'a 一样久，至于到底活多久或者哪个活得更久，抱歉我们都无法得知

    // 生命周期标准并没有实际性的作用，仅仅是告诉编译器多个引用之间的关联关系


    let x = String::from("hello");
    let y: &str = "world!";

    let max_char = longest(&x, y);
    println!("{}", max_char);

    {
        let m = "longest";
        let n = longest(m, &x); // x在这个作用域中依然有效
        println!("{}", n); // m在这里仍然存活. n是m的引用,依然有效
    }

    let n;
    {
        let m = String::from("longest");
        n = longest(&x, &m); // ERROR： m的生命周期不够长
    } // <- m在这里已经被销毁了
    // println!("{}", n); // <- 如果这里再访问n, n是m的引用,则报错


    // 结构体中的生命周期

    #[derive(Debug)]
    struct Person<'a> {
        name: &'a str
    }

    let cxk = Person {
        name: "cxk"
    };

    println!("cxk: {:?}", cxk);

    // 为具有生命周期的结构体实现方法

    // 'a: 'b 为生命周期约束写法,表示'b必须比'a小 ('a必须比'a活得久)
    impl <'a: 'b, 'b> Person<'a> {
        fn name_len(&self) -> usize {
            self.name.len()
        }

        fn name_longest(&self, target: &'b str) -> &'b str {
            if self.name_len() > target.len() { self.name } else { target }
        }
    }

    println!("cxk: {:?}", cxk.name_longest("hello"));


    // 静态生命周期标注

    fn get_ip_type(is_ipv6: bool) -> &'static str {
        if is_ipv6 { "ipv6" } else { "ipv4" }
    }

    println!("{}, {}", get_ip_type(false), get_ip_type(true));
}
```