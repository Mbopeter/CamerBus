import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Flag, CalendarDays, Clock, Search, BusFront, Package, Ticket, ArrowRight, Star, ArrowDownUp, AlertTriangle } from 'lucide-react';
import { companyService, branchService } from '../api/endpoints';
import { getCompanyLogo } from '../utils/companyLogos';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import './Home.css';

const MAJOR_CITIES = [
  { id: 1,  name: 'Yaoundé',   region: 'Centre' },
  { id: 2,  name: 'Douala',    region: 'Littoral' },
  { id: 3,  name: 'Bamenda',   region: 'North West' },
  { id: 4,  name: 'Bafoussam', region: 'West' },
  { id: 5,  name: 'Buea',      region: 'South West' },
  { id: 6,  name: 'Limbe',     region: 'South West' },
  { id: 7,  name: 'Ngaoundéré',region: 'Adamawa' },
  { id: 8,  name: 'Garoua',    region: 'North' },
  { id: 9,  name: 'Maroua',    region: 'Far North' },
  { id: 10, name: 'Bertoua',   region: 'East' },
  { id: 11, name: 'Ebolowa',   region: 'South' },
  { id: 12, name: 'Kumba',     region: 'South West' },
];

const POPULAR_ROUTES = [
  { from: 'Bamenda', to: 'Yaoundé', price: '6,500', duration: '6h' },
  { from: 'Douala',  to: 'Yaoundé', price: '4,000', duration: '4h' },
  { from: 'Bamenda', to: 'Douala',  price: '6,000', duration: '6h' },
  { from: 'Yaoundé', to: 'Buea',   price: '6,000', duration: '6h' },
  { from: 'Douala',  to: 'Buea',   price: '2,000', duration: '1h15' },
  { from: 'Bamenda', to: 'Buea',   price: '6,500', duration: '6h' },
];

