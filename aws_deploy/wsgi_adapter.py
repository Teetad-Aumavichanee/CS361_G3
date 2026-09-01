"""WSGI adapter translating AWS Lambda Function URL events to/from Flask."""

import base64
import io


def handle_lambda_request(app, event: dict, context) -> dict:
    """Translate Lambda Function URL Format 2.0 payload to WSGI and execute Flask.

    Handles:
    - HTTP methods, raw paths, query strings, and custom headers.
    - Base64-decoded bodies for multipart form file uploads.
    - Base64-encoded responses for binary file downloads (PDFs/images).
    - CORS headers on all responses and preflight OPTIONS.
    """
    http = event.get("requestContext", {}).get("http", {})
    method = http.get("method", "GET")
    raw_path = event.get("rawPath", "/")
    raw_query = event.get("rawQueryString", "")

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    }

    if method == "OPTIONS":
        return {"statusCode": 204, "headers": cors_headers, "body": ""}

    # Parse request body (decode base64 if binary upload)
    body_str = event.get("body", "")
    if event.get("isBase64Encoded", False) and body_str:
        body_bytes = base64.b64decode(body_str)
    elif body_str:
        body_bytes = body_str.encode("utf-8")
    else:
        body_bytes = b""

    # Construct standard WSGI environment dictionary
    headers = event.get("headers", {}) or {}
    server_name = headers.get("host", "lambda.local").split(":")[0]

    environ = {
        "REQUEST_METHOD": method,
        "SCRIPT_NAME": "",
        "PATH_INFO": raw_path,
        "QUERY_STRING": raw_query,
        "SERVER_NAME": server_name,
        "SERVER_PORT": "443",
        "SERVER_PROTOCOL": "HTTP/1.1",
        "wsgi.version": (1, 0),
        "wsgi.url_scheme": "https",
        "wsgi.input": io.BytesIO(body_bytes),
        "wsgi.errors": io.StringIO(),
        "wsgi.multithread": False,
        "wsgi.multiprocess": False,
        "wsgi.run_once": False,
        "CONTENT_LENGTH": str(len(body_bytes)),
    }

    for key, value in headers.items():
        key_upper = key.upper().replace("-", "_")
        if key_upper in ("CONTENT_TYPE", "CONTENT_LENGTH"):
            environ[key_upper] = value
        else:
            environ[f"HTTP_{key_upper}"] = value

    # Accumulate Flask WSGI response
    response_status = ["200 OK"]
    response_headers = []

    def start_response(status, headers_list, exc_info=None):
        response_status[0] = status
        response_headers.extend(headers_list)

    response_chunks = app(environ, start_response)
    response_body = b"".join(response_chunks)
    status_code = int(response_status[0].split()[0])

    out_headers = dict(cors_headers)
    content_type = "text/html; charset=utf-8"
    for k, v in response_headers:
        out_headers[k] = v
        if k.lower() == "content-type":
            content_type = v.lower()

    # Determine binary payloads (PDF, images, zip) for base64 encoding
    is_binary = any(t in content_type for t in ["pdf", "image", "octet-stream", "zip"])

    return {
        "statusCode": status_code,
        "headers": out_headers,
        "isBase64Encoded": is_binary,
        "body": base64.b64encode(response_body).decode("ascii") if is_binary else response_body.decode("utf-8", errors="replace"),
    }
