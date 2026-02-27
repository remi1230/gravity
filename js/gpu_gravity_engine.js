// ============================================================
// GPU Gravity Engine - Physique N-body sur GPU
//
// Architecture :
//   PHYSIQUE (GPU) :
//     Ping-pong de ProceduralTextures RGBA32F — le fragment
//     shader calcule les forces gravitationnelles entre toutes
//     les paires de particules (O(n²) parallélisé sur GPU).
//
//   RENDU (hybride GPU→CPU) :
//     Après chaque pas de physique, readPixels() async rapatrie
//     positions et vitesses → mise à jour des meshes Babylon.js.
//     → Évite le vertex texture sampling (peu fiable selon GPU).
//
//   INITIALISATION :
//     Si des meshes CPU existent (ajoutés via l'UI avec les
//     formes Cube, Carré, etc.), on les utilise comme conditions
//     initiales ET comme support de rendu.
//     Sinon, un super mesh points cloud est créé.
//
// Activation : touche 'G'
// ============================================================

var GPU_MAX_PARTICLES = 512;

// ============================================================
// SHADERS DE PHYSIQUE (GPGPU)
// ============================================================

// Mise à jour des vitesses : force N-body gravitationnelle
// Physique identique au CPU :
//   force += diff * mass_j / max(dist³, lim_newton)
//   newVel  = oldVel + force   (dt implicite = 1)
// copyMode = 1.0 : passthrough pour l'initialisation
BABYLON.Effect.ShadersStore["gpuGravVelocityFragmentShader"] = [
    "precision highp float;",
    "uniform sampler2D positionTexture;",
    "uniform sampler2D velocityTexture;",
    "uniform float N;",
    "uniform float dt;",
    "uniform float limNewton;",
    "uniform float invG;",
    "uniform float copyMode;",
    "varying vec2 vUV;",
    "void main() {",
    "    float idx = floor(vUV.x * N);",
    "    float myU = (idx + 0.5) / N;",
    "    vec4 myPos = texture2D(positionTexture, vec2(myU, 0.5));",
    "    vec4 myVel = texture2D(velocityTexture, vec2(myU, 0.5));",
    "    if(copyMode > 0.5) { gl_FragColor = myVel; return; }",
    "    vec3 force = vec3(0.0);",
    "    for(int j = 0; j < 512; j++) {",
    "        float jf = float(j);",
    "        if(jf >= N) break;",
    "        if(abs(jf - idx) < 0.5) continue;",
    "        float jU = (jf + 0.5) / N;",
    "        vec4 other = texture2D(positionTexture, vec2(jU, 0.5));",
    "        vec3 diff = other.xyz - myPos.xyz;",
    "        float dist = length(diff);",
    "        float dist3 = max(dist * dist * dist, limNewton);",
    "        force += diff * (other.w / dist3) * invG;",
    "    }",
    "    vec3 newVel = myVel.xyz + force;",
    "    gl_FragColor = vec4(newVel, length(newVel));",
    "}"
].join("\n");

// Mise à jour des positions : newPos = oldPos + newVel * dt
BABYLON.Effect.ShadersStore["gpuGravPositionFragmentShader"] = [
    "precision highp float;",
    "uniform sampler2D positionTexture;",
    "uniform sampler2D velocityTexture;",
    "uniform float N;",
    "uniform float dt;",
    "varying vec2 vUV;",
    "void main() {",
    "    float idx = floor(vUV.x * N);",
    "    float myU = (idx + 0.5) / N;",
    "    vec4 myPos = texture2D(positionTexture, vec2(myU, 0.5));",
    "    vec4 newVel = texture2D(velocityTexture, vec2(myU, 0.5));",
    "    vec3 newPos = myPos.xyz + newVel.xyz * dt;",
    "    gl_FragColor = vec4(newPos, myPos.w);",
    "}"
].join("\n");

// ============================================================
// Classe GPUGravityEngine
// ============================================================

function GPUGravityEngine(scene, engine) {
    this.scene  = scene;
    this.engine = engine;
    this.N      = 0;
    this.initialized = false;

    this.posTextures = [null, null];
    this.velTextures = [null, null];
    this.currentBuf  = -1; // -1 = RawTextures initiales

    this.initPosTex = null;
    this.initVelTex = null;

    // Meshes Babylon.js utilisés pour le rendu
    // null  → on crée un super mesh points cloud
    // array → meshes CPU existants pilotés par la physique GPU
    this.gpuMeshes = null;
    this.superMesh = null;

    // Buffers de readback (Float32Array alloués une fois)
    this._posReadBuf = null;
    this._velReadBuf = null;
}

