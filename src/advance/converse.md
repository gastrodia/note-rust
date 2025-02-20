# 类型转换

## as
```rust
use std::convert::TryInto;

fn main() {
  let a = 1_i32;
  let b = a as f32;

  // 小转大
  let c = 1u8;
  let d = c as u16;

  // 大转小 // 容易导致bug
  let e = 300;
  let f = e as u8; // 结果为44 因为 u8最大为255 256的u8会变成0在依次往前计数 300 % (255 + 1)
  println!("e = {e}, f = {f}, u8Max={}", u8::MAX);
  // 事实上，对于正整数而言，就是如下的取模
  println!("300 mod 256 is : {}", 300 % 256);

  assert_eq!(-1_i8 as u8, i8_2_u8(-1));

  fn i8_2_u8(i: i8) -> u8 {
    let i = i as i16;
    let max = u8::MAX as i16;
    let r = (i + max + 1) % (max + 1);
    println!("r: {}", r);
    r.try_into().unwrap() // r 一定大于0 小于 255
  }

  // 从 Rust 1.45 开始，当浮点数超出目标整数的范围时，转化会直接取正整数取值范围的最大或最小值
  assert_eq!(300.1_f32 as u8, u8::MAX);
  assert_eq!(-100.1_f32 as u8, u8::MIN);

  let g = 'a' as u8;
  let h = '你' as u16; // 得到的是十进制的Unicode (原本是十六进制的U+4F60, 转为10进制后为20320)
  println!("g = {g}, h = {h}");

  // 内存地址转换为(裸)指针
  let mut arr = [1, 2];
  let p1 = arr.as_mut_ptr(); // 把arr转为了可变指针(*mut i32 ) 可以使用该指针修改arr中的元素
  let p2 = arr.as_ptr(); // 不可变指针(*const i32 ) // 不可修改arr的元素 只读

  // 内存地址是 十六进制
  println!("p1 = {:p}, p2 = {:p}", p1, p2);
  // 打印出来的是内存地址. 内存地址一模一样的,但是 p1和p2的能力却不一样(p1,可读可写,p2只读)
  /*
  因此说明指针与内存地址的关系如下:
  1. (裸)指针是存储内存地址的变量
  2. (裸)指针的类型（可变(裸)指针*mut T或不可变(裸)指针*const T）决定了是否可以修改指向的内存中的数据。
  */

  let p3 = p1 as usize; // 将内存地址转为10进制
  println!(
    "p3 = {}, i32 size: {}, i32 max: {}",
    p3,
    std::mem::size_of::<i32>(),
    i32::MAX
  ); // i32占用四个字节
  // 1个字节 = 8位2进制的数 即 00000000
  // 4四个字节 = 32位2进制的数字 即 00000000 00000000 00000000 00000000
  // 从 00000000 00000000 00000000 00000000 到 11111111 11111111 11111111 11111111 共能表示4294967296个数.即 2的32次方
  // 但是 在 i32 中 有一个符号数的一位需要用来表示正负 (例如 => _0000000 00000000 00000000 00000000)
  // 则 可以得出 i32 可表示的最大数为 2^31 - 1 即 2147483647 即 i32::MAX
  let p4 = p3 + 4; // 我们把指针往后移动4个字节
  let p5 = p4 as *mut i32; // 将10进制转为指针
  unsafe {
    // 对裸指针做解引用可访问指针指向的内存地址中的数据
    // 因为裸指针不受 Rust 的所有权和借用检查系统的保护, 因此在解引用时我们需要使用unsafe块
    println!("form *p2: {:?}", *p2);

    *p1 = 100; // 直接修改内存中的值
    *p5 = 200;
    println!("form *p2: {:?}", *p2);
  }
  println!("{:?}", arr); // [100, 200]
}

```

