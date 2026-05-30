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
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm italic ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white border hover:bg-gray-100'}`}
        >
          • List
        </button>
        <button
          onClick={() => {
            const url = prompt('Enter URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className="px-2 py-1 rounded text-sm bg-white border hover:bg-gray-100"
        >
          🔗 Link
        </button>
        {onImageUpload && (
          <label className="px-2 py-1 rounded text-sm bg-white border hover:bg-gray-100 cursor-pointer">
            🖼️ Image
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && onImageUpload) {
                  try {
                    const url = await onImageUpload(file);
                    editor.chain().focus().setImage({ src: url }).run();
                  } catch (error: any) {
                    alert(error?.message || 'Upload failed');
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