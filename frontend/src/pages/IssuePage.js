import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Carousel, Modal, Alert 
} from 'react-bootstrap';
import { formatDistanceToNow, format } from 'date-fns';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { toast } from 'react-toastify';
import { issuesAPI, commentsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import IssueForm from '../components/IssueForm';
import Loader from '../components/Loader';
import L from 'leaflet';

const IssuePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const response = await issuesAPI.getById(id);
      setIssue(response.data.issue);
    } catch (error) {
      console.error('Error fetching issue:', error);
      toast.error('Failed to load issue');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to upvote');
      navigate('/login');
      return;
    }

    setUpvoting(true);
    try {
      const response = await issuesAPI.upvote(id);
      setIssue(response.data.issue);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error upvoting:', error);
      toast.error('Failed to upvote');
    } finally {
      setUpvoting(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleUpdate = async (issueData) => {
    try {
      const response = await issuesAPI.update(id, issueData);
      setIssue(response.data.issue);
      setShowEditModal(false);
      toast.success('Issue updated successfully');
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue');
    }
  };

  const handleDelete = async () => {
    try {
      await issuesAPI.delete(id);
      toast.success('Issue deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Failed to delete issue');
    }
  };

  const handleVerify = async () => {
    try {
      const response = await issuesAPI.verify(id);
      setIssue(response.data.issue);
      toast.success('Issue verified successfully');
    } catch (error) {
      console.error('Error verifying issue:', error);
      toast.error('Failed to verify issue');
    }
  };

  const handleClose = async () => {
    const reason = prompt('Enter reason for closing:');
    if (!reason) return;

    try {
      const response = await issuesAPI.close(id, reason);
      setIssue(response.data.issue);
      toast.success('Issue closed successfully');
    } catch (error) {
      console.error('Error closing issue:', error);
      toast.error('Failed to close issue');
    }
  };

  if (loading) {
    return <Loader fullscreen />;
  }

  if (!issue) {
    return null;
  }

  const isOwner = user?._id === issue.reportedBy?._id;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  const hasUpvoted = issue.upvotedBy?.includes(user?._id);

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          {/* Issue Header */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2>{issue.title}</h2>
                  <div className="d-flex gap-2 mt-2">
                    <Badge bg="" className={`badge-${issue.severity}`}>
                      {issue.severity}
                    </Badge>
                    <Badge bg="" className={`badge-${issue.status}`}>
                      {issue.status}
                    </Badge>
                    {issue.tags?.map((tag, index) => (
                      <Badge key={index} bg="light" text="dark">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-end">
                  <Button
                    variant={hasUpvoted ? 'primary' : 'outline-primary'}
                    onClick={handleUpvote}
                    disabled={upvoting}
                  >
                    👍 {issue.upvotes || 0}
                  </Button>
                </div>
              </div>

              {/* Photos Carousel */}
              {issue.photos && issue.photos.length > 0 && (
                <Carousel className="mb-3">
                  {issue.photos.map((photo, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={photo}
                        alt={`Issue photo ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '400px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}

              {/* Description */}
              <div className="mb-4">
                <h5>Description</h5>
                <p className="text-muted">{issue.description}</p>
              </div>

              {/* Meta Info */}
              <div className="d-flex gap-4 text-muted small mb-3">
                <span>
                  <strong>Reported:</strong>{' '}
                  {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                </span>
                <span>
                  <strong>Views:</strong> {issue.views || 0}
                </span>
                <span>
                  <strong>Comments:</strong> {issue.comments?.length || 0}
                </span>
              </div>

              {/* Reporter Info */}
              <div className="border-top pt-3">
                <small className="text-muted">
                  Reported by <strong>{issue.reportedBy?.name}</strong> on{' '}
                  {format(new Date(issue.createdAt), 'PPP')}
                </small>
              </div>

              {/* Action Buttons */}
              {(isOwner || isAdmin) && (
                <div className="border-top pt-3 mt-3">
                  <div className="d-flex gap-2">
                    {isOwner && issue.status === 'open' && (
                      <>
                        <Button variant="outline-primary" size="sm" onClick={handleEdit}>
                          ✏️ Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          🗑️ Delete
                        </Button>
                      </>
                    )}
                    {isAdmin && issue.status === 'open' && (
                      <Button variant="success" size="sm" onClick={handleVerify}>
                        ✓ Verify
                      </Button>
                    )}
                    {isAdmin && issue.status !== 'closed' && (
                      <Button variant="secondary" size="sm" onClick={handleClose}>
                        ✕ Close Issue
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {issue.status === 'closed' && issue.closedReason && (
                <Alert variant="secondary" className="mt-3 mb-0">
                  <strong>Closed:</strong> {issue.closedReason}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Comments Section */}
          <CommentSection issueId={id} />
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Location Map */}
          <Card className="mb-4">
            <Card.Header>
              <strong>📍 Location</strong>
            </Card.Header>
            <Card.Body className="p-0">
              <MapContainer
                center={[
                  issue.location.coordinates[1],
                  issue.location.coordinates[0],
                ]}
                zoom={15}
                style={{ height: '250px', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[
                    issue.location.coordinates[1],
                    issue.location.coordinates[0],
                  ]}
                />
              </MapContainer>
              <div className="p-3 small text-muted">
                <strong>Coordinates:</strong><br />
                {issue.location.coordinates[1].toFixed(6)},{' '}
                {issue.location.coordinates[0].toFixed(6)}
              </div>
            </Card.Body>
          </Card>

          {/* Stats */}
          <Card>
            <Card.Header>
              <strong>📊 Statistics</strong>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Upvotes</span>
                <strong>{issue.upvotes || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Comments</span>
                <strong>{issue.comments?.length || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Views</span>
                <strong>{issue.views || 0}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Status</span>
                <Badge bg="" className={`badge-${issue.status}`}>
                  {issue.status}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IssueForm
            issue={issue}
            onSubmit={handleUpdate}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this issue? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IssuePage;