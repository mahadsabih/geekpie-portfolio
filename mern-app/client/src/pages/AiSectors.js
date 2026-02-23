import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../context/AuthContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Loader,
  Upload
} from 'lucide-react';
import './Dashboard.css';

const AiSectors = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const response = await api.get('/ai-sectors?status=draft,published&limit=100');
      setSectors(response.data.data);
    } catch (error) {
      console.error('Failed to load AI sectors:', error);
      toast.error('Failed to load AI sectors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ai-sectors/${id}`);
      setSectors(sectors.filter(s => s._id !== id));
      toast.success('AI Sector deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete AI sector');
    }
  };

  const publishToStaticSite = async () => {
    setPublishing(true);
    try {
      const response = await api.post('/generate-static');
      toast.success(response.data.message || 'Static site published successfully!');
    } catch (error) {
      toast.error('Failed to publish static site');
    } finally {
      setPublishing(false);
    }
  };

  const filteredSectors = sectors.filter(sector => {
    const matchesSearch = sector.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sector.shortDescription && sector.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner-icon" size={40} />
        <p>Loading AI sectors...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>AI Sectors</h1>
          <p>Manage your AI sector solutions</p>
        </div>
        <div className="header-actions">
          <button 
            className="publish-btn"
            onClick={publishToStaticSite}
            disabled={publishing}
          >
            {publishing ? (
              <>
                <Loader className="spinner-icon" size={18} />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Publish to Site</span>
              </>
            )}
          </button>
          <Link to="/ai-sectors/new" className="add-btn">
            <Plus size={20} />
            <span>Add AI Sector</span>
          </Link>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search AI sectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="projects-stats">
        <div className="stat-card">
          <span className="stat-value">{sectors.length}</span>
          <span className="stat-label">Total AI Sectors</span>
        </div>
      </div>

      {filteredSectors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Plus size={48} />
          </div>
          <h3>No AI sectors found</h3>
          <p>
            {searchTerm 
              ? 'Try adjusting your search'
              : 'Get started by creating your first AI sector'}
          </p>
          {!searchTerm && (
            <Link to="/ai-sectors/new" className="add-btn">
              <Plus size={20} />
              <span>Add Your First AI Sector</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredSectors.map((sector) => (
            <div key={sector._id} className="project-card">
              <div className="project-thumbnail">
                {sector.thumbnail ? (
                  <img 
                    src={`http://localhost:5000${sector.thumbnail}`} 
                    alt={sector.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%231a1a2e" width="400" height="300"/><text fill="%236b7280" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle">No Image</text></svg>';
                    }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="project-info">
                <h3>{sector.title}</h3>
                <p className="project-description">
                  {sector.shortDescription?.substring(0, 100) || sector.description?.substring(0, 100)}
                  {(sector.shortDescription?.length > 100 || sector.description?.length > 100) ? '...' : ''}
                </p>
                <p className="project-date">{formatDate(sector.createdAt)}</p>
              </div>
              <div className="project-actions">
                <Link to={`/ai-sectors/edit/${sector._id}`} className="action-btn" title="Edit">
                  <Edit size={18} />
                </Link>
                {deleteConfirm === sector._id ? (
                  <div className="confirm-delete">
                    <button 
                      className="confirm-btn yes"
                      onClick={() => handleDelete(sector._id)}
                    >
                      Yes
                    </button>
                    <button 
                      className="confirm-btn no"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button 
                    className="action-btn delete" 
                    onClick={() => setDeleteConfirm(sector._id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AiSectors;
