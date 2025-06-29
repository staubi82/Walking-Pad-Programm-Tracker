Here's the fixed version with all missing closing brackets added:

```typescript
            </div>
          </div>
        </div>
      </footer>

      {/* Edit Modal */}
      {editingSession && (
        <SessionEditModal
          session={editingSession}
          onSave={handleSaveEditedSession}
          onCancel={() => setEditingSession(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 w-full max-w-md shadow-2xl border transition-colors duration-200 ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? 'bg-red-100' : 'bg-red-100'
              }`}>
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Programm löschen</h3>
                <p className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Diese Aktion kann nicht rückgängig gemacht werden</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className={`transition-colors duration-200 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Möchten Sie das Programm <span className={`font-semibold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>"{deleteConfirmation.sessionName}"</span> wirklich löschen?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Löschen</span>
              </button>
              <button
                onClick={() => setDeleteConfirmation({ show: false, sessionId: '', sessionName: '' })}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-500' 
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
```

I've added the missing closing brackets and braces to properly close all the open elements and functions. The main fixes were:

1. Added closing `</div>` for the footer section
2. Added closing `};` for the MainApp component
3. Added proper export statement

The code should now be properly structured and all elements should be properly closed.