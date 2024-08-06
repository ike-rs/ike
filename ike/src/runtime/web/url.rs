use crate::{assert_arg_type, js_str_to_string, throw};
use boa_engine::class::{Class, ClassBuilder};
use boa_engine::object::builtins::{JsArray, JsFunction};
use boa_engine::{
    js_string, Context, Finalize, JsData, JsError, JsNativeError, JsObject, JsResult, JsString,
    JsValue, NativeFunction, Trace,
};
use boa_gc::empty_trace;
use indexmap::IndexMap;

#[derive(Default, Trace, Finalize, JsData, Debug)]
pub struct URL {
    pub url: String,
    pub base: Option<String>,
}

impl URL {
    pub fn new(url: JsString, base: Option<JsString>) -> Self {
        Self {
            url: js_str_to_string!(url),
            base: base.map(|b| js_str_to_string!(b)),
        }
    }

    pub fn parse_args(
        args: &[JsValue],
        ctx: &mut Context,
    ) -> JsResult<(JsString, Option<JsString>)> {
        if args.is_empty() {
            throw!(typ, "URL constructor requires at least one argument");
        }

        let url = args.first().unwrap().to_string(ctx)?;

        let base = if args.len() > 1 {
            Some(args.get(1).unwrap().to_string(ctx)?)
        } else {
            None
        };

        Ok((url, base))
    }

    pub fn js_to_string(this: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        let this = this.as_object().unwrap();
        let this = this.downcast_ref::<URL>().unwrap();

        Ok(JsValue::new(js_string!(this.url.clone())))
    }

    pub fn create_object_url(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        unimplemented!("createObjectURL is not implemented yet")
    }

    pub fn revoke_object_url(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        unimplemented!("revokeObjectURL is not implemented yet")
    }

    // Same as constructing a new URL, but returns null if the URL is invalid
    pub fn parse(_: &JsValue, args: &[JsValue], context: &mut Context) -> JsResult<JsValue> {
        let (url, base) = Self::parse_args(args, context)?;
        let data = Self::new(url, base);
        let url = match url::Url::parse(&data.url) {
            Ok(parsed_url) => parsed_url,
            Err(_) => return Ok(JsValue::null()),
        };

        if let Some(base) = &data.base {
            if url.join(base).is_err() {
                return Ok(JsValue::null());
            }
        }

        let obj = JsObject::default();
        Self::set_data(&obj, url, context)?;

        Ok(JsValue::from(obj))
    }

    pub fn can_parse(_: &JsValue, args: &[JsValue], context: &mut Context) -> JsResult<JsValue> {
        let (url, base) = Self::parse_args(args, context)?;
        let data = Self::new(url, base);
        let url = match url::Url::parse(&data.url) {
            Ok(parsed_url) => parsed_url,
            Err(_) => return Ok(JsValue::from(false)),
        };

        if let Some(base) = &data.base {
            if url.join(base).is_err() {
                return Ok(JsValue::from(false));
            }
        }

        Ok(JsValue::from(true))
    }

    pub fn set_data(instance: &JsObject, url: url::Url, context: &mut Context) -> JsResult<()> {
        let mut protocol = url.scheme().to_string();
        if !protocol.ends_with(":") {
            protocol.push(':');
        }

        instance.set(
            js_string!("protocol"),
            js_string!(protocol.clone()),
            false,
            context,
        )?;

        let port = url.port();
        let port = if let Some(port) = port {
            port.to_string()
        } else {
            "".to_string()
        };

        instance.set(js_string!("port"), js_string!(port.clone()), false, context)?;
        let hostname = url.host_str().unwrap_or("").to_string();
        instance.set(
            js_string!("hostname"),
            js_string!(hostname.clone()),
            false,
            context,
        )?;

        let host = if port.is_empty() {
            hostname.clone()
        } else {
            format!("{}:{}", hostname, port)
        };
        instance.set(js_string!("host"), js_string!(host.clone()), false, context)?;
        instance.set(
            js_string!("username"),
            js_string!(url.username()),
            false,
            context,
        )?;
        instance.set(
            js_string!("password"),
            js_string!(url.password().unwrap_or("")),
            false,
            context,
        )?;
        instance.set(js_string!("href"), js_string!(url.as_str()), false, context)?;
        instance.set(
            js_string!("hash"),
            js_string!(url.fragment().unwrap_or("")),
            false,
            context,
        )?;

        let origin = format!("{}//{}", protocol, host);
        instance.set(js_string!("origin"), js_string!(origin), false, context)?;
        instance.set(
            js_string!("pathname"),
            js_string!(url.path()),
            false,
            context,
        )?;
        let mut search = url.query().unwrap_or("").to_string();

        if !search.is_empty() && !search.starts_with('?') {
            search = format!("?{}", search);
        }

        instance.set(
            js_string!("search"),
            js_string!(search.clone()),
            false,
            context,
        )?;

        Ok(())
    }
}