// init(particles, gpuMeshes)
//   particles  : [{x,y,z,mass,vx,vy,vz}, ...]
//   gpuMeshes  : tableau de meshes Babylon.js existants (ou null)
GPUGravityEngine.prototype.init = function(particles, gpuMeshes) {
    if (this.initialized) this.dispose();

    this.N = Math.min(particles.length, GPU_MAX_PARTICLES);
    var N = this.N;

    this.gpuMeshes = gpuMeshes || null;

    var posData = new Float32Array(N * 4);
    var velData = new Float32Array(N * 4);
    for (var i = 0; i < N; i++) {
        posData[i*4]   = particles[i].x    || 0;
        posData[i*4+1] = particles[i].y    || 0;
        posData[i*4+2] = particles[i].z    || 0;
        posData[i*4+3] = particles[i].mass || 1;
        velData[i*4]   = particles[i].vx   || 0;
        velData[i*4+1] = particles[i].vy   || 0;
        velData[i*4+2] = particles[i].vz   || 0;
        velData[i*4+3] = 0;
    }

    this._posReadBuf = new Float32Array(N * 4);
    this._velReadBuf = new Float32Array(N * 4);

    this._initGPGPU(posData, velData);
    this._initRendering(particles);
    this.initialized = true;
};

// Crée les ProceduralTextures de ping-pong.
// Pas de render() ici : les shaders compilent en async.
GPUGravityEngine.prototype._initGPGPU = function(posData, velData) {
    var scene        = this.scene;
    var N            = this.N;
    var samplingMode = BABYLON.Texture.NEAREST_SAMPLINGMODE || 1;
    var floatType    = BABYLON.Engine.TEXTURETYPE_FLOAT || 1;

    this.initPosTex = BABYLON.RawTexture.CreateRGBATexture(
        posData, N, 1, scene, false, false, samplingMode, floatType
    );
    this.initVelTex = BABYLON.RawTexture.CreateRGBATexture(
        velData, N, 1, scene, false, false, samplingMode, floatType
    );

    var posA = new BABYLON.ProceduralTexture(
        "gpuPosA", {width: N, height: 1},
        "gpuGravPosition", scene, null, false, false, floatType
    );
    var posB = new BABYLON.ProceduralTexture(
        "gpuPosB", {width: N, height: 1},
        "gpuGravPosition", scene, null, false, false, floatType
    );
    var velA = new BABYLON.ProceduralTexture(
        "gpuVelA", {width: N, height: 1},
        "gpuGravVelocity", scene, null, false, false, floatType
    );
    var velB = new BABYLON.ProceduralTexture(
        "gpuVelB", {width: N, height: 1},
        "gpuGravVelocity", scene, null, false, false, floatType
    );

    [posA, posB, velA, velB].forEach(function(t) { t.refreshRate = -1; });

    this.posTextures[0] = posA;
    this.posTextures[1] = posB;
    this.velTextures[0] = velA;
    this.velTextures[1] = velB;
    this.currentBuf = -1;
};

// Prépare le rendu :
//   - Si gpuMeshes fournis → on les utilise directement
//   - Sinon → crée un super mesh PointsCloud mis à jour par CPU
GPUGravityEngine.prototype._initRendering = function(particles) {
    if (this.gpuMeshes && this.gpuMeshes.length > 0) {
        // Les meshes existants sont déjà positionnés
        return;
    }

    // Création d'un super mesh points cloud
    var N     = this.N;
    var scene = this.scene;

    var positions = [];
    var colors    = [];
    var indices   = [];

    for (var i = 0; i < N; i++) {
        positions.push(particles[i].x || 0, particles[i].y || 0, particles[i].z || 0);
        colors.push(0, 0, 1, 1); // Bleu initial
        indices.push(i);
    }

    var mesh = new BABYLON.Mesh("gpuSuperMesh", scene);
    var vd   = new BABYLON.VertexData();
    vd.positions = positions;
    vd.colors    = colors;
    vd.indices   = indices;
    vd.applyToMesh(mesh, true); // updatable = true

    var mat = new BABYLON.StandardMaterial("gpuPointsMat", scene);
    mat.pointsCloud       = true;
    mat.pointSize         = glo.gpu.pointSize;
    mat.disableLighting   = true;
    mat.vertexColorEnabled = true;
    mesh.material = mat;

    this.superMesh = mesh;
};

