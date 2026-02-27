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

const engArea = document.getElementById("eng");
const jpnArea = document.getElementById("jpn");

engArea.addEventListener("input", () => {
  jpnArea.value = convert(engArea.value, engToJpn);
});

jpnArea.addEventListener("input", () => {
  engArea.value = convert(jpnArea.value, jpnToEng);
});

loadRules();
