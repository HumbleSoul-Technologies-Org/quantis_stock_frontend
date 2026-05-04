# USB POS Thermal Printer Setup Guide

## Overview

This guide walks you through setting up and using USB thermal printer printing in the inventory management system. Once configured, you can print sales receipts directly to a POS thermal printer from the Sales module.

---

## Phase 1: Hardware Setup

### Step 1: Connect Your Thermal Printer

1. **Plug the USB cable** from your thermal printer into an available USB port on your computer
2. **Power on the printer** using its power switch
3. **Wait for detection** - Windows will automatically detect the device and may install drivers
4. **Verify in Windows Settings:**
   - Click Start → Settings → Devices → Printers & Scanners
   - Your thermal printer should appear in the list
   - Note the exact printer name (you may need it later)

### Step 2: Test Basic Connectivity

To confirm your printer works:

1. Open **Notepad** on your computer
2. Type some test text
3. Press **Ctrl+P** (or File → Print)
4. Select your thermal printer from the list
5. Click **Print**
6. Verify the printer produces output

**If the printer doesn't print:**

- Check the USB cable connection
- Verify the printer is powered on
- Restart your computer
- Install printer drivers from the manufacturer's website

---

## Phase 2: QZ Tray Installation

QZ Tray is a bridge application that allows the web application to communicate with USB devices like your thermal printer.

### Step 1: Download QZ Tray

1. Open your web browser
2. Navigate to **https://qz.io/download**
3. Select your operating system:
   - Windows (most common)
   - Mac
   - Linux
4. Click **Download** and save the installer

### Step 2: Install QZ Tray

1. Find the downloaded installer file (usually in Downloads folder)
2. **Double-click** to run the installer
3. Follow the installation wizard:
   - Click "Next" through the steps
   - Accept the license agreement
   - Accept default installation location
   - Complete the installation
4. **Restart your computer** when prompted

### Step 3: Verify Installation

1. After restart, look at the **system tray** (bottom-right corner of your screen)
2. You should see a **QZ Tray icon** (looks like a printer with a green checkmark)
3. If you see it, installation was successful
4. QZ Tray will run automatically in the background

**If QZ Tray doesn't appear:**

- Open Start menu and search for "QZ Tray"
- Click to launch it manually
- It should now appear in the system tray

---

## Phase 3: App Configuration

### Using the Inventory Management System

The application is already configured to work with QZ Tray. No additional setup is needed beyond installing QZ Tray.

### Important Notes

- **QZ Tray must be running** - Ensure the QZ Tray icon is visible in your system tray
- **USB printer must be connected** - Plug in and power on your thermal printer
- **Same computer requirement** - QZ Tray only works on the local machine (not over network)
- **Each computer needs setup** - If you have multiple registers, install QZ Tray on each one

---

## Phase 4: First Test Print

### Creating a Test Receipt

1. **Log into the application** with your credentials
2. **Navigate to Dashboard → Sales**
3. **Create a new sale:**
   - Click "Add Product"
   - Select a product from the dropdown
   - Enter a quantity (e.g., "1")
   - Click "+ Add" button
   - Repeat for additional items if desired

4. **Fill in sale details:**
   - **Customer Name:** Enter any name (e.g., "Test Customer")
   - **Date of Sale:** Select today's date
   - **Payment Type:** Select "Card" (this enables the Transaction ID field)
   - **Transaction ID:** Enter any ID (e.g., "TEST-001")
   - **Notes:** Optional - add any notes

5. **Complete the sale:**
   - Review the items and total
   - Click **"Complete Sale"** button
   - The receipt preview will appear

### Test Printing

You'll see a receipt preview with two print options at the bottom:

1. **"Print Receipt"** - Standard browser print (prints to any printer, allows dialog)
2. **"Print to POS"** - Thermal printer via QZ Tray (silent printing, no dialog)

**For USB thermal printer, click "Print to POS"**

- A connection will establish to QZ Tray
- Your thermal printer will automatically receive and print the receipt
- No print dialog will appear (silent printing)

### If Nothing Prints

See the Troubleshooting section below.

---

## Phase 5: Regular Usage

Once set up, here's the normal workflow:

1. **Complete a sale** in the Sales module (following Phase 4 steps)
2. **Receipt preview automatically opens** after completing the sale
3. **Choose your print method:**
   - Click **"Print Receipt"** for browser/PDF printing
   - Click **"Print to POS"** for thermal printer printing
4. **Receipt prints** to your chosen device

---

## Troubleshooting Guide

