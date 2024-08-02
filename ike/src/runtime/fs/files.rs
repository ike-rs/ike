use crate::runtime::fs::FileSystem;
use crate::throw;
use boa_engine::object::builtins::{JsArrayBuffer, JsUint8Array};
use boa_engine::{js_string, Context, JsArgs, JsNativeError, JsResult, JsString, JsValue};
use std::future::Future;
use std::path::Path;

pub fn resolve_path_from_args(args: &[JsValue], ctx: &mut Context) -> JsResult<JsString> {
    if args.is_empty() {
        throw!(err, "Expected a path in fs function");
    }
    let path = args.first().unwrap();
    let path = path.to_string(ctx)?;
    Ok(path)
}

pub fn read_file_sync(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    let file = FileSystem::open_sync(path);

    match file {
        Ok(file) => {
            let contents = file.read_sync().unwrap();
            let array_buffer = JsArrayBuffer::from_byte_block(contents, ctx).unwrap();
            let uint8_array = JsUint8Array::from_array_buffer(array_buffer, ctx).unwrap();
            Ok(JsValue::from(uint8_array))
        }
        Err(e) => {
            throw!(err, e.to_string());
        }
    }
}

pub fn read_file<'a>(
    _this: &JsValue,
    args: &'a [JsValue],
    ctx: &'a mut Context,
) -> impl Future<Output = JsResult<JsValue>> + 'a {
    async move {
        let str_path = args.get_or_undefined(0).as_string().unwrap();
        let str_path = str_path.to_std_string().unwrap();
        let path = Path::new(&str_path);

        match FileSystem::open_async(path).await {
            Ok(file) => {
                let contents = file.read_async(ctx).await.unwrap();
                Ok(JsValue::from(js_string!("")))
            }
            Err(e) => {
                throw!(err, e.to_string());
            }
        }
    }
}
