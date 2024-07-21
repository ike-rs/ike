use std::path::{Path, PathBuf};

use boa_engine::{
    job::NativeJob, js_string, module::ModuleLoader, Context, JsNativeError, JsResult, JsString,
    JsValue, Module, Source,
};
use isahc::{
    config::{Configurable, RedirectPolicy},
    AsyncReadResponseExt, Request, RequestExt,
};

use crate::fs::normalize_path;

#[derive(Debug, Default)]
pub struct IkeModuleLoader;

const ALLOWED_EXTENSIONS: [&str; 5] = ["js", "mjs", "ts", "mts", "cjs"];

impl ModuleLoader for IkeModuleLoader {
    fn load_imported_module(
        &self,
        _referrer: boa_engine::module::Referrer,
        specifier: JsString,
        finish_load: Box<dyn FnOnce(JsResult<Module>, &mut Context)>,
        context: &mut Context,
    ) {
        let spec = specifier.to_std_string_escaped();

        if is_fetchable(&spec) {
            let fetch = async move {
                println!("Fetching `{spec}`...");
                let body: Result<_, isahc::Error> = async {
                    let mut response = Request::get(&spec)
                        .redirect_policy(RedirectPolicy::Limit(5))
                        .body(())?
                        .send_async()
                        .await?;

                    Ok(response.text().await?)
                }
                .await;
                println!("Finished fetching `{spec}`");

                NativeJob::new(move |context| -> JsResult<JsValue> {
                    let body = match body {
                        Ok(body) => body,
                        Err(err) => {
                            finish_load(
                                Err(JsNativeError::typ().with_message(err.to_string()).into()),
                                context,
                            );

                            return Ok(JsValue::undefined());
                        }
                    };

                    let source = Source::from_bytes(body.as_bytes());

                    let module = Module::parse(source, None, context);

                    finish_load(module, context);

                    Ok(JsValue::undefined())
                })
            };

            context
                .job_queue()
                .enqueue_future_job(Box::pin(fetch), context)
        } else {
            let meta_path = context
                .global_object()
                .get(js_string!("ike"), context)
                .unwrap()
                .to_object(context)
                .unwrap()
                .get(js_string!("meta"), context)
                .unwrap()
                .to_object(context)
                .unwrap()
                .get(js_string!("path"), context)
                .unwrap()
                .to_string(context)
                .unwrap()
                .to_std_string_escaped();

            let temp_path = PathBuf::from(meta_path);
            let current_ext = temp_path.extension().unwrap().to_str().unwrap();

            let mut path = PathBuf::from(temp_path.parent().unwrap());

            if path.extension().is_none() {
                // Look for all files with the basename of spec
                let files = std::fs::read_dir(&path).unwrap();
                let spec_path = PathBuf::from(spec.as_str());
                let candidates: Vec<PathBuf> = files
                    .filter_map(|entry| entry.ok())
                    .map(|entry| entry.path())
                    .filter(|file_path| {
                        file_path.is_file()
                            && file_path.file_stem() == spec_path.file_stem()
                            && ALLOWED_EXTENSIONS
                                .contains(&file_path.extension().unwrap().to_str().unwrap())
                    })
                    .collect();

                if candidates.is_empty() {
                    finish_load(
                        Err(JsNativeError::typ()
                            .with_message(format!("Module not found: {}", spec))
                            .into()),
                        context,
                    );

                    return;
                }

                // Check if there is only one candidate or one with the same extension.
                if candidates.len() == 1 {
                    path = candidates[0].clone();
                } else {
                    path = candidates
                        .iter()
                        .find(|candidate| {
                            candidate.extension().unwrap().to_str().unwrap() == current_ext
                        })
                        .unwrap_or(&candidates[0])
                        .clone();
                }
            } else {
                path = normalize_path(PathBuf::from(spec.clone()), path);
            }

            if !path.exists() {
                finish_load(
                    Err(JsNativeError::typ()
                        .with_message(format!("Module not found: {}", spec))
                        .into()),
                    context,
                );

                return;
            }
            println!("Loading `{}`...", path.display());

            // TODO: should we update the meta current file?
            // TODO: also strip typescript specific syntax
            let module = Module::parse(
                Source::from_filepath(path.as_path()).unwrap(),
                None,
                context,
            );

            finish_load(module, context);
        }
    }
}

pub fn is_fetchable(specifier: &str) -> bool {
    specifier.starts_with("http://") || specifier.starts_with("https://")
}
