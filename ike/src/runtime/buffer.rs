use base64::prelude::*;
use boa_engine::{Context, JsNativeError, JsResult, JsString, JsValue};

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
