export const serve = async (opts) => {
    let port = opts.port;

    if (port && typeof port !== "number") {
        throw new Error("Port must be a number");
    }
    port = port ? port : Ike.env.PORT ? Ike.env.PORT : 3000;
    console.log(port);

    start_server_ex(port);
};
