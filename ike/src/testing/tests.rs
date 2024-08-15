use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    rc::Rc,
    time::Instant,
};

use boa_engine::{
    builtins::promise::PromiseState,
    js_string,
    object::builtins::{JsArray, JsFunction},
    Context, JsNativeError, JsResult, JsValue, Module, Source,
};
use smol::LocalExecutor;

use logger::{cond_log, log, new_line, print_indent, Logger};

use crate::utils::compare_paths;
use crate::{
    cli::run_command::Entry,
    format::format_time,
    get_prototype_name, js_str_to_string,
    runtime::{
        modules::IkeModuleLoader,
        queue::Queue,
        runtime::{setup_context, update_meta_property},
    },
    throw,
};
use crate::{globals::CODE_TO_INJECT, transpiler::transpile};

lazy_static::lazy_static! {
    static ref ICONS: HashMap<&'static str, &'static str> = {
        let mut m = HashMap::new();
        m.insert("pass", "<r><green>✓<r>");
        m.insert("fail", "<r><red>✗<r>");
        m.insert("skip", "<r><yellow>»<r>");
        m.insert("todo", "<r><magenta>⚑<r>");
        m
    };
}

#[derive(Clone, Debug)]
pub struct TestResults {
    pub pass: u32,
    pub failed: u32,
    pub skipped: u32,
    pub todo: u32,
    pub tests: u32,
    pub files: u32,
}

pub enum TestStatus {
    Pass,
    Fail,
    Skip,
    Todo,
}

impl TestResults {
    pub fn new() -> Self {
        Self {
            pass: 0,
            failed: 0,
            skipped: 0,
            todo: 0,
            tests: 0,
            files: 0,
        }
    }

    pub fn total(&self) -> u32 {
        self.pass + self.failed + self.skipped + self.todo
    }
}

