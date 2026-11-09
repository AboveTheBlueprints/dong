// 洞（第四个，第 16 天）：跟 ../洞.py 一字不差的规矩。每按一下都从头重放。
const MAP = [
"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
"X############################X",
"X##....######.......#########X",
"X##.##.######.#####.....#####X",
"X##.##........#####.CCC.#####X",
"X##.###########.....CCC.....#X",
"X##.###########.###.CCC####.#X",
"X##.....########.##.....###.#X",
"X######.########.######.###.#X",
"X######.......##.######.....#X",
"XXXXXXXXXXXXXEXXXXXXXXXXXXXXXX"];
const H = MAP.length, W = MAP[0].length, NIGHT = 60;
const MV = {"上": [0, -1], "下": [0, 1], "左": [-1, 0], "右": [1, 0]};
function loud(n) { return ["", "嘶……（很轻）", "嘶嘶……", "嘶嘶嘶，像就在墙那边"][Math.min(n, 3)]; }
function play(acts) {
  let seed = 1123n;
  const rnd = n => { seed = (seed * 1103515245n + 12345n) % 2147483648n; return Number(seed >> 8n) % n; };
  const g = MAP.map(r => r.split(""));
  const earth = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x] === "#") earth.push([x, y]);
  const small = new Set();
  while (small.size < 14) { const e = earth[rnd(earth.length)]; small.add(e[0] + "," + e[1]); }
  const tunnels = () => { let c = 0; for (const r of g) for (const ch of r) if (".CE".includes(ch)) c++; return c; };
  const delay = () => 3 + Math.floor(tunnels() / 12);
  let you = [21, 5];
  const digs = {}, hiss = {};
  const addEcho = t => { const d = delay() + [-1, 0, 0, 1][rnd(4)]; for (let k = 0; k < 3; k++) hiss[t + d + k] = (hiss[t + d + k] || 0) + 1; };
  for (let t = -9; t < -3; t++) { digs[t] = null; addEcho(t); }
  const nearSmall = p => [[1,0],[-1,0],[0,1],[0,-1]].some(d => small.has((p[0]+d[0]) + "," + (p[1]+d[1])));
  const lines = [];
  let prev = 0, t = 0, heard = null, lastHiss = 0;
  for (const a of acts) {
    if (t >= NIGHT) break;
    t += 1;
    let line = "第 " + t + " 下　" + a + "　";
    if (MV[a]) {
      const n = [you[0] + MV[a][0], you[1] + MV[a][1]];
      const c = (n[1] >= 0 && n[1] < H) ? g[n[1]][n[0]] : "林";
      if (c === "林") line += "林子里黑，没什么可去的，你又缩回洞口。";
      else if (c === "X") line += "石头，挖不动。";
      else if (c === "#") {
        g[n[1]][n[0]] = "."; you = n; digs[t] = n; addEcho(t);
        const k = n[0] + "," + n[1];
        if (small.has(k)) { small.delete(k); line += "你刨开土，刨出一只小东西，顺口吃了。"; }
        else line += "你刨开一格土。";
      } else {
        you = n; line += "走。";
        if (c === "E") line += "你钻出青苔，外面是林子，风凉。";
      }
    } else if (a === "等") line += "你不动。";
    else if (a === "听") {
      const n0 = hiss[t] || 0;
      if (g[you[1]][you[0]] === "E") line += "你在洞外头，听不见洞里。";
      else if (!n0) line += "你把耳朵贴在墙上。静。";
      else {
        line += "你把耳朵贴在墙上：" + loud(n0) + "。哪面墙贴上去都一样，听不出是从哪边来的。";
      }
    } else line += "（没有这个动作）";
    const n = g[you[1]][you[0]] !== "E" ? (hiss[t] || 0) : 0;
    if (n && !prev) line += "　又响了：" + loud(n);
    else if (n) line += "　" + loud(n);
    else if (prev) line += "　停了。";
    if (nearSmall(you) && !n) line += "　墙里有窸窣的一点小动静。";
    prev = n; lastHiss = n;
    lines.push(line);
  }
  return {lines, g, you, digs, hiss, t, now: lastHiss};
}
if (typeof module !== "undefined") module.exports = {play, NIGHT, H, W};
