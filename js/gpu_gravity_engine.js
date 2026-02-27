// ============================================================
// GPU Gravity Engine - Simulation N-body 100% GPU
//
// Architecture :
//   - GPGPU avec ping-pong de ProceduralTextures RGBA32F
//     (posA/posB pour positions, velA/velB pour vitesses)
//   - Un "super mesh" avec N vertices tous à (0,0,0)
//   - Vertex shader : lit la texture de positions pour
//     déplacer chaque vertex vers la bonne position
//   - Fragment shader : couleur selon la vitesse (bleu→rouge)
//
// Le problème N-body est résolu dans le fragment shader
// de physique : pour chaque particule i, on boucle sur
// toutes les j pour accumuler les forces gravitationnelles.
// C'est O(n²) mais entièrement parallélisé sur le GPU.
//
// Activation : touche 'G' ou appel direct à initGPUMode()
// ============================================================

var GPU_MAX_PARTICLES = 512; // Limite de la boucle GLSL

// ============================================================
// SHADERS - Physique (GPGPU)
// ============================================================

// --- Shader de mise à jour des vitesses ---
// Pour chaque particule i : calcule la force gravitationnelle
// exercée par toutes les autres particules j, puis met à jour
// la vitesse.  Correspond exactement à la physique CPU :
//   ax += dist_x * mass_j / max(dist^3, lim_newton)
//   vx += ax  (pas de temps implicite = 1, comme le CPU)
// Le uniform "copyMode" permet l'initialisation sans physique.
BABYLON.Effect.ShadersStore["gpuGravVelocityFragmentShader"] = [
    "precision highp float;",
    "",
    "uniform sampler2D positionTexture;", // RGBA : x, y, z, masse
    "uniform sampler2D velocityTexture;", // RGBA : vx, vy, vz, |v|
    "uniform float N;",                   // Nombre de particules
    "uniform float dt;",                  // Inutilisé ici (héritage)
    "uniform float limNewton;",           // glo.lim_newton : min dist^3
    "uniform float invG;",                // +1.0 ou -1.0 (inverse G)
    "uniform float copyMode;",            // 1.0 = recopie sans physique
    "",
    "varying vec2 vUV;",
    "",
    "void main() {",
    "    float idx = floor(vUV.x * N);",
    "    float myU = (idx + 0.5) / N;",
    "",
    "    vec4 myPos = texture2D(positionTexture, vec2(myU, 0.5));",
    "    vec4 myVel = texture2D(velocityTexture, vec2(myU, 0.5));",
    "",
    "    // Mode recopie pour l'initialisation",
    "    if(copyMode > 0.5) {",
    "        gl_FragColor = myVel;",
    "        return;",
    "    }",
    "",
    "    vec3 force = vec3(0.0);",
    "",
    "    // Boucle N-body : accumulation des forces",
    "    for(int j = 0; j < 512; j++) {",
    "        float jf = float(j);",
    "        if(jf >= N) break;",
    "        if(abs(jf - idx) < 0.5) continue;", // Ignorer soi-même
    "",
    "        float jU = (jf + 0.5) / N;",
    "        vec4 other = texture2D(positionTexture, vec2(jU, 0.5));",
    "",
    "        vec3 diff = other.xyz - myPos.xyz;",
    "        float dist = length(diff);",
    "        float dist3 = max(dist * dist * dist, limNewton);",
    "        force += diff * (other.w / dist3) * invG;",
    "    }",
    "",
    "    // Mise à jour vitesse (même formule que CPU : v += force)",
    "    vec3 newVel = myVel.xyz + force;",
    "    gl_FragColor = vec4(newVel, length(newVel));",
    "}"
].join("\n");

