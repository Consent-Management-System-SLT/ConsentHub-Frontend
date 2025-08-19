import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  MapPin,
  Globe,
  User,
  AlertTriangle
} from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

interface PrivacyNotice {
  id: string;
  title: string;
  version: string;
  publishedDate: string;
  jurisdiction: string;
  language: string;
  acceptanceStatus: 'accepted' | 'pending' | 'declined' | 'expired';
  acceptedDate?: string;
  category: string;
  description: string;
  content: string;
  mandatory: boolean;
  expiryDate?: string;
}

interface CustomerPrivacyNoticesProps {
  onBack?: () => void;
}

const CustomerPrivacyNotices: React.FC<CustomerPrivacyNoticesProps> = () => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [selectedNotice, setSelectedNotice] = useState<PrivacyNotice | null>(null);

  // Get notices based on current language
  const getLocalizedNotices = (): PrivacyNotice[] => {
    const currentLang = i18n.language;
    
    if (currentLang === 'si') {
      return [
        {
          id: 'PN-001',
          title: 'පුද්ගලිකත්ව ප්‍රතිපත්තිය',
          version: '2.1',
          publishedDate: '2024-06-15',
          jurisdiction: 'ශ්‍රී ලංකාව',
          language: 'si',
          acceptanceStatus: 'accepted',
          acceptedDate: '2024-06-20',
          category: 'පුද්ගලිකත්ව ප්‍රතිපත්තිය',
          description: 'අපි ඔබේ පුද්ගලික දත්ත එකතු කරන, භාවිතා කරන සහ ආරක්ෂා කරන ආකාරය විස්තර කරන අපගේ සම්පූර්ණ පුද්ගලිකත්ව ප්‍රතිපත්තිය.',
          content: `මෙම පුද්ගලිකත්ව ප්‍රතිපත්තිය SLT Mobitel ඔබේ පුද්ගලික තොරතුරු එකතු කරන, භාවිතා කරන සහ ආරක්ෂා කරන ආකාරය පැහැදිලි කරයි...`,
          mandatory: true
        },
        {
          id: 'PN-002',
          title: 'සේවා නියමයන්',
          version: '1.8',
          publishedDate: '2024-05-01',
          jurisdiction: 'ශ්‍රී ලංකාව',
          language: 'si',
          acceptanceStatus: 'pending',
          category: 'නියමයන්',
          description: 'අපගේ සේවා භාවිතය පාලනය කරන නියමයන් සහ කොන්දේසි.',
          content: `මෙම සේවා නියමයන් SLT Mobitel සේවා භාවිතය පාලනය කරයි...`,
          mandatory: false
        },
        {
          id: 'PN-003',
          title: 'කුකී ප්‍රතිපත්තිය',
          version: '1.2',
          publishedDate: '2024-07-01',
          jurisdiction: 'ශ්‍රී ලංකාව',
          language: 'si',
          acceptanceStatus: 'pending',
          category: 'කුකීස්',
          description: 'අපි කුකීස් සහ සමාන තාක්ෂණයන් භාවිතා කරන ආකාරය පිළිබඳ තොරතුරු.',
          content: `මෙම කුකී ප්‍රතිපත්තිය අපි කුකීස් සහ සමාන තාක්ෂණයන් භාවිතා කරන ආකාරය පැහැදිලි කරයි...`,
          mandatory: false
        }
      ];
    } else if (currentLang === 'ta') {
      return [
        {
          id: 'PN-001',
          title: 'தனியுரிமை கொள்கை',
          version: '2.1',
          publishedDate: '2024-06-15',
          jurisdiction: 'இலங்கை',
          language: 'ta',
          acceptanceStatus: 'accepted',
          acceptedDate: '2024-06-20',
          category: 'தனியுரிமை கொள்கை',
          description: 'உங்கள் தனிப்பட்ட தரவை நாங்கள் எப்படி சேகரிக்கிறோம், பயன்படுத்துகிறோம் மற்றும் பாதுகாக்கிறோம் என்பதை விவரிக்கும் எங்களின் விரிவான தனியுரிமை கொள்கை.',
          content: `இந்த தனியுரிமை கொள்கை SLT Mobitel உங்கள் தனிப்பட்ட தகவல்களை எப்படி சேகரிக்கிறது, பயன்படுத்துகிறது மற்றும் பாதுகாக்கிறது என்பதை விளக்குகிறது...`,
          mandatory: true
        },
        {
          id: 'PN-002',
          title: 'சேவை விதிமுறைகள்',
          version: '1.8',
          publishedDate: '2024-05-01',
          jurisdiction: 'இலங்கை',
          language: 'ta',
          acceptanceStatus: 'pending',
          category: 'விதிமுறைகள்',
          description: 'எங்களின் சேவைகளின் பயன்பாட்டை நிர்வகிக்கும் விதிமுறைகள் மற்றும் நிபந்தனைகள்.',
          content: `இந்த சேவை விதிமுறைகள் SLT Mobitel சேவைகளின் பயன்பாட்டை நிர்வகிக்கின்றன...`,
          mandatory: false
        }
      ];
    } else {
      // Default to English
      return [
        {
          id: 'PN-001',
          title: 'Privacy Policy',
          version: '2.1',
          publishedDate: '2024-06-15',
          jurisdiction: 'Sri Lanka',
          language: 'en',
          acceptanceStatus: 'accepted',
          acceptedDate: '2024-06-20',
          category: 'Privacy Policy',
          description: 'Our comprehensive privacy policy outlining how we collect, use, and protect your personal data.',
          content: `This Privacy Policy explains how SLT Mobitel collects, uses, and protects your personal information...`,
          mandatory: true
        },
        {
          id: 'PN-002',
          title: 'Terms of Service',
          version: '1.8',
          publishedDate: '2024-05-01',
          jurisdiction: 'Sri Lanka',
          language: 'en',
          acceptanceStatus: 'pending',
          category: 'Terms',
          description: 'Terms and conditions governing the use of our services.',
          content: `These Terms of Service govern your use of SLT Mobitel services...`,
          mandatory: false
        },
        {
          id: 'PN-003',
          title: 'Cookie Policy',
          version: '1.2',
          publishedDate: '2024-07-01',
          jurisdiction: 'Sri Lanka',
          language: 'en',
          acceptanceStatus: 'pending',
          category: 'Cookies',
          description: 'Information about how we use cookies and similar technologies.',
          content: `This Cookie Policy explains how we use cookies and similar technologies...`,
          mandatory: false
        },
        {
          id: 'PN-004',
          title: 'Data Processing Agreement',
          version: '1.0',
          publishedDate: '2024-03-15',
          jurisdiction: 'Sri Lanka',
          language: 'en',
          acceptanceStatus: 'accepted',
          acceptedDate: '2024-03-20',
          category: 'Data Processing',
          description: 'Agreement on third-party data processing for enhanced services.',
          content: `This Data Processing Agreement outlines the terms for third-party data processing...`,
          mandatory: false
        }
      ];
    }
  };

  // Mock data - replace with API calls
  const privacyNotices: PrivacyNotice[] = getLocalizedNotices();

  const filteredNotices = privacyNotices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || notice.acceptanceStatus === statusFilter;
    const matchesLanguage = languageFilter === 'all' || notice.language === languageFilter;
    return matchesSearch && matchesStatus && matchesLanguage;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAcceptNotice = (noticeId: string) => {
    console.log('Accept notice:', noticeId);
    // Implement acceptance logic
  };

  const handleDeclineNotice = (noticeId: string) => {
    console.log('Decline notice:', noticeId);
    // Implement decline logic
  };

  const NoticeDetailModal = ({ notice, onClose }: { notice: PrivacyNotice; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-myslt-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">{notice.title}</h2>
                <p className="text-purple-100">Version {notice.version} • {notice.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-myslt-text-primary mb-3">Document Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-myslt-text-muted">Status:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(notice.acceptanceStatus)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(notice.acceptanceStatus)}`}>
                      {notice.acceptanceStatus.charAt(0).toUpperCase() + notice.acceptanceStatus.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-myslt-text-muted">Published:</span>
                  <p className="text-myslt-text-primary">{new Date(notice.publishedDate).toLocaleDateString()}</p>
                </div>
                {notice.acceptedDate && (
                  <div>
                    <span className="text-sm font-medium text-myslt-text-muted">Accepted:</span>
                    <p className="text-myslt-text-primary">{new Date(notice.acceptedDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-myslt-text-muted">Language:</span>
                  <p className="text-myslt-text-primary">{notice.language.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-myslt-text-primary mb-3">Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-myslt-text-muted">Jurisdiction:</span>
                  <p className="text-myslt-text-primary">{notice.jurisdiction}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-myslt-text-muted">Mandatory:</span>
                  <p className="text-myslt-text-primary">{notice.mandatory ? 'Yes' : 'No'}</p>
                </div>
                {notice.expiryDate && (
                  <div>
                    <span className="text-sm font-medium text-myslt-text-muted">Expires:</span>
                    <p className="text-myslt-text-primary">{new Date(notice.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-myslt-text-primary mb-3">Description</h3>
            <div className="bg-myslt-service-card p-4 rounded-lg">
              <p className="text-myslt-text-primary">{notice.description}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-myslt-text-primary mb-3">Content</h3>
            <div className="bg-myslt-service-card border border-myslt-accent/20 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <p className="text-myslt-text-primary leading-relaxed whitespace-pre-line">{notice.content}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => console.log('Download', notice.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            
            {notice.acceptanceStatus === 'pending' && (
              <>
                {!notice.mandatory && (
                  <button
                    onClick={() => handleDeclineNotice(notice.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Decline
                  </button>
                )}
                <button
                  onClick={() => handleAcceptNotice(notice.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-myslt-text-primary">{t('customerDashboard.privacyNotices.title')}</h1>
          <p className="text-myslt-text-muted mt-2">{t('customerDashboard.privacyNotices.subtitle')}</p>
        </div>
        <LanguageSelector />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-myslt-card rounded-lg border border-myslt-accent/20 p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-myslt-success" />
            <div>
              <p className="text-2xl font-bold text-myslt-text-primary">
                {privacyNotices.filter(n => n.acceptanceStatus === 'accepted').length}
              </p>
              <p className="text-sm text-myslt-text-muted">{t('customerDashboard.privacyNotices.accepted')}</p>
            </div>
          </div>
        </div>
        <div className="bg-myslt-card rounded-lg border border-myslt-accent/20 p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-myslt-text-primary">
                {privacyNotices.filter(n => n.acceptanceStatus === 'pending').length}
              </p>
              <p className="text-sm text-myslt-text-muted">{t('customerDashboard.privacyNotices.pendingReview')}</p>
            </div>
          </div>
        </div>
        <div className="bg-myslt-card rounded-lg border border-myslt-accent/20 p-4">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-myslt-primary" />
            <div>
              <p className="text-2xl font-bold text-myslt-text-primary">
                {new Set(privacyNotices.map(n => n.language)).size}
              </p>
              <p className="text-sm text-myslt-text-muted">{t('customerDashboard.privacyNotices.languages')}</p>
            </div>
          </div>
        </div>
        <div className="bg-myslt-card rounded-lg border border-myslt-accent/20 p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-myslt-text-primary">
                {privacyNotices.filter(n => n.mandatory && n.acceptanceStatus === 'pending').length}
              </p>
              <p className="text-sm text-myslt-text-muted">{t('customerDashboard.privacyNotices.actionRequired')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-myslt-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder={t('customerDashboard.privacyNotices.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('customerDashboard.privacyNotices.filters.allStatus')}</option>
              <option value="accepted">{t('customerDashboard.privacyNotices.filters.accepted')}</option>
              <option value="pending">{t('customerDashboard.privacyNotices.filters.pending')}</option>
              <option value="declined">{t('customerDashboard.privacyNotices.filters.declined')}</option>
              <option value="expired">{t('customerDashboard.privacyNotices.filters.expired')}</option>
            </select>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('customerDashboard.privacyNotices.filters.allLanguages')}</option>
              <option value="en">{t('language.english')}</option>
              <option value="si">{t('language.sinhala')}</option>
              <option value="ta">{t('language.tamil')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Notices List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredNotices.map((notice) => (
          <div key={notice.id} className="bg-myslt-card rounded-xl shadow-sm border border-myslt-accent/20 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(notice.acceptanceStatus)}
                  <div>
                    <h3 className="font-semibold text-myslt-text-primary">{notice.title}</h3>
                    <p className="text-sm text-myslt-text-muted">Version {notice.version} • {notice.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {notice.mandatory && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                      Required
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(notice.acceptanceStatus)}`}>
                    {notice.acceptanceStatus}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-myslt-text-muted mb-4 line-clamp-2">{notice.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-myslt-text-muted">
                  <Calendar className="w-4 h-4 mr-2" />
                  Published: {new Date(notice.publishedDate).toLocaleDateString()}
                </div>
                {notice.acceptedDate && (
                  <div className="flex items-center text-sm text-myslt-text-muted">
                    <User className="w-4 h-4 mr-2" />
                    Accepted: {new Date(notice.acceptedDate).toLocaleDateString()}
                  </div>
                )}
                <div className="flex items-center text-sm text-myslt-text-muted">
                  <MapPin className="w-4 h-4 mr-2" />
                  {notice.jurisdiction}
                </div>
                <div className="flex items-center text-sm text-myslt-text-muted">
                  <Globe className="w-4 h-4 mr-2" />
                  {notice.language.toUpperCase()}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="flex-1 px-3 py-2 bg-myslt-primary/10 text-myslt-primary rounded-lg hover:bg-myslt-primary/20 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                
                {notice.acceptanceStatus === 'pending' && (
                  <button
                    onClick={() => handleAcceptNotice(notice.id)}
                    className="flex-1 px-3 py-2 bg-myslt-success/10 text-myslt-success rounded-lg hover:bg-myslt-success/20 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotices.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No privacy notices found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}
    </div>
  );
};

export default CustomerPrivacyNotices;
