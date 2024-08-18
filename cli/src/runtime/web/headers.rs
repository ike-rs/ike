use crate::utils::is_array;
use crate::{js_str_to_string, str_from_jsvalue, throw};
use boa_engine::class::{Class, ClassBuilder};
use boa_engine::object::builtins::JsArray;
use boa_engine::{
    js_string, Context, Finalize, JsData, JsNativeError, JsResult, JsValue, NativeFunction,
};
use boa_gc::{empty_trace, Trace};
use indexmap::IndexMap;

const HEADERS: &[&str] = &[
    "accept",
    "accept-charset",
    "accept-encoding",
    "accept-language",
    "accept-ranges",
    "access-control-allow-credentials",
    "access-control-allow-headers",
    "access-control-allow-methods",
    "access-control-allow-origin",
    "access-control-expose-headers",
    "access-control-max-age",
    "access-control-request-headers",
    "access-control-request-method",
    "age",
    "allow",
    "authorization",
    "cache-control",
    "connection",
    "content-disposition",
    "content-encoding",
    "content-language",
    "content-length",
    "content-location",
    "content-range",
    "content-security-policy",
    "content-type",
    "cookie",
    "date",
    "etag",
    "expect",
    "expires",
    "forwarded",
    "from",
    "host",
    "if-match",
    "if-modified-since",
    "if-none-match",
    "if-range",
    "if-unmodified-since",
    "last-modified",
    "link",
    "location",
    "max-forwards",
    "origin",
    "pragma",
    "proxy-authenticate",
    "proxy-authorization",
    "range",
    "referer",
    "refresh",
    "retry-after",
    "sec-websocket-accept",
    "sec-websocket-key",
    "sec-websocket-version",
    "server",
    "set-cookie",
    "strict-transport-security",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "vary",
    "via",
    "warning",
    "www-authenticate",
];

#[derive(Debug)]
pub enum HeadersValue {
    Single(String),
    Multiple(Vec<String>),
}

pub type HeadersMap = IndexMap<String, HeadersValue>;

#[derive(Default, Finalize, JsData, Debug)]
pub struct Headers {
    pub headers: HeadersMap,
}

unsafe impl Trace for Headers {
    empty_trace!();
}

impl Headers {
    pub fn append(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<Headers>().unwrap();

        let key = args.first();
        if key.is_none() {
            throw!(typ, "Headers.append requires header key");
        }
        let key = str_from_jsvalue!(key.unwrap(), ctx);

        let value = args.get(1);
        if value.is_none() {
            throw!(typ, "Headers.append requires header value");
        }
        let value = str_from_jsvalue!(value.unwrap(), ctx);

        add_entry(&mut this.headers, key, value)?;

        Ok(JsValue::undefined())
    }

    pub fn delete(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<Headers>().unwrap();

        let key = args.first();
        if key.is_none() {
            throw!(typ, "Headers.delete requires header key");
        }
        let key = str_from_jsvalue!(key.unwrap(), ctx).to_lowercase();

        this.headers.swap_remove(&key);

        Ok(JsValue::undefined())
    }

    pub fn get(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let borrowed = obj.borrow();
        let this = borrowed.downcast_ref::<Headers>().unwrap();

        let key = args.first();
        if key.is_none() {
            throw!(typ, "Headers.get requires header key");
        }
        let key = str_from_jsvalue!(key.unwrap(), ctx).to_lowercase();

        let value = this.headers.get(&key);

        match value {
            Some(HeadersValue::Single(val)) => Ok(JsValue::from(js_string!(val.clone()))),
            Some(HeadersValue::Multiple(values)) => {
                let str = values.join(", ");
                Ok(JsValue::from(js_string!(str)))
            }
            None => Ok(JsValue::undefined()),
        }
    }

    pub fn get_set_cookie(this: &JsValue, _: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let borrowed = obj.borrow();
        let this = borrowed.downcast_ref::<Headers>().unwrap();

        let value = this.headers.get("set-cookie");

        match value {
            Some(HeadersValue::Multiple(values)) => {
                let arr = JsArray::new(ctx);
                for value in values {
                    arr.push(JsValue::from(js_string!(value.clone())), ctx)?;
                }
                Ok(JsValue::from(arr))
            }
            None => Ok(JsValue::undefined()),
            _ => panic!("set-cookie shouldn't be a single value"),
        }
    }

