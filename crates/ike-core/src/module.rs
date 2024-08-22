#[macro_export]
macro_rules! module {
    (
        $name:ident,
        $spec:expr
        $(, js = [ $($js:expr),* ] )?
        $(, exposed = { $($exposed_name:expr => $exposed_fn:expr),* $(,)? } )?
        $(,)?
    ) => {
        use ike_core::exposed::ExposedFunction;
        use ike_core::ModuleTrait;

        #[derive(Debug, Clone, Copy)]
        pub struct $name;

        #[allow(dead_code)]
        impl ModuleTrait for $name {
            fn js_files(&self) -> &'static [(&'static str, &'static str)] {
                const JS_FILES: &[(&'static str, &'static str)] = &[
                    $(
                        $(
                            ($js, include_str!($js)),
                        )*
                    )?
                ];
                JS_FILES
            }

            fn spec(&self) -> &'static str {
                $spec
            }

            fn exposed_functions(&self) -> &'static [ExposedFunction] {
                let exposed_functions: &'static [ExposedFunction] = &[
                    $(
                        $(
                            ExposedFunction {
                                name: $exposed_name,
                                function: $exposed_fn,
                            },
                        )*
                    )?
                ];
                exposed_functions
            }
        }
    };
}
