const sample = {
  customers: [
    { id: 1, name: 'Alpha Store', orders: 23 },
    { id: 2, name: 'Beta Mart', orders: 5 },
    { id: 3, name: 'Gamma Shop', orders: 12 }
  ],
  items: [
    { id: 'sku-1', name: 'Rice 50kg', category: 'Food', ordered: 120 },
    { id: 'sku-2', name: 'Sugar 25kg', category: 'Food', ordered: 40 },
    { id: 'sku-3', name: 'Soap', category: 'Hygiene', ordered: 10 }
  ]
}

export const api = {
  fetchDashboard: async () => {
    // compute most/least ordered
    const most = sample.items.reduce((a, b) => (b.ordered > a.ordered ? b : a))
    const least = sample.items.reduce((a, b) => (b.ordered < a.ordered ? b : a))
    const topCustomer = sample.customers.reduce((a, b) => (b.orders > a.orders ? b : a))
    return { most, least, topCustomer, categories: [...new Set(sample.items.map(i => i.category))] }
  },
  fetchCustomers: async () => sample.customers,
  fetchDistributors: async () => [{ id: 1, name: 'Distributor A' }],
  fetchWarehouse: async () => [{ id: 1, status: 'received', note: 'OK' }],
  fetchReports: async () => ({ inventory: sample.items, clients: sample.customers })
}
