mod build;
mod utils;

use logger::{log, Logger};
use clap::{Parser, Subcommand};
use crate::build::build;
use anyhow::Result;

#[derive(Parser)]
#[clap(author, version, about = "Local rust CLI for easier development", long_about = None)]
#[clap(propagate_version = true)]
struct Cli {
    #[clap(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Build,
}


#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Build => {
            build().await?
        }
    }

    Ok(())
}
