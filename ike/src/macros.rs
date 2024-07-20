use boa_engine::native_function::NativeFunction;

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
            NativeFunction::from_closure(move |this, args, context| {
                $func(this, args, &mut $state.borrow_mut(), context)
            })
        }
    };
}

// This converts a JsValue to a Rust string
#[macro_export]
macro_rules! to_rust_string {
    ($value:expr, $context:expr) => {
        $value.to_string($context)?.to_std_string_escaped()
    };
}
