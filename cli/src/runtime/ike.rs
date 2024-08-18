use super::fs::dir::create_dir_async;
use super::fs::files::{create_file_async, read_file_async, read_text_file_async};
use super::fs::{remove_async, remove_sync};
use super::meta::Meta;
use crate::globals::{ALLOWED_EXTENSIONS, CODE_TO_INJECT};
use crate::runtime::fs::dir::create_dir_sync;
use crate::runtime::fs::exists_sync;
use crate::runtime::fs::files::{create_file_sync, read_file_sync, read_text_file_sync};
use crate::runtime::toml::parse_toml;
use crate::transpiler::{transpile, transpile_with_text};
use crate::which::which;
use crate::{create_method, globals::VERSION, js_str_to_string, throw};
use boa_engine::{
    js_str, js_string, object::ObjectInitializer, property::Attribute, value::Type, Context,
    JsData, JsNativeError, JsObject, JsResult, JsValue, NativeFunction,
};
use boa_gc::{Finalize, Trace};
use std::path::PathBuf;

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
        obj.function(create_method!(Self::cwd), js_string!("cwd"), 0);

        obj.function(
            NativeFunction::from_fn_ptr(read_text_file_sync),
            js_string!("readTextFileSync"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(read_text_file_async),
            js_string!("readTextFile"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(read_file_sync),
            js_string!("readFileSync"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(read_file_async),
            js_string!("readFile"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(create_file_sync),
            js_string!("createFileSync"),
            1,
        );
        obj.function(
            NativeFunction::from_fn_ptr(create_file_async),
            js_string!("createFile"),
            1,
        );
        obj.function(
            NativeFunction::from_fn_ptr(create_dir_sync),
            js_string!("createDirSync"),
            1,
        );
        obj.function(
            NativeFunction::from_fn_ptr(create_dir_async),
            js_string!("createDir"),
            1,
        );
        obj.function(
            NativeFunction::from_fn_ptr(exists_sync),
            js_string!("existsSync"),
            1,
        );
        obj.function(
            NativeFunction::from_fn_ptr(remove_sync),
            js_string!("removeSync"),
            1,
        );
        obj.function(
            NativeFunction::from_fn_ptr(remove_async),
            js_string!("remove"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(parse_toml),
            js_string!("parseToml"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(Self::which),
            js_string!("which"),
            1,
        );

        obj.function(
            NativeFunction::from_fn_ptr(Self::transpile),
            js_string!("transpile"),
            1,
        );

        obj.property(js_string!("path"), JsObject::default(), Attribute::all());
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

    pub fn cwd(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        let cwd = std::env::current_dir().unwrap();
        Ok(JsValue::from(js_string!(cwd.to_string_lossy().to_string())))
    }

    pub fn which(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let command = args.first();

        if command.is_none() {
            throw!(typ, "which: Expected a command to look for");
        }
        let command = command.unwrap().to_string(ctx).unwrap();
        let command = js_str_to_string!(command);

        let options = args.get(1);
        let options = if options.is_none() {
            None
        } else {
            let options = options.unwrap().as_object().unwrap();
            Some(options)
        };

        let cwd = options.and_then(|options| {
            let cwd = options.get(js_string!("cwd"), ctx).unwrap();
            if cwd.is_undefined() {
                None
            } else {
                let cwd = cwd.to_string(ctx).unwrap();
                Some(js_str_to_string!(cwd))
            }
        });

        let path = options.and_then(|options| {
            let path = options.get(js_string!("path"), ctx).unwrap();
            if path.is_undefined() {
                None
            } else {
                let path = path.to_string(ctx).unwrap();
                Some(js_str_to_string!(path))
            }
        });

        let cwd = cwd.map(PathBuf::from);

        if let Some(result) = which(&command, path, cwd) {
            let return_value = JsValue::from(js_string!(result.to_string_lossy().to_string()));
            Ok(return_value)
        } else {
            Ok(JsValue::Null)
        }
    }

    pub fn transpile(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let loader = args.first();
        if loader.is_none() {
            throw!(typ, "transpile: Expected a loader to a file");
        }
        let loader = loader.unwrap().to_string(ctx).unwrap();
        let loader = js_str_to_string!(loader);
        if !ALLOWED_EXTENSIONS.contains(&loader.as_str()) {
            throw!(
                typ,
                format!(
                    "transpile: Expected a loader to be one of {}<d>,<r> got {}",
                    ALLOWED_EXTENSIONS.join("<d>,<r> "),
                    loader
                )
            );
        }
        let path = PathBuf::from(format!("virtual-file.{}", loader));
        let text = args.get(1);

        let default = &JsValue::from(true);
        let inject = args.get(2).unwrap_or(default);
        let should_inject = inject.is_boolean() && inject.to_boolean() == true;

        if let Some(text) = text {
            let text = text.to_string(ctx).unwrap();
            let text = js_str_to_string!(text);
            let result = transpile_with_text(&path, text);

            match result {
                Ok(transpiled) => Ok(JsValue::from(js_string!(if should_inject {
                    format!("{} \n {}", CODE_TO_INJECT, transpiled)
                } else {
                    transpiled
                }))),
                Err(e) => throw!(typ, e.to_string()),
            }
        } else {
            let result = transpile(&path);

            match result {
                Ok(transpiled) => Ok(JsValue::from(js_string!(if should_inject {
                    format!("{} \n {}", CODE_TO_INJECT, transpiled)
                } else {
                    transpiled
                }))),
                Err(e) => throw!(typ, e.to_string()),
            }
        }
    }
}
