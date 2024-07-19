pub mod cli;
pub mod fs;
pub mod panic_handler;
pub mod resolver;

use anyhow::Result;
use cli::cli::Cli;
use panic_handler::setup_panic_handler;

#[tokio::main]
async fn main() -> Result<()> {
    setup_panic_handler();

    let cli = Cli::new();

    match cli.run().await {
        Ok(_) => {}
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }

    Ok(())
}