impl Class for URL {
    const NAME: &'static str = "URL";
    const LENGTH: usize = 0;

    fn init(class: &mut ClassBuilder<'_>) -> JsResult<()> {
        class.method(
            js_string!("toString"),
            0,
            NativeFunction::from_fn_ptr(Self::js_to_string),
        );
        class.method(
            js_string!("toJSON"),
            0,
            // Same as toString
            NativeFunction::from_fn_ptr(Self::js_to_string),
        );

        // Static methods
        class.static_method(
            js_string!("createObjectURL"),
            0,
            NativeFunction::from_fn_ptr(Self::create_object_url),
        );

        class.static_method(
            js_string!("revokeObjectURL"),
            0,
            NativeFunction::from_fn_ptr(Self::revoke_object_url),
        );

        class.static_method(
            js_string!("parse"),
            0,
            NativeFunction::from_fn_ptr(Self::parse),
        );

        class.static_method(
            js_string!("canParse"),
            0,
            NativeFunction::from_fn_ptr(Self::can_parse),
        );

        Ok(())
    }

    fn data_constructor(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<Self> {
        let (url, base) = Self::parse_args(args, ctx)?;
        Ok(URL::new(url, base))
    }

    fn object_constructor(
        instance: &JsObject,
        args: &[JsValue],
        context: &mut Context,
    ) -> JsResult<()> {
        let (url, base) = Self::parse_args(args, context)?;
        let data = Self::new(url, base);
        let url = url::Url::parse(&data.url).map_err(|err| {
            JsNativeError::error().with_message(format!("Invalid URL: {}", err.to_string()))
        })?;
        if data.base.is_some() {
            url.join(&data.base.clone().unwrap()).map_err(|err| {
                JsNativeError::error().with_message(format!("Invalid URL: {}", err.to_string()))
            })?;
        }

        Self::set_data(instance, url, context)?;

        // TODO: implement searchParams
        Ok(())
    }
}

#[derive(Default, Finalize, JsData, Debug)]
pub struct URLSearchParams {
    pub params: IndexMap<String, Vec<String>>,
}

unsafe impl Trace for URLSearchParams {
    empty_trace!();
}

impl URLSearchParams {
    pub fn stringify(this: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<URLSearchParams>().unwrap();
        let mut search = String::new();
        if this.params.is_empty() {
            return Ok(JsValue::from(js_string!("")));
        }

        for (key, values) in &this.params {
            for value in values {
                let encoded_key = urlencoding::encode(key);
                let encoded_value = urlencoding::encode(value);
                search.push_str(&format!("{}={}&", encoded_key, encoded_value));
            }
        }

        // Remove the trailing '&'
        search.pop();

        Ok(JsValue::from(js_string!(search)))
    }

    pub fn append(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<URLSearchParams>().unwrap();
        let key = args.first().unwrap().to_string(ctx).unwrap();
        let value = args.get(1).unwrap().to_string(ctx).unwrap();
        this.params
            .entry(key.to_std_string().unwrap())
            .or_default()
            .push(value.to_std_string().unwrap());

        Ok(JsValue::undefined())
    }

    pub fn delete(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<URLSearchParams>().unwrap();
        let key = args.first().unwrap().to_string(ctx).unwrap();
        let value = args.get(1);

        if let Some(value) = value {
            let value = value.to_string(ctx).unwrap();
            if let Some(values) = this.params.get_mut(&key.to_std_string().unwrap()) {
                values.retain(|v| v != &value.to_std_string().unwrap());
                if values.is_empty() {
                    this.params.swap_remove(&key.to_std_string().unwrap());
                }
            }
        } else {
            this.params.swap_remove(&key.to_std_string().unwrap());
        }

        Ok(JsValue::undefined())
    }

