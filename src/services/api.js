// Use localStorage to persist data
const getLocalStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Default sample data
const defaultData = {
  customers: [
    { id: 1, name: 'Alpha Store', orders: 23, lastOrder: '2025-09-10' },
    { id: 2, name: 'Beta Mart', orders: 5, lastOrder: '2025-08-22' },
    { id: 3, name: 'Gamma Shop', orders: 12, lastOrder: '2025-09-01' }
  ],
  items: [
    { id: 'sku-1', name: 'Rice 50kg', category: 'Food', ordered: 120, stock: 85, price: 39.99, supplier: 'Distributor A' },
    { id: 'sku-2', name: 'Sugar 25kg', category: 'Food', ordered: 40, stock: 30, price: 24.99, supplier: 'Distributor A' },
    { id: 'sku-3', name: 'Soap', category: 'Hygiene', ordered: 10, stock: 100, price: 2.50, supplier: 'Distributor B' },
    { id: 'sku-4', name: 'Cooking Oil 5L', category: 'Food', ordered: 90, stock: 42, price: 15.75, supplier: 'Distributor A' }
  ],
  distributors: [
    { id: 1, name: 'Distributor A', contact: 'alice@dist.com', location: 'East Warehouse' },
    { id: 2, name: 'Distributor B', contact: 'bob@dist.com', location: 'North Warehouse' }
  ],
  warehouse: [
    { id: 1, status: 'received', note: 'OK' },
    { id: 2, status: 'missing', note: 'Expected 10, got 7' }
  ]
};

// Initialize sample data in localStorage if not present
if (!localStorage.getItem('inventory_app_data')) {
  setLocalStorage('inventory_app_data', defaultData);
}

// Get current data from localStorage
const getSample = () => getLocalStorage('inventory_app_data', defaultData);

export const api = {
  // Dashboard data
  fetchDashboard: async () => {
    const sample = getSample();
    // compute most/least ordered
    const most = sample.items.reduce((a, b) => (b.ordered > a.ordered ? b : a));
    const least = sample.items.reduce((a, b) => (b.ordered < a.ordered ? b : a));
    const topCustomer = sample.customers.reduce((a, b) => (b.orders > a.orders ? b : a));
    const categories = [...new Set(sample.items.map(i => i.category))];
    const topItems = [...sample.items].sort((a, b) => b.ordered - a.ordered).slice(0, 5);
    return { most, least, topCustomer, categories, topItems };
  },

  // Basic CRUD operations
  fetchCustomers: async () => getSample().customers,
  fetchDistributors: async () => getSample().distributors,
  fetchWarehouse: async () => getSample().warehouse,
  fetchReports: async () => {
    const sample = getSample();
    return { inventory: sample.items, clients: sample.customers };
  },

  // Inventory specific operations
  fetchInventory: async () => getSample().items,

  getInventoryItem: async (id) => {
    const sample = getSample();
    const item = sample.items.find(i => i.id === id);
    return item ? { ...item } : null;
  },

  createInventoryItem: async (item) => {
    const sample = getSample();
    const newId = `sku-${Date.now()}`;
    const newItem = { ...item, id: newId, ordered: 0 };
    sample.items.push(newItem);
    setLocalStorage('inventory_app_data', sample);
    return newItem;
  },

  updateInventoryItem: async (id, updatedData) => {
    const sample = getSample();
    const index = sample.items.findIndex(i => i.id === id);

    if (index !== -1) {
      sample.items[index] = { ...sample.items[index], ...updatedData };
      setLocalStorage('inventory_app_data', sample);
      return sample.items[index];
    }
    throw new Error('Item not found');
  },

  deleteInventoryItem: async (id) => {
    const sample = getSample();
    const index = sample.items.findIndex(i => i.id === id);

    if (index !== -1) {
      sample.items.splice(index, 1);
      setLocalStorage('inventory_app_data', sample);
      return true;
    }
    throw new Error('Item not found');
  }
}
