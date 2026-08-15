const sharp = require('sharp');
const fs = require('fs');

const svgText = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <text x="600" y="315" font-family="Playfair Display, Georgia, Times New Roman, serif" font-style="italic" font-size="160" text-anchor="middle" dominant-baseline="middle" fill="#0f172a">intelligence</text>
</svg>
`;

async function main() {
  try {
    const wavesBuffer = await sharp('d:/zbiz-web/public/roman-hero-bg-nobg.png')
      .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    // Composite them: Base (White) -> Text -> Waves (waves in front!)
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([
        {
          // Text goes first (behind)
          input: Buffer.from(svgText),
          gravity: 'center'
        },
        {
          // Waves go on top (in front), so they overlap the text
          input: wavesBuffer,
          gravity: 'center'
        }
      ])
      .jpeg({ quality: 85 })
      .toFile('d:/zbiz-web/public/roman-hero-bg-og-black.jpg');

    console.log('Success - created black version with waves in front!');
  } catch (err) {
    console.error(err);
  }
}

main();
