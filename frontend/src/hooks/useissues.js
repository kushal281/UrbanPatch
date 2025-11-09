import { useState, useEffect, useCallback } from 'react';
import { issuesAPI } from '../api';
import { toast } from 'react-toastify';
import { subscribeToIssueEvents, unsubscribeFromEvents } from '../socket';

const useIssues = (options = {}) => {
  const {
    autoFetch = true,
    filters = {},
    enableRealtime = true,
  } = options;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Fetch issues
  const fetchIssues = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await issuesAPI.getAll({
        ...filters,
        ...params,
      });
      
      setIssues(response.data.issues || []);
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch issues';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create issue
  const createIssue = useCallback(async (issueData) => {
    try {
      const response = await issuesAPI.create(issueData);
      // Issue will be added via socket event
      toast.success('Issue created successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create issue';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Update issue
  const updateIssue = useCallback(async (id, issueData) => {
    try {
      const response = await issuesAPI.update(id, issueData);
      setIssues((prev) =>
        prev.map((issue) => (issue._id === id ? response.data.issue : issue))
      );
      toast.success('Issue updated successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update issue';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Delete issue
  const deleteIssue = useCallback(async (id) => {
    try {
      await issuesAPI.delete(id);
      setIssues((prev) => prev.filter((issue) => issue._id !== id));
      toast.success('Issue deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete issue';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Upvote issue
  const upvoteIssue = useCallback(async (id) => {
    try {
      const response = await issuesAPI.upvote(id);
      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === id ? { ...issue, ...response.data.issue } : issue
        )
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to upvote issue';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Verify issue (admin)
  const verifyIssue = useCallback(async (id) => {
    try {
      const response = await issuesAPI.verify(id);
      setIssues((prev) =>
        prev.map((issue) => (issue._id === id ? response.data.issue : issue))
      );
      toast.success('Issue verified successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to verify issue';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Close issue (admin)
  const closeIssue = useCallback(async (id, reason) => {
    try {
      const response = await issuesAPI.close(id, reason);
      setIssues((prev) =>
        prev.map((issue) => (issue._id === id ? response.data.issue : issue))
      );
      toast.success('Issue closed successfully');
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to close issue';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Refresh issues
  const refresh = useCallback(() => {
    return fetchIssues();
  }, [fetchIssues]);

  // Setup real-time listeners
  useEffect(() => {
    if (!enableRealtime) return;

    subscribeToIssueEvents({
      onIssueCreated: (issue) => {
        setIssues((prev) => [issue, ...prev]);
      },
      onIssueUpdated: (updatedIssue) => {
        setIssues((prev) =>
          prev.map((issue) =>
            issue._id === updatedIssue._id ? updatedIssue : issue
          )
        );
      },
      onIssueDeleted: (issueId) => {
        setIssues((prev) => prev.filter((issue) => issue._id !== issueId));
      },
      onIssueUpvoted: ({ issueId, upvotes }) => {
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
  }, [enableRealtime]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchIssues();
    }
  }, [autoFetch, fetchIssues]);

  return {
    issues,
    loading,
    error,
    pagination,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
    upvoteIssue,
    verifyIssue,
    closeIssue,
    refresh,
  };
};

export default useIssues;