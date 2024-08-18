use std::path::PathBuf;

use super::{run_command::run_command, style, test_command::test_command};
use crate::error::IkeError::FailedToParseRoot;
use crate::fs::normalize_path;
use anyhow::Result;
use chrono::{DateTime, Utc};
use clap::{Arg, Command};
use ike_toml::IkeToml;

#[derive(Clone, Debug)]
pub struct Cli {
    pub start_timestamp: DateTime<Utc>,
    pub root: PathBuf,
    pub pkg: Option<IkeToml>,
}

impl Cli {
    pub fn new() -> Self {
        Self {
            start_timestamp: Utc::now(),
            root: std::env::current_dir().unwrap(),
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
                Command::new("run")
                    .about("Run a JavaScript file")
                    .args([Arg::new("entry")
                        .help("name of the script.")
                        .required(false)
                        .num_args(1)])
                    .args(Self::global_args()),
            )
            .subcommand(
                Command::new("test")
                    .about("Run tests")
                    .args([Arg::new("pattern")
                        .help("Pattern to match test files")
                        .required(false)
                        .short('p')
                        .long("pattern")])
                    .args(Self::global_args()),
            )
            .next_display_order(800)
            .allow_external_subcommands(true)
            .styles(styles)
    }

    pub fn global_args() -> Vec<Arg> {
        vec![Arg::new("root_folder")
            .short('r')
            .long("root")
            .help("Root directory of the project")]
    }

    pub fn set_root(mut self, root: PathBuf) -> Self {
        self.root = root;
        self
    }

    pub fn set_pkg(mut self, pkg: Option<IkeToml>) -> Self {
        self.pkg = pkg;
        self
    }

    pub fn parse_root(&self, matches: &clap::ArgMatches) -> Result<PathBuf> {
        let mut root = matches
            .get_one::<String>("root_folder")
            .map(PathBuf::from)
            .unwrap_or_else(|| std::env::current_dir().unwrap());
        root = normalize_path(root, std::env::current_dir().unwrap())
            .map_err(|_| FailedToParseRoot)?;

        Ok(root)
    }

    pub async fn run(self) -> Result<()> {
        let matches = Self::construct_cli().get_matches();

        match matches.subcommand() {
            Some(("run", sub_matches)) => {
                let root = self.parse_root(sub_matches)?;
                let pkg = IkeToml::find_nearest_from(root.clone());

                run_command(self.set_root(root.clone()).set_pkg(pkg), sub_matches)?
            }
            Some(("test", sub_matches)) => {
                let root = self.parse_root(sub_matches)?;
                let pkg = IkeToml::find_nearest_from(root.clone());

                test_command(self.set_root(root.clone()).set_pkg(pkg), sub_matches)?
            }
            _ => {}
        };

        Ok(())
    }
}
