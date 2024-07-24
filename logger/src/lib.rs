use std::collections::HashMap;
use std::fmt;

const ED: &str = "\x1b[";
const RESET: &str = "\x1b[0m";

lazy_static::lazy_static! {
    static ref COLOR_MAP: HashMap<&'static str, String> = {
        let mut m = HashMap::new();
        m.insert("black", ED.to_string() + "30m");
        m.insert("blue", ED.to_string() + "34m");
        m.insert("b", ED.to_string() + "1m");
        m.insert("d", ED.to_string() + "2m");
        m.insert("i", ED.to_string() + "3m");
        m.insert("cyan", ED.to_string() + "36m");
        m.insert("green", ED.to_string() + "32m");
        m.insert("magenta", ED.to_string() + "35m");
        m.insert("red", ED.to_string() + "31m");
        m.insert("white", ED.to_string() + "37m");
        m.insert("yellow", ED.to_string() + "33m");
        m
    };
}

pub fn pretty_fmt(fmt_str: &str) -> String {
    let mut new_fmt = String::new();
    let mut i = 0;

    let fmt_str_bytes = fmt_str.as_bytes();

    while i < fmt_str_bytes.len() {
        let c = fmt_str_bytes[i] as char;
        match c {
            '\\' => {
                i += 1;
                if i < fmt_str_bytes.len() {
                    if fmt_str_bytes[i] as char == '<' || fmt_str_bytes[i] as char == '>' {
                        new_fmt.push(fmt_str_bytes[i] as char);
                        i += 1;
                    } else {
                        new_fmt.push('\\');
                        new_fmt.push(fmt_str_bytes[i] as char);
                        i += 1;
                    }
                }
            }
            '>' => {
                i += 1;
            }
            '{' => {
                while i < fmt_str_bytes.len() && fmt_str_bytes[i] as char != '}' {
                    new_fmt.push(fmt_str_bytes[i] as char);
                    i += 1;
                }
            }
            '<' => {
                i += 1;
                let is_reset = fmt_str_bytes[i] as char == '/';
                if is_reset {
                    i += 1;
                }
                let start = i;
                while i < fmt_str_bytes.len() && fmt_str_bytes[i] as char != '>' {
                    i += 1;
                }
                let color_name = &fmt_str[start..i];
                let color_str = COLOR_MAP.get(color_name).cloned().unwrap_or_else(|| {
                    if color_name == "r" {
                        RESET.to_string()
                    } else {
                        format!("<{}>", color_name)
                    }
                });

                if is_reset {
                    new_fmt.push_str(RESET);
                } else {
                    new_fmt.push_str(&color_str);
                }
            }
            _ => {
                new_fmt.push(fmt_str_bytes[i] as char);
                i += 1;
            }
        }
    }

    new_fmt
}

pub struct Logger {
    pub print_to_error: bool,
}

impl Logger {
    pub fn new(print_to_error: bool) -> Self {
        Logger { print_to_error }
    }

    pub fn log(&self, message: &str) {
        let formatted_message = pretty_fmt(message);
        if self.print_to_error {
            eprintln!("{}", formatted_message);
        } else {
            println!("{}", formatted_message);
        }
    }

    pub fn log_without_newline(&self, message: &str) {
        let formatted_message = pretty_fmt(message);
        if self.print_to_error {
            eprint!("{}", formatted_message);
        } else {
            print!("{}", formatted_message);
        }
    }
}

#[macro_export]
macro_rules! log {
    (info, wt, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log_without_newline(&format!("<cyan>info:<r> {}", format!($($arg)*)));
    });
    (error, wt, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log_without_newline(&format!("<red>error:<r> {}", format!($($arg)*)));
    });
    (success, wt, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log_without_newline(&format!("<green>success:<r> {}", format!($($arg)*)));
    });
    (warn, wt, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log_without_newline(&format!("<yellow>warn:<r> {}", format!($($arg)*)));
    });
    (wt, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log_without_newline(&format!($($arg)*));
    });
    (info, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log(&format!("<cyan>info:<r> {}", format!($($arg)*)));
    });
    (error, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log(&format!("<red>error:<r> {}", format!($($arg)*)));
    });
    (success, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log(&format!("<green>success:<r> {}", format!($($arg)*)));
    });
    (warn, $($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log(&format!("<yellow>warn:<r> {}", format!($($arg)*)));
    });
    ($($arg:tt)*) => ({
        let logger = Logger::new(false);
        logger.log(&format!($($arg)*));
    });
}

#[macro_export]
macro_rules! elog {
    (info, wt, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log_without_newline(&format!("<cyan>info:<r> {}", format!($($arg)*)));
    });
    (error, wt, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log_without_newline(&format!("<red>error:<r> {}", format!($($arg)*)));
    });
    (success, wt, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log_without_newline(&format!("<green>success:<r> {}", format!($($arg)*)));
    });
    (warn, wt, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log_without_newline(&format!("<yellow>warn:<r> {}", format!($($arg)*)));
    });
    (wt, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log_without_newline(&format!($($arg)*));
    });
    (info, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log(&format!("<cyan>info:<r> {}", format!($($arg)*)));
    });
    (error, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log(&format!("<red>error:<r> {}", format!($($arg)*)));
    });
    (success, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log(&format!("<green>success:<r> {}", format!($($arg)*)));
    });
    (warn, $($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log(&format!("<yellow>warn:<r> {}", format!($($arg)*)));
    });
    ($($arg:tt)*) => ({
        let logger = Logger::new(true);
        logger.log(&format!($($arg)*));
    });
}

#[macro_export]
macro_rules! cond_log {
    ($cond:expr, wt, $($arg:tt)*) => {
        if $cond {
            let logger = Logger::new(true);
            logger.log_without_newline(&format!($($arg)*));
        } else {
            let logger = Logger::new(false);
            logger.log_without_newline(&format!($($arg)*));
        }
    };
    ($cond:expr, $($arg:tt)*) => {
        if $cond {
            let logger = Logger::new(true);
            logger.log(&format!($($arg)*));
        } else {
            let logger = Logger::new(false);
            logger.log(&format!($($arg)*));
        }
    };
}

#[macro_export]
macro_rules! print_indent {
    ($num:expr) => {
        for _ in 0..$num {
            print!("  ");
        }
    };
}

#[macro_export]
macro_rules! new_line {
    () => {
        println!();
    };
}

#[derive(Debug)]
pub struct ErrorMessage {
    pub message: String,
    pub code: i32,
}

impl fmt::Display for ErrorMessage {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "<d>{}<r>: {}", self.code, self.message)
    }
}

impl std::error::Error for ErrorMessage {}

impl Logger {
    pub fn format_error(&self, err: &ErrorMessage) {
        self.log(&format!("<red>error:<r> {}", err));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pretty_fmt() {
        assert_eq!(
            pretty_fmt("Hello <red>world<r>!"),
            "Hello \x1b[31mworld\x1b[0m!"
        );
    }

    #[test]
    fn test_logger() {
        log!(info, "This is an info message");
        log!(error, "This is an error message");
        log!(success, "This is a success message");
        log!(warn, "This is a warning message");
    }

    #[test]
    fn test_error_message() {
        let err = ErrorMessage {
            message: "An error occurred".to_string(),
            code: 404,
        };
        let logger = Logger::new(true);
        logger.format_error(&err);
    }
}
