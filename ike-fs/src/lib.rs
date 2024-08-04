use std::fs::File;
use std::io::{ErrorKind, Read};
use std::path::PathBuf;
use anyhow::{format_err, Result};

pub fn find_nearest_file(mut dir: PathBuf, file_name: &str) -> Option<PathBuf> {
    loop {
        let file_path = dir.join(file_name);
        if file_path.exists() {
            return Some(file_path);
        }

        if !dir.pop() {
            break;
        }
    }

    None
}

pub fn read_to_string(file_path: &PathBuf) -> Result<String> {
    let mut file = match File::open(file_path) {
        Ok(file) => file,
        Err(e) => {
            return match e.kind() {
                ErrorKind::NotFound => Err(format_err!("File not found: {:?}", file_path)),
                _ => Err(format_err!("Error opening file: {:?}", e)),
            }
        }
    };
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}
