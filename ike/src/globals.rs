pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const ALLOWED_EXTENSIONS: [&str; 6] = ["js", "mjs", "ts", "mts", "cjs", "cts"];

pub const CODE_TO_INJECT: &str = r#"
    import path from "path"

    globalThis.Ike.path = path
"#;
