"use strict";

// =============================================================
//  CONFIG — modifier ces valeurs pour les tests de performance
// =============================================================

var N          = 12000;    // Nombre de particules initiales
var MAX_N      = 24000;   // Maximum total (borne fixe dans les shaders)
var MASS       = 0.0;    // Masse par défaut
var G          = 1.0;    // Constante gravitationnelle
var DT         = 0.016;  // Pas de temps
var SOFTENING  = 0.5;    // Adoucissement (évite la singularité à dist=0)
var POINT_SIZE = 3.0;    // Taille des points initiaux en pixels
var POINT_SIZE_PLACED = 6.0; // Taille des points posés (2× les initiaux)
var RADIUS     = 8.0;    // Rayon de la distribution initiale
var INIT_SPEED = 0.0;    // Vitesse initiale (0 = au repos)
var INIT_MASS  = 0.0;    // Masse dynamique des particules initiales (slider)
var N_INITIAL  = N;      // Nombre de particules initiales (fixé au lancement)

// =============================================================
//  CANVAS + WEBGL 2
// =============================================================

var canvas = document.getElementById("c");
var gl     = canvas.getContext("webgl2");

if (!gl) {
    document.body.innerHTML = "<p style='color:red;padding:20px'>WebGL 2 requis</p>";
    throw new Error("WebGL2 non disponible");
}

if (!gl.getExtension("EXT_color_buffer_float")) {
    console.warn("[GPU] EXT_color_buffer_float non disponible");
}

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resize);
resize();

// =============================================================
//  LAYOUT TEXTURE
//  Les N particules tiennent dans une texture carrée TEX×TEX.
//  Particule i → pixel (i % TEX, floor(i / TEX))
//  TEX est dimensionné pour MAX_N afin de permettre l'ajout.
// =============================================================

var TEX = Math.ceil(Math.sqrt(MAX_N));

// =============================================================
//  SHADERS GLSL ES 3.0
// =============================================================

// Vertex shader partagé pour les quads GPGPU (physique).
// layout(location=0) : même emplacement pour tous les programmes.
var QUAD_VS = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Mise à jour des VITESSES — N-body O(n²)
// La borne de boucle ${MAX_N} est une constante GLSL (compilée).
// uN est le nombre réel de particules actives (uniform dynamique).
var VEL_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;   // RGBA : x  y  z  masse
uniform sampler2D uVel;   // RGBA : vx vy vz |v|
uniform int       uTex;   // côté de la texture
uniform int       uN;     // nombre de particules actives
uniform float     uG;
uniform float     uDT;
uniform float     uSoft;
uniform float     uInitMass;
uniform int       uInitN;

out vec4 outColor;

void main() {
    ivec2 c = ivec2(gl_FragCoord.xy);
    int   i = c.y * uTex + c.x;
    if (i >= uN) { outColor = vec4(0.0); return; }

    vec4 p   = texelFetch(uPos, c, 0);
    vec4 v   = texelFetch(uVel, c, 0);
    vec3 acc = vec3(0.0);

    for (int j = 0; j < ${MAX_N}; j++) {
        if (j >= uN) break;
        if (j == i)  continue;
        ivec2 jc   = ivec2(j % uTex, j / uTex);
        vec4  pj   = texelFetch(uPos, jc, 0);
        float mj   = (j < uInitN) ? uInitMass : pj.w;
        vec3  d    = pj.xyz - p.xyz;
        float r2   = dot(d, d) + uSoft * uSoft;
        float inv  = inversesqrt(r2);
        acc += d * mj * inv * inv * inv * uG;
    }

    vec3 nv  = v.xyz + acc * uDT;
    outColor = vec4(nv, length(nv));   // alpha = |v|
}`;

// Mise à jour des POSITIONS — intégration Euler
var POS_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;
uniform sampler2D uVel;
uniform int       uTex;
uniform int       uN;
uniform float     uDT;

out vec4 outColor;

void main() {
    ivec2 c = ivec2(gl_FragCoord.xy);
    int   i = c.y * uTex + c.x;
    if (i >= uN) { outColor = vec4(0.0); return; }

    vec4 p   = texelFetch(uPos, c, 0);
    vec4 v   = texelFetch(uVel, c, 0);
    outColor = vec4(p.xyz + v.xyz * uDT, p.w);  // w = masse (inchangée)
}`;

