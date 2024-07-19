use crate::utils::run_command_with_output;
use anyhow::Result;
use logger::{log, Logger};
use std::env;
use std::fs::create_dir_all;
use std::path::PathBuf;
use std::process::{Command, Stdio};

pub async fn build() -> Result<()> {
    log!(info, "Starting to build <cyan>ike<r> dependencies");

    build_icu()?;

    // build_js_core()?;

    Ok(())
}

fn build_js_core() -> Result<()> {
    log!(info, "Building <cyan>JavaScriptCore<r>");
    let current_dir = std::env::current_dir()?.parent().unwrap().to_path_buf();
    let cmake_build_dir = current_dir.join("deps\\WebKit");
    let icu4c_dir = current_dir.join("build\\icu");

    let include_flags = format!(
        "-I{}",
        icu4c_dir
            .join("include")
            .to_str()
            .unwrap()
            .replace("\\", "/")
    );

    let c_flags = include_flags.trim().to_owned();
    let cxx_flags = format!("-std=c++20 {}", include_flags).trim().to_owned();

    let icu_flag = format!(
        "-DICU_INCLUDE_DIR={} -DCMAKE_LIBRARY_PATH={}",
        icu4c_dir
            .join("include")
            .to_str()
            .unwrap()
            .replace(r#"\"#, "/"),
        icu4c_dir.join("lib").to_str().unwrap().replace(r#"\"#, "/")
    );

    let output_dir = current_dir
        .join("build\\WebKit")
        .to_str()
        .unwrap()
        .replace(r#"\"#, "/");

    let mut cmake_config = Command::new("cmake");
    cmake_config
        .arg("-DPORT=JSCOnly")
        .arg("-DENABLE_STATIC_JSC=ON")
        .arg("-DUSE_THIN_ARCHIVES=OFF")
        .arg("-DCMAKE_BUILD_TYPE=Release")
        .arg("-DENABLE_FTL_JIT=ON")
        .arg("-DENABLE_JIT=ON")
        .arg(format!("-DCMAKE_C_FLAGS='{}'", c_flags))
        .arg(format!("-DCMAKE_CXX_FLAGS='{}'", cxx_flags))
        .arg("-G")
        .arg("Ninja")
        .arg(format!("-B{}", output_dir))
        .arg(icu_flag)
        .current_dir(cmake_build_dir.clone())
        .stderr(Stdio::inherit())
        .stdin(Stdio::inherit())
        .stdout(Stdio::inherit());

    let icu4c_source = env::current_dir()
        .unwrap()
        .parent()
        .unwrap()
        .join("deps\\icu\\icu4c")
        .to_str()
        .unwrap()
        .replace(r#"\"#, "/");

    cmake_config.env("CMAKE_LIBRARY_PATH", icu4c_source);
    cmake_config.env("CC", "clang").env("CXX", "clang++");

    run_command_with_output(cmake_config)?;

    // let mut cmake_build = Command::new("cmake");
    // cmake_build
    //     .args(&["--build", ".", "--config", "Release", "--", "jsc"])
    //     .current_dir(cmake_build_dir.clone())
    //     .stderr(Stdio::inherit())
    //     .stdin(Stdio::inherit())
    //     .stdout(Stdio::inherit());

    // cmake_build.env("CC", "clang");
    // cmake_build.env("CXX", "clang++");

    // run_command_with_output(cmake_build);

    Ok(())
}

fn build_icu() -> Result<()> {
    log!(info, "Building <cyan>ICU<r> library");
    let current_dir = std::env::current_dir()?.parent().unwrap().to_path_buf();
    let icu_dir = current_dir.join("deps\\icu\\icu4c\\source");
    let icu_build_dir = current_dir.parent().unwrap().join("build\\icu");
    let build_display = icu_build_dir.to_str().unwrap().to_string();

    if !icu_dir.exists() {
        create_dir_all(&icu_dir)?;
    } else {
        let question = requestty::Question::confirm("anonymous")
            .message("ICU library already exists. Do you want to rebuild it?")
            .build();
        let result = requestty::prompt_one(question)?.as_bool().unwrap();

        if !result {
            log!(info, "Skipping building <cyan>ICU<r> library");
            return Ok(());
        }
    }

    let mut run_configure_icu = Command::new("sh");
    let target = if cfg!(target_os = "windows") {
        "MSYS/MSVC"
    } else if cfg!(target_os = "linux") {
        "Linux"
    } else if cfg!(target_os = "macos") {
        "MacOSX"
    } else {
        panic!("Unsupported target OS");
    };

    run_configure_icu
        .arg("runConfigureICU")
        .arg(target)
        .current_dir(&icu_dir)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());

    run_command_with_output(run_configure_icu)?;

    let mut make = Command::new("make");
    make.current_dir(&icu_dir)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());
    run_command_with_output(make)?;

    let mut install = Command::new("make");
    install
        .arg("install")
        .arg(format!("prefix={}", build_display))
        .current_dir(&icu_dir)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());
    run_command_with_output(install)?;

    Ok(())
}
