use boa_engine::{
    js_str, js_string, object::ObjectInitializer, property::Attribute, value::Type, Context,
    JsData, JsNativeError, JsObject, JsResult, JsValue, NativeFunction,
};
use boa_gc::{Finalize, Trace};
use std::path::PathBuf;

use super::meta::Meta;
use crate::runtime::fs::files::{read_file_sync, read_text_file_sync};
use crate::runtime::toml::parse_toml;
use crate::{create_method, globals::VERSION, throw};

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct IkeGlobalObject {}

impl IkeGlobalObject {
    pub fn init(ctx: &mut Context, file: Option<&PathBuf>) -> JsObject {
        let mut obj = ObjectInitializer::with_native_data(Self::default(), ctx);

        obj.property(js_string!("exitCode"), JsValue::from(0), Attribute::all());
        obj.property(js_string!("pid"), std::process::id(), Attribute::all());
        obj.property(
            js_string!("os"),
            JsValue::from(js_string!(std::env::consts::OS)),
            Attribute::all(),
        );
        obj.property(js_string!("version"), js_string!(VERSION), Attribute::all());
        obj.function(create_method!(Self::exit), js_string!("exit"), 1);
        obj.function(
            create_method!(Self::set_exit_code),
            js_string!("setExitCode"),
            1,
        );
        obj.function(create_method!(Self::uid), js_string!("uid"), 0);
        obj.function(create_method!(Self::gid), js_string!("gid"), 0);
        obj.function(create_method!(Self::is_windows), js_string!("isWindows"), 0);
        obj.function(create_method!(Self::is_linux), js_string!("isLinux"), 0);
        obj.function(create_method!(Self::is_macos), js_string!("isMacOS"), 0);

        obj.function(
            NativeFunction::from_fn_ptr(read_text_file_sync),
            js_string!("readTextFileSync"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(read_file_sync),
            js_string!("readFileSync"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(parse_toml),
            js_string!("parseToml"),
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
        let code = args.first();
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

    // TODO: add tests for these functions

    #[cfg(unix)]
    pub fn gid(_: &JsValue, _: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        Ok(JsValue::from(nix::unistd::getgid().as_raw() as i32))
    }

    #[cfg(not(unix))]
    pub fn gid(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        Ok(JsValue::Null)
    }

    #[cfg(unix)]
    pub fn uid(_: &JsValue, _: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        Ok(JsValue::from(nix::unistd::getuid().as_raw() as i32))
    }

    #[cfg(not(unix))]
    pub fn uid(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        Ok(JsValue::Null)
    }

    pub fn is_windows(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        Ok(JsValue::from(std::env::consts::OS == "windows"))
    }

    pub fn is_linux(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        Ok(JsValue::from(std::env::consts::OS == "linux"))
    }

    pub fn is_macos(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        Ok(JsValue::from(std::env::consts::OS == "macos"))
    }
}
