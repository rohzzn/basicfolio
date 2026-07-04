import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const FONT_DIR = path.join(process.cwd(), 'public/font/WEB/fonts');

let fontsPromise: Promise<{ regular: Buffer; bold: Buffer }> | null = null;

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(path.join(FONT_DIR, 'Satoshi-Regular.ttf')),
      readFile(path.join(FONT_DIR, 'Satoshi-Bold.ttf')),
    ]).then(([regular, bold]) => ({ regular, bold }));
  }
  return fontsPromise;
}

function titleFontSize(title: string): number {
  if (title.length <= 24) return 76;
  if (title.length <= 40) return 62;
  if (title.length <= 60) return 50;
  return 42;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

interface OgImageParams {
  eyebrow: string;
  title: string;
  description?: string;
  tags?: string[];
}

export async function renderOgImage({ eyebrow, title, description, tags }: OgImageParams) {
  const { regular, bold } = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#F5F1EC',
          fontFamily: 'Satoshi',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: '1px solid #e4e4e7',
            borderRadius: 24,
            display: 'flex',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '64px 72px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 11, height: 11, borderRadius: 9999, backgroundColor: '#22C55E', display: 'flex' }} />
            <span
              style={{
                fontSize: 22,
                color: '#71717a',
                letterSpacing: 3,
                textTransform: 'uppercase',
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {eyebrow}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              gap: 24,
              width: 1000,
            }}
          >
            <div
              style={{
                fontSize: titleFontSize(title),
                fontWeight: 700,
                color: '#18181b',
                lineHeight: 1.15,
                display: 'flex',
              }}
            >
              {title}
            </div>
            {description ? (
              <div
                style={{
                  fontSize: 28,
                  color: '#52525b',
                  lineHeight: 1.5,
                  display: 'flex',
                }}
              >
                {truncate(description, 140)}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {(tags ?? []).slice(0, 4).map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: 'flex',
                    padding: '10px 20px',
                    borderRadius: 9999,
                    border: '1px solid #d4d4d8',
                    fontSize: 20,
                    color: '#3f3f46',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', fontSize: 24, color: '#a1a1aa', fontWeight: 700 }}>rohan.run</div>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Satoshi', data: regular, weight: 400, style: 'normal' },
        { name: 'Satoshi', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
