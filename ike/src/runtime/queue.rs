use futures_util::{stream::FuturesUnordered, StreamExt};
use smol::{future, LocalExecutor};
use std::{
    cell::{Cell, RefCell},
    collections::VecDeque,
};

use boa_engine::{
    job::{FutureJob, JobQueue, NativeJob},
    Context,
};

pub struct Queue<'a> {
    executor: LocalExecutor<'a>,
    futures: RefCell<FuturesUnordered<FutureJob>>,
    jobs: RefCell<VecDeque<NativeJob>>,
}

impl<'a> Queue<'a> {
    pub fn new(executor: LocalExecutor<'a>) -> Self {
        Self {
            executor,
            futures: RefCell::default(),
            jobs: RefCell::default(),
        }
    }
}

impl JobQueue for Queue<'_> {
    fn enqueue_promise_job(&self, job: NativeJob, _context: &mut Context) {
        self.jobs.borrow_mut().push_back(job);
    }

    fn run_jobs(&self, context: &mut Context) {
        if self.jobs.borrow().is_empty() && self.futures.borrow().is_empty() {
            return;
        }

        let context = RefCell::new(context);

        future::block_on(self.executor.run(async move {
            let finished = Cell::new(0b00u8);

            let fqueue = async {
                loop {
                    if self.futures.borrow().is_empty() {
                        finished.set(finished.get() | 0b01);
                        if finished.get() >= 0b11 {
                            return;
                        }
                        future::yield_now().await;
                        continue;
                    }
                    finished.set(finished.get() & 0b10);

                    let futures = &mut std::mem::take(&mut *self.futures.borrow_mut());
                    while let Some(job) = futures.next().await {
                        self.enqueue_promise_job(job, &mut context.borrow_mut());
                    }
                }
            };

            let jqueue = async {
                loop {
                    if self.jobs.borrow().is_empty() {
                        finished.set(finished.get() | 0b10);
                        if finished.get() >= 0b11 {
                            return;
                        }
                        future::yield_now().await;
                        continue;
                    };
                    finished.set(finished.get() & 0b01);

                    let jobs = std::mem::take(&mut *self.jobs.borrow_mut());
                    for job in jobs {
                        if let Err(e) = job.call(&mut context.borrow_mut()) {
                            eprintln!("Uncaught {e}");
                        }
                        future::yield_now().await;
                    }
                }
            };

            future::zip(fqueue, jqueue).await;
        }))
    }

    fn enqueue_future_job(&self, future: FutureJob, _context: &mut Context) {
        self.futures.borrow().push(future)
    }
}
