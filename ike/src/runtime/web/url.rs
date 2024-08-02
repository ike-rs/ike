use crate::{js_str_to_string, throw};
use boa_engine::class::{Class, ClassBuilder};
use boa_engine::{
    js_string, Context, Finalize, JsData, JsNativeError, JsObject, JsResult, JsString, JsValue,
    NativeFunction, Trace,
};

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
