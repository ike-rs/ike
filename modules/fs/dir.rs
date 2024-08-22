use boa_engine::{
    builtins::promise::ResolvingFunctions, js_string, object::builtins::JsPromise, Context,
    JsNativeError, JsResult, JsValue,
};
use ike_core::promise::base_promise;
use std::path::Path;

use crate::{resolve_path_from_args, FileSystem};

pub fn create_dir_sync_ex(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let (path, recursive, mode) = resolve_create_dir_args(args, ctx)?;
    let path = Path::new(&path);
    let result = FileSystem::create_dir(path, recursive, mode);

    match result {
        Ok(_) => Ok(JsValue::undefined()),
        Err(err) => Err(JsNativeError::error().with_message(err.to_string()).into()),
    }
}

pub fn create_dir_async_ex(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let (path, recursive, mode) = resolve_create_dir_args(args, ctx)?;
    let path = Path::new(&path);

    let result = smol::block_on(async {
        let result = FileSystem::create_dir_async(path, recursive, mode)
            .await
            .map_err(|e| JsNativeError::error().with_message(e.to_string()))
            .err();

        let promise = JsPromise::new(
            |resolvers: &ResolvingFunctions, context| {
                if result.is_some() {
                    return Err(result.unwrap().into());
                }

                resolvers
                    .resolve
                    .call(&JsValue::undefined(), &[JsValue::undefined()], context)?;
                Ok(JsValue::undefined())
            },
            ctx,
        );

        let promise = base_promise(promise, ctx);

        Ok(promise.into())
    });

    result
}

pub fn resolve_create_dir_args(
    args: &[JsValue],
    ctx: &mut Context,
) -> JsResult<(String, bool, u32)> {
    let path = resolve_path_from_args(args, ctx)?;
    let path = &path.to_std_string().unwrap();
    let recursive = get_recursive_flag(args, ctx)?;
    let mode = args
        .get(2)
        .and_then(|mode| mode.as_number())
        .map(|mode| mode as u32)
        .unwrap_or(0o777)
        & 0o777;

    Ok((path.clone(), recursive, mode))
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
