// Thanks to https://github.com/jedel1043 for help with implementing timeouts

use boa_engine::{job::NativeJob, object::builtins::JsFunction, JsResult, JsValue};
use futures_util::future::{AbortHandle, Abortable};
use ike_function::ike_function;
use smol::Timer;
use std::sync::LazyLock;
use std::{collections::HashMap, sync::atomic::AtomicU32};
use std::{sync::Mutex, time::Duration};

struct Timeouts {}

impl Timeouts {
    pub fn get(id: u32) -> Option<AbortHandle> {
        let timeouts = unsafe { TIMEOUTS.lock().unwrap() };
        timeouts.get(&id).cloned()
    }

    pub fn remove(id: u32) {
        let mut timeouts = unsafe { TIMEOUTS.lock().unwrap() };
        timeouts.remove(&id);
    }
}

static mut TIMEOUTS: LazyLock<Mutex<HashMap<u32, AbortHandle>>> = LazyLock::new(Default::default);
static TIMER_ID: AtomicU32 = AtomicU32::new(0);

#[ike_function]
pub fn set_timeout_ex(#[function] callback: JsFunction, #[i32] delay: Option<i32>) {
    let delay = delay.unwrap_or(0);
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
    let (abort_handle, abort_registration) = AbortHandle::new_pair();
    {
        let mut timeouts = unsafe { TIMEOUTS.lock().unwrap() };
        timeouts.insert(timeout_id as u32, abort_handle);
    }

    let wait = async move {
        let result = Abortable::new(
            Timer::after(Duration::from_millis(delay as u64)),
            abort_registration,
        )
        .await;

        NativeJob::new(move |context| -> JsResult<JsValue> {
            if result.is_ok() {
                callback.call(&JsValue::undefined(), &params, context)?;
            }
            Timeouts::remove(timeout_id as u32);
            Ok(JsValue::undefined())
        })
    };

    ctx.job_queue().enqueue_future_job(Box::pin(wait), ctx);

    Ok(JsValue::from(timeout_id as i32))
}

#[ike_function]
pub fn clear_timeout_ex(#[i32] timeout_id_value: Option<i32>) {
    if let Some(timeout_id) = timeout_id_value {
        let timeout_id = timeout_id as u32;

        if let Some(handle) = Timeouts::get(timeout_id) {
            handle.abort()
            // the original timeout will remove the id from the timeouts list
        }
    }
    Ok(JsValue::undefined())
}
