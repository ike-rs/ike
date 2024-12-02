use std::io::IsTerminal;

use boa_engine::{object::ObjectInitializer, Context, JsData, JsObject, JsValue};
use boa_gc::{Finalize, Trace};

pub trait Terminal {
    fn init(ctx: &mut Context) -> JsObject;
    // fn write(&self, ctx: &mut Context, data: String);
    // fn read(&self, ctx: &mut Context) -> String;
    // fn clear(&self, ctx: &mut Context);
    fn is_terminal(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> bool;
}

#[derive(Debug, Default, Trace, Finalize, JsData)]
pub struct TerminalStdin {}

impl Terminal for TerminalStdin {
    fn init(ctx: &mut Context) -> JsObject {
        let mut obj = ObjectInitializer::with_native_data(Self::default(), ctx);
        obj.build()
    }

    fn is_terminal(_: &JsValue, _: &[JsValue], _: &mut Context) -> bool {
        std::io::stdin().is_terminal()
    }
}
