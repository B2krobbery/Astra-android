import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstra } from '../context/AstraContext';
import { ArrowLeft, ScrollText, CheckCircle2, Truck, Sparkles, ShoppingBag, MapPin, Heart } from 'lucide-react';
import { PrimaryButton, SecondaryOutlineButton } from '../components/AstraButtons';

const TEMPLATES = [
  { id: 'vedic-gold', name: 'Vedic Gold ✨', bg: 'linear-gradient(135deg, #422006 0%, #1E1B4B 100%)', border: '#F59E0B' },
  { id: 'royal-maratha', name: 'Royal Maratha 👑', bg: 'linear-gradient(135deg, #4C0519 0%, #1E1B4B 100%)', border: '#F43F5E' },
  { id: 'kerala-lotus', name: 'Kerala Lotus 🪷', bg: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)', border: '#34D399' },
  { id: 'pastel-floral', name: 'Pastel Rose 🌸', bg: 'linear-gradient(135deg, #831843 0%, #500724 100%)', border: '#F472B6' }
];

export const DigitalWeddingCardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, selectedCandidate, themeMode } = useAstra();
  const partnerName = selectedCandidate ? selectedCandidate.name : 'Ananya';

  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [weddingDate, setWeddingDate] = useState('2026-11-28');
  const [venue, setVenue] = useState('Leela Palace Grand Ballroom, Bengaluru');
  const [printQuantity, setPrintQuantity] = useState(100);
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Indiranagar 100ft Road, Bengaluru - 560038');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const pricePerCard = 35; // INR
  const totalAmount = printQuantity * pricePerCard;

  const handlePlaceOrder = () => {
    setOrderConfirmed(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: themeMode === 'LIGHT' ? '#FFF5F7' : 'var(--bg-primary)',
        color: 'var(--text-primary)',
        paddingBottom: '40px'
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: themeMode === 'LIGHT' ? 'rgba(255, 245, 247, 0.85)' : 'rgba(15, 12, 27, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <button
          onClick={() => navigate('/discover')}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="heading-font" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
          Digital Wedding Card Studio 💌
        </h1>
      </header>

      <main style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', margin: '0 auto' }}>
        {/* Template Selector Pills */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Select Wedding Card Design</label>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '8px', paddingBottom: '4px' }}>
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '9999px',
                  border: selectedTemplate.id === t.id ? `2px solid ${t.border}` : '1px solid var(--border-color)',
                  background: selectedTemplate.id === t.id ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-card)',
                  color: selectedTemplate.id === t.id ? 'var(--accent-amber-light)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Digital Wedding Card Preview */}
        <div
          style={{
            padding: '24px',
            borderRadius: '28px',
            background: selectedTemplate.bg,
            border: `2px solid ${selectedTemplate.border}`,
            boxShadow: 'var(--shadow-cosmic)',
            textAlign: 'center',
            color: '#FFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--accent-amber-light)', textTransform: 'uppercase' }}>
            ✨ Celestial Union Ceremony ✨
          </div>

          <h2 className="heading-font" style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0', color: '#FFF' }}>
            {userProfile.name} & {partnerName}
          </h2>

          <div style={{ width: '60px', height: '2px', background: 'var(--accent-amber)', margin: '0 auto' }} />

          <p style={{ fontSize: '0.88rem', color: '#F1F5F9', fontStyle: 'italic' }}>
            "Together under the auspicious alignment of Rohini & Uttara Phalguni"
          </p>

          <div style={{ marginTop: '12px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>📅 <strong>Date:</strong> {weddingDate}</div>
            <div>📍 <strong>Venue:</strong> {venue}</div>
            <div>🌟 <strong>Shubh Muhurat:</strong> 10:24 AM (Shukla Paksha)</div>
          </div>
        </div>

        {/* Editable Details Form */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
            Card Event Details
          </h3>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wedding Date</label>
            <input
              type="date"
              value={weddingDate}
              onChange={e => setWeddingDate(e.target.value)}
              style={{
                width: '100%',
                marginTop: '4px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                border: '1px solid var(--border-color)',
                color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFF',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Venue & Address</label>
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              style={{
                width: '100%',
                marginTop: '4px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                border: '1px solid var(--border-color)',
                color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFF',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Physical Print & Delivery E-Commerce Module */}
        <div
          style={{
            padding: '20px',
            borderRadius: '24px',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--accent-amber)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow-cosmic)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--accent-amber)" />
            <h3 className="heading-font" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>
              Order Physical Printed Cards 📦
            </h3>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Print Quantity (Gold Foil Embossed)</label>
            <select
              value={printQuantity}
              onChange={e => setPrintQuantity(Number(e.target.value))}
              style={{
                width: '100%',
                marginTop: '4px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                border: '1px solid var(--border-color)',
                color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFF',
                fontSize: '0.85rem'
              }}
            >
              <option value={50}>50 Physical Cards (₹1,750)</option>
              <option value={100}>100 Physical Cards (₹3,500)</option>
              <option value={250}>250 Physical Cards (₹8,750)</option>
              <option value={500}>500 Physical Cards (₹17,500)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Single Shipping Delivery Address</label>
            <textarea
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                marginTop: '4px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: themeMode === 'LIGHT' ? '#F1F5F9' : '#0F0C1B',
                border: '1px solid var(--border-color)',
                color: themeMode === 'LIGHT' ? '#0F0C1B' : '#FFF',
                fontSize: '0.85rem'
              }}
            />
          </div>

          {/* Price Summary */}
          <div style={{ padding: '12px 16px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Order Value:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-amber-light)' }}>₹{totalAmount.toLocaleString()}</span>
          </div>

          {orderConfirmed ? (
            <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(74, 222, 128, 0.2)', border: '1px solid #4ADE80', color: '#4ADE80', textAlign: 'center', fontWeight: 700, fontSize: '0.88rem' }}>
              ✓ Order Placed! Physical cards will be shipped to your address via BlueDart in 3-5 days.
            </div>
          ) : (
            <PrimaryButton onClick={handlePlaceOrder}>
              <Truck size={18} /> Place Order & Ship Physical Cards (₹{totalAmount.toLocaleString()})
            </PrimaryButton>
          )}
        </div>
      </main>
    </div>
  );
};
