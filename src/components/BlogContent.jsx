import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";

// Rich HTML from the editor contains tags; older posts are plain markdown.
const looksHtml = (s = "") => /<\/?[a-z][\s\S]*>/i.test(s);

/**
 * Renders a blog body safely. New posts are Quill HTML (sanitized with
 * DOMPurify, then rendered with Quill's content styles). Legacy posts are
 * markdown and fall back to react-markdown.
 */
export default function BlogContent({ content = "", className = "" }) {
  if (looksHtml(content)) {
    const clean = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
    return (
      <div className={`ql-snow ${className}`}>
        <div
          className="ql-editor blog-html"
          dangerouslySetInnerHTML={{ __html: clean }}
        />
      </div>
    );
  }

  return (
    <div className={`blog-content ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
