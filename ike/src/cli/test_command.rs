use std::{fs::read_dir, path::PathBuf};

use crate::{
    globals::{ALLOWED_EXTENSIONS, VERSION},
    testing::tests::run_tests,
};

use super::cli::Cli;
use anyhow::Result;
use logger::{log, new_line, Logger};

// TODO: pattern handling
pub fn test_command(cli: Cli, _: &clap::ArgMatches) -> Result<()> {
    let root = cli.root;

    log!(info, "<cyan>{}<r> <d>{}<r>", VERSION, root.display());

    let glob_result = Scanner::scan(root.clone())?;

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
    pub const NAME_SUFIXES: [&'static str; 4] = ["_test", ".test", "_spec", ".spec"];

    pub fn is_test_file(path: &PathBuf) -> bool {
        let ext = path.extension().unwrap().to_str().unwrap();

        if !ALLOWED_EXTENSIONS.contains(&ext) {
            return false;
        }

        let stem = path.file_stem().unwrap().to_str().unwrap();

        Self::NAME_SUFIXES.iter().any(|sufix| stem.ends_with(sufix))
    }

    pub fn scan(dir: PathBuf) -> Result<Vec<PathBuf>> {
        let mut paths = Vec::new();

        for file in read_dir(dir)? {
            let file = file?;
            let path = file.path();

            if path.is_dir() {
                paths.extend(Self::scan(path)?);
            } else {
                if Self::is_test_file(&path) {
                    paths.push(path);
                }
            }
        }

        Ok(paths)
    }
}
