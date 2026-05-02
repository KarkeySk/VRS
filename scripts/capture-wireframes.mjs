import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright'

const ROOT = process.cwd()
const OUT_DIR = path.join(ROOT, 'artifacts', 'page-captures')
const RAW_DIR = path.join(OUT_DIR, 'raw')
const WIREFRAME_DIR = path.join(OUT_DIR, 'wireframe')
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json')

const USER_BASE = 'http://127.0.0.1:4173'
const ADMIN_BASE = 'http://127.0.0.1:4174'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'

const WIRE_FRAME_CSS = `
* {
  background-image: none !important;
  box-shadow: none !important;
  text-shadow: none !important;
  filter: none !important;
}
html, body {
  background: #ffffff !important;
}
*:not(svg):not(path) {
  color: #111111 !important;
  border-color: #8d8d8d !important;
}
img, picture, video, canvas, svg {
  opacity: 0.12 !important;
  background: #e8e8e8 !important;
  border: 1px solid #9a9a9a !important;
}
button, input, select, textarea, a {
  background: #ffffff !important;
  border: 1px solid #6f6f6f !important;
  color: #111111 !important;
}
`

async function cleanOutputDirs() {
  await fs.rm(OUT_DIR, { recursive: true, force: true })
  await fs.mkdir(RAW_DIR, { recursive: true })
  await fs.mkdir(WIREFRAME_DIR, { recursive: true })
}

function startServer({ command, cwd, label, readyPattern }) {
  const child = spawn(command, {
    cwd,
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '0' },
  })

  let isReady = false
  let resolveReady
  let rejectReady

  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })

  const onData = (chunk) => {
    const text = chunk.toString()
    process.stdout.write(`[${label}] ${text}`)
    if (!isReady && readyPattern.test(text)) {
      isReady = true
      resolveReady()
    }
  }

  child.stdout.on('data', onData)
  child.stderr.on('data', onData)

  child.on('error', (err) => {
    if (!isReady) rejectReady(err)
  })

  child.on('exit', (code) => {
    if (!isReady) {
      rejectReady(new Error(`${label} exited before ready (code ${code ?? 'unknown'})`))
    }
  })

  return {
    child,
    ready,
    stop: async () => {
      if (!child.killed) {
        child.kill('SIGTERM')
      }
    },
  }
}

