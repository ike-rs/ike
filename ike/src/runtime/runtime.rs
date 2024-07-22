use std::{path::PathBuf, rc::Rc};

use crate::{fs::read_to_string, js_str_to_string};
use boa_engine::{
    builtins::promise::PromiseState, js_str, js_string, property::Attribute, Context,
    JsNativeError, JsObject, JsResult, JsStr, JsValue, Module, NativeFunction, Source,
};
use logger::{elog, Logger};

use super::{
    buffer::{atob, btoa},
    console::Console,
    meta::Meta,
    modules::IkeModuleLoader,
    queue::Queue,
};

pub fn start_runtime(file: &PathBuf) -> JsResult<()> {
    let queue = Rc::new(Queue::new());
    let ctx = &mut Context::builder()
        .job_queue(queue)
        .module_loader(Rc::new(IkeModuleLoader))
        .build()
        .unwrap();
    let content_src = match read_to_string(file) {
        Ok(content) => content,
        // TODO: don't return type error
        Err(e) => return Err(JsNativeError::typ().with_message(e.to_string()).into()),
    };

    setup_context(ctx, file);

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

pub fn setup_context(ctx: &mut Context, file: &PathBuf) {
    let ike_object = JsObject::default();

    ike_object
        .set(js_str!("meta"), Meta::init(ctx, file), false, ctx)
        .expect("meta is already defined");

    let entries = [
        SetupEntry {
            setup_type: SetupType::Property,
            value: SetupValue::Object(Console::init(ctx)),
            name: js_str!("console"),
            length: None,
        },
        SetupEntry {
            setup_type: SetupType::Property,
            value: SetupValue::Object(ike_object),
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
    ];

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
