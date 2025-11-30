// Добавление новой строки товара
function addRow() {
    const tbody = document.getElementById('invoiceRows');
    const rowCount = tbody.querySelectorAll('.item-row').length + 1;
    
    const newRow = document.createElement('tr');
    newRow.className = 'item-row';
    newRow.innerHTML = `
        <td class="row-number">${rowCount}</td>
        <td><input type="text" class="item-name" aria-label="Найменування товару"></td>
        <td><input type="number" class="item-exchange" value="0" step="1" min="0" oninput="calculateTotals()" aria-label="Обмін"></td>
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
    
    if (e.target.classList.contains('item-exchange')) {
        calculateTotals();
    }
});

// Расчет общих сумм
function calculateTotals() {
    const rows = document.querySelectorAll('.item-row');
    let total = 0;
    let totalExchange = 0;
    let totalQuantity = 0;
    
    rows.forEach(row => {
        const sum = parseFloat(row.querySelector('.item-sum').textContent) || 0;
        total += sum;
        
        const exchange = parseFloat(row.querySelector('.item-exchange').value) || 0;
        totalExchange += exchange;
        
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        totalQuantity += quantity;
    });
    
    // Обновление итогов
    document.getElementById('totalWithoutVAT').textContent = total.toFixed(2);
    document.getElementById('totalExchange').textContent = totalExchange;
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
    // Устанавливаем текущую дату для накладной
    const now = new Date();
    document.getElementById('invoiceDay').value = now.getDate();
    document.getElementById('invoiceMonth').value = getMonthName(now.getMonth());
    document.getElementById('invoiceYear').value = now.getFullYear().toString().substr(-2);
    
    // Устанавливаем текущую дату для таблицы сумм
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear().toString().substr(-2);
    document.getElementById('sumsDate').value = `${day}.${month}.${year}`;
    
    // Начальный расчет
    calculateTotals();
    calculateSumsTotal();
});

// Получение названия месяца на украинском
function getMonthName(month) {
    const months = [
        'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
        'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
    ];
    return months[month];
}

// Переключение вкладок
function showTab(tabName) {
    const invoiceTab = document.getElementById('invoiceTab');
    const sumsTab = document.getElementById('sumsTab');
    const tabInvoice = document.getElementById('tabInvoice');
    const tabSums = document.getElementById('tabSums');

    if (tabName === 'invoice') {
        invoiceTab.classList.remove('hidden');
        sumsTab.classList.add('hidden');
        tabInvoice.classList.add('active');
        tabSums.classList.remove('active');
    } else {
        invoiceTab.classList.add('hidden');
        sumsTab.classList.remove('hidden');
        tabInvoice.classList.remove('active');
        tabSums.classList.add('active');
    }
}

// Добавление новой строки в таблицу сумм
function addSumRow() {
    const tbody = document.getElementById('sumsRows');
    const rowCount = tbody.querySelectorAll('.sum-row').length + 1;
    
    const newRow = document.createElement('tr');
    newRow.className = 'sum-row';
    newRow.innerHTML = `
        <td class="row-number">${rowCount}</td>
        <td><input type="text" class="sum-name" placeholder="Введіть назву" aria-label="Назва"></td>
        <td><input type="number" class="sum-amount" value="0" step="0.01" min="0" oninput="calculateSumsTotal()" aria-label="Сума"></td>
        <td class="no-print"><button onclick="removeSumRow(this)" class="btn-remove">✕</button></td>
    `;
    
    tbody.appendChild(newRow);
}

// Удаление строки из таблицы сумм
function removeSumRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateSumRowNumbers();
    calculateSumsTotal();
}

// Обновление нумерации строк в таблице сумм
function updateSumRowNumbers() {
    const rows = document.querySelectorAll('.sum-row');
    rows.forEach((row, index) => {
        row.querySelector('.row-number').textContent = index + 1;
    });
}

// Расчет общей суммы
function calculateSumsTotal() {
    const rows = document.querySelectorAll('.sum-row');
    let total = 0;
    
    rows.forEach(row => {
        const amount = parseFloat(row.querySelector('.sum-amount').value) || 0;
        total += amount;
    });
    
    document.getElementById('sumsTotal').textContent = total.toFixed(2);
}

// Скачивание PDF для таблицы сумм
function downloadSumsPDF() {
    const element = document.getElementById('sumsTable');
    
    const opt = {
        margin: [8, 8, 8, 8],
        filename: `Сумми.pdf`,
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
    
    const controls = document.querySelectorAll('.no-print');
    controls.forEach(el => el.style.display = 'none');
    
    document.body.classList.add('pdf-export');
    
    html2pdf().set(opt).from(element).save().then(() => {
        controls.forEach(el => el.style.display = '');
        document.body.classList.remove('pdf-export');
    });
}
