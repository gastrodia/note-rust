# 迭代器


## 迭代器基础
```rust

fn main() {
    let arr = [1, 2, 3];

    for item in arr.iter() {
        // for 循环通过不停调用迭代器上的 next 方法，来获取迭代器中的元素。
        println!("from for: {}", item);
    }

    let mut arr_iter = arr.iter();
    println!("from next: {:?}", arr_iter.next());
    println!("from next: {:?}", arr_iter.next());
    println!("from next: {:?}", arr_iter.next());
    println!("from next: {:?}", arr_iter.next());

    // 我们自己实现一个for方法 类似js的 forEach
    fn each<V, T>(arr: &[V], callback: T)
    where
        T: Fn(&V),
    {
        // let mut arr_iter = arr.into_iter();
        // 两种写法是等价的
        let mut arr_iter = IntoIterator::into_iter(arr);

        /*
        match IntoIterator::into_iter(arr) {
            mut iter => loop {
                match iter.next() {
                    Some(item) => callback(item),
                    None => break,
                }
            },
        }
        */
        // 两种写法是等价的
        while let Some(value) = arr_iter.next() {
            callback(value);
        }
    }

    each(&arr, |x| println!("from each arr: {}", x));
    let vec_arr = vec!["a", "b", "d"];

    each(&vec_arr, |x| println!("from each vec: {}", x));

    // Vec实现了IntoIterator 特征，所以可以使用into_iter方法

    let tuple = (1, 2, 3);
    // 元组没有实现IntoIterator特征，因此不能使用for循环
    /* for item in tuple {
        println!("{}", item);
    }*/
}
```

## 实现迭代器
```rust
fn main() {
    // 为自己的结构体实现迭代器
    #[derive(Debug)]
    struct MyTuple(u8, u8, u8);

    // 所有权问题
    // iter // 不可变借用
    // into_iter // 夺走使用者的所有权
    // iter_mut // 可变借用

    struct MyTupleIntoIterator {
        tuple: MyTuple,
        index: usize,
    }

    #[derive(Debug)]
    struct MyTupleIterator<'a> {
        tuple: &'a MyTuple,
        index: usize,
    }

    #[derive(Debug)]
    struct MyTupleIteratorMut<'a> {
        tuple: *mut MyTuple, // 使用原始指针
        index: usize,
        _marker: std::marker::PhantomData<&'a mut MyTuple>, // 关联生命周期
    }

    // 实现迭代器基本特征
    impl Iterator for MyTupleIntoIterator {
        type Item = u8;
        fn next(&mut self) -> Option<Self::Item> {
            let result = match self.index {
                0 => Some(self.tuple.0),
                1 => Some(self.tuple.1),
                2 => Some(self.tuple.2),
                _ => None,
            };
            self.index += 1;
            result
        }
    }

    impl<'a> Iterator for MyTupleIterator<'a> {
        type Item = &'a u8;
        fn next(&mut self) -> Option<Self::Item> {
            let result = match self.index {
                0 => Some(&self.tuple.0),
                1 => Some(&self.tuple.1),
                2 => Some(&self.tuple.2),
                _ => None,
            };
            self.index += 1;
            result
        }
    }

    impl<'a> Iterator for MyTupleIteratorMut<'a> {
        type Item = &'a mut u8;
        fn next(&mut self) -> Option<Self::Item> {
            unsafe {
                let tuple = &mut *self.tuple; // 转换为可变引用
                let result = match self.index {
                    0 => Some(&mut tuple.0),
                    1 => Some(&mut tuple.1),
                    2 => Some(&mut tuple.2),
                    _ => None,
                };
                self.index += 1;
                Some(result?) // 返回具有'a生命周期的引用
            }
        }
    }

    // iter_mut 和 iter不需要实现某种特征
    impl MyTuple {
        // 实现不可变借用的 iter
        fn iter(&self) -> MyTupleIterator {
            MyTupleIterator {
                tuple: self,
                index: 0,
            }
        }

        // 实现可变借用 iter_mut
        fn iter_mut(&mut self) -> MyTupleIteratorMut {
            MyTupleIteratorMut {
                tuple: self as *mut MyTuple, // 转换为原始指针
                index: 0,
                _marker: std::marker::PhantomData,
            }
        }
    }

    // 实现 into_iter 夺走使用者的所有权
    impl IntoIterator for MyTuple {
        type Item = u8;
        type IntoIter = MyTupleIntoIterator;

        fn into_iter(self) -> Self::IntoIter {
            MyTupleIntoIterator {
                tuple: self,
                index: 0,
            }
        }
    }

    let my_tuple = MyTuple(1, 2, 3);
    for item in my_tuple.into_iter() {
        println!("from my tuple: {}", item);
    }
    // println!("{:?}", my_tuple); // 不可再用。因为my_tuple的所有权被转移到into_iter中了

    let you_tuple = MyTuple(2, 2, 2);
    let you_tuple_iter = you_tuple.iter();
    println!("from you tuple: {:?}", you_tuple_iter);
    let you_tuple_iter_sum = you_tuple_iter.sum::<u8>(); // sum是消费者(消费适配器)，夺走了 you_tuple_iter 所有权
    println!("you_tuple_iter_sum: {}", you_tuple_iter_sum);
    // println!("from you tuple: {:?}", you_tuple_iter); // you_tuple_iter丧失所有权。不可再被使用

    let mut me_tuple = MyTuple(1, 2, 3);

    for item in me_tuple.iter_mut() {
        *item += 1;
    }

    println!("{:?}", me_tuple);
}


```

