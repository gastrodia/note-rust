# 结构体

## 定义结构体
```rust
fn main() {
    // 定义结构体
    struct User {
        name: String,
        age: u8,
        hobbies: String,
        active: bool,
    }

    // 创建结构体实例
    fn gen_user(name: &str, age: u8, hobbies: &str) -> User {
        User {
            name: String::from(name),
            age,
            hobbies: String::from(hobbies),
            active: true,
        }
    }

    let mut cxk = gen_user("cxk", 18, "ctrl");

    // 访问结构体字段
    println!("name: {}", cxk.name);

    println!("age: {}", cxk.age);
    println!("hobbies: {}", cxk.hobbies);
    println!("active: {}", cxk.active);

    // 修改结构体字段的值
    cxk.name = String::from("鸡哥"); // 修改结构体字段的值需要将结构体声明为mut
    println!("name: {}", cxk.name);

    // 根据已有实例创建新实例
    let omg = User {
        name: String::from("omg"),
        ..cxk
    };

    println!("omg name: {}", omg.name);
    println!("omg hobbies: {}", omg.hobbies); // 从cxk中继承了除name外的所有字段

    // 把结构体中具有所有权的字段转移出去后，将无法再访问该字段，但是可以正常访问其它的字段。
    println!("cxk name: {}", cxk.name); // 未移交的字段仍可继续访问
    // println!("cxk hobbies: {}", cxk.hobbies); // 无法再访问cxk的hobbies字段，因为hobbies字段为String类型。所有权被move到omg的hobbies字段上了
    println!("cxk age: {}", cxk.age); // 其他不会移交所有权的字段仍可继续访问
}
```

## 元组结构体
```rust
fn main() {
    // 例如 CSS 中的RGB 和 RGBA
    #[derive(Debug)]
    struct RGB(u8, u8, u8);
    #[derive(Debug)]
    struct RGBA(u8, u8, u8, f64);

    let red = RGB(255, 0, 0);

    let pink = RGBA(red.0, red.1, red.2, 0.5);

    println!("red: {:?}", red);
    println!("pink: {:?}", pink);

    // 解构
    let RGB(r, _, b) = red;
    println!("r: {}", r);
    println!("b: {}", b);
}
```