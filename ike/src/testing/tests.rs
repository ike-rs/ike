use smol::LocalExecutor;
use std::{collections::HashMap, path::PathBuf, rc::Rc, time::Instant};

use crate::{
    cli::run_command::Entry,
    format::format_time,
    js_str_to_string,
    runtime::{meta::Meta, modules::IkeModuleLoader, queue::Queue, runtime::setup_context},
};
use logger::{elog, log, new_line, print_indent, Logger};

use boa_engine::{
    builtins::promise::PromiseState,
    js_string,
    object::builtins::{JsArray, JsFunction},
    Context, JsResult, JsString, JsValue, Module, Source,
};

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

// TODO: add support for alone tests, and showing what went wrong
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

    for path in paths {
        let entry = Entry::new(true, Some(path.clone()), None);
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

    for i in 0..groups.length(ctx)? {
        let test_val = groups.get(i, ctx)?;
        let test_group = test_val.as_object().unwrap();
        let group_path = test_group.get(js_string!("path"), ctx).unwrap();
        let path_str = group_path.to_string(ctx).unwrap().to_std_string_escaped();

        test_groups_by_file
            .entry(path_str)
            .or_insert_with(Vec::new)
            .push(test_val);
    }

    for i in 0..alone.length(ctx)? {
        let test_val = alone.get(i, ctx)?;
        let test_obj = test_val.as_object().unwrap();
        let test_path = test_obj.get(js_string!("path"), ctx).unwrap();
        let path_str = test_path.to_string(ctx).unwrap().to_std_string_escaped();

        alone_tests_by_file
            .entry(path_str)
            .or_insert_with(Vec::new)
            .push(test_val);
    }

    let mut tests_by_files: HashMap<String, HashMap<String, Vec<JsValue>>> = HashMap::new();

    for (path_str, alone_tests) in alone_tests_by_file {
        tests_by_files
            .entry(path_str.clone())
            .or_insert_with(HashMap::new)
            .insert("alone".to_string(), alone_tests);
    }

    for (path_str, test_groups) in test_groups_by_file {
        tests_by_files
            .entry(path_str.clone())
            .or_insert_with(HashMap::new)
            .insert("groups".to_string(), test_groups);
    }

    for (path_str, tests) in tests_by_files {
        let path = strip_prefix_from_path(root.clone(), PathBuf::from(path_str.clone()));
        log!("{} <r><d>{}<r>", ICONS["skip"], path.display());

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

                    print_indent!(1);
                    log!(
                        "{} <r><d>{}<r>",
                        ICONS["skip"],
                        name.to_string(ctx).unwrap().to_std_string_escaped()
                    );

                    for j in 0..tests.length(ctx)? {
                        let single_test = tests.get(j, ctx)?;
                        results.tests += 1;
                        run_single_test(single_test, ctx, &mut results, 2);
                    }
                }
            }
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
        .unwrap_or(JsValue::from(JsString::from("fail")));

    let status = result.to_string(ctx).unwrap().to_std_string_escaped();

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
}
