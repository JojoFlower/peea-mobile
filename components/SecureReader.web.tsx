import { colors } from "@/lib/theme";

// Web fallback: react-native-webview has no web implementation (it renders a
// "does not support this platform" placeholder). In a browser we render the
// lesson HTML straight into the DOM, styled to match the native reader. The
// anti-copy behaviour is best-effort only — browser content can always be read
// via devtools, so this is a convenience view, not real protection.
const css = (id: string) => `
  #${id}, #${id} * {
    -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; user-select:none;
    -webkit-touch-callout:none;
  }
  #${id} { color:${colors.fg};
    font-family:-apple-system,"Poppins",Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    font-size:16px; line-height:1.65; }
  #${id} h1,#${id} h2,#${id} h3,#${id} h4 { color:${colors.fg}; line-height:1.3; }
  #${id} h1{font-size:1.5rem;} #${id} h2{font-size:1.3rem;} #${id} h3{font-size:1.1rem;}
  #${id} p{margin:0 0 0.9em;}
  #${id} ul,#${id} ol{padding-left:1.25em; margin:0 0 0.9em;}
  #${id} a{color:${colors.primaryDark}; text-decoration:underline;}
  #${id} img{max-width:100%; height:auto; border-radius:10px; margin:0.4em 0;}
  #${id} iframe{max-width:100%; border:0; border-radius:10px; aspect-ratio:16/9; width:100%;}
  #${id} blockquote{margin:0 0 0.9em; padding:0.4em 0 0.4em 0.9em; border-left:3px solid ${colors.border}; color:${colors.fgMuted};}
  #${id} pre{background:${colors.bgSoft}; padding:12px; border-radius:8px; overflow-x:auto;}
`;

const ID = "lesson-web-content";

export function SecureReader({ content }: { content: string | null }) {
  const body = content && content.trim() ? content : "<p><em>Leçon vide.</em></p>";
  return (
    <div
      id={ID}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      dangerouslySetInnerHTML={{ __html: `<style>${css(ID)}</style>${body}` }}
    />
  );
}
