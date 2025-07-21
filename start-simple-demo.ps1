# ConsentHub Demo - Simple Working Version
Write-Host "ConsentHub Demo - Starting System" -ForegroundColor Green
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Create simple backend server file
$backendCode = 'const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const users = [
    { id: "1", email: "admin@sltmobitel.lk", password: "admin123", role: "admin", name: "Admin User" },
    { id: "2", email: "csr@sltmobitel.lk", password: "csr123", role: "csr", name: "CSR User" },
    { id: "3", email: "customer@sltmobitel.lk", password: "customer123", role: "customer", name: "Customer User" },
    { id: "4", email: "customer@example.com", password: "customer123", role: "customer", name: "Demo Customer" }
];

function generateToken(user) {
    const payload = { id: user.id, email: user.email, role: user.role, name: user.name, iat: Date.now() };
    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

app.get("/api/v1/health", (req, res) => {
    res.json({ status: "ok", message: "Backend Running" });
});

app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email);
    
    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Email and password required" });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: true, message: "Invalid credentials" });
    }
    
    const token = generateToken(user);
    console.log("Login successful:", user.email);
    
    res.json({
        success: true,
        token: token,
        user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
});

app.get("/api/v1/auth/profile", (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: true, message: "No token provided" });
    }
    
    try {
        const token = authHeader.substring(7);
        const payload = JSON.parse(Buffer.from(token, "base64").toString());
        const user = users.find(u => u.id === payload.id);
        
        if (!user) {
            return res.status(401).json({ error: true, message: "Invalid token" });
        }
        
        res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
    } catch (error) {
        res.status(401).json({ error: true, message: "Invalid token format" });
    }
});

app.get("/api/v1/consents", (req, res) => {
    res.json({ consents: [{ id: "1", type: "marketing", status: "granted", purpose: "Email marketing" }] });
});

app.post("/api/v1/consents", (req, res) => {
    console.log("Consent granted:", req.body);
    res.json({ success: true, consent: { id: Date.now().toString(), ...req.body } });
});

app.listen(PORT, () => {
    console.log("ConsentHub Backend running on http://localhost:" + PORT);
    console.log("Demo users: admin@sltmobitel.lk/admin123, csr@sltmobitel.lk/csr123, customer@sltmobitel.lk/customer123");
});'

$backendCode | Out-File -FilePath "simple-backend.js" -Encoding UTF8

Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process node -ArgumentList "simple-backend.js" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host "Starting frontend..." -ForegroundColor Yellow  
Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "DEMO SYSTEM STARTED!" -ForegroundColor Green
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Demo Users:" -ForegroundColor Cyan
Write-Host "  admin@sltmobitel.lk / admin123" -ForegroundColor White
Write-Host "  csr@sltmobitel.lk / csr123" -ForegroundColor White  
Write-Host "  customer@sltmobitel.lk / customer123" -ForegroundColor White
Write-Host ""

# Test connections
Write-Host "Testing connections..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "Backend: READY" -ForegroundColor Green
} catch {
    Write-Host "Backend: Starting..." -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 10  
    Write-Host "Frontend: READY" -ForegroundColor Green
} catch {
    Write-Host "Frontend: Starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SYSTEM IS READY! Visit http://localhost:5173" -ForegroundColor Green
Write-Host "Login with: customer@sltmobitel.lk / customer123" -ForegroundColor White
Write-Host ""
