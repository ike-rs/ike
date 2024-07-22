#[macro_export]
macro_rules! create_method_with_state {
    ($func:expr, immutable $state:expr) => {
        unsafe {
            NativeFunction::from_closure(move |this, args, context| {
                $func(this, args, &$state.borrow(), context)
            })
        }
    };
    ($func:expr, mutable $state:expr) => {
        unsafe {
            let cloned_state = $state.clone();
            NativeFunction::from_closure(move |this, args, context| {
                $func(this, args, &mut cloned_state.borrow_mut(), context)
            })
        }
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
macro_rules! throw {
    (
        typ,
        $message:expr
    ) => {
        return Err(JsNativeError::typ().with_message($message).into());
    };
    (
        ref,
        $message:expr
    ) => {
        return Err(JsNativeError::reference().with_message($message).into());
    };
    (
        err,
        $message:expr
    ) => {
        return Err(JsNativeError::error().with_message($message).into())
    };
}

#[macro_export]
macro_rules! assert_arg_type {
    (string, $arg:expr) => {
        if !$arg.is_string() {
            throw!(typ, format!("Expected a string, got {:?}", $arg.get_type()));
        }
    };
}
