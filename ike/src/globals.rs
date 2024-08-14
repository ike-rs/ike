pub const VERSION: &str = env!("CARGO_PKG_VERSION");
pub const ALLOWED_EXTENSIONS: [&str; 8] = ["js", "mjs", "ts", "mts", "cjs", "cts", "jsx", "tsx"];

pub const CODE_TO_INJECT: &str = r#"
    let IKE_STREAMS = await import("@std/streams")

    globalThis.Ike.path = import("@std/path")
    globalThis.ReadableStream = IKE_STREAMS.ReadableStream
    globalThis.ReadableStreamDefaultReader = IKE_STREAMS.ReadableStreamDefaultReader
"#;