function slugFromPath(prefix, pathname) {
  const clean = pathname === '/' ? 'home' : pathname.replace(/^\//, '')
  return `${prefix}__${clean.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'page'}`
}

async function captureRoute({ page, baseUrl, route, prefix, manifest }) {
  const url = new URL(route, baseUrl).toString()
  const slug = slugFromPath(prefix, route)
  const rawPath = path.join(RAW_DIR, `${slug}.png`)
  const wirePath = path.join(WIREFRAME_DIR, `${slug}.png`)

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
  await page.waitForTimeout(1200)
  await page.setViewportSize({ width: 1440, height: 2400 })

  await page.screenshot({ path: rawPath, fullPage: true })

  await page.addStyleTag({ content: WIRE_FRAME_CSS })
  await page.screenshot({ path: wirePath, fullPage: true })

  manifest.push({ route, raw: path.relative(ROOT, rawPath), wireframe: path.relative(ROOT, wirePath) })
}

async function loginUser(page) {
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const email = `wireframe_${unique}@example.com`
  const password = 'Pass@12345'

  await page.goto(`${USER_BASE}/auth/register`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  await page.fill('#register-fullname', 'Wireframe User')
  await page.fill('#register-email', email)
  await page.fill('#register-password', password)
  await page.selectOption('#register-terrain', 'mountains')
  await page.click('button[type="submit"]')

  await page.waitForURL((url) => url.pathname === '/auth/login' || url.pathname === '/dashboard', { timeout: 30_000 })

  if (!page.url().includes('/dashboard')) {
    await page.fill('#login-email', email)
    await page.fill('#login-password', password)
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => url.pathname.startsWith('/dashboard') || url.pathname === '/auth/login', { timeout: 30_000 })
  }

  return email
}

async function loginAdmin(page) {
  await page.goto(`${ADMIN_BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 })

  await page.fill('input[type="email"]', ADMIN_EMAIL)
  await page.fill('input[type="password"]', ADMIN_PASSWORD)
  await page.click('button[type="submit"]')

  await page.waitForURL((url) => url.pathname.startsWith('/dashboard') || url.pathname === '/login', { timeout: 40_000 })
}

async function collectDynamicUserRoutes(page) {
  const routes = []

  await page.goto(`${USER_BASE}/vehicles`, { waitUntil: 'networkidle', timeout: 60_000 })
  const vehicleHref = await page.locator('a[href^="/vehicles/"]').first().getAttribute('href').catch(() => null)
  if (vehicleHref) routes.push(vehicleHref)

  await page.goto(`${USER_BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 60_000 })
  const inquiryHref = await page.locator('a[href^="/inquiry/"]').first().getAttribute('href').catch(() => null)
  if (inquiryHref) routes.push(inquiryHref)

  if (inquiryHref) {
    await page.goto(`${USER_BASE}${inquiryHref}`, { waitUntil: 'networkidle', timeout: 60_000 })
    const applyHref = await page.locator('a[href^="/apply/"]').first().getAttribute('href').catch(() => null)
    if (applyHref) routes.push(applyHref)
  }

  return [...new Set(routes)]
}

async function main() {
  await cleanOutputDirs()

  const userServer = startServer({
    command: 'pnpm --filter @bhatbhati/user dev --host localhost --port 4173',
    cwd: ROOT,
    label: 'user',
    readyPattern: /Local:\s+http:\/\/(?:localhost|127\.0\.0\.1):4173\//,
  })

  const adminServer = startServer({
    command: 'pnpm --filter @bhatbhati/admin dev --host localhost --port 4174',
    cwd: ROOT,
    label: 'admin',
    readyPattern: /Local:\s+http:\/\/(?:localhost|127\.0\.0\.1):4174\//,
  })

  const manifest = {
    generatedAt: new Date().toISOString(),
    user: [],
    admin: [],
  }

  let browser

  try {
    await Promise.all([userServer.ready, adminServer.ready])

    browser = await chromium.launch({ headless: true })

    const userContext = await browser.newContext({ viewport: { width: 1440, height: 2400 } })
    const userPage = await userContext.newPage()

    const userPublicRoutes = ['/', '/auth/login', '/auth/register']
    for (const route of userPublicRoutes) {
      await captureRoute({ page: userPage, baseUrl: USER_BASE, route, prefix: 'user', manifest: manifest.user })
    }

    await loginUser(userPage)

    const userCoreProtectedRoutes = ['/dashboard', '/terrain', '/vehicles', '/bookings', '/profile']
    for (const route of userCoreProtectedRoutes) {
      await captureRoute({ page: userPage, baseUrl: USER_BASE, route, prefix: 'user', manifest: manifest.user })
    }

    const userDynamicRoutes = await collectDynamicUserRoutes(userPage)
    for (const route of userDynamicRoutes) {
      await captureRoute({ page: userPage, baseUrl: USER_BASE, route, prefix: 'user', manifest: manifest.user })
    }

    await userContext.close()

    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 2400 } })
    const adminPage = await adminContext.newPage()

    await captureRoute({ page: adminPage, baseUrl: ADMIN_BASE, route: '/login', prefix: 'admin', manifest: manifest.admin })
    await loginAdmin(adminPage)
    await captureRoute({ page: adminPage, baseUrl: ADMIN_BASE, route: '/dashboard', prefix: 'admin', manifest: manifest.admin })

    await adminContext.close()

    await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

    process.stdout.write(`\nSaved captures to ${OUT_DIR}\n`)
  } finally {
    if (browser) await browser.close()
    await Promise.allSettled([userServer.stop(), adminServer.stop()])
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
