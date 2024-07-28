use boa_engine::{
    error::JsNativeError, job::NativeJob, object::builtins::JsFunction, Context, JsResult, JsValue,
};
use once_cell::sync::Lazy;
use smol::Timer;
use std::collections::HashMap;
use std::fmt::Debug;
use std::sync::atomic::AtomicU32;
use std::{
    fmt::Display,
    sync::{Arc, Mutex},
    time::Duration,
};

use crate::throw;

#[derive(Clone)]
struct TimeoutHandle {
    id: usize,
    cancelled: Arc<Mutex<bool>>,
}

impl TimeoutHandle {
    fn new(id: usize) -> Self {
        TimeoutHandle {
            id,
            cancelled: Arc::new(Mutex::new(false)),
        }
    }

    fn cancel(&self) {
        let mut cancelled = self.cancelled.lock().unwrap();
        *cancelled = true;
    }

    fn is_cancelled(&self) -> bool {
        *self.cancelled.lock().unwrap()
    }
}

impl Display for TimeoutHandle {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "TimeoutHandle({}, {})", self.id, self.is_cancelled())
    }
}

impl Debug for TimeoutHandle {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "TimeoutHandle({}, {})", self.id, self.is_cancelled())
    }
}

struct Timeouts {}

impl Timeouts {
    pub fn get(id: u32) -> Option<TimeoutHandle> {
        let timeouts = unsafe { TIMEOUTS.lock().unwrap() };
        timeouts.get(&id).cloned()
    }

    pub fn remove(id: u32) {
        let mut timeouts = unsafe { TIMEOUTS.lock().unwrap() };
        timeouts.remove(&id);
    }
}

// ! Something like this won't work. We have to fix it
// function myFunction() {
//   console.log("Hello, World!");
// }

// let timeoutId = setTimeout(myFunction, 3000);
// setTimeout(() => {
//   clearTimeout(timeoutId);
//   console.log("Timeout canceled!");
// }, 1000);

static mut TIMEOUTS: Lazy<Mutex<HashMap<u32, TimeoutHandle>>> = Lazy::new(|| Default::default());
static TIMER_ID: AtomicU32 = AtomicU32::new(0);

pub fn set_timeout(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let callback = args.get(0);
    if callback.is_none() {
        throw!(typ, "Expected callback in setTimeout")
    }

    let callback = callback.unwrap();
    let callback = callback.as_object().unwrap();
    let callback = JsFunction::from_object(callback.clone()).expect("Function not found");

    let delay = args.get(1);
    let delay = if let Some(delay_value) = delay {
        delay_value
    } else {
        let undefined_value = JsValue::undefined().clone();
        let binding = undefined_value;
        &binding.clone()
    };

    let delay = delay.to_i32(ctx).unwrap_or(0);

    // All args after 2 are passed to the callback
    let params = if args.len() >= 3 {
        args[2..].to_vec()
    } else {
        Vec::new()
    };
    if delay == 0 {
        // Execute immediately
        callback.call(&JsValue::undefined(), &params, ctx)?;

        return Ok(JsValue::undefined());
    }

    let timeout_id = TIMER_ID.fetch_add(1, std::sync::atomic::Ordering::Relaxed) as usize;
    let timeout_handle = TimeoutHandle::new(timeout_id);
    {
        let mut timeouts = unsafe { TIMEOUTS.lock().unwrap() };
        timeouts.insert(timeout_id as u32, timeout_handle.clone());
    }

    let wait = async move {
        if timeout_handle.is_cancelled() {
            return NativeJob::new(move |_| -> JsResult<JsValue> { Ok(JsValue::undefined()) });
        }
        Timer::after(Duration::from_millis(delay as u64)).await;

        if timeout_handle.is_cancelled() {
            return NativeJob::new(move |_| -> JsResult<JsValue> { Ok(JsValue::undefined()) });
        }

        NativeJob::new(move |context| -> JsResult<JsValue> {
            callback.call(&JsValue::undefined(), &params, context)?;
            Timeouts::remove(timeout_id as u32);
            Ok(JsValue::undefined())
        })
    };

    ctx.job_queue().enqueue_future_job(Box::pin(wait), ctx);

    Ok(JsValue::from(timeout_id as i32))
}

pub fn clear_timeout(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    if let Some(timeout_id_value) = args.get(0) {
        if let Ok(timeout_id) = timeout_id_value.to_i32(ctx) {
            let timeout_id = timeout_id as u32;

            if let Some(timeout) = Timeouts::get(timeout_id) {
                timeout.cancel();
                Timeouts::remove(timeout_id);
            }
        }
    }
    Ok(JsValue::undefined())
}
