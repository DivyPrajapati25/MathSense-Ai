import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Renders text with inline ($...$) and block ($$...$$) LaTeX math.
 */
const MathText = ({ text, className = "" }) => {
  if (!text) return null;
  try {
    const blockParts = text.split(/(\\$\\$[\\s\\S]*?\\$\\$)/g);
    return (
      <span className={className}>
        {blockParts.map((part, i) => {
          if (part.startsWith("$$") && part.endsWith("$$")) {
            const math = part.slice(2, -2).trim();
            return (
              <span key={i} className="block my-1">
                <BlockMath math={math} />
              </span>
            );
          }
          const inlineParts = part.split(/(\\$[^$\\n]+?\\$)/g);
          return (
            <span key={i}>
              {inlineParts.map((inline, j) => {
                if (
                  inline.startsWith("$") &&
                  inline.endsWith("$") &&
                  inline.length > 2
                ) {
                  const math = inline.slice(1, -1).trim();
                  return <InlineMath key={j} math={math} />;
                }
                return <span key={j}>{inline}</span>;
              })}
            </span>
          );
        })}
      </span>
    );
  } catch {
    return <span className={className}>{text}</span>;
  }
};

export default MathText;
