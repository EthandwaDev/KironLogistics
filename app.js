// ==========================================
// KIRON - Logistics Accounting System
// ==========================================

// Data Storage
const data = {
    inventory: [],
    quotes: [],
    invoices: [],
    revenueHistory: [],
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadDataFromLocalStorage();
    initializeEventListeners();
    renderDashboard();
    initializeCharts();
});

// ==========================================
// Event Listeners
// ==========================================

function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });

    // Inventory
    document.getElementById('addItemBtn').addEventListener('click', () => showInventoryForm());
    document.getElementById('cancelItemBtn').addEventListener('click', () => hideInventoryForm());
    document.getElementById('itemForm').addEventListener('submit', handleAddInventoryItem);

    // Quotes
    document.getElementById('createQuoteBtn').addEventListener('click', () => showQuoteForm());
    document.getElementById('cancelQuoteBtn').addEventListener('click', () => hideQuoteForm());
    document.getElementById('newQuoteForm').addEventListener('submit', handleCreateQuote);
    document.getElementById('addQuoteItemBtn').addEventListener('click', addQuoteItem);
    document.getElementById('quoteTax').addEventListener('change', calculateQuoteTotal);

    // Invoices
    document.getElementById('createInvoiceBtn').addEventListener('click', () => showInvoiceForm());
    document.getElementById('cancelInvoiceBtn').addEventListener('click', () => hideInvoiceForm());
    document.getElementById('newInvoiceForm').addEventListener('submit', handleCreateInvoice);
    document.getElementById('addInvoiceItemBtn').addEventListener('click', addInvoiceItem);
    document.getElementById('invoiceTax').addEventListener('change', calculateInvoiceTotal);

    // Reports
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('exportReportBtn').addEventListener('click', exportReportPDF);

    // Modal Close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') closeModal();
    });
}

function handleNavigation(e) {
    const pageId = e.currentTarget.dataset.page;
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');

    // Update active page
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    // Render page content
    if (pageId === 'dashboard') renderDashboard();
    if (pageId === 'inventory') renderInventory();
    if (pageId === 'quotes') renderQuotes();
    if (pageId === 'invoices') renderInvoices();
}

// ==========================================
// Inventory Management
// ==========================================

function showInventoryForm() {
    document.getElementById('inventoryForm').style.display = 'block';
    document.getElementById('itemForm').reset();
    document.getElementById('formTitle').textContent = 'Add New Item';
    document.getElementById('itemForm').dataset.editId = '';
}

function hideInventoryForm() {
    document.getElementById('inventoryForm').style.display = 'none';
}

function handleAddInventoryItem(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value;
    const sku = document.getElementById('itemSKU').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value);
    const cost = parseFloat(document.getElementById('itemCost').value);
    const description = document.getElementById('itemDescription').value;

    const editId = document.getElementById('itemForm').dataset.editId;

    if (editId) {
        const item = data.inventory.find(i => i.id === editId);
        item.name = name;
        item.sku = sku;
        item.quantity = quantity;
        item.cost = cost;
        item.description = description;
    } else {
        data.inventory.push({
            id: Date.now().toString(),
            name,
            sku,
            quantity,
            cost,
            description,
            createdAt: new Date().toISOString()
        });
    }

    saveDataToLocalStorage();
    renderInventory();
    hideInventoryForm();
    showNotification('Item saved successfully!');
}

function editInventoryItem(id) {
    const item = data.inventory.find(i => i.id === id);
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemSKU').value = item.sku;
    document.getElementById('itemQuantity').value = item.quantity;
    document.getElementById('itemCost').value = item.cost;
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemForm').dataset.editId = id;
    document.getElementById('formTitle').textContent = 'Edit Item';
    document.getElementById('inventoryForm').style.display = 'block';
}

function deleteInventoryItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        data.inventory = data.inventory.filter(i => i.id !== id);
        saveDataToLocalStorage();
        renderInventory();
        showNotification('Item deleted');
    }
}

