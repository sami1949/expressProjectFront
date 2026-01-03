import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { reportService } from '../../services/reportService';
import { toast } from 'react-toastify';
import './ReportModal.css';

const ReportModal = ({ 
  isOpen, 
  onClose, 
  targetId, 
  targetType = 'post', 
  targetName = '' 
}) => {
  const { t } = useLanguage();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      toast.error(t('reportReason') + ' ' + t('isRequired'));
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        id_reported: targetType === 'user' ? targetId : undefined,
        id_post: targetType === 'post' ? targetId : undefined,
        id_commentaire: targetType === 'comment' ? targetId : undefined,
        type_content: targetType,
        raison: selectedReason,
        description: description.trim() || undefined
      };

      const response = await reportService.createReport(reportData);
      
      if (response.success) {
        toast.success(t('reportSuccess'));
        onClose();
        resetForm();
      } else {
        toast.error(response.message || t('reportError'));
      }
    } catch (error) {
      console.error('Erreur signalement:', error);
      const errorMessage = error.response?.data?.message || t('reportError');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedReason('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={handleClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>{t('report')} {targetType}</h2>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label>{t('reportReason')} *</label>
            <select 
              value={selectedReason} 
              onChange={(e) => setSelectedReason(e.target.value)}
              required
            >
              <option value="">{t('selectReason')}</option>
              <option value="spam">{t('spam')}</option>
              <option value="harassment">{t('harassment')}</option>
              <option value="hate_speech">{t('hateSpeech')}</option>
              <option value="inappropriate_content">{t('inappropriateContent')}</option>
              <option value="fake_account">{t('fakeAccount')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('description')} ({t('optional')})</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('reportDescriptionPlaceholder')}
              rows="4"
              maxLength="500"
            />
            <div className="char-count">
              {description.length}/500 {t('characters')}
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? t('loading') + '...' : t('submitReport')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;