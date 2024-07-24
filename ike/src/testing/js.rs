use boa_engine::{
    js_string,
    object::builtins::{JsArray, JsFunction},
    property::Attribute,
    Context, JsNativeError, JsObject, JsResult, JsValue, NativeFunction,
};

use crate::{assert_arg_type, str_from_jsvalue, throw};

pub struct JsTest;

impl JsTest {
    pub fn init(ctx: &mut Context) {
        let obj = JsObject::default();
        obj.set(js_string!("groups"), JsArray::new(ctx), false, ctx)
            .expect("Failed to set groups");
        obj.set(js_string!("alone"), JsArray::new(ctx), false, ctx)
            .expect("Failed to set alone");

        let _ =
            ctx.register_global_property(js_string!("IKE_INTERNAL_TEST"), obj, Attribute::all());
    }
}

pub fn describe(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let obj = ctx
        .global_object()
        .get(js_string!("IKE_INTERNAL_TEST"), ctx)
        .expect("IKE_INTERNAL_TEST not found");

    let test = obj.as_object().expect("IKE_INTERNAL_TEST is not an object");

    if args.is_empty() {
        throw!(typ, "Expected arguments in describe");
    }
    let name = args.get(0).unwrap();
    assert_arg_type!(string, name);
    let func = args.get(1).unwrap();
    assert_arg_type!(function, func);

    let groups_val = test.get(js_string!("groups"), ctx).unwrap();
    let groups = JsArray::from_object(groups_val.as_object().unwrap().clone())
        .expect("groups is not an array");

    let group_obj = JsObject::default();
    group_obj.set(js_string!("name"), name.clone(), false, ctx)?;
    group_obj.set(js_string!("tests"), JsArray::new(ctx), false, ctx)?;

    groups.push(group_obj, ctx)?;

    test.set(
        js_string!("groups"),
        JsValue::from(groups.clone()),
        false,
        ctx,
    )?;
    let function =
        JsFunction::from_object(func.as_object().unwrap().clone()).expect("Function not found");

    function.call(&JsValue::undefined(), &[], ctx)?;

    Ok(JsValue::undefined())
}

// pub fn test_it(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
//     let obj = ctx
//         .global_object()
//         .get(js_string!("IKE_INTERNAL_TEST"), ctx)
//         .expect("IKE_INTERNAL_TEST not found");

//     let test = obj.as_object().expect("IKE_INTERNAL_TEST is not an object");

//     if args.is_empty() {
//         throw!(typ, "Expected arguments in describe");
//     }
//     let name = args.get(0).unwrap();
//     assert_arg_type!(string, name);
//     let str_name = str_from_jsvalue!(name, ctx);
//     let func = args.get(1).unwrap();
//     assert_arg_type!(function, func);

//     let groups_val = test.get(js_string!("groups"), ctx).unwrap();
//     let group
// }
