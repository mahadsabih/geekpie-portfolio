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

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...');
      console.log('Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
      const response = await api.get('/projects?status=draft,published&limit=100');
      console.log('Projects response:', response.data);
      console.log('Projects data array:', response.data.data);
      console.log('Projects count:', response.data.data?.length);
      setProjects(response.data.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const publishToStaticSite = async () => {
    setPublishing(true);
    try {
      const response = await api.post('/generate-static');
      if (response.data.success) {
        toast.success(response.data.message || 'Static site published successfully!');
      } else {
        toast.error(response.data.message || 'Failed to publish static site');
      }
    } catch (error) {
      console.error('Publish error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to publish static site');
    } finally {
      setPublishing(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.shortDescription && project.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()));
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
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Projects</h1>
          <p>Manage your portfolio projects</p>
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
          <Link to="/projects/new" className="add-btn">
            <Plus size={20} />
            <span>Add Project</span>
          </Link>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="projects-stats">
        <div className="stat-card">
          <span className="stat-value">{projects.length}</span>
          <span className="stat-label">Total Projects</span>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Plus size={48} />
          </div>
          <h3>No projects found</h3>
          <p>
            {searchTerm 
              ? 'Try adjusting your search'
              : 'Get started by creating your first project'}
          </p>
          {!searchTerm && (
            <Link to="/projects/new" className="add-btn">
              <Plus size={20} />
              <span>Add Your First Project</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-thumbnail">
                {project.thumbnail ? (
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
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
                <h3>{project.title}</h3>
                <p className="project-date">{formatDate(project.createdAt)}</p>
              </div>
              <div className="project-actions">
                <Link to={`/projects/edit/${project._id}`} className="action-btn" title="Edit">
                  <Edit size={18} />
                </Link>
                {deleteConfirm === project._id ? (
                  <div className="confirm-delete">
                    <button 
                      className="confirm-btn yes"
                      onClick={() => handleDelete(project._id)}
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
                    onClick={() => setDeleteConfirm(project._id)}
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

export default Dashboard;
