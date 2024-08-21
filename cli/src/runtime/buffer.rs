use boa_engine::{
    object::builtins::{JsArrayBuffer, JsTypedArray},
    Context, JsNativeError, JsResult, JsString, JsValue,
};
use ike_core::throw;
use simdutf::{validate_ascii, validate_utf8};

pub fn is_ascii_string(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    if args.is_empty() {
        throw!(err, "Expected an argument in isAscii");
    }

    let obj = args.first().unwrap().as_object();

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
    let arr_buf = JsArrayBuffer::from_object(arr_buf.as_object().unwrap().clone())?;
    let arr_buf = arr_buf.data();
    let data_block = arr_buf.as_deref().unwrap();

    if data_block.is_empty() {
        return Ok(JsValue::Boolean(true));
    }

    Ok(JsValue::Boolean(validate_ascii(data_block)))
}

pub fn is_utf8(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    if args.is_empty() {
        throw!(err, "Expected an argument in isUtf8");
    }

    let obj = args.first().unwrap().as_object();

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
    let arr_buf = JsArrayBuffer::from_object(arr_buf.as_object().unwrap().clone())?;
    let arr_buf = arr_buf.data();
    let data_block = arr_buf.as_deref().unwrap();

    if data_block.is_empty() {
        return Ok(JsValue::Boolean(true));
    }

    Ok(JsValue::Boolean(validate_utf8(data_block)))
}
