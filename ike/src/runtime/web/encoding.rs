use std::fmt::{self, Debug};

use boa_engine::{
    class::{Class, ClassBuilder},
    error::JsNativeError,
    js_string,
    native_function::NativeFunction,
    object::builtins::{JsArrayBuffer, JsTypedArray, JsUint8Array},
    property::Attribute,
    Context, JsData, JsObject, JsResult, JsValue,
};
use boa_gc::{Finalize, GcRef, Trace};
use std::collections::HashMap;

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
                "Expected a string and a TypedArray or ArrayBuffer argument in encodeInto"
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
            Attribute::READONLY,
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

#[derive(Debug, PartialEq, Eq, Hash)]
pub enum EncodingLabel {
    Utf8,
    Ibm866,
    Iso88592,
    Iso88593,
    Iso88594,
    Iso88595,
    Iso88596,
    Iso88597,
    Iso88598,
    Iso88598I,
    Iso885910,
    Iso885913,
    Iso885914,
    Iso885915,
    Iso885916,
    Koi8R,
    Koi8U,
    Macintosh,
    Windows874,
    Windows1250,
    Windows1251,
    Windows1252, // Also known as ASCII and latin1
    Windows1253,
    Windows1254,
    Windows1255,
    Windows1256,
    Windows1257,
    Windows1258,
    XMacCyrillic,
    Big5,
    EucJp,
    Iso2022Jp,
    ShiftJis,
    EucKr,
    Utf16Be,
    Utf16Le,
    XUserDefined,
}

pub struct EncodingLabelMap {
    map: HashMap<EncodingLabel, &'static str>,
}

impl EncodingLabelMap {
    pub fn new() -> Self {
        let mut map = HashMap::new();
        map.insert(EncodingLabel::Utf8, "utf-8");
        map.insert(EncodingLabel::Utf16Le, "utf-16le");
        map.insert(EncodingLabel::Windows1252, "windows-1252");
        Self { map }
    }

    pub fn get(&self, label: EncodingLabel) -> Option<&&'static str> {
        self.map.get(&label)
    }
}

const UTF16_NAMES: &[&str] = &[
    "ucs-2",
    "utf-16",
    "unicode",
    "utf-16le",
    "csunicode",
    "unicodefeff",
    "iso-10646-ucs-2",
];

const UTF8_NAMES: &[&str] = &[
    "utf8",
    "utf-8",
    "unicode11utf8",
    "unicode20utf8",
    "x-unicode20utf8",
    "unicode-1-1-utf-8",
];

const LATIN1_NAMES: &[&str] = &[
    "l1",
    "ascii",
    "cp819",
    "cp1252",
    "ibm819",
    "latin1",
    "iso88591",
    "us-ascii",
    "x-cp1252",
    "iso8859-1",
    "iso_8859-1",
    "iso-8859-1",
    "iso-ir-100",
    "csisolatin1",
    "windows-1252",
    "ansi_x3.4-1968",
    "iso_8859-1:1987",
];

impl EncodingLabel {
    pub fn from_str(input: &str) -> Option<EncodingLabel> {
        let trimmed_input = input.trim();
        match trimmed_input.to_lowercase().as_str() {
            "l1" | "ascii" | "cp819" | "cp1252" | "ibm819" | "latin1" | "iso88591" | "us-ascii"
            | "x-cp1252" | "iso8859-1" | "iso_8859-1" | "iso-8859-1" | "iso-ir-100"
            | "csisolatin1" | "windows-1252" | "ansi_x3.4-1968" | "iso_8859-1:1987" => {
                Some(EncodingLabel::Windows1252)
            }

            "ucs-2" | "utf-16" | "unicode" | "utf-16le" | "csunicode" | "unicodefeff"
            | "iso-10646-ucs-2" => Some(EncodingLabel::Utf16Le),

            "utf8" | "utf-8" | "unicode11utf8" | "unicode20utf8" | "x-unicode20utf8"
            | "unicode-1-1-utf-8" => Some(EncodingLabel::Utf8),

            _ => None,
        }
    }
}

#[derive(Default, Trace, Finalize, JsData)]
pub struct TextDecoder {
    encoding: String,
    fatal: bool,
    ignore_bom: bool,
}

impl TextDecoder {
    pub fn new(encoding: String, fatal: bool, ignore_bom: bool) -> Self {
        Self {
            encoding,
            fatal,
            ignore_bom,
        }
    }

    pub fn decode(this: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
        let obj = this
            .as_object()
            .expect("TextDecoder.decode: 'this' is not an object");

        if args.is_empty() {
            return Err(JsNativeError::typ()
                .with_message("Expected a TypedArray or ArrayBuffer argument in decode")
                .into());
        }

        let input = args.get(0).unwrap().as_object().ok_or_else(|| {
            JsNativeError::typ()
                .with_message("Expected a TypedArray or ArrayBuffer argument in decode")
        })?;

        let typed_arr = JsTypedArray::from_object(input.clone()).unwrap();

        let arr_buf = typed_arr.buffer(ctx).unwrap();
        let arr_buf = JsArrayBuffer::from_object(arr_buf.as_object().unwrap().clone()).unwrap();
        let arr_buf = arr_buf.data();
        let data_block = arr_buf.as_deref().unwrap();
        let mut stream = false;

        if args.len() > 1 {
            let arg_1 = args.get(1).unwrap();
            if arg_1.is_object() {
                let options = arg_1.as_object().unwrap();
                if let Some(stream_opt) = options.get(js_string!("stream"), ctx).ok() {
                    if stream_opt.is_boolean() {
                        stream = stream_opt.as_boolean().unwrap();
                    } else if stream_opt.is_undefined() {
                    } else {
                        throw!(typ, "Invalid stream option provided in TextDecoder");
                    }
                }
            } else {
                throw!(typ, "Invalid options argument provided in TextDecoder");
            }
        }

        match Self::decode_slice(
            data_block,
            stream,
            obj.downcast_ref::<TextDecoder>().unwrap(),
            ctx,
        ) {
            Ok(result) => return Ok(result),
            Err(err) => {
                return Err(JsNativeError::typ()
                    .with_message(format!("Error decoding data: {}", err.to_string()))
                    .into())
            }
        }
    }

