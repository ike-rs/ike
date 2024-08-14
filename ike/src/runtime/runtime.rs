use super::{
    buffer::{atob, btoa}, call::rust_function, console::Console, ike::IkeGlobalObject, meta::Meta, modules::IkeModuleLoader, queue::Queue, terminal::{Terminal, TerminalStdin}, web::{
        encoding::{TextDecoder, TextEncoder},
        timeouts::{clear_timeout, set_timeout},
    }
};
use crate::prepare::transpile;
use crate::runtime::web::headers::Headers;
use crate::runtime::web::url::{URLSearchParams, URL};
use crate::{get_prototype_name, js_str_to_string, testing::js::JsTest, throw};
use boa_engine::{
    builtins::promise::PromiseState, js_str, js_string, property::Attribute, Context,
    JsNativeError, JsObject, JsResult, JsStr, JsValue, Module, NativeFunction, Source,
};
use logger::{cond_log, Logger};
use smol::LocalExecutor;
use std::{path::PathBuf, rc::Rc};

pub fn start_runtime(file: &PathBuf, context: Option<&mut Context>) -> JsResult<()> {
    let queue = Rc::new(Queue::new(LocalExecutor::new()));
    let ctx = match context {
        Some(ctx) => ctx,
        None => &mut Context::builder()
            .job_queue(queue)
            .module_loader(Rc::new(IkeModuleLoader))
            .build()
            .unwrap(),
    };

    setup_context(ctx, Some(file));
    let transpiled = match transpile(file) {
        Ok(transpiler) => transpiler,
        Err(e) => throw!(typ, format!("Failed to transpile: {:?}", e)),
    };
    // Wait until #3941 is released in the next version, so we can specify the path
    let reader = Source::from_bytes(transpiled.as_bytes());
    let module = Module::parse(reader, None, ctx)?;
    let promise = module.load_link_evaluate(ctx);

    ctx.run_jobs();

    match promise.state() {
        PromiseState::Pending => panic!("module didn't execute!"),
        PromiseState::Fulfilled(v) => {
            assert_eq!(v, JsValue::undefined())
        }
        PromiseState::Rejected(err) => {
            let obj = err.to_object(ctx).unwrap();
            let proto = match obj.prototype() {
                Some(proto) => proto,
                None => {
                    panic!("Error object has no prototype");
                }
            };
            let str_name = get_prototype_name!(proto, ctx);

            let message = obj.get(js_string!("message"), ctx).unwrap();
            cond_log!(
                true,
                true,
                "<r><red>error<r><d>({})<r>: {}",
                str_name,
                js_str_to_string!(message.to_string(ctx).unwrap())
            );
        }
    }

    Ok(())
}

pub enum SetupType {
    Class,
    Property,
    Callable,
    BuiltinCallable,
}

pub enum SetupValue {
    Object(JsObject),
    Function(NativeFunction),
}

pub struct SetupEntry {
    pub setup_type: SetupType,
    pub value: SetupValue,
    pub name: JsStr<'static>,
    pub length: Option<usize>,
}

pub fn setup_context(ctx: &mut Context, file: Option<&PathBuf>) {
    let ike = IkeGlobalObject::init(ctx, file);
    JsTest::init(ctx);

    let entries = [
        SetupEntry {
            setup_type: SetupType::Property,
            value: SetupValue::Object(Console::init(ctx)),
            name: js_str!("console"),
            length: None,
        },
        SetupEntry {
            setup_type: SetupType::Property,
            value: SetupValue::Object(ike),
            name: js_str!("Ike"),
            length: None,
        },
        SetupEntry {
            setup_type: SetupType::BuiltinCallable,
            value: SetupValue::Function(unsafe { NativeFunction::from_closure(atob) }),
            name: js_str!("atob"),
            length: None,
        },
        SetupEntry {
            setup_type: SetupType::BuiltinCallable,
            value: SetupValue::Function(unsafe { NativeFunction::from_closure(btoa) }),
            name: js_str!("btoa"),
            length: None,
        },
        SetupEntry {
            setup_type: SetupType::BuiltinCallable,
            value: SetupValue::Function(unsafe { NativeFunction::from_closure(rust_function) }),
            name: js_str!("$rustFunction"),
            length: None,
        },
        SetupEntry {
            setup_type: SetupType::BuiltinCallable,
            value: SetupValue::Function(unsafe { NativeFunction::from_closure(set_timeout) }),
            name: js_str!("setTimeout"),
            length: None,
        },
        SetupEntry {
            setup_type: SetupType::BuiltinCallable,
            value: SetupValue::Function(unsafe { NativeFunction::from_closure(clear_timeout) }),
            name: js_str!("clearTimeout"),
            length: None,
        },
    ];

    ctx.register_global_class::<TextEncoder>()
        .expect("TextEncoder is already defined");
    ctx.register_global_class::<TextDecoder>()
        .expect("TextDecoder is already defined");
    ctx.register_global_class::<URL>()
        .expect("URL is already defined");
    ctx.register_global_class::<URLSearchParams>()
        .expect("URLSearchParams is already defined");
    ctx.register_global_class::<Headers>()
        .expect("Headers is already defined");

    for entry in entries.iter() {
        match entry.setup_type {
            SetupType::Property => {
                if let SetupValue::Object(ref obj) = entry.value {
                    ctx.register_global_property(
                        entry.name,
                        JsValue::Object(obj.clone()),
                        Attribute::all(),
                    )
                    .unwrap_or_else(|_| panic!("{:?} is already defined", entry.name));
                }
            }
            SetupType::Callable => {
                if let SetupValue::Function(ref func) = entry.value {
                    ctx.register_global_callable(
                        js_string!(entry.name),
                        entry.length.unwrap_or(0),
                        func.clone(),
                    )
                    .unwrap_or_else(|_| panic!("{:?} is already defined", entry.name));
                }
            }
            SetupType::BuiltinCallable => {
                if let SetupValue::Function(ref func) = entry.value {
                    ctx.register_global_builtin_callable(
                        js_string!(entry.name),
                        entry.length.unwrap_or(0),
                        func.clone(),
                    )
                    .unwrap_or_else(|_| panic!("{:?} is already defined", entry.name));
                }
            }
            _ => todo!(),
        }
    }

    let ike = ctx.global_object().get(js_string!("Ike"), ctx).unwrap();
    let ike = ike.as_object().unwrap();

    let env_vars = std::env::vars();
    let env_obj = JsObject::default();

    for (key, value) in env_vars {
        env_obj
            .set(
                js_string!(key),
                JsValue::from(js_string!(value)),
                false,
                ctx,
            )
            .expect("Failed to set env var");
    }
    ike.set(js_string!("env"), env_obj, false, ctx)
        .expect("Failed to set Ike.env");

    let stdin = TerminalStdin::init(ctx);
    ike.set(js_string!("stdin"), stdin, false, ctx)
        .expect("Failed to set Ike.stdin");
}

pub fn get_current_path(ctx: &mut Context) -> JsValue {
    ctx.global_object()
        .get(js_string!("Ike"), ctx)
        .unwrap()
        .as_object()
        .unwrap()
        .get(js_string!("meta"), ctx)
        .unwrap()
        .as_object()
        .unwrap()
        .get(js_string!("path"), ctx)
        .unwrap()
}

pub fn update_meta_property(ctx: &mut Context, path: &PathBuf) {
    let ike_val = ctx.global_object().get(js_string!("Ike"), ctx).unwrap();
    let ike_obj = ike_val.as_object().unwrap();
    ike_obj
        .set(js_string!("meta"), Meta::init(ctx, path), false, ctx)
        .expect("meta is already defined");
}
