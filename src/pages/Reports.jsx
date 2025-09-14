import React, { useState, useEffect } from 'react'
import { mockVapeCatalogue } from '../data/mockVapeData'
import '../styles/pages/Reports.css'
import Card from '../components/Card'

export default function Reports(){
  const [activeTab, setActiveTab] = useState('catalogue');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [salesData] = useState({
    quantitySold: [
      { name: "Mango Ice 60ml", value: 3 },
      { name: "Grape Juice 30ml", value: 8 },
      { name: "Pod device", value: 16 }
    ],
    productTypes: {
      "E-Liquids": 60,
      "Devices": 25,
      "Accessories": 15
    }
  });
  
  useEffect(() => {
    // Simulating API call with mock data
    setTimeout(() => {
      setData({
        catalogue: mockVapeCatalogue,
        inventory: mockVapeCatalogue.map(item => ({
          id: item.id,
          name: item.name,
          ordered: Math.floor(Math.random() * 100),
        })),
        clients: Array.from({length: 10}, (_, i) => ({
          id: i + 1,
          name: `Client ${i + 1}`,
          orders: Math.floor(Math.random() * 50) + 1,
        }))
      });
      setIsLoading(false);
    }, 500);
  }, []);
  
  // Generate mock sales data if needed
  const generateMockSalesData = () => {
    return {
      monthly: [
        { month: 'January', sales: 85000 },
        { month: 'February', sales: 72000 },
        { month: 'March', sales: 79000 },
        { month: 'April', sales: 82000 },
        { month: 'May', sales: 95000 },
        { month: 'June', sales: 102000 }
      ]
    };
  };
  
  // Generate mock clients data if needed
  const generateMockClientsData = () => {
    return {
      top: [
        { name: 'Vapor World', purchases: 120000, location: 'Makati' },
        { name: 'Cloud Chasers', purchases: 85000, location: 'Quezon City' },
        { name: 'Vape Central', purchases: 78000, location: 'Manila' },
        { name: 'Smoke Haven', purchases: 65000, location: 'Pasig' },
        { name: 'E-Liquid Express', purchases: 52000, location: 'Taguig' }
      ]
    };
  };
  
  if(isLoading) {
    return (
      <div>
        <h2>Reports</h2>
        <div className="loading-container">
          <Card>
            <div className="loading-spinner">Loading report data...</div>
          </Card>
        </div>
      </div>
    )
  }
  
  if(!data) {
    return (
      <div>
        <h2>Reports</h2>
        <Card>
          <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>
            Failed to load report data. Please try again later.
          </div>
        </Card>
      </div>
    )
  }
  return (
    <div className="reports-page">
      <h1>Reports</h1>
      
      <div className="reports-grid">
        <div className="chart-container bar-chart">
          <div className="chart-title">Quantity Sold</div>
          <div className="bar-chart-container">
            <div className="y-axis">
              <div>20</div>
              <div>15</div>
              <div>10</div>
              <div>5</div>
              <div>0</div>
            </div>
            <div className="bars-container">
              {salesData.quantitySold.map((item, index) => (
                <div key={index} className="bar-item">
                  <div 
                    className="bar" 
                    style={{ height: `${item.value * 5}px` }}
                  ></div>
                  <div className="bar-label">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="chart-container pie-chart">
          <div className="chart-title">Sales</div>
          <div className="pie-chart-container">
            <div className="pie-chart-visual"></div>
            <div className="pie-legend">
              <div className="legend-item">
                <div className="legend-color color-1"></div>
                <div className="legend-label">E-Liquids (flavors/juice)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color color-2"></div>
                <div className="legend-label">Devices (mods, pods, etc.)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color color-3"></div>
                <div className="legend-label">Accessories (coils, batteries)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="report-tabs">
        <button 
          className={`tab-button ${activeTab === 'catalogue' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalogue')}
        >
          Vape Shop Catalogue
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          Clients
        </button>
        
        <button 
          className={`tab-button ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Summary
        </button>
      </div>
      
      {activeTab === 'catalogue' && (
        <Card title="Mock Vape Shop Catalogue">
          <div className="catalogue-header">
            <div className="catalogue-title">
              <h3>Complete Product Catalogue</h3>
              <p className="catalogue-subtitle">
                Pricing as of mid-2025
              </p>
            </div>
            <div className="catalogue-actions">
              <button className="action-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Export PDF
              </button>
              <button className="action-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.884 6.68a.5.5 0 1 0-.768.64L7.349 10l-2.233 2.68a.5.5 0 0 0 .768.64L8 10.781l2.116 2.54a.5.5 0 0 0 .768-.641L8.651 10l2.233-2.68a.5.5 0 0 0-.768-.64L8 9.219l-2.116-2.54z"/>
                  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                </svg>
                Print
              </button>
            </div>
          </div>
          
          <div className="catalogue-table-container">
            <table className="catalogue-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Brand / Local or Imported</th>
                  <th>Type (Freebase / Salt / Disposable)</th>
                  <th>Flavour Profile</th>
                  <th>Nicotine Strength Options</th>
                  <th>Suggested Price*</th>
                </tr>
              </thead>
              <tbody>
                {data.catalogue.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td className="product-name">{item.name}</td>
                    <td>{item.brand}</td>
                    <td>{item.type}</td>
                    <td>{item.flavor}</td>
                    <td>{item.nicotineStrength}</td>
                    <td className="price-column">{item.priceText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="catalogue-footer">
            <p>*Prices depend on bottle size (20-60 mL), packaging, taxes/import duties & markup. These are approximate street / online shop price ranges in PH as of mid-2025.</p>
          </div>
        </Card>
      )}
      
      {activeTab === 'inventory' && (
        <Card title="Inventory Report">
          <div className="report-description">
            <p>
              This report shows all items in inventory and their current stock levels.
            </p>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.inventory?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td style={{fontWeight: '500'}}>{item.name}</td>
                  <td>{item.ordered || 0}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: (item.ordered || 0) > 50 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                      color: (item.ordered || 0) > 50 ? '#4caf50' : '#ff9800',
                    }}>
                      {(item.ordered || 0) > 50 ? 'High Demand' : 'Normal'}
                    </span>
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </Card>
      )}
      
      {activeTab === 'clients' && (
        <Card title="Client Report">
          <div style={{marginBottom: '16px'}}>
            <p style={{color: 'var(--text-secondary)'}}>
              This report shows client order activity and engagement metrics.
            </p>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client Name</th>
                <th>Total Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.clients?.map(client => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td style={{fontWeight: '500'}}>{client.name}</td>
                  <td>{client.orders || 0}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: (client.orders || 0) > 30 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(102, 178, 255, 0.15)',
                      color: (client.orders || 0) > 30 ? '#4caf50' : 'var(--accent)',
                    }}>
                      {(client.orders || 0) > 30 ? 'Key Account' : 'Regular'}
                    </span>
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </Card>
      )}
      
      {activeTab === 'monthly' && (
        <Card title="Monthly Summary">
          <div style={{marginBottom: '16px'}}>
            <p style={{color: 'var(--text-secondary)'}}>
              This report provides a monthly overview of all inventory activity.
            </p>
          </div>
          
          <div style={{
            background: 'rgba(102, 178, 255, 0.05)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{color: 'var(--accent)', margin: '0 0 10px 0'}}>Performance Highlights</h3>
            <ul style={{color: 'var(--text-secondary)'}}>
              <li>Total Orders: <strong>326</strong></li>
              <li>New Clients: <strong>12</strong></li>
              <li>Revenue Growth: <strong>+14%</strong></li>
              <li>Top Performing Category: <strong>Electronics</strong></li>
            </ul>
          </div>
          
          <p style={{color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic'}}>
            Detailed monthly metrics will be available in the next update.
          </p>
        </Card>
      )}
    </div>
  )
}