## TryInto
```rust
use std::convert::TryInto;

fn main() {
  // as 方法有限制 例如 i32 转 u8
  let a = 300;
  let b = a as u8;
  println!("b = {b}"); // 得到b为44

  fn i32_as_u8(value: i32) -> u8 {
    // 使用try_into
    let result: u8 = match value.try_into() {
      Ok(v) => v,
      Err(e) => {
        println!("Error: {e}: {value}_i32 => u8");
        // 模拟溢出行为 例如 300_i32 as u8 为 44
        let max = u8::MAX as usize;
        let value_usize = value as usize;
        let v = value_usize % (max + 1);
        v as u8
      }
    };
    result
  }

  let c = i32_as_u8(0);
  let d = i32_as_u8(255);
  let e = i32_as_u8(256);
  let f = i32_as_u8(300);
  println!("c = {c}, d = {d}, e = {e}, f = {f}");
}
```

## .运算符的隐式行为
```rust
fn main() {
  // 当我们使用点运算符调用结构体的方法时，会存在隐式的行为
  // 例如 自动引用 自动解引用 等

  let arr = [1, 2];
  let _ = arr[0];
  // 在这段代码中 arr[0] 其实是 arr.index(0) 的语法糖
  // 而index方法是Index trait的实现
  // 在[T; const N]Index的实现中存在这段代码>   Index::index(self as &[T], index)
  // 可以看到 在实现Index::index 方法时, 将self使用as转为数组切片
  // 因此点操作符号 可能存在隐式的类型转换
  // arr[0] => arr.index(0) => Index::index(arr as &[i32], 0)

  #[derive(Clone)]
  struct Container<T>(T);

  fn foo<T>(a: &Container<i32>, b: &Container<T>) {
    let a_clone = a.clone(); // Container<i32>
    let b_clone = b.clone(); // &Container<T>
    // 为什么b不是 Container<T> 而是 &Container<T> ?
  }
  // 验证上面的问题
  impl<T> Container<T> {
    fn set(&mut self, value: T) {
      self.0 = value;
    }
  }

  fn bar<T>(a: &Container<i32>, b: &Container<T>, b_value: T) {
    let mut a_clone = a.clone(); // Container<i32>
    let mut b_clone = b.clone(); // &Container<T>
    a_clone.set(2);
    // b_clone.set(b_value); 打开这段代码后重新执行
    // 编译器报错： cannot borrow `*b_clone` as mutable, as it is behind a `&` reference
    // ^^^^^^^^^^ 无法将 `*b_clone` 作为可变借用，因为它位于 `&` 引用之后。
    // `Container<T>` doesn't implement `Clone` because its implementations trait bounds could not be met, so this call clones the reference `&Container<T>`
    // ^^^^^^^^^^ 上面的报错说的很清楚，翻译过来就是：
    // Container<T> 没有实现“Clone”，因为无法满足其实现特征边界，因此此调用克隆了引用 &Container<T>
    // 问题得到了验证
  }
  // 为什么会这样？
  // Container明明加了#[derive(Clone)]。
  // 而且 &Container<i32> 就可以正常clone
  // 为什么 &Container<T> 不行
  /*
  一个复杂类型能否派生 Clone，
  需要它内部的所有子类型都能进行 Clone。
  */
  // 如何理解这句话？
  // 我们来看看派生的Clone trait 做了什么

  #[derive(Debug)]
  struct Demo<T>(T);
  // #[derive(Clone)] 这个trait就等同于下面
  impl <T>Clone for Demo<T> where T: Clone  {
    fn clone(&self) -> Self {
      Self(self.0.clone()) // 如果我们不加 where T: Clone 此处将报错
    }
  }

  // 例如：
  struct Omg(); // 没有实现Clone
  let demo = Demo(Omg()); // Demo实现了Clone 但Omg没有
  // let demo_ = demo.clone(); // 则Demo无法被clone
  // println!("{:?}", demo);

  // 如果你的结构体中的所有字段都实现了 Clone，
  // 你可以直接使用 #[derive(Clone)] 来自动派生 Clone 实现。
  // Rust 会为你自动生成 clone 方法的实现，而不需要手动编写 impl 代码
  // 但前提是 T 必须自己实现了 Clone trait。
  // 因此 Container<T>(T) 是否实现 Clone 的关键在于 T 类型是否实现了 Clone 特征。


  // 也就是说 只有T实现了Clone，Container的Clone才能有效
  // 在Container<i32>中。i32实现了Clone
  /*
  如:
  let a = 1_i32;
  let b = a.clone();
  */
  // 因此Container<i32>可以被克隆其本体

  // 在Container<T>没有约束T需要实现Clone trait
  // 因此Container<T>并没有实现Clone


  /*
  自动解引用触发结构体的 Clone:
  当结构体实现 Clone 且类型明确时（如 Container<i32>），对引用调用 .clone() 会自动解引用并调用结构体的方法。
  此处的解引用就是点运算符的强制类型适配行为

  泛型场景的保守行为：
  若泛型参数未约束为 Clone，编译器默认使用引用的 Clone 实现，避免潜在错误。
  */

  fn bar_fix<T>(a: &Container<i32>, b: &Container<T>, b_value: T)
  where
    T: Clone, // 我们限制T必须实现Clone trait
  {
    let mut a_clone = a.clone(); // Container<i32>
    let mut b_clone = b.clone(); // 此时克隆得到 Container<T> 本体
    a_clone.set(2);
    b_clone.set(b_value);
  }
}


```

