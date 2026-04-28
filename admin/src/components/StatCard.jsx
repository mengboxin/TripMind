import React from 'react'

export default function StatCard({ icon, label, value, sub, color = '#7c6af7' }) {
  return (
    <div style={{
      background: '#17171f', border: '1px solid #1e1e28', borderRadius: '14px',
      padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ color, fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#8b8a96', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '26px', fontWeight: '700', lineHeight: 1 }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize: '12px', color: '#8b8a96', marginTop: '4px' }}>{sub}</div>}
      </div>
    </div>
  )
}
