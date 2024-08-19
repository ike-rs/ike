use boa_engine::{Context, JsResult, JsValue};

#[derive(Copy, Clone)]
pub struct ExposedFunction {
    pub name: &'static str,
    pub function: fn(this: &JsValue, &[JsValue], ctx: &Context) -> JsResult<JsValue>,
}

impl ExposedFunction {
    pub fn create(
        name: &'static str,
        function: fn(this: &JsValue, &[JsValue], ctx: &Context) -> JsResult<JsValue>,
    ) -> Self {
        Self { name, function }
    }
}
