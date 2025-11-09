import React, { useState, useCallback } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { uploadAPI } from '../api';

const IssueForm = ({ issue = null, location, onSubmit, onCancel }) => {
  const isEditing = !!issue;

  const [formData, setFormData] = useState({
    title: issue?.title || '',
    description: issue?.description || '',
    severity: issue?.severity || 'medium',
    tags: issue?.tags?.join(', ') || '',
    location: issue?.location || location,
  });

  const [photos, setPhotos] = useState(issue?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const response = await uploadAPI.uploadImage(file);
        return response.data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrors((prev) => ({ ...prev, photos: 'Failed to upload images' }));
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxSize: 5242880, // 5MB
    multiple: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const issueData = {
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        tags: tagsArray,
        location: {
          type: 'Point',
          coordinates: [formData.location.lng, formData.location.lat],
        },
        photos: photos,
      };

      await onSubmit(issueData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Title */}
      <Form.Group className="mb-3">
        <Form.Label>Issue Title *</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          isInvalid={!!errors.title}
          placeholder="e.g., Broken streetlight on Main St"
        />
        <Form.Control.Feedback type="invalid">
          {errors.title}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Description */}
      <Form.Group className="mb-3">
        <Form.Label>Description *</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="description"
          value={formData.description}
          onChange={handleChange}
          isInvalid={!!errors.description}
          placeholder="Describe the issue in detail..."
        />
        <Form.Control.Feedback type="invalid">
          {errors.description}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          {formData.description.length} characters
        </Form.Text>
      </Form.Group>

      <Row>
        {/* Severity */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Severity *</Form.Label>
            <Form.Select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
            >
              <option value="low">Low - Minor inconvenience</option>
              <option value="medium">Medium - Needs attention</option>
              <option value="high">High - Safety concern</option>
              <option value="critical">Critical - Immediate danger</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Tags */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Tags (comma separated)</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., pothole, road, safety"
            />
            <Form.Text className="text-muted">
              Common: pothole, lamp, bench, graffiti, trash
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Location */}
      <Form.Group className="mb-3">
        <Form.Label>Location *</Form.Label>
        {formData.location ? (
          <Alert variant="success" className="mb-0">
            ✓ Location selected: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
          </Alert>
        ) : (
          <Alert variant="warning" className="mb-0">
            {errors.location || 'Click on the map to select location'}
          </Alert>
        )}
      </Form.Group>

      {/* Photo Upload */}
      <Form.Group className="mb-3">
        <Form.Label>Photos (optional)</Form.Label>
        <div
          {...getRootProps()}
          className={`border border-2 border-dashed rounded p-4 text-center ${
            isDragActive ? 'border-primary bg-light' : 'border-secondary'
          }`}
          style={{ cursor: 'pointer' }}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <p className="mb-0">Uploading...</p>
          ) : isDragActive ? (
            <p className="mb-0">Drop the images here...</p>
          ) : (
            <div>
              <p className="mb-1">📷 Drag & drop images here, or click to select</p>
              <small className="text-muted">Max 5MB per image</small>
            </div>
          )}
        </div>
        {errors.photos && (
          <div className="text-danger small mt-1">{errors.photos}</div>
        )}
      </Form.Group>

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="mb-3">
          <Row className="g-2">
            {photos.map((photo, index) => (
              <Col xs={6} md={4} key={index}>
                <div className="position-relative">
                  <img
                    src={photo}
                    alt={`Preview ${index + 1}`}
                    className="img-fluid rounded"
                    style={{ height: '120px', width: '100%', objectFit: 'cover' }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1"
                    onClick={() => handleRemovePhoto(index)}
                    style={{ padding: '2px 8px' }}
                  >
                    ✕
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="d-flex gap-2 justify-content-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={loading || uploading}
        >
          {loading ? 'Submitting...' : isEditing ? 'Update Issue' : 'Report Issue'}
        </Button>
      </div>
    </Form>
  );
};

export default IssueForm;