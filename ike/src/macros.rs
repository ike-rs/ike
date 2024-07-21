#[macro_export]
macro_rules! create_method {
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
