"use strict";

// =============================================================
//  CONFIG — modifier ces valeurs pour les tests
// =============================================================

var N          = 256;    // Nombre de particules (changer et recharger)
var MASS       = 1.0;    // Masse de chaque particule
var G          = 1.0;    // Constante gravitationnelle
var DT         = 0.016;  // Pas de temps
var SOFTENING  = 0.5;    // Adoucissement (évite la division par zéro)
var POINT_SIZE = 3.0;    // Taille des points en pixels
var RADIUS     = 8.0;    // Rayon de la distribution initiale (sphère)
var INIT_SPEED = 0.0;    // Vitesse initiale (0 = repos)

// =============================================================
//  CANVAS + WEBGL 2
// =============================================================

var canvas = document.getElementById("c");
var gl     = canvas.getContext("webgl2");

if (!gl) {
    document.body.innerHTML = "<p style='color:red;padding:20px'>WebGL 2 requis</p>";
    throw new Error("WebGL2 non disponible");
}

// Nécessaire pour rendre dans des textures RGBA32F
if (!gl.getExtension("EXT_color_buffer_float")) {
    console.warn("[GPU] EXT_color_buffer_float non disponible — risque d'erreur FBO");
}

function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resize);
resize();

// =============================================================
//  LAYOUT DES TEXTURES
//  Les N particules sont stockées dans une texture carrée.
//  Particule i → pixel (i % TEX, i / TEX)
// =============================================================

var TEX = Math.ceil(Math.sqrt(N));  // Côté de la texture en pixels

// =============================================================
//  SHADERS GLSL ES 3.0
// =============================================================

// Vertex shader partagé pour les quads de physique GPGPU.
// layout(location=0) garantit que l'attribut est toujours à l'emplacement 0.
var QUAD_VS = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Fragment shader — mise à jour des VITESSES
// Pour chaque particule i : somme des forces gravitationnelles de toutes les j ≠ i.
// La borne de la boucle est injectée comme constante GLSL via le template JS (${N}).
var VEL_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;     // RGBA : x  y  z  masse
uniform sampler2D uVel;     // RGBA : vx vy vz |v|
uniform int       uTex;     // Côté de la texture
uniform float     uG;
uniform float     uDT;
uniform float     uSoft;    // Adoucissement

out vec4 outColor;

void main() {
    ivec2 c = ivec2(gl_FragCoord.xy);
    int   i = c.y * uTex + c.x;
    if (i >= ${N}) { outColor = vec4(0.0); return; }

    vec4 p   = texelFetch(uPos, c, 0);
    vec4 v   = texelFetch(uVel, c, 0);
    vec3 acc = vec3(0.0);

    for (int j = 0; j < ${N}; j++) {
        if (j == i) continue;
        ivec2 jc   = ivec2(j % uTex, j / uTex);
        vec4  pj   = texelFetch(uPos, jc, 0);
        vec3  d    = pj.xyz - p.xyz;
        float r2   = dot(d, d) + uSoft * uSoft;
        float inv  = inversesqrt(r2);   // 1 / sqrt(r²)
        float inv3 = inv * inv * inv;   // 1 / r³
        acc += d * pj.w * inv3 * uG;
    }

    vec3 nv  = v.xyz + acc * uDT;
    outColor = vec4(nv, length(nv));    // alpha = |v| (vitesse scalaire)
}`;

// Fragment shader — mise à jour des POSITIONS
// newPos = oldPos + newVel * dt
var POS_FS = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;
uniform sampler2D uVel;
uniform int       uTex;
uniform float     uDT;

out vec4 outColor;

void main() {
    ivec2 c = ivec2(gl_FragCoord.xy);
    int   i = c.y * uTex + c.x;
    if (i >= ${N}) { outColor = vec4(0.0); return; }

    vec4 p   = texelFetch(uPos, c, 0);
    vec4 v   = texelFetch(uVel, c, 0);
    outColor = vec4(p.xyz + v.xyz * uDT, p.w);  // w = masse (inchangée)
}`;

