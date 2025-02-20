# Vector

## Vector 动态数组
```rust
use std::fmt::Debug;

fn main() {
    let _v1 = Vec::<u8>::new(); // 手动指定类型为Vec<u8>
    let mut _v2 = Vec::new(); //
    _v2.push(1_u8); // 编译器根据这行代码推导出 v2的类型为Vec<u8>
    let mut v3 = vec![1_u8]; // vec!宏可以在创建时初始化值，编译器根据值推导出类型为 Vec<u8>

    // 更新vector

    // push 方法可以向vector 的末尾追加元素
    // 但要将其设为mut
    v3.push(2);
    println!("v3: {:?}", v3);

    // vector 与元素共存亡，当vector离开作用域后其自身将会被销毁。
    // 同时其所存储的元素也会被销毁
    // 但当vector的元素被引用时，情况将会变得复杂

    // 读取vector的元素

    // &v[index] 这种方式当index越界程序将会报错推出
    let v3_0 = &v3[0];
    // v.get(index) 这种方式将返回一个Option，我们可自己决定如何处理结果或错误 避免程序崩溃
    let v3_1 = v3.get(100).unwrap_or(&0);

    println!("v3_0: {}, v3_1: {}, v3: {:?}", v3_0, v3_1, v3);

    // 遍历vector的元素
    for item in &mut v3 {
        *item += 1
    }
    println!("v3: {:?}", v3);

    // 存储不同的类型

    trait Animal: Debug {}
    #[derive(Debug)]
    struct Dog;
    #[derive(Debug)]
    struct Cat;
    impl Animal for Dog {}
    impl Animal for Cat {}

    // 使用trait object
    let mut zoo = Vec::<Box<dyn Animal>>::new();
    zoo.push(Box::new(Dog {}));
    zoo.push(Box::new(Cat {}));
    println!("zoo: {:?}", zoo);
}
```

## 动态数组的方法
```rust
use std::any::type_name_of_val;
use std::fmt::Debug;

fn main() {
    let mut v1 = vec![1, 2, 3];
    // v1 = Vec::from([1, 2, 3]); // 使用数组初始化vec
    // v1 = vec![0, 3]; // 直接初始化vec长度为3填充0
    // v1 = [1, 2, 3].to_vec(); // 根据数组初始化vec

    v1.push(4); // 追加元素
    println!("v1: {:?}", v1);

    // 预估容量 减少容量不足时发生的内存拷贝
    let mut v2 = Vec::<u8>::with_capacity(3);
    println!("[1]: v2: {:?}, len: {}, capacity: {}", v2, v2.len(), v2.capacity());
    v2.extend([1, 2, 3]);
    println!("[2]: v2: {:?}, len: {}, capacity: {}", v2, v2.len(), v2.capacity());

    v2.extend([4, 5, 6]);
    println!("[3]: v2: {:?}, len: {}, capacity: {}", v2, v2.len(), v2.capacity()); // 容量自动发生变化

    v2.reserve(100); // 调整容量
    println!("[4]: v2: {:?}, len: {}, capacity: {}", v2, v2.len(), v2.capacity()); // 容量发生变化

    v2.shrink_to_fit(); // 释放多余内存
    println!("[5]: v2: {:?}, len: {}, capacity: {}", v2, v2.len(), v2.capacity()); // 容量发生变化

    // 检查vector是否是空数组
    println!("v2 is empty: {}", v2.is_empty());

    // 在指定为主插入元素
    v2.insert(1, 99);
    println!("[6]: v2: {:?}, len: {}, capacity: {}", v2, v2.len(), v2.capacity()); // 容量发生变化

    // 移除指定位置的元素并返回
    let v2_1 = v2.remove(1);
    println!("[7]: v2: {:?}, len: {}, capacity: {}, remove: {}", v2, v2.len(), v2.capacity(), v2_1); // 容量不发生变化

    // 删除尾部元素并返回Option 如果是空数组返回None
    let v2_2 = v2.pop();
    println!("[8]: v2: {:?}, len: {}, capacity: {}, pop: {:?}", v2, v2.len(), v2.capacity(), v2_2); // 容量不发生变化

    // 清空数组
    v2.clear();
    println!("[9]: v2: {:?}, len: {}, capacity: {}", v2, v2.len(), v2.capacity()); // 容量不发生变化

    let mut v3 = vec![1, 2, 3];
    let mut v4 = vec![4, 5, 6];

    // 把v3中的元素放在v4最前面。并且清空v3
    v4.append(&mut v3);
    println!("-[1]: v4: {:?}, v3: {:?}", v4, v3);

    // 从0开始截取指定长度，会修改原数组，超过指定长度的元素将被清空
    v4.truncate(3);
    println!("-[2]: v4: {:?}", v4);

    // 过滤数组（类似js filter方法） 会修改原数组，不符合条件的元素将被移除
    v4.retain(|&x| x % 2 == 0);
    println!("-[3]: v4: {:?}", v4);

    v4.extend([7, 8, 9]);
    println!("-[4]: v4: {:?}", v4);
    // 删除指定范围的元素
    let v4_1 = v4.drain(0..3).collect::<Vec<_>>();
    println!("-[5]: v4: {:?}, drain: {:?}", v4, v4_1);

    // 数组切片式
    let v4_2 = &v4[..];
    println!("-[6]: v4: {:?}: {}, v4_2: {:?}: {}", v4, type_name_of_val(&v4), v4_2, type_name_of_val(v4_2));

    // 排序
    let mut v5 = vec![5, 3, 6, 8, 4];
    v5.sort();
    println!("[1]: v5: {:?}", v5);

    let mut v6 = vec![5.0, 3.0, 6.0, 8.0, 4.0];
    // v6.sort(); // 报错 因为浮点数没有实现 Ord trait
    // 浮点数当中，存在一个 NAN 的值，这个值无法与其他的浮点数进行对比，
    // 因此，浮点数类型并没有实现全数值可比较 Ord 的特性，
    // 而是实现了部分可比较的特性 PartialOrd。

    v6.sort_unstable_by(|a, b| a.partial_cmp(b).unwrap());
    println!("[1]: v6: {:?}", v6);

    // 结构体排序

    #[derive(Debug, Clone, Ord, PartialOrd, Eq, PartialEq)]
    struct Person {
        // 使用 sort_unstable 比较时
        // 会跟这里的字段顺序有关系，因为name在age前面，会先比name，再比age
        // 且需要结构体实现  Ord, PartialOrd, Eq, PartialEq trait
        name: String,
        age: u8,
    }

    impl Person {
        fn new(name: String, age: u8) -> Person {
            Person { name, age }
        }
    }

    let v7 = [
        Person::new("Maria".to_string(), 50),
        Person::new("William".to_string(), 75),
        Person::new("Jane".to_string(), 25),
        Person::new("Joe".to_string(), 15)
    ];

    let mut v8 = Vec::from(&v7);
    // 使用闭包函数根据age排序
    v8.sort_unstable_by(|a, b| a.age.cmp(&b.age));

    println!("v8: {:?}", v8);
    let mut v9 = Vec::from(&v7);

    v9.sort_unstable();
    println!("v9: {:?}", v9);

    let diff = Person::new("Atm".to_string(), 25) > Person::new("Jane".to_string(), 15); // A比J小
    println!("diff: {:?}", diff);

}
```