use base64::prelude::*;
use boa_engine::{
    object::builtins::{JsArrayBuffer, JsTypedArray},
    Context, JsNativeError, JsResult, JsString, JsValue,
};
use simdutf::{validate_ascii, validate_utf8};

use crate::{assert_arg_type, str_from_jsvalue, throw};

pub fn atob(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    if args.len() == 0 {
        throw!(err, "Expected a string argument in atob");
    }
    let arg = args.get(0).unwrap();
    assert_arg_type!(string, arg);

    let decoded = match BASE64_STANDARD.decode(str_from_jsvalue!(arg, ctx).as_bytes()) {
        Ok(decoded) => decoded,
        Err(_) => throw!(err, "Invalid base64 string"),
    };
    let final_value = decoded.iter().map(|&x| x as char).collect::<String>();

    Ok(JsValue::from(JsString::from(final_value)))
}

pub fn btoa(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    if args.len() == 0 {
        throw!(err, "Expected a string argument in btoa");
    }
    let arg = args.get(0).unwrap();
    assert_arg_type!(string, arg);

    let encoded = BASE64_STANDARD.encode(str_from_jsvalue!(arg, ctx).as_bytes());

    Ok(JsValue::from(JsString::from(encoded)))
}

pub fn is_ascii_string(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    if args.is_empty() {
        throw!(err, "Expected an argument in isAscii");
    }

    let obj = args.get(0).unwrap().as_object();

    if obj.is_none() {
        throw!(err, "Expected ArrayBuffer, TypedArray");
    }
    let obj = obj.unwrap();
    let typed_arr = JsTypedArray::from_object(obj.clone());

    if typed_arr.is_err() {
        throw!(err, "Expected ArrayBuffer, TypedArray");
    }

    let typed_arr = typed_arr.unwrap();
    let arr_buf = typed_arr.buffer(ctx).unwrap();
    let arr_buf = JsArrayBuffer::from_object(arr_buf.as_object().unwrap().clone()).unwrap();
    let arr_buf = arr_buf.data();
    let data_block = arr_buf.as_deref().unwrap();

    if data_block.is_empty() {
        return Ok(JsValue::Boolean(true));
    }

    Ok(JsValue::Boolean(validate_ascii(&data_block)))
}

pub fn is_utf8(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    if args.is_empty() {
        throw!(err, "Expected an argument in isUtf8");
    }

    let obj = args.get(0).unwrap().as_object();

    if obj.is_none() {
        throw!(err, "Expected ArrayBuffer, TypedArray");
    }

    let obj = obj.unwrap();
    let typed_arr = JsTypedArray::from_object(obj.clone());

    if typed_arr.is_err() {
        throw!(err, "Expected ArrayBuffer, TypedArray");
    }

    let typed_arr = typed_arr.unwrap();
    let arr_buf = typed_arr.buffer(ctx).unwrap();
    let arr_buf = JsArrayBuffer::from_object(arr_buf.as_object().unwrap().clone()).unwrap();
    let arr_buf = arr_buf.data();
    let data_block = arr_buf.as_deref().unwrap();

    if data_block.is_empty() {
        return Ok(JsValue::Boolean(true));
    }

    Ok(JsValue::Boolean(validate_utf8(&data_block)))
}
