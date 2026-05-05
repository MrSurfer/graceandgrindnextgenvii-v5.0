"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const TipTapEditor = ({ content, onChange }: { content: string, onChange: (content: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px] border border-gray-700 rounded-lg p-4 bg-gray-900',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-4xl mx-auto">
      <div className="flex gap-2 flex-wrap mb-4 border border-gray-800 p-2 rounded-lg bg-gray-900">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded ${editor.isActive('bold') ? 'bg-amber-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded ${editor.isActive('italic') ? 'bg-amber-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-amber-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded ${editor.isActive('bulletList') ? 'bg-amber-500 text-gray-950 font-bold' : 'bg-gray-800 text-gray-300'}`}
        >
          Bullet List
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
