

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Link2, 
  Tag, 
  BookOpen, 
  Clock,
  ChevronDown,
  ChevronRight,
  Hash,
  Sparkles,
  Brain,
  Zap,
  Save,
  Share2,
  Filter
} from 'lucide-react';
import { useExtensionState } from '../lib/extension/useExtensionState';
import { useGlobalStatus } from '../lib/extension/GlobalStatusProvider';

const SemanticNotebook = ({ 
  notebookId, 
  initialNotes = [], 
  onNoteUpdate, 
  onReferenceAdd,
  readOnly = false,
  className = '' 
}) => {

  const [notes, setNotes] = useState(initialNotes);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [viewMode, setViewMode] = useState('structured'); // structured, mindmap, timeline
  const [sortBy, setSortBy] = useState('modified'); // created, modified, relevance

  const [researchData] = useExtensionState('researchData', { storage: 'session' });
  const { addToast, startOperation, completeOperation } = useGlobalStatus();

  const availableTags = useMemo(() => {
    const allTags = new Set();
    notes.forEach(note => {
      if (note.tags) {
        note.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        note.tags && selectedTags.some(tag => note.tags.includes(tag))
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'modified':
          return new Date(b.modifiedAt) - new Date(a.modifiedAt);
        case 'relevance':
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        default:
          return 0;
      }
    });
  }, [notes, searchQuery, selectedTags, sortBy]);

  const sections = useMemo(() => {
    const sections = new Map();
    
    filteredNotes.forEach(note => {
      const section = note.section || 'General';
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      sections.get(section).push(note);
    });

    return Array.from(sections.entries()).map(([name, notes]) => ({
      name,
      notes: notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      count: notes.length
    }));
  }, [filteredNotes]);

  const handleCreateNote = useCallback(async () => {
    startOperation('createNote');
    
    const newNote = {
      id: `note_${Date.now()}`,
      title: 'New Note',
      content: '',
      tags: [],
      section: 'General',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      references: [],
      aiGenerated: false,
      relevanceScore: 0
    };

    try {
      setNotes(prev => [newNote, ...prev]);
      setSelectedNote(newNote);
      setIsEditing(true);
      completeOperation('createNote', { success: true, message: 'New note created' });
    } catch (error) {
      completeOperation('createNote', error, { 
        title: 'Failed to create note',
        message: 'Could not create new note. Please try again.'
      });
    }
  }, [startOperation, completeOperation]);

  const handleUpdateNote = useCallback(async (updatedNote) => {
    startOperation('updateNote');
    
    try {
      const noteWithTimestamp = {
        ...updatedNote,
        modifiedAt: new Date().toISOString()
      };

      setNotes(prev => prev.map(note => 
        note.id === updatedNote.id ? noteWithTimestamp : note
      ));

      if (onNoteUpdate) {
        onNoteUpdate(noteWithTimestamp);
      }

      completeOperation('updateNote', { success: true, message: 'Note updated successfully' });
    } catch (error) {
      completeOperation('updateNote', error, {
        title: 'Failed to update note',
        message: 'Could not update note. Please try again.'
      });
    }
  }, [startOperation, completeOperation, onNoteUpdate]);

  const handleDeleteNote = useCallback(async (noteId) => {
    startOperation('deleteNote');
    
    try {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }

      completeOperation('deleteNote', { success: true, message: 'Note deleted successfully' });
    } catch (error) {
      completeOperation('deleteNote', error, {
        title: 'Failed to delete note',
        message: 'Could not delete note. Please try again.'
      });
    }
  }, [startOperation, completeOperation]);

  const handleAIEnhance = useCallback(async (note) => {
    startOperation('aiEnhance');
    setIsAIGenerated(true);

    try {

      const enhancedContent = await enhanceNoteWithAI(note.content);
      
      const enhancedNote = {
        ...note,
        content: enhancedContent,
        aiGenerated: true,
        modifiedAt: new Date().toISOString()
      };

      setNotes(prev => prev.map(n => 
        n.id === note.id ? enhancedNote : n
      ));

      completeOperation('aiEnhance', { success: true, message: 'Note enhanced with AI' });
    } catch (error) {
      completeOperation('aiEnhance', error, {
        title: 'AI Enhancement Failed',
        message: 'Could not enhance note with AI. Please try again.'
      });
    } finally {
      setIsAIGenerated(false);
    }
  }, [startOperation, completeOperation]);

  const handleTagToggle = useCallback((tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleAddReference = useCallback((note, reference) => {
    const updatedNote = {
      ...note,
      references: [...(note.references || []), reference],
      modifiedAt: new Date().toISOString()
    };

    setNotes(prev => prev.map(n => 
      n.id === note.id ? updatedNote : n
    ));

    if (onReferenceAdd) {
      onReferenceAdd(reference);
    }
  }, [onReferenceAdd]);

  const toggleSection = useCallback((sectionName) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  }, []);

  const enhanceNoteWithAI = async (content) => {

    return new Promise((resolve) => {
      setTimeout(() => {

        const enhanced = `
# Enhanced Content

## Key Points
• Enhanced point 1 based on original content
• Enhanced point 2 with additional context
• Enhanced point 3 with related concepts

## Summary
${content.substring(0, 200)}...

## Additional Insights
• AI-generated insight about the content
• Related concepts to consider
• Actionable recommendations

## Tags
AI-generated, enhanced, summary, insights
        `;
        resolve(enhanced.trim());
      }, 1500);
    });
  };

  const handleQuickNote = useCallback(() => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      const newNote = {
        id: `note_${Date.now()}`,
        title: 'Quick Note',
        content: selectedText,
        tags: ['quick-note'],
        section: 'Quick Notes',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        references: [{
          title: 'Quick Note Reference',
          url: window.location.href
        }],
        aiGenerated: false,
        relevanceScore: 1
      };
      
      setNotes(prev => [newNote, ...prev]);
      addToast({
        type: 'success',
        title: 'Quick Note Created',
        message: 'Selected text saved as a quick note'
      });
    }
  }, [addToast]);

  return (
    <div className={`semantic-notebook ${className}`}>
      
      <div className="notebook-header">
        <div className="notebook-title">
          <BookOpen className="w-5 h-5" />
          <h2>Research Notebook</h2>
        </div>
        
        <div className="notebook-actions">
          <div className="search-container">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="view-controls">
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              className="view-mode-select"
            >
              <option value="structured">Structured</option>
              <option value="mindmap">Mind Map</option>
              <option value="timeline">Timeline</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="created">Date Created</option>
              <option value="modified">Last Modified</option>
              <option value="relevance">Relevance</option>
            </select>
          </div>
          
          <button
            onClick={handleCreateNote}
            disabled={readOnly}
            className="create-note-btn"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        
        <div className="tag-filter">
          <Tag className="w-4 h-4" />
          <div className="tag-list">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`tag-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      
      <div className="notebook-content">
        {viewMode === 'structured' && (
          <div className="structured-view">
            {sections.map(section => (
              <div key={section.name} className="note-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection(section.name)}
                >
                  <h3 className="section-title">
                    {section.name}
                    <span className="section-count">({section.count})</span>
                  </h3>
                  <ChevronDown 
                    className={`section-chevron ${expandedSections.has(section.name) ? 'expanded' : ''}`}
                  />
                </div>
                
                {expandedSections.has(section.name) && (
                  <div className="section-content">
                    {section.notes.map(note => (
                      <div 
                        key={note.id} 
                        className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <div className="note-header">
                          <div className="note-meta">
                            <h4 className="note-title">{note.title}</h4>
                            <div className="note-tags">
                              {note.tags.map(tag => (
                                <span key={tag} className="note-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="note-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAIEnhance(note);
                              }}
                              disabled={isAIGenerated}
                              className="ai-enhance-btn"
                              title="Enhance with AI"
                            >
                              {isAIGenerated && note.id === selectedNote?.id ? (
                                <div className="mini-spinner" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </button>
                            
                            {!readOnly && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsEditing(true);
                                }}
                                className="edit-btn"
                                title="Edit note"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            
                            {!readOnly && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                }}
                                className="delete-btn"
                                title="Delete note"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="note-date">
                            <Clock className="w-3 h-3" />
                            {new Date(note.modifiedAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="note-content">
                          {note.aiGenerated && (
                            <div className="ai-indicator">
                              <Brain className="w-3 h-3" />
                              <span>AI Enhanced</span>
                            </div>
                          )}
                          
                          {isEditing && selectedNote?.id === note.id ? (
                            <textarea
                              value={note.content}
                              onChange={(e) => {
                                const updatedNote = { ...note, content: e.target.value };
                                handleUpdateNote(updatedNote);
                              }}
                              className="note-editor"
                              placeholder="Start typing your note..."
                              autoFocus
                            />
                          ) : (
                            <div className="note-text">
                              {note.content}
                            </div>
                          )}
                        </div>
                        
                        {note.references && note.references.length > 0 && (
                          <div className="note-references">
                            <Link2 className="w-3 h-3" />
                            <div className="references-list">
                              {note.references.map((ref, index) => (
                                <div key={index} className="reference-item">
                                  <a href={ref.url} target="_blank" className="reference-link">
                                    {ref.title}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'mindmap' && (
          <div className="mindmap-view">
            <div className="mindmap-container">
              {filteredNotes.map((note, index) => (
                <div 
                  key={note.id} 
                  className="mindmap-node"
                  style={{
                    left: `${Math.cos(index * 0.5) * 300}px`,
                    top: `${Math.sin(index * 0.5) * 200}px`
                  }}
                >
                  <div className="mindmap-content">
                    <h4>{note.title}</h4>
                    <p>{note.content.substring(0, 100)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="timeline-view">
            <div className="timeline-container">
              {filteredNotes.map((note, index) => (
                <div key={note.id} className="timeline-item">
                  <div className="timeline-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-dot"></div>
                    <div className="timeline-note">
                      <h4>{note.title}</h4>
                      <p>{note.content.substring(0, 200)}...</p>
                      {note.tags && (
                        <div className="timeline-tags">
                          {note.tags.map(tag => (
                            <span key={tag} className="timeline-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      
      {selectedNote && (
        <div className="note-detail-panel">
          <div className="note-detail-header">
            <h3>{selectedNote.title}</h3>
            <button
              onClick={() => setSelectedNote(null)}
              className="close-detail-btn"
            >
              ×
            </button>
          </div>
          
          <div className="note-detail-content">
            <div className="note-detail-meta">
              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span>{new Date(selectedNote.createdAt).toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Modified:</span>
                <span>{new Date(selectedNote.modifiedAt).toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Tags:</span>
                <div className="note-tags">
                  {selectedNote.tags.map(tag => (
                    <span key={tag} className="note-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="note-detail-text">
              {selectedNote.content}
            </div>
            
            {selectedNote.references && selectedNote.references.length > 0 && (
              <div className="note-detail-references">
                <h4>References</h4>
                {selectedNote.references.map((ref, index) => (
                  <div key={index} className="reference-item">
                    <a href={ref.url} target="_blank" className="reference-link">
                      {ref.title}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    
    <div className="floating-actions">
      <button
        onClick={handleQuickNote}
        className="quick-note-btn"
        title="Save selection as quick note"
      >
        <Zap className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default SemanticNotebook;
