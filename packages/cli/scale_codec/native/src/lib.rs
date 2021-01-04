use neon::prelude::*;
use parity_scale_codec::{Compact, Decode, Encode};

struct DecodeResult<'a, W: Value + 'a> {
    data: Handle<'a, W>,
    take: u32,
}

fn convert_decode_result_to_js_object<'a, W: Value + 'a>(
    mut cx: CallContext<'a, neon::types::JsObject>,
    decode_result: DecodeResult<'a, W>,
) -> JsResult<'a, JsObject> {
    let object = JsObject::new(&mut cx);
    let data = decode_result.data;
    let take = JsNumber::new(&mut cx, decode_result.take);
    object.set(&mut cx, "data", data).unwrap();
    object.set(&mut cx, "take", take).unwrap();
    Ok(object)
}

fn as_buffer(mut cx: FunctionContext, bytes: Vec<u8>) -> JsResult<JsBuffer> {
    let buffer = JsBuffer::new(&mut cx, bytes.len() as u32)?;
    for (i, byte) in bytes.iter().enumerate() {
        let js_byte = cx.number((*byte) as f64);
        buffer.set(&mut cx, i as u32, js_byte)?;
    }
    Ok(buffer)
}

fn decode<T: Decode>(buf: &mut &[u8]) -> (T, u32) {
    let len_before = buf.len();
    let decoded = <T as Decode>::decode(buf).unwrap();
    let len_after = buf.len();
    let take = len_before - len_after;
    (decoded, take as u32)
}

fn encode_compact(mut cx: FunctionContext) -> JsResult<JsBuffer> {
    let number = cx.argument::<JsNumber>(0)?.value() as u32;
    let compact = Compact::<u32>(number);
    let encoded = compact.encode();
    as_buffer(cx, encoded)
}

fn decode_compact(mut cx: FunctionContext) -> JsResult<JsObject> {
    let buffer = cx.argument::<JsBuffer>(0)?;
    let mut encoded = cx.borrow(&buffer, |buffer| buffer.as_slice::<u8>());
    let (data, take) = decode::<Compact<u32>>(&mut encoded);
    let data = data.0;
    let decode_result = DecodeResult::<JsNumber> {
        data: JsNumber::new(&mut cx, data),
        take,
    };
    convert_decode_result_to_js_object(cx, decode_result)
}

fn encode_bool(mut cx: FunctionContext) -> JsResult<JsBuffer> {
    let boolean = cx.argument::<JsBoolean>(0)?.value();
    let encoded = boolean.encode();
    as_buffer(cx, encoded)
}

fn decode_bool(mut cx: FunctionContext) -> JsResult<JsObject> {
    let buffer = cx.argument::<JsBuffer>(0)?;
    let mut encoded = cx.borrow(&buffer, |buffer| buffer.as_slice::<u8>());
    let (data, take) = decode::<bool>(&mut encoded);
    let decode_result = DecodeResult::<JsBoolean> {
        data: JsBoolean::new(&mut cx, data),
        take,
    };
    convert_decode_result_to_js_object(cx, decode_result)
}

fn encode_address(mut cx: FunctionContext) -> JsResult<JsBuffer> {
    let mut s = cx.argument::<JsString>(0)?.value();
    if !s.is_ascii() {
        panic!("invalid address representation");
    }

    if s.starts_with("0x") || s.starts_with("0X") {
        if s.len() > 42 {
            panic!("invalid address representation")
        }
        s = s[2..].into();
    } else if s.len() > 40 {
        panic!("invalid address representation");
    }

    let mut addr = [0u8; 20];
    let bytes = s.as_bytes();
    let padding_len = 40 - bytes.len();
    for i in 0..addr.len() {
        let (low, high) = if i * 2 + 1 < padding_len {
            (0, 0)
        } else {
            (
                (bytes[i * 2 + 1 - padding_len] as char)
                    .to_digit(16)
                    .unwrap(),
                if i * 2 < padding_len {
                    0
                } else {
                    (bytes[i * 2 - padding_len] as char).to_digit(16).unwrap()
                },
            )
        };

        let digit = (high << 4) + low;
        addr[i] = digit as u8;
    }
    let encoded = addr.encode();
    as_buffer(cx, encoded)
}