### Error: "QZ Tray Not Available"

**What it means:** The application cannot find QZ Tray

**Solutions:**

1. Check the system tray (bottom-right) for QZ Tray icon
2. If not there, open Start menu and search for "QZ Tray"
3. Launch QZ Tray manually
4. Wait 5 seconds for it to initialize
5. Refresh your browser and try again
6. If still not working, restart your computer

### Error: "Connection Failed"

**What it means:** QZ Tray is installed but the connection couldn't be established

**Solutions:**

1. Verify QZ Tray icon is visible in system tray
2. Right-click QZ Tray icon and select "Restart" (if available)
3. Check Windows Firewall - QZ Tray may need firewall permission:
   - Go to Windows Defender Firewall → Allow an app through firewall
   - Look for "QZ Tray" and ensure it's checked for both Private and Public
4. Restart your computer
5. Try printing again

### Error: "Printer Not Found"

**What it means:** Your thermal printer isn't detected

**Solutions:**

1. Verify the printer is **plugged in** to a USB port
2. Verify the printer is **powered on**
3. Check Windows Printers list:
   - Settings → Devices → Printers & Scanners
   - Your printer should appear here
4. If not in the list:
   - Unplug the printer
   - Wait 10 seconds
   - Plug it back in
   - Wait for Windows to detect it
5. If still not showing, install drivers from manufacturer's website
6. Restart your computer and try again

### Receipt Prints but Looks Wrong

**Possible causes and solutions:**

| Issue                           | Solution                                                                   |
| ------------------------------- | -------------------------------------------------------------------------- |
| Receipt is blank or garbled     | Verify printer paper is loaded correctly; restart the printer              |
| Text is cut off on sides        | Check printer width setting (should be 80mm for standard thermal printers) |
| Lines don't align               | Clean the printer head with manufacturer's cleaning kit                    |
| Receipt prints to wrong printer | Set thermal printer as default in Windows Printers & Scanners              |

### Receipt Prints to Wrong Printer

**If receipt prints to a different printer than expected:**

1. Go to **Settings → Devices → Printers & Scanners**
2. Find your thermal printer in the list
3. Click it and select **"Set as default"**
4. Try printing again

---

## Multi-Register Setup

If you operate multiple sales registers/terminals:

### Each Register Needs:

1. **QZ Tray installed** (follow Phase 2)
2. **USB thermal printer connected** (follow Phase 1)
3. **Application access** (network or local installation)

### How It Works:

- Each register operates **independently**
- Registers do **NOT** need to be networked together
- Each computer manages its own USB printer connection
- Sales data syncs to central server (as configured in your app)

---

## Advanced: Certificate Information

### Development vs. Production

The current application uses **development certificates** for QZ Tray communication.

**For testing/small deployments:** No action needed - everything works as-is

**For production deployment:** A code-signing certificate is recommended for enhanced security. Contact your IT administrator or the development team if you need to upgrade to production certificates.

---

## Quick Setup Checklist

Use this checklist to verify your setup is complete:

- [ ] USB thermal printer is plugged in and powered on
- [ ] Printer appears in Windows Settings → Printers & Scanners
- [ ] Successfully printed a test page from Notepad
- [ ] QZ Tray is downloaded and installed
- [ ] QZ Tray icon appears in system tray
- [ ] Application is running without errors
- [ ] Can create a test sale in the Sales module
- [ ] Receipt preview appears after completing a sale
- [ ] "Print to POS" button is visible in receipt preview
- [ ] Thermal printer prints the receipt successfully

---

## Support & Next Steps

### If You're Still Having Issues:

1. **Review the Troubleshooting section** above - most issues are covered
2. **Verify all hardware is connected** - Check cables, power, and USB connections
3. **Restart QZ Tray** - Right-click the QZ Tray icon and restart
4. **Restart your computer** - Resolves most connectivity issues
5. **Contact support** with details:
   - Printer model and make
   - Operating system (Windows version)
   - QZ Tray version (check by clicking QZ Tray icon)
   - Exact error message received

### Hardware Compatibility

This system works with most USB thermal printers including:

- Epson TM series
- Star Micronics series
- Zebra series
- Generic 80mm thermal printers

Verify your printer supports ESC/POS commands for best compatibility.

---

## Additional Resources

- **QZ Tray Documentation:** https://qz.io
- **Thermal Printer Support:** Check manufacturer's website
- **Application Support:** Contact your system administrator

---

**Last Updated:** May 4, 2026

**Version:** 1.0
