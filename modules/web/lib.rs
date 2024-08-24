use base64::prelude::*;
use boa_engine::{js_string, JsNativeError, JsValue};
use ike_core::throw;
use ike_function::ike_function;
use timeouts::{clear_timeout_ex, set_timeout_ex};

pub mod encoding;
pub mod timeouts;

#[ike_function]
pub fn atob(#[string] data: String) {
    let decoded = match BASE64_STANDARD.decode(data.as_bytes()) {
        Ok(decoded) => decoded,
        Err(_) => throw!(err, "Invalid base64 string"),
    };
    let final_value = decoded.iter().map(|&x| x as char).collect::<String>();

    Ok(JsValue::from(js_string!(final_value)))
}

#[ike_function]
pub fn btoa(#[string] data: String) {
    let encoded = BASE64_STANDARD.encode(data.as_bytes());

    Ok(JsValue::from(js_string!(encoded)))
}

ike_core::module!(
    WebModule,
    "web",
    js = ["streams.js", "timeouts.js", "base64.js", "encoding.js"],
    exposed = {
        "set_timeout_ex" => set_timeout_ex,
        "clear_timeout_ex" => clear_timeout_ex,
        "atob_ex" => atob,
        "btoa_ex" => btoa,
        "decode_ex" => encoding::decode,
        "encode_ex" => encoding::encode,
        "encode_into_ex" => encoding::encode_into,
    }
);