// Vertex shader de rendu
// gl_VertexID donne l'index de la particule → lookup dans la texture de positions.
// Aucun vertex buffer nécessaire pour les positions.
var RENDER_VS = `#version 300 es
precision highp float;
precision highp sampler2D;

uniform sampler2D uPos;
uniform sampler2D uVel;
uniform mat4      uMVP;
uniform int       uTex;
uniform float     uPointSize;

out float vSpeed;

void main() {
    int   i = gl_VertexID;
    ivec2 c = ivec2(i % uTex, i / uTex);
    vec4  p = texelFetch(uPos, c, 0);
    vec4  v = texelFetch(uVel, c, 0);

    vSpeed       = v.w;                              // |v| (canal alpha)
    gl_Position  = uMVP * vec4(p.xyz, 1.0);
    gl_PointSize = uPointSize;
}`;

// Fragment shader de rendu
// Dégradé de couleur selon la vitesse : bleu (lent) → rouge → blanc (rapide)
// Chaque point est rendu comme un disque (les coins sont écartés).
var RENDER_FS = `#version 300 es
precision highp float;

in  float vSpeed;
uniform float uMaxSpeed;

out vec4 outColor;

void main() {
    // Discard les coins → cercle parfait
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    if (dot(uv, uv) > 1.0) discard;

    float t = clamp(vSpeed / max(uMaxSpeed, 0.001), 0.0, 1.0);
    vec3  c;
    if      (t < 0.25) { float f = t * 4.0;        c = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), f); }
    else if (t < 0.50) { float f = (t - 0.25)*4.0; c = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), f); }
    else if (t < 0.75) { float f = (t - 0.50)*4.0; c = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), f); }
    else               { float f = (t - 0.75)*4.0; c = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 1.0), f); }

    outColor = vec4(c, 1.0);
}`;

// =============================================================
//  MATHS — matrices 4×4 column-major (convention WebGL/OpenGL)
// =============================================================

// Projection perspective standard
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

// LookAt (up fixe = Y)
function mat4LookAt(ex, ey, ez, tx, ty, tz) {
    // forward = normalize(target - eye)
    var fx = tx - ex, fy = ty - ey, fz = tz - ez;
    var fl = Math.sqrt(fx*fx + fy*fy + fz*fz);
    fx /= fl; fy /= fl; fz /= fl;

    // right = normalize(forward × up)  où up = (0,1,0)
    // (f.x, f.y, f.z) × (0,1,0) = (-f.z, 0, f.x)
    var sx = -fz, sy = 0, sz = fx;
    var sl = Math.sqrt(sx*sx + sz*sz);
    if (sl < 1e-10) { sx = 1; sz = 0; } else { sx /= sl; sz /= sl; }

    // corrected up = right × forward (= s × f, puisque f = forward ici)
    var ux = sy * fz - sz * fy;
    var uy = sz * fx - sx * fz;
    var uz = sx * fy - sy * fx;

    return new Float32Array([
        sx,  ux, -fx, 0,
        sy,  uy, -fy, 0,
        sz,  uz, -fz, 0,
        -(sx*ex + sy*ey + sz*ez),
        -(ux*ex + uy*ey + uz*ez),
          (fx*ex + fy*ey + fz*ez),
        1
    ]);
}

// Multiplication de deux matrices 4×4 column-major : résultat = a * b
function mat4Mul(a, b) {
    var r = new Float32Array(16);
    for (var col = 0; col < 4; col++)
        for (var row = 0; row < 4; row++)
            for (var k = 0; k < 4; k++)
                r[row + col * 4] += a[row + k * 4] * b[k + col * 4];
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

// Texture RGBA32F (float 32 bits par canal)
// data : Float32Array de taille TEX*TEX*4, ou null (texture vide)
function createFloat32Tex(data) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA32F,
        TEX, TEX, 0,
        gl.RGBA, gl.FLOAT,
        data || null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return t;
}

// FBO attaché à une texture RGBA32F (pour le rendu GPGPU)
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

