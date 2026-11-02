const INSTAGRAM_STORY_WIDTH = 1080;
const INSTAGRAM_STORY_HEIGHT = 1920;

interface StoryMessage {
  content: string;
  createdAt: string;
}

interface ImageGeneratorOptions {
  message: StoryMessage;
  onProgress?: (progress: number) => void;
}

export const STORY_DARK_PALETTE = {
  bg: '#0b0d10',
  bgElevated: '#14171b',
  bgCard: '#1c2127',
  border: '#343b44',
  borderStrong: '#5b6673',
  textPrimary: '#e8eaed',
  textSecondary: '#8b93a1',
  textTertiary: '#767e8a',
  teal: '#3ed9c4',
  amber: '#f2a64c',
  onAccent: '#08211d',
} as const;

const STORY_FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap';

const BRAND_MARK_URL = '/brand-mark.png';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildStoryHtml(message: StoryMessage, brandMarkSrc: string = BRAND_MARK_URL): string {
  const c = STORY_DARK_PALETTE;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="${STORY_FONT_STYLESHEET}" rel="stylesheet" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        width: ${INSTAGRAM_STORY_WIDTH}px;
        height: ${INSTAGRAM_STORY_HEIGHT}px;
        background: ${c.bg};
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: ${c.textPrimary};
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      .ambient {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 0;
      }

      .ambient-blob {
        position: absolute;
        border-radius: 50%;
      }

      .ambient-teal {
        width: 620px;
        height: 620px;
        top: -140px;
        left: -180px;
        background: ${c.teal};
        opacity: 0.06;
      }

      .ambient-amber {
        width: 460px;
        height: 460px;
        bottom: 120px;
        right: -160px;
        background: ${c.amber};
        opacity: 0.05;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 88px 72px 48px;
        position: relative;
        z-index: 1;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 20px;
        padding: 20px 40px;
        background: ${c.bgElevated};
        border: 1px solid ${c.border};
        border-radius: 9999px;
      }

      .brand-mark {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        flex-shrink: 0;
      }

      .brand-text {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 34px;
        font-weight: 600;
        letter-spacing: -0.4px;
        color: ${c.textPrimary};
        white-space: nowrap;
      }

      .stage {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 64px;
        padding: 40px 72px;
        position: relative;
        z-index: 1;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 16px;
        padding: 20px 44px;
        background: ${c.teal};
        border-radius: 9999px;
      }

      .eyebrow-text {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 30px;
        font-weight: 700;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: ${c.onAccent};
        white-space: nowrap;
      }

      .card {
        width: 100%;
        max-width: 936px;
        background: ${c.bgElevated};
        border: 1px solid ${c.border};
        border-radius: 32px;
        padding: 12px;
      }

      .card-inner {
        background: ${c.bgCard};
        border: 1px solid ${c.border};
        border-radius: 24px;
        padding: 76px 64px;
        min-height: 280px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .quote {
        position: absolute;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 200px;
        line-height: 1;
        font-weight: 700;
        color: ${c.teal};
        opacity: 0.12;
      }

      .quote-open {
        top: 8px;
        left: 32px;
      }

      .quote-close {
        bottom: -64px;
        right: 32px;
      }

      .message {
        font-family: 'Inter', sans-serif;
        font-size: 44px;
        font-weight: 500;
        line-height: 1.6;
        text-align: center;
        color: ${c.textPrimary};
        white-space: pre-wrap;
        overflow-wrap: break-word;
        word-break: break-word;
        max-width: 100%;
        position: relative;
        z-index: 1;
      }

      .footer {
        padding: 48px 72px 96px;
        position: relative;
        z-index: 1;
      }

      .footer-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        padding: 48px 60px;
        background: ${c.bgElevated};
        border: 1px solid ${c.border};
        border-radius: 32px;
      }

      .footer-cta {
        font-family: 'Inter', sans-serif;
        font-size: 28px;
        font-weight: 400;
        color: ${c.textSecondary};
        letter-spacing: 0.2px;
      }

      .footer-url {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 46px;
        font-weight: 700;
        letter-spacing: -0.6px;
        color: ${c.teal};
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <div class="ambient">
      <div class="ambient-blob ambient-teal"></div>
      <div class="ambient-blob ambient-amber"></div>
    </div>

    <div class="header">
      <div class="brand">
        <div class="brand-mark">
          <img src="${brandMarkSrc}" width="52" height="52" alt="" />
        </div>
        <div class="brand-text">Anonymous Message</div>
      </div>
    </div>

    <div class="stage">
      <div class="eyebrow">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${c.onAccent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
        <span class="eyebrow-text">New Message</span>
      </div>

      <div class="card">
        <div class="card-inner">
          <span class="quote quote-open">&ldquo;</span>
          <span class="quote quote-close">&rdquo;</span>
          <div class="message">${escapeHtml(message.content)}</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-card">
        <div class="footer-cta">Send me anonymous messages too</div>
        <div class="footer-url">ngl.naufalrf.net</div>
      </div>
    </div>
  </body>
</html>`;
}

async function loadBrandMarkDataUrl(): Promise<string> {
  try {
    const response = await fetch(BRAND_MARK_URL);
    if (!response.ok) {
      return BRAND_MARK_URL;
    }

    const blob = await response.blob();

    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : BRAND_MARK_URL);
      reader.onerror = () => resolve(BRAND_MARK_URL);
      reader.readAsDataURL(blob);
    });
  } catch {
    return BRAND_MARK_URL;
  }
}

export async function generateMessageImage({
  message,
  onProgress,
}: ImageGeneratorOptions): Promise<Blob> {
  if (typeof window === 'undefined') {
    throw new Error('Image generation only works in browser');
  }

  const [domtoimage, brandMarkSrc] = await Promise.all([
    import('dom-to-image-more'),
    loadBrandMarkDataUrl(),
  ]);

  onProgress?.(10);

  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: ${INSTAGRAM_STORY_WIDTH}px;
    height: ${INSTAGRAM_STORY_HEIGHT}px;
    border: none;
  `;
  document.body.appendChild(iframe);

  const removeIframe = () => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  };

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Failed to access iframe document');
    }

    iframeDoc.open();
    iframeDoc.write(buildStoryHtml(message, brandMarkSrc));
    iframeDoc.close();

    onProgress?.(30);

    await iframeDoc.fonts.ready;

    onProgress?.(50);

    const blob = await domtoimage.toBlob(iframeDoc.body, {
      width: INSTAGRAM_STORY_WIDTH,
      height: INSTAGRAM_STORY_HEIGHT,
      bgcolor: STORY_DARK_PALETTE.bg,
    });

    onProgress?.(80);

    removeIframe();

    onProgress?.(100);
    return blob;
  } catch (error) {
    removeIframe();
    throw error;
  }
}

export async function downloadMessageImage(
  message: StoryMessage,
  onProgress?: (progress: number) => void
): Promise<void> {
  const blob = await generateMessageImage({ message, onProgress });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `anonymous-message-${Date.now()}.png`;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export async function shareToInstagramStory(
  message: StoryMessage,
  onProgress?: (progress: number) => void
): Promise<void> {
  const blob = await generateMessageImage({ message, onProgress });

  const file = new File([blob], 'anonymous-message.png', { type: 'image/png' });

  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Anonymous Message',
      text: 'Check out this anonymous message I received!',
    });
  } else {
    throw new Error('Web Share API not supported on this device');
  }
}
