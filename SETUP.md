# StockOS Setup & Getting Started Guide

## ✅ Installation & Setup

### 1. Dependencies

All required dependencies will be automatically installed by the system. No manual npm install needed!

### 2. Database & Storage

- Supports both localStorage (demo/offline mode) and API-based backend storage
- Use API when `NEXT_PUBLIC_API_BASE_URL` is configured and backend is available
- Falls back to localStorage when backend is unavailable or in offline mode
- Data persistence works both in browser and via API backend

### 3. Running the Application

The application is ready to run immediately:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Then visit: `http://localhost:3000`

---

## 🔑 Default Login Credentials

The system comes with 3 pre-configured demo accounts:

### Admin Account

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin (full access)

### Manager Account

- **Username**: `manager`
- **Password**: `manager123`
- **Role**: Manager (limited access)

### Sales Account

- **Username**: `sales`
- **Password**: `sales123`
- **Role**: Sales (minimal access)

> **Note**: Change these credentials immediately in Settings > Credentials after first login!

---

## 🎯 Quick Start Workflow

### 1. First Login

1. Go to the login page
2. Click on the "Admin" demo credential button
3. You'll be logged in to the admin dashboard

### 2. Explore the Dashboard

- View overview cards with key metrics
- Check recent activity feed
- See low stock alerts

### 3. Add Your First Product

1. Go to **Products** from the sidebar
2. Click "Add Product"
3. Fill in the form:
   - Product name (e.g., "Laptop")
   - SKU (e.g., "LAP-001")
   - Category
   - Unit and selling price
   - Current stock level
4. Click "Add Product"

### 4. Set Up Suppliers

1. Go to **Suppliers**
2. Click "Add Supplier"
3. Enter supplier details
4. Products link to suppliers automatically

### 5. Manage Inventory

1. Go to **Inventory Management**
2. Click "Record Movement"
3. Track stock in/out with reasons
4. View complete stock history

### 6. Create Your First Sale

1. Go to **Sales**
2. Click "New Sale"
3. Add products from inventory
4. Stock automatically updates
5. View all sales with details

### 7. View Reports

1. Go to **Reports & Analytics**
2. Choose report type (Inventory or Sales)
3. View metrics and trends
4. Export to CSV

### 8. Configure Settings

1. Go to **Settings**
2. Set company information
3. Choose currency (USD, EUR, etc.)
4. Select measurement units
5. Enable notifications
6. Change your credentials

---

## 👥 Role-Based Features

### Admin Can:

- ✅ Access all pages
- ✅ Manage all products and suppliers
- ✅ View all sales (including others')
- ✅ Access reports
- ✅ Change system settings
- ✅ Change any user credentials
- ✅ View help documentation

### Manager Can:

- ✅ Manage products
- ✅ Manage inventory
- ✅ Create and view sales
- ✅ Manage suppliers
- ✅ Access reports
- ✅ Access limited settings (no credential change)
- ✅ View help documentation
- ❌ Cannot change system credentials

### Sales Can:

- ✅ View products (read-only)
- ✅ Create sales
- ✅ View only their own sales
- ✅ Access help documentation
- ❌ Cannot manage inventory, products, or settings

---

## 📊 Understanding the Dashboard

### Overview Cards

- **Total Products**: Number of products in inventory
- **Total Sales**: Total revenue from completed sales
- **Inventory Value**: Total value of all stock
- **Low Stock Items**: Products below reorder level

### Recent Activity

Shows the 10 most recent activities:

- Latest sales transactions
- Stock movements (in/out/adjustments)
- Timestamps for tracking

---

## 🔒 Account Security Tips

1. **Change Default Passwords**: Never use demo passwords in production
   - Go to Settings > Credentials
   - Use strong passwords (mix of letters, numbers, symbols)

2. **Login Credentials**:
   - Email field in Settings stores contact info
   - Password field hidden for security

3. **Role Assignment**:
   - Only Admins can manage user roles
   - Each role has specific permissions

---

## 📈 Key Features to Explore

### Currency Management

- Go to Settings > Currency
- Select from 7 currencies
- Customize decimal places
- Live preview of formatting

### Measurement Units

- Set weight units (kg, lbs, etc.)
- Set volume units (L, gallons, etc.)
- Set count units (units, boxes, etc.)
- Applied globally to inventory

### Notifications

- Enable/disable email alerts
- Toggle low stock notifications
- Configure sale alerts
- SMS alerts for urgent issues

### Data Export

- Generate CSV reports
- Download inventory data
- Download sales data
- Open in Excel for analysis

---

## 🆘 Getting Help

### In-App Help

1. Click **Help** in the sidebar (all roles)
2. Navigate to different sections:
   - **FAQs**: 12 comprehensive Q&As
   - **Demo Guide**: Step-by-step tutorial
   - **Shortcuts**: Keyboard shortcuts reference
   - **Contact Us**: Send message to support

### Quick Tips

- Use Ctrl/Cmd+K for quick search (coming soon)
- Use Esc to close popups
- Tab to navigate form fields
- Click expandable sections for more info

### Troubleshooting

See the Help page > Troubleshooting section for:

- Low stock alerts not showing
- Sales not updating inventory
- Product deletion issues
- Currency display issues
- Login problems

---

## 💾 Data Management

### Saving Data

- All changes save automatically to localStorage
- No save button needed
- No manual backup required

### Data Persistence

- Data survives browser restart
- Data survives page refresh
- Data lost only when browser cache is cleared

### Reset Data (Advanced)

To reset all data to defaults:

1. Open browser console (F12)
2. Type: `localStorage.removeItem('erp_system_state')`
3. Refresh the page
4. All default sample data will reload

---

## 🎨 Customization

### Theme

- Click the sun/moon icon in top nav
- Toggle between Light and Dark modes
- Theme preference saves automatically

### Company Information

- Go to Settings > General
- Set your company name
- Set contact email
- These display in reports and documentation

---

## 📱 Mobile Support

The application is fully responsive:

- **Mobile**: Works on smartphones
- **Tablet**: Optimized for tablets
- **Desktop**: Full-width experience

---

## ⚡ Performance Tips

1. **Reduce Clutter**: Archive old sales regularly
2. **Search Effectively**: Use product search for large inventories
3. **Category Filters**: Organize products into categories
4. **Export Reports**: Download large data sets to CSV

---

## 🚀 Advanced Features

### Inventory Management

- Track multiple stock movements per product
- Set different reorder levels per product
- View complete stock history with timestamps

### Sales Analytics

- Identify top-selling products
- Calculate average order values
- Track revenue trends
- Export for further analysis

### Supplier Relationships

- Store multiple suppliers
- Track payment terms
- Direct email/phone links
- Link products to suppliers

---

## 🐛 Known Limitations

- Client-side only (no cloud sync across devices)
- Data stored locally (not backed up to cloud)
- Single browser/device per session
- localStorage has size limits on some browsers

---

## 🎓 Learning Path

1. **Day 1**: Login and explore dashboard
2. **Day 2**: Add products and suppliers
3. **Day 3**: Practice inventory management
4. **Day 4**: Create and review sales
5. **Day 5**: Generate and analyze reports
6. **Day 6**: Configure settings for your business
7. **Day 7**: Master all features

---

## 📞 Support

For issues or questions:

1. Check the **Help** section in the app
2. Review FAQs (12 comprehensive answers)
3. Follow the Demo Guide tutorial
4. Submit a request via the Contact Form in Help

---

## ✨ What's Next?

After setup:

1. **Customize**: Add your company info in Settings
2. **Import**: Manually add your products and suppliers
3. **Populate**: Create initial inventory records
4. **Train**: Teach your team the workflow
5. **Monitor**: Use dashboard for daily oversight
6. **Optimize**: Adjust based on your business needs

Enjoy using StockOS! 🎉