pub fn run_tests(paths: Vec<PathBuf>, root: PathBuf) -> JsResult<()> {
    let queue = Rc::new(Queue::new(LocalExecutor::new()));
    let ctx = &mut Context::builder()
        .job_queue(queue)
        .module_loader(Rc::new(IkeModuleLoader))
        .build()
        .unwrap();
    setup_context(ctx, None);
    let start_time = Instant::now();
    let mut results = TestResults::new();
    let mut test_groups_by_file: HashMap<String, Vec<JsValue>> = HashMap::new();
    let mut alone_tests_by_file: HashMap<String, Vec<JsValue>> = HashMap::new();

    // we evaulte injected code before, so it doesn't get executed every file, about 2s saved
    let reader = Source::from_bytes(CODE_TO_INJECT.as_bytes());
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

    for path in paths {
        let entry = Entry::new(true, Some(path.clone()), None);
        update_meta_property(ctx, &entry.path.clone().unwrap());
        let path = entry.path.unwrap().as_path().to_path_buf();

        let transpiled = match transpile(&path) {
            Ok(transpiler) => transpiler,
            Err(e) => throw!(typ, format!("Failed to transpile: {:?}", e)),
        };
        let reader = Source::from_bytes(transpiled.as_bytes()).with_path(&Path::new(&path));
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

        results.files += 1;
    }

    let test = ctx
        .global_object()
        .get(js_string!("IKE_INTERNAL_TEST"), ctx)
        .expect("IKE_INTERNAL_TEST not found");

    let obj = test
        .as_object()
        .expect("IKE_INTERNAL_TEST is not an object");
    let groups_val = obj.get(js_string!("groups"), ctx).unwrap();
    let alone_val = obj.get(js_string!("alone"), ctx).unwrap();
    let groups_obj = groups_val.as_object().unwrap();
    let alone_obj = alone_val.as_object().unwrap();
    let groups = JsArray::from_object(groups_obj.clone())?;
    let alone = JsArray::from_object(alone_obj.clone())?;
    let global_before_all_val = obj
        .get(js_string!("beforeAll"), ctx)
        .unwrap_or_else(|_| JsValue::undefined());
    let global_after_all_val = obj
        .get(js_string!("afterAll"), ctx)
        .unwrap_or_else(|_| JsValue::undefined());

    for i in 0..groups.length(ctx)? {
        let test_val = groups.get(i, ctx)?;
        let test_group = test_val.as_object().unwrap();
        let group_path = test_group.get(js_string!("path"), ctx).unwrap();
        let path_str = group_path.to_string(ctx).unwrap().to_std_string_escaped();

        test_groups_by_file
            .entry(path_str)
            .or_default()
            .push(test_val);
    }

    for i in 0..alone.length(ctx)? {
        let test_val = alone.get(i, ctx)?;
        let test_obj = test_val.as_object().unwrap();
        let test_path = test_obj.get(js_string!("path"), ctx).unwrap();
        let path_str = test_path.to_string(ctx).unwrap().to_std_string_escaped();

        alone_tests_by_file
            .entry(path_str)
            .or_default()
            .push(test_val);
    }

    let mut tests_by_files: HashMap<String, HashMap<String, Vec<JsValue>>> = HashMap::new();

    for (path_str, alone_tests) in alone_tests_by_file {
        tests_by_files
            .entry(path_str.clone())
            .or_default()
            .insert("alone".to_string(), alone_tests);
    }

    for (path_str, test_groups) in test_groups_by_file {
        tests_by_files
            .entry(path_str.clone())
            .or_default()
            .insert("groups".to_string(), test_groups);
    }

    for (path_str, tests) in tests_by_files {
        let path_buf = PathBuf::from(path_str.clone());
        let path = strip_prefix_from_path(root.clone(), path_buf.clone());
        log!("{} <r><d>{}<r>", ICONS["skip"], path.display());

        if !global_before_all_val.is_undefined() {
            let global_before_all =
                JsArray::from_object(global_before_all_val.as_object().unwrap().clone())?;
            run_before_all_hooks(&global_before_all, ctx, path_buf.clone())?;
        }

        for (group_name, test_group) in tests {
            if group_name.eq("alone") {
                for test_val in test_group {
                    results.tests += 1;
                    run_single_test(test_val, ctx, &mut results, 1);
                }
            } else {
                for test_val in test_group {
                    let test_group = test_val.as_object().unwrap();
                    let name = test_group.get(js_string!("name"), ctx).unwrap();
                    let tests_val = test_group.get(js_string!("tests"), ctx).unwrap();
                    let tests_obj = tests_val.as_object().unwrap();
                    let tests = JsArray::from_object(tests_obj.clone())?;
                    let before_all_val = test_group
                        .get(js_string!("beforeAll"), ctx)
                        .unwrap_or_else(|_| JsValue::undefined());
                    let after_all_val = test_group
                        .get(js_string!("afterAll"), ctx)
                        .unwrap_or_else(|_| JsValue::undefined());

                    print_indent!(1);
                    log!(
                        "{} <r><d>{}<r>",
                        ICONS["skip"],
                        name.to_string(ctx).unwrap().to_std_string_escaped()
                    );

                    if !before_all_val.is_undefined() {
                        let hooks_arr =
                            JsArray::from_object(before_all_val.as_object().unwrap().clone())?;

                        for i in 0..hooks_arr.length(ctx)? {
                            let hook_val = hooks_arr.get(i, ctx)?;
                            let hook = hook_val.as_object().unwrap().clone();
                            let function = JsFunction::from_object(hook).unwrap();

                            function.call(&JsValue::undefined(), &[], ctx)?;
                        }
                    }

                    for j in 0..tests.length(ctx)? {
                        let single_test = tests.get(j, ctx)?;
                        results.tests += 1;
                        run_single_test(single_test, ctx, &mut results, 2);
                    }

                    if !after_all_val.is_undefined() {
                        let hooks_arr =
                            JsArray::from_object(after_all_val.as_object().unwrap().clone())?;

                        for i in 0..hooks_arr.length(ctx)? {
                            let hook_val = hooks_arr.get(i, ctx)?;
                            let hook = hook_val.as_object().unwrap().clone();
                            let function = JsFunction::from_object(hook).unwrap();

                            function.call(&JsValue::undefined(), &[], ctx)?;
                        }
                    }
                }
            }
        }

        if !global_after_all_val.is_undefined() {
            run_after_all_hooks(&global_after_all_val, ctx, path_buf)?;
        }

        new_line!();
    }

    let all_success = results.failed == 0;

    log!(
        "   <d>Files<r> <r>{}{} files total<r>",
        if all_success { "<green>" } else { "<red>" },
        results.files
    );
    log!(
        "   <d>Tests<r> <r>{}{} total<r>{}{}{}{}",
        if all_success { "<green>" } else { "<red>" },
        results.total(),
        if results.todo > 0 {
            format!(" <d>|<r> <r><magenta>{} todo<r>", results.todo)
        } else {
            "".to_string()
        },
        if results.skipped > 0 {
            format!(" <d>|<r> <r><yellow>{} skipped<r>", results.skipped)
        } else {
            "".to_string()
        },
        if results.failed > 0 {
            format!(" <d>|<r> <r><red>{} failed<r>", results.failed)
        } else {
            "".to_string()
        },
        if results.pass > 0 {
            format!(" <d>|<r> <r><green>{} passed<r>", results.pass)
        } else {
            "".to_string()
        }
    );
    log!(
        " <d>Elapsed<r> <r>{}<r>",
        format_time(start_time.elapsed(), false)
    );

    new_line!();
    Ok(())
}

