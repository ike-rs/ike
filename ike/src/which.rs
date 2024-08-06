use std::env;
use std::fs;
use std::path::{Path, PathBuf};

pub fn which(command: &str, path: Option<String>, cwd: Option<PathBuf>) -> Option<PathBuf> {
    let path = path.unwrap_or_else(|| env::var("PATH").unwrap());

    let cmd_path = PathBuf::from(command);

    #[cfg(unix)]
    fn is_executable<P: AsRef<Path>>(path: P) -> bool {
        if let Ok(metadata) = fs::metadata(&path) {
            metadata.is_file() && metadata.permissions().mode() & 0o111 != 0
        } else {
            false
        }
    }

    #[cfg(windows)]
    fn is_executable<P: AsRef<Path>>(path: P) -> bool {
        if let Ok(metadata) = fs::metadata(&path) {
            if metadata.is_file() {
                if let Some(ext) = path.as_ref().extension() {
                    ext == "exe" || ext == "cmd" || ext == "bat" || ext == "com"
                } else {
                    false
                }
            } else {
                false
            }
        } else {
            false
        }
    }

    #[cfg(windows)]
    fn check_extensions<P: AsRef<Path>>(path: P) -> Option<PathBuf> {
        let extensions = ["exe", "cmd", "bat", "com"];
        for ext in extensions {
            let path_with_ext = path.as_ref().with_extension(ext);
            if is_executable(&path_with_ext) {
                return Some(path_with_ext);
            }
        }
        None
    }

    if let Some(cwd) = cwd {
        let cwd_cmd = cwd.join(&cmd_path);
        if is_executable(&cwd_cmd) {
            return Some(cwd_cmd);
        }

        #[cfg(windows)]
        if let Some(path_with_ext) = check_extensions(&cwd_cmd) {
            return Some(path_with_ext);
        }
    }

    for dir in env::split_paths(&path) {
        let full_path = dir.join(&cmd_path);
        if is_executable(&full_path) {
            return Some(full_path);
        }

        #[cfg(windows)]
        if let Some(path_with_ext) = check_extensions(&full_path) {
            return Some(path_with_ext);
        }
    }

    None
}
