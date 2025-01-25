# 数组

在rust中 数组分两种 `array` 和 `Vector`

`array` 叫做数组，长度固定，元素类型相同 存储在栈上 类似`&srt`

`Vector` 叫动态数组，长度可变，元素类型相同 存储在堆上 类似`String`

## 定义数组
```rust
fn main() {

    // array 必须线性排列
    let arr = [1, 2, 3];
    let str_arr = ["a", "b", "c"];
    let bool_arr: [bool; 3] = [true, false, true]; // 显示的指定类型和长度
    let mut zero_arr = [0; 3]; // 初始一个长度为3的数组，元素都是0

    // 元素类型必须相同
    // let mix_arr = [1, "a", true]; // error: expected integer, found `&str`

    // array 的长度必须是常量
    // 例如下面代码会报错
    /*
    let foo = 42;
    let a: [u8; foo]; // error: attempt to use a non-constant value in a constant
     */

    /*
    fn create_arr(n: i32) {
        let arr = [1; n];
    }
    */

    const N: usize = 10;
    let arr_const = [1; N]; // 这样是可以的
    println!("arr_const: {:?}", arr_const);

    // 通过下标访问数组中的元素: arr[index]

    let arr_one = arr[0];
    let [_, arr_tow, ..] = arr;
    println!("arr_one:{}", arr_one);
    println!("arr_two:{}", arr_tow);
    println!("arr: {:?}", arr);

    // 通过下标修改数组中的元素
    zero_arr[0] = 10;
    println!("zero_arr: {:?}", zero_arr);

    let string_arr = [String::from("hello"), String::from("world")];

    println!("string_arr:{:?}", string_arr);

    // 若array中的元素是存储在栈中的，那么不能将移交元素所有权
    // let string_arr_one = string_arr[0]; // 会报错： 因为数组是固定大小的,其元素必须始终存在

    // 越界访问
    // let index = 3; // 越界  报错发生在cargo build阶段
    // let index = "100".parse::<usize>().unwrap(); // cargo build 不会报错，但是运行时会报错
    let index = 1;
    let string_arr_item = &string_arr[index];
    println!("string_arr_item:{}", string_arr_item);
}
```

## 批量初始化填充
```rust
fn main() {

    // 在上面的例子中：
    let zero_arr = [0; 3]; // 初始一个长度为3的数组，元素都是0

    println!("zero_arr:{:?}", zero_arr);

    // let string_arr = [String::from("hello"); 3];

    // 看不懂思密达
    let string_arr: [String; 3] = std::array::from_fn(|_i| String::from("hello"));
    println!("string_arr:{:?}", string_arr);
    /*
    std::array::from_fn(|_i| String::from("hello")):
    from_fn 是一个函数,用来创建固定大小的数组
    它接收一个闭包作为参数
    闭包 |_i| String::from("hello") 会被调用 3 次(数组大小),每次返回一个新的包含 "hello" 的 String
    */
}
```

## 数组切片
```rust
fn main() {
    let arr = [1, 2, 3, 4, 5]; // rust 会自动推断类型
    // arr的类型为 [i32; 5] , 长度也是类型的一部分
    println!("arr: {:?}", arr);

    // 切片 与字符串切片类似
    // 数组切片与数组的区别是，数组切片的长度是动态的 类为 &[T]

    let arr1 = &arr[..2];
    println!("arr1: {:?}", arr1);

    // 数组的类型推导
    let arr2 = [1, 2, 3, 4, 5]; // 默认为[i32; 5]
    let arr3 = [6, 7, 8, 9, 10]; // rust 根据 arr4 的类型推导出 arr3 的类型
    let arr4: [[u8; 5]; 2] = [arr2, arr3]; // [[u8; 5]; 2] 二维数组 这里我们指定了元素类型为u8

    println!("arr4: {:?}", arr4);
}

```