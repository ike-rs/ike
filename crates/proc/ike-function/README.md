# `ike_function` proc macro
This function allow to easily created Rust-like function and convert them to boa engine compatible

```rs
use boa_engine::{js_string, Context, JsResult, JsValue};
use ike_function::ike_function;

#[ike_function]
fn test_func(#[string] name: String) {
    println!("Hello, {}", name);
    Ok(JsValue::undefined())
}

fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let test = test_func(&JsValue::Undefined, &[
        JsValue::from(js_string!("Bob"))
    ], &mut Context::default())?;
    println!("{:?}", test);

    Ok(())
}
```

Context is available in the function under `ctx` variable. Same for the `this` value under `this` variable.

This function will always return a `JsResult<JsValue>`.

## Attributes
- `#[string]` will convert the value to a `String`

## Thanks to Deno <3
This code is adapted from deno `op2` to work with boa engine