// Scale radial des POSITIONS — passe unique déclenchée par le slider
var SCALE_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;
uniform int       uTex;
uniform int       uN;
uniform int       uInitN;
uniform float     uRatio;

out vec4 outColor;

void main() {
    ivec2 c = ivec2(gl_FragCoord.xy);
    int   i = c.y * uTex + c.x;
    vec4  p = texelFetch(uPos, c, 0);

    if (i < uInitN && i < uN) {
        outColor = vec4(p.xyz * uRatio, p.w);
    } else {
        outColor = p;
    }
}`;

// Vertex shader de rendu.
// gl_VertexID → index particule → lookup texelFetch dans uPos.
// Aucun vertex buffer de positions nécessaire.
var RENDER_VS = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;
uniform sampler2D uVel;
uniform mat4      uMVP;
uniform int       uTex;
uniform int       uInitN;
uniform float     uPointSize;
uniform float     uPointSizePlaced;

out float vSpeed;

void main() {
    int   i = gl_VertexID;
    ivec2 c = ivec2(i % uTex, i / uTex);
    vec4  p = texelFetch(uPos, c, 0);
    vec4  v = texelFetch(uVel, c, 0);

    vSpeed       = v.w;
    gl_Position  = uMVP * vec4(p.xyz, 1.0);
    gl_PointSize = (i < uInitN) ? uPointSize : uPointSizePlaced;
}`;

// Fragment shader de rendu.
// Dégradé bleu (lent) → cyan → vert → orange → blanc (rapide).
// Points rendus comme des disques (coins écartés).
var RENDER_FS = `#version 300 es
precision highp float;

in  float vSpeed;
uniform float uMaxSpeed;

out vec4 outColor;

void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    if (dot(uv, uv) > 1.0) discard;

    float t = clamp(vSpeed / max(uMaxSpeed, 0.001), 0.0, 1.0);
    vec3 c;
    if      (t < 0.25) { float f = t * 4.0;        c = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), f); }
    else if (t < 0.50) { float f = (t-0.25)*4.0;   c = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), f); }
    else if (t < 0.75) { float f = (t-0.50)*4.0;   c = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), f); }
    else               { float f = (t-0.75)*4.0;   c = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 1.0), f); }

    outColor = vec4(c, 1.0);
}`;

// =============================================================
//  MATHS — matrices 4×4 column-major (convention OpenGL/WebGL)
// =============================================================

function mat4Perspective(fovY, aspect, near, far) {
    var f  = 1.0 / Math.tan(fovY * 0.5);
    var nf = 1.0 / (near - far);
    return new Float32Array([
        f / aspect, 0,  0,                    0,
        0,          f,  0,                    0,
        0,          0,  (far + near) * nf,   -1,
        0,          0,  2 * far * near * nf,  0
    ]);
}

// LookAt avec up fixe = (0,1,0), cible = origine
function mat4LookAt(ex, ey, ez) {
    var d  = Math.sqrt(ex*ex + ey*ey + ez*ez);
    // forward = normalize(-eye)
    var fx = -ex/d, fy = -ey/d, fz = -ez/d;
    // right = forward × up = (-fz, 0, fx), puis normaliser
    var rx = -fz, rz = fx;
    var rl = Math.sqrt(rx*rx + rz*rz);
    if (rl > 1e-10) { rx /= rl; rz /= rl; }
    // corrected up = right × forward  (ry = 0)
    var ux = -rz * fy;
    var uy =  rz * fx - rx * fz;
    var uz =  rx * fy;
    return new Float32Array([
        rx, ux, -fx, 0,
        0,  uy, -fy, 0,   // ry=0, sy=0
        rz, uz, -fz, 0,
        -(rx*ex + rz*ez),
        -(ux*ex + uy*ey + uz*ez),
          (fx*ex + fy*ey + fz*ez),
        1
    ]);
}

