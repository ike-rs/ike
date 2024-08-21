use std::collections::HashMap;

use crate::{
    assert_arg_type,
    runtime::{
        buffer::is_utf8,
        uuid::{uuid_parse, uuid_stringify, uuidv4, uuidv5},
    },
};

use super::buffer::is_ascii_string;
use crate::testing::js::{after_all, before_all, describe, test_it};
use boa_engine::{
    js_string, object::FunctionObjectBuilder, Context, JsNativeError, JsValue, NativeFunction,
};
use ike_core::{str_from_jsvalue, throw};

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
        m.insert("isUtf8", unsafe { NativeFunction::from_closure(is_utf8) });
        m.insert("describe", unsafe {
            NativeFunction::from_closure(describe)
        });
        m.insert("it", unsafe { NativeFunction::from_closure(test_it) });
        m.insert("beforeAll", unsafe {
            NativeFunction::from_closure(before_all)
        });
        m.insert("afterAll", unsafe {
            NativeFunction::from_closure(after_all)
        });
        m.insert("uuidParse", unsafe {
            NativeFunction::from_closure(uuid_parse)
        });
        m.insert("uuidStringify", unsafe {
            NativeFunction::from_closure(uuid_stringify)
        });
        m.insert("uuidv4", unsafe { NativeFunction::from_closure(uuidv4) });
        m.insert("uuidv5", unsafe { NativeFunction::from_closure(uuidv5) });
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
