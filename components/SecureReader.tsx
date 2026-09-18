import { useMemo, useState } from "react";
import { WebView } from "react-native-webview";
import { colors } from "@/lib/theme";

// Wrap the lesson HTML so it renders richly BUT cannot be selected/copied, and
// the native long-press callout / context menu is suppressed.
function secureHtml(content: string): string {
  const body = content && content.trim() ? content : "<p><em>Leçon vide.</em></p>";
  return `<!doctype html><html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<style>
  * { -webkit-user-select:none !important; -moz-user-select:none !important; -ms-user-select:none !important;
      user-select:none !important; -webkit-touch-callout:none !important; }
  html,body { margin:0; padding:0; background:${colors.bg}; }
  body { padding:4px 2px 24px; color:${colors.fg};
    font-family:-apple-system,"Poppins",Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    font-size:16px; line-height:1.65; -webkit-tap-highlight-color:transparent; }
  h1,h2,h3,h4 { color:${colors.fg}; line-height:1.3; }
  h1{font-size:1.5rem;} h2{font-size:1.3rem;} h3{font-size:1.1rem;}
  p{margin:0 0 0.9em;} ul,ol{padding-left:1.25em; margin:0 0 0.9em;}
  a{color:${colors.primaryDark}; text-decoration:underline;}
  img{max-width:100%; height:auto; border-radius:10px; margin:0.4em 0;}
  iframe{max-width:100%; border:0; border-radius:10px; aspect-ratio:16/9; width:100%; height:auto;}
  blockquote{margin:0 0 0.9em; padding:0.4em 0 0.4em 0.9em; border-left:3px solid ${colors.border}; color:${colors.fgMuted};}
  pre{background:${colors.bgSoft}; padding:12px; border-radius:8px; overflow-x:auto;}
</style></head><body>
<div id="c">${body}</div>
<script>
  ['contextmenu','selectstart','copy','cut','dragstart'].forEach(function(ev){
    document.addEventListener(ev, function(e){ e.preventDefault(); return false; }, true);
  });
  function post(){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(String(document.body.scrollHeight)); } }
  window.addEventListener('load', post);
  window.addEventListener('resize', post);
  setTimeout(post, 300); setTimeout(post, 1000);
</script>
</body></html>`;
}

export function SecureReader({ content }: { content: string | null }) {
  const [height, setHeight] = useState(240);
  const html = useMemo(() => secureHtml(content ?? ""), [content]);

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html }}
      style={{ width: "100%", height, backgroundColor: "transparent" }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      // iOS: empty selection menu removes Copy/Look Up on any accidental selection.
      menuItems={[]}
      // iOS: block the callout / selection entirely.
      allowsLinkPreview={false}
      onMessage={(e) => {
        const h = Number(e.nativeEvent.data);
        if (Number.isFinite(h) && h > 0) setHeight(h);
      }}
    />
  );
}