// Pas de physique GPU + readback asynchrone des résultats
GPUGravityEngine.prototype.step = function() {
    var usingInit = (this.currentBuf === -1);
    var next      = usingInit ? 0 : (1 - this.currentBuf);

    var posCur  = usingInit ? this.initPosTex : this.posTextures[this.currentBuf];
    var velCur  = usingInit ? this.initVelTex : this.velTextures[this.currentBuf];
    var posNext = this.posTextures[next];
    var velNext = this.velTextures[next];

    // Attendre la compilation des shaders
    if (!velNext.isReady() || !posNext.isReady()) return;

    var N         = this.N;
    var dt        = glo.temps;
    var limNewton = Math.max(0.0001, glo.lim_newton);
    var invG      = glo.mode.inv_g ? -1.0 : 1.0;

    // 1. Nouvelles vitesses
    velNext.setTexture("positionTexture", posCur);
    velNext.setTexture("velocityTexture",  velCur);
    velNext.setFloat("N",          N);
    velNext.setFloat("dt",         dt);
    velNext.setFloat("limNewton",  limNewton);
    velNext.setFloat("invG",       invG);
    velNext.setFloat("copyMode",   0.0);
    velNext.render();

    // 2. Nouvelles positions (avec les nouvelles vitesses)
    posNext.setTexture("positionTexture", posCur);
    posNext.setTexture("velocityTexture",  velNext);
    posNext.setFloat("N",  N);
    posNext.setFloat("dt", dt);
    posNext.render();

    this.currentBuf = next;

    if (usingInit && this.initPosTex) {
        this.initPosTex.dispose(); this.initPosTex = null;
        this.initVelTex.dispose(); this.initVelTex = null;
    }

    // Readback asynchrone → mise à jour du rendu
    var self       = this;
    var posBuf     = this._posReadBuf;
    var velBuf     = this._velReadBuf;
    var posPromise = posNext.readPixels(0, 0, posBuf, false);
    var velPromise = velNext.readPixels(0, 0, velBuf, false);

    if (posPromise && velPromise) {
        Promise.all([posPromise, velPromise]).then(function(res) {
            if (!self.initialized) return;
            self._applyReadback(res[0], res[1]);
        });
    }
};

// Applique les données GPU aux meshes de rendu
GPUGravityEngine.prototype._applyReadback = function(posData, velData) {
    if (!this.initialized) return;

    var N          = this.N;
    var speedScale = 1.0 / Math.max(0.001, glo.modulation * 0.005);

    var posF = (posData instanceof Float32Array) ? posData : new Float32Array(posData);
    var velF = (velData instanceof Float32Array) ? velData : new Float32Array(velData);

    if (this.gpuMeshes && this.gpuMeshes.length > 0) {
        // --- Mise à jour des meshes CPU existants ---
        var list = this.gpuMeshes;
        for (var i = 0; i < N; i++) {
            var m = list[i];
            if (!m) continue;
            var x = posF[i*4], y = posF[i*4+1], z = posF[i*4+2];
            m.virtual_x = x; m.virtual_y = y; m.virtual_z = z;
            m.position.copyFromFloats(x, y, z);
            m.z_vx    = velF[i*4];
            m.z_vy    = velF[i*4+1];
            m.z_vz    = velF[i*4+2];
            m.vitesse = velF[i*4+3]; // |v| stocké dans le canal alpha
        }
        // Coloriage basé sur la vitesse (fonction existante)
        color(list);

    } else if (this.superMesh) {
        // --- Mise à jour du super mesh points cloud ---
        var meshPos = this.superMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        var meshCol = this.superMesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
        if (!meshPos || !meshCol) return;

        for (var i = 0; i < N; i++) {
            meshPos[i*3]   = posF[i*4];
            meshPos[i*3+1] = posF[i*4+1];
            meshPos[i*3+2] = posF[i*4+2];

            var c = _gpuSpeedToColor(velF[i*4+3] * speedScale);
            meshCol[i*4]   = c.r;
            meshCol[i*4+1] = c.g;
            meshCol[i*4+2] = c.b;
            meshCol[i*4+3] = 1.0;
        }

        this.superMesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, meshPos);
        this.superMesh.updateVerticesData(BABYLON.VertexBuffer.ColorKind,    meshCol);
    }
};

GPUGravityEngine.prototype.dispose = function() {
    if (this.superMesh)  { this.superMesh.dispose();  this.superMesh = null; }
    if (this.initPosTex) { this.initPosTex.dispose(); this.initPosTex = null; }
    if (this.initVelTex) { this.initVelTex.dispose(); this.initVelTex = null; }
    this.posTextures.forEach(function(t) { if (t) t.dispose(); });
    this.velTextures.forEach(function(t) { if (t) t.dispose(); });
    this.posTextures = [null, null];
    this.velTextures = [null, null];
    this.gpuMeshes   = null;
    this.currentBuf  = -1;
    this.initialized = false;
};

