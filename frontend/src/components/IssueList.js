import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Pagination } from 'react-bootstrap';
import IssueCard from './IssueCard';
import Loader from './Loader';

/**
 * IssueList Component
 * Displays a grid of issue cards with pagination and sorting
 * 
 * @param {Array} issues - Array of issue objects to display
 * @param {Boolean} loading - Loading state
 * @param {Function} onIssueUpdate - Callback when an issue is updated
 * @param {Object} pagination - Pagination data { page, limit, total, pages }
 * @param {Function} onPageChange - Callback when page changes
 * @param {String} sortBy - Current sort option
 * @param {Function} onSortChange - Callback when sort changes
 */
const IssueList = ({ 
  issues = [], 
  loading = false, 
  onIssueUpdate,
  pagination = null,
  onPageChange = null,
  sortBy = 'recent',
  onSortChange = null,
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'compact'

  /**
   * Handle sort change
   */
  const handleSortChange = (e) => {
    if (onSortChange) {
      onSortChange(e.target.value);
    }
  };

  /**
   * Generate pagination items
   */
  const renderPaginationItems = () => {
    if (!pagination || pagination.pages <= 1) return null;

    const items = [];
    const currentPage = pagination.page;
    const totalPages = pagination.pages;
    const maxVisible = 5;

    // First page
    if (currentPage > 1) {
      items.push(
        <Pagination.First 
          key="first" 
          onClick={() => onPageChange(1)}
        />
      );
      items.push(
        <Pagination.Prev 
          key="prev" 
          onClick={() => onPageChange(currentPage - 1)}
        />
      );
    }

    // Calculate page range to show
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Add ellipsis if needed at start
    if (startPage > 1) {
      items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Add ellipsis if needed at end
    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }

    // Last page
    if (currentPage < totalPages) {
      items.push(
        <Pagination.Next 
          key="next" 
          onClick={() => onPageChange(currentPage + 1)}
        />
      );
      items.push(
        <Pagination.Last 
          key="last" 
          onClick={() => onPageChange(totalPages)}
        />
      );
    }

    return items;
  };

  // Show loader while loading
  if (loading) {
    return <Loader />;
  }

  // Show empty state if no issues
  if (!issues || issues.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🔍</div>
          <h4 className="mb-3">No Issues Found</h4>
          <p className="text-muted mb-4">
            No issues match your current filters. Try adjusting your search criteria
            or be the first to report an issue in your neighborhood!
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.location.href = '/'}
          >
            View All Issues
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        {/* Results Count */}
        <div>
          <h5 className="mb-1">
            {pagination 
              ? `${pagination.total} Issue${pagination.total !== 1 ? 's' : ''} Found`
              : `${issues.length} Issue${issues.length !== 1 ? 's' : ''}`
            }
          </h5>
          {pagination && (
            <small className="text-muted">
              Page {pagination.page} of {pagination.pages}
            </small>
          )}
        </div>

        {/* Controls */}
        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* View Mode Toggle */}
          <div className="btn-group" role="group">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <span style={{ fontSize: '1rem' }}>⊞</span>
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('compact')}
              title="Compact View"
            >
              <span style={{ fontSize: '1rem' }}>☰</span>
            </Button>
          </div>

          {/* Sort Dropdown */}
          {onSortChange && (
            <Form.Select
              size="sm"
              value={sortBy}
              onChange={handleSortChange}
              style={{ width: 'auto' }}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="severity">Highest Severity</option>
              <option value="oldest">Oldest First</option>
              <option value="mostCommented">Most Commented</option>
              <option value="mostViewed">Most Viewed</option>
            </Form.Select>
          )}
        </div>
      </div>

      {/* Issues Grid */}
      <Row 
        xs={1} 
        md={viewMode === 'grid' ? 2 : 1} 
        lg={viewMode === 'grid' ? 3 : 2} 
        xl={viewMode === 'grid' ? 4 : 2}
        className="g-4"
      >
        {issues.map((issue) => (
          <Col key={issue._id}>
            <IssueCard 
              issue={issue} 
              onUpdate={onIssueUpdate}
            />
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination size="lg">
            {renderPaginationItems()}
          </Pagination>
        </div>
      )}

      {/* Results Summary Footer */}
      {pagination && (
        <div className="text-center mt-3">
          <small className="text-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </small>
        </div>
      )}

      {/* Scroll to Top Button */}
      {issues.length > 6 && (
        <div 
          className="position-fixed" 
          style={{ bottom: '20px', right: '20px', zIndex: 1000 }}
        >
          <Button
            variant="primary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ 
              borderRadius: '50%', 
              width: '50px', 
              height: '50px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            title="Scroll to top"
          >
            ↑
          </Button>
        </div>
      )}
    </Container>
  );
};

export default IssueList;