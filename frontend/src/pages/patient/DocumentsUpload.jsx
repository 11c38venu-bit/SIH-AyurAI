import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  FileCheck,
  Trash2,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext';
import { useAuth } from '../../services/authContext';
import apiService from '../../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import LanguageSelector from '../../components/common/LanguageSelector';
import PatientJourneyTracker from '../../components/patient/PatientJourneyTracker';

export const DocumentsUpload = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('labReport');
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocs = async () => {
    const pat = await apiService.getPatientById(user.id || 'pat-101');
    if (pat && pat.documents) {
      setDocuments(pat.documents);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const handleSimulatedUpload = async (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      alert('Please enter a document title or select a file');
      return;
    }

    setIsUploading(true);
    const added = await apiService.addDocument(user.id || 'pat-101', {
      name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
      type: docType,
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`
    });

    if (added) {
      setDocuments(prev => [added, ...prev]);
      setDocName('');
    }
    setIsUploading(false);
  };

  const handleDeleteDoc = async (docId) => {
    await apiService.deleteDocument(user.id || 'pat-101', docId);
    fetchDocs();
  };

  const getDocTypeLabel = (type) => {
    switch (type) {
      case 'labReport': return t('documents.labReport');
      case 'imaging': return t('documents.imaging');
      case 'priorRx': return t('documents.priorRx');
      default: return t('documents.otherDoc');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('documents.title')}</span>
            <Badge variant="primary" size="sm">EHR Repository</Badge>
          </h1>
          <p className="text-xs text-slate-500">
            {t('documents.subtitle')}
          </p>
        </div>

        <LanguageSelector variant="dropdown" />
      </div>

      <PatientJourneyTracker currentStepId={6} variant="compact" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                <UploadCloud className="w-4 h-4 text-ayur-700" />
                <span>Upload New Record</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSimulatedUpload} className="space-y-4 text-xs">
                <Input
                  label="Document Name / Title"
                  placeholder="e.g. CBC Blood Count, Upper GI Scope"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required
                />

                <Select
                  label={t('documents.reportType')}
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  options={[
                    { value: 'labReport', label: t('documents.labReport') },
                    { value: 'imaging', label: t('documents.imaging') },
                    { value: 'priorRx', label: t('documents.priorRx') },
                    { value: 'otherDoc', label: t('documents.otherDoc') },
                  ]}
                />

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center space-y-2">
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">{t('documents.uploadArea')}</p>
                  <span className="text-[10px] text-slate-400 block">{t('documents.supportedFormats')}</span>
                </div>

                <Button
                  type="submit"
                  size="md"
                  className="w-full"
                  isLoading={isUploading}
                  icon={Plus}
                >
                  Upload & Index Document
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Uploaded Documents List with Processing Status */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('documents.uploadedDocs')} ({documents.length})</span>
                </CardTitle>
                <Badge variant="success" size="sm">Analyzed for Vaidya</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents uploaded"
                  description={t('documents.noDocsYet')}
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <div key={doc.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate space-y-0.5">
                          <h5 className="font-semibold text-slate-900 truncate">{doc.name}</h5>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                            <Badge variant="secondary" size="sm">{getDocTypeLabel(doc.type)}</Badge>
                            <span>• {doc.date}</span>
                            <span>• {doc.size}</span>
                            <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ✓ {doc.status || 'Indexed & Processed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => setPreviewDoc(doc)}
                        >
                          {t('documents.viewDoc')}
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="md" onClick={() => navigate('/patient/medical-history')} icon={ArrowLeft}>
                {t('common.previous')}
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/patient/summary')}
                icon={ArrowRight}
                iconPosition="right"
              >
                Proceed to Structured Summary
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name}
          subtitle={`Uploaded on ${previewDoc.date} • ${previewDoc.size}`}
          size="md"
        >
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
              <FileCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-base">{previewDoc.name}</h4>
              <Badge variant="vata">{getDocTypeLabel(previewDoc.type)}</Badge>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <p><strong>Processing Status:</strong> {previewDoc.status || 'Indexed & Processed for Vaidya'}</p>
              <p><strong>Clinical Correlation:</strong> Available in Vaidya 360° EHR dossier for Ashtavidha verification.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DocumentsUpload;