    pub fn has(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let borrowed = obj.borrow();
        let this = borrowed.downcast_ref::<Headers>().unwrap();

        let key = args.first();
        if key.is_none() {
            throw!(typ, "Headers.has requires header key");
        }
        let key = str_from_jsvalue!(key.unwrap(), ctx).to_lowercase();

        Ok(JsValue::from(this.headers.contains_key(&key)))
    }

    pub fn set(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<Headers>().unwrap();

        let key = args.first();
        if key.is_none() {
            throw!(typ, "Headers.set requires header key");
        }
        let key = str_from_jsvalue!(key.unwrap(), ctx).to_lowercase();
        
        if !HEADERS.contains(&key.as_str()) {
            throw!(typ, format!("Invalid header name. Got: {}", key));
        }

        let value = args.get(1);
        if value.is_none() {
            throw!(typ, "Headers.set requires header value");
        }
        let value = str_from_jsvalue!(value.unwrap(), ctx);

        this.headers.insert(key, HeadersValue::Single(value));

        Ok(JsValue::undefined())
    }
}

impl Class for Headers {
    const NAME: &'static str = "Headers";
    const LENGTH: usize = 0;

    fn init(class: &mut ClassBuilder<'_>) -> JsResult<()> {
        class.method(
            js_string!("append"),
            2,
            NativeFunction::from_fn_ptr(Self::append),
        );
        class.method(
            js_string!("delete"),
            1,
            NativeFunction::from_fn_ptr(Self::delete),
        );
        class.method(js_string!("get"), 1, NativeFunction::from_fn_ptr(Self::get));
        class.method(
            js_string!("getSetCookie"),
            0,
            NativeFunction::from_fn_ptr(Self::get_set_cookie),
        );
        class.method(js_string!("has"), 1, NativeFunction::from_fn_ptr(Self::has));
        class.method(js_string!("set"), 2, NativeFunction::from_fn_ptr(Self::set));

        Ok(())
    }

    fn data_constructor(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<Self> {
        let input = args.first();

        if input.is_none() {
            throw!(typ, "Headers constructor requires at least one argument");
        }
        let input = input.unwrap();

        if !input.is_object() && !is_array(input) {
            throw!(
                typ,
                "Headers constructor requires an object or an array of entries"
            );
        }
        let mut headers: HeadersMap = IndexMap::new();

        if is_array(input) {
            let arr = JsArray::from_object(input.as_object().unwrap().clone())?;
            let length = arr.length(ctx).unwrap();

            for i in 0..length {
                let entry = arr.get(i, ctx)?;
                if !is_array(&entry) {
                    throw!(typ, "Headers constructor requires an array of entries");
                }
                let entry = JsArray::from_object(entry.as_object().unwrap().clone())?;
                let key = entry.get(0, ctx)?;
                let value = entry.get(1, ctx)?;
                let key = key.as_string().unwrap();
                let value = value.as_string().unwrap();
                add_entry(
                    &mut headers,
                    js_str_to_string!(key),
                    js_str_to_string!(value),
                )?;
            }
        } else if input.is_object() {
            let obj = input.as_object().unwrap();
            let keys = obj.own_property_keys(ctx)?;
            for key in keys {
                let key = key.to_string();
                let value = obj.get(js_string!(key.clone()), ctx)?;
                let value = value.as_string().unwrap();
                add_entry(&mut headers, key, js_str_to_string!(value))?;
            }
        }

        Ok(Headers { headers })
    }
}

pub fn add_entry(headers: &mut HeadersMap, key: String, value: String) -> JsResult<()> {
    let key = key.to_lowercase();

    if !HEADERS.contains(&key.as_str()) {
        throw!(typ, format!("Invalid header name. Got: {}", key));
    }

    let value_clone = value.clone();
    let final_val = if key == "set-cookie" {
        HeadersValue::Multiple(vec![value])
    } else {
        HeadersValue::Single(value_clone.clone())
    };

    if let Some(existing_value) = headers.get_mut(&key) {
        match existing_value {
            HeadersValue::Single(val) => {
                *existing_value = HeadersValue::Single(format!("{}, {}", val, value_clone));
            }
            HeadersValue::Multiple(values) => {
                values.push(value_clone);
            }
        }
    } else {
        headers.insert(key, final_val);
    }

    Ok(())
}
