use ike_fs::{find_nearest_file, read_to_string};
use ike_logger::{elog, Logger};
use serde::Deserialize;
use std::{collections::HashMap, path::PathBuf};
use thiserror::Error;

#[derive(Deserialize, Debug, Default, Clone)]
pub struct IkeTomlStruct {
    pub package: IkePackage,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dependencies: Option<HashMap<String, DependencyOrString>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "dev-dependencies")]
    pub dev_dependencies: Option<HashMap<String, DependencyOrString>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tasks: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exports: Option<HashMap<String, HashMap<String, String>>>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum DependencyOrString {
    Dependency(Dependency),
    String(String),
}

#[derive(Deserialize, Debug, Default, Clone)]
pub struct ParsedFeature {
    pub dependencies: HashMap<String, Dependency>,
    pub files: Vec<String>,
    pub depends_on: Option<Vec<String>>,
}

#[derive(Deserialize, Debug, Default, Clone)]
pub struct IkePackage {
    pub name: String,
    pub version: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub files: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub main: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub types: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repository: Option<PackageRepository>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exports: Option<HashMap<String, HashMap<String, String>>>,
}

#[derive(Deserialize, Debug, Default, Clone)]
pub struct PackageRepository {
    pub r#type: String,
    pub url: String,
}

#[derive(Debug, Clone)]
pub struct IkeToml {
    pub toml: ParsedIkeTomlStruct,
    pub file_path: Option<PathBuf>,
}

#[derive(Deserialize, Debug, Default, Clone)]
pub struct Dependency {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub git: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub branch: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rev: Option<String>,
}

#[derive(Deserialize, Debug, Default, Clone)]
pub struct Export {
    pub import: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub types: Option<String>,
}

#[derive(Debug, Default, Clone)]
pub struct ParsedIkeTomlStruct {
    pub package: IkePackage,
    pub dependencies: HashMap<String, Dependency>,
    pub dev_dependencies: HashMap<String, Dependency>,
    pub tasks: HashMap<String, String>,
    pub exports: Option<HashMap<String, Export>>,
}

#[derive(Debug, Error)]
pub enum IkeTomlError {
    #[error("Dependency {0} must have at least one of 'version', 'path', or 'git'")]
    MissingDependencyFields(String),
    #[error("Dependency {0} has conflicting fields: 'version', 'path', and 'git' cannot be used together")]
    ConflictingDependencyFields(String),
    #[error("Dependency {0} has conflicting fields: 'git', 'branch', 'rev', and 'path' cannot be used together")]
    ConflictingGitFields(String),
    #[error("Failed to parse dependencies: {0}")]
    FailedToParseDependencies(String),
}

impl IkeTomlStruct {
    fn parse_dependencies(
        &self,
        deps: Option<HashMap<String, DependencyOrString>>,
    ) -> Result<HashMap<String, Dependency>, IkeTomlError> {
        let mut parsed_deps = HashMap::new();

        if let Some(dependencies) = deps {
            for (name, dep_or_string) in dependencies {
                let dep = match dep_or_string {
                    DependencyOrString::Dependency(dep) => dep,
                    DependencyOrString::String(version) => Dependency {
                        version: Some(version),
                        path: None,
                        git: None,
                        branch: None,
                        rev: None,
                    },
                };

                if dep.version.is_none() && dep.path.is_none() && dep.git.is_none() {
                    return Err(IkeTomlError::MissingDependencyFields(name));
                }

                if (dep.version.is_some() && (dep.path.is_some() || dep.git.is_some()))
                    || (dep.path.is_some() && dep.git.is_some())
                {
                    return Err(IkeTomlError::ConflictingDependencyFields(name));
                }

                if dep.git.is_some()
                    && dep.branch.is_some()
                    && (dep.rev.is_some() || dep.path.is_some())
                {
                    return Err(IkeTomlError::ConflictingGitFields(name));
                }

                parsed_deps.insert(name, dep);
            }
        }

        Ok(parsed_deps)
    }

    pub fn to_parsed(self) -> Result<ParsedIkeTomlStruct, IkeTomlError> {
        let parsed_dependencies = self
            .parse_dependencies(self.dependencies.clone())
            .map_err(|e| IkeTomlError::FailedToParseDependencies(e.to_string()))?;

        let parsed_dev_dependencies = self
            .parse_dependencies(self.dev_dependencies.clone())
            .map_err(|e| IkeTomlError::FailedToParseDependencies(e.to_string()))?;

        let parsed_exports = self.exports.map(|exports| {
            exports
                .iter()
                .map(|(key, value)| {
                    (
                        key.clone(),
                        Export {
                            import: value.get("import").expect("Missing 'import' field").clone(),
                            types: value.get("types").cloned(),
                        },
                    )
                })
                .collect()
        });

        Ok(ParsedIkeTomlStruct {
            package: self.package,
            dependencies: parsed_dependencies,
            dev_dependencies: parsed_dev_dependencies,
            tasks: self.tasks.unwrap_or_default(),
            exports: parsed_exports,
        })
    }
}

impl IkeToml {
    pub fn from_file(file_path: PathBuf) -> Result<Self, IkeTomlError> {
        let toml_str = read_to_string(&file_path).expect("Could not read file");
        let serialized_toml: IkeTomlStruct = toml::from_str(&toml_str).unwrap();
        let parsed_toml = serialized_toml.to_parsed()?;

        Ok(Self {
            toml: parsed_toml,
            file_path: Some(file_path),
        })
    }

    pub fn find_nearest_from(dir: PathBuf) -> Option<Self> {
        let file_path = find_nearest_file(dir, "ike.toml");

        match file_path {
            Some(file_path) => {
                let toml = IkeToml::from_file(file_path);

                match toml {
                    Ok(toml) => Some(toml),
                    Err(e) => {
                        elog!(error, "{}", e);
                        None
                    }
                }
            }
            None => None,
        }
    }
}
