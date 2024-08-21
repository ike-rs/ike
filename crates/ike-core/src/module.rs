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

        #[derive(Debug, Clone, Copy)]
        pub struct $name {
            pub js_files: &'static [(&'static str, &'static str)],
            pub spec: &'static str,
            pub exposed_functions: &'static [ExposedFunction],
        }

        #[allow(dead_code)]
        impl $name {
            pub fn new() -> Self {
                // Inicjalizowanie js_files jako stała, ponieważ include_str! jest const
                const JS_FILES: &[(&'static str, &'static str)] = &[
                    $(
                        $(
                            ($js, include_str!($js)),
                        )*
                    )?
                ];

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

                Self {
                    js_files: JS_FILES,
                    spec: $spec,
                    exposed_functions,
                }
            }

            #[inline(always)]
            pub fn cwd(self) -> &'static str {
                env!("CARGO_MANIFEST_DIR")
            }

            pub fn name_for(self, file: &'static str) -> String {
                format!("module:{}/{}", self.spec, file)
            }
        }
    };
}
