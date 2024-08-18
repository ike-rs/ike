use thiserror::Error;

#[derive(Error, Debug)]
pub enum IkeError {
    #[error("Could not resolve entry file. Please specify one as an <cyan>argument<r> or in the <cyan>main<r> field of the <cyan>ike.toml<r> file")]
    CouldNotResolveEntry,
    #[error("Failed to convert path to string")]
    FailedToConvertPath,
    #[error("Failed to parse project root")]
    FailedToParseRoot,
}
