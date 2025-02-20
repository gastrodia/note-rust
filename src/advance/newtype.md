# newtype

## newtype
- 因为孤儿规则的存在，我们需要使用包装类型
- 例如 我们不能为标准库的String类型实现Display
```rust
fn main() {
  // impl std::fmt::Display for String
  // ^^^^^^^^^^^^^^^^^^^^^^^ Error code E0117

  // 我们可以使用newtype来规避该错误

  struct Wrapper(String);

  impl std::fmt::Display for Wrapper {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
      write!(f, "=> {} <=", self.0)
    }
  }

  let hello = Wrapper(String::from("hello"));

  println!("{}", hello);
}
```

## 类型别名
类型别名并不是一个独立的全新的类型，而是某一个类型的别名
```rust
fn main() {
  type MyU8 = u8; // 为u8指定别名

  let a = 1_u8;
  let b: MyU8 = 1;

  assert_eq!(a, b); // 虽然类型名不同 其实他们是同一种类型
  let c = a + b; // b 任然被当作u8处理
  println!("{:?}", c);


  // 泛型支持
  type MyResult<T> = std::result::Result<T, &'static str>;
  let d: MyResult<u8> = Ok(1);
  let e: MyResult<u8> = Err("Not Found");
  // 可避免我们重发的写某串很长的类型
}
```