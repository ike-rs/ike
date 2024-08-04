use crate::runtime::fs::FileSystem;
use crate::throw;
use boa_engine::job::NativeJob;
use boa_engine::object::builtins::{JsArrayBuffer, JsPromise, JsUint8Array};
use boa_engine::{
    js_string, Context, JsArgs, JsError, JsNativeError, JsResult, JsString, JsValue, NativeFunction,
};
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

pub fn read_text_file_sync(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    let file = FileSystem::open_sync(path);

    match file {
        Ok(file) => {
            let contents = file.read_sync().unwrap();
            let contents = String::from_utf8(contents).unwrap();
            Ok(JsValue::from(js_string!(contents)))
        }
        Err(e) => {
            throw!(err, e.to_string());
        }
    }
}

// pub fn read_file(_this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
//     let str_path = args
//         .get_or_undefined(0)
//         .as_string()
//         .ok_or_else(|| JsNativeError::typ().with_message("Invalid path"))?;
//     let str_path = str_path
//         .to_std_string()
//         .map_err(|_| JsNativeError::typ().with_message("Path conversion error"))?;
//     let path = Path::new(&str_path).to_path_buf();
//
//     let future = async move {
//         let result = match FileSystem::open_async(&path).await {
//             Ok(file) => match file.read_async().await {
//                 Ok(contents) => {
//                     let arr_buf = JsArrayBuffer::from_byte_block(contents, ctx).unwrap();
//                     let uint8_array = JsUint8Array::from_array_buffer(arr_buf, ctx).unwrap();
//                     Ok(uint8_array)
//                 },
//                 Err(e) => Err(JsNativeError::typ().with_message(e.to_string())),
//             },
//             Err(e) => Err(JsNativeError::typ().with_message(e.to_string())),
//         };
//
//         Ok(result.unwrap())
//     };
//
//     let promise = JsPromise::from_future(future, ctx);
//
//     ctx.job_queue().run_jobs(ctx);
//
//     Ok(JsValue::from(promise))
// }
