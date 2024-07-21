use boa_engine::{
    js_string,
    native_function::NativeFunction,
    object::{builtins::JsMap, JsObject, ObjectInitializer},
    value::{JsValue, Numeric},
    Context, JsData, JsResult,
};
use boa_gc::{Finalize, Trace};
use logger::{cond_log, print_indent, Logger};
use std::{cell::RefCell, rc::Rc};

use crate::{create_method, js_str_to_string, str_from_jsvalue};

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct Console {}

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
                create_method!(Self::log, mutable state.clone()),
                js_string!("log"),
                0,
            )
            .function(
                create_method!(Self::log, mutable state.clone()),
                js_string!("info"),
                0,
            )
            .function(
                create_method!(Self::error, mutable state.clone()),
                js_string!("error"),
                0,
            )
            .build()
    }

    fn log(_: &JsValue, args: &[JsValue], console: &Self, ctx: &mut Context) -> JsResult<JsValue> {
        Self::print(args, ctx, LogLevel::Normal)?;
        Ok(JsValue::undefined())
    }

    fn error(
        _: &JsValue,
        args: &[JsValue],
        console: &Self,
        ctx: &mut Context,
    ) -> JsResult<JsValue> {
        Self::print(args, ctx, LogLevel::Error)?;
        Ok(JsValue::undefined())
    }

    fn print(args: &[JsValue], ctx: &mut Context, level: LogLevel) -> JsResult<JsValue> {
        if args.is_empty() {
            return Ok(JsValue::undefined());
        }

        for arg in args {
            Self::print_as(arg, ctx, level);
        }
        Ok(JsValue::undefined())
    }

    fn print_as(arg: &JsValue, ctx: &mut Context, level: LogLevel) {
        let error = match level {
            LogLevel::Error => true,
            LogLevel::Normal => false,
        };

        match arg {
            JsValue::Null => {
                cond_log!(error, "<r><yellow>null<r>");
            }
            JsValue::Undefined => {
                cond_log!(error, "<r><d>undefined<r>");
            }
            JsValue::Boolean(b) => {
                cond_log!(error, "<r><yellow>{}<r>", b);
            }
            JsValue::Symbol(s) => {
                let desc = s.description();

                if let Some(desc) = desc {
                    cond_log!(error, "<r><yellow>Symbol({})<r>", js_str_to_string!(desc));
                } else {
                    cond_log!(error, "<r><yellow>Symbol<r>");
                }
            }
            JsValue::BigInt(b) => {
                cond_log!(error, "<r><yellow>{}<r>", b);
            }
            JsValue::Integer(_) | JsValue::Rational(_) => {
                if arg.is_integer() {
                    cond_log!(error, "<r><yellow>{}<r>", arg.to_i32(ctx).unwrap());
                } else {
                    cond_log!(error, "<r><yellow>{}<r>", arg.to_number(ctx).unwrap());
                }
            }
            JsValue::String(_) => {
                let formatted = Self::format(arg, ctx).unwrap_or(String::new());

                cond_log!(error, "{}", formatted);
            }
            // TODO: better handling. array, object, map, set support
            JsValue::Object(obj) => {
                let proto = match obj.prototype() {
                    Some(proto) => proto,
                    None => {
                        // TODO: make func to print objects and implement it in the object later
                        cond_log!(error, "<r><yellow>[object Object]<r>");
                        return;
                    }
                };
                let proto_name = proto
                    .get(js_string!("constructor"), ctx)
                    .unwrap()
                    .to_object(ctx)
                    .unwrap()
                    .get(js_string!("name"), ctx)
                    .unwrap();
                let str_name = js_str_to_string!(proto_name.to_string(ctx).unwrap());

                if str_name == "Date" {
                    cond_log!(
                        error,
                        "<r><magenta>{}<r>",
                        js_str_to_string!(arg.to_string(ctx).unwrap())
                    );
                } else if str_name == "RegExp" {
                    cond_log!(
                        error,
                        "<r><red>{}<r>",
                        js_str_to_string!(arg.to_string(ctx).unwrap())
                    );
                } else if str_name == "Map" {
                    let map = JsMap::from_object(obj.clone()).unwrap();
                    let size = map.get_size(ctx).unwrap().to_i32(ctx).unwrap();

                    if size == 0 {
                        cond_log!(error, "<r><green>Map({})<r> {{}}", size);
                        return;
                    }

                    cond_log!(error, "<r><green>Map({})<r> {{", size);
                    let entries = map.entries(ctx).unwrap();

                    cond_log!(error, "<r>}}<r>");
                }
            }
        }
    }

    fn format(arg: &JsValue, ctx: &mut Context) -> JsResult<String> {
        let mut formatted = String::new();
        let mut arg_index = 1;
        let target = str_from_jsvalue!(arg, ctx);
        let mut chars = target.chars();

        while let Some(c) = chars.next() {
            // TODO: support for c,d
            if c == '%' {
                let fmt = chars.next().unwrap_or('%');
                match fmt {
                    's' => {
                        formatted.push_str(&str_from_jsvalue!(arg, ctx));
                        arg_index += 1;
                    }
                    'f' => {
                        let arg = arg.to_number(ctx)?;
                        formatted.push_str(&format!("{arg:.6}"));
                        arg_index += 1;
                    }
                    'd' | 'i' => {
                        let arg = match arg.to_numeric(ctx)? {
                            Numeric::Number(r) => (r.floor() + 0.0).to_string(),
                            Numeric::BigInt(int) => int.to_string(),
                        };
                        formatted.push_str(&arg);
                        arg_index += 1;
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
