use std::path::PathBuf;

use anyhow::Result;
use ike_fs::FsError::FileNotFound;
use ike_logger::{elog, Logger};

use super::cli::Cli;
use crate::error::IkeError::CouldNotResolveEntry;
use crate::{fs::is_file, runtime::runtime::start_runtime};

pub fn run_command(cli: Cli, sub_matches: &clap::ArgMatches) -> Result<()> {
    let cli_entry = resolve_entry(cli.clone(), sub_matches)?;
    let entry = parse_entry(&cli_entry, cli.root)?;

    if entry.is_file {
        if entry.path.is_none() {
            panic!("Path is none");
        }
        let entry_path = entry.path.unwrap();

        if !entry_path.exists() {
            return Err(FileNotFound(entry_path).into());
        }

        match start_runtime(&entry_path, None) {
            Ok(_) => {}
            Err(e) => {
                elog!(error, "{}", e);
                std::process::exit(1);
            }
        }
    } else {
        // TODO: Implement execution of a script and global packages
    }

    Ok(())
}

fn resolve_entry(cli: Cli, sub_matches: &clap::ArgMatches) -> Result<String> {
    if let Some(entry) = sub_matches.get_one::<String>("entry") {
        Ok(entry.to_string())
    } else if let Some(pkg_entry) = cli
        .pkg
        .as_ref()
        .and_then(|pkg| pkg.toml.package.main.as_ref())
    {
        Ok(pkg_entry.clone())
    } else {
        Err(CouldNotResolveEntry.into())
    }
}

#[derive(Debug)]
pub struct Entry {
    pub is_file: bool,
    pub path: Option<PathBuf>,
    pub executable: Option<String>,
}

impl Entry {
    pub fn new(is_file: bool, path: Option<PathBuf>, executable: Option<String>) -> Self {
        Self {
            is_file,
            path,
            executable,
        }
    }
}

fn parse_entry(entry: &str, root: PathBuf) -> Result<Entry> {
    if is_file(entry) {
        let mut temp_path = PathBuf::from(entry);

        if temp_path.is_relative() {
            temp_path = root.join(temp_path);
        }

        Ok(Entry::new(true, Some(temp_path), None))
    } else {
        Ok(Entry::new(false, None, Some(entry.to_string())))
    }
}