function mat4Mul(a, b) {
    var r = new Float32Array(16);
    for (var col = 0; col < 4; col++)
        for (var row = 0; row < 4; row++)
            for (var k = 0; k < 4; k++)
                r[row + col*4] += a[row + k*4] * b[k + col*4];
    return r;
}

// =============================================================
//  UTILITAIRES WEBGL
// =============================================================

function compileShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error("Shader:\n" + gl.getShaderInfoLog(s));
    return s;
}

function createProgram(vsSrc, fsSrc) {
    var p = gl.createProgram();
    gl.attachShader(p, compileShader(gl.VERTEX_SHADER,   vsSrc));
    gl.attachShader(p, compileShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw new Error("Program:\n" + gl.getProgramInfoLog(p));
    return p;
}

// Texture RGBA32F — data: Float32Array TEX*TEX*4, ou null
function createFloat32Tex(data) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX, TEX, 0, gl.RGBA, gl.FLOAT, data || null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return t;
}

function createFBO(tex) {
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    var st = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (st !== gl.FRAMEBUFFER_COMPLETE)
        throw new Error("FBO incomplet : 0x" + st.toString(16));
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return fb;
}

function createQuadVAO() {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
}

function createEmptyVAO() {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindVertexArray(null);
    return vao;
}

// =============================================================
//  INITIALISATION DES PARTICULES — sphère aléatoire
// =============================================================

function initParticles() {
    var posData = new Float32Array(TEX * TEX * 4);  // tout à 0 par défaut
    var velData = new Float32Array(TEX * TEX * 4);
    for (var i = 0; i < N; i++) {
        var theta = Math.random() * 2 * Math.PI;
        var phi   = Math.acos(2 * Math.random() - 1);
        var r     = RADIUS * Math.pow(Math.random(), 1.0/3.0);
        posData[i*4+0] = r * Math.sin(phi) * Math.cos(theta);
        posData[i*4+1] = r * Math.sin(phi) * Math.sin(theta);
        posData[i*4+2] = r * Math.cos(phi);
        posData[i*4+3] = MASS;
        velData[i*4+0] = (Math.random() - 0.5) * INIT_SPEED;
        velData[i*4+1] = (Math.random() - 0.5) * INIT_SPEED;
        velData[i*4+2] = (Math.random() - 0.5) * INIT_SPEED;
        velData[i*4+3] = 0;
    }
    return { pos: posData, vel: velData };
}

// =============================================================
//  COMPILATION
// =============================================================

var velProg    = createProgram(QUAD_VS, VEL_FS);
var posProg    = createProgram(QUAD_VS, POS_FS);
var scaleProg  = createProgram(QUAD_VS, SCALE_FS);
var renderProg = createProgram(RENDER_VS, RENDER_FS);
var quadVAO    = createQuadVAO();
var renderVAO  = createEmptyVAO();

