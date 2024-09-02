use boa_engine::{Context, JsResult, JsValue, NativeFunction};
use futures_util::{stream::FuturesUnordered, Future};
use http_body_util::Full;
use hyper::body::Bytes;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Request, Response};
use hyper_util::rt::{TokioIo, TokioTimer};
use ike_core::exposed::AsyncFn;
use ike_core::module;
use ike_function::ike_function;
use std::convert::Infallible;
use std::net::SocketAddr;
use std::pin::Pin;
use tokio::{
    io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
    net::{TcpListener, TcpStream},
};

async fn handle_connection(mut stream: TcpStream) {
    //respond with 200 and hello world

    let mut buf_reader = BufReader::new(&mut stream);
    let mut request_line = String::new();
    buf_reader.read_line(&mut request_line).await.unwrap();

    println!("{}", request_line);

    let response = "HTTP/1.1 200 OK\r\n\r\nHello World!";
    stream.write_all(response.as_bytes()).await.unwrap();
}

async fn hello(_: Request<impl hyper::body::Body>) -> Result<Response<Full<Bytes>>, Infallible> {
    Ok(Response::new(Full::new(Bytes::from("Hello World!"))))
}

async fn start_server(
    _this: &JsValue,
    args: &[JsValue],
    context: &mut Context,
) -> JsResult<JsValue> {
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));

    let listener = TcpListener::bind(addr).await.unwrap();
    println!("Listening on: {}", addr);

    loop {
        let (tcp, _) = listener.accept().await.unwrap();
        let io = TokioIo::new(tcp);

        tokio::task::spawn(async move {
            if let Err(err) = http1::Builder::new()
                .timer(TokioTimer::new())
                .serve_connection(io, service_fn(hello))
                .await
            {
                println!("Error serving connection: {:?}", err);
            }
        });
    }
}

module!(
    HttpModule,
    "http",
    js = ["serve.js"],
    exposed_async = {
        "start_server_ex" => start_server
    }
);
