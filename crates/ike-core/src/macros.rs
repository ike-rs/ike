#[macro_export]
macro_rules! throw {
    (
        typ,
        $message:expr $(, $($arg:expr),*)?
    ) => {
        return Err(JsNativeError::typ().with_message(format!($message $(, $($arg),*)?)).into())
    };
    (
        ref,
        $message:expr $(, $($arg:expr),*)?
    ) => {
        return Err(JsNativeError::reference().with_message(format!($message $(, $($arg),*)?)).into())
    };
    (
        err,
        $message:expr $(, $($arg:expr),*)?
    ) => {
        return Err(JsNativeError::error().with_message(format!($message $(, $($arg),*)?)).into())
    };
}

// This converts a JsValue to a Rust string
#[macro_export]
macro_rules! str_from_jsvalue {
    ($value:expr, $context:expr) => {
        $value.to_string($context)?.to_std_string_escaped()
    };
}

#[macro_export]
macro_rules! js_str_to_string {
    ($value:expr) => {
        $value.to_std_string_escaped()
    };
}

#[macro_export]
macro_rules! get_prototype_name {
    ($proto:expr, $ctx:expr) => {{
        let proto_name = $proto
            .get(js_string!("constructor"), $ctx)
            .unwrap()
            .to_object($ctx)
            .unwrap()
            .get(js_string!("name"), $ctx)
            .unwrap();
        let str_name = js_str_to_string!(proto_name.to_string($ctx).unwrap());
        str_name
    }};
}
