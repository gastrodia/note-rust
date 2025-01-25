# 元组

```rust
fn main() {
    let tup = (10, 20, 30);

    println!("{:?}", tup);

    let x = tup.0;
    println!("{}", x);


    // 元组可使函数返回多个返回值

    let s = String::from("hello");

    let (ss, s_len) = get_str_and_len(&s);

    println!("{}, {}", ss, s_len);

    fn get_str_and_len(s: &String) -> (&str, usize) {
        (&s, s.len())
    }

    println!("s: {}", s)
}
```