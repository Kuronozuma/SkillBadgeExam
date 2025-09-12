import { test, vi, expect } from 'vitest'
import { api } from '../services/api'

test('api.fetchDashboard returns expected shape', async () => {
  const data = await api.fetchDashboard()
  expect(data).toHaveProperty('most')
  expect(data).toHaveProperty('least')
  expect(data).toHaveProperty('topCustomer')
  expect(Array.isArray(data.categories)).toBeTruthy()
})
