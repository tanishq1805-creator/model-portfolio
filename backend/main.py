import sys
import os
import traceback

# Ensure both current directory and parent directory are in Python module search path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(1, parent_dir)

try:
    from app.main import app
except Exception as e:
    tb = traceback.format_exc()
    print("FATAL ERROR INITIALIZING FASTAPI APP:", tb)
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI(title="Error Fallback")
    
    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    def catch_all(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend initialization failed",
                "detail": str(e),
                "traceback": tb,
                "sys_path": sys.path,
                "cwd": os.getcwd()
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
