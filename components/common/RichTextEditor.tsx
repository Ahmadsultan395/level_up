"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Heading2,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder, error }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Placeholder.configure({ placeholder: placeholder || "Write something..." })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[140px] px-4 py-3 focus:outline-none"
      }
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  });

  // Keep editor in sync if value is set programmatically (e.g. form reset / edit mode load)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && document.activeElement?.closest(".rte-wrapper") === null) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    cn(
      "p-2 rounded-md text-dark-400 hover:bg-primary/10 hover:text-dark transition-colors",
      active && "bg-primary/15 text-dark"
    );

  return (
    <div className={cn("rte-wrapper border rounded-xl overflow-hidden bg-white", error ? "border-red-400" : "border-dark-100")}>
      <div className="flex flex-wrap items-center gap-1 border-b border-dark-100 bg-dark-50/60 px-2 py-1.5">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
          <Italic size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}>
          <UnderlineIcon size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
          <Heading2 size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
          <List size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
          <ListOrdered size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>
          <Quote size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={btn(editor.isActive("link"))}
        >
          <LinkIcon size={16} />
        </button>
        <span className="mx-1 h-4 w-px bg-dark-100" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)}>
          <Undo size={16} />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)}>
          <Redo size={16} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