// --- Shader de mise à jour des positions ---
// newPos = oldPos + newVel * dt  (dt = glo.temps, comme le CPU)
BABYLON.Effect.ShadersStore["gpuGravPositionFragmentShader"] = [
    "precision highp float;",
    "",
    "uniform sampler2D positionTexture;",
    "uniform sampler2D velocityTexture;", // Nouvelle vitesse (déjà calculée)
    "uniform float N;",
    "uniform float dt;",                  // glo.temps
    "",
    "varying vec2 vUV;",
    "",
    "void main() {",
    "    float idx = floor(vUV.x * N);",
    "    float myU = (idx + 0.5) / N;",
    "",
    "    vec4 myPos = texture2D(positionTexture, vec2(myU, 0.5));",
    "    vec4 newVel = texture2D(velocityTexture, vec2(myU, 0.5));",
    "",
    "    vec3 newPos = myPos.xyz + newVel.xyz * dt;",
    "    gl_FragColor = vec4(newPos, myPos.w);", // Conserver la masse
    "}"
].join("\n");

// ============================================================
// SHADERS - Rendu du super mesh
// ============================================================

// --- Vertex shader ---
// Tous les vertices du super mesh sont à (0,0,0).
// Ce shader lit la texture de positions pour déplacer chaque
// vertex vers la bonne position dans l'espace 3D.
// gl_PointSize permet d'ajuster la taille en fonction de la masse.
BABYLON.Effect.ShadersStore["gpuGravParticleVertexShader"] = [
    "attribute vec3 position;",        // Toujours (0,0,0)
    "attribute float particleIndex;",  // Index 0..N-1
    "",
    "uniform mat4 viewProjection;",    // Matrice caméra (fournie par Babylon)
    "uniform float N;",
    "uniform float pointSize;",
    "uniform sampler2D positionTexture;",
    "",
    "varying float vIndex;",
    "",
    "void main() {",
    "    float u = (particleIndex + 0.5) / N;",
    "    vec4 pData = texture2D(positionTexture, vec2(u, 0.5));",
    "",
    "    // Positionner le vertex à la position GPU calculée",
    "    gl_Position = viewProjection * vec4(pData.xyz, 1.0);",
    "",
    "    // Taille du point sprite (proportionnelle à sqrt(masse))",
    "    float sz = pointSize * sqrt(pData.w) * 3.0;",
    "    gl_PointSize = clamp(sz, 2.0, 64.0);",
    "",
    "    vIndex = particleIndex;",
    "}"
].join("\n");

// --- Fragment shader ---
// Colorie chaque particule selon sa vitesse avec un dégradé :
//   bleu (lent) → cyan → vert → jaune → orange → rouge → blanc (rapide)
// Le point sprite est rendu comme un disque (avec bords adoucis).
BABYLON.Effect.ShadersStore["gpuGravParticleFragmentShader"] = [
    "precision highp float;",
    "",
    "uniform sampler2D velocityTexture;",
    "uniform float N;",
    "uniform float speedScale;",
    "",
    "varying float vIndex;",
    "",
    "vec3 speedToColor(float t) {",
    "    if(t < 0.2) return mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 0.5, 1.0), t * 5.0);",
    "    if(t < 0.4) return mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 1.0, 0.0), (t - 0.2) * 5.0);",
    "    if(t < 0.6) return mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.4) * 5.0);",
    "    if(t < 0.8) return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.3, 0.0), (t - 0.6) * 5.0);",
    "    return mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 1.0, 1.0), (t - 0.8) * 5.0);",
    "}",
    "",
    "void main() {",
    "    float u = (vIndex + 0.5) / N;",
    "    vec4 vel = texture2D(velocityTexture, vec2(u, 0.5));",
    "    float speed = clamp(vel.w * speedScale, 0.0, 1.0);",
    "",
    "    vec3 color = speedToColor(speed);",
    "",
    "    // Disque circulaire avec bord adouci (point sprite)",
    "    vec2 center = gl_PointCoord - 0.5;",
    "    float d = length(center);",
    "    if(d > 0.5) discard;",
    "",
    "    float alpha = 1.0 - smoothstep(0.3, 0.5, d);",
    "    gl_FragColor = vec4(color, alpha);",
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

    // Ping-pong : index 0 = tampon A, index 1 = tampon B
    this.posTextures = [null, null];
    this.velTextures = [null, null];
    this.currentBuf  = 0;

    // Rendu
    this.superMesh      = null;
    this.shaderMaterial = null;
}

