use std::path::PathBuf;

use anyhow::Result;
use chrono::{DateTime, Utc};
use clap::{Arg, Command, Parser, Subcommand};

use super::{run_command::run_command, style};

#[derive(Clone, Debug)]
pub struct Cli {
    pub start_timestamp: DateTime<Utc>,
    pub root: Option<PathBuf>,
}

impl Cli {
    pub fn new() -> Self {
        Self {
            start_timestamp: Utc::now(),
            root: None,
        }
    }

    pub fn construct_cli() -> Command {
        let styles = {
            clap::builder::styling::Styles::styled()
                .header(style::HEADER)
                .usage(style::USAGE)
                .literal(style::LITERAL)
                .placeholder(style::PLACEHOLDER)
                .error(style::ERROR)
                .valid(style::VALID)
                .invalid(style::INVALID)
        };

        Command::new("ike")
            .version(env!("CARGO_PKG_VERSION"))
            .author(env!("CARGO_PKG_AUTHORS"))
            .about("Simple JavaScript runtime")
            .subcommand(
                Command::new("run")
                    .about("Run a JavaScript file")
                    .args([Arg::new("entry")
                        .help("name of the script.")
                        .required(true)
                        .num_args(1)]),
            )
            .arg(
                Arg::new("root")
                    .short('r')
                    .long("root")
                    .help("Root directory of the project"),
            )
            .next_display_order(800)
            .allow_external_subcommands(true)
            .styles(styles)
    }

    pub fn set_root(mut self, root: PathBuf) -> Self {
        self.root = Some(root);
        self
    }

    pub async fn run(self) -> Result<()> {
        let matches = Self::construct_cli().get_matches();

        let root = matches
            .get_one::<String>("root")
            .map(PathBuf::from)
            .unwrap_or_else(|| std::env::current_dir().unwrap());

        match matches.subcommand() {
            Some(("run", sub_matches)) => run_command(self.set_root(root.clone()), sub_matches)?,
            _ => {}
        };

        Ok(())
    }
}
