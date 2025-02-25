# 堆对象分配

`Box<T>` 允许将一个值存储在堆中，然后将其智能指针保存在栈中

`Box<T>` 的作用与场景
1. `Box` 的功能单一仅仅是将数据存储在堆中
2. 当数据较大时，又不想在转移所有权时拷贝新数据。例如 `[0,1000]`
3. 某一数据类型的大小无法在编译期确定，但又需要固定其大小类型。 例如 `Box<str>`
4. 特征对象，只关心某类数据具有相同的`trait`，不关心其具体的类型。 例如 `Box<dyn Animal>`


## 将数据保存在堆中
```rust
fn main() {
    let a = 3; // 数据保存在栈中
    let b = Box::new(3); // 数据保存在堆中 b是智能指针保存在栈中，b指向堆中对应的数据

    println!("a = {a}, b = {b}"); // 可以打印出b，因为b被隐式的解引用了

    // let c = a + b; // 但在表达式中Box不会隐式的自动解引用
    let c = a + *b; // 手动解引用后可访问到数据
    println!("c = {c}");

    /*
     * a的内存由编译器自动管理 当变量离开作用域时自动释放
     * b离开作用域时，其真实堆中数据将被Drop trait来实现释放
     */
}

```

## 避免栈中的数据拷贝
存储在栈中的数转移所有权时，其本质是对栈中的数据进行了拷贝
```rust
fn main() {
    // 例如：
    let a = [1, 2, 3];
    let b = a;
    // 当将a赋值给b时，调用了 Copy trait 。
    println!("a = {:?}, b = {:?}", a, b); // b 和 a 可以同时存在 因此a的所有权并没有被转移

    // 但若数据量非常大时
    let c = [1; 1000];
    let d = c; // 将发生复制行为，非常消耗内存
    println!("c.len = {:?}, d.len = {:?}", c.len(), d.len());

    // 将大数据使用Box包裹。使其存储在堆中
    let e = Box::new([0; 1000]);
    let f = e; // e 的所有权移动至f。

    // e不可再访问
    // println!("{}", e.len());
    println!("f.len = {}", f.len());
}
```

## 固化动态大小的数据
```rust
fn main() {
    // 动态大小的数据类型

    // 递归类型

    #[derive(Debug)]
    struct Tree {
        name: String,
        // parent: Option<Tree>
        // 这里因为parent 是递归的，理论上可以无限嵌套，因此无法在编译时确认其大小。
        parent: Option<Box<Tree>>, // 使用Box<T>来固化类型
    }

    let tree = Tree {
        name: "child".to_string(),
        parent: Some(Box::new(Tree {
            name: String::from("parent"),
            parent: None,
        })),
    };

    println!("{} {}", tree.name, tree.parent.unwrap().name)
}

```

## 特征对象
```rust
fn main() {
    trait Animal {
        fn name(&self) -> String;
        fn run(&self);
    }

    struct Cat {
        name: String,
    }

    struct Dog {
        name: String,
    }

    impl Animal for Cat {
        fn name(&self) -> String {
            self.name.clone()
        }
        fn run(&self) {
            println!("the cat run ...");
        }
    }

    impl Animal for Dog {
        fn name(&self) -> String {
            self.name.clone()
        }
        fn run(&self) {
            println!("the dog run ...");
        }
    }

    struct Zoo {
        animals: Vec<Box<dyn Animal>>,
        // 使用Box来收纳具有相同tarit的类型。忽略实际类型
    }

    impl Zoo {
        fn new() -> Self {
            Self {
                animals: Vec::new(),
            }
        }

        fn check_in(&mut self, animal: Box<dyn Animal>) {
            self.animals.push(animal)
        }

        fn showcase(&self) {
            let names: Vec<String> = self
                .animals
                .iter()
                .map(|animal| (**animal).name())
                .collect();
            println!("zoo animals: {}", names.join(","));
        }
    }

    let cat = Cat {
        name: "Tom".to_string(),
    };

    let dog = Dog {
        name: "Snoopy".to_string(),
    };

    cat.run();
    dog.run();

    let mut zoo = Zoo::new();
    zoo.check_in(Box::new(cat));
    zoo.check_in(Box::new(dog));

    zoo.showcase();
}
```

## Box::leak
Box::leak 可以强制从内存中泄露 \
例如： 将一个String转为 &'static str
``` rust
fn main() {

    fn get_world() -> &'static str {
        let a = String::from("hello");
        let b = "world";
        let c = a + b;
        Box::leak(c.into_boxed_str())
    }

    println!("{}", get_world());
}

```
