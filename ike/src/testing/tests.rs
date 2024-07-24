use logger::{elog, Logger};
use smol::LocalExecutor;
use std::{path::PathBuf, rc::Rc};

use crate::{
    cli::run_command::Entry,
    runtime::{meta::Meta, modules::IkeModuleLoader, queue::Queue, runtime::setup_context},
};

use crate::js_str_to_string;
use boa_engine::{
    builtins::promise::PromiseState, js_string, Context, JsResult, JsValue, Module, Source,
};

pub fn run_tests(paths: Vec<PathBuf>) -> JsResult<()> {
    let queue = Rc::new(Queue::new(LocalExecutor::new()));
    let ctx = &mut Context::builder()
        .job_queue(queue)
        .module_loader(Rc::new(IkeModuleLoader))
        .build()
        .unwrap();
    setup_context(ctx, None);

    // TODO: Ike.meta
    for path in paths {
        let entry = Entry::new(true, Some(path), None);
        let ike_val = ctx.global_object().get(js_string!("Ike"), ctx).unwrap();
        let ike_obj = ike_val.as_object().unwrap();
        ike_obj
            .set(
                js_string!("meta"),
                Meta::init(ctx, &entry.path.clone().unwrap()),
                false,
                ctx,
            )
            .expect("meta is already defined");

        let module = Module::parse(
            Source::from_filepath(entry.path.unwrap().as_path()).unwrap(),
            None,
            ctx,
        )?;
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
    }

    Ok(())
}
