# 闭包

## 闭包的基本概念
```rust
fn main() {
    const M: i32 = 10;
    let x: i32 = 10;
    fn fun1(y: i32) -> i32 {
        M + y
        /*
        常量在编译时就被内联到使用它的地方
        常量没有固定的内存地址
        常量的值在编译时就确定了，不会改变
        所以编译器会直接把 M 替换为 10
        */
        // 因此 实际函数体为 10 + y 。不属于闭包。不会报错
    }

    fn fun2(y: i32) -> i32 {
        // x + y // 会报错
        /*
        在这里变量x有具体的内存地址
        变量的值可能会改变
        访问变量需要考虑生命周期和所有权
        */
        // 因此 如果不将函数改为闭包函数，将会报错
        y
    }

    let fun3 = |y| {
        x + y
        /*
        闭包函数
        在运行时捕获外部变量x
        */
        // 实现了 Fn trait
    };



    let v1 = fun1(2);
    let v2 = fun3(2);

    println!("v1: {}", v1);
    println!("v2: {}", v2);

    let mut v3 = 10;
    let mut fun4 = |y| {
        // 因为在内部修改了外部变量v3的值 因此需要在fun4前面添加mut
        // 实现了 FnMut trait
        v3 += y; // 修改了外部变量
        v3 - y
    };

    let v5 = 2;
    let v6 = fun4(v5);
    println!("v6: {}", v6);
    println!("v3: {}", v3);


    let v7 = String::from("hello");
    let fun5 = |y| v7 + y; // 实现了 FnOnce trait 夺走了v7的所有权
    let v8 = "world".to_string();
    fun5(&v8); // 第一次调用时，v7 的所有权被消耗, v7的所有权被移动到了这里
    // fun5(&v8); // 只能调用一次

    let fun6 = |x| x; // 不需要标注类型
    fun6("hello"); // 编译器会根据上下文自动推导类型、 但当编译器推导出某一类型后就会一直使用该类型
    // fun6(10); // 会报错，因为编译器已经推导出fun6的类型为 &str

    let fun7 = |x: &str, y| x.to_string() + y; // 有些时候编译器无法正确推断，需要手动指定

    let v9 = "hello";
    let v10 = "hi";

    fun7(v9, v10);


    // 结构体中的闭包

    #[derive(Debug)]
    struct Cache<T, V> {
        value: Option<V>,
        callback: T
    }

    impl<T, V> Cache<T, V>
    where
        T: Fn(&V)
    {
        fn new(value: V, callback: T) -> Cache<T, V> {
            Cache { value: Some(value), callback}
        }

        fn dispatch(&self) {
            if let Some(value) = &self.value {
                (self.callback)(value);
            } else {
                println!("No value to dispatch");
            }
        }
        fn set_value(&mut self, new_value: V) {
            self.value = Some(new_value);
        }
    }

    let mut temp = Cache::new(12, |v| {
        // 这里有this吗
        println!("from dispatch: {:?}", v);
    });

    temp.dispatch();
    temp.set_value(100);
    temp.dispatch();
    temp.dispatch();
}


```
## 闭包的特性
```rust
fn main() {
    let m = 1;
    let fn1 = || m;

    let mut n = "hello".to_string();
    let mut fn2 = || n.push_str(" world");

    let p = "hello".to_string();
    let fn3 = || p;


    fn1(); // Fn
    fn2(); // FnMut
    fn3(); // FnOnce

    fn fn_fn<F>(fun: F, from: &str)
    where
        F: Fn(&str)
    {
        fun(from);
    }

    fn fn_mut<F>(mut fun: F, from: &str)
    where
        F: FnMut(&str)
    {
        fun(from);
    }


    fn fn_once<F, T>(fun: F)
    where
        F: FnOnce() -> T
    {
        fun();
    }

    let fn_fn_cb = |from: &str| {
        println!("From: {from}");
    };

    let mut ss = "hello".to_string();
    let fn_mut_cb = |from: &str| {
        ss.push_str(from);
        println!("From: {ss}");
    };


    let sss = "hello".to_string();
    let fn_once_cb = || {
        sss
    };

    fn_fn(fn_fn_cb, "fn_fn");
    fn_mut(fn_mut_cb, "fn_mut");
    println!("{ss}");
    fn_once(fn_once_cb);
    // fn_once(fn_once_cb); // 取决于该闭包如何使用被捕获的变量
    fn_once(|| ss);  // 与捕获闭包的方式无关
    // 一个闭包实现了哪种 Fn 特征取决于该闭包如何使用被捕获的变量，而不是取决于闭包如何捕获它们。

    /*
    所有的闭包都自动实现了 FnOnce 特征，因此任何一个闭包都至少可以被调用一次
    没有移出所捕获变量的所有权的闭包自动实现了 FnMut 特征
    不需要对捕获变量进行改变的闭包自动实现了 Fn 特征
    */

    // 强制move
    let val = String::from("hello"); // val属于closure_trait这个作用域
    let fff1 = || println!("in fff1: {}", val);
    fff1();
    println!("out fff1: {}", val);

    let fff2 = move || println!("in fff2: {}", val); // 强行将val的所有权移入fff2中
    fff2();
    // println!("out fff2: {}", val); // 不能再使用val了 因为被强制移动到fff2了
}

```
## 闭包的返回值
```rust
fn closure_returns() {
    println!("=== closure_returns ===");

    fn foo() -> Box<dyn Fn(u8) -> u8> {
        let num = 10;
        Box::new(move |x| x + num)
    }

    let bar = foo()(10);
    println!("bar: {}", bar);
}
```