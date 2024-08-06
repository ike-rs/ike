use boa_engine::object::builtins::JsArray;
use boa_engine::JsValue;

pub fn is_array(val: &JsValue) -> bool {
    if let Some(obj) = val.as_object() {
        JsArray::from_object(obj.clone()).is_ok()
    } else {
        false
    }
}