// VAO pour un quad plein-écran [-1,1]² (2 triangles en triangle strip)
// Attribut fixé à location 0 → compatible avec tous les programmes physique
function createQuadVAO() {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return vao;
}

// VAO vide pour le rendu des particules (positions via gl_VertexID)
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
    // TEX*TEX texels par texture, 4 floats par texel
    var posData = new Float32Array(TEX * TEX * 4);
    var velData = new Float32Array(TEX * TEX * 4);

    for (var i = 0; i < N; i++) {
        var theta = Math.random() * 2 * Math.PI;
        var phi   = Math.acos(2 * Math.random() - 1);
        var r     = RADIUS * Math.pow(Math.random(), 1.0 / 3.0); // distribution volumique

        posData[i * 4 + 0] = r * Math.sin(phi) * Math.cos(theta); // x
        posData[i * 4 + 1] = r * Math.sin(phi) * Math.sin(theta); // y
        posData[i * 4 + 2] = r * Math.cos(phi);                   // z
        posData[i * 4 + 3] = MASS;                                 // masse

        velData[i * 4 + 0] = (Math.random() - 0.5) * INIT_SPEED;  // vx
        velData[i * 4 + 1] = (Math.random() - 0.5) * INIT_SPEED;  // vy
        velData[i * 4 + 2] = (Math.random() - 0.5) * INIT_SPEED;  // vz
        velData[i * 4 + 3] = 0;                                    // |v|
    }
    return { pos: posData, vel: velData };
}

// =============================================================
//  COMPILATION
// =============================================================

var velProg    = createProgram(QUAD_VS, VEL_FS);
var posProg    = createProgram(QUAD_VS, POS_FS);
var renderProg = createProgram(RENDER_VS, RENDER_FS);
var quadVAO    = createQuadVAO();
var renderVAO  = createEmptyVAO();

// Uniform locations — pré-cachées pour éviter les lookups dans la boucle
var uLoc = {
    vel: {
        pos:  gl.getUniformLocation(velProg, "uPos"),
        vel:  gl.getUniformLocation(velProg, "uVel"),
        tex:  gl.getUniformLocation(velProg, "uTex"),
        G:    gl.getUniformLocation(velProg, "uG"),
        dt:   gl.getUniformLocation(velProg, "uDT"),
        soft: gl.getUniformLocation(velProg, "uSoft"),
    },
    pos: {
        pos:  gl.getUniformLocation(posProg, "uPos"),
        vel:  gl.getUniformLocation(posProg, "uVel"),
        tex:  gl.getUniformLocation(posProg, "uTex"),
        dt:   gl.getUniformLocation(posProg, "uDT"),
    },
    ren: {
        pos:  gl.getUniformLocation(renderProg, "uPos"),
        vel:  gl.getUniformLocation(renderProg, "uVel"),
        mvp:  gl.getUniformLocation(renderProg, "uMVP"),
        tex:  gl.getUniformLocation(renderProg, "uTex"),
        ps:   gl.getUniformLocation(renderProg, "uPointSize"),
        max:  gl.getUniformLocation(renderProg, "uMaxSpeed"),
    }
};

// =============================================================
//  TEXTURES + FBOs (ping-pong)
// =============================================================

var particles = initParticles();
var posTex    = [createFloat32Tex(particles.pos), createFloat32Tex(null)];
var velTex    = [createFloat32Tex(particles.vel), createFloat32Tex(null)];
var posFBO    = [createFBO(posTex[0]), createFBO(posTex[1])];
var velFBO    = [createFBO(velTex[0]), createFBO(velTex[1])];
var cur       = 0;  // index du buffer courant (0 ou 1)

// =============================================================
//  CAMERA — orbite souris + scroll
// =============================================================

var cam = { theta: 0.4, phi: 0.3, dist: 20.0 };

