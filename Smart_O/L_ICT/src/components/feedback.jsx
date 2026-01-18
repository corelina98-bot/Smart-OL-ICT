import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './feedback.css';


const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editCategory, setEditCategory] = useState('general');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isTipsExpanded, setIsTipsExpanded] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Extract current user ID from JWT token
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      const fullText = "Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.";
      let index = 0;
      setDisplayedText('');
      setShowButtons(false);

      const typeWriter = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeWriter);
          setTimeout(() => setShowButtons(true), 500);
        }
      }, 50);

      return () => clearInterval(typeWriter);
    }
  }, [isSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!feedback.trim()) {
      alert('Please enter your feedback before submitting.');
      return;
    }

    if (!rating) {
      alert('Please select a rating.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user ID from token
      const token = sessionStorage.getItem('token');
      let student_id = null;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        student_id = payload.userId;
      }

      const feedbackData = {
        feedback_content: feedback,
        rating,
        category,
        student_id
      };

      await api.post('/api/feedback', feedbackData);

      // If modal is open, refresh the feedback list
      if (isModalOpen) {
        fetchFeedbackList();
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFeedback('');
    setRating(0);
    setCategory('general');
    setCharCount(0);
    setIsSubmitted(false);
  };

  const handleFeedbackChange = (e) => {
    const text = e.target.value;
    setFeedback(text);
    setCharCount(text.length);
  };

  const fetchFeedbackList = async () => {
    setLoadingFeedback(true);
    try {
      const response = await api.get('/api/feedback');
      setFeedbackList(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      alert('Failed to load feedback list. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleViewFeedbackList = () => {
    setIsModalOpen(true);
    fetchFeedbackList();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFeedbackList([]);
  };

  const handleEditFeedback = (feedback) => {
    setEditingFeedback(feedback._id);
    setEditContent(feedback.feedback_content);
    setEditRating(feedback.rating || 0);
    setEditCategory(feedback.category || 'general');
  };

  const handleCancelEdit = () => {
    setEditingFeedback(null);
    setEditContent('');
  };

  const handleSaveEdit = async (feedbackId) => {
    if (!editContent.trim()) {
      alert('Feedback content cannot be empty.');
      return;
    }

    if (!editRating) {
      alert('Please select a rating.');
      return;
    }

    try {
      await api.put(`/api/feedback/${feedbackId}`, {
        feedback_content: editContent,
        rating: editRating,
        category: editCategory
      });
      setEditingFeedback(null);
      setEditContent('');
      setEditRating(0);
      setEditCategory('general');
      fetchFeedbackList(); // Refresh the list
    } catch (error) {
      console.error('Error updating feedback:', error);
      alert('Failed to update feedback. Please try again.');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await api.delete(`/api/feedback/${feedbackId}`);
      fetchFeedbackList(); // Refresh the list
    } catch (error) {
      console.error('Error deleting feedback:', error);
      if (error.response && error.response.status === 404) {
        alert('Feedback not found or already deleted.');
      } else {
        alert('Failed to delete feedback. Please try again.');
      }
      // Refresh the list in case the feedback was deleted by another user
      fetchFeedbackList();
    }
  };

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'ui', label: 'UI/UX Improvement' },
    { value: 'performance', label: 'Performance' }
  ];

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  if (isSubmitted) {
    return (
      <div className="feedback-container1">
        <div className="success-animation">
        <video
          src="/success-feedback.mp4"
          autoPlay
          muted
          loop
          style={{ width: '200px', height: 'auto', margin: '0 auto 30px', borderRadius: '8px' , border: '2px solid rgba(25, 33, 145, 1)'}}
        />
          <h2>Thank You for Your Feedback!</h2>
          <p className="typing-text">
            {displayedText}
            {!showButtons && <span className="cursor">|</span>}
          </p>

          {showButtons && (
            <div className="success-buttons">
              <button onClick={handleReset} className="submit-button-new-feedback-btn">
                Submit New Feedback
              </button>
              <button onClick={handleReset} className="back-button-success">
                ← Back
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <>
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎮 Feedback </h2>
              <button className="close-button" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body">
              {loadingFeedback ? (
                <div className="loading-spinner">
                  <div>Loading....</div>
                </div>
              ) : (
                <div className="feedback-list">
                  {feedbackList.map((feedback, index) => (
                    <div key={feedback._id || index} className="feedback-item">
                      <div className="feedback-rank">#{index + 1}</div>
                      <div className="feedback-content">
                        {editingFeedback === feedback._id ? (
                          <div className="edit-feedback">
                            <div className="edit-rating-section">
                              <label>Rating:</label>
                              <div className="rating-container">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    className={`rating-star ${star <= editRating ? 'active' : ''}`}
                                    onClick={() => setEditRating(star)}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="edit-category-section">
                              <label>Category:</label>
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="edit-category-select"
                              >
                                {categories.map((cat) => (
                                  <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="edit-textarea"
                              rows={3}
                            />
                            <div className="edit-actions">
                              <button
                                onClick={() => handleSaveEdit(feedback._id)}
                                className="save-btn"
                              >
                                💾 Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="cancel-btn"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>{feedback.feedback_content}</p>
                            <div className="feedback-meta">
                              <span className="feedback-points">⭐ {Math.floor(Math.random() * 100) + 10} Points</span>
                              <span className="feedback-badge">🏆 Top Feedback</span>
                            </div>
                          </>
                        )}
                      </div>
                      {currentUserId && feedback.student_id && feedback.student_id._id === currentUserId && (
                        <div className="feedback-actions">
                          <button
                            onClick={() => handleEditFeedback(feedback)}
                            className="edit-icon"
                            title="Edit feedback"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(feedback._id)}
                            className="delete-icon"
                            title="Delete feedback"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
     
            </div>
          </div>
        </div>
      )}

    <div className="feedback-container">
       <button
          className="view-feedback-btn"
          onClick={handleViewFeedbackList}
        >
          ← View Feedback List
        </button>
     
      {/* Hamburger menu top-right */}
        <div 
          className="menu-icon" 
          aria-label="Menu" 
          role="button" 
          tabIndex={0}
          style={{position: 'fixed', top: '20px', right: '20px', zIndex: 10}}
          onClick={() => navigate('/dashboard')} // Add navigation to dashboard
        >
          <div></div>
          <div></div>
          <div></div>
        </div>

      <div className="feedback-header">
        <div className="feedback-name">SMART O/L ICT</div>
        <h1 className="feedback-title">Share Your Feedback</h1>
        <p className="feedback-subtitle">Help us improve your experience</p>
      </div>

      {/* Feedback Tips */}
      <div className="feedback-tips">
        <h3 onClick={() => setIsTipsExpanded(!isTipsExpanded)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          💡 Feedback Tips
          <span className={`toggle-icon ${isTipsExpanded ? 'expanded' : ''}`}>{isTipsExpanded ? '▼' : '▶'}</span>
        </h3>
        {isTipsExpanded && (
          <ul>
            <li data-tooltip="Provide detailed examples to help us understand your point better">
              Be specific about what you like or what can be improved
            </li>
            <li data-tooltip="Describe the exact steps you took when the issue occurred">
              Include steps to reproduce if reporting a bug
            </li>
            <li data-tooltip="Share your creative ideas for new features or improvements">
              Suggest alternatives if you have ideas for improvement
            </li>
            <li data-tooltip="Focus on positive suggestions that help everyone">
              Keep it constructive and professional
            </li>
          </ul>
        )}
      </div>

      <form className="feedback-form" onSubmit={handleSubmit}>
        {/* Rating Section */}
        <div className="form-section">
          <label className="section-label">Rate your experience?</label>
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </button>
            ))}
          </div>
          <div className="rating-label">
            {rating > 0 ? ratingLabels[rating - 1] : 'Select a rating'}
          </div>
        </div>

        {/* Category Selection */}
        <div className="form-section">
          <label className="section-label">Feedback Category</label>
          <div className="category-buttons">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`category-btn ${category === cat.value ? 'active' : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Textarea */}
        <div className="form-section">
          <label className="section-label">
            Your Feedback
            <span className="char-count">{charCount}/500</span>
          </label>
          <div className="textarea-container">
            <textarea
              className="feedback-textarea"
              placeholder="Please share your thoughts, suggestions, or issues..."
              value={feedback}
              onChange={handleFeedbackChange}
              maxLength={500}
              rows={6}
            />
            <div className="textarea-footer">
              <div className="textarea-hint">
                💡 Be specific and include details that will help us understand your feedback better.
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting || !feedback.trim()}
        >
          {isSubmitting ? (
            <>
              <div className="spinner"></div>
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
        </button>
      </form>
    </div>
    </>
  );
};

export default Feedback;
