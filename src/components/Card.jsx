import React from 'react'
import '../styles/components/Card.css'

export default function Card({ title, children, className = '', onClick }) {
  const cardProps = {
    className: "card " + className,
    ...(onClick && { onClick }) // Only add onClick if it exists
  };
  
  return (
    <div {...cardProps}>
      {title ? (
        <div className="card-header">
          <div className="card-title">{title}</div>
        </div>
      ) : null}
      <div className="card-body">{children}</div>
    </div>
  )
}
