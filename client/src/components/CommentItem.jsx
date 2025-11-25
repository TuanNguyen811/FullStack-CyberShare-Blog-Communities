import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const CommentItem = ({ comment, onReply, onEdit, onDelete, depth = 0 }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');

  const isAuthor = user?.id === comment.author.id;
  const maxDepth = 1;
  const canReply = depth < maxDepth;

  const handleEdit = () => {
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const handleReply = () => {
    // If replying to a reply (depth > 0), find the parent comment ID
    const targetParentId = depth > 0 ? comment.parentId : comment.id;
    onReply(targetParentId, replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this comment and all replies?')) {
      onDelete(comment.id);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} border-l-2 border-gray-200 pl-4`}>
      <div className="flex items-start space-x-3">
        {comment.author.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
            {comment.author.displayName?.charAt(0) || comment.author.username?.charAt(0) || 'U'}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">{comment.author.displayName}</span>
            <span className="text-xs text-gray-500">
              @{comment.author.username}
            </span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-400 italic">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              <div className="mt-2 flex space-x-2">
                <Button size="sm" onClick={handleEdit}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          )}

          <div className="mt-2 flex items-center space-x-4 text-sm">
            {depth < 2 && (
              <button
                onClick={() => {
                  setIsReplying(!isReplying);
                  if (!isReplying && depth > 0) {
                    // Pre-fill with @username when replying to a reply
                    setReplyContent(`@${comment.author.username} `);
                  }
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Reply
              </button>
            )}
            {isAuthor && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {isReplying && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${comment.author.displayName}...`}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              <div className="mt-2 flex space-x-2">
                <Button size="sm" onClick={handleReply} disabled={!replyContent.trim()}>
                  Reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {comment.children && comment.children.length > 0 && depth === 0 && (
            <div className="mt-2">
              {comment.children.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  depth={1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
