use std::{path::PathBuf, rc::Rc};

use crate::{fs::read_to_string, js_str_to_string};
use boa_engine::{
    builtins::promise::PromiseState, js_str, js_string, property::Attribute, Context,
    JsNativeError, JsObject, JsResult, JsStr, JsValue, Module, Source,
};
use logger::{elog, Logger};

use super::{console::Console, meta::Meta, modules::IkeModuleLoader, queue::Queue};

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

pub struct SetupEntry<T> {
    pub setup_type: SetupType,
    pub value: T,
    pub name: JsStr<'static>,
}

pub fn setup_context(ctx: &mut Context, file: &PathBuf) {
    let ike_object = JsObject::default();

    ike_object
        .set(js_string!("meta"), Meta::init(ctx, file), false, ctx)
        .expect("meta is already defined");

    let entries = [
        SetupEntry::<JsObject> {
            setup_type: SetupType::Property,
            value: Console::init(ctx),
            name: js_str!("console"),
        },
        SetupEntry::<JsObject> {
            setup_type: SetupType::Property,
            value: ike_object,
            name: js_str!("ike"),
        },
    ];

    for entry in entries.iter() {
        match entry.setup_type {
            SetupType::Property => {
                ctx.register_global_property(
                    entry.name.clone(),
                    entry.value.clone(),
                    Attribute::all(),
                )
                .expect(&format!("{:?} is already defined", entry.name));
            }
            _ => todo!(),
        }
    }
}
