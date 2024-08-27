use anyhow::{anyhow, Result};
use boa_engine::builtins::promise::ResolvingFunctions;
use boa_engine::object::builtins::JsPromise;
use boa_engine::{Context, JsNativeError, JsResult, JsString, JsValue};
use dir::get_recursive_flag;
use ike_core::module;
use ike_core::promise::base_promise;
use ike_core::throw;
use smol::block_on;
use std::env::current_dir;
use std::io::Read;
use std::path::{Component, Path, PathBuf};
use std::{fs, io};
use tokio::task::spawn_blocking;

pub mod dir;
pub mod files;

pub fn resolve_path_from_args(args: &[JsValue], ctx: &mut Context) -> JsResult<JsString> {
    let path = args.first();
    if path.is_none() || path.unwrap().is_undefined() {
        throw!(err, "Expected a path in fs function");
    }
    let path = path.unwrap();
    let path = path.to_string(ctx)?;
    Ok(path)
}

pub struct FileSystem {}

impl FileSystem {
    pub fn open_sync(path: &Path) -> anyhow::Result<File> {
        let file = open_file(path)?;
        Ok(File::new(file))
    }

    pub async fn open_async(path: &Path) -> anyhow::Result<File> {
        let file = open_file(path)?;
        Ok(File::new(file))
    }

    pub fn exists_sync(path: &Path) -> bool {
        path.exists()
    }

    pub fn remove(path: &Path, recursive: bool) -> std::io::Result<()> {
        let metadata = std::fs::symlink_metadata(path)
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

        let res = if metadata.is_dir() {
            if recursive {
                std::fs::remove_dir_all(path)
            } else {
                std::fs::remove_dir(path)
            }
        } else if metadata.is_symlink() {
            #[cfg(unix)]
            {
                fs::remove_file(path)
            }
            #[cfg(not(unix))]
            {
                use std::os::windows::prelude::MetadataExt;
                use winapi::um::winnt::FILE_ATTRIBUTE_DIRECTORY;
                if metadata.file_attributes() & FILE_ATTRIBUTE_DIRECTORY != 0 {
                    fs::remove_dir(path)
                } else {
                    fs::remove_file(path)
                }
            }
        } else {
            fs::remove_file(path)
        };

        res.map_err(Into::into)
    }

    pub async fn remove_async(path: &Path, recursive: bool) -> std::io::Result<()> {
        let path = path.to_owned();
        spawn_blocking(move || Self::remove(path.as_path(), recursive)).await?
    }

    pub fn create_dir(path: &Path, recursive: bool, mode: u32) -> std::io::Result<()> {
        let mut builder = fs::DirBuilder::new();
        builder.recursive(recursive);

        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;
            builder.mode(mode);
        }

        builder.create(path)
    }

    pub async fn create_dir_async(path: &Path, recursive: bool, mode: u32) -> std::io::Result<()> {
        let path = path.to_owned();
        spawn_blocking(move || Self::create_dir(path.as_path(), recursive, mode)).await?
    }

    pub fn create_file_sync(path: &Path) -> std::io::Result<fs::File> {
        fs::File::create(path)
    }

    pub async fn create_file_async(path: &Path) -> std::io::Result<fs::File> {
        let path = path.to_owned();
        spawn_blocking(move || fs::File::create(&path)).await?
    }
}

pub fn remove_sync_ex(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);
    let recursive = get_recursive_flag(args, ctx)?;

    match FileSystem::remove(path, recursive) {
        Ok(_) => Ok(JsValue::undefined()),
        Err(err) => Err(JsNativeError::error().with_message(err.to_string()).into()),
    }
}

pub fn remove_async_ex(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);
    let recursive = get_recursive_flag(args, ctx)?;

    let result = block_on(async {
        let result = FileSystem::remove_async(path, recursive)
            .await
            .map_err(|e| JsNativeError::error().with_message(e.to_string()))
            .err();
        let promise = JsPromise::new(
            |resolvers: &ResolvingFunctions, context| {
                if result.is_some() {
                    return Err(result.unwrap().into());
                }

                resolvers
                    .resolve
                    .call(&JsValue::undefined(), &[JsValue::undefined()], context)?;
                Ok(JsValue::undefined())
            },
            ctx,
        );

        let promise = base_promise(promise, ctx);

        Ok(promise.into())
    });

    result
}

