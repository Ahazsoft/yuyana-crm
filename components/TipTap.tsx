"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Underline as UnderlineIcon, Undo, Redo, List, Heading1, Heading2, Heading3, Heading4, Image as ImageIcon } from "lucide-react";

const Tiptap = () => {
  const [htmlValue, setHtmlValue] = useState("<p>Hello World! 🌎️</p>");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: htmlValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setHtmlValue(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[320px] p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg",
      },
    },
  });

  if (!editor) return null;

  const insertImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-slate-100 p-2 dark:bg-slate-900">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={16} />
        </ToolbarButton>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          active={editor.isActive("heading", { level: 4 })}
        >
          <Heading4 size={16} />
        </ToolbarButton>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={16} />
        </ToolbarButton>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

        <ToolbarButton onClick={insertImage}>
          <ImageIcon size={16} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <input type="hidden" value={htmlValue} />
      {/*
        Use editor.getHTML() or htmlValue to store the editor output as HTML.
        Example: save htmlValue in your form state or send it to your API.
      */}
    </div>
  );
};

const ToolbarButton = ({ children, onClick, active = false }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex h-9 min-w-[38px] items-center justify-center rounded px-2 text-sm transition ${
      active ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white" : "text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    }`}
  >
    {children}
  </button>
);

export default Tiptap;
