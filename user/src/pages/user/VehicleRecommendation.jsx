import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Mountain, MapPin, Thermometer, Navigation, Wind,
  ArrowRight, ArrowLeft, Send, Bot, Sparkles, AlertTriangle,
  CheckCircle, Shield, Lightbulb
} from 'lucide-react';
import { getTerrainRecommendation } from '../../../../AI-chatboc/chatbotService';
import { sendChatMessage } from '../../../../AI-chatboc/chatbotService';
import { useVehicles } from '../../hooks/useVehicles';
import { normalizeVehicle } from '../../utils/vehicleMapper';
import './VehicleRecommendation.css';

// Vehicle category → real photo mapping
const categoryImages = {
  'suv': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=200&h=200&q=80',
  'jeep': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=200&h=200&q=80',
  'sedan': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=200&h=200&q=80',
  'hatchback': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=200&h=200&q=80',
  'motorcycle': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=200&h=200&q=80',
  'scooter': 'https://images.unsplash.com/photo-1571150700464-bc4e2e40f29e?auto=format&fit=crop&w=200&h=200&q=80',
  'van': 'https://images.unsplash.com/photo-1543796076-c4a1e4033477?auto=format&fit=crop&w=200&h=200&q=80',
  'bus': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=200&h=200&q=80',
  'pickup': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=200&h=200&q=80',
  'default': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=200&h=200&q=80',
};

const getCategoryImage = (category) => {
  const lower = category.toLowerCase();
  for (const [key, url] of Object.entries(categoryImages)) {
    if (lower.includes(key)) return url;
  }
  return categoryImages.default;
};

