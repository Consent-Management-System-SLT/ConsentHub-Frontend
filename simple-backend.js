const express = require("express");
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
});
