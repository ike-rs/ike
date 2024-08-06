#![feature(let_chains)]

pub mod cli;
mod error;
pub mod format;
pub mod fs;
pub mod globals;
pub mod macros;
pub mod panic_handler;
pub mod prepare;
pub mod runtime;
pub mod testing;
mod utils;
mod which;

use anyhow::Result;
use cli::cli::Cli;
use logger::{elog, Logger};
use panic_handler::setup_panic_handler;

#[tokio::main]
async fn main() -> Result<()> {
    setup_panic_handler();

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
