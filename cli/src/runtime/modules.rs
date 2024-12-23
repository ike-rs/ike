use crate::transpiler::transpile;
use boa_engine::{
    js_string, module::ModuleLoader, Context, JsError, JsNativeError, JsResult, JsString, Module,
    Source,
};
use boa_gc::GcRefCell;
use oxc_resolver::{EnforceExtension, ResolveOptions, Resolver};
use rustc_hash::FxHashMap;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    vec,
};

#[derive(Debug, Default)]
pub struct IkeModuleLoader {
    module_map: GcRefCell<FxHashMap<PathBuf, Module>>,
    // root: PathBuf,
}

// ! js folder is generated by the unbuild package.
lazy_static::lazy_static! {
    static ref BUILTIN_MODULES: HashMap<&'static str, String> = {
        let mut m = HashMap::new();
        m.insert("@std/buffer", include_str!("js/buffer/index.js").to_string());
        m.insert("@std/test", include_str!("js/test/index.js").to_string());
        m.insert("@std/assert", include_str!("js/assert/index.js").to_string());
        m.insert("@std/inspect", include_str!("js/inspect/index.js").to_string());
        m.insert("@std/_internal_", include_str!("js/_internal_/index.js").to_string());
        m.insert("@std/path", include_str!("js/path/index.js").to_string());
        m.insert("@std/format", include_str!("js/format/index.js").to_string());
        m.insert("@std/streams", include_str!("js/streams/index.js").to_string());
        m.insert("@std/uuid", include_str!("js/uuid/index.js").to_string());
        m
    };
}

impl IkeModuleLoader {
    pub fn new<P: AsRef<Path>>(root: P) -> JsResult<Self> {
        let root = root.as_ref();
        let _ = root.canonicalize().map_err(|e| {
            JsNativeError::typ()
                .with_message(format!("could not set module root `{}`", root.display()))
                .with_cause(JsError::from_opaque(js_string!(e.to_string()).into()))
        })?;
        Ok(Self {
            // root: absolute,
            module_map: GcRefCell::default(),
        })
    }

    #[inline]
    pub fn insert(&self, path: PathBuf, module: Module) {
        self.module_map.borrow_mut().insert(path, module);
    }

    #[inline]
    pub fn get(&self, path: &Path) -> Option<Module> {
        self.module_map.borrow().get(path).cloned()
    }
}

impl ModuleLoader for IkeModuleLoader {
    fn load_imported_module(
        &self,
        referrer: boa_engine::module::Referrer,
        specifier: JsString,
        finish_load: Box<dyn FnOnce(JsResult<Module>, &mut Context)>,
        context: &mut Context,
    ) {
        let spec = specifier.to_std_string_escaped();

        if is_builtin_module(&spec) {
            let bytes = BUILTIN_MODULES.get(spec.as_str()).unwrap().as_bytes();
            let source = Source::from_bytes(bytes);
            let module = Module::parse(source, None, context);

            finish_load(module, context);
        } else {
            if let Some(module) = self.get(Path::new(&spec)) {
                let result = (|| Ok(module))();

                return finish_load(result, context);
            }

            let ref_path = match referrer.path().unwrap().parent() {
                Some(parent) => parent,
                None => {
                    finish_load(
                        Err(JsNativeError::typ()
                            .with_message("Failed to get parent directory")
                            .into()),
                        context,
                    );
                    return;
                }
            };

            let options = ResolveOptions {
                enforce_extension: EnforceExtension::Disabled,
                condition_names: vec!["node".into(), "import".into()],
                extensions: vec![
                    ".js".into(),
                    ".mjs".into(),
                    ".ts".into(),
                    ".mts".into(),
                    ".cjs".into(),
                    ".cts".into(),
                ],
                ..ResolveOptions::default()
            };

            // TODO: implement our own resolver because of the difference in package.json and ike.toml
            match Resolver::new(options).resolve(ref_path, &spec) {
                Err(error) => println!("Error: {error}"),
                Ok(resolution) => {
                    let result = (|| -> JsResult<Module> {
                        let file = resolution.full_path();
                        let transpiled = transpile(&file)
                            .map_err(|err| {
                                JsNativeError::error()
                                    .with_message(err.to_string())
                                    .with_cause(JsError::from_opaque(
                                        js_string!(err.to_string()).into(),
                                    ))
                            })
                            .unwrap();

                        let reader =
                            Source::from_bytes(transpiled.as_bytes()).with_path(&Path::new(&file));
                        let module = Module::parse(reader, None, context)
                            .map_err(|err| {
                                JsNativeError::syntax()
                                    .with_message(format!("could not parse module `{spec}`"))
                                    .with_cause(err)
                            })
                            .unwrap();
                        self.insert(file, module.clone());
                        Ok(module)
                    })();

                    finish_load(result, context);
                }
            }
        }
    }

    fn register_module(&self, specifier: JsString, module: Module) {
        let path = PathBuf::from(specifier.to_std_string_escaped());

        self.insert(path, module);
    }

    fn get_module(&self, specifier: JsString) -> Option<Module> {
        let path = specifier.to_std_string_escaped();

        self.get(Path::new(&path))
    }
}

pub fn is_builtin_module(specifier: &str) -> bool {
    BUILTIN_MODULES.contains_key(specifier)
}
