use crate::runtime::fs::{resolve_path_from_args, FileSystem};
use crate::throw;
use boa_engine::object::builtins::{JsArrayBuffer, JsUint8Array};
use boa_engine::{js_string, Context, JsNativeError, JsResult, JsValue};
use std::path::Path;

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

pub fn remove_file_sync(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    match std::fs::remove_file(path) {
        Ok(_) => Ok(JsValue::undefined()),
        Err(err) => Err(JsNativeError::error().with_message(err.to_string()).into()),
    }
}

pub fn create_file_sync(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    match std::fs::File::create(path) {
        Ok(_) => Ok(JsValue::undefined()),
        Err(err) => Err(JsNativeError::error().with_message(err.to_string()).into()),
    }
}
