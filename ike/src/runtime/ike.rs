use boa_engine::{js_str, object::ObjectInitializer, Context, JsData, JsObject};
use boa_gc::{Finalize, Trace};
use std::path::PathBuf;

use super::meta::Meta;

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct IkeGlobalObject {}

impl IkeGlobalObject {
    pub fn init(ctx: &mut Context, file: Option<&PathBuf>) -> JsObject {
        let obj = ObjectInitializer::with_native_data(Self::default(), ctx).build();

        if let Some(file) = file {
            let meta_property = Meta::init(ctx, file);
            obj.set(js_str!("meta"), meta_property, false, ctx).unwrap();
        }

        obj
    }
}
