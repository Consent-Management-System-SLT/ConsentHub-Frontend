# MongoDB Setup Script for ConsentHub
# This script helps you setup MongoDB for local development

Write-Host "🍃 ConsentHub MongoDB Setup" -ForegroundColor Green
Write-Host ""

# Check if MongoDB is installed
Write-Host "🔍 Checking MongoDB installation..." -ForegroundColor Yellow

$mongoInstalled = $false
$mongoPath = ""

# Check common MongoDB installation paths
$commonPaths = @(
    "C:\Program Files\MongoDB\Server\*\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\*\bin\mongo.exe",
    "C:\Program Files (x86)\MongoDB\Server\*\bin\mongod.exe"
)

foreach ($path in $commonPaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
    if ($found) {
        $mongoInstalled = $true
        $mongoPath = Split-Path $found[0].FullName -Parent
        break
    }
}

# Check if mongod is in PATH
if (!$mongoInstalled) {
    try {
        mongod --version >$null 2>&1
        if ($LASTEXITCODE -eq 0) {
            $mongoInstalled = $true
            $mongoPath = "mongod (in PATH)"
        }
    } catch {}
}

if ($mongoInstalled) {
    Write-Host "✅ MongoDB found: $mongoPath" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Please install MongoDB using one of these options:" -ForegroundColor Yellow
    Write-Host "   1. MongoDB Compass (Recommended): https://www.mongodb.com/products/compass" -ForegroundColor Cyan
    Write-Host "   2. MongoDB Community Server: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
    Write-Host "   3. Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Continue without MongoDB? (y/N)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        exit 1
    }
}

# Create data directory
Write-Host ""
Write-Host "📁 Setting up data directory..." -ForegroundColor Yellow

$dataPath = "C:\data\db"
if (!(Test-Path $dataPath)) {
    try {
        New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
        Write-Host "✅ Created data directory: $dataPath" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not create $dataPath. You may need to run as Administrator." -ForegroundColor Yellow
        $dataPath = "$env:USERPROFILE\mongodb-data"
        New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
        Write-Host "✅ Created data directory: $dataPath" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Data directory exists: $dataPath" -ForegroundColor Green
}

# Start MongoDB
Write-Host ""
Write-Host "🚀 Starting MongoDB..." -ForegroundColor Green

if ($mongoInstalled) {
    try {
        # Check if MongoDB is already running
        $mongoProcesses = Get-Process mongod -ErrorAction SilentlyContinue
        if ($mongoProcesses) {
            Write-Host "✅ MongoDB is already running (PID: $($mongoProcesses.Id -join ', '))" -ForegroundColor Green
        } else {
            Write-Host "Starting MongoDB server..." -ForegroundColor Yellow
            
            # Start MongoDB
            if ($mongoPath -eq "mongod (in PATH)") {
                Start-Process mongod -ArgumentList "--dbpath", $dataPath -WindowStyle Minimized
            } else {
                Start-Process "$mongoPath\mongod.exe" -ArgumentList "--dbpath", $dataPath -WindowStyle Minimized
            }
            
            # Wait for MongoDB to start
            Write-Host "⏳ Waiting for MongoDB to start..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
            
            # Test connection
            $attempts = 0
            $maxAttempts = 10
            $connected = $false
            
            while ($attempts -lt $maxAttempts -and !$connected) {
                try {
                    mongosh --eval "db.runCommand({ ping: 1 })" --quiet >$null 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        $connected = $true
                    }
                } catch {}
                
                if (!$connected) {
                    $attempts++
                    Start-Sleep -Seconds 2
                    Write-Host "   Attempt $attempts/$maxAttempts..." -ForegroundColor Cyan
                }
            }
            
            if ($connected) {
                Write-Host "✅ MongoDB started successfully!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  MongoDB may not have started properly. Check the MongoDB log." -ForegroundColor Yellow
            }
        }
        
        # Test connection and show connection info
        Write-Host ""
        Write-Host "🔗 Connection Information:" -ForegroundColor Cyan
        Write-Host "   URI: mongodb://localhost:27017/consenthub" -ForegroundColor White
        Write-Host "   Data Path: $dataPath" -ForegroundColor White
        
        # Initialize database with basic structure
        Write-Host ""
        Write-Host "🗄️  Initializing ConsentHub database..." -ForegroundColor Yellow
        
        $initScript = @"
use consenthub;

// Create collections with basic structure
db.createCollection('parties');
db.createCollection('consents');
db.createCollection('preferences');
db.createCollection('agreements');
db.createCollection('events');
db.createCollection('dsarRequests');

// Create basic indexes
db.parties.createIndex({ 'id': 1 }, { unique: true });
db.consents.createIndex({ 'partyId': 1 });
db.preferences.createIndex({ 'partyId': 1 });
db.events.createIndex({ 'eventTime': -1 });

// Insert sample admin user
db.users.insertOne({
    _id: ObjectId(),
    email: 'admin@sltmobitel.lk',
    password: '$2b$10$rOzJDKZOJzjNEqNgJzV8xOqUQ5F5qJzJ5qJzJ5qJzJ5qJzJ5qJzJ5',
    role: 'admin',
    name: 'System Administrator',
    createdAt: new Date(),
    status: 'active'
});

print('✅ Database initialized successfully');
"@
        
        $initScript | Out-File -FilePath "init-db.js" -Encoding UTF8
        
        try {
            mongosh consenthub init-db.js
            Remove-Item "init-db.js" -Force
            Write-Host "✅ Database initialized with basic structure" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not initialize database: $_" -ForegroundColor Yellow
            Remove-Item "init-db.js" -Force -ErrorAction SilentlyContinue
        }
        
    } catch {
        Write-Host "❌ Error starting MongoDB: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
        Write-Host "   1. Check if port 27017 is available: netstat -an | findstr :27017" -ForegroundColor Cyan
        Write-Host "   2. Run as Administrator if you get permission errors" -ForegroundColor Cyan
        Write-Host "   3. Check MongoDB logs in the data directory" -ForegroundColor Cyan
        Write-Host "   4. Try using MongoDB Compass instead" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  MongoDB not installed. Please install MongoDB first." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "   1. MongoDB should now be running on localhost:27017" -ForegroundColor White
Write-Host "   2. You can connect using MongoDB Compass or command line" -ForegroundColor White
Write-Host "   3. Run the ConsentHub application: npm run start:full" -ForegroundColor White
Write-Host ""

# Show MongoDB Compass connection if available
if (Get-Command "MongoDBCompass" -ErrorAction SilentlyContinue) {
    Write-Host "🧭 MongoDB Compass detected. You can also use the GUI to manage your database." -ForegroundColor Cyan
}

Write-Host "🎉 MongoDB setup complete!" -ForegroundColor Green

# Keep the window open
Read-Host "Press Enter to close..."
