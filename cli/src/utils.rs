use boa_engine::object::builtins::JsArray;
use boa_engine::JsValue;
use std::path::PathBuf;

pub fn is_array(val: &JsValue) -> bool {
    if let Some(obj) = val.as_object() {
        JsArray::from_object(obj.clone()).is_ok()
    } else {
        false
    }
}

pub fn compare_paths(path1: PathBuf, path2: PathBuf) -> bool {
    path1.components().eq(path2.components())
}
