"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Heading2, Quote, Undo, Redo, AlignLeft, AlignCenter, 
  AlignRight, Link as LinkIcon, Image as ImageIcon, 
  Table as TableIcon, Highlighter, Type
} from 'lucide-react';

const TipTapEditor = ({ content, onChange }: { content: string, onChange: (content: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Highlight,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Write something amazing...',
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-amber max-w-none focus:outline-none min-h-[400px] p-6 bg-gray-900/50 rounded-b-2xl',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col w-full border border-gray-800 rounded-2xl overflow-hidden bg-gray-900/30">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-800 bg-gray-950/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-800">
          <ToolbarButton 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().undo()}
            icon={Undo} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().redo()}
            icon={Redo} 
          />
        </div>

        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-800">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            active={editor.isActive('heading', { level: 2 })}
            icon={Heading2} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().setParagraph().run()} 
            active={editor.isActive('paragraph')}
            icon={Type} 
          />
        </div>

        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-800">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            active={editor.isActive('bold')}
            icon={Bold} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            active={editor.isActive('italic')}
            icon={Italic} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            active={editor.isActive('underline')}
            icon={UnderlineIcon} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            active={editor.isActive('highlight')}
            icon={Highlighter} 
          />
        </div>

        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-800">
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('left').run()} 
            active={editor.isActive({ textAlign: 'left' })}
            icon={AlignLeft} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('center').run()} 
            active={editor.isActive({ textAlign: 'center' })}
            icon={AlignCenter} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('right').run()} 
            active={editor.isActive({ textAlign: 'right' })}
            icon={AlignRight} 
          />
        </div>

        <div className="flex items-center gap-1 mr-2 pr-2 border-r border-gray-800">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            active={editor.isActive('bulletList')}
            icon={List} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            active={editor.isActive('orderedList')}
            icon={ListOrdered} 
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            active={editor.isActive('blockquote')}
            icon={Quote} 
          />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton onClick={setLink} active={editor.isActive('link')} icon={LinkIcon} />
          <ToolbarButton onClick={addImage} icon={ImageIcon} />
          <ToolbarButton 
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
            icon={TableIcon} 
          />
        </div>
      </div>

      <EditorContent editor={editor} className="min-h-[400px]" />

      {/* Table Management Overlay (Simple version) */}
      {editor.isActive('table') && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-t border-gray-800 text-[10px] uppercase tracking-widest font-bold text-amber-500">
          <span>Table Tools:</span>
          <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="hover:text-white px-2">Add Col Before</button>
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="hover:text-white px-2">Add Col After</button>
          <button onClick={() => editor.chain().focus().deleteColumn().run()} className="hover:text-white px-2 text-red-500">Del Col</button>
          <span className="text-gray-700">|</span>
          <button onClick={() => editor.chain().focus().addRowBefore().run()} className="hover:text-white px-2">Add Row Before</button>
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className="hover:text-white px-2">Add Row After</button>
          <button onClick={() => editor.chain().focus().deleteRow().run()} className="hover:text-white px-2 text-red-500">Del Row</button>
          <span className="text-gray-700">|</span>
          <button onClick={() => editor.chain().focus().deleteTable().run()} className="hover:text-white px-2 text-red-600">Delete Table</button>
        </div>
      )}
    </div>
  );
};

const ToolbarButton = ({ onClick, active, icon: Icon, disabled }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-lg transition-all ${
      active 
        ? 'bg-amber-500 text-gray-950' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    } disabled:opacity-30 disabled:pointer-events-none`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

export default TipTapEditor;
