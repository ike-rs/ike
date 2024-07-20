use anyhow::{format_err, Result};
use regex::Regex;
use std::{
    fs::File,
    io::{ErrorKind, Read},
    path::{Path, PathBuf},
};

pub fn read_json<Json, FilePath>(file_path: FilePath) -> Result<Json>
where
    Json: serde::de::DeserializeOwned,
    FilePath: AsRef<Path>,
{
    let mut file = File::open(file_path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let serialized_json = serde_json::from_str(&contents);

    match serialized_json {
        Ok(json) => Ok(json),
        Err(error) => Err(format_err!(error)),
    }
}

pub fn find_nearest_file(dir: PathBuf, file_name: &str) -> Option<PathBuf> {
    let mut dir = PathBuf::from(dir);
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
        Err(e) => match e.kind() {
            ErrorKind::NotFound => {
                return Err(format_err!("File not found: {:?}", file_path));
            }
            _ => {
                return Err(format_err!("Error opening file: {:?}", e));
            }
        },
    };
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// Determine if a path is a file using regex
pub fn is_file(path: &str) -> bool {
    let re = Regex::new(r"\.[a-zA-Z0-9]+$").unwrap();
    re.is_match(path)
}
