'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import History from '@tiptap/extension-history';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeight?: string;
}

const tableHtml = `
<table>
  <tbody>
    <tr><th>Item</th><th>Details</th><th>Notes</th></tr>
    <tr><td>Destination</td><td>Local experience</td><td>Confirm with consultant</td></tr>
    <tr><td>Travel dates</td><td>Preferred dates</td><td>Check availability</td></tr>
  </tbody>
</table>
`;

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onImageUpload,
  placeholder = 'Write your content here...',
  minHeight = '300px',
}) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
      Blockquote,
      CodeBlock,
      History,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[260px]',
        'aria-label': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm italic ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded text-sm underline ${editor.isActive('underline') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL');
            if (url) editor.chain().focus().setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' }).run();
          }}
          className="px-2 py-1 rounded text-sm bg-white border hover:bg-gray-100"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertContent(tableHtml).run()}
          className="px-2 py-1 rounded text-sm bg-white border hover:bg-gray-100"
        >
          Table
        </button>
        {onImageUpload && (
          <label className="px-2 py-1 rounded text-sm bg-white border hover:bg-gray-100 cursor-pointer">
            Image
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && onImageUpload) {
                  try {
                    const url = await onImageUpload(file);
                    editor.chain().focus().setImage({ src: url }).run();
                  } catch {
                    alert('Upload failed');
                  }
                }
              }}
              className="hidden"
            />
          </label>
        )}
      </div>
      <div className="p-3" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