## transmute
```rust
fn main() {
  // 任意转换

  unsafe {
    // 只要保证他们大小一致就能随意转换
    // std::mem::transmute::<char, u8>('a'); //Error `char` (32 bits) `u8` (8 bits)
    std::mem::transmute::<char, u32>('a');
    #[derive(Debug)]
    struct Demo {
      count: u128
    };
    let demo = std::mem::transmute::<&str, Demo>("你好世界");
    println!("demo = {:?}", demo); // 会得到不可预期的结果

    let count = std::mem::transmute::<Demo, u128>(demo);
    println!("count = {:?}", count); // 会得到不可预期的结果

    #[derive(Debug)]
    struct Deno {
      count: &'static str,
    }
    let deno = std::mem::transmute_copy::<u128, Deno>(&count);
    println!("deno = {:?}", deno); // 会得到不可预期的结果
    // 奇葩 哈哈哈
  }
}

```

## From Into
```rust
fn main() {
  // From 和 Into 是配对出现的
  // 只要我们实现了From。那么就可以使用from和into这两个方法
  // 但into需要显式的指定类型
  let word = "hello";
  let _word_from = String::from(word);
  let _word_to_string = word.to_string();
  let _word_into:String = word.into(); // 需要标注类型 into会自动调用目标类型的from方法

  #[derive(Debug)]
  struct Demo {
    name: String
  }

  // 为Dome实现Form<&str>的trait
  impl From<&str> for Demo {
    fn from(s: &str) -> Self {
      Demo {
        name: format!("^{}^", s)
      }
    }
  }

  // 实现了 From<&str>
  let cxk = Demo::from("cxk");
  println!("cxk = {:?}", cxk);

  let gg_bond: Demo = "GGBond".into(); // 等价于 Demo::from("cxk")
  println!("gg_bond = {:?}", gg_bond);


  // 为String 实现 From<Demo>
  // 使得我们可以使用 String::from(demo)
  // 和 let v: String = Demo::into(demo)
  impl From<Demo> for String {
    fn from(demo: Demo) -> Self {
      format!("_{}_", demo.name)
    }
  }

  let jack = String::from(Demo { name: String::from("tom") });
  println!("jack = {:?}", jack);

  let tom = Demo { name: String::from("tom") };
  // let tom_name: String = Demo::into(tom);
  let tom_name: String = tom.into();
  println!("tom_name = {:?}", tom_name);


  // let demo_str = demo.to_string(); // 需要实现 Display

  trait MyForm<T> {
    fn my_form(value: T) -> Self;
  }


  #[derive(Debug)]
  struct Book {
    name: String
  }

  impl MyForm<&str> for Book {
    fn my_form(value: &str) -> Book {
      Book {
        name: value.to_string()
      }
    }
  }


  trait MyInto<After> {
    fn my_into(self) -> After;
  }

  // 为泛型Before实现trait
  impl <Before, After>MyInto<After> for Before
  where
    After: MyForm<Before> // 要求After类型必须实现MyForm<Before> trait
  {
    fn my_into(self) -> After {
      After::my_form(self) // 调用After类型的 my_form
    }
  }

  let rust = Book::my_form("rust");
  println!("rust = {:?}", rust);

  let python: Book      =     "python".my_into();
  //          ^^^^ After      ^^^^^^^ Before
  println!("python = {:?}", python);

}

```