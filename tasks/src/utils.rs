use anyhow::Result;
use std::process::Command;

pub fn run_command_with_output(mut command: Command) -> Result<()> {
    let output = command.output()?;
    if !output.status.success() {
        eprintln!("Command failed with status: {}", output.status);
        if !output.stdout.is_empty() {
            eprintln!("stdout: {}", String::from_utf8_lossy(&output.stdout));
        }
        if !output.stderr.is_empty() {
            eprintln!("stderr: {}", String::from_utf8_lossy(&output.stderr));
        }
        anyhow::bail!("Command execution failed");
    }
    Ok(())
}
