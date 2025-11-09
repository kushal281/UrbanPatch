import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, 
  Badge, Modal, Form, Alert 
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { issuesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import Loader from './Loader';

const AdminPanel = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issuesAPI.getAll();
      setIssues(response.data.issues || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (issueId) => {
    try {
      await issuesAPI.verify(issueId);
      toast.success('Issue verified successfully');
      fetchIssues();
    } catch (error) {
      console.error('Error verifying issue:', error);
      toast.error('Failed to verify issue');
    }
  };

  const handleClose = (issue) => {
    setSelectedIssue(issue);
    setAction('close');
    setShowModal(true);
  };

  const handleDelete = (issue) => {
    setSelectedIssue(issue);
    setAction('delete');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedIssue) return;

    try {
      if (action === 'close') {
        if (!reason.trim()) {
          toast.error('Please provide a reason');
          return;
        }
        await issuesAPI.close(selectedIssue._id, reason);
        toast.success('Issue closed successfully');
      } else if (action === 'delete') {
        await issuesAPI.delete(selectedIssue._id);
        toast.success('Issue deleted successfully');
      }
      
      setShowModal(false);
      setSelectedIssue(null);
      setReason('');
      fetchIssues();
    } catch (error) {
      console.error(`Error ${action}ing issue:`, error);
      toast.error(`Failed to ${action} issue`);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await issuesAPI.export(format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `issues-export-${Date.now()}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export issues');
    }
  };

  const getStats = () => {
    return {
      total: issues.length,
      open: issues.filter((i) => i.status === 'open').length,
      verified: issues.filter((i) => i.status === 'verified').length,
      closed: issues.filter((i) => i.status === 'closed').length,
      critical: issues.filter((i) => i.severity === 'critical').length,
    };
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          You don't have permission to access this page.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <Loader fullscreen />;
  }

  const stats = getStats();

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">{stats.total}</h3>
              <small className="text-muted">Total Issues</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">{stats.open}</h3>
              <small className="text-muted">Open Issues</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">{stats.verified}</h3>
              <small className="text-muted">Verified Issues</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-danger">{stats.critical}</h3>
              <small className="text-muted">Critical Issues</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Export Buttons */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Export Data</h5>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleExport('csv')}
              >
                📊 Export CSV
              </Button>
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleExport('geojson')}
              >
                🗺️ Export GeoJSON
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Issues Table */}
      <Card>
        <Card.Header>
          <strong>All Issues</strong>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Reporter</th>
                <th>Upvotes</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    <a href={`/issues/${issue._id}`} className="text-decoration-none">
                      {issue.title}
                    </a>
                  </td>
                  <td>
                    <Badge bg="" className={`badge-${issue.status}`}>
                      {issue.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="" className={`badge-${issue.severity}`}>
                      {issue.severity}
                    </Badge>
                  </td>
                  <td>{issue.reportedBy?.name || 'Unknown'}</td>
                  <td>{issue.upvotes || 0}</td>
                  <td>
                    {formatDistanceToNow(new Date(issue.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      {issue.status === 'open' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleVerify(issue._id)}
                        >
                          ✓
                        </Button>
                      )}
                      {issue.status !== 'closed' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleClose(issue)}
                        >
                          ✕
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(issue)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Action Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {action === 'close' ? 'Close Issue' : 'Delete Issue'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {action === 'close' ? (
            <Form.Group>
              <Form.Label>Reason for closing *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this issue is being closed..."
              />
            </Form.Group>
          ) : (
            <Alert variant="warning">
              Are you sure you want to delete this issue? This action cannot be undone.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant={action === 'close' ? 'primary' : 'danger'}
            onClick={handleConfirmAction}
          >
            {action === 'close' ? 'Close Issue' : 'Delete Issue'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel;