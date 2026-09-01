"""Lightweight WSGI adapter for AWS Lambda Function URL Format 2.0."""

import base64
import io
import urllib.parse


def handle_lambda_request(app, event, context):
    """Handle a Lambda Function URL Format 2.0 event with a WSGI Flask app."""
    http = event.get("requestContext", {}).get("http", {})
    method = http.get("method", "GET")
    raw_path = event.get("rawPath", "/")
    raw_query = event.get("rawQueryString", "")

    # Handle CORS preflight directly
    if method == "OPTIONS":
        return {
            "statusCode": 204,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
            },
            "body": "",
        }

    # Extract body bytes
    body_str = event.get("body", "")
    is_base64 = event.get("isBase64Encoded", False)
    if is_base64 and body_str:
        body_bytes = base64.b64decode(body_str)
    elif body_str:
        body_bytes = body_str.encode("utf-8")
    else:
        body_bytes = b""

    # Extract headers
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

    # Populate HTTP headers into WSGI environ
    for key, value in headers.items():
        key_upper = key.upper().replace("-", "_")
        if key_upper in ("CONTENT_TYPE", "CONTENT_LENGTH"):
            environ[key_upper] = value
        else:
            environ[f"HTTP_{key_upper}"] = value

    # WSGI response accumulator
    response_status = ["200 OK"]
    response_headers = []

    def start_response(status, headers_list, exc_info=None):
        response_status[0] = status
        response_headers.extend(headers_list)

    # Call Flask application
    response_chunks = app(environ, start_response)
    response_body_bytes = b"".join(response_chunks)

    # Parse status code
    status_code = int(response_status[0].split()[0])

    # Build response headers dictionary
    out_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    }
    content_type = "text/html; charset=utf-8"
    for k, v in response_headers:
        out_headers[k] = v
        if k.lower() == "content-type":
            content_type = v.lower()

    # Determine if response is binary (e.g. PDF, images, octet-stream)
    is_binary = any(
        t in content_type
        for t in ["pdf", "image", "octet-stream", "zip", "audio", "video"]
    )

    if is_binary:
        return {
            "statusCode": status_code,
            "headers": out_headers,
            "isBase64Encoded": True,
            "body": base64.b64encode(response_body_bytes).decode("ascii"),
        }
    else:
        return {
            "statusCode": status_code,
            "headers": out_headers,
            "isBase64Encoded": False,
            "body": response_body_bytes.decode("utf-8", errors="replace"),
        }
