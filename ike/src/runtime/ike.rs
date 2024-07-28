use boa_engine::{
    js_str, js_string, object::ObjectInitializer, property::Attribute, value::Type, Context,
    JsData, JsNativeError, JsObject, JsResult, JsValue, NativeFunction,
};
use boa_gc::{Finalize, Trace};
use std::path::PathBuf;

use crate::{create_method, throw};

use super::meta::Meta;

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct IkeGlobalObject {}

impl IkeGlobalObject {
    pub fn init(ctx: &mut Context, file: Option<&PathBuf>) -> JsObject {
        let mut obj = ObjectInitializer::with_native_data(Self::default(), ctx);

        obj.function(create_method!(Self::exit), js_string!("exit"), 1);
        obj.property(js_string!("exitCode"), JsValue::from(0), Attribute::all());
        obj.function(
            create_method!(Self::set_exit_code),
            js_string!("setExitCode"),
            1,
        );

        let obj = obj.build();

        if let Some(file) = file {
            let meta_property = Meta::init(ctx, file);
            obj.set(js_str!("meta"), meta_property, false, ctx).unwrap();
        }

        obj
    }

    pub fn get_ike_global_object(ctx: &mut Context) -> JsObject {
        let global = ctx.global_object();
        let ike = global.get(js_string!("Ike"), ctx).unwrap();
        ike.as_object().unwrap().clone()
    }

    pub fn get_exit_code(ctx: &mut Context) -> i32 {
        let this = Self::get_ike_global_object(ctx);
        let exit_code = this.get(js_str!("exitCode"), ctx).unwrap();
        exit_code.to_i32(ctx).unwrap()
    }

    pub fn exit(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        Self::set_exit_code(&JsValue::undefined(), args, ctx)?;

        let code = Self::get_exit_code(ctx);
        std::process::exit(code);
    }

    pub fn set_exit_code(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let this = Self::get_ike_global_object(ctx);
        let code = args.get(0);
        if code.is_none() {
            throw!(typ, "Expected an exit code");
        };
        let arg_type = code.unwrap().get_type();
        if arg_type != Type::Number {
            throw!(typ, "Expected an exit code to be a number");
        }
        let code = code.unwrap().to_i32(ctx).unwrap();

        this.set(js_str!("exitCode"), JsValue::from(code), false, ctx)
            .expect("Failed to set exit code");

        Ok(JsValue::undefined())
    }
}
