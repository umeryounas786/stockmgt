# 📦 Stock Management System - Complete Setup Guide

## System Requirements

- **Windows 10+** or **macOS** or **Linux**
- **Node.js** v14 or higher
- **MySQL Server** (5.7 or higher) - Community Edition or higher
- **npm** v6 or higher
- **4GB** RAM minimum
- **500MB** disk space

---

## Step-by-Step Setup Instructions

### Step 1: MySQL Server Installation & Configuration

#### On Windows:
1. Download **MySQL Community Server** from [MySQL official site](https://dev.mysql.com/downloads/mysql/)
2. Run the installer MSI file
3. Choose **Development Default** setup type
4. Configure MySQL Server as Windows Service
5. Port: 3306 (default)
6. Root password: `root`
7. Complete installation

#### On macOS:
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

#### On Linux:
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Verify MySQL Installation:
Open command prompt/terminal:
```bash
mysql -u root -p
# Enter password: root
# Should show: mysql>
```

Exit MySQL:
```sql
EXIT;
```

---

### Step 2: Project Setup

#### Option A: Using Windows Setup Script
```powershell
cd D:\download\StockMgt
.\setup.bat
```

#### Option B: Manual Setup
```bash
cd D:\download\StockMgt
npm install
```

---

### Step 3: Database Initialization

#### Using MySQL Command Line:
```bash
mysql -u root -p < D:\download\StockMgt\database\init.sql
# When prompted for password, enter: root
```

#### Or Open MySQL Interactive Mode:
```bash
mysql -u root -p
# Enter password: root
# Then paste the contents of database/init.sql
```

**Expected Output:**
```
Database initialized successfully!
```

---

### Step 4: Verify Environment Configuration

Check `.env` file contains:
```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=stock_mgt
DB_PORT=3306

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sales@laskontech.com
EMAIL_PASSWORD=6o/kQR1eF+Y
EMAIL_FROM=sales@laskontech.com
ALERT_EMAIL=ali.toolifykit@gmail.com

# Stock Alert
STOCK_ALERT_THRESHOLD=5

# JWT Secret
JWT_SECRET=stock_mgt_secret_key_2026
JWT_EXPIRE=7d

# App Configuration
PORT=3000
NODE_ENV=development
```

---

### Step 5: Start the Application

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

**Expected Output:**
```
✅ Server is running on http://localhost:3000
📧 Email alerts will be sent to: ali.toolifykit@gmail.com
⚠️  Stock alert threshold: 5
```

---

## Usage Guide

### 1. First Time Login

1. Open browser: `http://localhost:3000`
2. Click **"Register here"** link
3. Fill in registration form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test@123`
   - Confirm Password: `Test@123`
4. Click **Register**
5. Login with your credentials

### 2. Add Stock Item

1. After login, click **"+ Add Stock"** button
2. Fill in the form:
   - **Item Name**: (required) e.g., "Laptop"
   - **SKU**: (optional) e.g., "LP-001"
   - **Quantity**: (required) e.g., "10"
   - **Unit Price**: (required) e.g., "799.99"
   - **Category**: (required) e.g., "Electronics"
   - **Supplier**: (optional) e.g., "Tech Supplies Inc"
   - **Reorder Level**: (default: 5) Stock alert threshold
   - **Description**: (optional) Additional details
3. Click **"Save Item"**

### 3. View Stock Items

- Dashboard shows all stock items in a table
- **Status indicator** shows:
  - 🟢 **OK**: Above reorder level
  - 🟡 **LOW STOCK**: At or near reorder level
  - 🔴 **CRITICAL**: Zero stock

### 4. Edit Stock Item

1. Find item in table
2. Click **"Edit"** button
3. Modify details
4. Click **"Save Item"**

### 5. Delete Stock Item

1. Find item in table
2. Click **"Delete"** button
3. Confirm deletion

### 6. Low Stock Alerts

When stock falls below the threshold (default: 5):
- ✅ Email automatically sent to: `ali.toolifykit@gmail.com`
- ✅ Email includes: Item name, current quantity, timestamp
- ✅ Alert logged in database

---

## Email Alert Configuration

### How Alerts Work:
1. Admin updates stock quantity
2. System checks if quantity ≤ 5
3. If yes, email sent automatically
4. Email includes:
   - Item name and ID
   - Current stock level
   - Reorder threshold
   - Date and time

### Email Credentials (Already Configured):
```
From: sales@laskontech.com
To: ali.toolifykit@gmail.com
Server: smtp.gmail.com:587
```

### To Use Different Gmail Account:
1. Edit `.env` file
2. Update `EMAIL_USER` and `EMAIL_PASSWORD`
3. Restart the server

**Note:** If using personal Gmail with 2FA, use [App Passwords](https://support.google.com/accounts/answer/185833)

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
```
1. Verify MySQL Server is running
   - Windows: Services > MySQL Server
   - macOS: brew services list
   - Linux: sudo systemctl status mysql
2. Check username: root, password: root
3. Ensure database is initialized
4. Test connection: mysql -u root -p
5. Restart the application
```

### Issue: "Port 3000 already in use"
**Solution:**
```
1. Change PORT in .env to 3001, 3002, etc.
2. Or kill process using port 3000:
   - Windows: netstat -ano | findstr :3000
   - Kill process: taskkill /PID <PID> /F
```

### Issue: "Email not sending"
**Solution:**
```
1. Enable "Less secure apps" in Gmail
2. Or use App Password instead
3. Verify internet connection
4. Check firewall allows SMTP
```

### Issue: "Cannot find module"
**Solution:**
```
1. Delete node_modules folder
2. Run: npm install
3. Restart application
```

### Issue: Database tables not found
**Solution:**
```
1. Verify database/init.sql was executed
2. Re-run initialization script
3. Check database exists: localhost\stock_mgt
```

---

## Project Structure

```
StockMgt/
├── config/
│   └── database.js           # MSSQL connection config
├── controllers/
│   ├── authController.js     # Login, Register logic
│   └── stockController.js    # Stock CRUD operations
├── models/
│   ├── User.js              # User data model
│   └── Stock.js             # Stock data model
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── stockRoutes.js       # Stock endpoints
├── middleware/
│   └── auth.js              # JWT verification
├── utils/
│   └── emailService.js      # Email alert logic
├── views/
│   ├── login.ejs            # Login page
│   ├── register.ejs         # Registration page
│   └── dashboard.ejs        # Main dashboard
├── public/
│   ├── css/
│   │   └── dashboard.css    # Styling
│   └── js/
│       └── dashboard.js     # Frontend logic
├── database/
│   └── init.sql             # Database schema
├── .env                     # Environment variables
├── .env.example             # Example env file
├── package.json             # Dependencies
├── server.js                # Main server file
├── README.md                # Documentation
└── SETUP_GUIDE.md          # This file
```

---

## API Documentation

### Authentication
```
POST /api/login
Body: { "username": "user", "password": "pass" }
Response: { "token": "JWT_TOKEN", "user": {...} }
```

### Stock Operations
```
GET /api/stock                    # Get all items
POST /api/stock                   # Create new item
GET /api/stock/:id               # Get specific item
PUT /api/stock/:id               # Update item
DELETE /api/stock/:id            # Delete item
GET /api/stock/low-stock/list    # Get low stock items
```

All API requests require header:
```
Authorization: Bearer TOKEN
```

---

## Security Best Practices

⚠️ **Important Security Notes:**

1. **Environment Variables**
   - Never commit `.env` to version control
   - Keep `.env` file secure
   - Use `.gitignore` (already configured)

2. **Passwords**
   - Use strong passwords (8+ characters, mixed case, numbers)
   - Don't share database credentials
   - Change default MSSQL password after setup

3. **Database**
   - Regular backups recommended
   - Use specific database user (not sa)
   - Enable SQL Server authentication only

4. **Email**
   - Enable 2FA on Gmail
   - Use App Passwords instead of main password
   - Consider dedicated email account

5. **JWT Secrets**
   - Change `JWT_SECRET` in production
   - Use strong, random strings
   - Keep secrets in `.env` only

---

## Monitoring & Maintenance

### View Database Activity
```sql
-- Connect to stock_mgt database
USE stock_mgt;
SELECT * FROM stock_items;
SELECT * FROM stock_transactions;
SELECT * FROM email_alerts;
```

### Monitor Low Stock
```sql
SELECT * FROM stock_items WHERE quantity <= 5;
```

### Check Email Alerts Sent
```sql
SELECT * FROM email_alerts ORDER BY sent_at DESC;
```

---

## Performance Optimization

- Database has indexes on frequently queried columns
- Connection pooling configured
- JWT tokens for stateless authentication
- EJS templates for efficient rendering

---

## Support & Resources

- **Node.js Docs:** https://nodejs.org/docs/
- **Express.js Guide:** https://expressjs.com/
- **MSSQL Documentation:** https://learn.microsoft.com/sql/
- **Nodemailer Guide:** https://nodemailer.com/
- **EJS Templates:** https://ejs.co/

---

## Version Information

- **Project Version:** 1.0.0
- **Node.js Min Version:** 14.0.0
- **MSSQL Min Version:** 2019
- **Last Updated:** April 2026

---

## License

ISC License - See LICENSE file for details

---

**🎉 Setup complete! Enjoy your Stock Management System!**

For issues, check the troubleshooting section above or contact support.
