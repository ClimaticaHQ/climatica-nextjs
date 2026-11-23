import { expect, test } from "@playwright/test";

const TILE_PATTERN = "https://tile.openstreetmap.org/**";
// * a 1×1 transparent PNG: tiles are answered here, so the suite puts no load on OSM's servers
const BLANK_TILE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);
const MAPS = [
  { name: "City Climate's map", url: "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522" },
  {
    name: "Compare Cities' mini map",
    url: "/compare-cities?cityA=Bolzano&latA=46.4983&lngA=11.3548&cityB=Verona&latB=45.4384&lngB=10.9916",
  },
  { name: "the Region Heatmap's map", url: "/heat-map" },
];

test.describe("OpenStreetMap tile usage policy", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("every page says strict-origin-when-cross-origin", async ({ request }) => {
    const response = await request.get("/about");
    expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  for (const { name, url } of MAPS) {
    test(`${name}: each tile carries our origin as its Referer, never no-cache`, async ({
      page,
      baseURL,
    }) => {
      const headers: Record<string, string>[] = [];
      await page.route(TILE_PATTERN, async (route) => {
        headers.push(await route.request().allHeaders());
        await route.fulfill({ contentType: "image/png", body: BLANK_TILE });
      });
      await page.goto(url);
      await expect.poll(() => headers.length, { timeout: 30_000 }).toBeGreaterThan(0);
      const origin = `${new URL(baseURL ?? "").origin}/`;
      for (const header of headers) {
        expect(header["referer"]).toBe(origin);
        expect(`${header["cache-control"] ?? ""} ${header["pragma"] ?? ""}`).not.toContain(
          "no-cache",
        );
      }
      await expect(page.locator(".leaflet-control-attribution").first()).toContainText(
        "OpenStreetMap",
      );
    });
  }
});
