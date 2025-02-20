# 深入生命周期


## 借用规则
```rust
fn main() {
    #[derive(Debug)]
    struct Foo;

    impl Foo {
        fn mutate_and_share(&mut self) -> &Self {
            &*self
        }
        fn share(&self) {}
    }

    let mut foo = Foo;
    let loan = foo.mutate_and_share(); // 这里将存在一个可变引用 loan

    // foo.share(); // 如果这里调用share将产生一个不可变借用 违反了借用规则
    // println!("{:?}", foo); // 这里我们也不能再使用foo, 因为在可变引用存在期间，不能再借用不可变引用或直接使用原变量

    println!("{:?}", loan); // <- loan的生命周期到此结束
    // 后面的代码中，没有再使用loan了。loan的生命周期到此结束。在该作用域中就不存在对foo的借用了
    // 这里我们可以继续使用foo，因为loan在后续的代码中没有再被使用了，loan的生命周期在他最后一次使用完成后就结束了
    foo.share(); // loan已经无了。我们又可以借用foo了
    println!("{:?}", foo); // <- foo 生命周期结束
}

```

## 复杂的例子
```rust
fn main() {
    struct Interface<'i, 'm> where 'm: 'i {
        manager: &'i mut Manager<'m> // i 借用了 m。则m必须大于i
    }

    impl Interface<'_, '_> {
        pub fn noop(self) {
            println!("interface consumed 《{}》", self.manager.text);
        }
    }

    struct Manager<'m> {
        text: &'m str
    }

    struct List<'m> {
        manager: Manager<'m>,
    }

    impl<'m> List<'m> {
        // i 为这个Interface的生命周期
        pub fn get_interface<'i>(&'i mut self) -> Interface<'i, 'm> {
            //                   ^^^^^^^^^^^^ <= 这里确保self把自己的manager借出去的时长与i一致
            Interface {
                manager: &mut self.manager
            }
        }
    }

    let mut list = List {
        manager: Manager {
            text: "hello"
        }
    };

    list.get_interface().noop(); // noop调用完归还list.manager的所有权

    println!("Interface should be dropped here and the borrow released");

    use_list(&list);


    fn use_list(list: &List) {
        println!("{}", list.manager.text);
    }
}

```