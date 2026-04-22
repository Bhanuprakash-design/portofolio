const canvas = document.getElementById("conveyorCanvas");
const ctx = canvas.getContext("2d");

const frame = [
  [-260, -95, -30], [260, -95, -30], [285, 95, -30], [-235, 95, -30],
  [-260, -95, 30], [260, -95, 30], [285, 95, 30], [-235, 95, 30],
];

const frameEdges = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

const rollers = [-190, -95, 0, 95, 190].map((x) => ({ x, y: 0, z: 0 }));
let angle = 0;

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function project([x, y, z], spin) {
  const cos = Math.cos(spin);
  const sin = Math.sin(spin);
  const rx = x * cos - z * sin;
  const rz = x * sin + z * cos;
  const tilt = -0.54;
  const ty = y * Math.cos(tilt) - rz * Math.sin(tilt);
  const tz = y * Math.sin(tilt) + rz * Math.cos(tilt);
  const scale = 520 / (720 + tz);
  return {
    x: canvas.clientWidth / 2 + rx * scale,
    y: canvas.clientHeight / 2 + ty * scale,
    scale,
  };
}

function drawLine(a, b, color, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function drawRoller(center, spin) {
  const left = project([center.x - 42, center.y, -36], spin);
  const right = project([center.x + 42, center.y, 36], spin);
  const radius = 16 * ((left.scale + right.scale) / 2);
  drawLine(left, right, "rgba(116, 215, 231, 0.95)", 5);
  ctx.fillStyle = "#e7eef2";
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.5;
  [left, right].forEach((p) => {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, radius * 0.8, radius * 0.45, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function draw() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#101820");
  gradient.addColorStop(1, "#1e2f3a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let x = -width; x < width * 1.5; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x + width * 0.55, 0);
    ctx.stroke();
  }

  const points = frame.map((point) => project(point, angle));

  ctx.fillStyle = "rgba(11, 114, 133, 0.22)";
  const belt = [[-245, -65, 44], [245, -65, 44], [270, 65, 44], [-220, 65, 44]].map((p) => project(p, angle));
  ctx.beginPath();
  ctx.moveTo(belt[0].x, belt[0].y);
  belt.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();

  frameEdges.forEach(([a, b]) => drawLine(points[a], points[b], "rgba(231, 238, 242, 0.78)", 2));
  rollers.forEach((roller) => drawRoller(roller, angle));

  const stress = project([215, 86, 46], angle);
  const pulse = 0.55 + Math.sin(angle * 3) * 0.15;
  ctx.fillStyle = `rgba(184, 92, 56, ${pulse})`;
  ctx.beginPath();
  ctx.arc(stress.x, stress.y, 22 * stress.scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "700 13px Inter, system-ui, sans-serif";
  ctx.fillText("CAD Assembly Preview", 24, 34);
  ctx.fillStyle = "rgba(118,215,231,0.88)";
  ctx.fillText("Material Optimization | FEA Review", 24, 56);

  angle += 0.008;
  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);
resize();
draw();
