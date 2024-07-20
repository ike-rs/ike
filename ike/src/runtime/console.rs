use boa_engine::{
    js_str, js_string,
    native_function::NativeFunction,
    object::{JsObject, ObjectInitializer},
    value::{JsValue, Numeric},
    Context, JsArgs, JsData, JsResult, JsStr, JsString,
};
use boa_gc::{Finalize, Trace};
use std::{cell::RefCell, collections::hash_map::Entry, rc::Rc, time::SystemTime};

use crate::{create_method, to_rust_string};

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct Console {}

impl Console {
    pub fn init(ctx: &mut Context) -> JsObject {
        let state = Rc::new(RefCell::new(Self::default()));

        ObjectInitializer::with_native_data(Self::default(), ctx)
            .function(
                create_method!(Self::log, mutable state.clone()),
                js_string!("log"),
                0,
            )
            .build()
    }

    fn log(_: &JsValue, args: &[JsValue], console: &Self, ctx: &mut Context) -> JsResult<JsValue> {
        let mut output = String::new();
        for arg in args {
            output.push_str(&to_rust_string!(arg, ctx));
            output.push(' ')
        }
        println!("{}", output);
        Ok(JsValue::undefined())
    }
}
