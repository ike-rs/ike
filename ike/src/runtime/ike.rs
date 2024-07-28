use boa_engine::{
    js_str, js_string, object::ObjectInitializer, Context, JsData, JsObject, JsResult, JsValue,
    NativeFunction,
};
use boa_gc::{Finalize, Trace};
use std::path::PathBuf;

use crate::create_method;

use super::meta::Meta;

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct IkeGlobalObject {}

impl IkeGlobalObject {
    pub fn init(ctx: &mut Context, file: Option<&PathBuf>) -> JsObject {
        let mut obj = ObjectInitializer::with_native_data(Self::default(), ctx);

        obj.function(create_method!(Self::exit), js_string!("exit"), 1);

        let obj = obj.build();

        if let Some(file) = file {
            let meta_property = Meta::init(ctx, file);
            obj.set(js_str!("meta"), meta_property, false, ctx).unwrap();
        }

        obj
    }

    pub fn exit(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let arg = args.get(0);

        let code = if arg.is_none() {
            0
        } else {
            arg.unwrap().to_i32(ctx).unwrap()
        };

        std::process::exit(code);
    }
}
