use exposed::ExposedFunction;

pub mod exposed;
pub mod macros;
pub mod module;
pub mod promise;

pub trait ModuleTrait {
    fn js_files(&self) -> &'static [(&'static str, &'static str)];
    fn spec(&self) -> &'static str;
    fn exposed_functions(&self) -> &'static [ExposedFunction];
    fn cwd(&self) -> &'static str {
        env!("CARGO_MANIFEST_DIR")
    }
    fn name_for(&self, file: &'static str) -> String {
        format!("module:{}/{}", self.spec(), file)
    }
}
