use boa_engine::{
    js_string,
    native_function::NativeFunction,
    object::{builtins::JsMap, JsObject, ObjectInitializer},
    value::{JsValue, Numeric},
    Context, JsData, JsResult,
};
use boa_gc::{Finalize, Trace};
use logger::{cond_log, log, new_line, Logger};
use std::{cell::RefCell, rc::Rc};

use crate::{create_method_with_state, get_prototype_name, js_str_to_string, str_from_jsvalue};

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct Console {
    pub depth: usize,
    pub max_depth: usize,
    pub indent: usize,
}

#[derive(Debug, Copy, Clone)]
pub enum LogLevel {
    Normal,
    Error,
}

impl Console {
    pub fn init(ctx: &mut Context) -> JsObject {
        let state = Rc::new(RefCell::new(Self::default()));

        ObjectInitializer::with_native_data(Self::default(), ctx)
            .function(
                create_method_with_state!(Self::log, mutable state.clone()),
                js_string!("log"),
                0,
            )
            .function(
                create_method_with_state!(Self::log, mutable state.clone()),
                js_string!("info"),
                0,
            )
            .function(
                create_method_with_state!(Self::error, mutable state.clone()),
                js_string!("error"),
                0,
            )
            .build()
    }

    pub fn new(max_depth: usize) -> Self {
        Self {
            depth: 0,
            max_depth,
            indent: 0,
        }
    }

    fn log(
        _: &JsValue,
        args: &[JsValue],
        console: &mut Self,
        ctx: &mut Context,
    ) -> JsResult<JsValue> {
        Self::print(args, ctx, LogLevel::Normal, console)?;
        Ok(JsValue::undefined())
    }

    fn error(
        _: &JsValue,
        args: &[JsValue],
        console: &mut Self,
        ctx: &mut Context,
    ) -> JsResult<JsValue> {
        Self::print(args, ctx, LogLevel::Error, console)?;
        Ok(JsValue::undefined())
    }

    fn print(
        args: &[JsValue],
        ctx: &mut Context,
        level: LogLevel,
        console: &mut Self,
    ) -> JsResult<JsValue> {
        if args.is_empty() {
            return Ok(JsValue::undefined());
        }

        for arg in args {
            Self::print_as(arg, ctx, level, console, true);
        }
        Ok(JsValue::undefined())
    }

    fn print_as(
        arg: &JsValue,
        ctx: &mut Context,
        level: LogLevel,
        console: &mut Self,
        new_line: bool,
    ) {
        let error = match level {
            LogLevel::Error => true,
            LogLevel::Normal => false,
        };

        match arg {
            JsValue::Null => {
                cond_log!(error, new_line, "<r><yellow>null<r>");
            }
            JsValue::Undefined => {
                cond_log!(error, new_line, "<r><d>undefined<r>");
            }
            JsValue::Boolean(b) => {
                cond_log!(error, new_line, "<r><yellow>{}<r>", b);
            }
            JsValue::Symbol(s) => {
                let desc = s.description();

                if let Some(desc) = desc {
                    cond_log!(
                        error,
                        new_line,
                        "<r><yellow>Symbol({})<r>",
                        js_str_to_string!(desc)
                    );
                } else {
                    cond_log!(error, new_line, "<r><yellow>Symbol<r>");
                }
            }
            JsValue::BigInt(b) => {
                cond_log!(error, new_line, "<r><yellow>{}<r>", b);
            }
            JsValue::Integer(_) | JsValue::Rational(_) => {
                if arg.is_integer() {
                    cond_log!(
                        error,
                        new_line,
                        "<r><yellow>{}<r>",
                        arg.to_i32(ctx).unwrap()
                    );
                } else {
                    cond_log!(
                        error,
                        new_line,
                        "<r><yellow>{}<r>",
                        arg.to_number(ctx).unwrap()
                    );
                }
            }
            JsValue::String(_) => {
                let formatted = Self::format(arg, ctx).unwrap_or(String::new());

                cond_log!(error, new_line, "{}", formatted);
            }
            // TODO: better handling. array, object, map, set support
            JsValue::Object(obj) => {
                let proto = match obj.prototype() {
                    Some(proto) => proto,
                    None => {
                        Self::print_object(obj, ctx, console);
                        return;
                    }
                };
                let str_name = get_prototype_name!(proto, ctx);

                if str_name.contains("Error") {
                    let message = obj.get(js_string!("message"), ctx).unwrap();
                    cond_log!(
                        error,
                        new_line,
                        "<r><red>error<r><d>({})<r>: {}",
                        str_name,
                        js_str_to_string!(message.to_string(ctx).unwrap())
                    );

                    return;
                }

                if str_name == "Date" {
                    cond_log!(
                        error,
                        new_line,
                        "<r><magenta>{}<r>",
                        js_str_to_string!(arg.to_string(ctx).unwrap())
                    );
                } else if str_name == "RegExp" {
                    cond_log!(
                        error,
                        new_line,
                        "<r><red>{}<r>",
                        js_str_to_string!(arg.to_string(ctx).unwrap())
                    );
                } else if str_name == "Map" {
                    let map = JsMap::from_object(obj.clone()).unwrap();
                    let size = map.get_size(ctx).unwrap().to_i32(ctx).unwrap();

                    if size == 0 {
                        cond_log!(error, new_line, "<r><green>Map({})<r> {{}}", size);
                        return;
                    }

                    cond_log!(error, new_line, "<r><green>Map({})<r> {{", size);
                    let _ = map.entries(ctx).unwrap();

                    cond_log!(error, new_line, "<r>}}<r>");
                } else {
                    Self::print_object(obj, ctx, console);
                }
            }
        }
    }

