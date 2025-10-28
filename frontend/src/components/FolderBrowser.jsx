import { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  FolderOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const FolderBrowser = ({ currentFolderId, onFolderSelect }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadFolders();
  }, [currentFolderId]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      // Get root folders (no parent) and current folder's subfolders if applicable
      const params = currentFolderId ? { parent_id: currentFolderId } : {};
      const response = await api.get('/folders/', { params });
      setFolders(response.data.folders);
    } catch (err) {
      console.error('Error loading folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      await api.post('/folders/', {
        name: newFolderName,
        parent_id: currentFolderId || null
      });
      setNewFolderName('');
      setShowCreateDialog(false);
      await loadFolders();
    } catch (err) {
      console.error('Error creating folder:', err);
      alert('Failed to create folder');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm('Are you sure you want to delete this folder? Notes will be moved to the parent folder.')) {
      return;
    }

    try {
      await api.delete(`/folders/${folderId}`);
      await loadFolders();
    } catch (err) {
      console.error('Error deleting folder:', err);
      alert('Failed to delete folder');
    }
  };

  const handleRenameFolder = async () => {
    if (!editName.trim()) {
      alert('Please enter a folder name');
      return;
    }

    try {
      await api.put(`/folders/${editingFolder.id}`, {
        name: editName
      });
      setEditingFolder(null);
      setEditName('');
      await loadFolders();
    } catch (err) {
      console.error('Error renaming folder:', err);
      alert('Failed to rename folder');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
          Folders
        </h3>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded transition-colors"
          title="Create folder"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Root / All Notes */}
      <button
        onClick={() => onFolderSelect(null)}
        className={`w-full flex items-center px-3 py-2 rounded-lg mb-1 transition-colors ${
          currentFolderId === null
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <HomeIcon className="w-5 h-5 mr-2" />
        <span className="flex-1 text-left font-medium">All Notes</span>
      </button>

      {loading ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      ) : folders.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No folders yet
        </p>
      ) : (
        <div className="space-y-1">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="group relative"
            >
              {editingFolder?.id === folder.id ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded
                             bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameFolder();
                      } else if (e.key === 'Escape') {
                        setEditingFolder(null);
                        setEditName('');
                      }
                    }}
                  />
                  <button
                    onClick={handleRenameFolder}
                    className="text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingFolder(null);
                      setEditName('');
                    }}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onFolderSelect(folder.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    currentFolderId === folder.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {currentFolderId === folder.id ? (
                    <FolderOpenIcon className="w-5 h-5 mr-2" />
                  ) : (
                    <FolderIcon className="w-5 h-5 mr-2" />
                  )}
                  <span className="flex-1 text-left">{folder.name}</span>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {folder.note_count}
                  </span>
                  
                  {/* Action buttons */}
                  <div className="hidden group-hover:flex items-center ml-2 gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolder(folder);
                        setEditName(folder.name);
                      }}
                      className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded"
                      title="Rename"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                      className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded"
                      title="Delete"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Folder Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Folder
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                } else if (e.key === 'Escape') {
                  setShowCreateDialog(false);
                  setNewFolderName('');
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewFolderName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderBrowser;
