use std::collections::HashMap;

use crate::{assert_arg_type, str_from_jsvalue, throw};

use super::buffer::{atob, btoa, is_ascii_string};
use boa_engine::{
    js_string, object::FunctionObjectBuilder, Context, JsNativeError, JsValue, NativeFunction,
};

// This allows us to all rust functions from the js
pub fn rust_function(
    _: &JsValue,
    args: &[JsValue],
    ctx: &mut Context,
) -> boa_engine::JsResult<JsValue> {
    let list: HashMap<&'static str, NativeFunction> = {
        let mut m = HashMap::new();
        m.insert("isAscii", unsafe {
            NativeFunction::from_closure(is_ascii_string)
        });
        m.insert("atob", unsafe { NativeFunction::from_closure(atob) });
        m.insert("btoa", unsafe { NativeFunction::from_closure(btoa) });
        m
    };
    if args.is_empty() {
        throw!(err, "Expected an argument in $rustFunction");
    }
    let string = args.get(0).unwrap();
    assert_arg_type!(string, string);
    let name = str_from_jsvalue!(string, ctx);

    let func = list.get(name.as_str());

    match func {
        Some(func) => {
            let function = FunctionObjectBuilder::new(ctx.realm(), func.clone())
                .name(js_string!(name))
                .length(0)
                .constructor(false)
                .build();

            return Ok(JsValue::from(function));
        }
        None => throw!(err, "Function not found"),
    }
}