var uLoc = {
    vel: {
        pos:      gl.getUniformLocation(velProg, "uPos"),
        vel:      gl.getUniformLocation(velProg, "uVel"),
        tex:      gl.getUniformLocation(velProg, "uTex"),
        N:        gl.getUniformLocation(velProg, "uN"),
        G:        gl.getUniformLocation(velProg, "uG"),
        dt:       gl.getUniformLocation(velProg, "uDT"),
        soft:     gl.getUniformLocation(velProg, "uSoft"),
        initMass: gl.getUniformLocation(velProg, "uInitMass"),
        initN:    gl.getUniformLocation(velProg, "uInitN"),
    },
    pos: {
        pos:  gl.getUniformLocation(posProg, "uPos"),
        vel:  gl.getUniformLocation(posProg, "uVel"),
        tex:  gl.getUniformLocation(posProg, "uTex"),
        N:    gl.getUniformLocation(posProg, "uN"),
        dt:   gl.getUniformLocation(posProg, "uDT"),
    },
    scale: {
        pos:   gl.getUniformLocation(scaleProg, "uPos"),
        tex:   gl.getUniformLocation(scaleProg, "uTex"),
        N:     gl.getUniformLocation(scaleProg, "uN"),
        initN: gl.getUniformLocation(scaleProg, "uInitN"),
        ratio: gl.getUniformLocation(scaleProg, "uRatio"),
    },
    ren: {
        pos:    gl.getUniformLocation(renderProg, "uPos"),
        vel:    gl.getUniformLocation(renderProg, "uVel"),
        mvp:    gl.getUniformLocation(renderProg, "uMVP"),
        tex:    gl.getUniformLocation(renderProg, "uTex"),
        initN:  gl.getUniformLocation(renderProg, "uInitN"),
        ps:     gl.getUniformLocation(renderProg, "uPointSize"),
        psP:    gl.getUniformLocation(renderProg, "uPointSizePlaced"),
        max:    gl.getUniformLocation(renderProg, "uMaxSpeed"),
    }
};

// =============================================================
//  TEXTURES + FBOs (ping-pong)
// =============================================================

var particles    = initParticles();
var posTex       = [createFloat32Tex(particles.pos), createFloat32Tex(null)];
var velTex       = [createFloat32Tex(particles.vel), createFloat32Tex(null)];
var posFBO       = [createFBO(posTex[0]), createFBO(posTex[1])];
var velFBO       = [createFBO(velTex[0]), createFBO(velTex[1])];
var cur          = 0;
var numParticles = N;

// =============================================================
//  CAMERA — orbite souris + scroll
//  Séparation clic / glisser : < 5px mouvement = clic → pose
// =============================================================

var cam = { theta: 0.4, phi: 0.3, dist: 20.0 };

(function() {
    var dragging = false;
    var startX = 0, startY = 0;
    var lastX  = 0, lastY  = 0;
    var DRAG_THRESHOLD = 5; // pixels

    canvas.addEventListener("mousedown", function(e) {
        dragging = true;
        startX = lastX = e.clientX;
        startY = lastY = e.clientY;
    });

    window.addEventListener("mousemove", function(e) {
        if (!dragging) return;
        cam.theta -= (e.clientX - lastX) * 0.005;
        cam.phi   += (e.clientY - lastY) * 0.005;
        cam.phi    = Math.max(-1.55, Math.min(1.55, cam.phi));
        lastX = e.clientX;
        lastY = e.clientY;
    });

    // Mouseup sur le canvas : distinguer clic et glisser
    canvas.addEventListener("mouseup", function(e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (Math.sqrt(dx*dx + dy*dy) < DRAG_THRESHOLD) {
            placeParticle(e.clientX, e.clientY);
        }
        dragging = false;
    });

    // Mouseup hors canvas (fin de drag sans placement)
    window.addEventListener("mouseup", function() { dragging = false; });

    canvas.addEventListener("wheel", function(e) {
        cam.dist *= 1 + e.deltaY * 0.001;
        cam.dist  = Math.max(0.5, Math.min(500, cam.dist));
        e.preventDefault();
    }, { passive: false });
})();

function getCamPos() {
    return {
        x: cam.dist * Math.cos(cam.phi) * Math.sin(cam.theta),
        y: cam.dist * Math.sin(cam.phi),
        z: cam.dist * Math.cos(cam.phi) * Math.cos(cam.theta)
    };
}

function getMVP() {
    var c    = getCamPos();
    var view = mat4LookAt(c.x, c.y, c.z);
    var proj = mat4Perspective(Math.PI / 3, canvas.width / canvas.height, 0.01, 10000);
    return mat4Mul(proj, view);
}

