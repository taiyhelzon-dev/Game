// Builds game-ready human bodies from the MakeHuman CC0 base mesh.
// For each hero: morph to a body type, bake arms-down + clenched fists, map the
// MakeHuman skeleton weights onto the game's 15 joints, fit the eyes, and export.
const fs = require('fs'), path = require('path');
const MH = process.argv[2], OUT = process.argv[3];

// ---------- read the base mesh ----------
const V = [], VT = [], F = {}; let g = null;
for (const line of fs.readFileSync(path.join(MH, 'base.obj'), 'utf8').split('\n')){
  if (line.startsWith('v ')) V.push(line.split(/\s+/).slice(1, 4).map(Number));
  else if (line.startsWith('vt ')) VT.push(line.split(/\s+/).slice(1, 3).map(Number));
  else if (line.startsWith('g ')) g = line.split(/\s+/)[1];
  else if (line.startsWith('f ')) (F[g] = F[g] || []).push(line.trim().split(/\s+/).slice(1).map(s => s.split('/').map(n => +n - 1)));
}
const NV = V.length;
const readTarget = f => { const d = []; for (const l of fs.readFileSync(path.join(MH, 'targets/macrodetails', f), 'utf8').split('\n')){ if (!l || l[0] === '#') continue; const p = l.trim().split(/\s+/).map(Number); if (p.length === 4) d.push(p); } return d; };
const T = {};
for (const f of fs.readdirSync(path.join(MH, 'targets/macrodetails'))) if (f.endsWith('.target')) T[f.replace('.target', '')] = readTarget(f);
const skel = JSON.parse(fs.readFileSync(path.join(MH, 'rigs/default.mhskel'), 'utf8'));
const W = JSON.parse(fs.readFileSync(path.join(MH, 'rigs/default_weights.mhw'), 'utf8')).weights;

// ---------- body types ----------
// mix: list of [target, amount]
const HEROES = {
  volt:    {mix:[['caucasian-male-young', 1], ['universal-male-young-maxmuscle-minweight', 0.55], ['male-young-maxmuscle-averageweight-idealproportions', 0.8]]},
  titan:   {mix:[['caucasian-male-young', 1], ['universal-male-young-maxmuscle-averageweight', 0.6], ['universal-male-young-maxmuscle-maxweight', 0.4], ['male-young-maxmuscle-averageweight-idealproportions', 1]]},
  flare:   {mix:[['caucasian-male-young', 0.7], ['asian-male-young', 0.3], ['universal-male-young-maxmuscle-averageweight', 0.7], ['male-young-maxmuscle-averageweight-idealproportions', 0.9]]},
  glacia:  {mix:[['caucasian-female-young', 1], ['universal-female-young-maxmuscle-minweight', 0.45], ['female-young-maxmuscle-averageweight-idealproportions', 0.9]]},
  thorn:   {mix:[['african-female-young', 1], ['universal-female-young-maxmuscle-averageweight', 0.5], ['female-young-maxmuscle-averageweight-idealproportions', 0.9]]},
  orbit:   {mix:[['asian-male-young', 0.6], ['caucasian-male-young', 0.4], ['universal-male-young-maxmuscle-minweight', 0.6], ['male-young-maxmuscle-averageweight-idealproportions', 0.8]]},
  prism:   {mix:[['african-female-young', 1], ['universal-female-young-maxmuscle-minweight', 0.4], ['female-young-maxmuscle-averageweight-idealproportions', 0.9]]},
  blink:   {mix:[['asian-male-young', 0.5], ['caucasian-male-young', 0.5], ['universal-male-young-averagemuscle-minweight', 0.5], ['universal-male-young-maxmuscle-minweight', 0.3]]},
  boulder: {mix:[['african-male-young', 0.7], ['caucasian-male-young', 0.3], ['universal-male-young-maxmuscle-maxweight', 0.85], ['male-young-maxmuscle-averageweight-idealproportions', 0.6]]},
  riptide: {mix:[['caucasian-female-young', 0.6], ['asian-female-young', 0.4], ['universal-female-young-maxmuscle-averageweight', 0.55], ['female-young-maxmuscle-averageweight-idealproportions', 0.9]]},
};

