import { describe, expect, it } from "vitest";
import { Bash } from "../../Bash.js";

// Expected values recorded from real jq 1.7.1.
describe("jq X[expr] evaluates expr against the input", () => {
  async function runJq(filter: string, input: string) {
    const env = new Bash();
    return env.exec(`echo '${input}' | jq -c '${filter}'`);
  }

  describe("reads", () => {
    it.each([
      [".foo[.bar]", '{"foo":{"x":1},"bar":"x"}', "1"],
      [".foo[.n]", '{"foo":[10,20],"n":1}', "20"],
      ["[10,20,30] as $a | $a[.]", "1", "20"],
      ['{"a":1,"b":2} as $m | $m[.]', '"b"', "2"],
      ["to_entries | map(.value[.key])", '{"x":{"x":7}}', "[7]"],
      ["[.a[.i,.j]]", '{"a":[10,20,30],"i":0,"j":2}', "[10,30]"],
    ])("%s on %s", async (filter, input, expected) => {
      const result = await runJq(filter, input);
      expect(result.stdout).toBe(`${expected}\n`);
      expect(result.stderr).toBe("");
      expect(result.exitCode).toBe(0);
    });
  });

  describe("evaluation order", () => {
    it("varies the base fastest when base and index both produce several outputs", async () => {
      const result = await runJq("[(.x,.y)[0,1]]", '{"x":[1,2],"y":[3,4]}');
      expect(result.stdout).toBe("[1,3,2,4]\n");
      expect(result.stderr).toBe("");
      expect(result.exitCode).toBe(0);
    });

    it("evaluates the index before the base", async () => {
      const result = await runJq('[error("x")[empty]]', "null");
      expect(result.stdout).toBe("[]\n");
      expect(result.stderr).toBe("");
      expect(result.exitCode).toBe(0);
    });
  });

  describe("writes", () => {
    it.each([
      [".foo[.bar] = 5", '{"foo":{"x":5},"bar":"x"}'],
      [".foo[.bar] |= . + 1", '{"foo":{"x":2},"bar":"x"}'],
      ["del(.foo[.bar])", '{"foo":{},"bar":"x"}'],
    ])("%s", async (filter, expected) => {
      const result = await runJq(filter, '{"foo":{"x":1},"bar":"x"}');
      expect(result.stdout).toBe(`${expected}\n`);
      expect(result.stderr).toBe("");
      expect(result.exitCode).toBe(0);
    });
  });
});