function renderInventory() {
    const tbody = document.getElementById('inventoryBody');
    
    if (data.inventory.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No items in inventory. Click "Add Item" to get started.</td></tr>';
        return;
    }

    tbody.innerHTML = data.inventory.map(item => `
        <tr>
            <td><strong>${item.name}</strong></td>
            <td>${item.sku}</td>
            <td>${item.quantity}</td>
            <td>$${item.cost.toFixed(2)}</td>
            <td>$${(item.quantity * item.cost).toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editInventoryItem('${item.id}')" title="Edit">✎</button>
                    <button class="btn-icon" onclick="deleteInventoryItem('${item.id}')" title="Delete">🗑</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// Quotes Management
// ==========================================

function showQuoteForm() {
    document.getElementById('quoteForm').style.display = 'block';
    document.getElementById('newQuoteForm').reset();
    document.getElementById('quoteNumber').value = generateQuoteNumber();
    document.getElementById('quoteItemsContainer').innerHTML = `
        <div class="quote-item">
            <div class="form-row">
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" class="quote-description" required>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="quote-qty" min="1" value="1">
                </div>
                <div class="form-group">
                    <label>Unit Price ($)</label>
                    <input type="number" class="quote-price" min="0" step="0.01">
                </div>
                <button type="button" class="btn btn-danger remove-quote-item">Remove</button>
            </div>
        </div>
    `;
    attachQuoteItemEvents();
}

function hideQuoteForm() {
    document.getElementById('quoteForm').style.display = 'none';
}

function generateQuoteNumber() {
    return `QT-${Date.now().toString().slice(-6)}`;
}

function addQuoteItem() {
    const container = document.getElementById('quoteItemsContainer');
    const item = document.createElement('div');
    item.className = 'quote-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="quote-description" required>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="quote-qty" min="1" value="1">
            </div>
            <div class="form-group">
                <label>Unit Price ($)</label>
                <input type="number" class="quote-price" min="0" step="0.01">
            </div>
            <button type="button" class="btn btn-danger remove-quote-item">Remove</button>
        </div>
    `;
    container.appendChild(item);
    attachQuoteItemEvents();
}

function attachQuoteItemEvents() {
    document.querySelectorAll('.quote-item .quote-qty, .quote-item .quote-price').forEach(input => {
        input.removeEventListener('change', calculateQuoteTotal);
        input.addEventListener('change', calculateQuoteTotal);
    });

    document.querySelectorAll('.remove-quote-item').forEach(btn => {
        btn.removeEventListener('click', removeQuoteItem);
        btn.addEventListener('click', removeQuoteItem);
    });
}

function removeQuoteItem(e) {
    e.preventDefault();
    e.currentTarget.closest('.quote-item').remove();
    calculateQuoteTotal();
}

function calculateQuoteTotal() {
    const items = document.querySelectorAll('.quote-item');
    let subtotal = 0;

    items.forEach(item => {
        const qty = parseFloat(item.querySelector('.quote-qty').value) || 0;
        const price = parseFloat(item.querySelector('.quote-price').value) || 0;
        subtotal += qty * price;
    });

    const tax = parseFloat(document.getElementById('quoteTax').value) || 0;
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount;

    document.getElementById('quoteSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('quoteTaxAmount').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('quoteTotal').textContent = `$${total.toFixed(2)}`;
}

function handleCreateQuote(e) {
    e.preventDefault();

    const clientName = document.getElementById('quoteClientName').value;
    const quoteNumber = document.getElementById('quoteNumber').value;
    const clientEmail = document.getElementById('quoteClientEmail').value;
    const validUntil = document.getElementById('quoteValidUntil').value;

    const items = [];
    document.querySelectorAll('.quote-item').forEach(item => {
        items.push({
            description: item.querySelector('.quote-description').value,
            quantity: parseInt(item.querySelector('.quote-qty').value),
            price: parseFloat(item.querySelector('.quote-price').value)
        });
    });

    const total = parseFloat(document.getElementById('quoteTotal').textContent.replace('$', ''));
    const tax = parseFloat(document.getElementById('quoteTax').value);

    data.quotes.push({
        id: Date.now().toString(),
        quoteNumber,
        clientName,
        clientEmail,
        validUntil,
        items,
        subtotal: parseFloat(document.getElementById('quoteSubtotal').textContent.replace('$', '')),
        tax,
        total,
        status: 'pending',
        createdAt: new Date().toISOString()
    });

    saveDataToLocalStorage();
    renderQuotes();
    hideQuoteForm();
    showNotification('Quote created successfully!');
    
    // Ask if user wants to send email
    setTimeout(() => {
        if (confirm('Send quote to client via email?')) {
            sendQuoteEmail(data.quotes[data.quotes.length - 1]);
        }
    }, 500);
}

function sendQuoteEmail(quote) {
    // In a real app, this would call a backend API
    const mailtoLink = `mailto:${quote.clientEmail}?subject=Quote ${quote.quoteNumber} from Kiron&body=Dear ${quote.clientName},%0A%0APlease find attached your quote ${quote.quoteNumber}.%0A%0ATotal Amount: $${quote.total.toFixed(2)}%0AValid Until: ${quote.validUntil}%0A%0ABest Regards,%0AKiron Logistics`;
    window.location.href = mailtoLink;
}

function viewQuoteDetails(id) {
    const quote = data.quotes.find(q => q.id === id);
    let itemsHtml = quote.items.map(item => 
        `<tr><td>${item.description}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td><td>$${(item.quantity * item.price).toFixed(2)}</td></tr>`
    ).join('');

    const html = `
        <h3>Quote ${quote.quoteNumber}</h3>
        <p><strong>Client:</strong> ${quote.clientName}</p>
        <p><strong>Email:</strong> ${quote.clientEmail}</p>
        <p><strong>Valid Until:</strong> ${quote.validUntil}</p>
        <p><strong>Status:</strong> <span style="background: #fbbf24; padding: 4px 8px; border-radius: 4px; color: black;">${quote.status.toUpperCase()}</span></p>
        
        <h4 style="margin-top: 20px;">Items</h4>
        <table class="report-table">
            <thead>
                <tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
            <p><strong>Subtotal:</strong> $${quote.subtotal.toFixed(2)}</p>
            <p><strong>Tax (${quote.tax}%):</strong> $${((quote.subtotal * quote.tax) / 100).toFixed(2)}</p>
            <p style="font-size: 18px;"><strong>Total:</strong> $${quote.total.toFixed(2)}</p>
        </div>

        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="exportQuotePDF('${id}')">Export as PDF</button>
            <button class="btn btn-secondary" onclick="sendQuoteEmail(${JSON.stringify(quote).replace(/"/g, '&quot;')})">Send Email</button>
        </div>
    `;
    openModal(html);
}

function renderQuotes() {
    const tbody = document.getElementById('quotesBody');
    
    if (data.quotes.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No quotes created yet.</td></tr>';
        return;
    }

    tbody.innerHTML = data.quotes.map(quote => `
        <tr>
            <td><strong>${quote.quoteNumber}</strong></td>
            <td>${quote.clientName}</td>
            <td>$${quote.total.toFixed(2)}</td>
            <td><span style="background: #fbbf24; padding: 4px 8px; border-radius: 4px; color: black; font-size: 12px;">${quote.status.toUpperCase()}</span></td>
            <td>${quote.validUntil}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewQuoteDetails('${quote.id}')" title="View">👁</button>
                    <button class="btn-icon" onclick="deleteQuote('${quote.id}')" title="Delete">🗑</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteQuote(id) {
    if (confirm('Delete this quote?')) {
        data.quotes = data.quotes.filter(q => q.id !== id);
        saveDataToLocalStorage();
        renderQuotes();
        showNotification('Quote deleted');
    }
}

function exportQuotePDF(id) {
    const quote = data.quotes.find(q => q.id === id);
    const element = document.createElement('div');
    element.innerHTML = `
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #1a4d3e; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            table th, table td { padding: 10px; text-align: left; border-bottom: 1px solid #ccc; }
            table th { background: #1a4d3e; color: white; }
            .summary { text-align: right; margin-top: 20px; }
            .summary p { margin: 5px 0; }
        </style>
        <div class="header">
            <h1>KIRON - Logistics Accounting</h1>
            <h2>Quote ${quote.quoteNumber}</h2>
        </div>
        
        <p><strong>Client:</strong> ${quote.clientName}</p>
        <p><strong>Email:</strong> ${quote.clientEmail}</p>
        <p><strong>Valid Until:</strong> ${quote.validUntil}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        
        <table>
            <thead>
                <tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>
            </thead>
            <tbody>
                ${quote.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>$${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="summary">
            <p>Subtotal: $${quote.subtotal.toFixed(2)}</p>
            <p>Tax (${quote.tax}%): $${((quote.subtotal * quote.tax) / 100).toFixed(2)}</p>
            <p style="font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px;">
                Total: $${quote.total.toFixed(2)}
            </p>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `quote-${quote.quoteNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element.innerHTML).save();
}

// ==========================================
// Invoices Management
// ==========================================

function showInvoiceForm() {
    document.getElementById('invoiceForm').style.display = 'block';
    document.getElementById('newInvoiceForm').reset();
    document.getElementById('invoiceNumber').value = generateInvoiceNumber();
    document.getElementById('invoiceDate').valueAsDate = new Date();
    document.getElementById('invoiceDueDate').valueAsDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    document.getElementById('invoiceItemsContainer').innerHTML = `
        <div class="invoice-item">
            <div class="form-row">
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" class="invoice-description" required>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="invoice-qty" min="1" value="1">
                </div>
                <div class="form-group">
                    <label>Unit Price ($)</label>
                    <input type="number" class="invoice-price" min="0" step="0.01">
                </div>
                <button type="button" class="btn btn-danger remove-invoice-item">Remove</button>
            </div>
        </div>
    `;
    attachInvoiceItemEvents();
}

function hideInvoiceForm() {
    document.getElementById('invoiceForm').style.display = 'none';
}

function generateInvoiceNumber() {
    return `INV-${Date.now().toString().slice(-6)}`;
}

function addInvoiceItem() {
    const container = document.getElementById('invoiceItemsContainer');
    const item = document.createElement('div');
    item.className = 'invoice-item';
    item.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="invoice-description" required>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="invoice-qty" min="1" value="1">
            </div>
            <div class="form-group">
                <label>Unit Price ($)</label>
                <input type="number" class="invoice-price" min="0" step="0.01">
            </div>
            <button type="button" class="btn btn-danger remove-invoice-item">Remove</button>
        </div>
    `;
    container.appendChild(item);
    attachInvoiceItemEvents();
}

function attachInvoiceItemEvents() {
    document.querySelectorAll('.invoice-item .invoice-qty, .invoice-item .invoice-price').forEach(input => {
        input.removeEventListener('change', calculateInvoiceTotal);
        input.addEventListener('change', calculateInvoiceTotal);
    });

    document.querySelectorAll('.remove-invoice-item').forEach(btn => {
        btn.removeEventListener('click', removeInvoiceItem);
        btn.addEventListener('click', removeInvoiceItem);
    });
}

function removeInvoiceItem(e) {
    e.preventDefault();
    e.currentTarget.closest('.invoice-item').remove();
    calculateInvoiceTotal();
}

function calculateInvoiceTotal() {
    const items = document.querySelectorAll('.invoice-item');
    let subtotal = 0;

    items.forEach(item => {
        const qty = parseFloat(item.querySelector('.invoice-qty').value) || 0;
        const price = parseFloat(item.querySelector('.invoice-price').value) || 0;
        subtotal += qty * price;
    });

    const tax = parseFloat(document.getElementById('invoiceTax').value) || 0;
    const taxAmount = (subtotal * tax) / 100;
    const total = subtotal + taxAmount;

    document.getElementById('invoiceSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('invoiceTaxAmount').textContent = `$${taxAmount.toFixed(2)}`;
    document.getElementById('invoiceTotal').textContent = `$${total.toFixed(2)}`;
}

function handleCreateInvoice(e) {
    e.preventDefault();

    const clientName = document.getElementById('invoiceClientName').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const clientEmail = document.getElementById('invoiceClientEmail').value;
    const invoiceDate = document.getElementById('invoiceDate').value;
    const dueDate = document.getElementById('invoiceDueDate').value;
    const status = document.getElementById('invoiceStatus').value;

    const items = [];
    document.querySelectorAll('.invoice-item').forEach(item => {
        const description = item.querySelector('.invoice-description').value;
        const quantity = parseInt(item.querySelector('.invoice-qty').value);
        const price = parseFloat(item.querySelector('.invoice-price').value);
        items.push({ description, quantity, price });
    });

    const total = parseFloat(document.getElementById('invoiceTotal').textContent.replace('$', ''));
    const tax = parseFloat(document.getElementById('invoiceTax').value);

    data.invoices.push({
        id: Date.now().toString(),
        invoiceNumber,
        clientName,
        clientEmail,
        invoiceDate,
        dueDate,
        items,
        subtotal: parseFloat(document.getElementById('invoiceSubtotal').textContent.replace('$', '')),
        tax,
        total,
        status,
        createdAt: new Date().toISOString()
    });

    // Add to revenue history if paid
    if (status === 'paid') {
        const today = new Date().toISOString().split('T')[0];
        const existingEntry = data.revenueHistory.find(r => r.date === today);
        if (existingEntry) {
            existingEntry.amount += total;
        } else {
            data.revenueHistory.push({ date: today, amount: total });
        }
    }

    saveDataToLocalStorage();
    renderInvoices();
    hideInvoiceForm();
    showNotification('Invoice created successfully!');

    setTimeout(() => {
        if (confirm('Send invoice to client via email?')) {
            sendInvoiceEmail(data.invoices[data.invoices.length - 1]);
        }
    }, 500);
}

function sendInvoiceEmail(invoice) {
    const mailtoLink = `mailto:${invoice.clientEmail}?subject=Invoice ${invoice.invoiceNumber} from Kiron&body=Dear ${invoice.clientName},%0A%0APlease find attached your invoice ${invoice.invoiceNumber}.%0A%0ATotal Amount: $${invoice.total.toFixed(2)}%0ADue Date: ${invoice.dueDate}%0A%0ABest Regards,%0AKiron Logistics`;
    window.location.href = mailtoLink;
}

function viewInvoiceDetails(id) {
    const invoice = data.invoices.find(i => i.id === id);
    let itemsHtml = invoice.items.map(item => 
        `<tr><td>${item.description}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td><td>$${(item.quantity * item.price).toFixed(2)}</td></tr>`
    ).join('');

    const statusColor = invoice.status === 'paid' ? '#10b981' : invoice.status === 'partial' ? '#f59e0b' : '#ef4444';

    const html = `
        <h3>Invoice ${invoice.invoiceNumber}</h3>
        <p><strong>Client:</strong> ${invoice.clientName}</p>
        <p><strong>Email:</strong> ${invoice.clientEmail}</p>
        <p><strong>Invoice Date:</strong> ${invoice.invoiceDate}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
        <p><strong>Status:</strong> <span style="background: ${statusColor}; padding: 4px 8px; border-radius: 4px; color: white;">${invoice.status.toUpperCase()}</span></p>
        
        <h4 style="margin-top: 20px;">Items</h4>
        <table class="report-table">
            <thead>
                <tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
            <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
            <p><strong>Tax (${invoice.tax}%):</strong> $${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</p>
            <p style="font-size: 18px;"><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
        </div>

        <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="exportInvoicePDF('${id}')">Export as PDF</button>
            <button class="btn btn-secondary" onclick="sendInvoiceEmail(${JSON.stringify(invoice).replace(/"/g, '&quot;')})">Send Email</button>
        </div>
    `;
    openModal(html);
}

function renderInvoices() {
    const tbody = document.getElementById('invoicesBody');
    
    if (data.invoices.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No invoices created yet.</td></tr>';
        return;
    }

    tbody.innerHTML = data.invoices.map(invoice => {
        let statusColor = '#ef4444';
        if (invoice.status === 'paid') statusColor = '#10b981';
        if (invoice.status === 'partial') statusColor = '#f59e0b';

        return `
        <tr>
            <td><strong>${invoice.invoiceNumber}</strong></td>
            <td>${invoice.clientName}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td><span style="background: ${statusColor}; padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px;">${invoice.status.toUpperCase()}</span></td>
            <td>${invoice.dueDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewInvoiceDetails('${invoice.id}')" title="View">👁</button>
                    <button class="btn-icon" onclick="deleteInvoice('${invoice.id}')" title="Delete">🗑</button>
                </div>
            </td>
        </tr>
    `}).join('');
}

function deleteInvoice(id) {
    if (confirm('Delete this invoice?')) {
        data.invoices = data.invoices.filter(i => i.id !== id);
        saveDataToLocalStorage();
        renderInvoices();
        showNotification('Invoice deleted');
    }
}

function exportInvoicePDF(id) {
    const invoice = data.invoices.find(i => i.id === id);
    const element = document.createElement('div');
    element.innerHTML = `
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #1a4d3e; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            table th, table td { padding: 10px; text-align: left; border-bottom: 1px solid #ccc; }
            table th { background: #1a4d3e; color: white; }
            .summary { text-align: right; margin-top: 20px; }
            .summary p { margin: 5px 0; }
        </style>
        <div class="header">
            <h1>KIRON - Logistics Accounting</h1>
            <h2>Invoice ${invoice.invoiceNumber}</h2>
        </div>
        
        <p><strong>Client:</strong> ${invoice.clientName}</p>
        <p><strong>Email:</strong> ${invoice.clientEmail}</p>
        <p><strong>Invoice Date:</strong> ${invoice.invoiceDate}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
        <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        
        <table>
            <thead>
                <tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>$${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="summary">
            <p>Subtotal: $${invoice.subtotal.toFixed(2)}</p>
            <p>Tax (${invoice.tax}%): $${((invoice.subtotal * invoice.tax) / 100).toFixed(2)}</p>
            <p style="font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px;">
                Total: $${invoice.total.toFixed(2)}
            </p>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element.innerHTML).save();
}

// ==========================================
// Dashboard
// ==========================================

function renderDashboard() {
    updateDashboardStats();
}

function updateDashboardStats() {
    // Total Inventory Value
    const totalInventoryValue = data.inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    document.getElementById('totalInventoryValue').textContent = `$${totalInventoryValue.toFixed(2)}`;

    // Active Quotes
    const activeQuotes = data.quotes.filter(q => q.status === 'pending').length;
    document.getElementById('activeQuotes').textContent = activeQuotes;

    // Unpaid Invoices
    const unpaidInvoices = data.invoices.filter(i => i.status !== 'paid').length;
    document.getElementById('unpaidInvoices').textContent = unpaidInvoices;

    // Total Revenue
    const totalRevenue = data.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
}

// ==========================================
// Reports
// ==========================================

function generateReport() {
    const totalInventoryValue = data.inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    const totalRevenue = data.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    const totalQuoteValue = data.quotes.reduce((sum, q) => sum + q.total, 0);
    const totalOutstanding = data.invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0);

    let html = `
        <h2>Comprehensive Business Report</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>

        <div class="report-section">
            <h3>Executive Summary</h3>
            <table class="report-table">
                <tr>
                    <td><strong>Total Inventory Value:</strong></td>
                    <td>$${totalInventoryValue.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>Total Revenue (Paid Invoices):</strong></td>
                    <td>$${totalRevenue.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>Outstanding Invoices:</strong></td>
                    <td>$${totalOutstanding.toFixed(2)}</td>
                </tr>
                <tr>
                    <td><strong>Pending Quote Value:</strong></td>
                    <td>$${totalQuoteValue.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="report-section">
            <h3>Inventory Analysis</h3>
            ${data.inventory.length === 0 ? '<p>No inventory items.</p>' : `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>SKU</th>
                        <th>Quantity</th>
                        <th>Unit Cost</th>
                        <th>Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.inventory.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.sku}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.cost.toFixed(2)}</td>
                            <td>$${(item.quantity * item.cost).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>

        <div class="report-section">
            <h3>Financial Summary</h3>
            <h4>Paid Invoices</h4>
            ${data.invoices.filter(i => i.status === 'paid').length === 0 ? '<p>No paid invoices.</p>' : `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Invoice</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.invoices.filter(i => i.status === 'paid').map(inv => `
                        <tr>
                            <td>${inv.invoiceNumber}</td>
                            <td>${inv.clientName}</td>
                            <td>$${inv.total.toFixed(2)}</td>
                            <td>${inv.invoiceDate}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}

            <h4 style="margin-top: 20px;">Outstanding Invoices</h4>
            ${data.invoices.filter(i => i.status !== 'paid').length === 0 ? '<p>No outstanding invoices.</p>' : `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Invoice</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.invoices.filter(i => i.status !== 'paid').map(inv => `
                        <tr>
                            <td>${inv.invoiceNumber}</td>
                            <td>${inv.clientName}</td>
                            <td>$${inv.total.toFixed(2)}</td>
                            <td>${inv.dueDate}</td>
                            <td>${inv.status.toUpperCase()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>

        <div class="report-section">
            <h3>Quotes</h3>
            ${data.quotes.length === 0 ? '<p>No quotes created.</p>' : `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Quote</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Valid Until</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.quotes.map(quote => `
                        <tr>
                            <td>${quote.quoteNumber}</td>
                            <td>${quote.clientName}</td>
                            <td>$${quote.total.toFixed(2)}</td>
                            <td>${quote.validUntil}</td>
                            <td>${quote.status.toUpperCase()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;

    document.getElementById('reportContent').innerHTML = html;
}

function exportReportPDF() {
    if (!document.getElementById('reportContent').innerHTML.includes('Executive Summary')) {
        alert('Please generate a report first!');
        return;
    }

    const element = document.createElement('div');
    element.innerHTML = `
        <style>
            body { font-family: Arial, sans-serif; }
            h2 { color: #1a4d3e; }
            h3 { color: #2d7a5f; margin-top: 20px; }
            h4 { color: #3a9970; margin-top: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            table th, table td { padding: 8px; text-align: left; border-bottom: 1px solid #ccc; }
            table th { background: #1a4d3e; color: white; }
        </style>
        ${document.getElementById('reportContent').innerHTML}
    `;

    const opt = {
        margin: 10,
        filename: `kiron-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element.innerHTML).save();
}

// ==========================================
// Charts
// ==========================================

let revenueChart, inventoryChart;

function initializeCharts() {
    createRevenueChart();
    createInventoryChart();
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const last7Days = getLast7Days();
    const revenues = last7Days.map(date => {
        const entry = data.revenueHistory.find(r => r.date === date);
        return entry ? entry.amount : 0;
    });

    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(d => new Date(d).toLocaleDateString()),
            datasets: [{
                label: 'Revenue',
                data: revenues,
                borderColor: '#1a4d3e',
                backgroundColor: 'rgba(26, 77, 62, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function createInventoryChart() {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;

    const topItems = data.inventory.slice(0, 5);

    if (inventoryChart) inventoryChart.destroy();

    inventoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: topItems.map(item => item.name),
            datasets: [{
                data: topItems.map(item => item.quantity * item.cost),
                backgroundColor: [
                    '#1a4d3e',
                    '#2d7a5f',
                    '#3a9970',
                    '#5ab394',
                    '#7ac8ae'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    return days;
}

// ==========================================
// Modal
// ==========================================

function openModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalBody').innerHTML = '';
}

// ==========================================
// Utilities
// ==========================================

function showNotification(message) {
    // Simple notification - you can enhance this with a toast library
    alert(message);
}

function saveDataToLocalStorage() {
    localStorage.setItem('kironData', JSON.stringify(data));
}

function loadDataFromLocalStorage() {
    const stored = localStorage.getItem('kironData');
    if (stored) {
        const loaded = JSON.parse(stored);
        Object.assign(data, loaded);
    }
}

// Initial render
window.addEventListener('load', () => {
    updateDashboardStats();
    if (revenueChart) createRevenueChart();
    if (inventoryChart) createInventoryChart();
});
