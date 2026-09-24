import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, Image as ImageIcon, 
  BookOpen, Link as LinkIcon, Minus, Undo, Redo, Eye, Code, 
  Sparkles, X, Check, UploadCloud, ChevronDown, Palette, Highlighter,
  ExternalLink
} from 'lucide-react';
import { PRODUCTS } from '../db';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  onToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onUploadImage,
  onToast,
  minHeight = '420px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [isFocused, setIsFocused] = useState(false);
  const savedSelectionRef = useRef<Range | null>(null);

  // Modals state
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEbookModal, setShowEbookModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showCalloutMenu, setShowCalloutMenu] = useState(false);

  // Image Modal State
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ebook Modal State
  const availableEbooks = Object.values(PRODUCTS);
  const [selectedEbookId, setSelectedEbookId] = useState<string>(
    availableEbooks[0]?.id || 'high-protein-dessert-cookbook-70'
  );
  const [ebookBadgeText, setEbookBadgeText] = useState('⭐ Featured Recommendation');
  const [ebookButtonText, setEbookButtonText] = useState('Get The Cookbook Now →');

  // Link Modal State
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  // Active formats tracking
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  // Keep internal HTML in sync when switching or external value changes
  useEffect(() => {
    if (editorRef.current && viewMode === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '<p></p>';
      }
    }
  }, [value, viewMode]);

  // Update selection range
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Check active formatting for toolbar feedback
  const updateActiveFormats = () => {
    if (viewMode !== 'visual') return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // ignore
    }
  };

  const triggerChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
      updateActiveFormats();
    }
  };

  // Standard execCommand runner
  const execCmd = (command: string, arg?: string) => {
    if (viewMode !== 'visual') return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    triggerChange();
  };

  // Insert arbitrary HTML fragment at current cursor position
  const insertHtmlAtCursor = (html: string) => {
    if (viewMode === 'code') {
      onChange(value + '\n\n' + html);
      return;
    }

    editorRef.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current?.contains(sel.anchorNode)) {
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
        triggerChange();
      }
      return;
    }

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: Node | null;
    let lastNode: Node | null = null;
    while ((node = tempDiv.firstChild)) {
      lastNode = frag.appendChild(node);
    }

    range.insertNode(frag);

    if (lastNode) {
      const newRange = range.cloneRange();
      newRange.setStartAfter(lastNode);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    triggerChange();
  };

  // Paragraph/Heading Block formatting
  const handleBlockFormat = (tag: string) => {
    if (tag === 'p') {
      execCmd('formatBlock', '<p>');
    } else if (tag === 'h2') {
      execCmd('formatBlock', '<h2>');
    } else if (tag === 'h3') {
      execCmd('formatBlock', '<h3>');
    } else if (tag === 'blockquote') {
      execCmd('formatBlock', '<blockquote>');
    }
  };

  // Image Upload & Insertion
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!onUploadImage) {
      onToast?.('Cloudinary image upload is not configured on this page.', 'error');
      return;
    }

    setUploadingImage(true);
    onToast?.('Uploading image to Cloudinary...', 'info');

    try {
      const uploadedUrl = await onUploadImage(file);
      setImageUrl(uploadedUrl);
      if (!imageAlt) {
        setImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      onToast?.('Image uploaded successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      onToast?.(`Upload failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      onToast?.('Please upload an image or provide a valid image URL.', 'error');
      return;
    }

    const alignClass = 
      imageAlign === 'left' ? 'blog-inline-left' :
      imageAlign === 'right' ? 'blog-inline-right' : 'blog-inline-center';

    const figureHtml = `
<figure class="blog-inline-figure ${alignClass}">
  <img src="${imageUrl.trim()}" alt="${imageAlt.trim() || 'BHYou Recipe Illustration'}" class="blog-inline-img" />
  ${imageCaption.trim() ? `<figcaption class="blog-inline-caption">${imageCaption.trim()}</figcaption>` : ''}
</figure>
<p></p>
`.trim();

    insertHtmlAtCursor(figureHtml);
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    onToast?.('Image inserted into article!', 'success');
  };

  // Ebook CTA Card Insertion
  const handleInsertEbook = () => {
    const ebook = availableEbooks.find(e => e.id === selectedEbookId) || availableEbooks[0];
    if (!ebook) {
      onToast?.('No ebook selected.', 'error');
      return;
    }

    const perks = ebook.id.includes('dessert') ? [
      '70 Decadent High-Protein Desserts',
      'All Under 400 Calories Per Serving',
      'Full Macro & Calorie Breakdown',
      'Instant Lifetime PDF Download'
    ] : [
      '50 Quick & Easy High-Protein Meals',
      'Fat-Loss & Muscle-Building Macros',
      'Breakfast, Lunch, Dinner & Prep',
      'Instant Lifetime PDF Download'
    ];

    const cardHtml = `
<div class="blog-ebook-cta-card" data-ebook-id="${ebook.id}">
  <div class="blog-ebook-badge">${ebookBadgeText}</div>
  <div class="blog-ebook-content">
    <div class="blog-ebook-cover-wrap">
      <img src="${ebook.coverImage}" alt="${ebook.title}" class="blog-ebook-cover-img" />
    </div>
    <div class="blog-ebook-info">
      <h3 class="blog-ebook-title">${ebook.title}</h3>
      <p class="blog-ebook-subtitle">${ebook.subtitle || ebook.description.substring(0, 110) + '...'}</p>
      <ul class="blog-ebook-perks-list">
        ${perks.map(p => `<li><span class="perk-check">✓</span> ${p}</li>`).join('')}
      </ul>
      <div class="blog-ebook-footer-row">
        <div class="blog-ebook-price-group">
          <span class="blog-ebook-price">$${ebook.price}</span>
          ${ebook.originalPrice ? `<span class="blog-ebook-original-price">$${ebook.originalPrice}</span>` : ''}
          <span class="blog-ebook-save-tag">SAVE ${Math.round((1 - ebook.price / (ebook.originalPrice || 29.99)) * 100)}%</span>
        </div>
        <a href="${ebook.gumroadUrl}" target="_blank" rel="noopener noreferrer" class="blog-ebook-cta-btn">
          ${ebookButtonText}
        </a>
      </div>
    </div>
  </div>
</div>
<p></p>
`.trim();

    insertHtmlAtCursor(cardHtml);
    setShowEbookModal(false);
    onToast?.(`Inserted "${ebook.title}" CTA card into article!`, 'success');
  };

  // Callout Box Insertion
  const handleInsertCallout = (type: 'tip' | 'note' | 'secret') => {
    let title = '💡 Pro Nutrition Tip';
    let borderColor = '#22c55e';
    let bg = '#f0fdf4';
    let textColor = '#166534';
    let defaultText = 'For the best macro ratio, use whey isolate powder to maximize protein density without extra carbohydrates.';

    if (type === 'note') {
      title = 'ℹ️ Chef’s Note';
      borderColor = '#3b82f6';
      bg = '#eff6ff';
      textColor = '#1e40af';
      defaultText = 'You can prepare this recipe in advance and store in an airtight container in the fridge for up to 4 days.';
    } else if (type === 'secret') {
      title = '⭐ Fat Loss Secret';
      borderColor = '#f59e0b';
      bg = '#fffbeb';
      textColor = '#92400e';
      defaultText = 'Pairing high-protein desserts with a large glass of water keeps you satiated for hours and suppresses midnight sweet cravings.';
    }

    const calloutHtml = `
<div class="blog-callout-box" style="border-left: 4px solid ${borderColor}; background-color: ${bg}; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
  <div style="font-weight: 700; color: ${textColor}; font-size: 15px; margin-bottom: 6px;">${title}</div>
  <p style="margin: 0; color: #334155; font-size: 14.5px; line-height: 1.6;">${defaultText}</p>
</div>
<p></p>
`.trim();

    insertHtmlAtCursor(calloutHtml);
    setShowCalloutMenu(false);
    onToast?.('Inserted callout block!', 'success');
  };

  // Link Insertion
  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      onToast?.('Please enter a destination URL', 'error');
      return;
    }
    const target = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const text = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${linkUrl.trim()}"${target} style="color: var(--primary); text-decoration: underline; font-weight: 500;">${text}</a>`;
    insertHtmlAtCursor(linkHtml);
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
    onToast?.('Link inserted!', 'success');
  };

  // Metrics
  const textContent = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent ? textContent.split(' ').filter(Boolean).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const selectedEbook = availableEbooks.find(e => e.id === selectedEbookId) || availableEbooks[0];

  return (
    <div className={`word-editor-container ${isFocused ? 'word-editor-focused' : ''}`}>
      {/* Top Header / View Bar */}
      <div className="word-editor-header">
        <div className="word-editor-title-wrap">
          <span className="word-editor-app-badge">Word Document View</span>
          <span className="word-editor-stats">
            <strong>{wordCount}</strong> words • ~<strong>{readTimeMin}</strong> min read
          </span>
        </div>

        <div className="word-editor-view-toggles">
          <button
            type="button"
            className={`word-view-toggle-btn ${viewMode === 'visual' ? 'active' : ''}`}
            onClick={() => {
              saveSelection();
              setViewMode('visual');
            }}
            title="Visual Document Editor (Word style)"
          >
            <Eye size={14} /> Visual Editor
          </button>
          <button
            type="button"
            className={`word-view-toggle-btn ${viewMode === 'code' ? 'active' : ''}`}
            onClick={() => setViewMode('code')}
            title="Raw HTML Source Code"
          >
            <Code size={14} /> HTML Source
          </button>
        </div>
      </div>

      {/* Microsoft Word-Style Ribbon Toolbar */}
      {viewMode === 'visual' && (
        <div className="word-ribbon-toolbar">
          {/* Undo / Redo */}
          <div className="word-tool-group">
            <button 
              type="button" 
              className="word-tool-btn" 
              onClick={() => execCmd('undo')} 
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} />
            </button>
            <button 
              type="button" 
              className="word-tool-btn" 
              onClick={() => execCmd('redo')} 
              title="Redo (Ctrl+Y)"
            >
              <Redo size={16} />
            </button>
          </div>

          <div className="word-tool-divider" />

          {/* Heading / Style dropdown */}
          <div className="word-tool-group">
            <select
              className="word-tool-select"
              onChange={(e) => {
                handleBlockFormat(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              title="Paragraph Style / Headings"
            >
              <option value="" disabled>Style...</option>
              <option value="p">Normal Paragraph</option>
              <option value="h2">Heading 2 (Section Title)</option>
              <option value="h3">Heading 3 (Sub-heading)</option>
              <option value="blockquote">Quote Block</option>
            </select>
          </div>

          <div className="word-tool-divider" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <div className="word-tool-group">
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.bold ? 'active' : ''}`}
              onClick={() => execCmd('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.italic ? 'active' : ''}`}
              onClick={() => execCmd('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.underline ? 'active' : ''}`}
              onClick={() => execCmd('underline')}
              title="Underline (Ctrl+U)"
            >
              <Underline size={16} />
            </button>
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.strike ? 'active' : ''}`}
              onClick={() => execCmd('strikeThrough')}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>
          </div>

          <div className="word-tool-divider" />

          {/* Text Color & Highlight Pickers */}
          <div className="word-tool-group" style={{ position: 'relative' }}>
            <button
              type="button"
              className="word-tool-btn"
              onClick={() => {
                saveSelection();
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              title="Text Color"
            >
              <Palette size={16} />
              <ChevronDown size={10} style={{ marginLeft: 2 }} />
            </button>

            {showColorPicker && (
              <div className="word-popup-palette">
                <span className="palette-title">Text Color</span>
                <div className="palette-swatches">
                  {[
                    { color: '#1e293b', label: 'Dark Navy' },
                    { color: '#2d5a27', label: 'BHYou Green' },
                    { color: '#c5a059', label: 'BHYou Gold' },
                    { color: '#dc2626', label: 'Vibrant Red' },
                    { color: '#2563eb', label: 'Blue' },
                    { color: '#64748b', label: 'Slate Gray' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      className="swatch-btn"
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                      onClick={() => {
                        restoreSelection();
                        execCmd('foreColor', c.color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              className="word-tool-btn"
              onClick={() => {
                saveSelection();
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              title="Text Highlight"
            >
              <Highlighter size={16} />
              <ChevronDown size={10} style={{ marginLeft: 2 }} />
            </button>

            {showHighlightPicker && (
              <div className="word-popup-palette">
                <span className="palette-title">Highlight Background</span>
                <div className="palette-swatches">
                  {[
                    { color: '#fef08a', label: 'Soft Yellow' },
                    { color: '#bbf7d0', label: 'Mint Green' },
                    { color: '#bae6fd', label: 'Sky Blue' },
                    { color: '#fed7aa', label: 'Warm Peach' },
                    { color: 'transparent', label: 'Clear Highlight' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      className="swatch-btn"
                      style={{ 
                        backgroundColor: c.color === 'transparent' ? '#ffffff' : c.color, 
                        border: c.color === 'transparent' ? '1px dashed #94a3b8' : 'none' 
                      }}
                      title={c.label}
                      onClick={() => {
                        restoreSelection();
                        execCmd('hiliteColor', c.color);
                        setShowHighlightPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="word-tool-divider" />

          {/* Alignment */}
          <div className="word-tool-group">
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.justifyLeft ? 'active' : ''}`}
              onClick={() => execCmd('justifyLeft')}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.justifyCenter ? 'active' : ''}`}
              onClick={() => execCmd('justifyCenter')}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.justifyRight ? 'active' : ''}`}
              onClick={() => execCmd('justifyRight')}
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <button
              type="button"
              className="word-tool-btn"
              onClick={() => execCmd('justifyFull')}
              title="Justify"
            >
              <AlignJustify size={16} />
            </button>
          </div>

          <div className="word-tool-divider" />

          {/* Lists */}
          <div className="word-tool-group">
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`}
              onClick={() => execCmd('insertUnorderedList')}
              title="Bulleted List"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`word-tool-btn ${activeFormats.insertOrderedList ? 'active' : ''}`}
              onClick={() => execCmd('insertOrderedList')}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          <div className="word-tool-divider" />

          {/* INSERT SPECIALS - User's Core Features */}
          <div className="word-tool-group word-specials-group">
            {/* 📸 INSERT IMAGE */}
            <button
              type="button"
              className="word-tool-btn-special word-image-btn"
              onClick={() => {
                saveSelection();
                setShowImageModal(true);
              }}
              title="Upload / Insert Article Image"
            >
              <ImageIcon size={16} />
              <span>Insert Image</span>
            </button>

            {/* 📚 INSERT EBOOK CTA CARD */}
            <button
              type="button"
              className="word-tool-btn-special word-ebook-btn"
              onClick={() => {
                saveSelection();
                setShowEbookModal(true);
              }}
              title="Choose and Embed Ebook CTA Card"
            >
              <BookOpen size={16} />
              <span>Embed Ebook Card</span>
            </button>

            {/* 💡 CALLOUT BOX */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="word-tool-btn"
                onClick={() => {
                  saveSelection();
                  setShowCalloutMenu(!showCalloutMenu);
                }}
                title="Insert Nutrition Tip / Callout Box"
              >
                <Sparkles size={16} />
                <ChevronDown size={10} style={{ marginLeft: 2 }} />
              </button>

              {showCalloutMenu && (
                <div className="word-popup-callouts">
                  <button type="button" onClick={() => handleInsertCallout('tip')}>
                    💡 <strong>Pro Nutrition Tip</strong> (Green)
                  </button>
                  <button type="button" onClick={() => handleInsertCallout('note')}>
                    ℹ️ <strong>Chef’s Note</strong> (Blue)
                  </button>
                  <button type="button" onClick={() => handleInsertCallout('secret')}>
                    ⭐ <strong>Fat Loss Secret</strong> (Amber)
                  </button>
                </div>
              )}
            </div>

            {/* 🔗 INSERT LINK */}
            <button
              type="button"
              className="word-tool-btn"
              onClick={() => {
                saveSelection();
                const sel = window.getSelection()?.toString() || '';
                setLinkText(sel);
                setShowLinkModal(true);
              }}
              title="Insert Link"
            >
              <LinkIcon size={16} />
            </button>

            {/* ➖ DIVIDER */}
            <button
              type="button"
              className="word-tool-btn"
              onClick={() => insertHtmlAtCursor('<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" /><p></p>')}
              title="Horizontal Divider Line"
            >
              <Minus size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Canvas (Visual Word View vs Raw HTML) */}
      <div className="word-editor-canvas-wrapper" style={{ minHeight }}>
        {viewMode === 'visual' ? (
          <div
            ref={editorRef}
            className="word-document-canvas post-content"
            contentEditable
            suppressContentEditableWarning
            onFocus={() => {
              setIsFocused(true);
              updateActiveFormats();
            }}
            onBlur={() => {
              setIsFocused(false);
              triggerChange();
            }}
            onKeyUp={() => {
              updateActiveFormats();
              triggerChange();
            }}
            onMouseUp={() => {
              updateActiveFormats();
              saveSelection();
            }}
            style={{ minHeight }}
          />
        ) : (
          <textarea
            className="word-code-textarea"
            style={{ minHeight }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write or paste your article HTML here..."
          />
        )}
      </div>

      {/* Footer Helper Status */}
      <div className="word-editor-footer-status">
        <span className="status-tip">
          💡 <strong>Tip:</strong> You can paste images, format text, and insert clickable cookbook buy cards anytime. All changes auto-save when you click <strong>Save Post</strong> below.
        </span>
        <span className="status-mode">
          Mode: <strong>{viewMode === 'visual' ? 'Visual Document Canvas' : 'Direct HTML Code'}</strong>
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 📸 MODAL: INSERT / UPLOAD IMAGE                                            */}
      {/* ========================================================================= */}
      {showImageModal && (
        <div className="word-modal-backdrop" onClick={() => setShowImageModal(false)}>
          <div className="word-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="word-modal-header">
              <h3>
                <ImageIcon size={20} color="var(--primary)" /> Insert Image to Article
              </h3>
              <button 
                type="button" 
                className="word-modal-close" 
                onClick={() => setShowImageModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="word-modal-tabs">
              <button
                type="button"
                className={`word-modal-tab ${imageTab === 'upload' ? 'active' : ''}`}
                onClick={() => setImageTab('upload')}
              >
                <UploadCloud size={16} /> Upload from Computer (Cloudinary)
              </button>
              <button
                type="button"
                className={`word-modal-tab ${imageTab === 'url' ? 'active' : ''}`}
                onClick={() => setImageTab('url')}
              >
                <ExternalLink size={16} /> Paste Web URL
              </button>
            </div>

            <div className="word-modal-body">
              {imageTab === 'upload' ? (
                <div className="word-upload-box">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="word-editor-image-upload"
                  />
                  <label htmlFor="word-editor-image-upload" className="word-dropzone-label">
                    <UploadCloud size={36} color="var(--primary)" />
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>
                      {uploadingImage ? 'Uploading image to Cloudinary...' : 'Click to select image file'}
                    </span>
                    <span style={{ color: 'var(--text-muted-dark)', fontSize: '13px' }}>
                      Supports PNG, JPG, WebP. High resolution optimized automatically.
                    </span>
                  </label>

                  {imageUrl && (
                    <div className="word-image-preview-box">
                      <img src={imageUrl} alt="Uploaded preview" />
                      <div className="preview-meta">
                        <span className="badge-ok">✓ Uploaded to Cloudinary</span>
                        <span className="preview-url">{imageUrl}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="word-modal-field">
                  <label>Image Direct URL</label>
                  <input
                    type="url"
                    className="admin-form-input"
                    placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              )}

              <div className="word-modal-field" style={{ marginTop: 16 }}>
                <label>Image SEO Alt Text (Recommended for Google Images)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Delicious high protein cheesecake slice on plate"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>

              <div className="word-modal-field" style={{ marginTop: 12 }}>
                <label>Caption (Optional, appears below image)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Step 1: Blend the protein mixture until smooth"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                />
              </div>

              <div className="word-modal-field" style={{ marginTop: 12 }}>
                <label>Image Alignment</label>
                <div className="word-align-selector">
                  <button
                    type="button"
                    className={`align-btn ${imageAlign === 'center' ? 'active' : ''}`}
                    onClick={() => setImageAlign('center')}
                  >
                    Centered / Full Width
                  </button>
                  <button
                    type="button"
                    className={`align-btn ${imageAlign === 'left' ? 'active' : ''}`}
                    onClick={() => setImageAlign('left')}
                  >
                    Float Left
                  </button>
                  <button
                    type="button"
                    className={`align-btn ${imageAlign === 'right' ? 'active' : ''}`}
                    onClick={() => setImageAlign('right')}
                  >
                    Float Right
                  </button>
                </div>
              </div>
            </div>

            <div className="word-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowImageModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleInsertImage}
                disabled={!imageUrl || uploadingImage}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={16} /> Insert Into Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📚 MODAL: SELECT & EMBED EBOOK CTA CARD                                    */}
      {/* ========================================================================= */}
      {showEbookModal && (
        <div className="word-modal-backdrop" onClick={() => setShowEbookModal(false)}>
          <div className="word-modal-dialog word-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="word-modal-header">
              <h3>
                <BookOpen size={20} color="#b45309" /> Choose Ebook to Embed in Article
              </h3>
              <button 
                type="button" 
                className="word-modal-close" 
                onClick={() => setShowEbookModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="word-modal-body">
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Select Cookbook / Product:
              </label>

              {/* Ebook Card Selector */}
              <div className="word-ebook-grid">
                {availableEbooks.map((prod) => (
                  <div
                    key={prod.id}
                    className={`word-ebook-choice ${selectedEbookId === prod.id ? 'active' : ''}`}
                    onClick={() => setSelectedEbookId(prod.id)}
                  >
                    <img src={prod.coverImage} alt={prod.title} className="choice-cover" />
                    <div className="choice-info">
                      <h4>{prod.title}</h4>
                      <p>{prod.subtitle || prod.description.substring(0, 70) + '...'}</p>
                      <div className="choice-pricing">
                        <span className="price">${prod.price}</span>
                        {prod.originalPrice && <span className="orig">${prod.originalPrice}</span>}
                      </div>
                    </div>
                    {selectedEbookId === prod.id && (
                      <div className="choice-selected-badge">
                        <Check size={14} /> Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Customization Options */}
              <div className="grid-2col" style={{ marginTop: 20 }}>
                <div className="word-modal-field">
                  <label>Promotional Badge Text</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={ebookBadgeText}
                    onChange={(e) => setEbookBadgeText(e.target.value)}
                    placeholder="⭐ Featured Recommendation"
                  />
                </div>
                <div className="word-modal-field">
                  <label>Buy Button Call To Action</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={ebookButtonText}
                    onChange={(e) => setEbookButtonText(e.target.value)}
                    placeholder="Get The Cookbook Now →"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div style={{ marginTop: 20 }}>
                <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  Live Article Card Preview:
                </label>
                {selectedEbook && (
                  <div className="blog-ebook-cta-card">
                    <div className="blog-ebook-badge">{ebookBadgeText}</div>
                    <div className="blog-ebook-content">
                      <div className="blog-ebook-cover-wrap">
                        <img src={selectedEbook.coverImage} alt={selectedEbook.title} className="blog-ebook-cover-img" />
                      </div>
                      <div className="blog-ebook-info">
                        <h3 className="blog-ebook-title">{selectedEbook.title}</h3>
                        <p className="blog-ebook-subtitle">{selectedEbook.subtitle}</p>
                        <div className="blog-ebook-footer-row">
                          <div className="blog-ebook-price-group">
                            <span className="blog-ebook-price">${selectedEbook.price}</span>
                            {selectedEbook.originalPrice && (
                              <span className="blog-ebook-original-price">${selectedEbook.originalPrice}</span>
                            )}
                          </div>
                          <button type="button" className="blog-ebook-cta-btn" style={{ pointerEvents: 'none' }}>
                            {ebookButtonText}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="word-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowEbookModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleInsertEbook}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#b45309', borderColor: '#92400e' }}
              >
                <BookOpen size={16} /> Embed Ebook in Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔗 MODAL: INSERT LINK                                                      */}
      {/* ========================================================================= */}
      {showLinkModal && (
        <div className="word-modal-backdrop" onClick={() => setShowLinkModal(false)}>
          <div className="word-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="word-modal-header">
              <h3>
                <LinkIcon size={20} color="var(--primary)" /> Insert Link
              </h3>
              <button 
                type="button" 
                className="word-modal-close" 
                onClick={() => setShowLinkModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="word-modal-body">
              <div className="word-modal-field">
                <label>Text to Display</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. check out our healthy cheesecake recipe"
                />
              </div>

              <div className="word-modal-field" style={{ marginTop: 12 }}>
                <label>URL Destination</label>
                <input
                  type="url"
                  className="admin-form-input"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="link-new-tab"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                />
                <label htmlFor="link-new-tab" style={{ fontSize: '13px', cursor: 'pointer', margin: 0 }}>
                  Open link in new tab (`target="_blank"`)
                </label>
              </div>
            </div>

            <div className="word-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleInsertLink}
                disabled={!linkUrl.trim()}
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