// =============================================================
//  PICKING 3D — rayon caméra → point monde
//
//  Pour placer une particule : on trace un rayon depuis la
//  caméra à travers le pixel cliqué, et on trouve le point du
//  rayon le plus proche de l'origine (centre de la scène).
// =============================================================

function getRay(screenX, screenY) {
    var ndcX = (screenX / canvas.width)  * 2.0 - 1.0;
    var ndcY = 1.0 - (screenY / canvas.height) * 2.0;

    var c = getCamPos();
    var ex = c.x, ey = c.y, ez = c.z;

    // forward = normalize(origine - œil)
    var d  = cam.dist;
    var fx = -ex/d, fy = -ey/d, fz = -ez/d;

    // right = forward × up(0,1,0) = (-fz, 0, fx), normalisé
    var rx = -fz, rz = fx;
    var rl = Math.sqrt(rx*rx + rz*rz);
    if (rl > 1e-10) { rx /= rl; rz /= rl; }

    // corrected up = right × forward  (ry=0)
    var ux = -rz * fy;
    var uy =  rz * fx - rx * fz;
    var uz =  rx * fy;

    // Direction du rayon en espace monde
    var h      = Math.tan(Math.PI / 6);   // tan(fovY/2) avec fovY=60°
    var aspect = canvas.width / canvas.height;
    var dirx   = fx + ndcX * h * aspect * rx + ndcY * h * ux;
    var diry   = fy                           + ndcY * h * uy;  // rx=0 pour ry
    var dirz   = fz + ndcX * h * aspect * rz + ndcY * h * uz;
    var dirl   = Math.sqrt(dirx*dirx + diry*diry + dirz*dirz);

    return {
        ox: ex,        oy: ey,        oz: ez,
        dx: dirx/dirl, dy: diry/dirl, dz: dirz/dirl
    };
}

// Point du rayon le plus proche de l'origine
function closestToOrigin(ray) {
    var t = Math.max(0, -(ray.ox*ray.dx + ray.oy*ray.dy + ray.oz*ray.dz));
    return [
        ray.ox + t * ray.dx,
        ray.oy + t * ray.dy,
        ray.oz + t * ray.dz
    ];
}

// =============================================================
//  AJOUT DE PARTICULE
// =============================================================

// Écriture d'un unique texel dans la texture courante via texSubImage2D.
// Nul besoin de lire ou re-uploader la texture entière.
function addParticle(x, y, z, mass, vx, vy, vz) {
    if (numParticles >= MAX_N) return;

    var i  = numParticles;
    var px = i % TEX;
    var py = Math.floor(i / TEX);

    gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, px, py, 1, 1,
        gl.RGBA, gl.FLOAT,
        new Float32Array([x, y, z, mass]));

    gl.bindTexture(gl.TEXTURE_2D, velTex[cur]);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, px, py, 1, 1,
        gl.RGBA, gl.FLOAT,
        new Float32Array([vx, vy, vz, Math.sqrt(vx*vx + vy*vy + vz*vz)]));

    gl.bindTexture(gl.TEXTURE_2D, null);

    numParticles++;
    updateCount();
}

// Lit les sliders du panel et pose la particule à la position 3D cliquée
function placeParticle(screenX, screenY) {
    var pos  = closestToOrigin(getRay(screenX, screenY));
    var mass = parseFloat(document.getElementById("sMass").value);
    var vx   = parseFloat(document.getElementById("sVx").value);
    var vy   = parseFloat(document.getElementById("sVy").value);
    var vz   = parseFloat(document.getElementById("sVz").value);
    addParticle(pos[0], pos[1], pos[2], mass, vx, vy, vz);
}

// =============================================================
//  PHYSIQUE GPU — un pas de simulation
// =============================================================