(function() {
    var drag = false, mx = 0, my = 0;

    canvas.addEventListener("mousedown", function(e) {
        drag = true; mx = e.clientX; my = e.clientY;
    });
    window.addEventListener("mouseup", function() { drag = false; });
    window.addEventListener("mousemove", function(e) {
        if (!drag) return;
        cam.theta -= (e.clientX - mx) * 0.005;
        cam.phi   -= (e.clientY - my) * 0.005;
        cam.phi    = Math.max(-1.55, Math.min(1.55, cam.phi));
        mx = e.clientX; my = e.clientY;
    });
    canvas.addEventListener("wheel", function(e) {
        cam.dist *= 1 + e.deltaY * 0.001;
        cam.dist  = Math.max(1, Math.min(500, cam.dist));
        e.preventDefault();
    }, { passive: false });
})();

function getMVP() {
    var ex = cam.dist * Math.cos(cam.phi) * Math.sin(cam.theta);
    var ey = cam.dist * Math.sin(cam.phi);
    var ez = cam.dist * Math.cos(cam.phi) * Math.cos(cam.theta);
    var view = mat4LookAt(ex, ey, ez, 0, 0, 0);
    var proj = mat4Perspective(Math.PI / 3, canvas.width / canvas.height, 0.01, 10000);
    return mat4Mul(proj, view);
}

// =============================================================
//  PAS DE PHYSIQUE GPU
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
    gl.uniform1f(uLoc.vel.G,    G);
    gl.uniform1f(uLoc.vel.dt,   DT);
    gl.uniform1f(uLoc.vel.soft, SOFTENING);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // 2. Nouvelles positions → posTex[nxt]  (on utilise les vitesses fraîchement calculées)
    gl.bindFramebuffer(gl.FRAMEBUFFER, posFBO[nxt]);
    gl.useProgram(posProg);
    gl.bindVertexArray(quadVAO);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, velTex[nxt]);
    gl.uniform1i(uLoc.pos.pos, 0);
    gl.uniform1i(uLoc.pos.vel, 1);
    gl.uniform1i(uLoc.pos.tex, TEX);
    gl.uniform1f(uLoc.pos.dt,  DT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    cur = nxt;
}

// =============================================================
//  RENDU DES PARTICULES
// =============================================================

var maxSpeed = 1.0;  // Adapté périodiquement via readback d'un pixel

function render() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(renderProg);
    gl.bindVertexArray(renderVAO);

    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, posTex[cur]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, velTex[cur]);
    gl.uniform1i(uLoc.ren.pos, 0);
    gl.uniform1i(uLoc.ren.vel, 1);
    gl.uniform1i(uLoc.ren.tex, TEX);
    gl.uniform1f(uLoc.ren.ps,  POINT_SIZE);
    gl.uniform1f(uLoc.ren.max, maxSpeed);
    gl.uniformMatrix4fv(uLoc.ren.mvp, false, getMVP());

    // Additive blending : les zones denses brillent davantage
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, N);
    gl.disable(gl.BLEND);
}

// Readback d'un seul pixel pour estimer maxSpeed (1×1 = quasi instantané)
function updateMaxSpeed() {
    var buf = new Float32Array(4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, velFBO[cur]);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, buf);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (buf[3] > 0) maxSpeed = Math.max(buf[3] * 1.5, maxSpeed * 0.98);
}

// =============================================================
//  BOUCLE PRINCIPALE + HUD
// =============================================================

var hud      = document.getElementById("hud");
var fpsTimer = 0;
var fpsCnt   = 0;
var frame    = 0;

function loop(t) {
    requestAnimationFrame(loop);

    physicsStep();
    render();

    fpsCnt++;
    frame++;

    // Mettre à jour maxSpeed toutes les 30 frames
    if (frame % 30 === 0) updateMaxSpeed();

    // Mettre à jour l'affichage HUD chaque seconde
    if (t - fpsTimer >= 1000) {
        hud.textContent =
            "N = " + N + "\n" +
            "fps = " + fpsCnt + "\n" +
            "TEX = " + TEX + "×" + TEX + "\n" +
            "maxSpeed ≈ " + maxSpeed.toFixed(2);
        fpsCnt  = 0;
        fpsTimer = t;
    }
}

requestAnimationFrame(loop);
