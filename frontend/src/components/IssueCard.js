import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { issuesAPI } from '../api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

/**
 * IssueCard Component
 * Displays a single issue in card format with image, details, and upvote functionality
 * 
 * @param {Object} issue - Issue object containing all issue data
 * @param {Function} onUpdate - Callback function when issue is updated
 */
const IssueCard = ({ issue, onUpdate }) => {
  const [upvoting, setUpvoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(issue.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Check if current user has upvoted this issue
  useEffect(() => {
    if (user && issue.upvotedBy) {
      setHasUpvoted(issue.upvotedBy.includes(user._id));
    }
  }, [user, issue.upvotedBy]);

  /**
   * Handle upvote button click
   * Implements optimistic UI updates
   */
  const handleUpvote = async (e) => {
    e.stopPropagation(); // Prevent card click navigation

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.info('Please login to upvote issues');
      navigate('/login');
      return;
    }

    setUpvoting(true);

    try {
      // Optimistic update - update UI immediately
      const newUpvoteState = !hasUpvoted;
      const newUpvoteCount = newUpvoteState 
        ? localUpvotes + 1 
        : localUpvotes - 1;
      
      setLocalUpvotes(newUpvoteCount);
      setHasUpvoted(newUpvoteState);

      // Make API call
      const response = await issuesAPI.upvote(issue._id);
      
      // Update with actual server data
      if (response.data.issue) {
        setLocalUpvotes(response.data.issue.upvotes);
        setHasUpvoted(response.data.issue.upvotedBy.includes(user._id));
      }
      
      // Notify parent component of update
      if (onUpdate) {
        onUpdate(response.data.issue);
      }
      
      // Show success message
      toast.success(
        newUpvoteState ? 'Upvoted successfully!' : 'Upvote removed'
      );
      
    } catch (error) {
      // Revert optimistic update on error
      setLocalUpvotes(issue.upvotes || 0);
      setHasUpvoted(issue.upvotedBy?.includes(user?._id) || false);
      
      console.error('Error upvoting issue:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upvote issue';
      toast.error(errorMessage);
    } finally {
      setUpvoting(false);
    }
  };

  /**
   * Handle card click - navigate to issue detail page
   */
  const handleCardClick = () => {
    navigate(`/issues/${issue._id}`);
  };

  /**
   * Get emoji icon based on severity
   */
  const getSeverityEmoji = (severity) => {
    const emojis = {
      low: '📍',
      medium: '⚠️',
      high: '🚨',
      critical: '🔥',
    };
    return emojis[severity] || '📍';
  };

  /**
   * Get status emoji
   */
  const getStatusEmoji = (status) => {
    const emojis = {
      open: '🔓',
      verified: '✅',
      closed: '🔒',
    };
    return emojis[status] || '🔓';
  };

  /**
   * Truncate text to specified length
   */
  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className="h-100 issue-card" 
      onClick={handleCardClick}
      style={{ 
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        border: '1px solid #e2e8f0',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Issue Image */}
      {issue.photos && issue.photos.length > 0 && (
        <div style={{ position: 'relative' }}>
          <Card.Img
            variant="top"
            src={issue.photos[0]}
            alt={issue.title}
            style={{ 
              height: '200px', 
              objectFit: 'cover',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {issue.photos.length > 1 && (
            <Badge 
              bg="dark" 
              style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px',
                opacity: 0.8,
              }}
            >
              📷 {issue.photos.length}
            </Badge>
          )}
        </div>
      )}
      
      <Card.Body className="d-flex flex-column">
        {/* Badges Row */}
        <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap">
            {/* Severity Badge */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Severity: {issue.severity}</Tooltip>}
            >
              <Badge 
                bg="" 
                className={`badge-${issue.severity}`}
                style={{ cursor: 'help' }}
              >
                {getSeverityEmoji(issue.severity)} {issue.severity}
              </Badge>
            </OverlayTrigger>
            
            {/* Status Badge */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Status: {issue.status}</Tooltip>}
            >
              <Badge 
                bg="" 
                className={`badge-${issue.status}`}
                style={{ cursor: 'help' }}
              >
                {getStatusEmoji(issue.status)} {issue.status}
              </Badge>
            </OverlayTrigger>
          </div>
          
          {/* Time Badge */}
          <small className="text-muted text-nowrap">
            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
          </small>
        </div>

        {/* Issue Title */}
        <Card.Title className="mb-2" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
          {issue.title}
        </Card.Title>
        
        {/* Issue Description */}
        <Card.Text className="text-muted flex-grow-1" style={{ fontSize: '0.9rem' }}>
          {truncateText(issue.description, 120)}
        </Card.Text>

        {/* Tags */}
        {issue.tags && issue.tags.length > 0 && (
          <div className="mb-3">
            {issue.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                bg="light" 
                text="dark" 
                className="me-1 mb-1"
                style={{ fontSize: '0.75rem' }}
              >
                #{tag}
              </Badge>
            ))}
            {issue.tags.length > 3 && (
              <Badge 
                bg="light" 
                text="dark"
                style={{ fontSize: '0.75rem' }}
              >
                +{issue.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer Section */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
          {/* Stats */}
          <div className="d-flex gap-3 text-muted small">
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{issue.comments?.length || 0} comments</Tooltip>}
            >
              <span style={{ cursor: 'help' }}>
                💬 {issue.comments?.length || 0}
              </span>
            </OverlayTrigger>
            
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{issue.views || 0} views</Tooltip>}
            >
              <span style={{ cursor: 'help' }}>
                👁️ {issue.views || 0}
              </span>
            </OverlayTrigger>
          </div>
          
          {/* Upvote Button */}
          <Button
            variant={hasUpvoted ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={handleUpvote}
            disabled={upvoting}
            className="d-flex align-items-center gap-1"
            style={{ 
              minWidth: '70px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '1rem' }}>
              {hasUpvoted ? '👍' : '👍'}
            </span>
            <span className="fw-semibold">
              {localUpvotes}
            </span>
          </Button>
        </div>

        {/* Reporter Info */}
        {issue.reportedBy && (
          <div className="mt-2 pt-2 border-top">
            <small className="text-muted d-flex align-items-center gap-1">
              <span>👤</span>
              Reported by <strong>{issue.reportedBy.name}</strong>
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default IssueCard;