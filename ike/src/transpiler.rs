use crate::globals::CODE_TO_INJECT;
use anyhow::Result;
use ike_fs::read_to_string;
use ike_fs::FsError::FailedToReadFileWithError;
use oxc_allocator::Allocator;
use oxc_codegen::CodeGenerator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use oxc_transformer::{
    ArrowFunctionsOptions, ES2015Options, ReactOptions, TransformOptions, Transformer,
    TypeScriptOptions,
};
use std::path::PathBuf;

pub fn transpile_with_text(path: &PathBuf, source_text: String) -> Result<String> {
    let allocator = Allocator::default();
    let source_type = SourceType::from_path(path).unwrap();

    let ret = Parser::new(&allocator, &source_text, source_type).parse();

    if !ret.errors.is_empty() {
        for error in ret.errors {
            let error = error.with_source_code(source_text.clone());
            println!("{error:?}");
        }
    }

    let mut program = ret.program;
    let transform_options = TransformOptions {
        typescript: TypeScriptOptions::default(),
        es2015: ES2015Options {
            arrow_function: Some(ArrowFunctionsOptions::default()),
        },
        react: ReactOptions {
            ..Default::default()
        },
        ..Default::default()
    };
    let _ = Transformer::new(
        &allocator,
        path,
        source_type,
        &source_text,
        ret.trivias.clone(),
        transform_options,
    )
    .build(&mut program);
    let printed = CodeGenerator::new().build(&program).source_text;

    Ok(format!("{} \n {}", CODE_TO_INJECT, printed))
}

pub fn transpile(path: &PathBuf) -> Result<String> {
    let source_text = match read_to_string(path) {
        Ok(content) => content,
        Err(e) => {
            return Err(FailedToReadFileWithError(e.to_string()).into());
        }
    };

    transpile_with_text(path, source_text)
}
