use boa_engine::{js_string, Context, JsResult, JsValue};
use ike_function::ike_function;

#[ike_function]
fn test_func(#[string] name: String) {
    println!("Hello, {}", name);
    Ok(JsValue::undefined())
}

fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let test = test_func(&JsValue::Undefined, &[], &mut Context::default())?;
    println!("{:?}", test);

    Ok(())
}