// Initialise le moteur avec un tableau de particules
// Chaque particule : { x, y, z, mass, vx, vy, vz }
GPUGravityEngine.prototype.init = function(particles) {
    if (this.initialized) this.dispose();

    this.N = Math.min(particles.length, GPU_MAX_PARTICLES);
    var N  = this.N;

    // Packing des données initiales dans des Float32Array
    var posData = new Float32Array(N * 4);
    var velData = new Float32Array(N * 4);

    for (var i = 0; i < N; i++) {
        posData[i * 4]     = particles[i].x    || 0;
        posData[i * 4 + 1] = particles[i].y    || 0;
        posData[i * 4 + 2] = particles[i].z    || 0;
        posData[i * 4 + 3] = particles[i].mass || 1;
        velData[i * 4]     = particles[i].vx   || 0;
        velData[i * 4 + 1] = particles[i].vy   || 0;
        velData[i * 4 + 2] = particles[i].vz   || 0;
        velData[i * 4 + 3] = 0; // |v| calculé par le shader
    }

    this._initGPGPU(posData, velData);
    this._createSuperMesh();
    this.initialized = true;
};

// Crée les textures GPGPU ping-pong et les initialise
GPUGravityEngine.prototype._initGPGPU = function(posData, velData) {
    var scene       = this.scene;
    var N           = this.N;
    var samplingMode = BABYLON.Texture.NEAREST_SAMPLINGMODE || 1;
    var floatType   = BABYLON.Engine.TEXTURETYPE_FLOAT || 1;

    // Textures de données brutes pour l'état initial
    var initPosTex = BABYLON.RawTexture.CreateRGBATexture(
        posData, N, 1, scene, false, false, samplingMode, floatType
    );
    var initVelTex = BABYLON.RawTexture.CreateRGBATexture(
        velData, N, 1, scene, false, false, samplingMode, floatType
    );

    // Création des 4 ProceduralTextures de ping-pong
    // Taille N x 1 : une rangée de N texels, un par particule
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

    // Désactiver le rafraîchissement automatique
    // On appelle render() manuellement à chaque frame
    [posA, posB, velA, velB].forEach(function(t) {
        t.refreshRate = -1;
    });

    // --- Initialisation du tampon A depuis les données brutes ---
    // copyMode = 1.0 : le shader recopie simplement la vitesse initiale
    velA.setTexture("positionTexture", initPosTex);
    velA.setTexture("velocityTexture", initVelTex);
    velA.setFloat("N", N);
    velA.setFloat("dt", 0.0);
    velA.setFloat("limNewton", 1.0);
    velA.setFloat("invG", 1.0);
    velA.setFloat("copyMode", 1.0); // Passthrough : recopie sans physique
    velA.render();

    // dt = 0 : newPos = oldPos + newVel * 0 = oldPos (pure recopie)
    posA.setTexture("positionTexture", initPosTex);
    posA.setTexture("velocityTexture", velA);
    posA.setFloat("N", N);
    posA.setFloat("dt", 0.0);
    posA.render();

    // Le tampon B sera calculé depuis A lors du premier step()
    this.posTextures[0] = posA;
    this.posTextures[1] = posB;
    this.velTextures[0] = velA;
    this.velTextures[1] = velB;
    this.currentBuf = 0;

    // Nettoyage des textures brutes temporaires
    initPosTex.dispose();
    initVelTex.dispose();
};

