import { useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

/**
 * WYSIWYG editor (Quill). Outputs HTML. Images are added by URL (kept small —
 * no base64 blobs bloating the stored content).
 */
export default function RichTextEditor({ value, onChange, placeholder }) {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image() {
            const url = window.prompt("Paste an image URL:");
            if (!url) return;
            const range = this.quill.getSelection(true);
            this.quill.insertEmbed(range.index, "image", url, "user");
            this.quill.setSelection(range.index + 1);
          },
        },
      },
    }),
    []
  );

  return (
    <div className="rte">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={(html) => onChange?.(html)}
        modules={modules}
        placeholder={placeholder}
      />
    </div>
  );
}
