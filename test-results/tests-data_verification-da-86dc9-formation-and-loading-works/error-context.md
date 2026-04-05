# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/data_verification.spec.ts >> data transformation and loading works
- Location: tests/data_verification.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Pull Once")').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button:has-text("Pull Once")').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6] [cursor=pointer]:
          - img [ref=e8]
          - generic [ref=e11]: KPOP COLLECTION
        - navigation [ref=e12]:
          - link "Home" [ref=e13] [cursor=pointer]:
            - /url: /
            - img [ref=e14]
            - text: Home
          - link "Gacha" [ref=e17] [cursor=pointer]:
            - /url: /gacha
            - img [ref=e18]
            - text: Gacha
          - link "Collection" [ref=e20] [cursor=pointer]:
            - /url: /collection
            - img [ref=e21]
            - text: Collection
          - link "History" [ref=e26] [cursor=pointer]:
            - /url: /history
            - img [ref=e27]
            - text: History
        - generic [ref=e31]:
          - generic [ref=e32]:
            - img [ref=e33]
            - generic [ref=e38]: "500"
          - generic [ref=e39]:
            - img [ref=e40]
            - generic [ref=e43]: "0"
          - button [ref=e44] [cursor=pointer]:
            - img [ref=e45]
      - generic [ref=e48]:
        - generic [ref=e49]:
          - heading "Gacha Center" [level=1] [ref=e50]
          - generic [ref=e51]:
            - button "KPOP Standard Banner" [ref=e52] [cursor=pointer]
            - button "aespa Rate Up!" [ref=e53] [cursor=pointer]
            - button "Born Pink Exclusive" [ref=e54] [cursor=pointer]
            - button "Newcomer Special" [ref=e55] [cursor=pointer]
        - generic [ref=e56]:
          - generic [ref=e58]:
            - img "KPOP Standard Banner" [ref=e59]
            - generic [ref=e60]:
              - generic [ref=e61]:
                - generic [ref=e62]: standard
                - generic [ref=e63]:
                  - img [ref=e64]
                  - text: "Ends in: 2028-12-31"
              - heading "KPOP Standard Banner" [level=2] [ref=e67]
              - paragraph [ref=e68]: Pull all your favorite idols from the standard pool!
          - generic [ref=e69]:
            - generic [ref=e72]:
              - img [ref=e73]
              - generic [ref=e76]: Gacha Machine
            - generic [ref=e77]:
              - generic [ref=e78]:
                - button "Single pull for 150 coins" [ref=e79] [cursor=pointer]:
                  - generic [ref=e80]: Single Pull
                  - generic [ref=e81]:
                    - img [ref=e82]
                    - generic [ref=e87]: "150"
                - button "Ten pull for 1350 coins" [disabled] [ref=e88]:
                  - generic [ref=e89]: Ten Pull
                  - generic [ref=e90]:
                    - img [ref=e91]
                    - generic [ref=e96]: "1350"
              - button "CLAIM FREE DAILY PULL" [ref=e97] [cursor=pointer]
          - generic [ref=e99]:
            - generic [ref=e102]:
              - generic [ref=e103]: UR Pity
              - generic [ref=e104]:
                - text: "0"
                - generic [ref=e105]: / 100
            - generic [ref=e109]:
              - generic [ref=e110]: SSR Pity
              - generic [ref=e111]:
                - text: "0"
                - generic [ref=e112]: / 60
            - generic [ref=e117]:
              - generic [ref=e118]: Spark Points
              - generic [ref=e119]:
                - text: "0"
                - generic [ref=e120]: / 200
            - generic [ref=e122]:
              - generic [ref=e123]:
                - generic [ref=e124]: Recent Pulls
                - img [ref=e125]
              - generic [ref=e130]: No pulls yet
  - alert [ref=e131]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test('data transformation and loading works', async ({ page }) => {
  4  |   // Ensure we are using the latest data
  5  |   // The environment is already running 'next dev' in the background from previous setup
  6  |
  7  |   await page.goto('http://localhost:3000/gacha');
  8  |
  9  |   // Wait for page to load
  10 |   await page.waitForSelector('h1:has-text("Gacha Center")');
  11 |
  12 |   // Check if Karina exists in the banner context if possible,
  13 |   // but simpler to check the card list in collection if we had any cards.
  14 |   // Since we start with 500 coins, let's do a pull and see if we get a result.
  15 |
  16 |   // Wait for the banner to be interactive
  17 |   const pullButton = page.locator('button:has-text("Pull Once")').first();
> 18 |   await expect(pullButton).toBeVisible();
     |                            ^ Error: expect(locator).toBeVisible() failed
  19 |   await pullButton.click();
  20 |
  21 |   // Wait for reveal
  22 |   await page.waitForSelector('text=TAP TO REVEAL', { timeout: 10000 });
  23 |   await page.click('text=TAP TO REVEAL');
  24 |
  25 |   // Verify that some card name is shown (meaning data was loaded)
  26 |   // Our kpop_data_raw.json has Karina, so it's a 100% chance to get her if she's the only one.
  27 |   await expect(page.locator('text=Karina')).toBeVisible({ timeout: 15000 });
  28 | });
  29 |
```