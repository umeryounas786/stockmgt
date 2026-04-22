# Stock Management System

A comprehensive Node.js Stock Management System with MSSQL database, email alerts, and user authentication.

## Features

✅ **User Authentication** - Secure login and registration with JWT tokens  
✅ **Stock Management** - Add, edit, delete, and manage inventory items  
✅ **Low Stock Alerts** - Automatic email notifications when stock falls below threshold  
✅ **Responsive Dashboard** - Modern, user-friendly interface  
✅ **Email Integration** - Gmail SMTP for alert notifications  
✅ **Database** - MSSQL Server with optimized queries and indexes  

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (5.7 or higher)
- npm or yarn

## Installation

1. **Clone/Extract the project**
   ```bash
   cd StockMgt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Open MSSQL Management Studio
   - Run the initialization script: `database/init.sql`
   - This will create the `stock_mgt` database with all required tables

4. **Environment Configuration**
   - The `.env` file is already configured with your credentials
   - Verify the following settings:
     ```
     DB_SERVER=localhost
     DB_USER=root
     DB_PASSWORD=root
     DB_NAME=stock_mgt
     EMAIL_USER=sales@laskontech.com
     EMAIL_PASSWORD=6o/kQR1eF+Y
     ALERT_EMAIL=ali.toolifykit@gmail.com
     STOCK_ALERT_THRESHOLD=5
     ```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Default Login

- **Username:** Create a new account by clicking "Register"
- **Password:** Your chosen password

## Usage

### Login/Register
1. Go to `http://localhost:3000`
2. Create an account or login with existing credentials

### Add Stock Item
1. Click "+ Add Stock" button
2. Fill in item details:
   - **Item Name** (required)
   - **SKU** (optional)
   - **Quantity** (required)
   - **Unit Price** (required)
   - **Category** (required)
   - **Supplier** (optional)
   - **Reorder Level** (default: 5)
   - **Description** (optional)
3. Click "Save Item"

### Edit Stock Item
1. Find the item in the table
2. Click "Edit" button
3. Modify the details
4. Click "Save Item"

### Delete Stock Item
1. Find the item in the table
2. Click "Delete" button
3. Confirm deletion

### Low Stock Alerts
- When quantity falls to 5 or below (configurable)
- System automatically sends an email to: `ali.toolifykit@gmail.com`
- Email includes: Item name, current stock, and alert timestamp

## API Endpoints

All API endpoints require JWT authentication token.

### Authentication
- `POST /api/login` - Login and get token

### Stock Management
- `GET /api/stock` - Get all stock items
- `GET /api/stock/:id` - Get specific item
- `POST /api/stock` - Create new item
- `PUT /api/stock/:id` - Update item
- `DELETE /api/stock/:id` - Delete item
- `GET /api/stock/low-stock` - Get low stock items

## Email Configuration

The system uses Gmail SMTP for sending alerts:
- **Host:** smtp.gmail.com
- **Port:** 587
- **From Email:** sales@laskontech.com
- **To Email:** ali.toolifykit@gmail.com
- **Alert Threshold:** 5 items

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- email
- password (hashed)
- created_at, updated_at

### Stock Items Table
- item_id (Primary Key)
- item_name
- quantity
- price
- category
- description
- sku (Unique)
- supplier
- reorder_level
- created_at, updated_at

### Stock Transactions Table
- transaction_id (Primary Key)
- item_id (Foreign Key)
- transaction_type (ADD/REMOVE/ADJUST)
- quantity
- notes
- created_by
- created_at

### Email Alerts Table
- alert_id (Primary Key)
- item_id (Foreign Key)
- alert_type
- recipient_email
- subject
- sent_at
- status

## Troubleshooting

### Database Connection Error
- Ensure MSSQL Server is running
- Verify credentials in `.env` file
- Check firewall settings for port 1433

### Email Not Sending
- Verify Gmail credentials are correct
- Ensure "Less secure apps" is enabled in Gmail settings
- Check network connectivity to smtp.gmail.com

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process using port 3000

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to version control
- Always use strong passwords
- Enable two-factor authentication on Gmail
- Consider using App Passwords instead of main Gmail password
- Keep dependencies updated

## Technologies Used

- **Backend:** Express.js
- **Database:** MSSQL Server
- **Authentication:** JWT
- **Email:** Nodemailer
- **Frontend:** EJS, HTML5, CSS3, JavaScript
- **Password Hashing:** bcryptjs

## Support & Maintenance

For issues or improvements, check the following:
1. Verify all `.env` variables are set correctly
2. Ensure database is initialized
3. Check Node.js version compatibility
4. Review error logs in console

## License

ISC

---

**Created:** 2026
**Version:** 1.0.0