    // TODO: still some issues with the object printing
    fn print_object(obj: &JsObject, ctx: &mut Context, console: &mut Self) {
        let properties = obj.own_property_keys(ctx).unwrap();
        let i = properties.iter().count();

        if i == 0 {
            log!("<r>{{}}<r>");
            return;
        }

        for (index, prop) in properties.iter().enumerate() {
            let key = prop.to_string();
            if key.eq("constructor") {
                continue;
            }

            if index == 0 {
                console.indent += 1;
                console.depth += 1;

                print!("{{\n");
                Self::print_indent(console);
            } else {
                Self::print_comma();
                new_line!();
                Self::print_indent(console);
            }

            log!(wt, "<r>{}<d>:<r> ", key);

            let value = obj.get(js_string!(key), ctx).unwrap();
            if value.is_string() {
                log!(
                    wt,
                    "<r><green>\"{}\"<r>",
                    js_str_to_string!(value.to_string(ctx).unwrap())
                );
            } else {
                Self::print_as(&value, ctx, LogLevel::Normal, console, false);
            }

            if index == i - 1 {
                console.depth -= 1;
                console.indent -= 1;

                new_line!();
            }
        }

        Self::print_indent(console);
        log!(wt, "<r>}}<r>\n");
    }

    fn print_comma() {
        log!(wt, "<r><d>,<r>")
    }

    fn print_indent(console: &mut Self) {
        let buf = vec![' '; 64];
        let mut total_remain = console.indent;
        while total_remain > 0 {
            let written = std::cmp::min(32, total_remain);
            print!(
                "{}",
                buf[0..(written as usize * 2)].iter().collect::<String>()
            );
            total_remain -= written;
        }
    }

    fn format(arg: &JsValue, ctx: &mut Context) -> JsResult<String> {
        let mut formatted = String::new();
        let target = str_from_jsvalue!(arg, ctx);
        let mut chars = target.chars();

        while let Some(c) = chars.next() {
            // TODO: support for c,d
            if c == '%' {
                let fmt = chars.next().unwrap_or('%');
                match fmt {
                    's' => {
                        formatted.push_str(&str_from_jsvalue!(arg, ctx));
                    }
                    'f' => {
                        let arg = arg.to_number(ctx)?;
                        formatted.push_str(&format!("{arg:.6}"));
                    }
                    'd' | 'i' => {
                        let arg = match arg.to_numeric(ctx)? {
                            Numeric::Number(r) => (r.floor() + 0.0).to_string(),
                            Numeric::BigInt(int) => int.to_string(),
                        };
                        formatted.push_str(&arg);
                    }
                    '%' => {
                        formatted.push('%');
                    }
                    _ => {
                        formatted.push('%');
                        formatted.push(fmt);
                    }
                }
            } else {
                formatted.push(c);
            }
        }

        Ok(formatted)
    }
}
