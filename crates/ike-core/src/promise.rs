use boa_engine::{
    js_string, object::builtins::JsPromise, Context, JsArgs, JsError, JsNativeError, JsValue,
    NativeFunction,
};

use crate::{get_prototype_name, js_str_to_string};

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
            NativeFunction::from_fn_ptr(|_, args, ctx| {
                let err = args.get_or_undefined(0);
                if let Some(err_obj) = err.as_object() {
                    let proto = err_obj.prototype();
                    let proto = match proto {
                        Some(proto) => proto,
                        None => return Ok(JsValue::undefined()),
                    };
                    let str_name = get_prototype_name!(proto, ctx);
                    if str_name == "Error" {
                        let message = err_obj
                            .get(js_string!("message"), ctx)?
                            .to_string(ctx)?
                            .to_std_string_escaped();
                        return Err(JsNativeError::error().with_message(message).into());
                    }
                }
                Ok(err.clone())
            })
            .to_js_function(ctx.realm()),
            ctx,
        )
        .finally(
            NativeFunction::from_fn_ptr(|_, _, _| Ok(JsValue::undefined()))
                .to_js_function(ctx.realm()),
            ctx,
        )
}
