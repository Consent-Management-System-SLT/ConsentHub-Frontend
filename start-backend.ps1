#!/usr/bin/env pwsh
# PowerShell script to start the comprehensive backend

Set-Location "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project"

Write-Host "🚀 Starting Comprehensive Backend..." -ForegroundColor Cyan
Write-Host "Directory: $(Get-Location)" -ForegroundColor Yellow

# Kill any existing node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start the backend
node comprehensive-backend.js
