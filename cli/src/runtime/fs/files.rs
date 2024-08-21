use crate::runtime::fs::{resolve_path_from_args, FileSystem};
use crate::runtime::promise::base_promise;
use boa_engine::builtins::promise::ResolvingFunctions;
use boa_engine::object::builtins::{JsArrayBuffer, JsPromise, JsUint8Array};
use boa_engine::{js_string, Context, JsNativeError, JsResult, JsValue};
use smol::block_on;
use std::path::Path;

use super::{open_file, File};
use ike_core::throw;

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
            throw!(err, "{}", e.to_string());
        }
    }
}

pub async fn read_file_async_base(path: &Path, ctx: &mut Context) -> anyhow::Result<JsUint8Array> {
    let file = match open_file(path) {
        Ok(file) => file,
        Err(e) => return Err(e),
    };
    let file = File::new(file);

    let contents = file.read_async().await.unwrap();
    let array_buffer = JsArrayBuffer::from_byte_block(contents, ctx).unwrap();
    let uint8_array = JsUint8Array::from_array_buffer(array_buffer, ctx).unwrap();

    Ok(uint8_array)
}

pub fn read_file_async(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    let result = block_on(async {
        let result = read_file_async_base(path, ctx).await;

        let promise = JsPromise::new(
            |resolvers: &ResolvingFunctions, context| {
                if result.is_err() {
                    return Err(JsNativeError::error()
                        .with_message(result.err().unwrap().to_string())
                        .into());
                }

                resolvers.resolve.call(
                    &JsValue::undefined(),
                    &[JsValue::from(result.unwrap())],
                    context,
                )?;
                Ok(JsValue::undefined())
            },
            ctx,
        );

        let promise = base_promise(promise, ctx);

        Ok(promise.into())
    });

    result
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
            throw!(err, "{}", e.to_string());
        }
    }
}

pub async fn read_text_file_async_base(path: &Path) -> anyhow::Result<String> {
    let file = match open_file(path) {
        Ok(file) => file,
        Err(e) => return Err(e),
    };
    let file = File::new(file);

    let contents = file.read_async().await.unwrap();

    Ok(String::from_utf8(contents).unwrap())
}

pub fn read_text_file_async(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    let result = block_on(async {
        let result = read_text_file_async_base(path)
            .await
            .map_err(|e| JsNativeError::error().with_message(e.to_string()));

        let promise = JsPromise::new(
            |resolvers: &ResolvingFunctions, context| {
                if result.is_err() {
                    return Err(result.err().unwrap().into());
                }
                let res = result.unwrap().to_string();

                let val = JsValue::from(js_string!(res));
                resolvers
                    .resolve
                    .call(&JsValue::undefined(), &[val], context)?;

                Ok(JsValue::Undefined)
            },
            ctx,
        );

        let promise = base_promise(promise, ctx);

        Ok(promise.into())
    });

    result
}

// TODO: implement FsFile and return it in both create_file_sync and create_file_async

pub fn create_file_sync(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    match FileSystem::create_file_sync(path) {
        Ok(_) => Ok(JsValue::undefined()),
        Err(err) => Err(JsNativeError::error().with_message(err.to_string()).into()),
    }
}

pub fn create_file_async(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    let result = block_on(async move {
        let result = FileSystem::create_file_async(path)
            .await
            .map_err(|e| JsNativeError::error().with_message(e.to_string()))
            .err();
        let promise = JsPromise::new(
            |resolvers: &ResolvingFunctions, context| {
                if let Some(err) = result {
                    return Err(err.into());
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
