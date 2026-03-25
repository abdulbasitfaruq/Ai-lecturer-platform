import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    # 0.0.0.0 means the server is accessible from any IP address
    # reload=True enables auto-reloading on code changes. and "module_name:app_instance" format is used to specify the app.
    # Here, main is the module name (main.py) and app is the FastAPI instance.
    # You can run this script with: python run.py