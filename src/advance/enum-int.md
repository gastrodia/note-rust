# 枚举和整数

某些时候，我们可能需要根据某个值来匹配对应的枚举 \
如 输入2 得到 Num::Two

```rust
fn main() {
  enum Num {
    One = 1,
    Two = 2,
    Three = 3,
  }

  let a = 1;
  match a {
    // Num::One => println!("one"),
    // ^ 报错：因为a是i32类型，因此这里不能为Num枚举类型
    _ => ()
  }
}
```

## 使用第三方库 num_enum
Cargo.toml
```toml
[dependencies]
num_enum = "0.7.3"
```

```rust
use num_enum::TryFromPrimitive;

fn main() {
  // 使用第三方库 num_enum 来解决这个问题
  #[derive(TryFromPrimitive, Debug)]
  #[repr(i32)] // 控制底层类型的大小
  enum Num {
    One = 1,
    Two = 2,
    Three = 3
  }

  let b = 2;
  match Num::try_from(b) {
   /*
    Ok(Num::One) => println!("from num_enum_run: one"),
    Ok(Num::Two) => println!("from num_enum_run: two"),
    Ok(Num::Three) => println!("from num_enum_run: three"),
    */
    // 亦或：
    Ok(x) => {
      match x {
        v => println!("from num_enum_run: {:?}", v)
      }
    }
    _ => println!("from num_enum_run: other")
  }
}
```

## 使用as
```rust
fn main() {
  enum Num {
    One = 1,
    Two = 2,
    Three = 3,
  }

  let a = 1;

  // 思路：我们可以使用as将 Num枚举分支转为i32类型
  assert_eq!(a, Num::One as i32);

  // 因此：
  match a {
    x if x == Num::One as i32 => println!("one"),
    x if x == Num::Two as i32 => println!("two"),
    x if x == Num::Three as i32 => println!("two"),
    _ => println!("other")
  }
}
```

## 为枚举实现TryFrom 手动实现转换
```rust
use std::convert::TryFrom;
fn main() {
  #[derive(Debug, PartialEq)]
  enum Num {
    One = 1,
    Two = 2,
    Three = 3,
  }

  let a = 1;

  impl TryFrom<i32> for Num {
    type Error = ();

    fn try_from(v: i32) -> Result<Self, Self::Error> {
      match v {
        x if x == Num::One as i32 => Ok(Num::One),
        x if x == Num::Two as i32 => Ok(Num::Two),
        x if x == Num::Three as i32 => Ok(Num::Three),
        _ => Err(())
      }
    }
  }

  let b = Num::try_from(a);
  println!("{:?}", b);

  let c: Result<Num, ()> = a.try_into();
  println!("{:?}", c);

  assert_eq!(Ok(Num::Two), 2.try_into());


  // 同理
  impl From<Num> for i32 {
    fn from(value: Num) -> Self {
      value as i32
    }
  }

  let d: i32 = Num::Three.into();
  println!("{:?}", d);
}

```

## 使用 transmute 来实现转换
```rust
fn main() {
  #[derive(Debug, PartialEq)]
  #[repr(i32)]
  enum Num {
    One = 1,
    Two = 2,
    Three,
  }

  let a = 2;
  let b: Num = unsafe { std::mem::transmute(a) };
  println!("{:?}", b);
  assert_eq!(Num::Three, unsafe { std::mem::transmute(3) });

  let c: Num = unsafe { std::mem::transmute(100) };
  println!("c: {:?}", c);
  // assert_eq!(Num::Three, c); // 如果溢出，虽然也是Num::Three，但是却不相等
}
```