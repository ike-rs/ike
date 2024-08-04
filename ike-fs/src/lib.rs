use std::fs::File;
use std::io::{ErrorKind, Read};
use std::path::PathBuf;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum FsError {
    #[error("File not found: {0}")]
    FileNotFound(PathBuf),
    #[error("Error opening file: {0}")]
    ErrorOpeningFile(PathBuf),
    #[error("Failed to read to string: {0}")]
    FailedToReadToString(PathBuf),
    #[error("Failed to read file: {0}")]
    FailedToReadFile(PathBuf),
    #[error("Failed to read file: {0}")]
    FailedToReadFileWithError(String),
}

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

pub fn read_to_string(file_path: &PathBuf) -> Result<String, FsError> {
    let mut file = match File::open(file_path) {
        Ok(file) => file,
        Err(e) => {
            return match e.kind() {
                ErrorKind::NotFound => Err(FsError::FileNotFound(file_path.clone())),
                _ => Err(FsError::ErrorOpeningFile(file_path.clone())),
            }
        }
    };

    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|_| FsError::FailedToReadToString(file_path.clone()))?;
    Ok(contents)
}
