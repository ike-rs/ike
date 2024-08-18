use std::time::Duration;

pub fn format_time(time: Duration, include_brackets: bool) -> String {
    let millis = time.as_millis();
    let seconds = millis / 1000;
    let milliseconds = millis % 1000;

    if seconds > 0 {
        if include_brackets {
            format!("<d>[{}s {}ms]<r>", seconds, milliseconds)
        } else {
            format!("{}s {}ms", seconds, milliseconds)
        }
    } else if include_brackets {
        format!("<d>[{}ms]<r>", milliseconds)
    } else {
        format!("{}ms", milliseconds)
    }
}
