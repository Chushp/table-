// Добавление новой строки товара
function addRow() {
    const tbody = document.getElementById('invoiceRows');
    const rowCount = tbody.querySelectorAll('.item-row').length + 1;
    
    const newRow = document.createElement('tr');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <td class="row-number">${rowCount}</td>
        <td><input type="text" class="item-name" aria-label="Найменування товару"></td>
        <td><input type="number" class="item-quantity" value="0" step="1" min="0" oninput="calculateRow(this)" aria-label="Кількість"></td>
        <td><input type="number" class="item-price" value="0" step="0.01" min="0" oninput="calculateRow(this)" aria-label="Ціна"></td>
        <td class="item-sum">0</td>
        <td class="no-print"><button onclick="removeRow(this)" class="btn-remove">✕</button></td>
    `;
    
    tbody.appendChild(newRow);
}

// Удаление строки товара
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateRowNumbers();
    calculateTotals();
}

// Обновление нумерации строк
function updateRowNumbers() {
    const rows = document.querySelectorAll('.item-row');
    rows.forEach((row, index) => {
        row.querySelector('.row-number').textContent = index + 1;
    });
}

// Расчет суммы для строки
function calculateRow(input) {
    const row = input.closest('tr');
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const sum = quantity * price;
    
    row.querySelector('.item-sum').textContent = sum.toFixed(2);
    calculateTotals();
}

// Автозаполнение цены при выборе товара
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('item-name')) {
        const selectedValue = e.target.value;
        const option = document.querySelector(`#productList option[value="${selectedValue}"]`);
        
        if (option) {
            const price = option.getAttribute('data-price');
            if (price) {
                const row = e.target.closest('tr');
                const priceInput = row.querySelector('.item-price');
                priceInput.value = parseFloat(price).toFixed(2);
                calculateRow(priceInput);
            }
        }
    }
});

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('item-name')) {
        const selectedValue = e.target.value;
        const option = document.querySelector(`#productList option[value="${selectedValue}"]`);
        
        if (option) {
            const price = option.getAttribute('data-price');
            if (price) {
                const row = e.target.closest('tr');
                const priceInput = row.querySelector('.item-price');
                priceInput.value = parseFloat(price).toFixed(2);
                calculateRow(priceInput);
            }
        }
    }
});

// Расчет общих сумм
function calculateTotals() {
    const rows = document.querySelectorAll('.item-row');
    let total = 0;
    let totalQuantity = 0;
    
    rows.forEach(row => {
        const sum = parseFloat(row.querySelector('.item-sum').textContent) || 0;
        total += sum;
        
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        totalQuantity += quantity;
    });
    
    // Обновление итогов
    document.getElementById('totalWithoutVAT').textContent = total.toFixed(2);
    document.getElementById('totalQuantity').textContent = totalQuantity;
    
    // Обновление футера
    const totalGrn = Math.floor(total);
    const totalKop = Math.round((total - totalGrn) * 100);
    
    document.getElementById('totalAmount').textContent = totalGrn.toFixed(2);
    document.getElementById('totalAmountKop').textContent = totalKop.toString().padStart(2, '0');
    
    // Сумма прописью (упрощенная версия)
    document.getElementById('totalInWords').textContent = numberToWords(total);
}

// Конвертация числа в слова (базовая версия)
function numberToWords(num) {
    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);
    
    return `${wholePart} грн ${decimalPart.toString().padStart(2, '0')} коп`;
}

// Скачивание PDF
function downloadPDF() {
    const element = document.getElementById('invoice');
    
    const opt = {
        margin: [8, 8, 8, 8],
        filename: `Накладна.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 3, 
            useCORS: true,
            letterRendering: true,
            scrollY: 0,
            scrollX: 0
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: false
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Временно скрываем кнопки управления
    const controls = document.querySelectorAll('.no-print');
    controls.forEach(el => el.style.display = 'none');
    
    // Применяем стили для печати
    document.body.classList.add('pdf-export');
    
    html2pdf().set(opt).from(element).save().then(() => {
        // Возвращаем кнопки
        controls.forEach(el => el.style.display = '');
        document.body.classList.remove('pdf-export');
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем текущую дату
    const now = new Date();
    document.getElementById('invoiceDay').value = now.getDate();
    document.getElementById('invoiceMonth').value = getMonthName(now.getMonth());
    document.getElementById('invoiceYear').value = now.getFullYear().toString().substr(-2);
    
    // Начальный расчет
    calculateTotals();
});

// Получение названия месяца на украинском
function getMonthName(month) {
    const months = [
        'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
        'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
    ];
    return months[month];
}
