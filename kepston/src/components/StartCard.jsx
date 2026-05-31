import React from 'react';

export default function StartCard({ title, value, icon }) {
  return (
    <div className="card shadow-sm p-3 h-100" style={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff' }}>
      <div className="d-flex justify-content-between align-items-center h-100">
        <div>
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, marginBottom: '6px' }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
            {value}
          </div>
        </div>
        <div style={{ 
          fontSize: '26px', 
          background: '#f8fafc', 
          borderRadius: '12px', 
          width: '52px', 
          height: '52px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}