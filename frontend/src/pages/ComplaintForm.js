import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  FaCamera, 
  FaQrcode, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaDoorOpen,
  FaLayerGroup,
  FaUpload,
  FaTimes,
  FaLightbulb,
  FaTint,
  FaChair,
  FaWifi,
  FaThermometerHalf,
  FaBroom,
  FaTools
} from 'react-icons/fa';

const ComplaintForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const qrInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electrical',
    priority: 'medium',
    building: '',
    room: '',
    floor: ''
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'electrical', label: 'Electrical', icon: <FaLightbulb /> },
    { value: 'plumbing', label: 'Plumbing', icon: <FaTint /> },
    { value: 'furniture', label: 'Furniture', icon: <FaChair /> },
    { value: 'wifi', label: 'WiFi/Internet', icon: <FaWifi /> },
    { value: 'heating', label: 'Heating/Cooling', icon: <FaThermometerHalf /> },
    { value: 'cleaning', label: 'Cleaning', icon: <FaBroom /> },
    { value: 'other', label: 'Other', icon: <FaTools /> }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'badge-low' },
    { value: 'medium', label: 'Medium', color: 'badge-medium' },
    { value: 'high', label: 'High', color: 'badge-high' },
    { value: 'urgent', label: 'Urgent', color: 'badge-urgent' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        alert('Please select only image files');
        return false;
      }
      
      if (!isValidSize) {
        alert('File size must be less than 5MB');
        return false;
      }
      
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.building.trim()) {
      newErrors.building = 'Building is required';
    }

    if (!formData.room.trim()) {
      newErrors.room = 'Room is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add images
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post('/complaints', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Complaint submitted successfully!');
      navigate('/complaints');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Error submitting complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <div className="form-header">
        <h1>Submit New Complaint</h1>
        <p>Report a maintenance issue with detailed information</p>
      </div>

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Complaint Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-control ${errors.title ? 'error' : ''}`}
                placeholder="Brief description of the issue"
                required
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-control ${errors.description ? 'error' : ''}`}
                placeholder="Provide detailed information about the issue"
                rows="4"
                required
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <div className="category-selector">
                  {categories.map(category => (
                    <label key={category.value} className="category-option">
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={formData.category === category.value}
                        onChange={handleChange}
                      />
                      <div className="category-content">
                        <div className="category-icon">{category.icon}</div>
                        <span>{category.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <div className="priority-selector">
                {priorities.map(priority => (
                  <label key={priority.value} className="priority-option">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={handleChange}
                    />
                    <span className={`priority-badge ${priority.color}`}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="form-section">
            <h2>Location Details</h2>
            
            <div className="form-group">
              <label htmlFor="building" className="form-label">
                Building *
              </label>
              <div className="input-group">
                <FaBuilding className="input-icon" />
                <input
                  type="text"
                  id="building"
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  className={`form-control ${errors.building ? 'error' : ''}`}
                  placeholder="Enter building name"
                  required
                />
              </div>
              {errors.building && <span className="error-message">{errors.building}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="room" className="form-label">
                Room Number *
              </label>
              <div className="input-group">
                <FaDoorOpen className="input-icon" />
                <input
                  type="text"
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className={`form-control ${errors.room ? 'error' : ''}`}
                  placeholder="Enter room number"
                  required
                />
              </div>
              {errors.room && <span className="error-message">{errors.room}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="floor" className="form-label">
                Floor
              </label>
              <div className="input-group">
                <FaLayerGroup className="input-icon" />
                <input
                  type="text"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter floor number"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-section">
            <h2>Photos (Optional)</h2>
            <p className="section-description">
              Upload photos to help maintenance staff understand the issue better
            </p>

            <div className="image-upload-section">
              <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <FaUpload className="upload-icon" />
                <p>Click to upload images</p>
                <span className="upload-hint">Max 5 images, 5MB each</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              {images.length > 0 && (
                <div className="image-preview">
                  <h3>Uploaded Images ({images.length}/5)</h3>
                  <div className="image-grid">
                    {images.map((image, index) => (
                      <div key={index} className="image-item">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                        />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => removeImage(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .complaint-form-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .form-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .form-header p {
          color: #6c757d;
          font-size: 16px;
        }

        .complaint-form {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          padding: 40px;
        }

        .form-grid {
          display: grid;
          gap: 40px;
        }

        .form-section {
          border-bottom: 1px solid #eee;
          padding-bottom: 30px;
        }

        .form-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .form-section h2 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-description {
          color: #6c757d;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .category-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
        }

        .category-option {
          cursor: pointer;
        }

        .category-option input[type="radio"] {
          display: none;
        }

        .category-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .category-option input[type="radio"]:checked + .category-content {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .category-icon {
          font-size: 24px;
          color: #667eea;
        }

        .priority-selector {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .priority-option {
          cursor: pointer;
        }

        .priority-option input[type="radio"] {
          display: none;
        }

        .priority-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .priority-option input[type="radio"]:checked + .priority-badge {
          border-color: #333;
          transform: scale(1.05);
        }

        .qr-section {
          margin-top: 12px;
        }

        .qr-input-group {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .qr-buttons {
          display: flex;
          gap: 8px;
        }

        .image-upload-section {
          margin-top: 20px;
        }

        .upload-area {
          border: 2px dashed #ddd;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-area:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .upload-icon {
          font-size: 3rem;
          color: #6c757d;
          margin-bottom: 16px;
        }

        .upload-hint {
          font-size: 12px;
          color: #6c757d;
        }

        .image-preview {
          margin-top: 20px;
        }

        .image-preview h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }

        .image-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
        }

        .image-item img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #eee;
        }

        .form-control.error {
          border-color: #dc3545;
        }

        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        @media (max-width: 768px) {
          .complaint-form-container {
            padding: 15px;
          }

          .complaint-form {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .category-selector {
            grid-template-columns: repeat(2, 1fr);
          }

          .priority-selector {
            flex-direction: column;
          }

          .qr-input-group {
            flex-direction: column;
            align-items: stretch;
          }

          .qr-buttons {
            justify-content: center;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ComplaintForm; 