use boa_engine::{
    js_string,
    object::{JsObject, ObjectInitializer},
    property::Attribute,
    Context, JsData,
};
use boa_gc::{Finalize, Trace};
use std::path::{Path, PathBuf};

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct Meta;

impl Meta {
    pub fn init(ctx: &mut Context, entry: &Path) -> JsObject {
        let file = entry.file_name().unwrap().to_str().unwrap();
        ObjectInitializer::with_native_data(Self, ctx)
            .property(
                js_string!("path"),
                js_string!(entry.to_str().unwrap()),
                Attribute::all(),
            )
            .property(
                js_string!("filename"),
                js_string!(entry.to_str().unwrap()),
                Attribute::all(),
            )
            .property(js_string!("file"), js_string!(file), Attribute::all())
            .property(
                js_string!("dir"),
                js_string!(entry.parent().unwrap().to_str().unwrap()),
                Attribute::all(),
            )
            .property(
                js_string!("dirname"),
                js_string!(entry.parent().unwrap().to_str().unwrap()),
                Attribute::all(),
            )
            .build()
    }
}