const getSuitabilityColor = (score) => {
  if (score >= 80) return '#34d399';
  if (score >= 60) return '#60a5fa';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const getDifficultyClass = (difficulty) => {
  const d = (difficulty || '').toLowerCase();
  if (d.includes('extreme')) return 'extreme';
  if (d.includes('challenging')) return 'challenging';
  if (d.includes('moderate')) return 'moderate';
  return 'easy';
};

const parsePercent = (str) => {
  if (!str) return 0;
  const match = String(str).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 50;
};

export default function VehicleRecommendation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

  // Parse terrain context from URL params
  const terrainContext = {
    province: searchParams.get('province') || 'Unknown',
    terrain: searchParams.get('terrain') || 'All Terrain',
    altitude: searchParams.get('altitude') || '-',
    temp: searchParams.get('temp') || '-',
    routes: (searchParams.get('routes') || '').split(',').filter(Boolean),
    description: searchParams.get('desc') || '',
    color: searchParams.get('color') || '#e8732a',
  };

  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Follow-up chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Real vehicles from DB
  const { vehicles: dbVehicles, loading: vehiclesLoading } = useVehicles();
  const vehicles = dbVehicles.map(normalizeVehicle);

  // Fetch recommendation on mount
  useEffect(() => {
    let mounted = true;

    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTerrainRecommendation(terrainContext);
        if (mounted) {
          setRecommendation(result);
        }
      } catch (err) {
        console.error('[Recommendation] Error:', err);
        if (mounted) {
          setError('Failed to get recommendation. Please try again.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRecommendation();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Match vehicles from DB based on recommendation categories
  const getMatchedVehicles = () => {
    if (!recommendation || !vehicles.length) return [];

    const recCategories = recommendation.recommendations || [];
    const topCategories = recCategories
      .filter(r => r.suitability >= 60)
      .map(r => r.category.toLowerCase());

    return vehicles.filter(v => {
      const vType = (v.type || '').toLowerCase();
      const vCategory = (v.category || '').toLowerCase();
      return topCategories.some(cat => {
        if (cat.includes('suv') || cat.includes('jeep')) return vType === 'suv' || vType === 'jeep' || vCategory.includes('ice') || vCategory.includes('all');
        if (cat.includes('sedan') || cat.includes('hatchback')) return vType === 'car' || vType === 'sedan' || vCategory.includes('valley');
        if (cat.includes('motorcycle')) return vType === 'bike' || vType === 'motorcycle';
        if (cat.includes('scooter')) return vType === 'scooter';
        if (cat.includes('pickup')) return vType === 'pickup' || vType === 'truck';
        if (cat.includes('van') || cat.includes('bus')) return vType === 'van' || vType === 'bus';
        return false;
      });
    }).slice(0, 6);
  };

  // Handle follow-up chat
  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const contextPrefix = `[Context: User is looking at vehicles for ${terrainContext.province}, ${terrainContext.terrain} terrain, altitude ${terrainContext.altitude}] `;
      const response = await sendChatMessage(contextPrefix + userMsg);
      setChatMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const matchedVehicles = getMatchedVehicles();

  return (
    <div className="recommend-page">
      <div className="recommend-container">

        {/* Header */}
        <div className="recommend-header">
          <div className="recommend-badge">
            <Sparkles size={12} /> AI VEHICLE RECOMMENDATION
          </div>
          <h1 className="recommend-title">
            Best Vehicles for {terrainContext.province}
          </h1>
          <p className="recommend-subtitle">
            Our AI analyzes terrain, altitude, and road conditions to recommend the perfect vehicle for your journey.
          </p>
        </div>

        {/* Terrain Context Card */}
        <div className="terrain-context-card">
          <div className="terrain-context-header">
            <div className="terrain-icon-wrap" style={{
              background: terrainContext.color + '15',
              border: `1px solid ${terrainContext.color}30`,
            }}>
              <Mountain size={24} color={terrainContext.color} />
            </div>
            <div>
              <h2 className="terrain-context-name">{terrainContext.province}</h2>
              <span className="terrain-context-type" style={{ color: terrainContext.color }}>
                {terrainContext.terrain}
              </span>
            </div>
          </div>

          <p style={{ color: '#999', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {terrainContext.description}
          </p>

          <div className="terrain-stats-row">
            <div className="terrain-stat-box">
              <Navigation size={14} color="#888" style={{ marginBottom: '6px' }} />
              <div className="terrain-stat-label">Altitude</div>
              <div className="terrain-stat-value">{terrainContext.altitude}</div>
            </div>
            <div className="terrain-stat-box">
              <Thermometer size={14} color="#888" style={{ marginBottom: '6px' }} />
              <div className="terrain-stat-label">Temperature</div>
              <div className="terrain-stat-value">{terrainContext.temp}</div>
            </div>
            <div className="terrain-stat-box">
              <Wind size={14} color="#888" style={{ marginBottom: '6px' }} />
              <div className="terrain-stat-label">Routes</div>
              <div className="terrain-stat-value">{terrainContext.routes.length}</div>
            </div>
          </div>

          {terrainContext.routes.length > 0 && (
            <div className="terrain-routes-list">
              {terrainContext.routes.map((route) => (
                <span key={route} className="terrain-route-tag">
                  <MapPin size={12} color={terrainContext.color} />
                  {route}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="ai-loading-container">
            <div className="ai-loading-spinner" />
            <p className="ai-loading-text">
              Analyzing terrain
              <span className="ai-loading-dots">
                <span></span><span></span><span></span>
              </span>
            </p>
            <p className="ai-loading-sub">
              Our AI is checking road conditions, altitude, and weather for {terrainContext.province}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            <AlertTriangle size={32} color="#ef4444" style={{ marginBottom: '12px' }} />
            <p style={{ color: '#fca5a5', fontSize: '0.95rem', marginBottom: '12px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="recommend-cta-btn secondary"
              style={{ margin: '0 auto' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recommendation Results */}
        {recommendation && !loading && (
          <>
            {/* AI Summary */}
            <div className="ai-summary-card">
              <div className="ai-summary-header">
                <Bot size={18} color="#e8732a" />
                <span className="ai-summary-label">AI Analysis</span>
                <span className={`ai-provider-tag ${recommendation.provider}`}>
                  {recommendation.provider === 'gemini' ? '✦ Gemini AI' : '⚡ Smart Match'}
                </span>
              </div>
              <p className="ai-summary-text">{recommendation.summary}</p>
            </div>

            {/* Road Conditions */}
            {recommendation.roadConditions && (
              <div className="road-conditions-card">
                <div className="road-conditions-title">Road Conditions</div>
                <div className="road-conditions-bars">
                  <div className="road-bar-item">
                    <div className="road-bar-label">
                      <span className="road-bar-name">Paved Roads</span>
                      <span className="road-bar-value">{recommendation.roadConditions.paved}</span>
                    </div>
                    <div className="road-bar-track">
                      <div
                        className="road-bar-fill paved"
                        style={{ width: `${parsePercent(recommendation.roadConditions.paved)}%` }}
                      />
                    </div>
                  </div>
                  <div className="road-bar-item">
                    <div className="road-bar-label">
                      <span className="road-bar-name">Off-Road / Unpaved</span>
                      <span className="road-bar-value">{recommendation.roadConditions.offRoad}</span>
                    </div>
                    <div className="road-bar-track">
                      <div
                        className="road-bar-fill offroad"
                        style={{ width: `${parsePercent(recommendation.roadConditions.offRoad)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`difficulty-badge ${getDifficultyClass(recommendation.roadConditions.difficulty)}`}>
                  <Shield size={14} />
                  Difficulty: {recommendation.roadConditions.difficulty}
                </div>
              </div>
            )}

            {/* Recommendation Cards */}
            <div className="recommendations-section">
              <div className="recommendations-title">Vehicle Recommendations</div>
              <div className="recommendation-cards">
                {(recommendation.recommendations || []).map((rec, idx) => {
                  const suitColor = getSuitabilityColor(rec.suitability);
                  return (
                    <div key={idx} className="recommendation-card">
                      <div className="rec-card-header">
                        <div className="rec-card-left">
                          <img
                            src={getCategoryImage(rec.category)}
                            alt={rec.category}
                            className="rec-card-img"
                            loading="lazy"
                          />
                          <div>
                            <h3 className="rec-card-category">{rec.category}</h3>
                            <span className="rec-card-clearance">
                              Ground Clearance: {rec.groundClearance}
                            </span>
                          </div>
                        </div>
                        <div className="suitability-meter">
                          <div className="suitability-score" style={{ color: suitColor }}>
                            {rec.suitability}%
                          </div>
                          <div className="suitability-label">Suitability</div>
                          <div className="suitability-bar">
                            <div
                              className="suitability-bar-fill"
                              style={{
                                width: `${rec.suitability}%`,
                                background: `linear-gradient(90deg, ${suitColor}88, ${suitColor})`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="rec-card-reason">{rec.reason}</p>

                      {rec.bestFor && (
                        <div className="rec-card-best-for">
                          <CheckCircle size={14} color="#34d399" />
                          <span className="rec-card-best-for-label">Best for:</span>
                          {rec.bestFor}
                        </div>
                      )}

                      {rec.warning && (
                        <div className="rec-card-warning">
                          <AlertTriangle size={14} color="#fca5a5" style={{ flexShrink: 0, marginTop: '2px' }} />
                          {rec.warning}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            {recommendation.tips && recommendation.tips.length > 0 && (
              <div className="tips-card">
                <div className="tips-title">Travel Tips</div>
                <div className="tips-list">
                  {recommendation.tips.map((tip, idx) => (
                    <div key={idx} className="tip-item">
                      <div className="tip-icon">
                        <Lightbulb size={14} />
                      </div>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Vehicles from DB */}
            {!vehiclesLoading && matchedVehicles.length > 0 && (
              <div className="matched-vehicles-section">
                <div className="matched-vehicles-title">
                  Available Vehicles That Match ({matchedVehicles.length})
                </div>
                <div className="matched-vehicles-grid">
                  {matchedVehicles.map((vehicle, idx) => (
                    <div
                      key={vehicle.id}
                      className="matched-vehicle-card"
                      style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    >
                      {vehicle.image && (
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="matched-vehicle-image"
                          loading="lazy"
                        />
                      )}
                      <div className="matched-vehicle-name">{vehicle.name}</div>
                      <div className="matched-vehicle-type">{vehicle.type} • {vehicle.category}</div>
                      <div>
                        <span className="matched-vehicle-price">NPR {vehicle.price?.toLocaleString()}</span>
                        <span className="matched-vehicle-price-unit">/ day</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Chat */}
            <div className="followup-section">
              <div className="followup-title">
                💬 Ask a follow-up question
              </div>
              {chatMessages.length > 0 && (
                <div className="followup-messages">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`followup-msg ${msg.role}`}>
                      {msg.text}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="followup-msg bot" style={{ opacity: 0.6 }}>
                      Thinking...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
              <form className="followup-input-row" onSubmit={handleChatSend}>
                <input
                  type="text"
                  className="followup-input"
                  placeholder="e.g. What if I'm traveling with 5 people?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  className="followup-send-btn"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="recommend-cta-row">
              <Link to={`/vehicles?terrain=${encodeURIComponent(terrainContext.terrain)}`} className="recommend-cta-btn primary">
                Browse All {terrainContext.terrain} Vehicles <ArrowRight size={16} />
              </Link>
              <Link to="/terrain" className="recommend-cta-btn secondary">
                <ArrowLeft size={16} /> Change Terrain
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
