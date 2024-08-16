use boa_engine::{object::builtins::JsPromise, Context, JsArgs, JsError, JsValue, NativeFunction};

pub fn base_promise(promise: JsPromise, ctx: &mut Context) -> JsPromise {
    promise
        .then(
            Some(
                NativeFunction::from_fn_ptr(|_, args, _| {
                    Err(JsError::from_opaque(args.get_or_undefined(0).clone()).into())
                })
                .to_js_function(ctx.realm()),
            ),
            None,
            ctx,
        )
        .catch(
            NativeFunction::from_fn_ptr(|_, args, _| Ok(args.get_or_undefined(0).clone()))
                .to_js_function(ctx.realm()),
            ctx,
        )
        .finally(
            NativeFunction::from_fn_ptr(|_, _, ctx| Ok(JsValue::undefined()))
                .to_js_function(ctx.realm()),
            ctx,
        )
}