fn decode_address(mut cx: FunctionContext) -> JsResult<JsObject> {
    let buffer = cx.argument::<JsBuffer>(0)?;
    let mut encoded = cx.borrow(&buffer, |buffer| buffer.as_slice::<u8>());
    let (data, take) = decode::<[u8; 20]>(&mut encoded);

    let mut address = String::with_capacity(42);
    address.push_str("0x");
    for digit in data.iter() {
        let low = digit & 0x0fu8;
        let high = digit >> 4;
        address.push(core::char::from_digit(high.into(), 16).unwrap());
        address.push(core::char::from_digit(low.into(), 16).unwrap());
    }
    let decode_result = DecodeResult::<JsString> {
        data: JsString::new(&mut cx, address),
        take,
    };
    convert_decode_result_to_js_object(cx, decode_result)
}

fn encode_string(mut cx: FunctionContext) -> JsResult<JsBuffer> {
    let string = cx.argument::<JsString>(0)?.value();
    let encoded = string.encode();
    as_buffer(cx, encoded)
}

fn decode_string(mut cx: FunctionContext) -> JsResult<JsObject> {
    let buffer = cx.argument::<JsBuffer>(0)?;
    let mut encoded = cx.borrow(&buffer, |buffer| buffer.as_slice::<u8>());
    let (data, take) = decode::<String>(&mut encoded);
    let decode_result = DecodeResult::<JsString> {
        data: JsString::new(&mut cx, data),
        take,
    };
    convert_decode_result_to_js_object(cx, decode_result)
}

macro_rules! integer_codec {
    ($($t:ty),+) => {
        $(
            paste::item! {
                fn [<encode_ $t>] (mut cx: FunctionContext) -> JsResult<JsBuffer> {
                    let number = cx.argument::<JsNumber>(0)?.value() as $t;
                    let encoded = number.encode();
                    as_buffer(cx, encoded)
                }

                fn [<decode_ $t>] (mut cx: FunctionContext) -> JsResult<JsObject> {
                    let buffer = cx.argument::<JsBuffer>(0)?;
                    let mut encoded = cx.borrow(&buffer, |buffer| buffer.as_slice::<u8>());
                    let (data, take) = decode::<$t>(&mut encoded);
                    let decode_result = DecodeResult::<JsNumber> {
                        data: JsNumber::new(&mut cx, data),
                        take,
                    };
                    convert_decode_result_to_js_object(cx, decode_result)
                }
            }
        )+
    };
}

integer_codec!(u8, u16, u32, i8, i16, i32);

register_module!(mut m, {
    m.export_function("encode_compact", encode_compact)?;
    m.export_function("decode_compact", decode_compact)?;
    m.export_function("encode_bool", encode_bool)?;
    m.export_function("decode_bool", decode_bool)?;
    m.export_function("encode_address", encode_address)?;
    m.export_function("decode_address", decode_address)?;
    m.export_function("encode_string", encode_string)?;
    m.export_function("decode_string", decode_string)?;
    m.export_function("encode_u8", encode_u8)?;
    m.export_function("decode_u8", decode_u8)?;
    m.export_function("encode_u16", encode_u16)?;
    m.export_function("decode_u16", decode_u16)?;
    m.export_function("encode_u32", encode_u32)?;
    m.export_function("decode_u32", decode_u32)?;
    m.export_function("encode_i8", encode_i8)?;
    m.export_function("decode_i8", decode_i8)?;
    m.export_function("encode_i16", encode_i16)?;
    m.export_function("decode_i16", decode_i16)?;
    m.export_function("encode_i32", encode_i32)?;
    m.export_function("decode_i32", decode_i32)
});
