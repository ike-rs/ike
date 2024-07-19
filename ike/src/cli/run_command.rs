use anyhow::Result;
use boa_engine::{Context, Source};

use super::cli::Cli;

pub fn run_command(mut cli: Cli, sub_matches: &clap::ArgMatches) -> Result<()> {
    let _entry = resolve_entry(sub_matches)?;
    let mut ctx = Context::default();
    let script = r#"
        const a = 1;
        const b = 2;
        a + b   
    "#;

    println!(
        "{}",
        ctx.eval(Source::from_bytes(script)).unwrap().display()
    );

    Ok(())
}

fn resolve_entry(sub_matches: &clap::ArgMatches) -> Result<String> {
    if let Some(entry) = sub_matches.get_one::<String>("entry") {
        Ok(entry.clone())
    } else {
        Ok("index.js".to_string())
    }
}
