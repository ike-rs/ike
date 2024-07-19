use std::path::PathBuf;

use anyhow::Result;
use chrono::{DateTime, Utc};
use clap::{Arg, ArgAction, Command, Parser, Subcommand};

use crate::resolver::package_json::PackageManager;

use super::{run_command::run_command, style};

#[derive(Clone, Debug)]
pub struct Cli {
    pub start_timestamp: DateTime<Utc>,
    pub root: Option<PathBuf>,
    pub pkg: Option<PackageManager>,
}

impl Cli {
    pub fn new() -> Self {
        Self {
            start_timestamp: Utc::now(),
            root: None,
            pkg: None,
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
                Command::new("run").about("Run a JavaScript file").args([
                    Arg::new("entry")
                        .help("name of the script.")
                        .required(false)
                        .num_args(1),
                    Arg::new("root_folder")
                        .short('r')
                        .long("root")
                        .help("Root directory of the project"),
                ]),
            )
            .next_display_order(800)
            .allow_external_subcommands(true)
            .styles(styles)
    }

    pub fn set_root(mut self, root: PathBuf) -> Self {
        self.root = Some(root);
        self
    }

    pub fn set_pkg(mut self, pkg: Option<PackageManager>) -> Self {
        self.pkg = pkg;
        self
    }

    pub async fn run(self) -> Result<()> {
        let matches = Self::construct_cli().get_matches();

        match matches.subcommand() {
            Some(("run", sub_matches)) => {
                let root = sub_matches
                    .get_one::<String>("root_folder")
                    .map(PathBuf::from)
                    .unwrap_or_else(|| std::env::current_dir().unwrap());
                let pkg = PackageManager::find_nearest_from(root.clone());

                run_command(self.set_root(root.clone()).set_pkg(pkg), sub_matches)?
            }
            _ => {}
        };

        Ok(())
    }
}
