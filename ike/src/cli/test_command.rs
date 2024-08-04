use crate::{
    globals::{ALLOWED_EXTENSIONS, VERSION},
    testing::tests::run_tests,
};
use std::path::Path;
use std::{fs::read_dir, path::PathBuf};

use super::cli::Cli;
use crate::error::IkeError::FailedToConvertPath;
use anyhow::Result;
use logger::{log, new_line, Logger};

// TODO: pattern handling
pub fn test_command(cli: Cli, sub_matches: &clap::ArgMatches) -> Result<()> {
    let root = cli.root;

    log!(info, "<cyan>{}<r> <d>{}<r>", VERSION, root.display());

    let pattern = sub_matches.get_one::<String>("pattern");
    let patterns: Vec<&str> = pattern
        .as_ref()
        .map(|p| p.split(',').collect())
        .unwrap_or_default();

    log!(
        info,
        "<d>patterns: <r>{}",
        patterns
            .iter()
            .map(|p| format!("<cyan>{}</r>", p))
            .collect::<Vec<String>>()
            .join(", ")
    );

    let glob_result = Scanner::scan(root.clone(), patterns)?;

    if glob_result.is_empty() {
        new_line!();
        log!(
            warn,
            "no test files found. files should have _spec, .spec, _test, .test in thier filename"
        );
    }
    new_line!();

    run_tests(glob_result, root).unwrap();

    Ok(())
}

struct Scanner;

impl Scanner {
    pub const NAME_SUFFIXES: [&'static str; 4] = ["_test", ".test", "_spec", ".spec"];

    pub fn is_test_file(path: &Path) -> bool {
        let ext = if let Some(ext) = path.extension() {
            ext.to_str().unwrap()
        } else {
            return false;
        };

        if !ALLOWED_EXTENSIONS.contains(&ext) {
            return false;
        }

        let stem = path.file_stem().unwrap().to_str().unwrap();

        Self::NAME_SUFFIXES.iter().any(|suffix| stem.ends_with(suffix))
    }

    pub fn scan(dir: PathBuf, patterns: Vec<&str>) -> Result<Vec<PathBuf>> {
        let mut paths = Vec::new();

        for file in read_dir(dir)? {
            let file = file?;
            let path = file.path();

            if let Some(path_str) = path.to_str() {
                if path_str.contains(".git")
                    || path_str.contains("node_modules")
                    || path_str.contains("target")
                {
                    continue;
                }
            } else {
                return Err(FailedToConvertPath.into());
            }

            if path.is_dir() {
                paths.extend(Self::scan(path, patterns.clone())?);
            } else if patterns.is_empty() && Self::is_test_file(&path) {
                paths.push(path);
            } else if Self::is_test_file(&path)
                && patterns
                    .iter()
                    .any(|p| path.file_stem().unwrap().to_str().unwrap().contains(p))
            {
                paths.push(path);
            }
        }

        Ok(paths)
    }
}
