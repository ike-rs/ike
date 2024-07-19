use anyhow::Result;
use boa_engine::{Context, Source};

use super::cli::Cli;

pub fn run_command(cli: Cli, sub_matches: &clap::ArgMatches) -> Result<()> {
    let entry = resolve_entry(cli, sub_matches)?;
    println!("Running script: {}", entry);
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

fn resolve_entry(cli: Cli, sub_matches: &clap::ArgMatches) -> Result<String> {
    if let Some(entry) = sub_matches.get_one::<String>("entry") {
        Ok(entry.clone())
    } else {
        println!("{:?}", cli.pkg);
        Ok("index.js".to_string())
    }
}