// Calcule un pas de physique complet sur le GPU
// Appelé à chaque frame depuis la boucle de rendu
GPUGravityEngine.prototype.step = function() {
    var cur  = this.currentBuf;
    var next = 1 - cur;

    var posCur  = this.posTextures[cur];
    var velCur  = this.velTextures[cur];
    var posNext = this.posTextures[next];
    var velNext = this.velTextures[next];

    var N         = this.N;
    var dt        = glo.temps;
    var limNewton = Math.max(0.0001, glo.lim_newton);
    var invG      = glo.mode.inv_g ? -1.0 : 1.0;

    // Étape 1 : Calcul des nouvelles vitesses
    // Le shader lit positions + vitesses courantes, calcule les
    // forces gravitationnelles et met à jour les vitesses.
    velNext.setTexture("positionTexture", posCur);
    velNext.setTexture("velocityTexture", velCur);
    velNext.setFloat("N", N);
    velNext.setFloat("dt", dt);
    velNext.setFloat("limNewton", limNewton);
    velNext.setFloat("invG", invG);
    velNext.setFloat("copyMode", 0.0); // Mode physique
    velNext.render();

    // Étape 2 : Calcul des nouvelles positions
    // Utilise les nouvelles vitesses (semi-implicit Euler)
    posNext.setTexture("positionTexture", posCur);
    posNext.setTexture("velocityTexture", velNext); // Nouvelles vitesses !
    posNext.setFloat("N", N);
    posNext.setFloat("dt", dt);
    posNext.render();

    // Swap des tampons
    this.currentBuf = next;

    // Mise à jour du matériau de rendu avec les nouvelles textures
    if (this.shaderMaterial) {
        this.shaderMaterial.setTexture("positionTexture", posNext);
        this.shaderMaterial.setTexture("velocityTexture", velNext);
        this.shaderMaterial.setFloat(
            "speedScale",
            1.0 / Math.max(0.001, glo.modulation * 0.005)
        );
    }
};

// Crée le super mesh : N vertices à (0,0,0) + attribut particleIndex
GPUGravityEngine.prototype._createSuperMesh = function() {
    var N      = this.N;
    var scene  = this.scene;
    var engine = this.engine;

    // Tous les vertices à l'origine
    // Le vertex shader les déplacera via la texture de positions
    var positions      = new Float32Array(N * 3); // Tous à zéro
    var indices        = [];
    var particleIndices = new Float32Array(N);

    for (var i = 0; i < N; i++) {
        indices.push(i);
        particleIndices[i] = i;
    }

    var mesh       = new BABYLON.Mesh("gpuSuperMesh", scene);
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = Array.from(positions);
    vertexData.indices   = indices;
    vertexData.applyToMesh(mesh, false);

    // Attribut personnalisé : index de particule (1 float par vertex)
    var piBuf = new BABYLON.VertexBuffer(
        engine, particleIndices, "particleIndex",
        false, // non-updatable
        false, // non-instancedMesh
        1      // stride = 1 float
    );
    mesh.setVerticesBuffer(piBuf);

    this.superMesh = mesh;
    this._createShaderMaterial();
    mesh.material = this.shaderMaterial;
};

// Crée le matériau shader pour le rendu des particules
GPUGravityEngine.prototype._createShaderMaterial = function() {
    var mat = new BABYLON.ShaderMaterial(
        "gpuParticleMat",
        this.scene,
        {
            vertex:   "gpuGravParticle",
            fragment: "gpuGravParticle"
        },
        {
            attributes: ["position", "particleIndex"],
            uniforms:   ["viewProjection", "N", "pointSize", "speedScale"],
            samplers:   ["positionTexture", "velocityTexture"]
        }
    );

    // Rendu en points sprites
    mat.pointsCloud     = true;
    mat.backFaceCulling = false;

    // Mélange additif pour l'effet lumineux
    mat.alphaMode = BABYLON.Engine.ALPHA_ADD;

    // Uniforms initiaux
    mat.setFloat("N",          this.N);
    mat.setFloat("pointSize",  glo.gpu.pointSize);
    mat.setFloat("speedScale", 1.0 / Math.max(0.001, glo.modulation * 0.005));

    // Textures courantes
    mat.setTexture("positionTexture", this.posTextures[this.currentBuf]);
    mat.setTexture("velocityTexture", this.velTextures[this.currentBuf]);

    this.shaderMaterial = mat;
};

// Met à jour les uniforms depuis glo (appelé si paramètres changent)
GPUGravityEngine.prototype.updateUniforms = function() {
    if (!this.shaderMaterial) return;
    this.shaderMaterial.setFloat("pointSize", glo.gpu.pointSize);
};

