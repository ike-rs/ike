use logger::{elog, pretty_fmt, Logger};

pub fn setup_panic_handler() {
    let original_panic_handler = std::panic::take_hook();

    std::panic::set_hook(Box::new(move |panic_info| {
        let location = panic_info.location().unwrap();
        let message = panic_info
            .payload()
            .downcast_ref::<&str>()
            .unwrap_or(&"Unknown error");

        elog!("<d>==============================================================<r>");
        eprintln!();
        eprintln!("Ike {}", env!("CARGO_PKG_VERSION"),);
        print_sys_info();
        eprint!("Args: ");
        let args = std::env::args();

        for arg in args {
            let text = if arg == std::env::args().next().unwrap() {
                "ike"
            } else {
                &arg
            };
            let formatted_string = pretty_fmt(&format!("<cyan>{}<r>", text));
            let print_newline = arg == std::env::args().last().unwrap();

            eprint!(
                "{}{}",
                formatted_string,
                if print_newline { "\n" } else { " " }
            );
        }

        eprintln!();
        elog!(warn, "This indicates a bug in the program and not in your code. Please report it in the github repository.");
        eprintln!();

        // show the actual error

        eprintln!(
            "{}",
            pretty_fmt(&format!(
                "<red>panic<r><d>(occurred at {}:{})<r> {}",
                location.file().replace(r#"\"#, "/"),
                location.line(),
                message
            ))
        );
        eprintln!();
        elog!("<d>==============================================================<r>");

        original_panic_handler(panic_info);
        std::process::exit(1)
    }));
}

pub fn print_sys_info() {
    let info = os_info::get();
    let os_type = info.os_type();
    let version = info.version();
    let arch = info.architecture().unwrap_or("unknown architecure");

    elog!("OS: <cyan>{} {} {}<r>", os_type, version, arch);
}
