import { expect, test } from '@playwright/test';

test.describe('homepage smoke', () => {
  test('renders the site name as the page h1', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Bonyad/i })).toBeVisible();
  });

  test('serves a sitemap with at least one URL', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<urlset');
    expect(body).toMatch(/<loc>https?:\/\/[^<]+<\/loc>/);
  });

  test('serves a robots.txt that allows GPTBot', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-Agent:\s*GPTBot/i);
    expect(body).toMatch(/Allow:\s*\//i);
  });

  test('serves llms.txt for AI crawlers', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('Bonyad');
  });

  test('sets Content-Security-Policy on responses', async ({ page }) => {
    const response = await page.goto('/');
    const csp = response?.headers()['content-security-policy'];
    expect(csp).toBeTruthy();
    expect(csp).toContain("frame-ancestors 'none'");
  });
});
