import { useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

/**
 * WYSIWYG editor (Quill). Outputs HTML.
 *
 * Images: if `onImageUpload(file) => url` is provided, the image button opens a
 * file picker and inserts the uploaded URL. Otherwise it falls back to prompting
 * for an image URL (used on the public form, where uploads aren't allowed).
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  onImageUpload,
}) {
  const uploadRef = useRef(onImageUpload);
  uploadRef.current = onImageUpload;

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
            const quill = this.quill;
            const upload = uploadRef.current;

            // No uploader available → ask for a URL.
            if (!upload) {
              const url = window.prompt("Paste an image URL:");
              if (!url) return;
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "image", url, "user");
              quill.setSelection(range.index + 1);
              return;
            }

            // Uploader available → pick a file, upload, insert the URL.
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files && input.files[0];
              if (!file) return;
              const range = quill.getSelection(true);
              try {
                const url = await upload(file);
                if (url) {
                  quill.insertEmbed(range.index, "image", url, "user");
                  quill.setSelection(range.index + 1);
                }
              } catch {
                /* handled by the uploader */
              }
            };
            input.click();
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
