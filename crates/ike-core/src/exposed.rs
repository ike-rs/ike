use std::{future::Future, pin::Pin, rc::Rc};

use boa_engine::{object::builtins::JsPromise, Context, JsResult, JsValue, NativeFunction};

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

pub type AsyncFn = for<'a, 'b, 'c> fn(
    &'a JsValue,
    &'b [JsValue],
    &'c mut Context,
) -> (dyn Future<Output = JsResult<JsValue>> + 'static);

#[derive(Clone)]
pub struct ExposedAsyncFunction {
    pub name: &'static str,
    pub function: AsyncFn,
}

impl ExposedAsyncFunction {
    pub fn create(name: &'static str, function: AsyncFn) -> Self {
        Self { name, function }
    }
}
