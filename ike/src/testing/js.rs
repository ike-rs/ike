use boa_engine::{
    js_string,
    object::builtins::{JsArray, JsFunction},
    property::Attribute,
    Context, JsNativeError, JsObject, JsResult, JsValue,
};

use crate::{assert_arg_type, throw};

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
    let current_path = ctx
        .global_object()
        .get(js_string!("Ike"), ctx)
        .unwrap()
        .as_object()
        .unwrap()
        .get(js_string!("meta"), ctx)
        .unwrap()
        .as_object()
        .unwrap()
        .get(js_string!("path"), ctx)
        .unwrap()
        .to_string(ctx)
        .unwrap();
    group_obj.set(js_string!("tests"), JsArray::new(ctx), false, ctx)?;
    group_obj.set(js_string!("path"), current_path, false, ctx)?;

    groups.push(group_obj, ctx)?;

    test.set(
        js_string!("groups"),
        JsValue::from(groups.clone()),
        false,
        ctx,
    )?;
    let function =
        JsFunction::from_object(func.as_object().unwrap().clone()).expect("Function not found");

    // Set a global var as a describe name
    let _ = ctx.global_object().set(
        js_string!("IKE_INTERNAL_DESCRIBE"),
        name.clone(),
        false,
        ctx,
    );

    function.call(&JsValue::undefined(), &[], ctx)?;

    // Remove the global var
    let _ = ctx.global_object().set(
        js_string!("IKE_INTERNAL_DESCRIBE"),
        JsValue::undefined(),
        false,
        ctx,
    );
    Ok(JsValue::undefined())
}

pub fn test_it(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let test = ctx
        .global_object()
        .get(js_string!("IKE_INTERNAL_TEST"), ctx)
        .expect("IKE_INTERNAL_TEST not found");

    let obj = test
        .as_object()
        .expect("IKE_INTERNAL_TEST is not an object");

    if args.is_empty() {
        throw!(typ, "Expected arguments in 'it'");
    }

    let name = args.get(0).unwrap();
    assert_arg_type!(string, name);
    let func = args.get(1).unwrap();
    assert_arg_type!(function, func);

    let test_obj = JsObject::default();
    test_obj.set(js_string!("name"), name.clone(), false, ctx)?;
    test_obj.set(js_string!("func"), func.clone(), false, ctx)?;

    let groups_temp = obj.get(js_string!("groups"), ctx)?;
    let groups_val = groups_temp.as_object().unwrap();
    let groups = JsArray::from_object(groups_val.clone()).expect("groups is not an array");

    let last_describe_name = ctx
        .global_object()
        .get(js_string!("IKE_INTERNAL_DESCRIBE"), ctx)
        .unwrap();

    if last_describe_name.is_undefined() {
        let alone_tests = obj.get(js_string!("alone"), ctx)?;
        let alone_tests_val = alone_tests.as_object().unwrap();
        let alone = JsArray::from_object(alone_tests_val.clone()).expect("alone is not an array");

        alone.push(test_obj, ctx)?;
        obj.set(js_string!("alone"), JsValue::from(alone), false, ctx)?;
    } else {
        let group = groups.get(groups.length(ctx)? - 1, ctx)?;
        let tests_val = group.as_object().unwrap().get(js_string!("tests"), ctx)?;
        let tests_obj = tests_val.as_object().unwrap();
        let tests = JsArray::from_object(tests_obj.clone()).expect("tests is not an array");

        tests.push(test_obj, ctx)?;
        group
            .as_object()
            .unwrap()
            .set(js_string!("tests"), JsValue::from(tests), false, ctx)?;
    }

    Ok(JsValue::undefined())
}
