# HashMap

## HashMap
```rust
fn main() {
    let mut m1 = HashMap::new();

    m1.insert("语文", 99);
    m1.insert("数学", 80);
    m1.insert("英语", 60);

    println!("m1: {:?}, capacity:{}", m1, m1.capacity());

    // 预设容量 避免频繁的内存分配和拷贝，提升性能
    let m2 = HashMap::<&str, u8>::with_capacity(100);
    println!("m2: {:?}, capacity:{}", m2, m2.capacity());

    // 将动态数组转为hashMap
    let v1 = vec![
        ("语文", 70),
        ("数学", 99),
        ("英语", 80)
    ];
    let mut m3 = v1.into_iter().collect::<HashMap<&str, u8>>();
    println!("m3: {:?}", m3);

    // 获取值
    let m3_1 = m3.get("语文"); // 若没获取到返回None
    println!("[1]: m3: {:?}, m3_1: {:?}", m3, m3_1);

    // 覆盖值
    m3.insert("语文", 20);
    println!("[2]: m3: {:?}", m3);

    // 如果不存在则插入，如果存在则不插入
    m3.entry("物理").or_insert(100); // 成功插入
    m3.entry("语文").or_insert(100); // 语文已存在 不插入

    println!("[3]: m3: {:?}", m3);

}
```