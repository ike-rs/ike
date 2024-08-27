use super::{
    call::rust_function,
    console::Console,
    ike::IkeGlobalObject,
    meta::Meta,
    modules::IkeModuleLoader,
    queue::Queue,
    terminal::{Terminal, TerminalStdin},
};
use crate::runtime::web::url::{URLSearchParams, URL};
use crate::testing::js::JsTest;
use crate::transpiler::transpile;
use boa_engine::{
    builtins::promise::PromiseState, js_str, js_string, module, property::Attribute, Context,
    JsNativeError, JsObject, JsResult, JsStr, JsValue, Module, NativeFunction, Source,
};
use fs::FsModule;
use ike_core::{get_prototype_name, js_str_to_string, throw, ModuleTrait};
use ike_logger::{cond_log, Logger};
use smol::LocalExecutor;
use std::{
    path::{Path, PathBuf},
    rc::Rc,
};
use web::WebModule;

pub fn start_runtime(file: &PathBuf, context: Option<&mut Context>) -> JsResult<()> {
    let queue = Rc::new(Queue::new(LocalExecutor::new()));
    let module_loader = Rc::new(IkeModuleLoader::new(std::env::current_dir().unwrap())?);
    let ctx = match context {
        Some(ctx) => ctx,
        None => &mut Context::builder()
            .job_queue(queue)
            .module_loader(module_loader.clone())
            .build()
            .unwrap(),
    };

    load_modules(ctx, module_loader)?;
    setup_context(ctx, Some(file));

    let script_source = Source::from_bytes(include_bytes!("./runtime.js"));
    let script_module = Module::parse(script_source, None, ctx)?;
    evaulte_module(ctx, script_module)?;

    let transpiled = match transpile(file) {
        Ok(transpiler) => transpiler,
        Err(e) => throw!(typ, "Failed to transpile: {:?}", e),
    };
    let reader = Source::from_bytes(transpiled.as_bytes()).with_path(&Path::new(&file));
    let module = Module::parse(reader, None, ctx)?;

    evaulte_module(ctx, module)?;

    Ok(())
}

pub fn load_modules(ctx: &mut Context, module_loader: Rc<IkeModuleLoader>) -> JsResult<()> {
    let modules: Vec<(&dyn ModuleTrait, Rc<IkeModuleLoader>)> = vec![
        (&WebModule, Rc::clone(&module_loader)),
        (&FsModule, module_loader),
    ];

    for (module, loader) in modules {
        load_module(ctx, module, loader)?;
    }

    Ok(())
}

pub fn load_module(
    ctx: &mut Context,
    module: &dyn ModuleTrait,
    module_loader: Rc<IkeModuleLoader>,
) -> JsResult<()> {
    let files = module.js_files();
    let exposed = module.exposed_functions();
    for exposed_fn in exposed.iter() {
        ctx.register_global_builtin_callable(
            js_string!(exposed_fn.name),
            0,
            NativeFunction::from_fn_ptr(exposed_fn.function),
        )
        .expect(&format!(
            "Failed to set exposed function {:?}",
            exposed_fn.name
        ));
    }

    for (file, content) in files {
        let path = Path::new(module.cwd()).join(file);
        let result = Source::from_bytes(content.as_bytes()).with_path(&path);

        let parsed_module = Module::parse(result, None, ctx)?;
        module_loader.insert(PathBuf::from(module.name_for(file)), parsed_module);
    }

    Ok(())
}

pub fn evaulte_module(ctx: &mut Context, module: Module) -> JsResult<()> {
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
            value: SetupValue::Function(unsafe { NativeFunction::from_closure(rust_function) }),
            name: js_str!("$rustFunction"),
            length: None,
        },
    ];

    ctx.register_global_class::<URL>()
        .expect("URL is already defined");
    ctx.register_global_class::<URLSearchParams>()
        .expect("URLSearchParams is already defined");

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
