export const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionData, onSave, onCancel }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sessionName, setSessionName] = useState(sessionData.name);
  const [nameError, setNameError] = useState('');
  const { isDark } = useTheme();

  // ... handlers bleiben gleich ...

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className={`w-full max-w-6xl my-8 rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        
        {/* Compact Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <h2 className={`text-xl font-bold flex items-center space-x-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Calendar className="w-6 h-6 text-blue-500" />
            <span>Training Summary</span>
          </h2>
          <button onClick={onCancel} className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column - Stats */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Main Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-xl border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <Clock className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                
