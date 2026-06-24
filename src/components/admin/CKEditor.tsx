"use client";

import React, { useEffect, useRef, useState } from 'react';
import { uploadFile } from '@/lib/storage-provider';


interface CKEditorProps {
  value?: string;
  onChange?: (data: string) => void;
  placeholder?: string;
}

export default function CKEditorWrapper({ value, onChange, placeholder }: CKEditorProps) {
  const editorInstanceRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [CKEditorComponent, setCKEditorComponent] = useState<any>(null);
  const [EditorClass, setEditorClass] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    const loadEditor = async () => {
      try {
        const reactModule = await import('@ckeditor/ckeditor5-react');
        const ck = await import('ckeditor5');
        await import('ckeditor5/ckeditor5.css');

        setCKEditorComponent(() => reactModule.CKEditor);
        setEditorClass(() => ck.ClassicEditor);
        setPlugins([
          ck.Essentials,
          ck.Paragraph,
          ck.Bold,
          ck.Italic,
          ck.Underline,
          ck.Strikethrough,
          ck.Subscript,
          ck.Superscript,
          ck.Code,
          ck.RemoveFormat,
          ck.Font,
          ck.Highlight,
          ck.Alignment,
          ck.Indent,
          ck.IndentBlock,
          ck.Heading,
          ck.List,
          ck.ListProperties,
          ck.TodoList,
          ck.Link,
          ck.LinkImage,
          ck.AutoLink,
          ck.Image,
          ck.ImageCaption,
          ck.ImageResize,
          ck.ImageStyle,
          ck.ImageToolbar,
          ck.ImageUpload,
          ck.ImageInsert,
          ck.Table,
          ck.TableToolbar,
          ck.TableProperties,
          ck.TableCellProperties,
          ck.TableCaption,
          ck.TableColumnResize,
          ck.BlockQuote,
          ck.CodeBlock,
          ck.HorizontalLine,
          ck.PageBreak,
          ck.MediaEmbed,
          ck.FindAndReplace,
          ck.SpecialCharacters,
          ck.SpecialCharactersEssentials,
          ck.HtmlEmbed,
          ck.SourceEditing,
          ck.GeneralHtmlSupport,
          ck.ShowBlocks,
          ck.SelectAll,
          ck.PasteFromOffice,
          ck.TextTransformation,
          ck.WordCount,

          function MyCustomUploadAdapterPlugin(editor: any) {
            editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => ({
              upload: () => loader.file.then((file: File) =>
                uploadFile(file, 'uploads').then(url => ({ default: url }))
              ),
              abort: () => {},
            });
          },

          function VideoUploadPlugin(editor: any) {
            editor.ui.componentFactory.add('videoUpload', (locale: any) => {
              const button = new ck.ButtonView(locale);
              button.set({
                label: 'Tải video lên',
                tooltip: true,
                withText: false,
                icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1.5l3.4-2.27A.5.5 0 0 1 19 4.65v10.7a.5.5 0 0 1-.6.42L15 13.5V15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zm5 2.13v5.74a.5.5 0 0 0 .77.42l4.5-2.87a.5.5 0 0 0 0-.84l-4.5-2.87a.5.5 0 0 0-.77.42z"/></svg>',
              });
              button.on('execute', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const markerName = `videoUploadPlaceholder${Date.now()}`;
                  editor.model.change((writer: any) => {
                    const placeholderView = editor.data.processor.toView(`<p><em>Đang tải video lên...</em></p>`);
                    const placeholderModel = editor.data.toModel(placeholderView);
                    const insertedRange = editor.model.insertContent(placeholderModel);
                    writer.addMarker(markerName, { range: writer.createRange(insertedRange.start, insertedRange.end), usingOperation: false, affectsData: false });
                  });
                  try {
                    const url = await uploadFile(file, 'uploads');
                    const videoHtml = `<figure class="video-figure" style="margin:1em 0;"><video controls preload="metadata" src="${url}" style="max-width:100%;width:100%;"></video></figure><p></p>`;
                    editor.model.change((writer: any) => {
                      const marker = editor.model.markers.get(markerName);
                      let insertPos: any = null;
                      if (marker) {
                        const range = marker.getRange();
                        insertPos = writer.createPositionAt(range.start);
                        writer.removeMarker(markerName);
                        writer.remove(range);
                      }
                      const videoModel = editor.data.toModel(editor.data.processor.toView(videoHtml));
                      editor.model.insertContent(videoModel, insertPos || undefined);
                    });
                  } catch (error) {
                    console.error('Upload video failed:', error);
                    editor.model.change((writer: any) => {
                      const marker = editor.model.markers.get(markerName);
                      if (marker) { writer.remove(marker.getRange()); writer.removeMarker(markerName); }
                    });
                    alert('Tải video lên thất bại. Vui lòng thử lại.');
                  }
                };
                input.click();
              });
              return button;
            });
          },
        ]);

        setEditorLoaded(true);
      } catch (error) {
        console.error('Failed to load CKEditor:', error);
      }
    };
    loadEditor();
  }, []);

  if (!editorLoaded || !CKEditorComponent || !EditorClass) {
    return (
      <div className="w-full h-[300px] bg-gray-50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200 animate-pulse">
        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Đang tải trình soạn thảo...</span>
      </div>
    );
  }

  const CKE = CKEditorComponent;

  return (
    <div className="ck-editor-container premium-editor">
      <CKE
        editor={EditorClass}
        data={value || ''}
        config={{
          licenseKey: 'GPL',
          plugins: plugins,
          placeholder: placeholder || 'Nhập nội dung...',
          toolbar: {
            items: [
              'undo', 'redo', '|',
              'heading', '|',
              'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
              'bold', 'italic', 'underline', 'strikethrough',
              'subscript', 'superscript', 'code', 'removeFormat', '|',
              'highlight', '|',
              'link', 'insertImage', 'videoUpload',
              'insertTable', 'blockQuote', 'codeBlock', '|',
              'alignment', '|',
              'bulletedList', 'numberedList', 'todoList',
              'outdent', 'indent', '|',
              'horizontalLine', 'pageBreak',
              'specialCharacters', 'htmlEmbed', '|',
              'findAndReplace', 'selectAll',
              'showBlocks', 'sourceEditing',
            ],
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
              { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
              { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
            ],
          },
          fontFamily: {
            options: [
              'default',
              'Arial, Helvetica, sans-serif',
              'Courier New, Courier, monospace',
              'Georgia, serif',
              'Lucida Sans Unicode, Lucida Grande, sans-serif',
              'Tahoma, Geneva, sans-serif',
              'Times New Roman, Times, serif',
              'Trebuchet MS, Helvetica, sans-serif',
              'Verdana, Geneva, sans-serif',
              'Roboto, sans-serif',
            ],
            supportAllValues: true,
          },
          fontSize: {
            options: [10, 12, 14, 'default', 18, 20, 22, 24, 26, 28, 36, 48, 72],
            supportAllValues: true,
          },
          fontColor: { columns: 10, documentColors: 20 },
          fontBackgroundColor: { columns: 10, documentColors: 20 },
          alignment: { options: ['left', 'center', 'right', 'justify'] },
          image: {
            toolbar: [
              'imageTextAlternative', 'toggleImageCaption',
              'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side',
              'resizeImage', 'linkImage',
            ],
            resizeOptions: [
              { name: 'resizeImage:original', label: 'Original', value: null },
              { name: 'resizeImage:25', label: '25%', value: '25' },
              { name: 'resizeImage:50', label: '50%', value: '50' },
              { name: 'resizeImage:75', label: '75%', value: '75' },
            ],
          },
          table: {
            contentToolbar: [
              'tableColumn', 'tableRow', 'mergeTableCells',
              'tableProperties', 'tableCellProperties', 'toggleTableCaption',
            ],
          },
          list: { properties: { styles: true, startIndex: true, reversed: true } },
          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            decorators: {
              toggleDownloadable: { mode: 'manual', label: 'Downloadable', attributes: { download: 'file' } },
              openInNewTab: { mode: 'manual', label: 'Open in a new tab', defaultValue: true, attributes: { target: '_blank', rel: 'noopener noreferrer' } },
            },
          },
          highlight: {
            options: [
              { model: 'yellowMarker', class: 'marker-yellow', title: 'Yellow Marker', color: 'var(--ck-highlight-marker-yellow)', type: 'marker' },
              { model: 'greenMarker', class: 'marker-green', title: 'Green Marker', color: 'var(--ck-highlight-marker-green)', type: 'marker' },
              { model: 'pinkMarker', class: 'marker-pink', title: 'Pink Marker', color: 'var(--ck-highlight-marker-pink)', type: 'marker' },
              { model: 'blueMarker', class: 'marker-blue', title: 'Blue Marker', color: 'var(--ck-highlight-marker-blue)', type: 'marker' },
              { model: 'redPen', class: 'pen-red', title: 'Red Pen', color: 'var(--ck-highlight-pen-red)', type: 'pen' },
              { model: 'greenPen', class: 'pen-green', title: 'Green Pen', color: 'var(--ck-highlight-pen-green)', type: 'pen' },
            ],
          },
          codeBlock: {
            languages: [
              { language: 'plaintext', label: 'Plain text' },
              { language: 'javascript', label: 'JavaScript' },
              { language: 'typescript', label: 'TypeScript' },
              { language: 'python', label: 'Python' },
              { language: 'html', label: 'HTML' },
              { language: 'css', label: 'CSS' },
              { language: 'json', label: 'JSON' },
              { language: 'sql', label: 'SQL' },
              { language: 'xml', label: 'XML' },
            ],
          },
          htmlSupport: { allow: [{ name: /.*/, attributes: true, classes: true, styles: true }] },
          wordCount: { onUpdate: (_stats: any) => {} },
          language: 'vi',
        }}
        onReady={(editor: any) => {
          editorInstanceRef.current = editor;

          // ─────────────────────────────────────────────────────────────────────
          // Intercept Tab at the native DOM level using the CAPTURE phase.
          // This runs before CKEditor's own listeners, so we can fully prevent
          // the widget-focus behaviour that moves focus into the image toolbar.
          // ─────────────────────────────────────────────────────────────────────
          const editableDom = editor.editing.view.getDomRoot();

          const handleTabCapture = (evt: KeyboardEvent) => {
            if (evt.key !== 'Tab') return;

            const selection = editor.model.document.selection;

            // 1. Inside a table cell → let CKEditor handle it (navigation between cells)
            const firstPos = selection.getFirstPosition();
            if (firstPos) {
              let node: any = firstPos.parent;
              while (node) {
                if (node.name === 'tableCell') return;
                node = node.parent;
              }
            }

            // 2. An image widget is selected → insert spaces, do NOT focus toolbar
            const selectedElement = selection.getSelectedElement();
            const IMAGE_NAMES = new Set(['imageBlock', 'imageInline', 'image']);
            if (selectedElement && IMAGE_NAMES.has(selectedElement.name)) {
              evt.preventDefault();
              evt.stopImmediatePropagation(); // prevent CKEditor from ever seeing this event

              editor.model.change((writer: any) => {
                const posAfter = writer.createPositionAfter(selectedElement);
                const nodeAfter = posAfter.nodeAfter;

                if (!nodeAfter || nodeAfter.name !== 'paragraph') {
                  // No paragraph follows the image — create one
                  const para = writer.createElement('paragraph');
                  writer.insert(para, posAfter);
                  writer.insertText('    ', writer.createPositionAt(para, 0));
                  writer.setSelection(para, 'end');
                } else {
                  // Paragraph already exists — prepend 4 spaces and place cursor after them
                  writer.insertText('    ', writer.createPositionAt(nodeAfter, 0));
                  writer.setSelection(writer.createPositionAt(nodeAfter, 4));
                }
              });

              return;
            }

            // 3. Normal text context — handle indent / dedent / insert spaces
            evt.preventDefault();
            evt.stopImmediatePropagation();

            if (evt.shiftKey) {
              const outdent = editor.commands.get('outdent');
              if (outdent?.isEnabled) editor.execute('outdent');
            } else {
              const indent = editor.commands.get('indent');
              if (indent?.isEnabled) {
                editor.execute('indent');
              } else {
                editor.model.change((writer: any) => {
                  editor.model.insertContent(writer.createText('    '));
                });
              }
            }
          };

          // true = capture phase, fires before any bubble-phase listeners
          editableDom.addEventListener('keydown', handleTabCapture, true);

          // Clean up when the editor is destroyed
          editor.on('destroy', () => {
            editableDom.removeEventListener('keydown', handleTabCapture, true);
          });
        }}
        onChange={(_event: any, editor: any) => {
          const data = editor.getData();
          if (onChange) onChange(data);
        }}
      />
      <style jsx global>{`
        .premium-editor .ck-editor__main > .ck-editor__editable {
          min-height: 300px;
        }
        .premium-editor .ck.ck-editor {
          width: 100%;
        }
        .premium-editor .ck-editor__top .ck-sticky-panel .ck-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        .premium-editor .ck-editor__main > .ck-editor__editable:not(.ck-focused) {
          border-color: #e5e7eb;
        }
        .premium-editor .ck-content ol,
        .premium-editor .ck-content ul {
          padding-left: 20px;
          list-style-type: revert;
        }
      `}</style>
    </div>
  );
}