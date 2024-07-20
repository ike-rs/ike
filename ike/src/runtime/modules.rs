use boa_engine::{
    job::NativeJob, module::ModuleLoader, Context, JsNativeError, JsResult, JsString, JsValue,
    Module, Source,
};
use isahc::{
    config::{Configurable, RedirectPolicy},
    AsyncReadResponseExt, Request, RequestExt,
};

#[derive(Debug, Default)]
pub struct HttpModuleLoader;

impl ModuleLoader for HttpModuleLoader {
    fn load_imported_module(
        &self,
        _referrer: boa_engine::module::Referrer,
        specifier: JsString,
        finish_load: Box<dyn FnOnce(JsResult<Module>, &mut Context)>,
        context: &mut Context,
    ) {
        let url = specifier.to_std_string_escaped();

        let fetch = async move {
            println!("Fetching `{url}`...");
            let body: Result<_, isahc::Error> = async {
                let mut response = Request::get(&url)
                    .redirect_policy(RedirectPolicy::Limit(5))
                    .body(())?
                    .send_async()
                    .await?;

                Ok(response.text().await?)
            }
            .await;
            println!("Finished fetching `{url}`");

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
    }
}
