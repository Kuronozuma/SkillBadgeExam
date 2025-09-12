const sample = {
  customers: [
    { id: 1, name: 'Alpha Store', orders: 23, lastOrder: '2025-09-10' },
    { id: 2, name: 'Beta Mart', orders: 5, lastOrder: '2025-08-22' },
    { id: 3, name: 'Gamma Shop', orders: 12, lastOrder: '2025-09-01' }
  ],
  items: [
    { id: 'sku-1', name: 'Rice 50kg', category: 'Food', ordered: 120 },
    { id: 'sku-2', name: 'Sugar 25kg', category: 'Food', ordered: 40 },
    { id: 'sku-3', name: 'Soap', category: 'Hygiene', ordered: 10 },
    { id: 'sku-4', name: 'Cooking Oil 5L', category: 'Food', ordered: 90 }
  ],
  distributors: [
    { id: 1, name: 'Distributor A', contact: 'alice@dist.com' }
  ],
  warehouse: [
    { id: 1, status: 'received', note: 'OK' },
    { id: 2, status: 'missing', note: 'Expected 10, got 7' }
  ]
}

export const api = {
  fetchDashboard: async () => {
    // compute most/least ordered
    const most = sample.items.reduce((a, b) => (b.ordered > a.ordered ? b : a))
    const least = sample.items.reduce((a, b) => (b.ordered < a.ordered ? b : a))
    const topCustomer = sample.customers.reduce((a, b) => (b.orders > a.orders ? b : a))
    const categories = [...new Set(sample.items.map(i => i.category))]
    const topItems = [...sample.items].sort((a,b)=>b.ordered-a.ordered).slice(0,5)
    return { most, least, topCustomer, categories, topItems }
  },
  fetchCustomers: async () => sample.customers,
  fetchDistributors: async () => sample.distributors,
  fetchWarehouse: async () => sample.warehouse,
  fetchReports: async () => ({ inventory: sample.items, clients: sample.customers })
}
