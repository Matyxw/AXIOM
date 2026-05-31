use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    // Placeholder: lógica de negocio se añadirá en fases posteriores.
    let app = Router::new().route("/health", get(health_handler));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .expect("Failed to bind to port 3000");

    println!("Server listening on http://0.0.0.0:3000");

    axum::serve(listener, app)
        .await
        .expect("Server error");
}

async fn health_handler() -> &'static str {
    "OK"
}
