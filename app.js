const state = {
  cars: [
    { id: 1, name: "Tesla Model 3", type: "Electric", dailyRate: 75, monthlyLease: 1200, available: true, mileage: 12400, health: "A'lo" },
    { id: 2, name: "BMW X5", type: "SUV", dailyRate: 110, monthlyLease: 1800, available: true, mileage: 34000, health: "Yaxshi" },
    { id: 3, name: "Mercedes E-Class", type: "Sedan", dailyRate: 95, monthlyLease: 1550, available: false, mileage: 22100, health: "A'lo" },
    { id: 4, name: "Porsche 911 GT3", type: "Sport", dailyRate: 250, monthlyLease: 3800, available: true, mileage: 8500, health: "A'lo" },
    { id: 5, name: "Hyundai Tucson", type: "SUV", dailyRate: 55, monthlyLease: 900, available: true, mileage: 45000, health: "Xizmat Ko'rsatish Kerak" },
  ],
  contracts: [
    { id: "CTR-101", customer: "Sardor Azimov", car: "Mercedes E-Class", type: "Lizing", start: "2026-08-01", end: "2027-08-01", total: "$18,600", status: "Faol" }
  ]
};

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`tab-${tabId}`).classList.add('active');
  event.target.classList.add('active');
}

function renderCars(carList = state.cars) {
  const grid = document.getElementById('car-grid');
  grid.innerHTML = carList.map(car => `
    <div class="car-card">
      <div>
        <span class="car-badge">${car.type}</span>
        <h3>${car.name}</h3>
        <div class="car-specs">
          <p>Yurgan masofasi: ${car.mileage.toLocaleString()} km</p>
          <p>Holati: ${car.available ? '🟢 Bo\'sh' : '🔴 Band'}</p>
        </div>
      </div>
      <div>
        <div class="price-tag">$${car.dailyRate} <small>/ kun</small></div>
        <button 
          class="btn btn-primary" 
          style="width: 100%;" 
          ${!car.available ? 'disabled' : ''} 
          onclick="openBookingModal(${car.id})">
          ${car.available ? 'Band Qilish / Lizing' : 'Band Qilingan'}
        </button>
      </div>
    </div>
  `).join('');

  updateStats();
}

function filterFleet() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const type = document.getElementById('type-filter').value;

  const filtered = state.cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(query);
    const matchesType = type === 'all' || car.type === type;
    return matchesSearch && matchesType;
  });

  renderCars(filtered);
}

function updateStats() {
  document.getElementById('total-cars').innerText = state.cars.length;
  document.getElementById('active-rentals').innerText = state.cars.filter(c => !c.available).length;
}

function openBookingModal(carId) {
  const car = state.cars.find(c => c.id === carId);
  document.getElementById('modal-car-id').value = car.id;
  document.getElementById('modal-car-title').innerText = `${car.name} - Rasmiylashtirish`;
  document.getElementById('booking-modal').style.display = 'flex';
  updateBookingTotal();
}

function closeModal() {
  document.getElementById('booking-modal').style.display = 'none';
}

function updateBookingTotal() {
  const carId = parseInt(document.getElementById('modal-car-id').value);
  const car = state.cars.find(c => c.id === carId);
  if (!car) return;

  const type = document.getElementById('service-type').value;
  const duration = parseInt(document.getElementById('duration').value) || 1;
  const insurance = document.getElementById('insurance-pack').value;

  let baseRate = type === 'rent' ? car.dailyRate : (car.monthlyLease / 30);
  let total = baseRate * duration;

  if (insurance === 'full') {
    total += 15 * duration;
  }

  document.getElementById('modal-rate').innerText = `$${Math.round(baseRate)} / kun`;
  document.getElementById('modal-total-price').innerText = `$${Math.round(total).toLocaleString()}`;
}

function confirmBooking(e) {
  e.preventDefault();
  const carId = parseInt(document.getElementById('modal-car-id').value);
  const car = state.cars.find(c => c.id === carId);
  const customerName = document.getElementById('cust-name').value;
  const type = document.getElementById('service-type').value === 'rent' ? 'Ijara' : 'Lizing';
  const total = document.getElementById('modal-total-price').innerText;

  car.available = false;

  state.contracts.unshift({
    id: `CTR-${Math.floor(100 + Math.random() * 900)}`,
    customer: customerName,
    car: car.name,
    type: type,
    start: new Date().toISOString().split('T')[0],
    end: 'Aktiv',
    total: total,
    status: 'Faol'
  });

  closeModal();
  renderCars();
  renderContracts();
  renderMaintenance();
}

function renderContracts() {
  const tbody = document.getElementById('contracts-table-body');
  tbody.innerHTML = state.contracts.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.customer}</td>
      <td>${c.car}</td>
      <td>${c.type}</td>
      <td>${c.start}</td>
      <td>${c.end}</td>
      <td>${c.total}</td>
      <td><span style="color: var(--success)">${c.status}</span></td>
    </tr>
  `).join('');
}

function runCostComparison() {
  const val = parseFloat(document.getElementById('calc-car-value').value) || 0;
  const months = parseInt(document.getElementById('calc-months').value) || 1;

  const rentMonthlyCost = (val * 0.08);
  const leaseMonthlyCost = (val * 0.035);

  const rentTotal = rentMonthlyCost * months;
  const leaseTotal = leaseMonthlyCost * months;

  document.getElementById('calc-results').innerHTML = `
    <div style="display: flex; gap: 20px; margin-top: 16px;">
      <div style="flex: 1; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
        <h4>Qisqa Muddatli Ijara (Rent)</h4>
        <p>Taxminiy oylik: <strong>$${Math.round(rentMonthlyCost)}</strong></p>
        <p>Jami (${months} oy): <strong>$${Math.round(rentTotal).toLocaleString()}</strong></p>
      </div>
      <div style="flex: 1; background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); padding: 16px; border-radius: 8px;">
        <h4>Uzoq Muddatli Lizing (Lease)</h4>
        <p>Taxminiy oylik: <strong>$${Math.round(leaseMonthlyCost)}</strong></p>
        <p>Jami (${months} oy): <strong>$${Math.round(leaseTotal).toLocaleString()}</strong></p>
        <p style="color: var(--success); margin-top: 8px;">Tejamkorlik: $${Math.round(rentTotal - leaseTotal).toLocaleString()}</p>
      </div>
    </div>
  `;
}

function renderMaintenance() {
  const grid = document.getElementById('maintenance-grid');
  grid.innerHTML = state.cars.map(car => `
    <div class="m-card">
      <h4>${car.name} (${car.type})</h4>
      <p>Masofa: ${car.mileage.toLocaleString()} km</p>
      <p>Texnik Holat: <strong>${car.health}</strong></p>
      <p>Holat: ${car.mileage > 30000 ? '⚠️ Navbatdagi texnik ko\'rik tavsiya etiladi' : '✅ Ideal holatda'}</p>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCars();
  renderContracts();
  runCostComparison();
  renderMaintenance();
});