// ============================================================
// Dégradé de couleur CPU : bleu (lent) → rouge → blanc (rapide)
// Même palette que l'ancien shader fragment
// ============================================================
function _gpuSpeedToColor(t) {
    t = Math.max(0, Math.min(1, t));
    var r, g, b;
    if      (t < 0.2) { var f = t * 5;       r = 0; g = f * 0.5;       b = 1; }
    else if (t < 0.4) { var f = (t-0.2)*5;   r = 0; g = 0.5+f*0.5;    b = 1-f; }
    else if (t < 0.6) { var f = (t-0.4)*5;   r = f; g = 1;             b = 0; }
    else if (t < 0.8) { var f = (t-0.6)*5;   r = 1; g = 1-f*0.7;      b = 0; }
    else              { var f = (t-0.8)*5;   r = 1; g = 0.3+f*0.7;    b = f; }
    return { r: r, g: g, b: b };
}

// ============================================================
// Génération de particules initiales (sphère aléatoire)
// ============================================================
function generateGPUParticles(N, opts) {
    opts = opts || {};
    var radius    = opts.radius       !== undefined ? opts.radius       : glo.gpu.radius;
    var mass      = opts.mass         !== undefined ? opts.mass         : glo.masse_particules;
    var massVar   = opts.massVar      !== undefined ? opts.massVar      : glo.var_masse;
    var initSpeed = opts.initialSpeed !== undefined ? opts.initialSpeed : glo.gpu.initialSpeed;
    var particles = [];

    for (var i = 0; i < N; i++) {
        var theta = Math.random() * 2 * Math.PI;
        var phi   = Math.acos(2 * Math.random() - 1);
        var r     = radius * Math.pow(Math.random(), 1.0/3.0);
        var x = r * Math.sin(phi) * Math.cos(theta);
        var y = r * Math.sin(phi) * Math.sin(theta);
        var z = r * Math.cos(phi);

        var m = mass * (1 + (Math.random() - 0.5) * massVar * 0.5);
        m = Math.max(0.001, m);

        particles.push({
            x: x, y: y, z: z, mass: m,
            vx: (Math.random()-0.5)*initSpeed,
            vy: (Math.random()-0.5)*initSpeed,
            vz: (Math.random()-0.5)*initSpeed
        });
    }
    return particles;
}

// ============================================================
// Instance globale + contrôle du mode GPU
// ============================================================
var gpuGravityEngine = null;

// Active le mode GPU.
// Si des meshes CPU existent (formes ajoutées via l'UI),
// on les utilise comme conditions initiales ET comme rendu.
// Sinon, un super mesh points cloud est créé.
function initGPUMode() {
    if (!glo.scene) return;

    var initialParticles, gpuMeshes;

    if (meshes.length > 0) {
        // Lire les conditions initiales depuis les meshes existants
        var n = Math.min(meshes.length, GPU_MAX_PARTICLES);
        initialParticles = [];
        for (var i = 0; i < n; i++) {
            var m = meshes[i];
            initialParticles.push({
                x:    m.virtual_x !== undefined ? m.virtual_x : (m.position ? m.position.x : 0),
                y:    m.virtual_y !== undefined ? m.virtual_y : (m.position ? m.position.y : 0),
                z:    m.virtual_z !== undefined ? m.virtual_z : (m.position ? m.position.z : 0),
                mass: m.z_masse   || glo.masse_particules,
                vx:   m.z_vx      || 0,
                vy:   m.z_vy      || 0,
                vz:   m.z_vz      || 0
            });
        }
        // Passer les meshes existants : GPU pilote leur position
        gpuMeshes = meshes.slice(0, n);
    } else {
        // Aucun mesh : générer des particules + super mesh
        var n = Math.min(glo.gpu.N, GPU_MAX_PARTICLES);
        initialParticles = generateGPUParticles(n);
        gpuMeshes = null;
    }

    if (!gpuGravityEngine) {
        gpuGravityEngine = new GPUGravityEngine(glo.scene, glo.scene.getEngine());
    } else {
        gpuGravityEngine.dispose();
    }

    gpuGravityEngine.init(initialParticles, gpuMeshes);
    glo.mode.gpu = true;
    console.log("[GPU] Mode GPU activé — " + initialParticles.length + " particules");
}

function stopGPUMode() {
    glo.mode.gpu = false;
    if (gpuGravityEngine) {
        gpuGravityEngine.dispose();
    }
    // Restaurer la visibilité des meshes CPU si nécessaire
    for (var i = 0; i < meshes.length; i++) {
        meshes[i].isVisible = true;
    }
    console.log("[GPU] Mode GPU désactivé");
}

function toggleGPUMode() {
    if (glo.mode.gpu) { stopGPUMode(); } else { initGPUMode(); }
}

window.addEventListener("keydown", function(e) {
    if ((e.key === "g" || e.key === "G") && !e.ctrlKey && !e.altKey && !e.metaKey) {
        toggleGPUMode();
    }
});
