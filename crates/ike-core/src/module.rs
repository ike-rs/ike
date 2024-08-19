#[macro_export]
macro_rules! module {
    (
        $name:ident,
        $spec:expr
        $(, js = [ $($js:expr),* ] )?
        $(,)?
    ) => {
        #[derive(Debug, Clone, Copy)]
        pub struct $name {
            pub js_files: &'static [(&'static str, &'static str)],
            pub spec: &'static str
        }

        #[allow(dead_code)]
        impl $name {
            pub fn new() -> Self {
                const JS_FILES: &[(&'static str, &'static str)] = &[
                    $(
                        $(
                            ($js, include_str!($js)),
                        )*
                    )?
                ];
                Self { js_files: JS_FILES, spec: $spec }
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
