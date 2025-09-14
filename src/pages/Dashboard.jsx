import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import Card from '../components/Card'
import { mockVapeCatalogue } from '../data/mockVapeData'
import '../styles/pages/Dashboard.css'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Create dashboard data from mock vape catalogue
    setTimeout(() => {
      // Process the mock data to create dashboard metrics
      const dashboardData = processMockDataForDashboard(mockVapeCatalogue);
      setData(dashboardData);
      setIsLoading(false);
    }, 800); // Simulate API delay
  }, [])
  
  // Helper function to process mock data
  const processMockDataForDashboard = (catalogue) => {
    // Extract all types/categories
    const allTypes = [...new Set(catalogue.map(item => item.type))];
    
    // Calculate low stock items
    const lowStockItems = catalogue.filter(item => item.stock < 10);
    
    // Sort by price (using min price)
    const byPrice = [...catalogue].sort((a, b) => (b.price.min) - (a.price.min));
    const mostExpensive = byPrice.slice(0, 3);
    const leastExpensive = [...byPrice].reverse().slice(0, 3);
    
    // Sort by stock
    const byStock = [...catalogue].sort((a, b) => b.stock - a.stock);
    
    // Calculate nicotine strength distribution
    const nicotineTypes = {};
    catalogue.forEach(item => {
      const strengths = item.nicotineStrength.split('/');
      strengths.forEach(s => {
        const clean = s.trim();
        nicotineTypes[clean] = (nicotineTypes[clean] || 0) + 1;
      });
    });
    
    return {
      totalItems: catalogue.length,
      lowStockItems,
      types: allTypes,
      topSellingItems: byStock.slice(0, 5),
      mostExpensiveItems: mostExpensive,
      leastExpensiveItems: leastExpensive,
      nicotineDistribution: Object.entries(nicotineTypes)
        .map(([strength, count]) => ({ strength, count }))
        .sort((a, b) => b.count - a.count)
    };
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <Card>
          <div className="loading-spinner">Loading dashboard data...</div>
        </Card>
      </div>
    )
  }

  if (!data) {
    return <Card>Failed to load dashboard data. Please try again.</Card>
  }

  return (
    <div className="dashboard-container">
      <h2>Vape Shop Dashboard</h2>
      
      <div className="dashboard-grid">
        <Card title="Inventory Overview">
          <div className="stat-large">{data.totalItems}</div>
          <div className="stat-label">Total Products</div>
          <div className="stat-warning">
            {data.lowStockItems.length} items with low stock
          </div>
        </Card>

        <Card title="Product Types">
          <div className="tag-cloud">
            {data.types.map((type, index) => (
              <div key={index} className="product-type-tag">
                {type}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Nicotine Strengths">
          <div className="nic-distribution">
            {data.nicotineDistribution.slice(0, 5).map((item, index) => (
              <div key={index} className="nic-item">
                <span className="nic-strength">{item.strength}</span>
                <div className="nic-bar" style={{ width: `${Math.min(100, item.count * 10)}%` }}></div>
                <span className="nic-count">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="dashboard-grid-2">
        <Card title="Most Expensive Products">
          <div className="product-list">
            {data.mostExpensiveItems.map((item, index) => (
              <div key={index} className="product-list-item">
                <div className="product-name">{item.name}</div>
                <div className="product-price">{item.priceText}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Least Expensive Products">
          <div className="product-list">
            {data.leastExpensiveItems.map((item, index) => (
              <div key={index} className="product-list-item">
                <div className="product-name">{item.name}</div>
                <div className="product-price">{item.priceText}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="full-width">
        <Card title="Top Stock Products">
          <div className="stock-items">
            {data.topSellingItems.map(item => (
              <div key={item.id} className="stock-item">
                <div className="stock-item-header">
                  <div className="stock-item-name">{item.name}</div>
                  <div className="stock-item-count">{item.stock}</div>
                </div>
                <div className="stock-bar-container">
                  <div 
                    className="stock-bar" 
                    style={{ width: `${Math.min(100, item.stock / 50 * 100)}%` }}
                  ></div>
                </div>
                <div className="stock-item-footer">
                  <div className="stock-item-type">{item.type}</div>
                  <div className="stock-item-brand">{item.brand}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="dashboard-action">
            <Link to="/inventory" className="manage-link">
              Manage Inventory →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
