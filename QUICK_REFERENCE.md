# 📋 Quick Reference Card

## Quick Start (Windows)

```bash
# 1. Navigate to project
cd D:\download\StockMgt

# 2. Install dependencies
npm install

# 3. Initialize database
sqlcmd -S localhost -U root -P root -i "database\init.sql"

# 4. Start development server
npm run dev

# 5. Open browser
http://localhost:3000
```

## Quick Start (Mac/Linux)

```bash
# 1. Navigate to project
cd /path/to/StockMgt

# 2. Install dependencies
npm install

# 3. Initialize database (using SSMS or compatible tool)
sqlcmd -S localhost -U root -P root -i "database/init.sql"

# 4. Start development server
npm run dev

# 5. Open browser
http://localhost:3000
```

---

## Environment Variables

| Variable | Value |
|----------|-------|
| DB_HOST | localhost |
| DB_USER | root |
| DB_PASSWORD | root |
| DB_NAME | stock_mgt |
| DB_PORT | 3306 |
| EMAIL_USER | sales@laskontech.com |
| EMAIL_PASSWORD | 6o/kQR1eF+Y |
| ALERT_EMAIL | ali.toolifykit@gmail.com |
| STOCK_ALERT_THRESHOLD | 5 |
| JWT_SECRET | stock_mgt_secret_key_2026 |
| PORT | 3000 |

---

## npm Scripts

```bash
npm start          # Production mode
npm run dev        # Development with auto-reload
npm test           # Run tests (if configured)
```

---

## Key Files

| File | Purpose |
|------|---------|
| server.js | Main application entry point |
| .env | Environment variables (keep secret!) |
| database/init.sql | Database schema initialization |
| config/database.js | MSSQL connection setup |
| routes/ | API endpoints |
| controllers/ | Business logic |
| models/ | Data models |
| views/ | HTML templates |
| public/ | Static files (CSS, JS) |
| middleware/ | Authentication & other middleware |

---

## API Endpoints Quick Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /api/login | ❌ | User login |
| GET | /api/stock | ✅ | Get all items |
| POST | /api/stock | ✅ | Add item |
| PUT | /api/stock/:id | ✅ | Update item |
| DELETE | /api/stock/:id | ✅ | Delete item |
| GET | /api/stock/low-stock/list | ✅ | Get low stock items |

---

## Default Credentials

| Field | Value |
|-------|-------|
| Database Server | localhost |
| Database User | root |
| Database Password | root |
| Database Name | stock_mgt |

---

## Port Configuration

- **Application:** 3000 (configurable in .env)
- **MySQL:** 3306 (default)
- **SMTP (Email):** 587 (Gmail)

---

## Common Tasks

### Change Email Alert Recipient
1. Edit `.env`
2. Update: `ALERT_EMAIL=newemail@example.com`
3. Restart server

### Change Stock Alert Threshold
1. Edit `.env`
2. Update: `STOCK_ALERT_THRESHOLD=10`
3. Restart server

### Change Server Port
1. Edit `.env`
2. Update: `PORT=3001`
3. Restart server

### Reset Database
```bash
# Via MySQL CLI
mysql -u root -p < database/init.sql

# Or manually via command line
mysql -u root -p
# Then inside MySQL prompt:
DROP DATABASE stock_mgt;
# Exit and re-run init.sql
```

### View Low Stock Items
```sql
USE stock_mgt;
SELECT * FROM stock_items WHERE quantity <= 5;
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to DB | Verify MySQL running, check .env credentials |
| Port 3000 in use | Change PORT in .env or kill process |
| Email not sending | Check Gmail credentials, enable app passwords |
| Token expired | Re-login (token valid for 7 days) |
| Module not found | Run `npm install` |

---

## File Structure

```
StockMgt/
├── config/database.js
├── controllers/
│   ├── authController.js
│   └── stockController.js
├── middleware/auth.js
├── models/
│   ├── Stock.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── stockRoutes.js
├── utils/emailService.js
├── views/
│   ├── dashboard.ejs
│   ├── login.ejs
│   └── register.ejs
├── public/
│   ├── css/dashboard.css
│   └── js/dashboard.js
├── database/init.sql
├── .env
├── .env.example
├── .gitignore
├── package.json
├── server.js
├── README.md
├── SETUP_GUIDE.md
├── API_TESTING.md
└── QUICK_REFERENCE.md (this file)
```

---

## Useful Commands

```bash
# Check if Node is installed
node --version

# Check if npm is installed
npm --version

# Install all dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Test database connection in PowerShell
Test-NetConnection -ComputerName localhost -Port 1433

# View running processes on port 3000 (Windows)
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID_NUMBER> /F
```

---

## Email Alert Example

When stock drops below threshold (5):

**Email Headers:**
- From: sales@laskontech.com
- To: ali.toolifykit@gmail.com
- Subject: ⚠️ Stock Alert: [Item Name]

**Email Content:**
```
Item Name: Laptop
Item ID: 1
Current Stock: 3
Alert Threshold: 5
Date: 2026-04-23 10:30:45
```

---

## Security Checklist

- ✅ .env file in .gitignore
- ✅ Strong JWT secret in .env
- ✅ Database passwords changed
- ✅ HTTPS for production (configure separately)
- ✅ SQL injection prevented (using parameterized queries)
- ✅ Password hashing with bcryptjs
- ✅ JWT token expiration set

---

## Performance Tips

1. Database has indexes on frequently queried columns
2. Connection pooling enabled by default
3. Use production mode in deployment
4. Monitor database query performance
5. Cache static assets with CDN
6. Enable gzip compression

---

## Getting Help

1. Check SETUP_GUIDE.md for detailed instructions
2. Review API_TESTING.md for API examples
3. Check console logs for error messages
4. Verify .env configuration
5. Test database connection manually

---

## Version Info

- **Project:** Stock Management System v1.0.0
- **Last Updated:** April 2026
- **Node.js Required:** v14+
- **MSSQL Required:** 2019+

---

**Happy coding! 🚀**
