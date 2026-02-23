import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  ArrowLeft, 
  X, 
  Loader,
  Image as ImageIcon
} from 'lucide-react';
import './ProjectForm.css';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: 'branding',
    client: '',
    location: '',
    timeline: '',
    status: 'published'
  });

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${id}`);
      const project = response.data.data;
      
      setFormData({
        title: project.title || '',
        description: project.description || '',
        shortDescription: project.shortDescription || '',
        category: project.category || 'branding',
        client: project.client || '',
        location: project.location || '',
        timeline: project.timeline || '',
        status: project.status || 'published'
      });
      
      if (project.thumbnail) {
        setThumbnailPreview(`http://localhost:5000${project.thumbnail}`);
      }
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDescriptionChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    
    if (!isEdit && !thumbnailFile && !thumbnailPreview) {
      toast.error('Thumbnail is required');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      
      if (thumbnailFile) {
        submitData.append('thumbnail', thumbnailFile);
      }

      if (isEdit) {
        await api.put(`/projects/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Project updated successfully');
      } else {
        await api.post('/projects', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Project created successfully');
      }
      
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save project';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner-icon" size={40} />
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className="project-form-page">
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1>{isEdit ? 'Edit Project' : 'Add New Project'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-grid">
          {/* Left Column */}
          <div className="form-main">
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="form-group">
                <label htmlFor="title">Project Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shortDescription">Short Description</label>
                <input
                  type="text"
                  id="shortDescription"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="Brief description for cards (max 300 chars)"
                  maxLength={300}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="client">Client Name</label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    placeholder="Enter client name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="branding">Branding</option>
                    <option value="web-design">Web Design</option>
                    <option value="3d-design">3D Design</option>
                    <option value="ui-ux">UI/UX</option>
                    <option value="motion">Motion</option>
                    <option value="illustration">Illustration</option>
                    <option value="design">Design</option>
                    <option value="mockup">Mockup</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., United Kingdom"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="timeline">Timeline</label>
                  <input
                    type="text"
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    placeholder="e.g., Oct 2023 - Nov 2023"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <ReactQuill
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  theme="snow"
                  placeholder="Write a detailed description of your project..."
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="form-sidebar">
            <div className="form-section">
              <h2>Thumbnail *</h2>
              <div 
                {...getRootProps()} 
                className={`dropzone ${isDragActive ? 'active' : ''} ${thumbnailPreview ? 'has-image' : ''}`}
              >
                <input {...getInputProps()} />
                {thumbnailPreview ? (
                  <div className="thumbnail-preview">
                    <img src={thumbnailPreview} alt="Thumbnail preview" />
                    <button type="button" className="remove-btn" onClick={removeThumbnail}>
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <ImageIcon size={40} />
                    <p>{isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}</p>
                    <span>or click to select</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader className="btn-spinner" size={18} />
                    <span>Saving...</span>
                  </>
                ) : (
                  isEdit ? 'Update Project' : 'Create Project'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
