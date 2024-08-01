// const decoder = new TextDecoder("utf-8");
// const data = Ike.readFileSync("src/hello.txt");
// console.log(data[0])
// console.log("dwadaw")

const toml = Ike.parseToml(`
title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00

[database]
enabled = true
ports = [ 8000, 8001, 8002 ]
data = [ ["delta", "phi"], [3.14] ]
temp_targets = { cpu = 79.5, case = 72.0 }

[servers]

[servers.alpha]
ip = "10.0.0.1"
role = "frontend"

[servers.beta]
ip = "10.0.0.2"
role = "backend"
`)

console.log(toml)