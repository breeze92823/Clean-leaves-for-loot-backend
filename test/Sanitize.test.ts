import assert from "assert";

import { sanitizeProgress } from "../src/sanitize.js";

describe("sanitizeProgress", () => {
  it("rejects non-objects and bounds numbers", () => {
    assert.strictEqual(sanitizeProgress(null), null);
    assert.strictEqual(sanitizeProgress([1]), null);
    const out = sanitizeProgress({ cash: 1e30, power: -5, leaves: NaN, level: 0, rebirths: 2.9, hack: "x" })!;
    assert.strictEqual(out.cash, 1e18);
    assert.strictEqual(out.power, 0);
    assert.strictEqual(out.leaves, undefined);
    assert.strictEqual(out.level, 1);
    assert.strictEqual(out.rebirths, 2);
    assert.ok(!("hack" in out));
  });

  it("keeps well-formed loot, ids and upgrades and drops the rest", () => {
    const out = sanitizeProgress({
      bag: [{ name: "Gem", rarity: "Uncommon", value: 5 }, { name: "Fake", rarity: "Nope", value: 1 }],
      sellLocked: ["Gem", "Gem", 5],
      discovered: ["Rock", "Coal", ""],
      vacuumOwned: ["battery", "gas", "bogus", "gas"],
      vacuum: "gas",
      auraOwned: ["static", "nope"],
      aura: null,
      upgrades: { range: 3.7, capacity: 99, bogus: 4, walk: -2 },
    })!;
    assert.deepStrictEqual(out.bag, [{ name: "Gem", rarity: "Uncommon", value: 5 }]);
    assert.deepStrictEqual(out.sellLocked, ["Gem"]);
    assert.deepStrictEqual(out.discovered, ["Rock", "Coal"]);
    assert.deepStrictEqual(out.vacuumOwned, ["battery", "gas"]);
    assert.strictEqual(out.vacuum, "gas");
    assert.deepStrictEqual(out.auraOwned, ["static"]);
    assert.strictEqual(out.aura, null);
    assert.deepStrictEqual(out.upgrades, { range: 3, capacity: 10, walk: 0 });
  });

  it("ignores unknown vacuum and aura ids", () => {
    const out = sanitizeProgress({ vacuum: "laser", aura: "../etc" })!;
    assert.ok(!("vacuum" in out));
    assert.ok(!("aura" in out));
  });
});
