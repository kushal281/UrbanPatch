import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import MapView from '../components/MapView';
import FilterSidebar from '../components/FilterSidebar';
import IssueForm from '../components/IssueForm';
import IssueList from '../components/IssueList';
import Loader from '../components/Loader';
import { issuesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { subscribeToIssueEvents, unsubscribeFromEvents } from '../socket';

/**
 * Home Component - Main page with map view and issue management
 * Features:
 * - Interactive map with issues
 * - Real-time updates via WebSocket
 * - Filtering and sorting
 * - Map/List view toggle
 * - Issue creation
 */
const Home = () => {
  // State management
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    severity: [],
    status: [],
    tags: [],
    sortBy: 'recent',
  });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch issues on component mount
  useEffect(() => {
    fetchIssues();
    
    // Cleanup on unmount
    return () => {
      unsubscribeFromEvents();
    };
  }, []);

  // Setup real-time listeners
  useEffect(() => {
    subscribeToIssueEvents({
      onIssueCreated: (issue) => {
        console.log('New issue created:', issue);
        setIssues((prev) => [issue, ...prev]);
        toast.info('🆕 New issue reported nearby!', {
          onClick: () => navigate(`/issues/${issue._id}`),
        });
      },
      onIssueUpdated: (updatedIssue) => {
        console.log('Issue updated:', updatedIssue);
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === updatedIssue._id ? updatedIssue : issue
          )
        );
      },
      onIssueDeleted: (issueId) => {
        console.log('Issue deleted:', issueId);
        setIssues((prev) => prev.filter((issue) => issue._id !== issueId));
        toast.info('An issue was removed');
      },
      onIssueUpvoted: ({ issueId, upvotes }) => {
        console.log('Issue upvoted:', issueId, upvotes);
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === issueId ? { ...issue, upvotes } : issue
          )
        );
      },
    });

    return () => {
      unsubscribeFromEvents();
    };
  }, [navigate]);

  // Apply filters whenever issues or filters change
  useEffect(() => {
    applyFilters();
  }, [issues, filters]);

  /**
   * Fetch all issues from API
   */
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await issuesAPI.getAll();
      const issuesData = response.data.issues || [];
      setIssues(issuesData);
      console.log(`Loaded ${issuesData.length} issues`);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters to issues list
   */
  const applyFilters = () => {
    let filtered = [...issues];

    // Filter by severity
    if (filters.severity && filters.severity.length > 0) {
      filtered = filtered.filter((issue) =>
        filters.severity.includes(issue.severity)
      );
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((issue) =>
        filters.status.includes(issue.status)
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((issue) =>
        issue.tags?.some((tag) => filters.tags.includes(tag))
      );
    }

    // Sort issues
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        filtered.sort(
          (a, b) => severityOrder[b.severity] - severityOrder[a.severity]
        );
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostCommented':
        filtered.sort(
          (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
        );
        break;
      case 'mostViewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        break;
    }

    setFilteredIssues(filtered);
  };

  /**
   * Handle clicking on an issue marker or card
   */
  const handleIssueClick = (issue) => {
    navigate(`/issues/${issue._id}`);
  };

  /**
   * Handle "Report Issue" button click
   */
  const handleAddIssueClick = () => {
    if (!isAuthenticated) {
      toast.info('Please login to report an issue');
      navigate('/login');
      return;
    }
    
    setIsAddingIssue(true);
    toast.info('📍 Click on the map to select the issue location', {
      autoClose: 5000,
    });
  };

  /**
   * Handle map click when adding new issue
   */
  const handleMapClick = (latlng) => {
    if (!isAddingIssue) return;
    
    setSelectedLocation(latlng);
    setIsAddingIssue(false);
    setShowIssueForm(true);
  };

  /**
   * Handle issue form submission
   */
  const handleIssueSubmit = async (issueData) => {
    try {
      const response = await issuesAPI.create(issueData);
      toast.success('✅ Issue reported successfully!');
      setShowIssueForm(false);
      setSelectedLocation(null);
      
      // Issue will be added via socket event, but add it immediately for better UX
      if (response.data.issue) {
        setIssues((prev) => [response.data.issue, ...prev]);
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create issue';
      toast.error(errorMessage);
      throw error; // Re-throw to let form handle it
    }
  };

  /**
   * Handle closing issue form
   */
  const handleCloseForm = () => {
    setShowIssueForm(false);
    setSelectedLocation(null);
    setIsAddingIssue(false);
  };

  /**
   * Handle clearing all filters
   */
  const handleClearFilters = () => {
    setFilters({
      severity: [],
      status: [],
      tags: [],
      sortBy: 'recent',
    });
  };

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  /**
   * Toggle between map and list view
   */
  const toggleViewMode = () => {
    setViewMode(viewMode === 'map' ? 'list' : 'map');
  };

  /**
   * Toggle heatmap view
   */
  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  // Show loader while initial data is loading
  if (loading) {
    return <Loader fullscreen />;
  }

  return (
    <div 
      className="d-flex position-relative" 
      style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}
    >
      {/* Filter Sidebar */}
      {showSidebar && (
        <div style={{ 
          width: '280px', 
          overflowY: 'auto',
          borderRight: '1px solid #e2e8f0',
          backgroundColor: 'white',
          zIndex: 100,
        }}>
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
            issueCount={filteredIssues.length}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow-1 position-relative">
        {viewMode === 'map' ? (
          <MapView
            issues={filteredIssues}
            onIssueClick={handleIssueClick}
            onMapClick={handleMapClick}
            isAddingIssue={isAddingIssue}
            showHeatmap={showHeatmap}
          />
        ) : (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <IssueList
              issues={filteredIssues}
              loading={false}
              onIssueUpdate={fetchIssues}
              sortBy={filters.sortBy}
              onSortChange={(newSort) => 
                setFilters((prev) => ({ ...prev, sortBy: newSort }))
              }
            />
          </div>
        )}

        {/* Floating Action Buttons */}
        <div 
          className="position-absolute" 
          style={{ 
            top: '20px', 
            right: '20px', 
            zIndex: 1000,
          }}
        >
          <div className="d-flex flex-column gap-2">
            {/* Report Issue Button */}
            <Button
              variant="primary"
              className="shadow-lg"
              onClick={handleAddIssueClick}
              style={{ 
                borderRadius: '50px', 
                padding: '12px 24px',
                fontWeight: 600,
              }}
            >
              ➕ Report Issue
            </Button>

            {/* Toggle Sidebar Button */}
            <Button
              variant="light"
              className="shadow"
              onClick={toggleSidebar}
              style={{ borderRadius: '8px' }}
            >
              {showSidebar ? '✕ Hide Filters' : '☰ Show Filters'}
            </Button>

            {/* Toggle View Mode Button */}
            <Button
              variant="light"
              className="shadow"
              onClick={toggleViewMode}
              style={{ borderRadius: '8px' }}
            >
              {viewMode === 'map' ? '📋 List View' : '🗺️ Map View'}
            </Button>

            {/* Toggle Heatmap Button (only in map view) */}
            {viewMode === 'map' && (
              <Button
                variant={showHeatmap ? 'primary' : 'light'}
                className="shadow"
                onClick={toggleHeatmap}
                style={{ borderRadius: '8px' }}
              >
                {showHeatmap ? '📍 Markers' : '🔥 Heatmap'}
              </Button>
            )}

            {/* Refresh Button */}
            <Button
              variant="light"
              className="shadow"
              onClick={fetchIssues}
              style={{ borderRadius: '8px' }}
              title="Refresh issues"
            >
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* Issue Count Badge */}
        {viewMode === 'map' && (
          <div
            className="position-absolute bg-white shadow-sm rounded px-3 py-2"
            style={{
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}
          >
            <small className="text-muted">
              <strong>{filteredIssues.length}</strong> issue
              {filteredIssues.length !== 1 ? 's' : ''} displayed
            </small>
          </div>
        )}
      </div>

      {/* Issue Form Modal */}
      <Modal 
        show={showIssueForm} 
        onHide={handleCloseForm}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            📍 Report New Issue
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IssueForm
            location={selectedLocation}
            onSubmit={handleIssueSubmit}
            onCancel={handleCloseForm}
          />
        </Modal.Body>
      </Modal>

      {/* Cancel Adding Issue Button */}
      {isAddingIssue && (
        <div
          className="position-absolute bg-warning text-dark px-4 py-3 rounded shadow-lg"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
            maxWidth: '400px',
          }}
        >
          <p className="mb-2 fw-semibold">
            📍 Click anywhere on the map to select the issue location
          </p>
          <Button
            variant="dark"
            size="sm"
            onClick={() => setIsAddingIssue(false)}
            className="w-100"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;