// ---------- small vector math ----------
const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]], add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
const mul = (a, s) => [a[0]*s, a[1]*s, a[2]*s], dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]), norm = a => mul(a, 1/(len(a) || 1));
// 3x4 affine matrices as [r00,r01,r02,t0, r10,...]
const I = () => [1,0,0,0, 0,1,0,0, 0,0,1,0];
function rotAxis(ax, ang){ const [x, y, z] = norm(ax), c = Math.cos(ang), s = Math.sin(ang), t = 1 - c;
  return [t*x*x + c, t*x*y - s*z, t*x*z + s*y, 0, t*x*y + s*z, t*y*y + c, t*y*z - s*x, 0, t*x*z - s*y, t*y*z + s*x, t*z*z + c, 0]; }
function mm(A, B){ const R = new Array(12); for (let r=0;r<3;r++){ for (let c=0;c<3;c++) R[r*4+c] = A[r*4]*B[c] + A[r*4+1]*B[4+c] + A[r*4+2]*B[8+c]; R[r*4+3] = A[r*4]*B[3] + A[r*4+1]*B[7] + A[r*4+2]*B[11] + A[r*4+3]; } return R; }
const tr = p => [1,0,0,p[0], 0,1,0,p[1], 0,0,1,p[2]];
const apply = (M, p) => [M[0]*p[0]+M[1]*p[1]+M[2]*p[2]+M[3], M[4]*p[0]+M[5]*p[1]+M[6]*p[2]+M[7], M[8]*p[0]+M[9]*p[1]+M[10]*p[2]+M[11]];
const applyDir = (M, p) => [M[0]*p[0]+M[1]*p[1]+M[2]*p[2], M[4]*p[0]+M[5]*p[1]+M[6]*p[2], M[8]*p[0]+M[9]*p[1]+M[10]*p[2]];

