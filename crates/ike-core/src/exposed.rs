use boa_engine::{Context, JsResult, JsValue};

#[derive(Copy, Clone, Debug)]
pub struct ExposedFunction {
    pub name: &'static str,
    pub function: fn(this: &JsValue, &[JsValue], ctx: &mut Context) -> JsResult<JsValue>,
}

impl ExposedFunction {
    pub fn create(
        name: &'static str,
        function: fn(this: &JsValue, &[JsValue], ctx: &mut Context) -> JsResult<JsValue>,
    ) -> Self {
        Self { name, function }
    }
}