function physicsStep() {
    var nxt = 1 - cur;

    // 1. Nouvelles vitesses → velTex[nxt]
    gl.bindFramebuffer(gl.FRAMEBUFFER, velFBO[nxt]);
    gl.viewport(0, 0, TEX, TEX);
    gl.useProgram(velProg);
    gl.bindVertexArray(quadVAO);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, velTex[cur]);
    gl.uniform1i(uLoc.vel.pos,  0);
    gl.uniform1i(uLoc.vel.vel,  1);
    gl.uniform1i(uLoc.vel.tex,  TEX);
    gl.uniform1i(uLoc.vel.N,    numParticles);
    gl.uniform1f(uLoc.vel.G,    G);
    gl.uniform1f(uLoc.vel.dt,   DT);
    gl.uniform1f(uLoc.vel.soft, SOFTENING);
    gl.uniform1f(uLoc.vel.initMass, INIT_MASS);
    gl.uniform1i(uLoc.vel.initN,    N_INITIAL);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 2. Nouvelles positions → posTex[nxt]  (lit les vitesses fraîches)
    gl.bindFramebuffer(gl.FRAMEBUFFER, posFBO[nxt]);
    gl.useProgram(posProg);
    gl.bindVertexArray(quadVAO);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, velTex[nxt]);
    gl.uniform1i(uLoc.pos.pos, 0);
    gl.uniform1i(uLoc.pos.vel, 1);
    gl.uniform1i(uLoc.pos.tex, TEX);
    gl.uniform1i(uLoc.pos.N,   numParticles);
    gl.uniform1f(uLoc.pos.dt,  DT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    cur = nxt;
}

// =============================================================
//  RENDU
// =============================================================

var maxSpeed = 1.0;

function render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(renderProg);
    gl.bindVertexArray(renderVAO);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, velTex[cur]);
    gl.uniform1i(uLoc.ren.pos,   0);
    gl.uniform1i(uLoc.ren.vel,   1);
    gl.uniform1i(uLoc.ren.tex,   TEX);
    gl.uniform1i(uLoc.ren.initN, N_INITIAL);
    gl.uniform1f(uLoc.ren.ps,    POINT_SIZE);
    gl.uniform1f(uLoc.ren.psP,   POINT_SIZE_PLACED);
    gl.uniform1f(uLoc.ren.max,   maxSpeed);
    gl.uniformMatrix4fv(uLoc.ren.mvp, false, getMVP());

    // Additive blending : zones denses = plus lumineuses
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, numParticles);
    gl.disable(gl.BLEND);
}

// Readback d'un pixel pour estimer maxSpeed (coût négligeable : 1×1 pixel)
function updateMaxSpeed() {
    var buf = new Float32Array(4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, velFBO[cur]);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, buf);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (buf[3] > 0) maxSpeed = Math.max(buf[3] * 1.5, maxSpeed * 0.98);
}

// =============================================================
//  PANEL — sliders et bouton reset
// =============================================================

function linkSlider(inputId, displayId) {
    var input = document.getElementById(inputId);
    var disp  = document.getElementById(displayId);
    input.addEventListener("input", function() {
        disp.textContent = parseFloat(this.value).toFixed(1);
    });
}

linkSlider("sMass", "vMass");
linkSlider("sVx",   "vVx");
linkSlider("sVy",   "vVy");
linkSlider("sVz",   "vVz");

var sInitMass = document.getElementById("sInitMass");
var vInitMass = document.getElementById("vInitMass");
sInitMass.addEventListener("input", function() {
    INIT_MASS = parseFloat(this.value);
    vInitMass.textContent = INIT_MASS.toFixed(1);
});

// --- Slider rayon des particules initiales ---

var prevScale   = 1.0;
var sInitRadius = document.getElementById("sInitRadius");
var vInitRadius = document.getElementById("vInitRadius");

