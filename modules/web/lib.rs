use base64::prelude::*;
use boa_engine::{
    builtins::string, js_string, object::builtins::JsArray, value::TryFromJs, Context,
    JsNativeError, JsObject, JsResult, JsValue,
};
use ike_core::throw;
use ike_function::ike_function;
use timeouts::{clear_timeout_ex, set_timeout_ex};
use url::quirks;
use url::Url;

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

#[ike_function]
pub fn parse_search_params(#[string] search: String) -> Result<JsValue, JsValue> {
    let search_params = url::form_urlencoded::parse(search.as_bytes());
    let result: Vec<JsValue> = search_params
        .map(|(key, value)| {
            let key = key.as_ref().to_owned();
            let value = value.as_ref().to_owned();
            JsArray::from_iter(
                vec![
                    JsValue::from(js_string!(key)),
                    JsValue::from(js_string!(value)),
                ],
                &mut *ctx,
            )
            .into()
        })
        .collect();

    Ok(JsArray::from_iter(result, &mut *ctx).into())
}

#[ike_function]
pub fn stringify_search_params() {
    let arg = args.get(0).unwrap();
    let vec: Vec<(String, String)> = arg.try_js_into(&mut *ctx)?;

    let result = url::form_urlencoded::Serializer::new(String::new())
        .extend_pairs(vec)
        .finish();

    Ok(JsValue::from(js_string!(result)))
}

#[ike_function]
pub fn parse_url(#[string] href: String) {
    let url = Url::options();

    let url = match url.parse(&href) {
        Ok(url) => url,
        Err(err) => throw!(err, "Failed to parse URL: {:?}", err),
    };
    let obj = JsObject::default();

    make_object(url, obj.clone(), ctx)?;

    Ok(obj.into())
}

#[ike_function]
pub fn parse_url_with_base(#[string] href: String, #[string] base: String) {
    let base_url = match Url::parse(&base) {
        Ok(url) => url,
        Err(err) => throw!(err, "Failed to parse base URL: {:?}", err),
    };

    let url = Url::options()
        .base_url(Some(&base_url))
        .parse(&href)
        .unwrap();
    let obj = JsObject::default();

    make_object(url, obj.clone(), ctx)?;

    Ok(obj.into())
}

#[ike_function]
pub fn update_url(#[string] href: String, #[string] field: String, #[string] value: String) {
    let mut url = match Url::parse(&href) {
        Ok(url) => url,
        Err(err) => throw!(err, "Failed to parse URL: {:?}", err),
    };

    let new_url = match field.as_str() {
        "host" => quirks::set_host(&mut url, &value),
        "hash" => {
            quirks::set_hash(&mut url, &value);
            Ok(())
        }
        "hostname" => quirks::set_hostname(&mut url, &value),
        "password" => quirks::set_password(&mut url, &value),
        "pathname" => {
            quirks::set_pathname(&mut url, &value);
            Ok(())
        }
        "port" => quirks::set_port(&mut url, &value),
        "protocol" => quirks::set_protocol(&mut url, &value),
        "search" => {
            quirks::set_search(&mut url, &value);
            Ok(())
        }
        "username" => quirks::set_username(&mut url, &value),
        _ => throw!(err, "Invalid field"),
    };

    if let Ok(_) = new_url {
        let obj = JsObject::default();
        make_object(url, obj.clone(), ctx)?;

        Ok(obj.into())
    } else {
        throw!(err, "Failed to update URL: {:?}", new_url.unwrap_err())
    }
}

fn make_object(url: Url, obj: JsObject, ctx: &mut Context) -> JsResult<()> {
    obj.set(
        js_string!("host"),
        JsValue::from(js_string!(url.host().unwrap().to_string())),
        false,
        ctx,
    )?;

    obj.set(
        js_string!("hostname"),
        JsValue::from(js_string!(url.host_str().unwrap().to_string())),
        false,
        ctx,
    )?;

    obj.set(
        js_string!("href"),
        JsValue::from(js_string!(url.as_str())),
        false,
        ctx,
    )?;

    obj.set(
        js_string!("pathname"),
        JsValue::from(js_string!(url.path())),
        false,
        ctx,
    )?;

    obj.set(
        js_string!("port"),
        JsValue::from(url.port().unwrap_or(0)),
        false,
        ctx,
    )?;

    let protocol = url.scheme();
    let protocol_with_colon = if protocol.ends_with(':') {
        protocol.to_string()
    } else {
        let val = format!("{}:", protocol);
        val
    };
    obj.set(
        js_string!("protocol"),
        JsValue::from(js_string!(protocol_with_colon)),
        false,
        ctx,
    )?;

    let query = url.query().unwrap_or("");
    let query = if !query.starts_with('?') {
        format!("?{}", query)
    } else {
        query.to_string()
    };

    obj.set(
        js_string!("search"),
        JsValue::from(js_string!(query)),
        false,
        ctx,
    )?;

    obj.set(
        js_string!("hash"),
        JsValue::from(js_string!(url.fragment().unwrap_or(""))),
        false,
        ctx,
    )?;

    obj.set(
        js_string!("username"),
        JsValue::from(js_string!(url.username())),
        false,
        ctx,
    )?;

    obj.set(
        js_string!("password"),
        JsValue::from(js_string!(url.password().unwrap_or(""))),
        false,
        ctx,
    )?;

    let origin = url.origin().ascii_serialization();

    obj.set(
        js_string!("origin"),
        JsValue::from(js_string!(origin)),
        false,
        ctx,
    )?;

    Ok(())
}

ike_core::module!(
    WebModule,
    "web",
    js = ["streams.js", "timeouts.js", "base64.js", "encoding.js", "headers.js", "main.js", "url.js"],
    exposed = {
        "set_timeout_ex" => set_timeout_ex,
        "clear_timeout_ex" => clear_timeout_ex,
        "atob_ex" => atob,
        "btoa_ex" => btoa,
        "decode_ex" => encoding::decode,
        "encode_ex" => encoding::encode,
        "encode_into_ex" => encoding::encode_into,
        "parse_search_params_ex" => parse_search_params,
        "stringify_search_params_ex" => stringify_search_params,
        "parse_url_ex" => parse_url,
        "update_url_ex" => update_url,
        "parse_url_with_base_ex" => parse_url_with_base,
    }
);