pub fn exists_sync_ex(_: &JsValue, args: &[JsValue], ctx: &mut Context) -> JsResult<JsValue> {
    let str_path = resolve_path_from_args(args, ctx)?;
    let str_path = &str_path.to_std_string().unwrap();
    let path = Path::new(&str_path);

    Ok(JsValue::from(FileSystem::exists_sync(path)))
}

pub struct File {
    file: std::fs::File,
}

impl File {
    pub fn new(file: std::fs::File) -> Self {
        Self { file }
    }

    pub fn from_path(path: &Path) -> Result<Self, io::Error> {
        let file = open_file(path).unwrap();
        Ok(Self::new(file))
    }

    pub fn read_sync(mut self) -> Result<Vec<u8>, io::Error> {
        let mut buf = Vec::new();
        self.file.read_to_end(&mut buf)?;
        Ok(buf)
    }

    pub async fn read_async(self) -> Result<Vec<u8>, io::Error> {
        let mut file = self.file;
        let buf: Vec<u8> = spawn_blocking(move || {
            let mut buf = Vec::new();
            file.read_to_end(&mut buf)?;
            Ok::<Vec<u8>, io::Error>(buf)
        })
        .await??;

        Ok(buf)
    }
}

#[inline]
pub fn normalize_p<P: AsRef<Path>>(path: P) -> PathBuf {
    let mut components = path.as_ref().components().peekable();
    let mut ret = if let Some(c @ Component::Prefix(..)) = components.peek().cloned() {
        components.next();
        PathBuf::from(c.as_os_str())
    } else {
        PathBuf::new()
    };

    for component in components {
        match component {
            Component::Prefix(..) => unreachable!(),
            Component::RootDir => {
                ret.push(component.as_os_str());
            }
            Component::CurDir => {}
            Component::ParentDir => {
                ret.pop();
            }
            Component::Normal(c) => {
                ret.push(c);
            }
        }
    }
    ret
}

#[inline(always)]
pub fn open_file(path: &Path) -> Result<std::fs::File> {
    let path_bytes = path.as_os_str().as_encoded_bytes();
    let is_windows_device_path =
        cfg!(windows) && path_bytes.starts_with(br"\\.\") && !path_bytes.contains(&b':');
    let path = if is_windows_device_path {
        path.to_owned()
    } else if path.is_absolute() {
        normalize_p(path)
    } else {
        let cwd = current_dir()?;
        normalize_p(cwd.join(path))
    };

    let needs_canonicalization =
        !is_windows_device_path && (!cfg!(target_os = "linux") || path.starts_with("/proc"));
    let path = if needs_canonicalization {
        match path.canonicalize() {
            Ok(path) => path,
            Err(_) => {
                if let (Some(parent), Some(filename)) = (path.parent(), path.file_name()) {
                    parent.canonicalize()?.join(filename)
                } else {
                    return Err(anyhow!("Failed to canonicalize path"));
                }
            }
        }
    } else {
        path
    };

    std::fs::File::open(&path).map_err(Into::into)
}

module!(FsModule, "fs", js = ["fs.js"], exposed = {
    "remove_sync_ex" => remove_sync_ex,
    "remove_async_ex" => remove_async_ex,
    "exists_sync_ex" => exists_sync_ex,
    "create_dir_sync_ex" => dir::create_dir_sync_ex,
    "create_dir_async_ex" => dir::create_dir_async_ex,
    "create_file_sync_ex" => files::create_file_sync_ex,
    "create_file_async_ex" => files::create_file_async_ex,
    "read_text_file_sync_ex" => files::read_text_file_sync_ex,
    "read_text_file_async_ex" => files::read_text_file_async_ex,
    "read_file_async_ex" => files::read_file_async_ex,
    "read_file_sync_ex" => files::read_file_sync_ex,
},);
