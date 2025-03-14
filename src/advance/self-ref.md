# 结构体中自引用

## 自引用存在的问题
```rust
struct Wrapper<'a> {
    value: String,
    ref_value: &'a str
}

fn main() {
    let a = String::from("hello world");
    let b = Wrapper {
        value: a,
        ref_value: &a
        //         ^^ 在移动一个值的时候同时发生了引用
        //            所有权转移和借用同时发生
    };
}
```
## 使用`Option`修复自引用
```rust
#[derive(Debug)]
struct Wrapper<'a> {
    value: String,
    ref_value: Option<&'a str>
}

fn main() {
    let a = String::from("hello world");

    let mut b = Wrapper {
        value: a,
        ref_value: None
    };

    b.ref_value = Some(&b.value);

    println!("{:?}", b); // 完全没问题
}
```

## 使用`Option`存在的问题
```rust
# #[derive(Debug)]
# struct Wrapper<'a> {
#     value: String,
#     ref_value: Option<&'a str>
# }

fn main() {
    foo();
}

fn foo<'a>() -> Wrapper<'a> {
    let x = String::from("hello world");

    let mut y = Wrapper {
        value: x,
        ref_value: None
    };

    y.ref_value = Some(&y.value);

    y
    // ^^^ 发生了报错。
}

```

因为生命周期规则要求`'a`的`ref_value`的值的生命周期要比`Wrapper`长 \
而此时**两者生命周期将完全一致**，违反`Rust`的生命周期规则。 \
当`x`将`String`移交给`y.value`时，`y`成为了该`String`的拥有者。`ref_value`引用`y`自身的`String`。 \
`Rust`编译器无法验证自引用结构体的生命周期安全性。 \
当`Wrapper`发生移动或销毁时，`ref_value`将造成悬垂引用。

## 使用`unsafe`和裸指针解决自引用

```rust
#[derive(Debug)]
struct Wrapper {
    value: String,
    ref_value: *mut String // 仅保存裸指针
}

impl Wrapper {
    fn new(s: String) -> Self {
        Wrapper {
            value: s,
            ref_value: std::ptr::null_mut()
        }
    }

    fn bind_ref(&mut self) {
        let v_ptr: *mut String = &mut self.value;
        self.ref_value = v_ptr;
    }

    fn value(&self) -> &str {
        &self.value
    }

    fn ref_value(&self) -> &str {
        unsafe {
            &*self.ref_value
        }
    }

    fn ref_value_push(&mut self, s: &str) {
        unsafe {
            let mut v_ptr = &mut *self.ref_value;
            v_ptr.push_str(s);
        }
    }

    fn value_push(&mut self, s: &str) {
        self.value.push_str(s);
    }
}

fn main() {
    let a = String::from("hello");
    let mut b = Wrapper::new(a);
    b.bind_ref(); // 手动更新裸指针
    println!("[b 更新后] {:?}, {}", b, b.ref_value());

    let mut c = b; // 当b移交所有权
    c.ref_value_push("1"); // 更新指针前用指针操作值，丢失
    c.value_push("2"); // 更新指针前操作值本身，正常
    println!("[c 更新前] {:?}, {}", c, c.ref_value());

    c.bind_ref(); // 手动更新
    c.ref_value_push("3"); // 更新后使用指针操作值，正常
    println!("[c 更新后] {:?}, {}", c, c.ref_value());
}
```

## 使用`Pin<Box<T>>`

```rust
use std::marker::PhantomPinned;
use std::pin::Pin;
use std::ptr::NonNull;

#[derive(Debug)]
struct Wrapper {
    value: String,
    ref_value: NonNull<String>, // 使用NonNull确保其不会是空指针
    _pin: PhantomPinned // 禁止移动的标记
}

impl Wrapper {
    fn new(value: String) -> Pin<Box<Self>> {
        let vo = Self {
          value,
          ref_value: NonNull::dangling(), // 创建临时无效指针
          _pin: PhantomPinned //  标记为不可移动
        };

        let mut boxed = Box::pin(vo); // 将对象固定到堆内存
        let ref_value = NonNull::from(&boxed.value); // 获取value的有效指针

        unsafe {
            let mut_boxed = Pin::as_mut(&mut boxed); // 获取可变Pin引用
            Pin::get_unchecked_mut(mut_boxed).ref_value = ref_value; // 写入有效指针
        }
        boxed
    }

    fn ref_value_push(self: Pin<&mut Self>, s: &str) {
        unsafe {
            // 通过 Pin 获取内部可变引用
            let mut_ref = self.get_unchecked_mut(); // 得到可变引用的Wrapper
            let mut ref_value = mut_ref.ref_value.as_ptr(); // 得到可变指针
            let origin_mut = &mut *ref_value; // 得到实际String可变引用
            origin_mut.push_str(s);
        }
    }
}

fn main() {
    let x = String::from("hello");
    let y = Wrapper::new(x);
    println!("[y 创建后] {:?}, {:?}", y, y.ref_value);

    // 移交y的所有权
    let mut z = y;
    // 直接通过指针改原始值
    z.as_mut().ref_value_push(" world");
    println!("[z 接受后] {:?}, {:?}, {}", z, z.ref_value, z.value); // z.ref_value保存的指针未变动
}
```