function applyScaleToInitial(ratio) {
    var nxt = 1 - cur;

    // Passe GPGPU : scale les positions initiales
    gl.bindFramebuffer(gl.FRAMEBUFFER, posFBO[nxt]);
    gl.viewport(0, 0, TEX, TEX);
    gl.useProgram(scaleProg);
    gl.bindVertexArray(quadVAO);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
    gl.uniform1i(uLoc.scale.pos,   0);
    gl.uniform1i(uLoc.scale.tex,   TEX);
    gl.uniform1i(uLoc.scale.N,     numParticles);
    gl.uniform1i(uLoc.scale.initN, N_INITIAL);
    gl.uniform1f(uLoc.scale.ratio, ratio);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Copier le résultat dans posTex[cur] pour garder pos/vel synchronisés
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, posFBO[nxt]);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, posFBO[cur]);
    gl.blitFramebuffer(0, 0, TEX, TEX, 0, 0, TEX, TEX, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

sInitRadius.addEventListener("input", function() {
    var newScale = parseFloat(this.value);
    if (prevScale > 0.001) {
        applyScaleToInitial(newScale / prevScale);
    }
    prevScale = newScale;
    vInitRadius.textContent = newScale.toFixed(2);
});

// --- Sliders taille des particules ---

var sInitSize  = document.getElementById("sInitSize");
var vInitSize  = document.getElementById("vInitSize");
sInitSize.addEventListener("input", function() {
    POINT_SIZE = parseFloat(this.value);
    vInitSize.textContent = POINT_SIZE.toFixed(1);
});

var sPlacedSize = document.getElementById("sPlacedSize");
var vPlacedSize = document.getElementById("vPlacedSize");
sPlacedSize.addEventListener("input", function() {
    POINT_SIZE_PLACED = parseFloat(this.value);
    vPlacedSize.textContent = POINT_SIZE_PLACED.toFixed(1);
});

var countNumEl  = document.getElementById("countNum");
var countMaxEl  = document.getElementById("countMax");
var countFillEl = document.getElementById("countFill");

function updateCount() {
    countNumEl.textContent  = numParticles;
    countMaxEl.textContent  = MAX_N;
    countFillEl.style.width = (numParticles / MAX_N * 100).toFixed(1) + "%";
}
updateCount();  // affichage initial

var btnPause = document.getElementById("btnPause");
btnPause.addEventListener("click", function() {
    paused = !paused;
    btnPause.textContent = paused ? "▶ Reprendre" : "⏸ Pause";
});

document.getElementById("btnReset").addEventListener("click", function() {
    var pd = initParticles();
    numParticles = N;
    cur = 0;

    // Re-uploader les données initiales dans le buffer 0
    gl.bindTexture(gl.TEXTURE_2D, posTex[0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX, TEX, 0, gl.RGBA, gl.FLOAT, pd.pos);
    gl.bindTexture(gl.TEXTURE_2D, velTex[0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TEX, TEX, 0, gl.RGBA, gl.FLOAT, pd.vel);
    gl.bindTexture(gl.TEXTURE_2D, null);

    INIT_MASS = 0.0;
    sInitMass.value = 0;
    vInitMass.textContent = "0.0";

    prevScale = 1.0;
    sInitRadius.value = 1;
    vInitRadius.textContent = "1.00";

    POINT_SIZE = 3.0;
    sInitSize.value = 3;
    vInitSize.textContent = "3.0";

    POINT_SIZE_PLACED = 6.0;
    sPlacedSize.value = 6;
    vPlacedSize.textContent = "6.0";

    paused = false;
    btnPause.textContent = "⏸ Pause";

    maxSpeed = 1.0;
    updateCount();
});

// =============================================================
//  BOUCLE PRINCIPALE + HUD
// =============================================================

var hud      = document.getElementById("hud");
var fpsTimer = 0;
var fpsCnt   = 0;
var frame    = 0;

var paused = false;

function loop(t) {
    requestAnimationFrame(loop);

    if (!paused) physicsStep();
    render();

    fpsCnt++;
    frame++;

    if (frame % 30 === 0) updateMaxSpeed();

    if (t - fpsTimer >= 1000) {
        hud.textContent =
            fpsCnt + " fps\n" +
            "TEX " + TEX + "×" + TEX;
        fpsCnt   = 0;
        fpsTimer = t;
    }
}

requestAnimationFrame(loop);