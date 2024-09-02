#![feature(let_chains)]
#![feature(async_closure)]

pub mod cli;
mod error;
pub mod format;
pub mod fs;
pub mod globals;
pub mod macros;
pub mod panic_handler;
pub mod runtime;
pub mod testing;
pub mod transpiler;
mod utils;
mod which;

use anyhow::Result;
use cli::cli::Cli;
use ike_logger::{elog, Logger};
use panic_handler::setup_panic_handler;

#[tokio::main(worker_threads = 16)]
async fn main() -> Result<()> {
    setup_panic_handler();

    // TODO: fix this
    // dotenvy::dotenv()?;

    let cli = Cli::new();
    match cli.run().await {
        Ok(_) => {}
        Err(e) => {
            elog!(error, "{}", e);
            std::process::exit(1);
        }
    }

    Ok(())
}
