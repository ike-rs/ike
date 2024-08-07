use std::collections::HashMap;

use crate::{assert_arg_type, runtime::buffer::is_utf8, str_from_jsvalue, throw};

use super::buffer::{atob, btoa, is_ascii_string};
use crate::testing::js::{before_all, describe, test_it};
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
        m.insert("isUtf8", unsafe { NativeFunction::from_closure(is_utf8) });
        m.insert("describe", unsafe {
            NativeFunction::from_closure(describe)
        });
        m.insert("it", unsafe { NativeFunction::from_closure(test_it) });
        m.insert("beforeAll", unsafe {
            NativeFunction::from_closure(before_all)
        });
        m.insert("afterAll", unsafe {
            NativeFunction::from_closure(before_all)
        });
        m
    };
    if args.is_empty() {
        throw!(err, "Expected an argument in $rustFunction");
    }
    let string = args.first().unwrap();
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

            Ok(JsValue::from(function))
        }
        None => throw!(err, "Function not found"),
    }
}