// Libère toutes les ressources GPU
GPUGravityEngine.prototype.dispose = function() {
    if (this.superMesh)      { this.superMesh.dispose();      this.superMesh = null; }
    if (this.shaderMaterial) { this.shaderMaterial.dispose(); this.shaderMaterial = null; }
    this.posTextures.forEach(function(t) { if (t) t.dispose(); });
    this.velTextures.forEach(function(t) { if (t) t.dispose(); });
    this.posTextures = [null, null];
    this.velTextures = [null, null];
    this.initialized = false;
};

// ============================================================
// Génération des particules initiales
// ============================================================

// Génère N particules distribuées aléatoirement dans une sphère
// avec des vitesses tangentielles pour favoriser la rotation
function generateGPUParticles(N, opts) {
    opts    = opts    || {};
    var radius     = opts.radius      !== undefined ? opts.radius      : glo.gpu.radius;
    var mass       = opts.mass        !== undefined ? opts.mass        : glo.masse_particules;
    var massVar    = opts.massVar     !== undefined ? opts.massVar     : glo.var_masse;
    var initSpeed  = opts.initialSpeed !== undefined ? opts.initialSpeed : glo.gpu.initialSpeed;
    var particles  = [];

    for (var i = 0; i < N; i++) {
        // Position uniforme dans la sphère (méthode rejet)
        var theta = Math.random() * 2 * Math.PI;
        var phi   = Math.acos(2 * Math.random() - 1);
        var r     = radius * Math.pow(Math.random(), 1.0 / 3.0);

        var x = r * Math.sin(phi) * Math.cos(theta);
        var y = r * Math.sin(phi) * Math.sin(theta);
        var z = r * Math.cos(phi);

        // Masse avec variation
        var m = mass * (1 + (Math.random() - 0.5) * massVar * 0.5);
        m = Math.max(0.001, m);

        // Vitesse initiale aléatoire
        var vx = (Math.random() - 0.5) * initSpeed;
        var vy = (Math.random() - 0.5) * initSpeed;
        var vz = (Math.random() - 0.5) * initSpeed;

        particles.push({ x: x, y: y, z: z, mass: m, vx: vx, vy: vy, vz: vz });
    }

    return particles;
}

// ============================================================
// Instance globale + contrôle du mode GPU
// ============================================================

var gpuGravityEngine = null;

// Active le mode GPU : cache les meshes CPU et crée le super mesh
function initGPUMode() {
    if (!glo.scene) return;

    // Masquer les meshes CPU existants
    for (var i = 0; i < meshes.length; i++) {
        meshes[i].isVisible = false;
    }

    // Créer ou réinitialiser le moteur GPU
    if (!gpuGravityEngine) {
        gpuGravityEngine = new GPUGravityEngine(
            glo.scene, glo.scene.getEngine()
        );
    } else {
        gpuGravityEngine.dispose();
    }

    var n         = Math.min(glo.gpu.N, GPU_MAX_PARTICLES);
    var particles = generateGPUParticles(n);
    gpuGravityEngine.init(particles);

    glo.mode.gpu = true;
    console.log("[GPU] Mode GPU activé — " + n + " particules");
}

// Désactive le mode GPU et restaure les meshes CPU
function stopGPUMode() {
    glo.mode.gpu = false;
    if (gpuGravityEngine) {
        gpuGravityEngine.dispose();
    }
    for (var i = 0; i < meshes.length; i++) {
        meshes[i].isVisible = true;
    }
    console.log("[GPU] Mode GPU désactivé");
}

// Bascule le mode GPU (touche 'G')
function toggleGPUMode() {
    if (glo.mode.gpu) {
        stopGPUMode();
    } else {
        initGPUMode();
    }
}

// Écoute de la touche 'G' pour activer/désactiver le mode GPU
window.addEventListener("keydown", function(e) {
    if (e.key === "g" || e.key === "G") {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            toggleGPUMode();
        }
    }
});
