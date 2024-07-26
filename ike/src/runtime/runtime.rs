use std::{path::PathBuf, rc::Rc};

use crate::{fs::read_to_string, js_str_to_string, testing::js::JsTest};
use boa_engine::{
    builtins::promise::PromiseState, js_str, js_string, property::Attribute, Context,
    JsNativeError, JsObject, JsResult, JsStr, JsValue, Module, NativeFunction, Source,
};
use logger::{elog, Logger};
use smol::LocalExecutor;

use super::{
    buffer::{atob, btoa},
    call::rust_function,
    console::Console,
    ike::IkeGlobalObject,
    meta::Meta,
    modules::IkeModuleLoader,
    queue::Queue,
    webcore::encoding::TextEncoder,
};

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
    let content_src = match read_to_string(file) {
        Ok(content) => content,
        // TODO: don't return type error
        Err(e) => return Err(JsNativeError::typ().with_message(e.to_string()).into()),
    };

    setup_context(ctx, Some(file));

    let module = Module::parse(Source::from_bytes(content_src.as_bytes()), None, ctx)?;
    let promise = module.load_link_evaluate(ctx);

    ctx.run_jobs();

    match promise.state() {
        PromiseState::Pending => panic!("module didn't execute!"),
        PromiseState::Fulfilled(v) => {
            assert_eq!(v, JsValue::undefined())
        }
        PromiseState::Rejected(err) => {
            let message = err.to_string(ctx)?;

            elog!(error, "{}", js_str_to_string!(message));
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
    ];

    ctx.register_global_class::<TextEncoder>()
        .expect("TextEncoder is already defined");

    for entry in entries.iter() {
        match entry.setup_type {
            SetupType::Property => {
                if let SetupValue::Object(ref obj) = entry.value {
                    ctx.register_global_property(
                        entry.name.clone(),
                        JsValue::Object(obj.clone()),
                        Attribute::all(),
                    )
                    .expect(&format!("{:?} is already defined", entry.name));
                }
            }
            SetupType::Callable => {
                if let SetupValue::Function(ref func) = entry.value {
                    ctx.register_global_callable(
                        js_string!(entry.name.clone()),
                        entry.length.unwrap_or(0),
                        func.clone(),
                    )
                    .expect(&format!("{:?} is already defined", entry.name));
                }
            }
            SetupType::BuiltinCallable => {
                if let SetupValue::Function(ref func) = entry.value {
                    ctx.register_global_builtin_callable(
                        js_string!(entry.name.clone()),
                        entry.length.unwrap_or(0),
                        func.clone(),
                    )
                    .expect(&format!("{:?} is already defined", entry.name));
                }
            }
            _ => todo!(),
        }
    }
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
