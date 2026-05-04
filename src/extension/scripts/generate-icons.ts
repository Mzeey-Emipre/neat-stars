const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="16" fill="#0d1117"/>
  <text x="64" y="58" text-anchor="middle" font-size="48" fill="#e3b341">★</text>
  <text x="64" y="96" text-anchor="middle" font-size="22" font-weight="bold" font-family="Arial" fill="#3fb950">✓</text>
</svg>`;

const sizes = [16, 32, 48, 128];

async function generate() {
  const sharp = (await import('sharp')).default;
  const svgBuffer = Buffer.from(svg);

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`public/icon-${size}.png`);
    console.log(`Generated icon-${size}.png`);
  }
}

generate().catch(console.error);
