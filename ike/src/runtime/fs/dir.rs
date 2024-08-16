use crate::runtime::fs::{resolve_path_from_args, FileSystem};
use boa_engine::{js_string, Context, JsNativeError, JsResult, JsValue};
use std::path::Path;

pub fn create_dir_sync(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);
    let recursive = get_recursive_flag(args, ctx)?;

    let result = if recursive {
        FileSystem::create_dir_all_sync(path)
    } else {
        FileSystem::create_dir_sync(path)
    };

    match result {
        Ok(_) => Ok(JsValue::undefined()),
        Err(err) => Err(JsNativeError::error().with_message(err.to_string()).into()),
    }
}

pub fn get_recursive_flag(args: &[JsValue], ctx: &mut Context) -> JsResult<bool> {
    let options = args.get(1).and_then(|opt| opt.as_object());
    let recursive = options.and_then(|opts| {
        opts.get(js_string!("recursive"), ctx)
            .ok()
            .filter(|rec| !rec.is_undefined())
            .map(|rec| rec.to_boolean())
    });

    Ok(recursive.unwrap_or(false))
}
