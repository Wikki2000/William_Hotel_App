// rooms.js
document.addEventListener("DOMContentLoaded", () => {
    const receiptData = {
        customerName: "Mr. John Michael",
        date: "13/05/2025",
        time: "05:09 PM",
        receiptNumber: "RSP599057885",
        terminal: "Ifelodun-ilupeju",
        sellerName: "Peters Ibo",
        orders: [
            { item: "Standard Rooms", quantity: 1, price: 18000, total: 18750 },
            { item: "Rice & Chicken", quantity: 1, price: 18000, total: 18750 },
            { item: "Water", quantity: 1, price: 18000, total: 18750 },
            { item: "Coke", quantity: 1, price: 18000, total: 18750 }
        ],
        subtotal: 75000,
        vat: 3750,
        total: 78750,
        qrCode: "/public/images/qr_code.png"
    };

    // Render receipt info
    const receiptInfo = `
        <div class="receipt-items">
            <div><p>Customer's Name</p><p>${receiptData.customerName}</p></div>
            <div><p>Date</p><p>${receiptData.date}</p></div>
            <div><p>Time</p><p>${receiptData.time}</p></div>
            <div><p>Receipt No.</p><p>${receiptData.receiptNumber}</p></div>
            <div><p>Terminal</p><p>${receiptData.terminal}</p></div>
            <div><p>Seller Name</p><p>${receiptData.sellerName}</p></div>
        </div>`;
    document.getElementById("receipt-info").innerHTML = receiptInfo;

    // Render customer order table
    let orderRows = receiptData.orders.map(order => `
        <tr>
            <td>${order.item}</td>
            <td>${order.quantity}</td>
            <td>${order.price.toLocaleString()}</td>
            <td>${order.total.toLocaleString()}</td>
        </tr>
    `).join("");

    const customerOrderTable = `
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderRows}
            </tbody>
        </table>`;
    document.getElementById("customer-order-table").innerHTML = customerOrderTable;

    // Render totals
    const totals = `
        <div class="order-total">
            <div><p>Subtotal</p><p>${receiptData.subtotal.toLocaleString()}</p></div>
            <div><p>VAT</p><p>${receiptData.vat.toLocaleString()}</p></div>
            <div><p>Total</p><p>${receiptData.total.toLocaleString()}</p></div>
        </div>`;
    document.getElementById("totals").innerHTML = totals;

    document.querySelector(".total-payment").innerHTML = receiptData.total.toLocaleString()

    // Render QR Code
    const qrCode = `<img src="${receiptData.qrCode}" alt="QR Code" width="400px" height="150px">`;
    document.getElementById("qr-code").innerHTML = qrCode;
});