// ---------- which game joint each MakeHuman bone belongs to ----------
const GAME = ['hips', 'spine', 'head', 'armL', 'armR', 'elbowL', 'elbowR', 'fistL', 'fistR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'footL', 'footR'];
function gameOf(b){
  // MakeHuman .L is +x, the game's L is -x
  const s = b.endsWith('.L') ? 'R' : b.endsWith('.R') ? 'L' : '', n = b.replace(/\.(L|R)$/, '');
  if (n === 'root' || n === 'pelvis') return [['hips', 1]];
  if (n === 'spine05') return [['hips', 0.7], ['spine', 0.3]];
  if (n === 'spine04') return [['hips', 0.3], ['spine', 0.7]];
  if (/^spine0[123]$/.test(n) || n === 'breast') return [['spine', 1]];
  if (n === 'clavicle') return [['spine', 0.75], ['arm' + s, 0.25]];
  if (n === 'shoulder01') return [['spine', 0.3], ['arm' + s, 0.7]];
  if (/^upperarm/.test(n)) return [['arm' + s, 1]];
  if (/^lowerarm/.test(n)) return [['elbow' + s, 1]];
  if (n === 'wrist' || /^metacarpal|^finger/.test(n)) return [['fist' + s, 1]];
  if (n === 'neck01') return [['spine', 0.6], ['head', 0.4]];
  if (n === 'neck02') return [['spine', 0.3], ['head', 0.7]];
  if (n === 'upperleg01') return [['hip' + s, 0.85], ['hips', 0.15]];
  if (n === 'upperleg02') return [['hip' + s, 1]];
  if (/^lowerleg/.test(n)) return [['knee' + s, 1]];
  if (n === 'foot' || /^toe/.test(n)) return [['foot' + s, 1]];
  return [['head', 1]]; // neck03, head, jaw, eyes and all the face muscles
}
// per vertex MakeHuman weights
const vw = Array.from({length:NV}, () => []);
for (const [b, list] of Object.entries(W)) for (const [vi, w] of list) vw[vi].push([b, w]);

// body faces -> unwelded vertex list (position index + uv index)
const bodyF = F['body'], key = new Map(), outV = [], outUV = [], tris = [];
const vid = (pi, ti) => { const k = pi*65536 + ti; if (!key.has(k)){ key.set(k, outV.length); outV.push(pi); outUV.push(ti); } return key.get(k); };
for (const f of bodyF){ const ids = f.map(([pi, ti]) => vid(pi, ti)); for (let i=1;i<ids.length-1;i++) tris.push(ids[0], ids[i], ids[i+1]); }
console.log('body: verts', outV.length, 'tris', tris.length/3);

// ---------- eyes (fitted with the MHCLO file) ----------
const eyeObj = { v:[], vt:[], f:[] };
for (const line of fs.readFileSync(path.join(MH, 'eyes/high-poly/high-poly.obj'), 'utf8').split('\n')){
  if (line.startsWith('v ')) eyeObj.v.push(line.split(/\s+/).slice(1, 4).map(Number));
  else if (line.startsWith('vt ')) eyeObj.vt.push(line.split(/\s+/).slice(1, 3).map(Number));
  else if (line.startsWith('f ')) eyeObj.f.push(line.trim().split(/\s+/).slice(1).map(s => s.split('/').map(n => +n - 1)));
}
const clo = { refs:[], scale:{} }; let inV = false;
for (const line of fs.readFileSync(path.join(MH, 'eyes/high-poly/high-poly.mhclo'), 'utf8').split('\n')){
  const p = line.trim().split(/\s+/);
  if (/^(x|y|z)_scale$/.test(p[0])) clo.scale[p[0][0]] = [+p[1], +p[2], +p[3]];
  if (p[0] === 'verts'){ inV = true; continue; }
  if (inV && p.length >= 9) clo.refs.push(p.slice(0, 9).map(Number));
  else if (inV && p.length === 1 && p[0] && isNaN(+p[0])) inV = false;
}
const eKey = new Map(), eV = [], eUV = [], eTris = [];
const evid = (pi, ti) => { const k = pi*65536 + ti; if (!eKey.has(k)){ eKey.set(k, eV.length); eV.push(pi); eUV.push(ti); } return eKey.get(k); };
const cTris = [];
for (const f of eyeObj.f){ const ids = f.map(([pi, ti]) => evid(pi, ti)); const cornea = f.every(([, ti]) => eyeObj.vt[ti][0] > 0.82 && eyeObj.vt[ti][1] < 0.18);
  for (let i=1;i<ids.length-1;i++) (cornea ? cTris : eTris).push(ids[0], ids[i], ids[i+1]); }
console.log('eye tris', eTris.length/3, 'cornea tris', cTris.length/3);
console.log('eyes: verts', eV.length, 'refs', clo.refs.length);

function buildHero(id, cfg){
  // 1. morph
  const P = V.map(v => v.slice());
  for (const [t, amt] of cfg.mix){ const d = T[t]; if (!d) throw new Error('missing target ' + t); for (const [i, x, y, z] of d){ P[i][0] += x*amt; P[i][1] += y*amt; P[i][2] += z*amt; } }
  // 2. joints = centre of their vertex groups
  const J = {}; for (const [k, list] of Object.entries(skel.joints)){ let c = [0, 0, 0]; for (const i of list) c = add(c, P[i]); J[k] = mul(c, 1/list.length); }
  const head = b => J[skel.bones[b].head], tail = b => J[skel.bones[b].tail];
  // 3. pose: local rotations (in world axes at rest) for some bones
  const R = {};
  const rot = (b, ax, ang) => { R[b] = mm(rotAxis(ax, ang), R[b] || I()); };
  ['L', 'R'].forEach(s => {
    const sh = head('upperarm01.' + s), wr = head('wrist.' + s), dir = norm(sub(wr, sh));
    const side = Math.sign(sh[0]), want = norm([side*0.1, -1, 0.02]);
    const ax = cross(dir, want), ang = Math.acos(Math.max(-1, Math.min(1, dot(dir, want))));
    rot('shoulder01.' + s, ax, ang*0.25); rot('upperarm01.' + s, ax, ang*0.75);
    // legs straight under the hips
    const hp = head('upperleg01.' + s), an = head('foot.' + s), ld = norm(sub(an, hp)), lw = [0, -1, 0];
    const lax = cross(ld, lw), lang = Math.acos(Math.max(-1, Math.min(1, dot(ld, lw))));
    if (len(lax) > 1e-6) rot('upperleg01.' + s, lax, lang);
    // clench the fingers into a fist
    const k2 = head('finger2-1.' + s), k5 = head('finger5-1.' + s), across = norm(sub(k5, k2));
    const fdir = norm(sub(tail('finger3-3.' + s), head('finger3-1.' + s)));
    let palm = norm(cross(fdir, across)); // which side the palm faces is checked below
    const thumbTip = tail('finger1-3.' + s), handC = head('finger3-1.' + s);
    if (dot(sub(thumbTip, handC), palm) < 0) palm = mul(palm, -1);   // the thumb sits on the palm side
    const curlAx = norm(cross(fdir, palm));  // rotating around this moves fingertips toward the palm
    for (const f of [2, 3, 4, 5]) { rot(`finger${f}-1.${s}`, curlAx, 1.35); rot(`finger${f}-2.${s}`, curlAx, 1.55); rot(`finger${f}-3.${s}`, curlAx, 1.2); }

  });
  // 4. forward kinematics: G_b = G_parent * T(h) R T(-h)
  const G = {};
  const getG = b => { if (G[b]) return G[b]; const bd = skel.bones[b], h = head(b);
    const L = mm(tr(h), mm(R[b] || I(), tr(mul(h, -1)))); return (G[b] = bd.parent ? mm(getG(bd.parent), L) : L); };
  for (const b of Object.keys(skel.bones)) getG(b);
  ['L', 'R'].forEach(s => {
    const base = head('finger1-2.' + s), tip = tail('finger1-3.' + s);
    // where the thumb should rest: across the middle of the curled index + middle fingers
    const inv = M => { // inverse of a rigid 3x4 matrix
      const r = [M[0],M[4],M[8], M[1],M[5],M[9], M[2],M[6],M[10]], t = [M[3],M[7],M[11]];
      return [r[0],r[1],r[2],-(r[0]*t[0]+r[1]*t[1]+r[2]*t[2]), r[3],r[4],r[5],-(r[3]*t[0]+r[4]*t[1]+r[5]*t[2]), r[6],r[7],r[8],-(r[6]*t[0]+r[7]*t[1]+r[8]*t[2])]; };
    const idx = apply(G['finger2-2.' + s], head('finger2-3.' + s)), mid = apply(G['finger3-2.' + s], head('finger3-3.' + s));
    const want = mul(add(mul(idx, 0.65), mul(mid, 0.35)), 1);
    // bring the target into the thumb's rest frame (undo the hand's posing)
    const Gp = G[skel.bones['finger1-2.' + s].parent], local = apply(inv(Gp), want);
    const cur = norm(sub(tip, base)), dirW = norm(sub(local, base));
    const ax = cross(cur, dirW), ang = Math.acos(Math.max(-1, Math.min(1, dot(cur, dirW))));
    if (len(ax) > 1e-6) R['finger1-2.' + s] = mm(rotAxis(ax, ang), R['finger1-2.' + s] || I());
    const bend = norm(cross(dirW, norm(sub(head('finger2-1.' + s), base))));
    R['finger1-3.' + s] = mm(rotAxis(bend, 0.25), R['finger1-3.' + s] || I());
  });
  for (const b of Object.keys(G)) delete G[b];
  for (const b of Object.keys(skel.bones)) getG(b);
  // 5. skin every vertex (body + eye helpers)
  const S = P.map((p, i) => { const ws = vw[i]; if (!ws.length) return p.slice(); let o = [0, 0, 0], tw = 0;
    for (const [b, w] of ws){ o = add(o, mul(apply(G[b], p), w)); tw += w; } return mul(o, 1/tw); });
  const posedJ = b => apply(G[skel.bones[b].parent] ? G[b] : G[b], head(b)); // joint head moves with its own bone
  // 6. game joints in the posed body
  const gj = {
    hips: mul(add(posedJ('upperleg01.L'), posedJ('upperleg01.R')), 0.5),
    spine: posedJ('spine04'), head: posedJ('head'),
    armL: posedJ('upperarm01.R'), armR: posedJ('upperarm01.L'), elbowL: posedJ('lowerarm01.R'), elbowR: posedJ('lowerarm01.L'),
    fistL: posedJ('wrist.R'), fistR: posedJ('wrist.L'), hipL: posedJ('upperleg01.R'), hipR: posedJ('upperleg01.L'),
    kneeL: posedJ('lowerleg01.R'), kneeR: posedJ('lowerleg01.L'), footL: posedJ('foot.R'), footR: posedJ('foot.L'),
  };
  // 7. scale so the hip joints are at height 1.0 with the soles on the ground, centred on the hips
  let minY = Infinity; for (const vi of outV) minY = Math.min(minY, S[vi][1]);
  const k = 1/(gj.hips[1] - minY), cx = gj.hips[0], cz = gj.hips[2];
  const X = p => [(p[0] - cx)*k, (p[1] - minY)*k, (p[2] - cz)*k];
  const joints = {}; for (const [n, p] of Object.entries(gj)) joints[n] = X(p).map(v => +v.toFixed(4));
  // face landmarks for painting lips, brows and the neck line
  const oris = Object.keys(skel.bones).filter(b => /^oris0[1-7]/.test(b)).map(b => posedJ(b));
  const avg = list => mul(list.reduce((a, b) => add(a, b), [0, 0, 0]), 1/list.length);
  joints.mouth = X(avg(oris)).map(v => +v.toFixed(4));
  joints.neck = X(posedJ('neck01')).map(v => +v.toFixed(4));
  const pos = outV.map(vi => X(S[vi]));
  // boots: smooth away the toes so the feet look like they're wearing shoes
  { const toeW = new Float32Array(NV); for (let i=0;i<NV;i++) for (const [b, w] of vw[i]) if (/^toe/.test(b)) toeW[i] += w;
    const nb = Array.from({length:NV}, () => new Set());
    for (const f of bodyF) for (let i=0;i<f.length;i++){ const a = f[i][0], b = f[(i+1) % f.length][0]; nb[a].add(b); nb[b].add(a); }
    for (let it=0; it<10; it++){ const nS = S.map(p => p.slice());
      for (let i=0;i<NV;i++){ const w = Math.min(1, toeW[i]*1.6); if (w < 0.05 || !nb[i].size) continue; let c = [0, 0, 0]; for (const j of nb[i]) c = add(c, S[j]); c = mul(c, 1/nb[i].size);
        nS[i] = add(S[i], mul(sub(c, S[i]), 0.6*w)); }
      for (let i=0;i<NV;i++) S[i] = nS[i]; } }
  // smooth normals from the welded mesh
  const wn = Array.from({length:NV}, () => [0, 0, 0]);
  for (const f of bodyF) for (let i=1;i<f.length-1;i++){ const a = S[f[0][0]], b = S[f[i][0]], c = S[f[i+1][0]]; const n = cross(sub(b, a), sub(c, a));
    [f[0][0], f[i][0], f[i+1][0]].forEach(j => { wn[j] = add(wn[j], n); }); }
  const nrm = outV.map(vi => norm(wn[vi]));
  // 8. eyes from the MHCLO references
  const sc = a => { const [i, j, r] = clo.scale[a]; const d = Math.abs(P[i]['xyz'.indexOf(a)] - P[j]['xyz'.indexOf(a)]); return d/r; };
  const s3 = [sc('x'), sc('y'), sc('z')];
  const eyeRaw = clo.refs.map(([a, b, c, wa, wb, wc, dx, dy, dz]) => add(add(add(mul(P[a], wa), mul(P[b], wb)), mul(P[c], wc)), [dx*s3[0], dy*s3[1], dz*s3[2]]));
  // pose the eyes with the head (they are rigid with the head bone)
  const eyePos = eV.map(i => X(apply(G['head'], eyeRaw[i])));
  const eyeC = side => avg(eyePos.filter(p => Math.sign(p[0]) === side)).map(v => +v.toFixed(4));
  joints.eyeL = eyeC(-1); joints.eyeR = eyeC(1);
  return {joints, pos, nrm, eyePos};
}

// ---------- shared skin weights mapped to game joints ----------
const skinIdx = [], skinW = [];
for (const vi of outV){
  const acc = {}; for (const [b, w] of vw[vi]) for (const [gname, f] of gameOf(b)) acc[gname] = (acc[gname] || 0) + w*f;
  let top = Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 4); if (!top.length) top = [['hips', 1]];
  const tw = top.reduce((s, x) => s + x[1], 0);
  const q = top.map(x => Math.round(x[1]/tw*255)); q[0] += 255 - q.reduce((a, b) => a + b, 0);
  for (let i=0;i<4;i++){ skinIdx.push(top[i] ? GAME.indexOf(top[i][0]) : 0); skinW.push(top[i] ? q[i] : 0); }
}

