import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import { Save, Send, X, Upload, Image as ImageIcon } from 'lucide-react';

export default function EditPostPage() {
  const { id } = useParams();
  const { user, isAuthenticated, canWrite } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('DRAFT');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const coverImageInputRef = useRef(null);
  const editorRef = useRef(null);

  const patchMdeBoldBehavior = useCallback((mde) => {
    if (!mde || mde.__cybershareBoldPatched) return;

    const originalToggleBold = typeof mde.toggleBold === 'function' ? mde.toggleBold.bind(mde) : null;
    if (!originalToggleBold || !mde.codemirror) return;

    mde.toggleBold = () => {
      const cm = mde.codemirror;
      const selection = cm.getSelection();
      const trailingMatch = selection.match(/(\r?\n)+$/);

      if (!trailingMatch) {
        originalToggleBold();
        return;
      }

      const trailingLen = trailingMatch[0].length;
      const core = selection.slice(0, selection.length - trailingLen);

      if (!core) {
        originalToggleBold();
        return;
      }

      const from = cm.getCursor('from');
      const to = cm.getCursor('to');
      const toIndex = cm.indexFromPos(to);
      const adjustedTo = cm.posFromIndex(Math.max(0, toIndex - trailingLen));

      cm.setSelection(from, adjustedTo);
      originalToggleBold();
    };

    mde.__cybershareBoldPatched = true;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if user has permission to edit posts
    if (!canWrite) {
      navigate('/');
      alert('Bạn cần có quyền AUTHOR hoặc ADMIN để chỉnh sửa bài viết.');
      return;
    }

    fetchPost();
    fetchCategories();
  }, [id, isAuthenticated, canWrite, navigate]);

  const fetchPost = async () => {
    try {
      const response = await apiClient.get(`/api/posts/${id}`);
      const post = response.data;

      // Check if user is the author
      if (post.authorId !== user.id) {
        alert('You are not authorized to edit this post');
        navigate('/dashboard');
        return;
      }

      setTitle(post.title);
      setSummary(post.summary || '');
      // Extract tag names from tag objects and format as hashtags
      const tagNames = post.tags ? post.tags.map(tag => typeof tag === 'object' ? tag.name : tag) : [];
      setTags(tagNames.map(t => `#${t}`).join(' '));
      setContent(post.content);
      setCategoryId(post.categoryId?.toString() || '');
      setCoverImageUrl(post.coverImageUrl || '');
      setCurrentStatus(post.status);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch post:', err);
      setError(err.response?.data?.message || 'Failed to load post');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/posts/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.fileUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      throw new Error(err.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const imageUrl = await uploadImage(file);
      setCoverImageUrl(imageUrl);
      setCoverImageFile(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const imageUploadFunction = async (file, onSuccess, onError) => {
    try {
      const imageUrl = await uploadImage(file);
      onSuccess(imageUrl);
    } catch (err) {
      onError(err.message);
    }
  };

  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: 'Write your story...',
      status: false,
      uploadImage: true,
      imageUploadFunction: imageUploadFunction,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'upload-image',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ],
    };
  }, []);

  const handleUpdate = async (status) => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Parse hashtags: extract words starting with # and remove the # prefix
      const parsedTags = tags.match(/#[\w\u00C0-\u024F]+/g)?.map(t => t.slice(1)) || [];
      
      const postData = {
        title: title.trim(),
        summary: summary.trim() || null,
        tags: parsedTags,
        content: content.trim(),
        categoryId: categoryId ? parseInt(categoryId) : null,
        coverImageUrl: coverImageUrl.trim() || null,
        status: status,
      };

      const response = await apiClient.patch(`/api/posts/${id}`, postData);

      if (status === 'PUBLISHED') {
        navigate(`/post/${response.data.slug}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to update post:', err);
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Edit Story</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatus === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
              currentStatus === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                currentStatus === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                  currentStatus === 'ARCHIVED' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
              }`}>
              {currentStatus.replace('_', ' ')}
            </span>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full text-4xl font-bold border-none outline-none focus:ring-0 placeholder-gray-300"
              disabled={saving}
            />
          </div>

          {/* Summary */}
          <div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a short summary..."
              className="w-full text-xl text-gray-600 border-none outline-none focus:ring-0 placeholder-gray-300 resize-none"
              rows={2}
              disabled={saving}
            />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={coverImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverImageInputRef.current?.click()}
                  disabled={saving || uploading}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : coverImageUrl ? 'Change Image' : 'Upload Image'}
                </Button>
                {coverImageUrl && (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Image uploaded</span>
                  </div>
                )}
              </div>
              {coverImageUrl && (
                <div className="mt-2">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="h-24 w-auto rounded-md border object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Markdown Editor */}
          <div className="border-t pt-6">
            <SimpleMDE
              value={content}
              onChange={setContent}
              options={editorOptions}
              getMdeInstance={(mde) => {
                editorRef.current = mde;
                patchMdeBoldBehavior(mde);
              }}
            />
          </div>

          {/* Tags */}
          <div>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#tag1 #tag2 #tag3..."
              className="w-full text-lg text-gray-600 border-none outline-none focus:ring-0 placeholder-gray-300"
              disabled={saving}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => handleUpdate('DRAFT')}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={() => handleUpdate('PUBLISHED')}
              disabled={saving}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {saving ? 'Updating...' : currentStatus === 'PUBLISHED' ? 'Update & Publish' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
