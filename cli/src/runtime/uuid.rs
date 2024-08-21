use boa_engine::{
    js_string,
    object::builtins::{JsArrayBuffer, JsTypedArray, JsUint8Array},
    Context, JsNativeError, JsResult, JsValue,
};
use ike_core::throw;

pub fn uuid_parse(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let uuid = args.get(0).unwrap();
    let uuid = uuid.to_string(ctx)?;

    let uuid = uuid.to_std_string().unwrap();
    let parsed_uuid = match uuid::Uuid::try_parse(uuid.as_str()) {
        Ok(uuid) => uuid,
        Err(err) => throw!(err, "Failed to parse UUID: {}", err.to_string()),
    };

    let arr_buf = JsArrayBuffer::from_byte_block(parsed_uuid.as_bytes().to_vec(), ctx)
        .expect("Failed to create ArrayBuffer");

    let uint8_arr =
        JsUint8Array::from_array_buffer(arr_buf, ctx).expect("Failed to construct Uint8Array");

    Ok(JsValue::from(uint8_arr))
}

pub fn uuid_stringify(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let arr = args.get(0).unwrap();
    let obj = arr.as_object().unwrap();
    let typed_arr = JsTypedArray::from_object(obj.clone());

    if typed_arr.is_err() {
        throw!(err, "Expected ArrayBuffer, TypedArray");
    }

    let typed_arr = typed_arr.unwrap();
    let arr_buf = typed_arr.buffer(ctx).unwrap();
    let arr_buf = JsArrayBuffer::from_object(arr_buf.as_object().unwrap().clone())?;
    let arr_buf = arr_buf.data();
    let data_block = arr_buf.as_deref().unwrap();

    let offset = args.get(1).unwrap().to_number(ctx).unwrap_or(0.0) as usize;

    let end = std::cmp::min(offset + 16, data_block.len());
    let data_block = &data_block[offset..end];

    let uuid = match uuid::Uuid::from_slice(data_block) {
        Ok(uuid) => uuid,
        Err(err) => throw!(err, "Failed to stringify UUID: {}", err.to_string()),
    };

    Ok(JsValue::from(js_string!(uuid.to_string())))
}

pub fn uuidv4(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<JsValue> {
    let uuid = uuid::Uuid::new_v4();

    Ok(JsValue::from(js_string!(uuid.to_string())))
}

pub fn uuidv5(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let namespace = args.get(0).unwrap().to_string(ctx)?;
    let name = args.get(1).unwrap().to_string(ctx)?;

    let name = name.to_std_string().unwrap();
    let namespace = namespace.to_std_string().unwrap();

    let namespace_type = match namespace.as_str() {
        "dns" => uuid::Uuid::NAMESPACE_DNS,
        "url" => uuid::Uuid::NAMESPACE_URL,
        "oid" => uuid::Uuid::NAMESPACE_OID,
        "x500" => uuid::Uuid::NAMESPACE_X500,
        _ => {
            let parsed_uuid = match uuid::Uuid::try_parse(namespace.as_str()) {
                Ok(uuid) => uuid,
                Err(err) => throw!(err, "Failed to parse UUID: {}", err.to_string()),
            };

            parsed_uuid
        }
    };
    let uuid = uuid::Uuid::new_v5(&namespace_type, name.as_bytes());

    Ok(JsValue::from(js_string!(uuid.to_string())))
}