fn run_before_all_hooks(
    hooks_array: &JsArray,
    ctx: &mut Context,
    to_compare: PathBuf,
) -> JsResult<()> {
    let length = hooks_array.length(ctx)?;

    for i in 0..length {
        let hook_val = hooks_array.get(i, ctx)?;
        let hook = hook_val.as_object().unwrap().clone();
        let func = hook.get(js_string!("func"), ctx).unwrap();
        let path = hook.get(js_string!("path"), ctx).unwrap();
        let path_buf = PathBuf::from(path.to_string(ctx).unwrap().to_std_string_escaped());

        if compare_paths(path_buf, to_compare.clone()) {
            let function = JsFunction::from_object(func.as_object().unwrap().clone()).unwrap();
            function.call(&JsValue::undefined(), &[], ctx)?;
        }
    }
    Ok(())
}

fn run_after_all_hooks(
    hooks_array: &JsValue,
    ctx: &mut Context,
    to_compare: PathBuf,
) -> JsResult<()> {
    let hooks_array = JsArray::from_object(hooks_array.as_object().unwrap().clone())?;
    let length = hooks_array.length(ctx)?;

    for i in 0..length {
        let hook_val = hooks_array.get(i, ctx)?;
        let hook = hook_val.as_object().unwrap().clone();
        let func = hook.get(js_string!("func"), ctx).unwrap();
        let path = hook.get(js_string!("path"), ctx).unwrap();
        let path_buf = PathBuf::from(path.to_string(ctx).unwrap().to_std_string_escaped());

        if compare_paths(path_buf, to_compare.clone()) {
            let function = JsFunction::from_object(func.as_object().unwrap().clone()).unwrap();
            function.call(&JsValue::undefined(), &[], ctx)?;
        }
    }
    Ok(())
}

pub fn strip_prefix_from_path(mut root: PathBuf, mut path: PathBuf) -> PathBuf {
    root = root.to_string_lossy().replace("\\", "/").into();
    path = path.to_string_lossy().replace("\\", "/").into();

    path.strip_prefix(&root).unwrap().to_path_buf()
}

pub fn run_single_test(test: JsValue, ctx: &mut Context, results: &mut TestResults, indent: usize) {
    let test_obj = test.as_object().unwrap();
    let name = test_obj.get(js_string!("name"), ctx).unwrap();
    let func_obj = test_obj.get(js_string!("func"), ctx).unwrap();
    let func = func_obj.as_object().unwrap();

    let start = Instant::now();
    let result = JsFunction::from_object(func.clone())
        .unwrap()
        .call(&JsValue::undefined(), &[], ctx)
        .unwrap();
    let result_obj = result.as_object().unwrap();
    let status = result_obj
        .get(js_string!("status"), ctx)
        .unwrap()
        .to_string(ctx)
        .unwrap()
        .to_std_string_escaped();

    let duration = start.elapsed();
    let formatted_time = format_time(duration, true);

    print_indent!(indent);
    match status.as_str() {
        "pass" => {
            results.pass += 1;
        }
        "fail" => {
            results.failed += 1;
        }
        "skip" => {
            results.skipped += 1;
        }
        "todo" => {
            results.todo += 1;
        }
        _ => {
            panic!("Unkown test result: {}", status);
        }
    }

    log!(
        "{} {} {}{}",
        ICONS.get(status.as_str()).unwrap(),
        name.to_string(ctx).unwrap().to_std_string_escaped(),
        formatted_time,
        if status.eq("skip") {
            " <d>(skipped)<r>"
        } else {
            ""
        }
    );

    if status.eq("fail") {
        let error = result_obj.get(js_string!("error"), ctx).unwrap();
        let error = error.as_object().unwrap();

        let proto = match error.prototype() {
            Some(proto) => proto,
            None => {
                panic!("No prototype found for test result object");
            }
        };
        let str_name = get_prototype_name!(proto, ctx);

        let message = error.get(js_string!("message"), ctx).unwrap();
        cond_log!(
            true,
            true,
            "{}<r><red>└─ error<r><d>({})<r>: {}",
            "  ".repeat(indent),
            str_name,
            js_str_to_string!(message.to_string(ctx).unwrap())
        );
    }
}
