@echo off
setlocal
if not exist "%~dp0Velora.html" (
  echo Extract the full Velora download before starting.
  pause
  exit /b 1
)
start "" "%~dp0Velora.html"
