import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { issuesAPI } from '../api';
import { toast } from 'react-toastify';
import IssueCard from '../components/IssueCard';
import Loader from '../components/Loader';

const Profile = () => {
  const { user } = useAuth();
  const [myIssues, setMyIssues] = useState([]);
  const [upvotedIssues, setUpvotedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myIssues');

  useEffect(() => {
    fetchUserIssues();
  }, []);

  const fetchUserIssues = async () => {
    try {
      setLoading(true);
      const response = await issuesAPI.getAll({ userId: user._id });
      const allIssues = response.data.issues || [];
      
      // Filter issues created by user
      const created = allIssues.filter(
        (issue) => issue.reportedBy._id === user._id
      );
      
      // Filter issues upvoted by user
      const upvoted = allIssues.filter(
        (issue) => issue.upvotedBy?.includes(user._id)
      );
      
      setMyIssues(created);
      setUpvotedIssues(upvoted);
    } catch (error) {
      console.error('Error fetching user issues:', error);
      toast.error('Failed to load your issues');
    } finally {
      setLoading(false);
    }
  };

  const getUserStats = () => {
    const totalUpvotes = myIssues.reduce(
      (sum, issue) => sum + (issue.upvotes || 0),
      0
    );
    const openIssues = myIssues.filter((issue) => issue.status === 'open').length;
    const resolvedIssues = myIssues.filter(
      (issue) => issue.status === 'closed' || issue.status === 'verified'
    ).length;

    return { totalUpvotes, openIssues, resolvedIssues };
  };

  const stats = getUserStats();

  if (loading) {
    return <Loader fullscreen />;
  }

  return (
    <Container className="py-4">
      <Row>
        {/* Profile Info Card */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '100px', height: '100px', fontSize: '48px' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h4>{user.name}</h4>
              <p className="text-muted">{user.email}</p>
              
              {user.role && user.role !== 'user' && (
                <Badge bg="primary" className="mb-3">
                  {user.role}
                </Badge>
              )}

              <div className="border-top pt-3 mt-3">
                <Row className="text-center">
                  <Col xs={4}>
                    <div className="fs-4 fw-bold text-primary">
                      {myIssues.length}
                    </div>
                    <small className="text-muted">Reported</small>
                  </Col>
                  <Col xs={4}>
                    <div className="fs-4 fw-bold text-success">
                      {stats.totalUpvotes}
                    </div>
                    <small className="text-muted">Upvotes</small>
                  </Col>
                  <Col xs={4}>
                    <div className="fs-4 fw-bold text-info">
                      {upvotedIssues.length}
                    </div>
                    <small className="text-muted">Supported</small>
                  </Col>
                </Row>
              </div>

              <div className="border-top pt-3 mt-3">
                <Row className="text-center">
                  <Col xs={6}>
                    <div className="fs-5 fw-bold text-warning">
                      {stats.openIssues}
                    </div>
                    <small className="text-muted">Open</small>
                  </Col>
                  <Col xs={6}>
                    <div className="fs-5 fw-bold text-success">
                      {stats.resolvedIssues}
                    </div>
                    <small className="text-muted">Resolved</small>
                  </Col>
                </Row>
              </div>

              <div className="border-top pt-3 mt-3 text-start">
                <small className="text-muted">
                  <strong>Member since:</strong><br />
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Issues Tabs */}
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                <Tab
                  eventKey="myIssues"
                  title={
                    <span>
                      My Issues{' '}
                      <Badge bg="secondary" pill>
                        {myIssues.length}
                      </Badge>
                    </span>
                  }
                >
                  {myIssues.length === 0 ? (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '64px' }}>📝</div>
                      <h5 className="mt-3">No issues reported yet</h5>
                      <p className="text-muted">
                        Start improving your neighborhood by reporting issues
                      </p>
                      <Button variant="primary" href="/">
                        Report an Issue
                      </Button>
                    </div>
                  ) : (
                    <Row xs={1} md={2} className="g-3">
                      {myIssues.map((issue) => (
                        <Col key={issue._id}>
                          <IssueCard
                            issue={issue}
                            onUpdate={fetchUserIssues}
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab>

                <Tab
                  eventKey="upvoted"
                  title={
                    <span>
                      Upvoted Issues{' '}
                      <Badge bg="secondary" pill>
                        {upvotedIssues.length}
                      </Badge>
                    </span>
                  }
                >
                  {upvotedIssues.length === 0 ? (
                    <div className="text-center py-5">
                      <div style={{ fontSize: '64px' }}>👍</div>
                      <h5 className="mt-3">No upvoted issues yet</h5>
                      <p className="text-muted">
                        Support issues in your neighborhood by upvoting them
                      </p>
                      <Button variant="primary" href="/">
                        Browse Issues
                      </Button>
                    </div>
                  ) : (
                    <Row xs={1} md={2} className="g-3">
                      {upvotedIssues.map((issue) => (
                        <Col key={issue._id}>
                          <IssueCard
                            issue={issue}
                            onUpdate={fetchUserIssues}
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;