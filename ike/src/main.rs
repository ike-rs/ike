pub mod cli;
pub mod fs;
pub mod macros;
pub mod panic_handler;
pub mod resolver;
pub mod runtime;

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