## 迭代适配器
```rust
use std::collections::HashMap;

fn main() {
    let mut vec_arr = vec![1, 2, 3];

    // 迭代适配器是惰性的，不产生任何行为。需要使用消费器来收尾
    // vec_arr.iter().map(|x| x + 1); //

    let vec_arr_map = vec_arr.iter().map(|x| x + 1);
    // 使用collect消费器来收集map适配器的结果
    let vec_arr_map_collect = vec_arr_map.collect::<Vec<i32>>();

    println!(
        "vec_arr: {:?}, vec_arr_map_collect: {:?}",
        vec_arr, vec_arr_map_collect
    );

    // 使用for循环消费
    for item in vec_arr.iter().map(|x| x * 2) {
        println!("from vec_arr: {}", item);
    }

    let hello = ["hello", "world"];
    let world = ["你好", "世界"];

    // zip是一个迭代适配器 将两个迭代器内容压缩到一起的 形如：Item=[(hello1, world1),(hello2, world2)]
    let fork1 = hello.clone().into_iter().zip(world.clone().into_iter());
    let fork_map: HashMap<_, _> = fork1.collect();

    let fork2 = hello.clone().into_iter().zip(world.clone().into_iter());
    let fork_vec: Vec<(_, _)> = fork2.collect();
    // 不同的类型注解使得collect消费器产生的结果不同
    println!("fork_map: {:?}", fork_map);
    println!("fork_vec: {:?}", fork_vec);
}


```

## 迭代器方法
```rust
fn main() {
    #[derive(Debug)]
    struct Counter {
        count: u8,
    }

    impl Iterator for Counter {
        type Item = u8;
        fn next(&mut self) -> Option<Self::Item> {
            let count = self.count;
            if count > 5 {
                return None;
            }
            self.count += 1;
            Some(count)
        }
    }

    impl Counter {
        fn new() -> Self {
            Counter { count: 0 }
        }
    }

    let mut cache = Counter::new();

    println!("Counter skip {:?}", Counter::new().skip(1));

    // 只有next需要我们手动实现，其他方法(适配器和消费器)在iter中都有默认实现，因此我们可以直接使用
    let data: u8 = cache
        .zip(Counter::new().skip(1)) // 将两个迭代器的元素配对（适配）
        .map(|(a, b)| a * b) // 将配对的元素相乘（适配）
        .filter(|x| x % 3 == 0) // 过滤出能被3整除的结果（适配）
        .sum(); // 求和（消费）
    /*
        zip 把两个迭代器合并成一个迭代器，新迭代器中，每个元素都是一个元组，由之前两个迭代器的元素组成。
    例如将形如 [1, 2, 3, 4, 5] 和 [2, 3, 4, 5] 的迭代器合并后，新的迭代器形如 [(1, 2),(2, 3),(3, 4),(4, 5)]
        map 是将迭代器中的值经过映射后，转换成新的值[2, 6, 12, 20]
        filter 对迭代器中的元素进行过滤，若闭包返回 true 则保留元素[6, 12]，反之剔除
    */


    println!("cache data: {}", data);

    // 获取迭代器索引

    let arr = vec![1, 2, 3, 4, 5];
    /*
    let arr_iter = arr.iter();
    let arr_index = arr_iter.enumerate(); // [(index, item)]
    */

    let result = arr.iter()
        .enumerate()
        .filter(|(i, _)| i % 2 == 0)
        .map(|(_, v)| v)
        .fold(0, |acc, v| acc + v);

    println!("arr result: {}, {:?}", result, arr);
}
```

## 利用迭代器实现斐波那契数列
```rust
fn main() {
    struct Fibonacci {
        curr: u32,
        next: u32,
    }

    // Implement `Iterator` for `Fibonacci`.
    // The `Iterator` trait only requires a method to be defined for the `next` element.
    impl Iterator for Fibonacci {
        // We can refer to this type using Self::Item
        type Item = u32;

        /* Implement next method */
        fn next(&mut self) -> Option<Self::Item> {
            let new_next = self.curr + self.next;
            self.curr = self.next;
            self.next = new_next;
            Some(self.curr)
        }
    }

    // Returns a Fibonacci sequence generator
    fn fibonacci() -> Fibonacci {
        Fibonacci { curr: 0, next: 1 }
    }

    let mut fib = fibonacci();
    for item in fib.take(10) {
        println!("Fibonacci {}", item);
    }
}
```