const SHIFT_SLOTS = [
  { key: 'morning', label: 'Day Shift',   time: '10:00 AM', icon: '☀️' },
  { key: 'night',   label: 'Night Shift', time: '8:00 PM',  icon: '🌙' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setSearch, setBranches, setTravelTime, travelTime } = useBookingStore();

  const [fromCity, setFromCity] = useState<any>(null);
  const [toCity,   setToCity]   = useState<any>(null);
  const [fromBranch, setFromBranch] = useState<any>(null);
  const [toBranch,   setToBranch]   = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo,   setShowTo]   = useState(false);
  const [expandedCity, setExpandedCity] = useState<number | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll().then(r => r.data.data),
    staleTime: 60000,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getAll().then(r => r.data.data),
    staleTime: 60000,
  });

  const getLabel = (city: any, branch: any) => {
    if (!city) return 'Select city';
    if (branch) return `${branch.name} (${city.name})`;
    return city.name;
  };

  const handleCitySelect = (city: any, type: 'from' | 'to') => {
    const cityBranches = branches.filter((b: any) => b.city_id === city.id || b.city_name === city.name);
    if (cityBranches.length > 0) {
      setExpandedCity(expandedCity === city.id ? null : city.id);
    } else {
      if (type === 'from') { setFromCity(city); setFromBranch(null); setShowFrom(false); }
      else                 { setToCity(city);   setToBranch(null);   setShowTo(false); }
      setExpandedCity(null);
    }
  };

  const handleBranchSelect = (city: any, branch: any, type: 'from' | 'to') => {
    if (type === 'from') { setFromCity(city); setFromBranch(branch); setShowFrom(false); }
    else                 { setToCity(city);   setToBranch(branch);   setShowTo(false); }
    setExpandedCity(null);
  };

  const handleSearch = () => {
    if (!fromCity || !toCity || !travelTime) return;
    const searchDate = `${date}T${travelTime}`;
    setSearch(fromCity, toCity, searchDate);
    setBranches(fromBranch, toBranch);
    navigate('/search');
  };

  const handleSwap = () => {
    const tC = fromCity; const tB = fromBranch;
    setFromCity(toCity); setFromBranch(toBranch);
    setToCity(tC);       setToBranch(tB);
    setTravelTime('');
  };

  const canSearch = fromCity && toCity && travelTime;

  return (
    <div className="home-page">
      {/* Hero Header */}
      <div className="home-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-greeting">{greeting}, <strong>{user?.full_name?.split(' ')[0] ?? '👋'}</strong></p>
          <h1 className="hero-title">Where are you<br />travelling today?</h1>
          <p className="hero-sub">Search routes, pick seats & book in minutes</p>
        </div>
      </div>

      {/* Search Card */}
      <div className="search-card glass-panel">
        <h3 className="search-card-title">🔍 Find a Trip</h3>

        <div className="search-fields">
          {/* From */}
          <div className="search-field-wrapper">
            <button id="from-btn" className="search-field" onClick={() => { setShowFrom(!showFrom); setShowTo(false); }}>
              <MapPin size={18} className="sf-icon" />
              <div className="sf-text">
                <span className="sf-label">From</span>
                <span className={`sf-value ${!fromCity ? 'placeholder' : ''}`}>{getLabel(fromCity, fromBranch)}</span>
              </div>
            </button>
            {showFrom && (
              <div className="city-dropdown">
                {MAJOR_CITIES.map(city => {
                  const cityBranches = branches.filter((b: any) => b.city_id === city.id || b.city_name === city.name);
                  return (
                    <div key={city.id}>
                      <button className={`city-item ${expandedCity === city.id ? 'expanded' : ''}`}
                        onClick={() => handleCitySelect(city, 'from')}>
                        <div>
                          <div className="city-name">{city.name}</div>
                          <div className="city-region">{city.region}</div>
                        </div>
                        {cityBranches.length > 0 && <span>{expandedCity === city.id ? '▲' : '▼'}</span>}
                      </button>
                      {expandedCity === city.id && (
                        <div className="branch-list">
                          <button className="branch-item" onClick={() => handleBranchSelect(city, null, 'from')}>
                            <MapPin size={14} /> All branches in {city.name}
                          </button>
                          {cityBranches.map((b: any) => (
                            <button key={b.id} className="branch-item" onClick={() => handleBranchSelect(city, b, 'from')}>
                              <MapPin size={14} color="#4f46e5" /> {b.name}
                              {b.address && <span className="branch-addr"> – {b.address}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Swap */}
          <button id="swap-btn" className="swap-btn" onClick={handleSwap} title="Swap cities">
            <ArrowDownUp size={16} />
          </button>

          {/* To */}
          <div className="search-field-wrapper">
            <button id="to-btn" className="search-field" onClick={() => { setShowTo(!showTo); setShowFrom(false); }}>
              <Flag size={18} className="sf-icon" />
              <div className="sf-text">
                <span className="sf-label">To</span>
                <span className={`sf-value ${!toCity ? 'placeholder' : ''}`}>{getLabel(toCity, toBranch)}</span>
              </div>
            </button>
            {showTo && (
              <div className="city-dropdown">
                {MAJOR_CITIES.map(city => {
                  const cityBranches = branches.filter((b: any) => b.city_id === city.id || b.city_name === city.name);
                  return (
                    <div key={city.id}>
                      <button className={`city-item ${expandedCity === city.id ? 'expanded' : ''}`}
                        onClick={() => handleCitySelect(city, 'to')}>
                        <div>
                          <div className="city-name">{city.name}</div>
                          <div className="city-region">{city.region}</div>
                        </div>
                        {cityBranches.length > 0 && <span>{expandedCity === city.id ? '▲' : '▼'}</span>}
                      </button>
                      {expandedCity === city.id && (
                        <div className="branch-list">
                          <button className="branch-item" onClick={() => handleBranchSelect(city, null, 'to')}>
                            <MapPin size={14} /> All branches in {city.name}
                          </button>
                          {cityBranches.map((b: any) => (
                            <button key={b.id} className="branch-item" onClick={() => handleBranchSelect(city, b, 'to')}>
                              <MapPin size={14} color="#4f46e5" /> {b.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="search-field date-field">
            <CalendarDays size={18} className="sf-icon" />
            <div className="sf-text">
              <span className="sf-label">Date</span>
              <input
                id="travel-date"
                type="date"
                className="date-input"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Shift */}
          <div className="shift-section">
            <div className="shift-label-row">
              <Clock size={16} />
              <span>Departure Shift <span className="required">*</span></span>
            </div>
            <div className="shift-buttons">
              {SHIFT_SLOTS.map(slot => (
                <button
                  key={slot.key}
                  id={`shift-${slot.key}`}
                  className={`shift-btn ${travelTime === slot.key ? 'active' : ''}`}
                  onClick={() => setTravelTime(slot.key)}
                >
                  <span className="shift-emoji">{slot.icon}</span>
                  <span className="shift-name">{slot.label}</span>
                  <span className="shift-time">{slot.time}</span>
                </button>
              ))}
            </div>
            {!travelTime && (
              <p className="shift-warning"><AlertTriangle size={12} /> Please select a departure shift</p>
            )}
          </div>
        </div>

        <button
          id="search-btn"
          className={`btn-primary search-submit ${!canSearch ? 'disabled' : ''}`}
          onClick={handleSearch}
          disabled={!canSearch}
        >
          <Search size={18} /> Search Trips
        </button>
      </div>

      {/* Quick Actions */}
      <section className="home-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          {[
            { icon: <BusFront size={28} />, label: 'Book Bus', to: '/companies' },
            { icon: <Package size={28} />,  label: 'Send Parcel', to: '/parcels/send' },
            { icon: <Search size={28} />,   label: 'Track Parcel', to: '/parcels/track' },
            { icon: <Ticket size={28} />,   label: 'My Tickets', to: '/tickets' },
          ].map(({ icon, label, to }) => (
            <button key={label} className="quick-action glass-card" onClick={() => navigate(to)}>
              <div className="quick-icon">{icon}</div>
              <span className="quick-label">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section className="home-section">
        <h2 className="section-title">Popular Routes</h2>
        <div className="routes-grid">
          {POPULAR_ROUTES.map((r, i) => (
            <button key={i} className={`route-card ${i % 2 === 0 ? 'primary' : 'secondary'}`}
              onClick={() => { setFromCity({ name: r.from }); setToCity({ name: r.to }); }}>
              <div className="route-cities">
                <span>{r.from}</span>
                <ArrowRight size={14} />
                <span>{r.to}</span>
              </div>
              <div className="route-meta">
                <span className="route-price">{r.price} XAF</span>
                <span className="route-dur">⏱ {r.duration}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">All Companies</h2>
          <button className="see-all" onClick={() => navigate('/companies')}>See all →</button>
        </div>
        {loadingCompanies ? (
          <div className="loading-grid">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="companies-list">
            {companies.map((co: any) => (
              <button key={co.id} className="company-card glass-card" onClick={() => navigate(`/companies/${co.id}`)}>
                <img src={getCompanyLogo(co.name)} alt={co.name} className="company-logo" />
                <div className="company-info">
                  <div className="company-name">{co.name}</div>
                  <div className="company-meta">{co.route_count ?? 0} routes · {co.branch_count ?? 0} branches</div>
                </div>
                <div className="company-rating">
                  <Star size={12} fill="#E5BC00" color="#E5BC00" />
                  <span>{co.rating ?? '4.5'}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
