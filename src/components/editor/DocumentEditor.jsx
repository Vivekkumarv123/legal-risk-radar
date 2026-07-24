import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { VariableNode } from "./VariableNode";
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered,
  Quote, Undo, Redo, Code, PlusCircle
} from "lucide-react";

export default function DocumentEditor({
  content,
  onChange,
  variablesValues = {},
  availableVariables = []
}) {
  const isFirstLoad = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      VariableNode
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      // Send the HTML content back to the parent
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate prose-sm focus:outline-none max-w-none min-h-[500px] text-slate-800 font-serif leading-relaxed text-xs A4-editor-content"
      }
    }
  });

  // Sync content from parent initially or when loading new document
  useEffect(() => {
    if (!editor) return;

    // We only want to set content on load, or when content changes outside the editor typing.
    const currentHTML = editor.getHTML();
    if (content !== currentHTML && isFirstLoad.current) {
      editor.commands.setContent(content || "");
      isFirstLoad.current = false;
    }
  }, [editor, content]);

  // If content is changed externally (e.g. template changed), reset first load ref
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (content !== currentHTML) {
      editor.commands.setContent(content || "");
    }
  }, [templateChangedTrigger(content)]); // trigger reset when content changes drastically

  function templateChangedTrigger(val) {
    // Return early check for major structure changes
    return val ? val.substring(0, 50) : "";
  }

  // Real-time synchronization of form values to editor variable pills
  useEffect(() => {
    if (!editor) return;

    let transactionNeeded = false;
    const { tr } = editor.state;

    tr.doc.descendants((node, pos) => {
      if (node.type.name === "variable") {
        const key = node.attrs.key;
        const currentFallback = node.attrs.fallback;
        const targetValue = variablesValues[key] || "";

        // If the variable value doesn't match the node's current fallback attribute
        if (targetValue !== currentFallback) {
          transactionNeeded = true;
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            fallback: targetValue || key
          });
        }
      }
    });

    if (transactionNeeded) {
      editor.view.dispatch(tr);
    }
  }, [editor, variablesValues]);

  const insertVariable = (key) => {
    if (!editor) return;

    const value = variablesValues[key] || key;
    editor.commands.insertContent({
      type: "variable",
      attrs: {
        key,
        fallback: value
      }
    });
    
    // Focus back on editor
    editor.commands.focus();
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="text-slate-400 text-xs font-semibold animate-pulse">Loading Document Editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-3 border-b border-slate-100 bg-slate-50 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {/* Format actions */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("bold") ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("italic") ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 1 }) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("heading", { level: 2 }) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("bulletList") ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("orderedList") ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              editor.isActive("blockquote") ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200/60"
            }`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Variables insert helper */}
        {availableVariables.length > 0 && (
          <div className="relative group">
            <button
              type="button"
              className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" /> Insert Variable Badge
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-48 hidden group-hover:block hover:block z-30 max-h-48 overflow-y-auto">
              {availableVariables.map((variable) => (
                <button
                  key={variable.key}
                  type="button"
                  onClick={() => insertVariable(variable.key)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition font-medium"
                >
                  {variable.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="p-8 md:p-10 bg-white border-t border-slate-100 max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
