use timeouts::{clear_timeout_ex, set_timeout_ex};

pub mod timeouts;

ike_core::module!(
    WebModule,
    "web",
    js = ["streams.js", "timeouts.js"],
    exposed = {
        "set_timeout_ex" => set_timeout_ex,
        "clear_timeout_ex" => clear_timeout_ex,
    }
);
