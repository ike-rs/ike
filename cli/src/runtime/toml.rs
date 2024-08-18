use crate::throw;
use boa_engine::object::builtins::{JsArray, JsDate};
use boa_engine::{js_string, Context, JsNativeError, JsObject, JsResult, JsValue};
use toml::value::Datetime;
use toml::{Table, Value};

pub fn construct_date(datetime: &Datetime, ctx: &mut Context) -> JsDate {
    let date = JsDate::new(ctx);

    let toml_date = datetime.date.unwrap();
    date.set_full_year(
        &[
            toml_date.year.into(),
            toml_date.month.into(),
            toml_date.day.into(),
        ],
        ctx,
    );
    let toml_time = datetime.time.unwrap();
    date.set_hours(
        &[
            toml_time.hour.into(),
            toml_time.minute.into(),
            toml_time.second.into(),
            toml_time.nanosecond.into(),
        ],
        ctx,
    );

    date
}

pub fn from_toml(toml: Table, ctx: &mut Context) -> JsResult<JsObject> {
    let obj = JsObject::default();
    for (key, value) in toml {
        match &value {
            Value::String(val) => {
                obj.set(
                    js_string!(key),
                    JsValue::from(js_string!(val.clone())),
                    false,
                    ctx,
                )
                .expect("Failed to set TOML string");
            }
            Value::Integer(val) => {
                obj.set(js_string!(key), JsValue::from(*val as f64), false, ctx)
                    .expect("Failed to set TOML integer");
            }
            Value::Boolean(val) => {
                obj.set(js_string!(key), JsValue::from(*val), false, ctx)
                    .expect("Failed to set TOML boolean");
            }
            Value::Float(val) => {
                obj.set(js_string!(key), JsValue::from(*val), false, ctx)
                    .expect("Failed to set TOML float");
            }
            Value::Datetime(val) => {
                let new_date = construct_date(&val, ctx);
                obj.set(js_string!(key), JsValue::from(new_date), false, ctx)
                    .expect("Failed to set TOML date");
            }
            Value::Table(val) => {
                let nested_obj = from_toml(val.clone(), ctx)?;
                obj.set(js_string!(key), JsValue::from(nested_obj), false, ctx)
                    .expect("Failed to set TOML table");
            }
            Value::Array(val) => {
                let js_array = convert_array(val, ctx)?;
                obj.set(js_string!(key), JsValue::from(js_array), false, ctx)
                    .expect("Failed to set TOML array");
            }
        }
    }

    Ok(obj)
}

fn convert_array(array: &[Value], ctx: &mut Context) -> JsResult<JsArray> {
    let js_array = JsArray::new(ctx);

    for (i, v) in array.iter().enumerate() {
        let js_value = match v {
            Value::String(val) => JsValue::from(js_string!(val.clone())),
            Value::Integer(val) => JsValue::from(*val as f64),
            Value::Boolean(val) => JsValue::from(*val),
            Value::Float(val) => JsValue::from(*val),
            Value::Datetime(val) => {
                let new_date = construct_date(val, ctx);
                JsValue::from(new_date)
            }
            Value::Table(val) => {
                let nested_obj = from_toml(val.clone(), ctx)?;
                JsValue::from(nested_obj)
            }
            Value::Array(val) => {
                let nested_array = convert_array(val, ctx)?;
                JsValue::from(nested_array)
            }
        };

        js_array.set(i as u32, js_value, false, ctx)?;
    }

    Ok(js_array)
}

pub fn parse_toml(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let arg = args.first();
    if arg.is_none() {
        throw!(typ, "Expected a string in parseTOML");
    }
    let arg = arg.unwrap().to_string(ctx)?;
    let content = arg.to_std_string_escaped();

    let toml = match content.parse::<Table>() {
        Ok(toml) => toml,
        Err(e) => {
            throw!(typ, format!("Failed to parse TOML: {}", e));
        }
    };

    let toml = match from_toml(toml, ctx) {
        Ok(toml) => toml,
        Err(e) => {
            throw!(typ, format!("Failed to convert TOML to JS object: {}", e));
        }
    };

    Ok(JsValue::from(toml))
}