    // TODO: add support for fatal and ignoreBOM
    pub fn decode_slice(
        input: &[u8],
        stream: bool,
        decoder: GcRef<Self>,
        ctx: &mut Context,
    ) -> JsResult<JsValue> {
        match EncodingLabel::from_str(&decoder.encoding).unwrap() {
            // Latin1
            EncodingLabel::Windows1252 => {
                let mut output = String::new();
                for &byte in input {
                    output.push(char::from(byte));
                }
                Ok(JsValue::from(js_string!(output)))
            }
            EncodingLabel::Utf8 => {
                let mut data = Vec::new();
                data.extend_from_slice(input);

                match String::from_utf8(data.clone()) {
                    Ok(s) => Ok(JsValue::from(js_string!(s))),
                    Err(e) => {
                        if stream {
                            let valid_up_to = e.utf8_error().valid_up_to();
                            data = data[valid_up_to..].to_vec();
                            Ok(JsValue::from(js_string!(
                                String::from_utf8_lossy(&data).to_string()
                            )))
                        } else {
                            throw!(typ, "Invalid UTF-8 data");
                        }
                    }
                }
            }
            EncodingLabel::Utf16Le => {
                let mut data = Vec::new();
                data.extend_from_slice(input);
                let mut output = String::new();
                let mut iter = data.iter().copied().peekable();
                while let Some(byte) = iter.next() {
                    let next_byte = iter.peek().copied();
                    if next_byte.is_none() {
                        if stream {
                            data.clear();
                            data.push(byte);
                            break;
                        } else {
                            throw!(typ, "Invalid UTF-16 data");
                        }
                    }
                    let code_unit = u16::from_le_bytes([byte, next_byte.unwrap()]);
                    output.push(std::char::from_u32(code_unit as u32).unwrap());
                    iter.next();
                }
                Ok(JsValue::from(js_string!(output)))
            }
            _ => {
                throw!(typ, "Unsupported encoding label in TextDecoder");
            }
        }
    }

    pub fn pasrse_args(args: &[JsValue], ctx: &mut Context) -> JsResult<(String, bool, bool)> {
        let mut encoding = "utf-8".to_string();
        let mut fatal_bool = false;
        let mut ignore_bom_bool = false;

        if !args.is_empty() {
            let arg_0 = args.get(0).unwrap();

            if arg_0.is_string() {
                let arg_val = arg_0.to_string(ctx)?.to_std_string().unwrap();
                if let Some(_encoding) = EncodingLabel::from_str(&arg_val) {
                    encoding = arg_val;
                } else {
                    throw!(typ, format!("Unsupported encoding label: {}", arg_val));
                }
            } else if arg_0.is_undefined() {
            } else {
                throw!(typ, "Invalid encoding argument provided in TextDecoder");
            }

            if args.len() >= 2 {
                let arg_1 = args.get(1).unwrap();

                if arg_1.is_object() {
                    let options = arg_1.as_object().unwrap();

                    if let Some(fatal) = options.get(js_string!("fatal"), ctx).ok() {
                        if fatal.is_boolean() {
                            fatal_bool = fatal.as_boolean().unwrap();
                        } else if fatal.is_undefined() {
                        } else {
                            throw!(typ, "Invalid fatal option provided in TextDecoder");
                        }
                    }

                    if let Some(ignore_bom) = options.get(js_string!("ignoreBOM"), ctx).ok() {
                        if ignore_bom.is_boolean() {
                            ignore_bom_bool = ignore_bom.as_boolean().unwrap();
                        } else if ignore_bom.is_undefined() {
                        } else {
                            throw!(typ, "Invalid ignoreBOM option provided in TextDecoder");
                        }
                    }
                } else {
                    throw!(typ, "Invalid options argument provided in TextDecoder");
                }
            }
        }

        Ok((encoding, fatal_bool, ignore_bom_bool))
    }
}

impl Class for TextDecoder {
    const NAME: &'static str = "TextDecoder";
    const LENGTH: usize = 0;

    fn data_constructor(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<Self> {
        let (encoding, fatal, ignore_bom) = Self::pasrse_args(args, ctx)?;
        Ok(TextDecoder::new(encoding, fatal, ignore_bom))
    }

    fn object_constructor(
        instance: &JsObject,
        args: &[JsValue],
        context: &mut Context,
    ) -> JsResult<()> {
        let (encoding, fatal, ignore_bom) = Self::pasrse_args(args, context)?;

        instance.set(
            js_string!("encoding"),
            JsValue::from(js_string!(encoding)),
            false,
            context,
        )?;

        instance.set(js_string!("fatal"), JsValue::from(fatal), false, context)?;

        instance.set(
            js_string!("ignoreBOM"),
            JsValue::from(ignore_bom),
            false,
            context,
        )?;

        Ok(())
    }

    fn init(class: &mut ClassBuilder<'_>) -> JsResult<()> {
        class.method(
            js_string!("decode"),
            1,
            NativeFunction::from_fn_ptr(Self::decode),
        );

        Ok(())
    }
}

impl Debug for TextDecoder {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "TextDecoder({}, {}, {})",
            self.encoding, self.fatal, self.ignore_bom
        )
    }
}
