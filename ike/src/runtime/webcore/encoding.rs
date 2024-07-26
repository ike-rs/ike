use boa_engine::{
    class::{Class, ClassBuilder},
    error::JsNativeError,
    js_string,
    native_function::NativeFunction,
    object::builtins::{JsArrayBuffer, JsUint8Array},
    property::Attribute,
    Context, JsArgs, JsData, JsObject, JsResult, JsString, JsValue, Source,
};
use boa_gc::{Finalize, Trace};

use crate::throw;

#[derive(Debug, Trace, Finalize, JsData)]
pub struct TextEncoder;

impl TextEncoder {
    pub fn encode(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        if args.is_empty() {
            throw!(err, "Expected a string argument in encode");
        }

        let input = args
            .get(0)
            .unwrap()
            .to_string(ctx)?
            .to_std_string()
            .unwrap();

        let encoded = input.as_bytes().to_vec();
        let array_buffer = JsArrayBuffer::from_byte_block(encoded, ctx).unwrap();
        let uint8_array = JsUint8Array::from_array_buffer(array_buffer, ctx).unwrap();
        Ok(JsValue::from(uint8_array))
    }

    pub fn encode_into(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        if args.len() < 2 {
            throw!(
                err,
                "Expected a string and a Uint8Array argument in encodeInto"
            );
        }

        let input = args
            .get(0)
            .unwrap()
            .to_string(ctx)?
            .to_std_string()
            .unwrap();

        let buff = args.get(1).unwrap();
        let buffer = JsUint8Array::from_object(buff.as_object().unwrap().clone()).unwrap();

        let mut input_iter = input.chars();
        let mut buffer_index = 0;
        let mut read = 0;
        let mut written = 0;

        while let Some(c) = input_iter.next() {
            let mut buf = [0; 4];
            let encoded_char = c.encode_utf8(&mut buf);
            let encoded_len = encoded_char.len();

            if buffer_index + encoded_len > buffer.length(ctx).unwrap() {
                break;
            }

            for i in 0..encoded_len {
                buffer.set(buffer_index + i, JsValue::new(buf[i]), false, ctx)?;
            }
            buffer_index += encoded_len;
            read += c.len_utf8();
            written += encoded_len;
        }

        let result = JsObject::default();
        result.set(js_string!("read"), JsValue::new(read as u32), false, ctx)?;
        result.set(
            js_string!("written"),
            JsValue::new(written as u32),
            false,
            ctx,
        )?;
        Ok(JsValue::from(result))
    }
}

impl Class for TextEncoder {
    const NAME: &'static str = "TextEncoder";
    const LENGTH: usize = 0;

    fn data_constructor(_: &JsValue, _: &[JsValue], _: &mut Context) -> JsResult<Self> {
        Ok(TextEncoder {})
    }

    fn init(class: &mut ClassBuilder<'_>) -> JsResult<()> {
        class.static_property(
            js_string!("encoding"),
            js_string!("utf-8"),
            Attribute::WRITABLE | Attribute::ENUMERABLE | Attribute::PERMANENT,
        );

        class.method(
            js_string!("encode"),
            1,
            NativeFunction::from_fn_ptr(Self::encode),
        );

        class.method(
            js_string!("encodeInto"),
            2,
            NativeFunction::from_fn_ptr(Self::encode_into),
        );

        Ok(())
    }
}
