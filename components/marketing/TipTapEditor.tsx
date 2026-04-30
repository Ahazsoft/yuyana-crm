"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
// V3 Change: UI Components are now in /menus
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";

// V3 Change: Most extensions are still named imports {}
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";

// V3 Logic extensions (to make the menus actually work)
import { BubbleMenu as BubbleMenuExtension } from "@tiptap/extension-bubble-menu";
import { FloatingMenu as FloatingMenuExtension } from "@tiptap/extension-floating-menu";

import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Table as TableIcon,
  Undo,
  Redo,
  Underline,
  PictureInPicture,
  ImageDown,
} from "lucide-react";

const TiptapEditor = ({
  value,
  onChange,
  onChangeHtml,
}: {
  value: any;
  onChange: (val: any) => void;
  onChangeHtml?: (html: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        // Underline is now built into StarterKit in v3
      }),

      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: false, // IMPORTANT (don’t store base64 in DB)
      }),
      Placeholder.configure({ placeholder: "Type '/' for commands..." }),
      BubbleMenuExtension,
      FloatingMenuExtension,
    ],
    content: value,
    // V3 Mandatory for Next.js
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
      if (onChangeHtml) onChangeHtml(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[350px] p-8 border rounded-lg bg-background shadow-sm",
      },
    },
  });
  const [imgWidth, setImgWidth] = useState("");
  const [imgHeight, setImgHeight] = useState("");

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      if (editor.isActive("image")) {
        const attrs: any = editor.getAttributes("image") || {};
        setImgWidth(attrs.width ? String(attrs.width) : "");
        setImgHeight(attrs.height ? String(attrs.height) : "");
      } else {
        setImgWidth("");
        setImgHeight("");
      }
    };

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    // initial sync
    update();

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  // Inside TiptapEditor component
  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(value)) {
      editor.commands.setContent(value);
    }
    if (onChangeHtml) {
      try {
        onChangeHtml(editor.getHTML());
      } catch (e) {
        // ignore
      }
    }
  }, [editor, value]);
  
  const applyImageSize = () => {
    if (!editor || !editor.isActive("image")) return;
    const attrs: any = editor.getAttributes("image") || {};
    const width = imgWidth ? parseInt(imgWidth, 10) : undefined;
    const height = imgHeight ? parseInt(imgHeight, 10) : undefined;

    const newAttrs: any = { src: attrs.src };
    if (width) newAttrs.width = width;
    if (height) newAttrs.height = height;

    editor.chain().focus().setImage(newAttrs).run();
  };

  const resetImageSize = () => {
    if (!editor || !editor.isActive("image")) return;
    const attrs: any = editor.getAttributes("image") || {};
    editor.chain().focus().setImage({ src: attrs.src }).run();
    setImgWidth("");
    setImgHeight("");
  };

  if (!editor) return null;

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // POST to new marketing template images endpoint
    const res = await fetch("/api/marketing/templates/images", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Image upload failed: ${err}`);
    }

    const data = await res.json();

    return data.url; // IMPORTANT
  };

  const insertImage = async (file: File) => {
    if (!editor) return;

    const url = await uploadImage(file);

    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="relative w-full border rounded-lg overflow-hidden">
      {/* TOOLBAR (Optional static) */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/10">
        {/* Undo / Redo */}
        <MenuBtn onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={16} />
        </MenuBtn>
        <MenuBtn onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={16} />
        </MenuBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text formatting */}
        <MenuBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={16} />
        </MenuBtn>

        <MenuBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={16} />
        </MenuBtn>

        <MenuBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <Underline size={16} />
        </MenuBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <MenuBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 size={16} />
        </MenuBtn>

        <MenuBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={16} />
        </MenuBtn>
        <MenuBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 size={16} />
        </MenuBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <MenuBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={16} />
        </MenuBtn>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Image Uploader */}
        <MenuBtn>
          <label className="cursor-pointer">
            <ImageDown size={16} />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) insertImage(file);
              }}
            />
          </label>
        </MenuBtn>
      </div>

      {/* V3 BUBBLE MENU */}
      <BubbleMenu
        editor={editor}
        className="flex bg-popover border rounded shadow-md overflow-hidden p-1 gap-1"
      >
        <MenuBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={14} />
        </MenuBtn>
        <MenuBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={14} />
        </MenuBtn>
      </BubbleMenu>

      {/* V3 FLOATING MENU */}
      <FloatingMenu
        editor={editor}
        className="flex bg-background border rounded shadow-md p-1 gap-1"
      >
        <MenuBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 size={14} />
        </MenuBtn>
        <MenuBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} />
        </MenuBtn>
        <MenuBtn
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
          }
        >
          <TableIcon size={14} />
        </MenuBtn>
      </FloatingMenu>

      <EditorContent editor={editor} />

      {editor.isActive("image") && (
        <div className="absolute right-3 top-3 z-20 bg-popover border rounded p-2 flex items-center gap-2">
          <input
            type="number"
            value={imgWidth}
            onChange={(e) => setImgWidth(e.target.value)}
            placeholder="W"
            className="w-16 px-2 py-1 rounded border bg-background text-sm"
          />
          <input
            type="number"
            value={imgHeight}
            onChange={(e) => setImgHeight(e.target.value)}
            placeholder="H"
            className="w-16 px-2 py-1 rounded border bg-background text-sm"
          />
          <button
            type="button"
            onClick={applyImageSize}
            className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={resetImageSize}
            className="px-2 py-1 border rounded text-sm"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

const MenuBtn = ({ children, onClick, active = false }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 hover:bg-accent transition-colors rounded ${active ? "text-primary bg-accent" : "text-muted-foreground"}`}
  >
    {children}
  </button>
);

export default TiptapEditor;
