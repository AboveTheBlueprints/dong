// 洞（第四个，第 16 天）：跟 ../洞二.py 一字不差的规矩，两夜。每按一下都从头重放。
const MAP = [
"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
"X############################X",
"X##....######.......#########X",
"X##.##.######.#####.....#####X",
"X##.##........#####.CCC.#####X",
"X##.###########.....CCC.....#X",
"X##.###########.###.CCC####.#X",
"X##.....########.##.....###.#X",
"X######.......##.######.....#X",
"X######.......##.######.....#X",
"XXXXXXXXXXXXXEXXXXXXXXXXXXXXXX"];
const H = MAP.length, W = MAP[0].length, NIGHT = 60, CASTLE = [21, 5];
const MV = {"上": [0, -1], "下": [0, 1], "左": [-1, 0], "右": [1, 0]};
function loud(n) { return ["", "嘶……（很轻）", "嘶嘶……", "嘶嘶嘶，像就在墙那边"][Math.min(n, 3)]; }
const man = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
function play(allActs) {
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
  function night(n, acts) {
    const digs = {}, hiss = {}, its = {}, lines = [], trail = [];
    const addEcho = t => { const d = delay() + [-1, 0, 0, 1][rnd(4)]; for (let k = 0; k < 3; k++) hiss[t + d + k] = (hiss[t + d + k] || 0) + 1; };
    if (n === 1) for (let t = -9; t < -3; t++) { digs[t] = null; addEcho(t); }
    let it = n === 2 ? [2, 1] : null, target = null, hush = -1;
    let prev = 0, t = 0, broke = false, now = 0;
    for (const a of acts) {
      if (t >= NIGHT || broke) break;
      t += 1;
      let line = "第 " + t + " 下　" + a + "　", dug = null;
      if (MV[a]) {
        const m = [you[0] + MV[a][0], you[1] + MV[a][1]];
        const c = (m[1] >= 0 && m[1] < H) ? g[m[1]][m[0]] : "林";
        if (c === "林") line += "林子里黑，没什么可去的，你又缩回洞口。";
        else if (c === "X") line += "石头，挖不动。";
        else if (c === "#") {
          g[m[1]][m[0]] = "."; you = m; digs[t] = m; addEcho(t); dug = m;
          const k = m[0] + "," + m[1];
          if (small.has(k)) { small.delete(k); line += "你刨开土，刨出一只小东西，顺口吃了。"; }
          else line += "你刨开一格土。";
        } else {
          you = m; line += "走。";
          if (c === "E") line += "你钻出青苔，外面是林子，风凉。";
        }
      } else if (a === "等") line += "你不动。";
      else if (a === "听") {
        if (g[you[1]][you[0]] === "E") line += "你在洞外头，听不见洞里。";
        else line += "你把耳朵贴在墙上。";
      } else line += "（没有这个动作）";
      let il = 0;
      if (it) {
        if (dug && man(dug, it) <= 14) { target = dug; hush = t + 1; }
        if (t <= hush) {}
        else if (target || t % 2 === 0) {
          const goal = target || CASTLE;
          const dx = (goal[0] > it[0]) - (goal[0] < it[0]), dy = (goal[1] > it[1]) - (goal[1] < it[1]);
          const step = (Math.abs(goal[0] - it[0]) >= Math.abs(goal[1] - it[1]) && dx) ? [dx, 0] : [0, dy];
          const nx = [it[0] + step[0], it[1] + step[1]];
          if (g[nx[1]][nx[0]] !== "X") { it = nx; trail.push(it); }
          if (target && man(it, target) <= 1) target = null;
          if (g[it[1]][it[0]] === "C") broke = true;
          else if (man(it, you) <= 1 && g[you[1]][you[0]] !== "E") broke = "你";
        }
        const d = man(it, you);
        il = t <= hush ? 0 : d <= 4 ? 3 : d <= 8 ? 2 : d <= 13 ? 1 : 0;
        its[t] = il;
      }
      const outside = g[you[1]][you[0]] === "E";
      const tot = outside ? 0 : Math.min(3, (hiss[t] || 0) + il);
      if (a === "听" && !outside) line += tot ? (loud(tot) + "。哪面墙贴上去都一样，听不出是从哪边来的。") : "静。";
      if (tot && !prev) line += "　又响了：" + loud(tot);
      else if (tot) line += "　" + loud(tot);
      else if (prev) line += "　停了。";
      if (!tot && [[1,0],[-1,0],[0,1],[0,-1]].some(q => small.has((you[0]+q[0]) + "," + (you[1]+q[1])))) line += "　墙里有窸窣的一点小动静。";
      if (broke === "你") line += "　嘶嘶声停了。你身边的土动了一下。";
      else if (broke) line += "　城堡的墙里一阵刨土声，就在粮堆后头。墙塌了一块，土落在粮上。";
      prev = tot; now = tot;
      lines.push(line);
    }
    return {t, digs, hiss, its, trail, broke, lines, now, done: t >= NIGHT || !!broke};
  }
  const acts = allActs.filter(a => a !== "睡");
  const slept = allActs.includes("睡");
  const n1 = night(1, acts.slice(0, NIGHT));
  const r = {n1, night: 1, g, you: null};
  if (n1.done && slept) { you = [21, 5]; r.n2 = night(2, acts.slice(NIGHT)); r.night = 2; }
  r.you = you; r.g = g;
  return r;
}
if (typeof module !== "undefined") module.exports = {play, NIGHT, H, W, MAP};
