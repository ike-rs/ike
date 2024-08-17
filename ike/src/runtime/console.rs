use crate::{create_method_with_state, get_prototype_name, js_str_to_string, str_from_jsvalue};
use boa_engine::builtins::promise::PromiseState;
use boa_engine::object::builtins::{JsArray, JsPromise, JsTypedArray};
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

        let mut i = 0;
        for arg in args {
            i += 1;
            if i > 1 {
                print!(" ");
            }

            Self::print_as(arg, ctx, level, console, false, false);

            if i == args.len() {
                new_line!();
            }
        }
        Ok(JsValue::undefined())
    }

    fn print_as(
        arg: &JsValue,
        ctx: &mut Context,
        level: LogLevel,
        console: &mut Self,
        new_line: bool,
        in_array: bool,
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
                let formatted = Self::format(arg, ctx).unwrap_or_default();

                cond_log!(error, new_line, "{}", formatted);
            }
            // TODO: better handling. array, object, map, set support
            JsValue::Object(obj) => {
                let proto = obj.prototype();
                let proto = match proto {
                    Some(proto) => proto,
                    None => {
                        Self::print_object(obj, ctx, console, in_array);
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
                } else if str_name == "Promise" {
                    let promise = JsPromise::from_object(obj.clone()).unwrap();

                    let state = promise.state();
                    let string_state = match state {
                        PromiseState::Pending => "pending",
                        PromiseState::Fulfilled(_) => "fulfilled",
                        PromiseState::Rejected(_) => "rejected",
                    };

                    cond_log!(error, false, "<r><green>Promise<r> <r><d>{{ ");
                    cond_log!(error, false, "<r><yellow><{}><r>", string_state);
                    cond_log!(error, false, "<r><d> }}<r>");
                } else if str_name.contains("Function") {
                    let name = obj
                        .get(js_string!("name"), ctx)
                        .unwrap_or(JsValue::undefined());

                    let func_name = js_str_to_string!(name.to_string(ctx).unwrap());
                    if name.is_undefined() || func_name.is_empty() {
                        cond_log!(error, new_line, "<r><cyan>[{}]<r>", str_name);
                    } else {
                        cond_log!(error, new_line, "<r><cyan>[{}: {}]<r>", str_name, func_name);
                    }
                } else if str_name == "Array" {
                    let arr = JsArray::from_object(obj.clone()).unwrap();
                    let length = arr.length(ctx).unwrap();

                    if length == 0 {
                        cond_log!(error, new_line, "\n[]");
                        return;
                    }

                    let new_line = length > 10;

                    if new_line {
                        cond_log!(error, new_line, "<r>[<r>");

                        console.indent += 1;
                        console.depth += 1;

                        for i in 0..length {
                            let value = arr.get(i, ctx).unwrap();

                            if i == 0 {
                                Self::print_indent(console);

                                if value.is_string() {
                                    let formatted = Self::format(&value, ctx).unwrap_or_default();

                                    cond_log!(error, false, "<r><green>\"{}\"<r>", formatted);
                                } else {
                                    Self::print_as(
                                        &value,
                                        ctx,
                                        LogLevel::Normal,
                                        console,
                                        false,
                                        false,
                                    );
                                }
                            } else {
                                cond_log!(error, false, "<r><d>,<r>");
                                new_line!();
                                Self::print_indent(console);
                                if value.is_string() {
                                    let formatted = Self::format(&value, ctx).unwrap_or_default();

                                    cond_log!(error, false, "<r><green>\"{}\"<r>", formatted);
                                } else {
                                    Self::print_as(
                                        &value,
                                        ctx,
                                        LogLevel::Normal,
                                        console,
                                        false,
                                        false,
                                    );
                                }
                            }
                        }

                        console.depth -= 1;
                        console.indent -= 1;
                        new_line!();
                        Self::print_indent(console);
                        cond_log!(error, false, "<r>]<r>\n");
                    } else {
                        cond_log!(error, false, "<r>[ <r>");

                        for i in 0..length {
                            let value = arr.get(i, ctx).unwrap();

                            if i == 0 {
                                if value.is_string() {
                                    let formatted = Self::format(&value, ctx).unwrap_or_default();

                                    cond_log!(error, false, "<r><green>\"{}\"<r>", formatted);
                                } else {
                                    cond_log!(error, false, "<r>");
                                    Self::print_as(
                                        &value,
                                        ctx,
                                        LogLevel::Normal,
                                        console,
                                        false,
                                        true,
                                    );
                                }
                            } else {
                                cond_log!(error, false, "<r><d>, <r>");

                                if value.is_string() {
                                    let formatted = Self::format(&value, ctx).unwrap_or_default();

                                    cond_log!(error, false, "<r><green>\"{}\"<r>", formatted);
                                } else {
                                    cond_log!(error, false, "<r>");
                                    Self::print_as(
                                        &value,
                                        ctx,
                                        LogLevel::Normal,
                                        console,
                                        false,
                                        true,
                                    );
                                }
                            }
                        }

                        cond_log!(error, false, "<r> ]<r>\n");
                    }
                } else if Self::is_typed_array(&str_name) {
                    let typed_arr = JsTypedArray::from_object(obj.clone()).unwrap();
                    let length = typed_arr.length(ctx).unwrap();

                    if length == 0 {
                        cond_log!(error, new_line, "<r>{}<r> []", str_name);
                        return;
                    }

                    cond_log!(error, false, "\n<r>{}({})<r> [", str_name, length);

                    for i in 0..length {
                        let value = typed_arr.get(i, ctx).unwrap();

                        if i == 0 {
                            Self::print_as(&value, ctx, LogLevel::Normal, console, false, true);
                        } else {
                            cond_log!(error, false, "<r><d>, <r>");
                            Self::print_as(&value, ctx, LogLevel::Normal, console, false, true);
                        }
                    }

                    cond_log!(error, false, "<r> ]<r>\n");
                } else {
                    Self::print_object(obj, ctx, console, in_array);
                }
            }
        }
    }

    fn is_typed_array(str_name: &str) -> bool {
        str_name.contains("Int8Array")
            || str_name.contains("Uint8Array")
            || str_name.contains("Uint8ClampedArray")
            || str_name.contains("Int16Array")
            || str_name.contains("Uint16Array")
            || str_name.contains("Int32Array")
            || str_name.contains("Uint32Array")
            || str_name.contains("Float32Array")
            || str_name.contains("Float64Array")
    }

    // TODO: still some issues with the object printing
    fn print_object(obj: &JsObject, ctx: &mut Context, console: &mut Self, in_array: bool) {
        let properties = obj.own_property_keys(ctx).unwrap();
        let i = properties.len();

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
                if in_array {
                    console.indent += 2;
                    console.depth += 2;
                    print!("\n{{\n")
                } else {
                    console.indent += 1;
                    console.depth += 1;
                    print!("{{\n");
                }

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
                Self::print_as(&value, ctx, LogLevel::Normal, console, false, false);
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
