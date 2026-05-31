# KIRON - Logistics Accounting Tool

Professional accounting software designed specifically for logisticians. Kiron provides an intuitive interface for managing inventory, creating quotes, generating invoices, and tracking business metrics.

## Features

### 📊 Dashboard
- Real-time overview of total inventory value
- Active quotes count
- Unpaid invoices tracking
- Total revenue from paid invoices
- Interactive revenue trend charts
- Inventory distribution visualization

### 📦 Inventory Management
- Add, edit, and delete items
- Track quantities in real-time
- Manage unit costs
- Calculate total inventory values
- Professional item descriptions
- SKU tracking for easy reference

### 📄 Quotes Management
- Create professional quotes for clients
- Add multiple line items per quote
- Automatic subtotal and tax calculations
- Set validity dates for quotes
- Export quotes as PDF
- Send quotes via email (opens default email client)
- Track quote status (pending/accepted/rejected)

### 🧾 Invoices Management
- Generate detailed invoices from quotes or manually
- Automatic inventory deduction on invoice creation
- Multiple payment status options (unpaid/partial/paid)
- Tax calculations and customization
- PDF export functionality
- Email delivery integration
- Due date tracking
- Professional invoice formatting

### 📈 Reports
- Comprehensive business report generation
- Inventory analysis with total values
- Financial summary of paid and outstanding invoices
- Quote pipeline analysis
- Executive summary metrics
- Export reports as PDF
- Professional report formatting

### 🎨 Professional Design
- Green and black theme for logistics industry look
- Responsive sidebar navigation
- Clean, modern interface
- Professional typography
- Smooth animations and transitions
- Mobile-friendly design

## Technical Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (Vanilla JS - No Framework)
- **PDF Export**: html2pdf.js
- **Charts**: Chart.js
- **Storage**: Browser LocalStorage (client-side data persistence)
- **Email**: Native email client integration via mailto

## Installation

1. Clone the repository:
```bash
git clone https://github.com/EthandwaDev/KironLogistics.git
cd KironLogistics
```

2. Open in a web browser:
```bash
# Simply open index.html in your browser
# Or use a local server
python -m http.server 8000
# Then navigate to http://localhost:8000
```

## Usage

### Getting Started
1. Open the application in your web browser
2. Navigate using the sidebar menu
3. Start with **Inventory** to add your items
4. Create **Quotes** for client proposals
5. Generate **Invoices** for billing
6. View **Reports** for business insights

### Adding Inventory Items
1. Click "Add Item" button
2. Fill in item details:
   - Item Name
   - SKU (Stock Keeping Unit)
   - Quantity
   - Unit Cost
   - Description (optional)
3. Click "Save Item"

### Creating Quotes
1. Click "Create Quote" button
2. Enter client information
3. Add line items with descriptions, quantities, and prices
4. Set tax rate if applicable
5. Review totals
6. Click "Create Quote"
7. Optionally send to client via email

### Generating Invoices
1. Click "Create Invoice" button
2. Enter client information
3. Set invoice and due dates
4. Add line items
5. Select payment status
6. Click "Create Invoice"
7. Optionally send to client via email

### Exporting Documents
- **PDF Export**: Click "Export as PDF" button on any quote or invoice
- **Email**: Click "Send Email" to compose in your default email client

### Generating Reports
1. Go to Reports section
2. Click "Generate Report"
3. View comprehensive business analysis
4. Click "Export as PDF" to save report

## Data Storage

All data is stored locally in your browser's LocalStorage. This means:
- ✅ No server required
- ✅ Data persists between sessions
- ✅ Complete privacy (data never leaves your device)
- ⚠️ Clearing browser data will delete all records
- ⚠️ Data is not synced across devices

**Recommendation**: Regularly export reports as PDF backups

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Features Detail

### PDF Export
- Exports quotes, invoices, and reports
- Professional formatting
- Ready to print or email
- Includes company branding

### Email Integration
- Opens default email client
- Pre-populated with document details
- Client email addresses pre-filled
- Seamless attachment workflow

### Report Generation
- Executive summary
- Inventory analysis
- Financial statements
- Quote pipeline
- Professional formatting
- Export to PDF

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Navigate between fields |
| Enter | Submit form |
| Esc | Close modal/cancel |

## File Structure

```
KironLogistics/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling
├── app.js              # All application logic
├── README.md           # Documentation
└── LICENSE             # License file
```

## Future Enhancements

- [ ] Multi-user support with authentication
- [ ] Cloud data synchronization
- [ ] Recurring invoice templates
- [ ] Advanced financial analytics
- [ ] Payment gateway integration
- [ ] Mobile app version
- [ ] Client portal
- [ ] Automated payment reminders
- [ ] Multi-currency support
- [ ] Expense tracking

## Troubleshooting

### Data Not Saving
- Check if LocalStorage is enabled in browser
- Ensure you're not in private/incognito mode
- Try a different browser

### PDF Export Not Working
- Ensure JavaScript is enabled
- Try a different browser
- Check browser console for errors

### Email Not Opening
- Verify default email client is configured
- Check email address format
- Try copying content manually

## Support

For issues, feature requests, or contributions, please visit the GitHub repository.

## License

This project is open source and available under the MIT License.

## Version

**v1.0.0** - Initial Release

---

**Made with ❤️ for Logistics Professionals**

KIRON - Professional Accounting for Logisticians