// ---------- pack everything ----------
const b64 = arr => Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength).toString('base64');
const q16 = (list, s) => { const a = new Int16Array(list.length*3); list.forEach((p, i) => { for (let c=0;c<3;c++) a[i*3+c] = Math.round(p[c]/s*32767); }); return a; };
const PS = 2.5; // positions are stored in [-2.5, 2.5]
const out = {
  about:'Human bodies made from the MakeHuman base mesh, skeleton weights and targets (CC0 1.0, makehumancommunity.org).',
  bones:GAME, posScale:PS,
  uv:b64(Float32Array.from(outUV.flatMap(t => VT[t]))), index:b64(Uint16Array.from(tris)),
  skinIndex:b64(Uint8Array.from(skinIdx)), skinWeight:b64(Uint8Array.from(skinW)),
  eyes:{uv:b64(Float32Array.from(eUV.flatMap(t => eyeObj.vt[t]))), index:b64(Uint16Array.from(eTris)), cornea:b64(Uint16Array.from(cTris))},
  heroes:{}
};
for (const [id, cfg] of Object.entries(HEROES)){
  const h = buildHero(id, cfg);
  out.heroes[id] = { joints:h.joints, pos:b64(q16(h.pos, PS)), nrm:b64(Int8Array.from(h.nrm.flatMap(n => n.map(c => Math.round(c*127))))), eyes:b64(q16(h.eyePos, PS)) };
  const ys = h.pos.map(p => p[1]); console.log(id, 'height', Math.max(...ys).toFixed(3), 'L1', (h.joints.hipL[1] - h.joints.kneeL[1]).toFixed(3), 'L2', (h.joints.kneeL[1] - h.joints.footL[1]).toFixed(3), 'armL', h.joints.armL, 'fistL', h.joints.fistL);
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log('wrote', OUT, (fs.statSync(OUT).size/1024).toFixed(0) + ' KB');
