let engToJpn = {};
let jpnToEng = {};

async function loadRules() {
  try {
    const response = await fetch("js/rules.txt");
    const text = await response.text();

    text.split("\n").forEach((line) => {
      if (!line) return;

      // find the rightmost comma index because of the line `,,ね`.
      const lastCommaIndex = line.lastIndexOf(",");
      const [eng, jpn] = [
        line.substring(0, lastCommaIndex),
        line.substring(lastCommaIndex + 1),
      ];

      if (eng && jpn) {
        engToJpn[eng] = jpn;
        jpnToEng[jpn] = eng;
      }
    });
  } catch (error) {
    console.error("ルールの読み込みに失敗しました: ", error);
  }
}

function convert(value, mapping) {
  return value
    .split("")
    .map((c) => mapping[c] || c)
    .join("");
}

const COMBINING_MARKS = { "゛": "゙", "゜": "゚" };
const SPACING_MARKS = { "゙": "゛", "゚": "゜" };

// split voiced kana into base + spacing mark: `が` -> `か゛`.
// only kana with a rule are split, so katakana and other text stay intact.
function decomposeMarks(value) {
  return value
    .split("")
    .map((c) => {
      const d = c.normalize("NFD");
      if (d.length === 2 && d[1] in SPACING_MARKS && d[0] in jpnToEng) {
        return d[0] + SPACING_MARKS[d[1]];
      }
      return c;
    })
    .join("");
}

// merge base + spacing mark into voiced kana: `か゛` -> `が`.
// pairs that don't compose (e.g. `あ゛`) are left as they are.
function composeMarks(value) {
  return value.replace(/(.)([゛゜])/gu, (pair, base, mark) => {
    const composed = (base + COMBINING_MARKS[mark]).normalize("NFC");
    return composed.length === 1 ? composed : pair;
  });
}

const engArea = document.getElementById("eng");
const jpnArea = document.getElementById("jpn");

engArea.addEventListener("input", () => {
  jpnArea.value = composeMarks(convert(engArea.value, engToJpn));
});

jpnArea.addEventListener("input", () => {
  engArea.value = convert(decomposeMarks(jpnArea.value), jpnToEng);
});

loadRules();
