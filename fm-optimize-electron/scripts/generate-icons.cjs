const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SVG = fs.readFileSync(path.join(__dirname, '..', 'resources', 'icon.svg'), 'utf-8')

const SIZES = [16, 24, 32, 48, 64, 128, 256]
const OUT_DIR = path.join(__dirname, '..', 'out', 'icons')
fs.mkdirSync(OUT_DIR, { recursive: true })

async function generatePNG(size) {
  const out = path.join(OUT_DIR, `${size}.png`)
  await sharp(Buffer.from(SVG)).resize(size, size).png().toFile(out)
  return out
}

async function main() {
  console.log('Generating PNGs...')
  const files = await Promise.all(SIZES.map(generatePNG))
  console.log('PNGs generated:', files.join(', '))

  // Create ICO via Buffer concatenation (ICO format)
  // ICO header: 6 bytes reserved(0) + 2 bytes type(1) + 2 bytes count
  const count = SIZES.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)    // reserved
  header.writeUInt16LE(1, 2)    // type: ICO
  header.writeUInt16LE(count, 4) // count

  const dirEntries = []
  const imageData = []

  let offset = 6 + count * 16

  for (const size of SIZES) {
    const png = fs.readFileSync(path.join(OUT_DIR, `${size}.png`))
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size === 256 ? 0 : size, 0)  // width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1)   // height
    entry.writeUInt8(0, 2)  // colors
    entry.writeUInt8(0, 3)  // reserved
    entry.writeUInt16LE(1, 4)  // planes
    entry.writeUInt16LE(32, 6) // bpp
    entry.writeUInt32LE(png.length, 8)  // size
    entry.writeUInt32LE(offset, 12) // offset
    dirEntries.push(entry)
    imageData.push(png)
    offset += png.length
  }

  const ico = Buffer.concat([header, ...dirEntries, ...imageData])

  // Write Electron ICO
  const electronIco = path.join(__dirname, '..', 'resources', 'icon.ico')
  fs.writeFileSync(electronIco, ico)
  console.log(`Electron icon: ${electronIco} (${ico.length} bytes)`)

  // Write favicon ICO (just 16, 32, 48)
  const favSizes = [16, 32, 48]
  const favCount = favSizes.length
  const favHeader = Buffer.alloc(6)
  favHeader.writeUInt16LE(0, 0)
  favHeader.writeUInt16LE(1, 2)
  favHeader.writeUInt16LE(favCount, 4)

  let favOffset = 6 + favCount * 16
  const favDir = []
  const favData = []

  for (const size of favSizes) {
    const png = fs.readFileSync(path.join(OUT_DIR, `${size}.png`))
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size, 0)
    entry.writeUInt8(size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(favOffset, 12)
    favDir.push(entry)
    favData.push(png)
    favOffset += png.length
  }

  const favIco = Buffer.concat([favHeader, ...favDir, ...favData])
  const siteFavicon = path.join(__dirname, '..', '..', 'site-fmoptimize', 'assets', 'favicon.ico')
  fs.writeFileSync(siteFavicon, favIco)
  console.log(`Favicon: ${siteFavicon} (${favIco.length} bytes)`)

  // Also write 48x48 and 96x96 PNG for manifest
  const png48 = fs.readFileSync(path.join(OUT_DIR, '48.png'))
  fs.writeFileSync(path.join(__dirname, '..', '..', 'site-fmoptimize', 'assets', 'icon-48.png'), png48)
  const png96 = await sharp(Buffer.from(SVG)).resize(96, 96).png().toBuffer()
  fs.writeFileSync(path.join(__dirname, '..', '..', 'site-fmoptimize', 'assets', 'icon-96.png'), png96)
  console.log('Site PNGs generated')

  // Also write 512x512 for OG
  const png512 = await sharp(Buffer.from(SVG)).resize(512, 512).png().toBuffer()
  fs.writeFileSync(path.join(__dirname, '..', '..', 'site-fmoptimize', 'assets', 'icon-512.png'), png512)
  console.log('512px PNG generated')

  console.log('Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
