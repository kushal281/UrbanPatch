import React, { useState, useEffect } from 'react';
import { Card, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { commentsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { subscribeToCommentEvents, unsubscribeFromEvents } from '../socket';
import Loader from './Loader';

const CommentSection = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time comment events
    subscribeToCommentEvents({
      onCommentAdded: (comment) => {
        if (comment.issue === issueId) {
          setComments((prev) => [...prev, comment]);
        }
      },
      onCommentDeleted: (data) => {
        if (data.issueId === issueId) {
          setComments((prev) => 
            prev.filter((comment) => comment._id !== data.commentId)
          );
        }
      },
    });

    return () => {
      unsubscribeFromEvents();
    };
  }, [issueId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getByIssue(issueId);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please login to comment');
      navigate('/login');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);

    try {
      const response = await commentsAPI.create(issueId, {
        text: commentText,
      });
      
      // Comment will be added via socket event
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.delete(issueId, commentId);
      // Comment will be removed via socket event
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <Card>
      <Card.Header>
        <strong>💬 Comments ({comments.length})</strong>
      </Card.Header>
      <Card.Body>
        {/* Comment Form */}
        {isAuthenticated ? (
          <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submitting}
              />
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <small className="text-muted">
                {commentText.length}/500 characters
              </small>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !commentText.trim()}
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </Form>
        ) : (
          <Alert variant="info">
            <Button
              variant="link"
              className="p-0"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>{' '}
            to add comments
          </Alert>
        )}

        {/* Comments List */}
        {loading ? (
          <Loader />
        ) : comments.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {comments.map((comment) => (
              <ListGroup.Item key={comment._id} className="px-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <strong>{comment.author?.name || 'Anonymous'}</strong>
                      <small className="text-muted">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </small>
                    </div>
                    <p className="mb-0 text-muted">{comment.text}</p>
                  </div>
                  {user?._id === comment.author?._id && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={() => handleDelete(comment._id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default CommentSection;