use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::PathBuf};

#[derive(Serialize, Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct PackageJson {
    pub name: String,
    pub version: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub keywords: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub homepage: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bugs: Option<PackageBugs>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub license: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<PackagePeople>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub contributors: Option<Vec<PackagePeople>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maintainers: Option<Vec<PackagePeople>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub funding: Option<Vec<PackageFunding>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub files: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub main: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub browser: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bin: Option<PackageBin>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub man: Option<PackageMan>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub directories: Option<PackageDirectories>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repository: Option<PackageRepository>,
    pub scripts: HashMap<String, String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub config: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dependencies: Option<PackageDependencies>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dev_dependencies: Option<PackageDependencies>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub peer_dependencies: Option<PackageDependencies>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub peer_dependencies_meta: Option<HashMap<String, HashMap<String, bool>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bundled_dependencies: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub optional_dependencies: Option<PackageDependencies>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub overrides: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub engines: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub os: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cpu: Option<Vec<String>>,
    #[serde(default)]
    pub private: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub publish_config: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub workspaces: Option<Vec<String>>,
    pub r#type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub types: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub typings: Option<String>,
    #[serde(flatten)]
    pub unknowns: HashMap<String, serde_json::Value>,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum PackageBugs {
    Url(String),
    Record(PackageBugsRecord),
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct PackageBugsRecord {
    pub url: String,
    pub email: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum PackagePeople {
    Literal(String),
    Record(PackagePeopleRecord),
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct PackagePeopleRecord {
    pub name: String,
    pub email: Option<String>,
    pub url: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum PackageFunding {
    Url(String),
    Record(PackageFundingRecord),
    Slice(Vec<PackageFundingRecord>),
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct PackageFundingRecord {
    pub r#type: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum PackageBin {
    Literal(String),
    Record(HashMap<String, String>),
}

#[derive(Serialize, Deserialize, Debug)]
pub enum PackageMan {
    Literal(String),
    Slice(Vec<String>),
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct PackageDirectories {
    pub bin: Option<String>,
    pub man: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct PackageRepository {
    pub r#type: String,
    pub url: String,
}

pub type PackageDependencies = HashMap<String, String>;

// Manager

#[derive(Debug)]
pub struct PackageManager {
    pub package_json: PackageJson,
    pub file_path: Option<PathBuf>,
}

impl PackageManager {
    pub fn from_file(file_path: PathBuf) -> Self {
        let package_json = match std::fs::read_to_string(&file_path) {
            Ok(content) => match serde_json::from_str(&content) {
                Ok(package_json) => package_json,
                Err(e) => {
                    eprintln!("Error: {}", e);
                    std::process::exit(1);
                }
            },
            Err(e) => {
                eprintln!("Error: {}", e);
                std::process::exit(1);
            }
        };

        Self {
            package_json,
            file_path: Some(file_path),
        }
    }
}
