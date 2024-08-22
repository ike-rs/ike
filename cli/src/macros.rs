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

#[macro_export]
macro_rules! create_method {
    ($func:expr) => {
        unsafe { NativeFunction::from_closure($func) }
    };
}

#[macro_export]
macro_rules! assert_arg_type {
    (string, $arg:expr) => {
        if !$arg.is_string() {
            throw!(typ, "Expected a string, got {:?}", $arg.get_type());
        }
    };
    (function, $arg:expr) => {
        if !$arg.is_callable() {
            throw!(typ, "Expected a function, got {:?}", $arg.get_type());
        }
    };
}