    pub fn get(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<URLSearchParams>().unwrap();
        let key = args.first().unwrap().to_string(ctx).unwrap();
        let key = key.to_std_string().unwrap();

        if let Some(values) = this.params.get(&key) {
            if let Some(value) = values.first() {
                return Ok(JsValue::from(js_string!(value.clone())));
            }
        }
        Ok(JsValue::null())
    }

    pub fn get_all(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<URLSearchParams>().unwrap();
        let key = args.first().unwrap().to_string(ctx).unwrap();
        let key = key.to_std_string().unwrap();

        let arr = JsArray::new(ctx);
        if let Some(values) = this.params.get(&key) {
            for value in values {
                arr.push(JsValue::from(js_string!(value.clone())), ctx)?;
            }
            return Ok(JsValue::from(arr));
        }

        Ok(JsValue::from(arr))
    }

    pub fn has(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<URLSearchParams>().unwrap();
        let key = args.first().unwrap().to_string(ctx).unwrap();
        let key = key.to_std_string().unwrap();

        if args.len() > 1 {
            let value = args.get(1).unwrap().to_string(ctx).unwrap();
            let value = value.to_std_string().unwrap();
            if let Some(values) = this.params.get(&key) {
                return Ok(JsValue::from(values.contains(&value)));
            }
            return Ok(JsValue::from(false));
        }

        Ok(JsValue::from(this.params.contains_key(&key)))
    }

    pub fn set(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this.as_object().unwrap();
        let mut borrowed = obj.borrow_mut();
        let this = borrowed.downcast_mut::<URLSearchParams>().unwrap();
        let key = args.first().unwrap().to_string(ctx)?;
        let value = args.get(1).unwrap().to_string(ctx)?;

        if let Some(values) = this.params.get_mut(&key.to_std_string().unwrap()) {
            values.clear();
            values.push(value.to_std_string().unwrap());
        } else {
            this.params.insert(
                key.to_std_string().unwrap(),
                vec![value.to_std_string().unwrap()],
            );
        }

        Ok(JsValue::undefined())
    }
}

// TODO: forEach, values, size, keys, sort, values
impl Class for URLSearchParams {
    const NAME: &'static str = "URLSearchParams";
    const LENGTH: usize = 0;

    fn init(class: &mut ClassBuilder<'_>) -> JsResult<()> {
        class.method(
            js_string!("toString"),
            0,
            NativeFunction::from_fn_ptr(Self::stringify),
        );
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
            js_string!("getAll"),
            1,
            NativeFunction::from_fn_ptr(Self::get_all),
        );
        class.method(js_string!("has"), 1, NativeFunction::from_fn_ptr(Self::has));
        class.method(js_string!("set"), 2, NativeFunction::from_fn_ptr(Self::set));

        Ok(())
    }

    fn data_constructor(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<Self> {
        let input = args.first();

        if input.is_none() {
            throw!(
                typ,
                "URLSearchParams constructor requires at least one argument"
            );
        }
        let input = input.unwrap();

        if !input.is_object() && !input.is_string() {
            throw!(
                typ,
                "URLSearchParams constructor requires a string or an object"
            );
        }

        let mut params: IndexMap<String, Vec<String>> = IndexMap::new();
        if input.is_string() {
            let input = input.to_string(ctx)?;
            let input = js_str_to_string!(input);
            let input = urlencoding::decode(&input).unwrap();

            if !input.is_empty() {
                for pair in input.split('&') {
                    let mut pair = pair.split('=');
                    let key = pair.next().unwrap();
                    let value = pair.next().unwrap_or("");
                    params
                        .entry(key.to_string())
                        .or_default()
                        .push(value.to_string());
                }
            }
        }

        if input.is_object() {
            let obj = input.as_object().unwrap();
            let properties = obj.own_property_keys(ctx).unwrap();
            for prop in properties.iter() {
                let key = prop.to_string();
                let value = obj
                    .get(js_string!(prop.to_string()), ctx)
                    .unwrap()
                    .to_string(ctx)
                    .unwrap()
                    .to_std_string_escaped();
                let value = urlencoding::decode(&value).unwrap().to_string();
                params.entry(key).or_default().push(value);
            }
        }

        Ok(URLSearchParams { params })
    }
}
