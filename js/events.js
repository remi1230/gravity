glo.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, glo.scene);
glo.advancedTexture.useSmallestIdeal = true;

let help = new Help('./js/events.js', glo.mode);

//*****************CURSEUR POINTER SI SURVOL CANVAS*****************
$("#univers_div").mouseenter(function(){
	$("#univers_div").css('cursor', 'pointer');
});
$("#univers_div").mouseleave(function(){
	$("#univers_div").css('cursor', 'auto');
});


window.addEventListener("keydown", function (e) {
	help.saveObjParent();

	switch (e.key) {
		/// b -- Inverse les vitesses de pose -- boule, pose ///
		case "b":
			invSpeedSliders();

			break;
		/// ! -- Affiche ou cache les axes -- interface, axes -- showAxis ///
		case "!":
			glo.mode.showAxis = !glo.mode.showAxis;
			if(glo.mode.showAxis){ showAxis(35); }
			else{ switch_axis(); }

			break;
		/// * -- Suit ou non la boule sélectionnée -- boule, camera -- cameraFollowMesh ///
		case "*":
			glo.mode.cameraFollowMesh = !glo.mode.cameraFollowMesh;

			break;
		/// $ -- Switch la vue entre les différents axes -- axes, camera ///
		case "$":
			viewOnAxe(selectNextViewXYZ.next().value);

			break;
		/// j -- Positionne la caméra à la position moyenne des boules -- position, camera ///
		case "j":
			goToMeanMeshesPos();

			break;
		/// o -- Positionne la caméra à sa position d'origine -- position, camera ///
		case "o":
			glo.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
			glo.camera.setPosition(new BABYLON.Vector3(0, 0, -12));

			break;
		/// w -- Déplace la vue d'une boule à l'autre -- position, camera ///
		case "w":
			let mesh = selectNextMesh();
			if(mesh){ goToMesh(mesh); }

			if(glo.mode.cameraFollowMesh){ glo.meshToFollowByCamera = mesh; }

			break;
		/// x -- Les boules rotationnent -- boule, rotation -- rotate_mesh ///
		case "x":
			glo.mode.rotate_mesh = !glo.mode.rotate_mesh;

			break;
		/// u -- Les boules sont éclairées ou pas -- boule, lumière -- light ///
		case "u":
			glo.mode.light = !glo.mode.light;

			if(glo.mode.light){ glo.light.intensity = 0; }
			else{ glo.light.intensity = 0.7; }

			break;
		/// p -- Switch le mode flat -- boule ///
		case "p":
			glo.flat = !glo.flat;
			flat_meshes(meshes);

			break;
		///  -- Met en pause ou reprend -- action, global ///
		case " ":
			glo.checkboxes.getCheck("pause").isChecked = !glo.checkboxes.getCheck("pause").isChecked;

			break;
		/// r -- Les masses des boules sont aléatoires -- boule, taille -- random ///
		case "r":
			glo.mode.random = !glo.mode.random;

			break;
		/// t -- Les tailles des boules sont aléatoires -- boule, taille -- random_taille ///
		case "t":
			glo.mode.random_taille = !glo.mode.random_taille;

			break;
		/// f -- Les boules sont fixes ou pas -- boule, position ///
		case "f":
			glo.mode_check.invCheck('pose_fixe');

			break;
		/// c -- Rapproche les boules du centre -- boule, position ///
		case "c":
			crush(meshes, 0.5);

			break;
		/// v -- Éloigne les boules du centre -- boule, position ///
		case "v":
			crush(meshes, 2);

			break;
		/// c -- Les boules se collisionnent ou pas -- boule, collision ///
		case "n":
			glo.mode_check.invCheck('collision');

			break;
		/// y -- Couleurs des boules calculées suivant la vitesse absolue ou relative -- boule, couleur ///
		case "y":
			mode_moyenne = !mode_moyenne;

			break;
		/// a -- Couleurs des boules suivant leurs accélération -- boule, couleur ///
		case "a":
			is_acceleration = !is_acceleration;

			break;
		/// z -- Pose des boules en mode méta ou non -- boule, pose ///
		case "z":
			glo.mode_check.invCheck('meta_mesh');

			break;
		/// e -- Le maximum des sliders est divisé par 10 -- interface ///
		case "e":
			glo.echelle /= 10;

			break;
		/// s -- Les trainées des boules conservent ou non leur couleur -- boule, couleur, trainée ///
		case "s":
			glo.trail.color = !glo.trail.color;

			break;
		case "l":
			//vide

			break;
		/// s -- Les boules ont une trainée on pas -- boule, trainée ///
		case "&":
			glo.mode_check.invCheck('trail');
			add_trails(glo.mode_check.getCheck('trail'), meshes);

			break;
		/*case "é":
			glo.mode.wall_visible = !glo.mode.wall_visible;
			var pos = {x: glo.camera.position.x, y: glo.camera.position.y, z: glo.camera.position.z + 120};
			wall_visible(glo.mode.wall_visible, pos, 0.2112);

			break;*/
		/// q -- Change le matériel des boules -- boule ///
		case "q":
			move_in_glo_tab('materials_type', 'material_type_select', 'material_type_index_select');

			break;
		/// m -- Change la forme des boules -- boule ///
		case "m":
			move_in_glo_tab('forms_mesh', 'form_mesh_select', 'form_mesh_index_select');

			break;
		/// i -- Déplace les boules vers l'avant -- boule, position ///
		case "i":
			move_mesh(meshes, 'to', 0.178);

			break;
		/// k -- Déplace les boules vers l'arrière -- boule, position ///
		case "k":
			move_mesh(meshes, 'from', 0.178);

			break;
		/// g -- Inverse le gravité -- gravité ///
		case "g":
			inverse_g(meshes);

			break;
		/// A -- Positionne la caméra sur la boule la plus proches des autres -- boule, position ///
		case "A":
			goToMeshNearestToOthers();

			break;
		/// M -- Positionne les Meshes posés au mean point -- boule, position -- posOnMeshesMeanPoint ///
		case "M":
			glo.mode.posOnMeshesMeanPoint = !glo.mode.posOnMeshesMeanPoint;

			break;
		/// O -- Repositionne les boules à leur position d'origine -- boule, position ///
		case "O":
			meshesToOriginPosition();

			break;
		/// P -- La boule est posée en orbite -- boule, position ///
		case "P":
			glo.mode.orbite = !glo.mode.orbite;

			break;
		/// R -- Lorsque la boule est posée en orbite, le vecteur est rotationné -- boule, position ///
		case "R":
			glo.mode.orbiteRandom = !glo.mode.orbiteRandom;

			break;
		case "à":
			//FREE

			break;
		/// = -- Mode pas à pas -- frame ///
		case "=":
			glo.mode.pause = false;
			calcul_gravity();
			glo.mode.pause = true;

			break;
		case 'ArrowLeft':
			move_mesh(meshes, 'left', glo.moveDistMeshesByKey);

		break;
		case 'ArrowRight':
			move_mesh(meshes, 'right', glo.moveDistMeshesByKey);

			break;
		case 'ArrowDown':
			move_mesh(meshes, 'up', glo.moveDistMeshesByKey);

			break;
		case 'ArrowUp':
			move_mesh(meshes, 'bottom', glo.moveDistMeshesByKey);

			break;
	}

	help.tuchOnAfterPropUpdate();
});


//*****************TOUCHES FLÉCHÉES*****************
/*window.onkeydown = function(e) {
	var key = e.keyCode || e.which;
	var dist = 0.178;
	switch (key) {
		case 37:
			move_mesh(meshes, 'left', dist);

		break;
		case 39:
			move_mesh(meshes, 'right', dist);

			break;
		case 38:
			move_mesh(meshes, 'bottom', dist);

			break;
		case 40:
			move_mesh(meshes, 'up', dist);

			break;
	}
};*/

function* selectNextMeshGen(){
	if(meshes.length){
		var index = 0;
		while(true){
			index++;
			if(index == meshes.length){ index = 0; }
			yield meshes[index];
		}
	}
	return false;
}
let meshesList = false;

function goToMeanMeshesPos(theMeshes = meshes){
	const pos = calculMeshesMeanPos(theMeshes);

	glo.camera.setTarget(new BABYLON.Vector3(pos.x, pos.y, pos.z));
	glo.camera.setPosition(new BABYLON.Vector3(pos.x, pos.y, pos.z - 12));
}

function calculMeshesMeanPos(theMeshes = meshes){
	let pos = {x: 0, y: 0, z: 0};
	theMeshes.forEach(mesh => {
		pos.x += mesh.position.x; pos.y += mesh.position.y; pos.z += mesh.position.z;
	});
	pos.x /= theMeshes.length; pos.y /= theMeshes.length; pos.z /= theMeshes.length;

	return theMeshes.length ? pos : {x: 0, y: 0, z: 0};
}

function move_mesh(ms, direction, distance){
	switch (direction) {
		case 'left':
		ms.map(mesh => {
			mesh.virtual_x -= distance;
			mesh.position.x -= distance;
		});
		break;

		case 'up':
		ms.map(mesh => {
			mesh.virtual_y -= distance;
			mesh.position.y -= distance;
		});
		break;

		case 'right':
		ms.map(mesh => {
			mesh.virtual_x += distance;
			mesh.position.x += distance;
		});
		break;

		case 'bottom':
		ms.map(mesh => {
			mesh.virtual_y += distance;
			mesh.position.y += distance;
		});
		break;
		case 'to':
		ms.map(mesh => {
			mesh.virtual_z -= distance;
			mesh.position.z -= distance;
		});
		break;
		case 'from':
		ms.map(mesh => {
			mesh.virtual_z += distance;
			mesh.position.z += distance;
		});
		break;
	}
}

function add_trails(mode_trail = glo.mode_check.getCheck('trail'), ms = [],
	options = {diameter: glo.trail.diameter, length_trail: glo.trail.length, autoStart: glo.trail.autoStart}){
	if(mode_trail){
		ms.map(mesh => {
			options.diameter = mesh.taille_mesh * glo.trail.diameter / 2.8;
			var newTrail = new BABYLON.TrailMesh("sphere_trail_" + num_mesh, mesh, glo.scene, options.diameter, options.length_trail, options.autoStart);
			newTrail.material = new BABYLON.StandardMaterial('trailMat', glo.scene);
			mesh.trail = newTrail;
			glo.trails.push(newTrail);
		});
	}
	else{
		glo.trails.map(trail => {
			trail.stop();
			trail.dispose(false, true);
			trail = {};
		});
	}
}

function wall_visible(wall_visible, pos = {x: 0, y: 0, z: 0}, dist_z, taille, alpha){
	if(wall_visible){
		glo.wall = BABYLON.Mesh.CreatePlane("wall", taille, glo.scene);
		glo.wall.position.x = pos.x;
		glo.wall.position.y = pos.y;
		glo.wall.position.z = pos.z + dist_z;
		glo.wall.material = new BABYLON.StandardMaterial("wallMat", glo.scene);
		glo.wall.material.emissiveColor = new BABYLON.Color3(0, 255, 0,);
		glo.wall.material.alpha = alpha;
	}
	else{
		if(typeof(glo.wall) != "undefined"){
			if(typeof(glo.wall.position.x) != "undefined"){
				glo.wall.dispose();
				glo.wall = {};
			}
		}
	}
}
function multi_wall_visible(wall_visible, nb_walls, ecart, pos = {x: 0, y: 0, z: 0}){
	if(wall_visible){
		for(var i = 0; i < nb_walls; i++){
			glo.walls[i] = BABYLON.Mesh.CreatePlane("wall", 200.0, glo.scene);
			glo.walls[i].position.x = pos.x;
			glo.walls[i].position.y = pos.y;
			if(i%2 == 0){ glo.walls[i].position.z = pos.z + (ecart * i); }
			else{ glo.walls[i].position.z = pos.z - (ecart * i); }
			glo.walls[i].material = new BABYLON.StandardMaterial("wallMat", glo.scene);
			glo.walls[i].material.emissiveColor = new BABYLON.Color3(255, 0, 0);
			glo.walls[i].material.alpha = 1;
		}
	}
	else{
		glo.walls.map(wall => {
			wall.dispose();
			wall = {};
		});
	}
}

function move_in_glo_tab(tab, elem_select_in_tab, index_elem_select_in_tab){
	if(glo[index_elem_select_in_tab] < glo[tab].length - 1){ glo[index_elem_select_in_tab]++; }
	else{ glo[index_elem_select_in_tab] = 0; }
	glo[elem_select_in_tab] = glo[tab][glo[index_elem_select_in_tab]];
}

function flat_meshes(ms){
	if(glo.flat){
		ms.map(mesh => {
			mesh.convertToFlatShadedMesh();
		});
	}
	else{
		ms.map(mesh => {
			mesh.forceSharedVertices();
		});
	}
}

function crush(ms, coeff){
	ms.map(mesh => {
		mesh.virtual_x *= coeff;
		mesh.position.y *= coeff;
		mesh.virtual_z *= coeff;
		mesh.position.x *= coeff;
		mesh.virtual_y *= coeff;
		mesh.position.z *= coeff;
	});
}

function add_meshes(nb_meshes, taille_mesh, taille, masse, pos = {x: 0, y: 0, z: 0}){
	var form_select = glo.formes.getFormeSelect().text;

	pos = !glo.mode.posOnMeshesMeanPoint ? pos : calculMeshesMeanPos();

	switch(form_select){
		case "One":
			glo.camera.setTarget(new BABYLON.Vector3(0,0,-6));
			add_one_mesh(taille_mesh, taille, masse, pos);
			break;
		case "Carrée":
			glo.camera.setTarget(new BABYLON.Vector3(0,0,-6));
			add_square_of_meshes(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "Cube":
			glo.camera.setTarget(new BABYLON.Vector3(0,0,-6));
			add_cube_of_meshes(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "Sphère Y":
			add_meshes_of_meshes(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "Sphère Q":
			add_sphere_X_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, "z", "y");
			break;
		case "Cercle":
			add_cercle_of_meshes_z(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "Cercles":
			add_cercles_of_meshes(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "Pyramide":
			glo.camera.setTarget(new BABYLON.Vector3(0,0,-6));
			add_pyramide_of_meshes(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "Spirale":
			add_spiral_of_meshes(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "Spirale 3D":
			add_spiral_3d_of_meshes(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "Coquillage":
			add_spicube_of_meshes(nb_meshes, taille_mesh, taille, masse, pos);
			break;
		case "ToreTest":
			var rots = generate3XYZ.next().value;
			add_tore_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, rots);
			break;
		case "Tore":
			const testRot = {
				x1: 0,
				y1: 0,
				z1: 1,
				x2: 0,
				y2: 1,
				z2: 0,
				x3: 0,
				y3: 0,
				z3: 1,
			};

			add_tore_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, testRot);
			break;
		case "Vortex":
			var options = {
				rot_1: "y",
				rot_2: "z",
				div_rot_1:{x: 1, y: 1, z: 1},
				div_rot_2:{x: 1, y: 1, z: 0.95},
				angle_1:{from: -90, to: 270},
				angle_2:{from: 0, to: 360},
			};
			add_dbl_rot_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, options);
			break;
		case "SpiBoat":
			var options = {
				rot_1: "z",
				rot_2: "y",
				div_rot_1:{x: 1, y: 1, z: 1},
				div_rot_2:{x: 1, y: 1.1, z: 1},
				angle_1:{from: 0, to: 360},
				angle_2:{from: 0, to: 360},
				pos: {x: 0, y: 6 * glo.ecart_particules, z: 0},
			};
			add_dbl_rot_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, options);
			break;
		case "Sphère Fib":
			addSphereFibonacci(nb_meshes, taille_mesh, taille, masse, pos);
			break;
	}
	//glo.camera.alpha = Math.PI/2;
	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	if(glo.mode.posOnMeshesMeanPoint){ goToMeanMeshesPos(); }

	meshesList = selectNextMeshGen();
}

function addSphereFibonacci(nb_meshes, taille_mesh, taille, masse, pos){
	let points = posPointsWithFibonacci(nb_meshes * 10, glo.ecart_particules * 10, pos);

	newMeshes = [];
	points.forEach(point => {
		newMeshes.push(add_one_mesh(taille_mesh, taille, masse, point));
	});
	goToMeanMeshesPos(newMeshes);
}

function posPointsWithFibonacci(n, rayon, pos) {
	let points = [];
    let phi    = Math.PI * (3 - Math.sqrt(5));  // angle d'or en radians

    for (var i = 0; i < n; i++) {
        let y = 1 - (i / (n - 1)) * 2;  // y va de 1 à -1
        let rayonHorizontal = Math.sqrt(1 - y * y);  // rayon à cette hauteur

        let angle = phi * i;  // angle selon la répartition de Fibonacci

        let x = Math.cos(angle) * rayonHorizontal * rayon;
        let z = Math.sin(angle) * rayonHorizontal * rayon;

		let p = {x: x + pos.x, y: (y*rayon) + pos.y, z: z + pos.z};

		//Code que j'ai rajouté pour fusionner chacune des paires de points situés aux pôles
		if(i === 1){
			points[i-1] = {x: (points[i-1].x + p.x) / 2, y: (points[i-1].y + p.y) / 2, z: (points[i-1].z + p.z) / 2};
		}
		else if(i === n-1){
			points[i-2] = {x: (points[i-2].x + p.x) / 2, y: (points[i-2].y + p.y) / 2, z: (points[i-2].z + p.z) / 2};
		}
		else{ points.push(p); }
    }

    return points;
}

function pointsOnSameTopo(points){
	const pow = Math.pow;
	const distBetweenPoints = (p1, p2) => pow(pow(p2.x - p1.x, 2) + pow(p2.y - p1.y, 2) + pow(p2.z - p1.z, 2), 0.5);

	let dist = 0;
	points.forEach((currPoint, i) => {
		if(i){
			dist += distBetweenPoints(points[i-1], currPoint);
		}
	});

	dist /= points.length;
}

function selectNextMesh(){ return meshesList ? meshesList.next().value : false; }

function invSpeedSliders(){
	glo.vitesse_pose_x = -glo.vitesse_pose_x;
	glo.vitesse_pose_y = -glo.vitesse_pose_y;
	glo.vitesse_pose_z = -glo.vitesse_pose_z;

	let vxSlider = getGuiElemByName('vitesse_x');
	let vySlider = getGuiElemByName('vitesse_y');
	let vzSlider = getGuiElemByName('vitesse_z');

	vxSlider.value = -vxSlider.value;
	vySlider.value = -vySlider.value;
	vzSlider.value = -vzSlider.value;
}

function add_one_mesh(taille_mesh, taille = glo.taille_mesh, masse, pos,
	vitesse = {x: glo.vitesse_pose_x, y: glo.vitesse_pose_y, z: glo.vitesse_pose_z}, center){
	
	if(vitesse === 'default'){ vitesse = {x: glo.vitesse_pose_x, y: glo.vitesse_pose_y, z: glo.vitesse_pose_z}; }

	taille_mesh = taille;
	var ajout_ts = 0;
	var scale_taille = 1;
	if(glo.mode.random_taille){
		var lim_taille = 1;
		ajout_ts = Math.random() * lim_taille;
		var coef = (taille_mesh + ajout_ts) / taille_mesh;
		scale_taille = Math.pow(coef, 0.9);
	}

	if(!glo.mode.box){
		switch (glo.form_mesh_select) {
			case "sphere":
			var mesh = BABYLON.MeshBuilder.CreateSphere("mesh" + num_mesh,
			{diameter:  glo.taille_mesh + ajout_ts, }, g.scene);

				break;
			case "box":
			var mesh = BABYLON.Mesh.CreateBox("box", glo.taille_mesh + ajout_ts, glo.scene);

				break;
			case "line":
				x = pos.x; y = pos.y; z = pos.z;
				x /= 3;
				y /= 3;
				z /= 3;
				var mesh = BABYLON.Mesh.CreateLines("lines", [
					new BABYLON.Vector3(x, y, z),
					new BABYLON.Vector3(x + 0.1, y + 0.1, z + 0.1),
				], glo.scene);

				break;
			case "custom":
				//Create a custom mesh
				var mesh = new BABYLON.Mesh("custom", glo.scene);

				//Set arrays for positions and indices
				var positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3];
				var indices = [0, 1, 2];

				//Create a vertexData object
				var vertexData = new BABYLON.VertexData();

				//Assign positions and indices to vertexData
				vertexData.positions = positions;
				vertexData.indices = indices;

				//Apply vertexData to custom mesh
				vertexData.applyToMesh(mesh);

				break;
		}
	}
	else{
		var mesh = BABYLON.Mesh.CreateBox("box", glo.taille_mesh + ajout_ts, glo.scene);
	}

	mesh.num = num_mesh;
	num_mesh++;

	mesh.center    = center;
	mesh.selection = false;

	mesh.dist_to_mesh = function(oth_mesh){
		var dist_x = oth_mesh.position.x - this.position.x;
		var dist_y = oth_mesh.position.y - this.position.y;
		var dist_z = oth_mesh.position.z - this.position.z;

		return  {
			dist: Math.sqrt((Math.pow(dist_x,2) + Math.pow(dist_y,2) + Math.pow(dist_z,2))),
			dist_x: dist_x,
			dist_y: dist_y,
			dist_z: dist_z,
		}
	};

	mesh.rotate = function(angle, rad = false){
		var pitch_rad = angle.x * Math.PI / 180;
		var roll_rad = angle.y * Math.PI / 180;
		var yaw_rad = angle.z * Math.PI / 180;

		if(rad){
			pitch_rad = angle.x;
			roll_rad = angle.y;
			yaw_rad = angle.z;
		}

		this.rotation.x += angle.x;
		this.rotation.y += angle.y;
		this.rotation.z += angle.z;
	};

	var m_length = meshes.length;
	for (var i = 0; i < m_length; i++) {
		var m = meshes[i];
		if(m.cible){
			var dist_x = m.position.x - pos.x;
			var dist_y = m.position.y - pos.y;
			var dist_z = m.position.z - pos.z;
			var echelle = glo.echelle_vitesse_cible / 10;
			var dist = Math.sqrt((Math.pow(dist_x,2) + Math.pow(dist_y,2) + Math.pow(dist_z,2)));
			vitesse.x = (echelle * (dist_x / dist)) + glo.vitesse_pose_x;
			vitesse.y = (echelle * (dist_y / dist)) + glo.vitesse_pose_y;
			vitesse.z = (echelle * (dist_z / dist)) + glo.vitesse_pose_z;

			break;
		}
	}

  if(glo.mode.orbite){
	let V = new BABYLON.Vector3(pos.x, pos.y, pos.z);

	// Calculer le vecteur OV
	let OV = V.clone();

	// Choisir un vecteur de base pour le produit vectoriel
	let baseVector = new BABYLON.Vector3(1, 0, 0);
	if (areVectorsParallel(OV, baseVector)) {
		baseVector = new BABYLON.Vector3(0, 1, 0);
	}

	// Calculer le vecteur perpendiculaire
	let perpendicularVector = BABYLON.Vector3.Cross(OV, baseVector).normalize();

	if(glo.mode.orbiteRandom){
		let angle = Math.PI / (4 * Math.random());
		let rotationMatrix  = BABYLON.Matrix.RotationAxis(OV, angle);
		perpendicularVector = BABYLON.Vector3.TransformCoordinates(perpendicularVector, rotationMatrix);
	}

	vitesse.x = glo.vitesse_pose_abs * perpendicularVector.x / 10;
	vitesse.y = glo.vitesse_pose_abs * perpendicularVector.y / 10;
	vitesse.z = glo.vitesse_pose_abs * perpendicularVector.z / 10;
  }

  function areVectorsParallel(vec1, vec2) {
    let crossProduct = BABYLON.Vector3.Cross(vec1, vec2);
    return crossProduct.lengthSquared() < 0.0001; // Seuil pour tenir compte des imprécisions numériques
}

  mesh.actionManager = new BABYLON.ActionManager(glo.scene);
	mesh.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(
      {
          trigger: BABYLON.ActionManager.OnPointerOverTrigger,
          parameter: 'r'
      },
      function () {
				if(glo.mode_check.getCheck("selection")){
					mesh.selection = !mesh.selection;
					if(mesh.selection){
						mesh.material.emissiveColorSave = {};
						mesh.material.diffuseColorSave = {};
						Object.assign(mesh.material.emissiveColorSave, mesh.material.emissiveColor);
						Object.assign(mesh.material.diffuseColorSave, mesh.material.diffuseColor);
						mesh.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
						mesh.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
					}
					else{
						Object.assign(mesh.material.emissiveColor, mesh.material.emissiveColorSave);
						Object.assign(mesh.material.diffuseColor, mesh.material.diffuseColorSave);
					}
				}
				else if(glo.mode_check.getCheck("cible")){
					meshes.map(m => {
						if(mesh != m){ m.cible = false; }
					});
					mesh.cible = !mesh.cible;
					if(mesh.cible){
						mesh.material.emissiveColorSave = {};
						mesh.material.diffuseColorSave = {};
						Object.assign(mesh.material.emissiveColorSave, mesh.material.emissiveColor);
						Object.assign(mesh.material.diffuseColorSave, mesh.material.diffuseColor);
						mesh.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
						mesh.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
					}
					else{
						Object.assign(mesh.material.emissiveColor, mesh.material.emissiveColorSave);
						Object.assign(mesh.material.diffuseColor, mesh.material.diffuseColorSave);
					}
				}
				else if(glo.mode_check.getCheck("suppression")){
					meshes_length = meshes.length;
					for(var i = 0; i < meshes_length; i++){
						if(mesh == meshes[i]){ meshes.splice(i, 1); break; }
					}
					glo.scene.removeMesh(mesh);
					mesh.dispose(false, true);
					mesh = {};
				}
			}
  	)
	);

	mesh.scale_scale = function(scale){
		var new_scale_x = this.scaling.x * scale;
		var new_scale_y = this.scaling.y * scale;
		var new_scale_z = this.scaling.z * scale;

		var scale_masse = Math.pow(scale, 2);

		this.taille_mesh *= scale;
		this.scaling = new BABYLON.Vector3(new_scale_x, new_scale_y, new_scale_z);
		this.z_masse *= scale_masse;

		this.z_vx *= scale;
		this.z_vy *= scale;
		this.z_vz *= scale;
		this.virtual_x *= scale;
		this.virtual_y *= scale;
		this.virtual_z *= scale;
	}

	mesh.taille_mesh = taille_mesh;
	mesh.scale_taille = scale_taille;
	mesh.pose_fixe = glo.mode_check.getCheck('pose_fixe');

	mesh.first_rot = false;

	var material = new BABYLON.StandardMaterial("myMaterial", glo.scene);
	mesh.material = material;

	if(glo.mode.texture){ mesh.material.diffuseTexture = new BABYLON.Texture(glo.url_texture, glo.scene); }

	if(glo.material_type == 'standard'){

	}
	else if(glo.material_type == 'cloud'){
		material.pointsCloud = true;
		material.pointSize = 2;
		material.diffuseColor = BABYLON.Color3.Red();
	}
	else if(glo.material_type == 'alpha'){
		mesh.material.alpha = 0.92;
		mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
	}
	else if(glo.material_type == 'wireframe'){
		mesh.material.wireframe = true;
	}

	if(mesh.pose_fixe){
		mesh.material.emissiveColor = glo.bab_colors.emissive_fixe;
		mesh.material.diffuseColor = glo.bab_colors.diffuse_fixe;
	}

	if(glo.mode.numero){ num_meshes([mesh]); }

	mesh.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
	mesh.startPos = new BABYLON.Vector3(pos.x, pos.y, pos.z);

	if(glo.mode_check.getCheck('meta_mesh')){
		mesh.meta_mesh = true;
		mesh.id_meta_mesh = glo.id_meta_mesh;
	}

	mesh.tuch = false;
	mesh.cohesion_posee = glo.cohesion_posee;

	mesh.z_vx = vitesse.x;
	mesh.z_vy = vitesse.y;
	mesh.z_vz = vitesse.z;

	mesh.virtual_x = pos.x;
	mesh.virtual_y = pos.y;
	mesh.virtual_z = pos.z;

	if(glo.mode.light){
		var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(pos.x, pos.y, pos.z), glo.scene);
		light.intensity = 1;
	  light.parent = mesh;
		mesh.light = light;
	}

	mesh.virtual_vx = 0;
	mesh.virtual_vy = 0;
	mesh.virtual_vz = 0;

	mesh.collision = false;
	mesh.collisioners = [];

	var div_masse = 0.001;
	if(masse.random){
		mesh.z_masse = Math.random() * masse.scale * scale_taille * div_masse;
		//if(i%10 == 0){ mesh.z_masse = Math.random()  * masse.scale * 10; }
	}
	else{
		mesh.z_masse = masse.scale * scale_taille * div_masse;
	}
	mesh.z_vitesse = 0.0;
	mesh.z_acceleration = 0.0;
	mesh.z_ax = 0.0; mesh.z_ay = 0.0; mesh.z_az = 0.0;

	meshes.push(mesh);

	mesh.is_trail = glo.mode_check.getCheck('trail');

	//mesh.computeWorldMatrix(true);
	//add_trails(glo.mode_check.getCheck('trail'), [mesh]);

	//mesh.heckCollisions = true;

	return mesh;
}

function rotate_meshes_self(ms, angle){
	ms.map(mesh => {
		mesh.rotate(angle);
	});
}

function showAxis(size, visibility = 1){
	glo.labels_axis = [];
	glo.planes_axis = [];
	var makeTextPlane = function(text, color, size_plane) {
	  var plane = new BABYLON.Mesh.CreatePlane("TextPlane", size_plane, glo.scene, true);
		plane.visibility = 0;
		var label = new BABYLON.GUI.TextBlock();
		label.text = text;
		label.color = "white";
		label.fontSize = size_plane * 10 + "px";
		label.fontWeight = "bold";
		label.height = "25px";
		label.width = "20px";
		label.name = "plane_label";
    	label.isVisible = visibility;

		var panel = new BABYLON.GUI.StackPanel();
		panel.isVertical = false;
	  	panel.zIndex = -1;

		panel.addControl(label);
    	glo.advancedTexture.addControl(panel);

		panel.linkWithMesh(plane);

		glo.labels_axis.push(label);
		glo.planes_axis.push(plane);
		return plane;
   };

	var pivot = new BABYLON.Vector3(0, 0, 0);

	let startPos = calculMeshesMeanPos();

	glo.axisX            = createAxisLine('X', startPos, size);
	glo.axisX.color      = new BABYLON.Color3(1, 0, 0);
	glo.axisX.isPickable = false;
	var xChar = makeTextPlane("X", "red", size / 10);
	xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
	xChar.isPickable = false;

	var pivot_translation_xChar = xChar.position.subtract(pivot);
		xChar.setPivotMatrix(BABYLON.Matrix.Translation(pivot_translation_xChar.x, pivot_translation_xChar.y, pivot_translation_xChar.z));
		glo.xChar = xChar;

	glo.axisY 			 = createAxisLine('Y', startPos, size);
	glo.axisY.color 	 = new BABYLON.Color3(0, 1, 0);
	glo.axisY.isPickable = false;
	var yChar = makeTextPlane("Y", "green", size / 10);
	yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
	yChar.isPickable = false;

	var pivot_translation_yChar = yChar.position.subtract(pivot);
	yChar.setPivotMatrix(BABYLON.Matrix.Translation(pivot_translation_yChar.x, pivot_translation_yChar.y, pivot_translation_yChar.z));
	glo.yChar = yChar;

	glo.axisZ 			 = createAxisLine('Z', startPos, size);
	glo.axisZ.color 	 = new BABYLON.Color3(0, 0, 1);
	glo.axisZ.isPickable = false;
	var zChar = makeTextPlane("Z", "blue", size / 10);
	zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
	zChar.isPickable = false;

	var pivot_translation_zChar = zChar.position.subtract(pivot);
	zChar.setPivotMatrix(BABYLON.Matrix.Translation(pivot_translation_zChar.x, pivot_translation_zChar.y, pivot_translation_zChar.z));
	glo.zChar = zChar;

	glo.axisX.visibility = visibility;
	glo.axisY.visibility = visibility;
	glo.axisZ.visibility = visibility;
	xChar.visibility = 0;
	yChar.visibility = 0;
	zChar.visibility = 0;
}

function createAxisLine(axis, startPos, size){
	switch(axis){
		case 'x' : case 'X' :
			return BABYLON.Mesh.CreateLines("axisX", [
				new BABYLON.Vector3(startPos.x, startPos.y, startPos.z), new BABYLON.Vector3(startPos.x + size, startPos.y, startPos.z),
				new BABYLON.Vector3(startPos.x + size * 0.95, startPos.y + 0.05 * size, startPos.z),
				new BABYLON.Vector3(startPos.x + size, startPos.y, startPos.z), new BABYLON.Vector3(startPos.x + size * 0.95, startPos.y - 0.05 * size, startPos.z)
				], glo.scene);
		case 'y' : case 'Y' :
			return BABYLON.Mesh.CreateLines("axisY", [
				new BABYLON.Vector3(startPos.x, startPos.y, startPos.z), new BABYLON.Vector3(0, size + startPos.y, startPos.z),
				new BABYLON.Vector3(startPos.x - 0.05 * size, startPos.y + size * 0.95, startPos.z),
				new BABYLON.Vector3(startPos.x, startPos.y + size, startPos.z), new BABYLON.Vector3(startPos.x + 0.05 * size, startPos.y + size * 0.95, startPos.z)
				], glo.scene);
		case 'z' : case 'Z' :
			return BABYLON.Mesh.CreateLines("axisZ", [
				new BABYLON.Vector3(startPos.x, startPos.y, startPos.z), new BABYLON.Vector3(startPos.x, startPos.y, startPos.z + size),
				new BABYLON.Vector3(startPos.x, startPos.y - 0.05 * size, startPos.z + size * 0.95),
				new BABYLON.Vector3(startPos.x, startPos.y, startPos.z + size), new BABYLON.Vector3(startPos.x, startPos.y + 0.05 * size, startPos.z + size * 0.95)
				], glo.scene);
	}
}

function switch_axis(axis_visible = glo.mode.showAxis){
	if(axis_visible){
		glo.axisX.visibility = 1;
		glo.axisY.visibility = 1;
		glo.axisZ.visibility = 1;
		glo.xChar.visibility = 0;
		glo.yChar.visibility = 0;
		glo.zChar.visibility = 0;
		glo.labels_axis.map(label_axis => { label_axis.isVisible = 1; } );
		glo.planes_axis.map(plane_axis => { plane_axis.visibility = 0; } );
	}
	else{
		glo.axisX.visibility = 0;
		glo.axisY.visibility = 0;
		glo.axisZ.visibility = 0;
		glo.xChar.visibility = 0;
		glo.yChar.visibility = 0;
		glo.zChar.visibility = 0;
		glo.labels_axis.map(label_axis => { label_axis.isVisible = 0; } );
		glo.planes_axis.map(plane_axis => { plane_axis.isVisible = 0; } );
	}
}

function find_closests(ms, mesh){
	var ms_length = ms.length;
	var mesures = [];
	var mesures_meshes = [];
	var mesh_to_return = [];
	var precision = glo.closest_precision;
	for (var i = 0; i < ms_length; i++) {
		if(mesh != ms[i]){
			var mesure = mesh.dist_to_mesh(ms[i]);
			mesures.push(mesure.dist);
			mesures_meshes.push({ mesh: ms[i], dist: mesure.dist });
		}
	}
	var min = Math.min(...mesures);

	var m_length = mesures_meshes.length;
	for (var i = 0; i < m_length; i++) {
		if(mesures_meshes[i].dist < min + precision && mesures_meshes[i].dist > min - precision){
			mesh_to_return.push(mesures_meshes[i].mesh);
		}
	}

	return mesh_to_return;
}

function link_meshes(ms){
	var ms_length = ms.length;
	if(glo.mode_check.getCheck("link")){
		for (var i = 1; i < ms_length; i++) {
			var path = [
				new BABYLON.Vector3(ms[i - 1].position.x, ms[i - 1].position.y, ms[i - 1].position.z),
				new BABYLON.Vector3(ms[i].position.x, ms[i].position.y, ms[i].position.z),
			];
			if(typeof(ms[i].mesh_line) == "undefined" || typeof(ms[i].mesh_line.dispose) != "function"){
				ms[i].mesh_line = BABYLON.MeshBuilder.CreateLines("lines", {points: path, updatable: true, useVertexAlpha: true, }, glo.scene);
			}
			else{
				ms[i].mesh_line = BABYLON.MeshBuilder.CreateLines("lines", {points: path,
					instance: ms[i].mesh_line,
					colors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)],
					useVertexAlpha: true,
				});
				ms[i].mesh_line.color = new BABYLON.Color3(i/ms_length, (i/ms_length) / 2 + 0.2, (i/ms_length) / 4 + 80);
			}
		}
	}
	else{
		ms.map(mesh => {
			if(typeof(mesh.mesh_line) != "undefined" && typeof(mesh.mesh_line.dispose) == "function"){
				mesh.mesh_line.dispose(false, true);
				mesh.mesh_line = {};
			}
		});
	}
}
function grid_square_of_meshes(ms){
	var ms_length = ms.length;
	var nb_lines = Math.sqrt(ms_length);
	//if(glo.mode_check.getCheck("link")){
	if(1 == 1){
		for (var i = 1; i < ms_length; i++) {
			if(i%nb_lines != 0){
				if(typeof(ms[i].mesh_line_grid) == "undefined" || typeof(ms[i].mesh_line_grid.dispose) != "function"){
					if(typeof(ms[i + nb_lines - 0]) != "undefined"){
						var path = [
							new BABYLON.Vector3(ms[i - 1].position.x, ms[i - 1].position.y, ms[i - 1].position.z),
							new BABYLON.Vector3(ms[i].position.x, ms[i].position.y, ms[i].position.z),
							new BABYLON.Vector3(ms[i + nb_lines - 0].position.x, ms[i + nb_lines - 0].position.y, ms[i + nb_lines - 0].position.z),
						];
					}
					else{
						var path = [
							new BABYLON.Vector3(ms[i - 1].position.x, ms[i - 1].position.y, ms[i - 1].position.z),
							new BABYLON.Vector3(ms[i].position.x, ms[i].position.y, ms[i].position.z),
						];
					}
					ms[i].mesh_line_grid = BABYLON.MeshBuilder.CreateLines("lines", {points: path, updatable: true, useVertexAlpha: true, }, glo.scene);
				}
				else{
					if(typeof(ms[i + nb_lines - 0]) != "undefined"){
						var path = [
							new BABYLON.Vector3(ms[i - 1].position.x, ms[i - 1].position.y, ms[i - 1].position.z),
							new BABYLON.Vector3(ms[i].position.x, ms[i].position.y, ms[i].position.z),
							new BABYLON.Vector3(ms[i + nb_lines - 0].position.x, ms[i + nb_lines - 0].position.y, ms[i + nb_lines - 0].position.z),
						];
					}
					else{

					}
					ms[i].mesh_line_grid = BABYLON.MeshBuilder.CreateLines("lines", {points: path,
						instance: ms[i].mesh_line_grid,
						colors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)],
						useVertexAlpha: true,
					});
					ms[i].mesh_line_grid.color = new BABYLON.Color3(i/ms_length, (i/ms_length) / 2 + 0.2, (i/ms_length) / 4 + 80);
				}
			}
		}
	}
	else{
		ms.map(mesh => {
			if(typeof(mesh.mesh_line_grid) != "undefined" && typeof(mesh.mesh_line_grid.dispose) == "function"){
				mesh.mesh_line_grid.dispose(false, true);
				mesh.mesh_line_grid = {};
			}
		});
	}
}
function link_meshes_to_closest(ms){
	var ms_length = ms.length;
	if(glo.mode_check.getCheck("link_closest")){
		for (var i = 0; i < ms_length; i++) {
			var mesh_closest = find_closests(meshes, ms[i]);
			var path = [];
			mesh_closest.map(mc =>{
				path.push(new BABYLON.Vector3(mc.position.x, mc.position.y, mc.position.z));
				path.push(new BABYLON.Vector3(ms[i].position.x, ms[i].position.y, ms[i].position.z));
			});
			if(typeof(ms[i].mesh_line_closest) == "undefined" || typeof(ms[i].mesh_line_closest.dispose) != "function"){
				ms[i].mesh_line_closest = BABYLON.MeshBuilder.CreateLines("lines", {points: path, updatable: true, useVertexAlpha: true, }, glo.scene);
			}
			else{
				ms[i].mesh_line_closest = BABYLON.MeshBuilder.CreateLines("lines", {points: path,
					instance: ms[i].mesh_line_closest,
					colors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)],
					useVertexAlpha: true,
				});
				//ms[i].mesh_line_closest.color = new BABYLON.Color3(i/ms_length, (i/ms_length) / 2 + 0.2, (i/ms_length) / 4 + 80);
				//ms[i].mesh_line_closest.color = new BABYLON.Color3(0.12, 0.2, 0.72);
			}
			//ms[i].mesh_line_closest.color = new BABYLON.Color3(i/ms_length, (i/ms_length) / 2 + 0.2, (i/ms_length) / 4 + 80);
			ms[i].mesh_line_closest.color = new BABYLON.Color3(1, 0.24, 0.12);
		}
		var nb_tours = 2;
		if(ms_length > 125 && ms_length < 250){
			nb_tours = 2;
		}
		else if(ms_length >= 250 && ms_length < 500){
			nb_tours = 50;
		}
		if(glo.nb_clo%2 == 0){
			ms.map(mesh => {
				if(typeof(mesh.mesh_line_closest) != "undefined" && typeof(mesh.mesh_line_closest.dispose) == "function"){
					mesh.mesh_line_closest.dispose(false, true);
					mesh.mesh_line_closest = {};
				}
			});
		}
	}
	else{
		ms.map(mesh => {
			if(typeof(mesh.mesh_line_closest) != "undefined" && typeof(mesh.mesh_line_closest.dispose) == "function"){
				mesh.mesh_line_closest.dispose(false, true);
				mesh.mesh_line_closest = {};
			}
		});
	}

	glo.nb_clo++;
}
function num_meshes(ms){
	if(glo.mode_check.getCheck("numero")){
		var ms_length = ms.length;
		for (var i = 0; i < ms_length; i++) {
			var myDynamicTexture = new BABYLON.DynamicTexture("num", {width:ms[i].taille_mesh * 1000, height:ms[i].taille_mesh * 1000}, glo.scene);
			myDynamicTexture.drawText(ms[i].num, glo.text.pos.x, glo.text.pos.y, "bold " + glo.text.size + "px monospace", "green", "white", true, true);
			ms[i].material.diffuseTexture = myDynamicTexture;
		}
	}
	else{
		var ms_length = ms.length;
		for (var i = 0; i < ms_length; i++) {
			var myDynamicTexture = new BABYLON.DynamicTexture("num", {width:ms[i].taille_mesh * 1000, height:ms[i].taille_mesh * 1000}, glo.scene);
			myDynamicTexture.drawText(" ", glo.text.pos.x, glo.text.pos.y, "bold " + glo.text.size + "px monospace", "green", "white", true, true);
			ms[i].material.diffuseTexture = myDynamicTexture;
		}
	}
	rotate_meshes_self(ms, {x: 0, y: 0, z: 3.125});
}

function calcul_cohesion_2_meshes(mesh1, mesh2){
	var div_vitesse = ((mesh1.cohesion_posee + mesh2.cohesion_posee) / 2) * glo.cohesion;

	if(!glo.mode_check.getCheck('collision')){
		mesh1.virtual_vx /= div_vitesse;
		mesh1.virtual_vy /= div_vitesse;
		mesh1.virtual_vz /= div_vitesse;
	}
	else if(!collisioner){
		var m1 = mesh1.z_masse; var m2 = mesh2.z_masse;
		var vx1 = mesh1.z_vx; var vy1 = mesh1.z_vy; var vz1 = mesh1.z_vz;
		var vx2 = mesh2.z_vx; var vy2 = mesh2.z_vy; var vz2 = mesh2.z_vz;

		mesh1.virtual_vx += (((m1 - m2) / (m1 + m2)) * vx1) + (((2 * m2) / (m1 + m2)) * vx2);
		mesh1.virtual_vy += (((m1 - m2) / (m1 + m2)) * vy1) + (((2 * m2) / (m1 + m2)) * vy2);
		mesh1.virtual_vz += (((m1 - m2) / (m1 + m2)) * vz1) + (((2 * m2) / (m1 + m2)) * vz2);

		mesh1.collisioners.push(mesh2);
	}
	mesh1.collision = true;
}

function add_cube_of_meshes(nb_meshes, taille_mesh, taille, masse, pos){
	var cube_of_meshes = [];
	for(var i = 0; i < nb_meshes; i++){
		for(var j = 0; j < nb_meshes; j++){
			for(var k = 0; k < nb_meshes; k++){
				var ajout_ts = 0;
				var scale_taille = 1;
				if(glo.mode.random_taille){
					var lim_taille = 1;
					ajout_ts = Math.random() * lim_taille;
					var coef = (taille_mesh + ajout_ts) / taille_mesh;
					scale_taille = Math.pow(coef, 0.9);
				}

				var x = pos.x + (taille * (i - parseInt(nb_meshes / 2)));
				var y = pos.y + (taille * (j - parseInt(nb_meshes / 2)));
				var z = (parseFloat(pos.z) + parseFloat((taille * (k - parseInt(nb_meshes / 2)))));

				cube_of_meshes.push(add_one_mesh(taille_mesh, taille, masse, {x: x, y: y, z: z}));
			}
		}
	}
	var x = glo.camera.getFrontPosition(glo.cam_dist).x;
	var y = glo.camera.getFrontPosition(glo.cam_dist).y;
	var z = glo.camera.getFrontPosition(glo.cam_dist).z;

	reorient_meshes(cube_of_meshes, true, false);

	translate_meshes(cube_of_meshes, -x, -y, -z);
	rotate_meshes(cube_of_meshes, 45, 0, 0);
	rotate_meshes(cube_of_meshes, 0, -22.5, 0);
	translate_meshes(cube_of_meshes, x, y, z);
}
function add_square_of_meshes(nb_meshes, taille_mesh, taille, masse, pos){
	var square_of_meshes = [];
	for(var i = 0; i < nb_meshes; i++){
		for(var j = 0; j < nb_meshes; j++){
			var ajout_ts = 0;
			var scale_taille = 1;
			if(glo.mode.random_taille){
				var lim_taille = 1;
				ajout_ts = Math.random() * lim_taille;
				var coef = (taille_mesh + ajout_ts) / taille_mesh;
				scale_taille = Math.pow(coef, 0.9);
			}

			var x = pos.x + (taille * (i - parseInt(nb_meshes / 2)));
			var y = pos.y + (taille * (j - parseInt(nb_meshes / 2)));
			var z = pos.z;

			square_of_meshes.push(add_one_mesh(taille_mesh, taille, masse, {x: x, y: y, z: z}));
		}
	}
	reorient_meshes(square_of_meshes, true, false);
}
function reorient_meshes(ms, on_x = true, on_y = true, alpha = glo.camera_start_alpha, beta = glo.camera_start_beta){
	var x = glo.camera.getFrontPosition(glo.cam_dist).x;
	var y = glo.camera.getFrontPosition(glo.cam_dist).y;
	var z = glo.camera.getFrontPosition(glo.cam_dist).z;
	var t_alpha = alpha - glo.camera.alpha;
	var t_beta = beta - glo.camera.beta;
	translate_meshes(ms, -x, -y, -z);
	if(on_x){ rotate_meshes(ms, t_alpha, 0, 0, true); }
	if(on_y){ rotate_meshes(ms, 0, t_beta, 0, true); }
	translate_meshes(ms, x, y, z);
}
function add_meshes_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, type = "circle"){
	pos = {x: 0, y: 0, z: 6 * glo.ecart_particules};
	var sup_i = 360 / nb_meshes;
	if(type == "circle"){
		var cercle_of_meshes = add_cercle_of_meshes_y(nb_meshes, taille_mesh, taille, masse, pos);
	}
	else if(type == "spiral"){
		var cercle_of_meshes = add_spiral_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, "y");
	}
	var meshes_to_return = cercle_of_meshes;
	var pos_mesh = {};
	cercle_of_meshes.map(mesh =>{
		for(var i = sup_i; i < 360 ; i+=sup_i){
			pos_mesh = rotate({x: mesh.position.x, y: mesh.position.y, z: mesh.position.z}, i, 0, 0);
			if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh)); }
		}
	});
	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function same_pos_to_one_meshes(ms, pos_mesh){
	var meshes_length = ms.length;
	for(var n = 0; n < meshes_length; n++){
		var dist_x = ms[n].position.x - pos_mesh.x;
		var dist_y = ms[n].position.y - pos_mesh.y;
		var dist_z = ms[n].position.z - pos_mesh.z;

		var dist = Math.sqrt((Math.pow(dist_x,2) + Math.pow(dist_y,2) + Math.pow(dist_z,2)));

		if(dist < 0.01){ return true; }
	}

	return false;
}
function add_cercle_of_meshes_y(nb_meshes, taille_mesh, taille, masse, pos){
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	var special_sup = 0;
	if(nb_meshes % 4 != 0 && nb_meshes % 2 == 0){ special_sup = sup_i; }
	else if(nb_meshes % 2 != 0){
		var nb_ms_pose = 0;
		for(var i = -90; i <= 90 + special_sup; i+=sup_i){
			nb_ms_pose++;
		}
		if(i > 90){
			sup_i = sup_i - ((i - 90) / nb_ms_pose);
		}
	}
	var first = true;
	for(var i = -90; i <= 90.0000001 + special_sup; i+=sup_i){
		if(i > 90 && first){ i = 90; first = false; }
		var pos_mesh = rotate(pos, 0, i, 0);
		meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh));
	}

	return meshes_to_return;
}
function add_cercle_of_meshes_z(nb_meshes, taille_mesh, taille, masse, pos){
	pos = {x: 0, y: 6 * glo.ecart_particules, z: 0};
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	var k = 0;
	for(var i = 0; i < 360; i+=sup_i){
		k++;
		if(k <= nb_meshes){
			var pos_mesh = rotate(pos, 0, 0, i);
			meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh));
		}
	}
	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function add_tore_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, rots = {
	x1: 0,
	y1: 0,
	z1: 1,
	x2: 0,
	y2: 1,
	z2: 0,
	x3: 0,
	y3: 0,
	z3: 1,
}){
	pos = {x: 0, y: 6 * glo.ecart_particules, z: 0};
	var meshes_to_return = [];
	var centerCircles    = [];

	var sup_i = 360 / nb_meshes;
	var k = 0;
	for(var i = 0; i < 360; i+=sup_i){
		k++;
		if(k <= nb_meshes){
			centerCircles.push(rotate(pos, i * rots.x1, i * rots.y1, i * rots.z1));
		}
	}

	const offsetToCenter = taille*3;
	let n = 0;
	centerCircles.forEach(centerPos => {
		k = 0;
		let posToRotate = {x: centerPos.x + 0, y: centerPos.y + offsetToCenter, z: centerPos.z + 0};
		for(var i = 0; i < 360; i+=sup_i){
			k++;
			if(k <= nb_meshes){
				let pos_mesh = rotateAroundPoint(posToRotate, i * rots.x2, i * rots.y2, i * rots.z2, centerPos);
				pos_mesh     = rotateAroundPoint(pos_mesh, n * rots.x3, n * rots.y3, n * rots.z3, centerPos);
				if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh)); }
			}
		}
		n += sup_i;
	});


	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	/*var x = glo.camera.getFrontPosition(glo.cam_dist).x;
	var y = glo.camera.getFrontPosition(glo.cam_dist).y;
	var z = glo.camera.getFrontPosition(glo.cam_dist).z;
	reorient_meshes(meshes_to_return, true, false);
	translate_meshes(meshes_to_return, -x, -y, -z);*/

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = 1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function add_spiral_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, rot = "z"){
	pos = {x: 0, y: 6 * glo.ecart_particules, z: 0};
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	var k = 0;
	for(var i = 0; i < 2160; i+=sup_i){
		k++;
		//if(k <= nb_meshes){
			//pos.y /= glo.coeff_spiral;
			pos.y /= 1 + (sup_i / glo.coeff_spiral);
			switch(rot){
				case "x":
					var pos_mesh = rotate(pos, i, 0, 0);
					break;
				case "y":
					var pos_mesh = rotate(pos, 0, i, 0);
					break;
				case "z":
					var pos_mesh = rotate(pos, 0, 0, i);
					break;
			}
			meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh));
		//}
	}
	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function add_spiral_3d_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, rot = "z"){
	pos = {x: 0, y: 6 * glo.ecart_particules, z: 0};
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	var k = 0;
	for(var i = 0; i < 2160; i+=sup_i){
		k++;
		//if(k <= nb_meshes){
			//pos.y /= glo.coeff_spiral;
			pos.y /= 1 + (sup_i / glo.coeff_spiral);
			pos.z += sup_i / glo.coeff_spiral;
			switch(rot){
				case "x":
					var pos_mesh = rotate(pos, i, 0, 0);
					break;
				case "y":
					var pos_mesh = rotate(pos, 0, i, 0);
					break;
				case "z":
					var pos_mesh = rotate(pos, 0, 0, i);
					break;
			}
			meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh));
		//}
	}
	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;

	rotate_meshes(meshes_to_return, 0, -120, 0);
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function add_test_of_meshes(nb_meshes, taille_mesh, taille, masse, pos,
	options = {
		rot_1: "z",
		rot_2: "y",
		div_rot_1:{x: 1, y: 1, z: 1},
		div_rot_2:{x: 1, y: 1, z: 1},
		angle_1: {from: 0, to: 360},
		angle2: {from: 0, to: 360},
	}){

	if(typeof(options.pos) == "undefined") {
		pos = {x: 0, y: 0, z: 6 * glo.ecart_particules};
	}
	else {
		var pos = {};
		Object.assign(pos, options.pos);
	}
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	for(var i = options.angle_1.from; i < options.angle_1.to; i+=sup_i){
			pos.x/=options.div_rot_1.x;
			pos.y/=options.div_rot_1.y;
			pos.z/=options.div_rot_1.z;
			switch(options.rot_1){
				case "x":
					var pos_mesh = rotate(pos, i, 0, 0);
					break;
				case "y":
					var pos_mesh = rotate(pos, 0, i, 0);
					break;
				case "z":
					var pos_mesh = rotate(pos, 0, 0, i);
					break;
				case "xy":
				case "yx":
					var pos_mesh = rotate(pos, i, i, 0);
					break;
				case "xz":
				case "zx":
					var pos_mesh = rotate(pos, i, 0, i);
					break;
				case "yz":
				case "zy":
					var pos_mesh = rotate(pos, 0, i, i);
					break;
				case "xyz":
					var pos_mesh = rotate(pos, i, i, i);
					break;
			}
			if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh)); }
	}
	var m_to_r = [];
	Object.assign(m_to_r, meshes_to_return);
	m_to_r.map(mr => {
		for(var i = options.angle_2.from; i < options.angle_2.to; i+=sup_i){
			mr.position.x/=options.div_rot_2.x;
			mr.position.y/=options.div_rot_2.y;
			mr.position.z/=options.div_rot_2.z;
				switch(options.rot_2){
					case "x":
						var pos_mesh = rotate(mr.position, i, 0, 0);
						break;
					case "y":
						var pos_mesh = rotate(mr.position, 0, i, 0);
						break;
					case "z":
						var pos_mesh = rotate(mr.position, 0, 0, i);
						break;
					case "xz":
					case "zx":
						var pos_mesh = rotate(mr.position, i, 0, i);
						break;
					case "xy":
					case "yx":
						var pos_mesh = rotate(mr.position, i, i, 0);
						break;
					case "yz":
					case "zy":
						var pos_mesh = rotate(mr.position, 0, i, i);
						break;
					case "xyz":
						var pos_mesh = rotate(mr.position, i, i, i);
						break;
				}
				if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh)); }
		}
	});

	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;

	//rotate_meshes(meshes_to_return, 0, -120, 0);
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function add_spicube_of_meshes(nb_meshes, taille_mesh, taille, masse, pos){
	var cube_of_meshes = [];
	for(var i = 0; i < nb_meshes; i++){
		for(var j = 0; j < nb_meshes; j++){
			for(var k = 0; k < nb_meshes; k++){
				var ajout_ts = 0;
				var scale_taille = 1;
				if(glo.mode.random_taille){
					var lim_taille = 1;
					ajout_ts = Math.random() * lim_taille;
					var coef = (taille_mesh + ajout_ts) / taille_mesh;
					scale_taille = Math.pow(coef, 0.9);
				}

				var w = 10;

				var pos_mesh = rotate(pos, i * w, j * w, k * w);

				var x = pos_mesh.x + (taille * (i - parseInt(nb_meshes / 2)));
				var y = pos_mesh.y + (taille * (j - parseInt(nb_meshes / 2)));
				var z = (parseFloat(pos_mesh.z) + parseFloat((taille * (k - parseInt(nb_meshes / 2)))));

				cube_of_meshes.push(add_one_mesh(taille_mesh, taille, masse, {x: x, y: y, z: z}));
			}
		}
	}
	var x = glo.camera.getFrontPosition(glo.cam_dist).x;
	var y = glo.camera.getFrontPosition(glo.cam_dist).y;
	var z = glo.camera.getFrontPosition(glo.cam_dist).z;
	translate_meshes(cube_of_meshes, -x, -y, -z);
	rotate_meshes(cube_of_meshes, 45, 0, 0);
	rotate_meshes(cube_of_meshes, 0, -22.5, 0);
	translate_meshes(cube_of_meshes, x, y, z);
}
function add_dbl_rot_of_meshes(nb_meshes, taille_mesh, taille, masse, pos,
	options = {
		rot_1: "z",
		rot_2: "y",
		div_rot_1:{x: 1, y: 1, z: 1},
		div_rot_2:{x: 1, y: 1, z: 1},
		angle_1: {from: 0, to: 360},
		angle2: {from: 0, to: 360},
	}){

	if(typeof(options.pos) == "undefined") {
		pos = {x: 0, y: 0, z: 6 * glo.ecart_particules};
	}
	else {
		var pos = {};
		Object.assign(pos, options.pos);
	}
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	for(var i = options.angle_1.from; i < options.angle_1.to; i+=sup_i){
			pos.x/=options.div_rot_1.x;
			pos.y/=options.div_rot_1.y;
			pos.z/=options.div_rot_1.z;
			switch(options.rot_1){
				case "x":
					var pos_mesh = rotate(pos, i, 0, 0);
					break;
				case "y":
					var pos_mesh = rotate(pos, 0, i, 0);
					break;
				case "z":
					var pos_mesh = rotate(pos, 0, 0, i);
					break;
				case "xy":
				case "yx":
					var pos_mesh = rotate(pos, i, i, 0);
					break;
				case "xz":
				case "zx":
					var pos_mesh = rotate(pos, i, 0, i);
					break;
				case "yz":
				case "zy":
					var pos_mesh = rotate(pos, 0, i, i);
					break;
				case "xyz":
					var pos_mesh = rotate(pos, i, i, i);
					break;
			}
			if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh)); }
	}
	var m_to_r = [];
	Object.assign(m_to_r, meshes_to_return);
	m_to_r.map(mr => {
		for(var i = options.angle_2.from; i < options.angle_2.to; i+=sup_i){
			mr.position.x/=options.div_rot_2.x;
			mr.position.y/=options.div_rot_2.y;
			mr.position.z/=options.div_rot_2.z;
				switch(options.rot_2){
					case "x":
						var pos_mesh = rotate(mr.position, i, 0, 0);
						break;
					case "y":
						var pos_mesh = rotate(mr.position, 0, i, 0);
						break;
					case "z":
						var pos_mesh = rotate(mr.position, 0, 0, i);
						break;
					case "xz":
					case "zx":
						var pos_mesh = rotate(mr.position, i, 0, i);
						break;
					case "xy":
					case "yx":
						var pos_mesh = rotate(mr.position, i, i, 0);
						break;
					case "yz":
					case "zy":
						var pos_mesh = rotate(mr.position, 0, i, i);
						break;
					case "xyz":
						var pos_mesh = rotate(mr.position, i, i, i);
						break;
				}
				if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh)); }
		}
	});

	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	/*var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;

	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);*/

	return meshes_to_return;
}
function add_sphere_X_of_meshes(nb_meshes, taille_mesh, taille, masse, pos, rot_1 = "z", rot_2 = "y"){
	pos = {x: 0, y: 6 * glo.ecart_particules, z: 0};
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	for(var i = 0; i < 360; i+=sup_i){
		switch(rot_1){
			case "x":
				var pos_mesh = rotate(pos, i, 0, 0);
				break;
			case "y":
				var pos_mesh = rotate(pos, 0, i, 0);
				break;
			case "z":
				var pos_mesh = rotate(pos, 0, 0, i);
				break;
			case "xy":
				var pos_mesh = rotate(pos, i, i, 0);
				break;
			case "xz":
				var pos_mesh = rotate(pos, i, 0, i);
				break;
			case "yz":
				var pos_mesh = rotate(pos, 0, i, i);
				break;
			case "xyz":
				var pos_mesh = rotate(pos, i, i, i);
				break;
		}
		if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh, 'default', pos)); }
	}
	var m_to_r = [];
	Object.assign(m_to_r, meshes_to_return);
	m_to_r.map(mr => {
		for(var i = 0; i < 360; i+=sup_i){
			switch(rot_2){
				case "x":
					var pos_mesh = rotate(mr.position, i, 0, 0);
					break;
				case "y":
					var pos_mesh = rotate(mr.position, 0, i, 0);
					break;
				case "z":
					var pos_mesh = rotate(mr.position, 0, 0, i);
					break;
				case "xz":
				case "zx":
					var pos_mesh = rotate(mr.position, i, 0, i);
					break;
				case "xy":
				case "yx":
					var pos_mesh = rotate(mr.position, i, i, 0);
					break;
				case "yz":
				case "zy":
					var pos_mesh = rotate(mr.position, 0, i, i);
					break;
				case "xyz":
					var pos_mesh = rotate(mr.position, i, i, i);
					break;
			}
			if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh)); }
		}
	});

	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;

	//rotate_meshes(meshes_to_return, 0, -120, 0);
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function add_custom_meshes(nb_meshes, taille_mesh, taille, masse, pos, rot = "z"){
	pos = {x: 0, y: 6 * glo.ecart_particules, z: 0};
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	var k = 0;
	for(var i = 0; i < 2160; i+=sup_i){
		k++;
		//if(k <= nb_meshes){
			//pos.y /= glo.coeff_spiral;
			pos.y /= 1 + (sup_i / glo.coeff_spiral);
			pos.z += sup_i / glo.coeff_spiral;
			switch(rot){
				case "x":
					var pos_mesh = rotate(pos, i, 0, 0);
					break;
				case "y":
					var pos_mesh = rotate(pos, 0, i, 0);
					break;
				case "z":
					var pos_mesh = rotate(pos, 0, 0, i);
					break;
			}
			meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh));
		//}
	}
	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;

	rotate_meshes(meshes_to_return, 0, -120, 0);
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function add_cercles_of_meshes(nb_meshes, taille_mesh, taille, masse, pos){
	pos = {x: 0, y: 6 * glo.ecart_particules, z: 0};
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	var k = 0;
	for(var n = 0; n < 6; n++){
		for(var i = 0; i < 360; i+=sup_i){
			var pos_mesh = rotate(pos, 0, 0, i);
			if(!same_pos_to_one_meshes(meshes_to_return, pos_mesh)){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh)); }
		}
		pos.y -= 1 * glo.ecart_particules;
	}
	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	var signe_z = 1;
	if(glo.camera.position.z > 0){ signe_z = -1; }
	var trans_z = glo.camera.position.z + (glo.cam_pose * signe_z);
	var trans_x = glo.camera.position.x;
	var trans_y = glo.camera.position.y;
	translate_meshes(meshes_to_return, trans_x, trans_y, trans_z);

	return meshes_to_return;
}
function add_pyramide_of_meshes(nb_meshes, taille_mesh, taille, masse, pos){
	var meshes_to_return = [];
	var k_start = 0; var k_end = nb_meshes;
	for(var k = 0; k < nb_meshes; k++){
		k_start = k-0; k_end = nb_meshes - k;
		for(var i = k_start; i < k_end; i++){
			for(var j = k_start; j < k_end; j++){
				var ajout_ts = 0;
				var scale_taille = 1;
				if(glo.mode.random_taille){
					var lim_taille = 1;
					ajout_ts = Math.random() * lim_taille;
					var coef = (taille_mesh + ajout_ts) / taille_mesh;
					scale_taille = Math.pow(coef, 0.9);
				}

				var x = pos.x + (taille * (i - parseInt(nb_meshes / 2)));
				var y = pos.y + (taille * (j - parseInt(nb_meshes / 2)));
				var z = (parseFloat(pos.z) + parseFloat((taille * (k - parseInt(nb_meshes / 2)))));

				if(!same_pos_to_one_meshes(meshes_to_return, {x: x, y: y, z: z})){ meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, {x: x, y: y, z: z})); }
			}
		}
	}

	var x = glo.camera.getFrontPosition(glo.cam_dist).x;
	var y = glo.camera.getFrontPosition(glo.cam_dist).y;
	var z = glo.camera.getFrontPosition(glo.cam_dist).z;
	translate_meshes(meshes_to_return, -x, -y, -z);
	//rotate_meshes(meshes_to_return, 45, 0, 0);
	rotate_meshes(meshes_to_return, 0, -90, 0);
	translate_meshes(meshes_to_return, x, y, z);

	goToMeanMeshesPos(meshes_to_return);

	return meshes_to_return;
}
function translate_meshes(ms, x, y, z){
	ms.map(mesh => {
		mesh.virtual_x += x;
		mesh.virtual_y += y;
		mesh.virtual_z += z;
		mesh.position.x = mesh.virtual_x;
		mesh.position.y = mesh.virtual_y;
		mesh.position.z = mesh.virtual_z;
	});
}
function rotate_meshes(ms, x, y, z, rad = false){
	ms.map(mesh => {
		var pos_mesh = rotate({x: mesh.position.x, y: mesh.position.y, z: mesh.position.z}, x, y, z, rad);
		mesh.virtual_x = pos_mesh.x;
		mesh.virtual_y = pos_mesh.y;
		mesh.virtual_z = pos_mesh.z;
		mesh.position.x = mesh.virtual_x;
		mesh.position.y = mesh.virtual_y;
		mesh.position.z = mesh.virtual_z;
	});
}
function add_cercle_of_meshes_test(nb_meshes, taille_mesh, taille, masse, pos){
	var meshes_to_return = [];
	var sup_i = 360 / nb_meshes;
	var k = 0;
	for(var i = 0; i < 360; i+=sup_i){
		k++;
		if(k <= nb_meshes){
			var pos_mesh = rotate(pos, i/5, i, i/3);
			meshes_to_return.push(add_one_mesh(taille_mesh, taille, masse, pos_mesh));
		}
	}
	if(glo.mode_check.getCheck('meta_mesh')){ glo.id_meta_mesh++; }

	return meshes_to_return;
}

//*****************ROTATE EN 3D SUR AXE CHOISI*****************
function rotateAroundPoint(pos, pitch, roll, yaw, center, rad = false) {
    var pitch_rad = rad ? pitch : pitch * Math.PI / 180;
    var roll_rad = rad ? roll : roll * Math.PI / 180;
    var yaw_rad = rad ? yaw : yaw * Math.PI / 180;

    var cos = Math.cos;
    var sin = Math.sin;

    // Matrice de rotation
    var cosa = cos(yaw_rad);
    var sina = sin(yaw_rad);
    var cosb = cos(pitch_rad);
    var sinb = sin(pitch_rad);
    var cosc = cos(roll_rad);
    var sinc = sin(roll_rad);

    var Axx = cosa * cosb;
    var Axy = cosa * sinb * sinc - sina * cosc;
    var Axz = cosa * sinb * cosc + sina * sinc;

    var Ayx = sina * cosb;
    var Ayy = sina * sinb * sinc + cosa * cosc;
    var Ayz = sina * sinb * cosc - cosa * sinc;

    var Azx = -sinb;
    var Azy = cosb * sinc;
    var Azz = cosb * cosc;

    // Translation pour centrer la rotation
    var dx = pos.x - center.x;
    var dy = pos.y - center.y;
    var dz = pos.z - center.z;

    // Application de la matrice de rotation
    var pos_to_return = {};
    pos_to_return.x = Axx * dx + Axy * dy + Axz * dz + center.x;
    pos_to_return.y = Ayx * dx + Ayy * dy + Ayz * dz + center.y;
    pos_to_return.z = Azx * dx + Azy * dy + Azz * dz + center.z;

    return pos_to_return;
}

function rotate(pos, pitch, roll, yaw, rad = false) {
	var pitch_rad = pitch * Math.PI / 180;
	var roll_rad = roll * Math.PI / 180;
	var yaw_rad = yaw * Math.PI / 180;

	if(rad){
		pitch_rad = pitch;
		roll_rad = roll;
		yaw_rad = yaw;
	}

	var cos = Math.cos;
	var sin = Math.sin;

	var cosa = cos(yaw_rad);
	var sina = sin(yaw_rad);

	var cosb = cos(pitch_rad);
	var sinb = sin(pitch_rad);

	var cosc = cos(roll_rad);
	var sinc = sin(roll_rad);

	var Axx = cosa*cosb;
	var Axy = cosa*sinb*sinc - sina*cosc;
	var Axz = cosa*sinb*cosc + sina*sinc;

	var Ayx = sina*cosb;
	var Ayy = sina*sinb*sinc + cosa*cosc;
	var Ayz = sina*sinb*cosc - cosa*sinc;

	var Azx = -sinb;
	var Azy = cosb*sinc;
	var Azz = cosb*cosc;

	var cx = 0; var cy = 0; var cz = 0;

	var px = pos.x;
	var py = pos.y;
	var pz = pos.z;

	var pos_to_return = {};

	pos_to_return.x = Axx*px + Axy*py + Axz*pz;
	pos_to_return.y = Ayx*px + Ayy*py + Ayz*pz;
	pos_to_return.z = Azx*px + Azy*py + Azz*pz;

	return pos_to_return;
}

$("#renderCanvas").on('pointerup', function (e) {
	var side_of_click = "aucun";
	if(e.which == 1){ side_of_click = "gauche"; }
	if(e.which == 3){ side_of_click = "droit"; }

	if(side_of_click == "droit"){
		if(glo.mode.random){
			add_meshes(glo.nb_particules, 0.2, glo.ecart_particules, {random: glo.mode.random, scale: glo.masse_particules, },
			{x: glo.camera.getFrontPosition(glo.cam_dist).x, y: glo.camera.getFrontPosition(glo.cam_dist).y, z: glo.camera.getFrontPosition(glo.cam_dist).z, });
		}
		else{
			add_meshes(glo.nb_particules, 0.2, glo.ecart_particules, {random: glo.mode.random, scale: glo.masse_particules, },
			{x: glo.camera.getFrontPosition(glo.cam_dist).x, y: glo.camera.getFrontPosition(glo.cam_dist).y, z: glo.camera.getFrontPosition(glo.cam_dist).z, });
		}
	}
	else if(side_of_click == "gauche"){

	}

});

g.scene.onPointerDown = function (evt, pickResult) {
	if (pickResult.hit && evt.button == 2) {

	}
	else{
		try{
			if(pickResult.pickedMesh.position.x != 0 && pickResult.pickedMesh.position.y != 0 && pickResult.pickedMesh.position.z != 0){
				//glo.camera.focusOn([pickResult.pickedMesh], true);
				if(!glo.mode_check.getCheck('selection')){
					goToMesh(pickResult.pickedMesh);
					if(glo.mode.cameraFollowMesh){
						glo.meshToFollowByCamera = pickResult.pickedMesh;
					}
				}
				else{
					//pickResult.pickedMesh
				}
			}
		}
		catch(error){

		}
	}
};

function goToMesh(mesh){
	const pos = mesh.position;

	glo.camera.setTarget(new BABYLON.Vector3(pos.x, pos.y, pos.z));
	glo.camera.setPosition(new BABYLON.Vector3(pos.x, pos.y, pos.z - 12));
}

function color(meshs){
	meshs.map(mesh => {
	  var couleur = {};
		couleur.color = {};

		couleur.color.r = 2; couleur.color.v = 2; couleur.color.b = 2; couleur.color.a = 1; var pow = Math.pow;
		var modulation = 0;
		//var is_acceleration = false;
		if(is_acceleration){ var modulation = mesh.acceleration * glo.modulation * 10; }
		else{ var modulation = mesh.vitesse * glo.modulation; }

		var v_moy = glo.vitesse_moyenne || 1;
		var a_moy = glo.acceleration_moyenne || 1;
		mesh.percent_to_v_moy = (mesh.vitesse / v_moy) * 100; mesh.percent_to_a_moy = (mesh.acceleration / a_moy) * 100;

		//var mode_moyenne = false;
		if(mode_moyenne){
			var k_m = Math.E;
			if(is_acceleration){ modulation = mesh.percent_to_a_moy * k_m; }
			else{ modulation = mesh.percent_to_v_moy * k_m; }
		}
		else{
			var k_m = 10;
			if(is_acceleration){ modulation *= k_m; }
			else{ modulation *= k_m; }
		}

		var r_plafond = 255; var v_plafond = 1; var b_plafond = 1;
		var k_mod = 2;
		var min = glo.modulation * 0.01; var max = glo.modulation;
		var plafond = glo.modulation * 10;
		var gris_fond_save = 0;

		//*************MODE VITESSE OU ACCÉLÉRATION******************
		if(modulation > plafond){
			//************************************COLOR ROUGE VERS BLANC************************************
			couleur.color.r = 255; couleur.color.v = parseInt(modulation/100); couleur.color.b = parseInt(modulation/100);
		}
		//************************************COLOR ORANGE VERS ROUGE************************************
		else if(modulation > max + 200){
			couleur.color.r = parseInt(modulation/2); couleur.color.v = 255 - parseInt(Math.pow(modulation, 1.5)/12);
		}
		//************************************COLOR ORANGE VERS ROUGE************************************
		else if(modulation > max){
			couleur.color.r = parseInt(modulation/2); couleur.color.v = 255 - parseInt(Math.pow(modulation, 1.2)/12);
		}
		//************************************COLOR BLEU À VERT************************************
		else if(modulation > min && modulation <= (max - 100)){
			couleur.color.v = parseInt(modulation/2); couleur.color.b = 255 - parseInt(modulation/2);
		}
		//************************************COLOR VERT À JAUNE************************************
		else if(modulation > (min + 0) && modulation <= (max - 66)){
			couleur.color.r = parseInt(modulation/12); couleur.color.v = parseInt(modulation/2);
		}
		//************************************COLOR JAUNE************************************
		else if(modulation > (min + 0) && modulation <= (max - 33)){
			couleur.color.r = parseInt(modulation/2); couleur.color.v = parseInt(modulation/2);
		}
		//************************************COLOR JAUNE À ORANGE************************************
		else if(modulation > (min + 0) && modulation <= (max - 0)){
			couleur.color.r = parseInt(modulation/1.2); couleur.color.v = 255 - parseInt(Math.pow(modulation, 1.12)/15);
		}
		//************************************COLOR BLEU CLAIR A FONCE************************************
		else if(modulation <= min){
			couleur.color.b = parseInt(modulation) + 255 - min + 1;
		}

		//mesh.material.diffuseColor = new BABYLON.Color3(1/couleur.color.r, 1/couleur.color.v, 1/couleur.color.b);
		//mesh.material.specularColor = new BABYLON.Color3(1/couleur.color.r, 1/couleur.color.v, 1/couleur.color.b);

		//mesh.material.emissiveColor = new BABYLON.Color3(1/couleur.color.r, 1/couleur.color.v, 1/couleur.color.b);
		//mesh.material.ambientColor = new BABYLON.Color3(1/couleur.color.r, 1/couleur.color.v, 1/couleur.color.b);

		var div_emissiveColor = glo.div_emissive_color;
		var div_diffuseColor = glo.div_diffuse_color;
		var red_emissive = couleur.color.r / div_emissiveColor;
		var green_emissive = couleur.color.v / div_emissiveColor;
		var blue_emissive = couleur.color.b / div_emissiveColor;
		var red_diffuse = couleur.color.r / div_diffuseColor;
		var green_diffuse = couleur.color.v / div_diffuseColor;
		var blue_diffuse = couleur.color.b / div_diffuseColor;
		var color_emissive = new BABYLON.Color3(red_emissive, green_emissive, blue_emissive);
		var color_diffuse = new BABYLON.Color3(red_diffuse, green_diffuse, blue_diffuse);
		if(mesh.selection){
			color_emissive = new BABYLON.Color3(1, 1, 1);
			color_diffuse = new BABYLON.Color3(1, 1, 1);
		}
		else if(mesh.cible){
			color_emissive = new BABYLON.Color3(1, 0, 1);
			color_diffuse = new BABYLON.Color3(1, 0, 1);
		}
		if(!mesh.pose_fixe){
			mesh.material.emissiveColor = color_emissive;
			mesh.material.diffuseColor = color_diffuse;

			if(glo.mode_check.getCheck('trail') && glo.trail.color){
				mesh.trail.material.emissiveColor = color_emissive;
				mesh.trail.material.diffuseColor = color_diffuse;
			}
		}
		else if(mesh.selection){
			mesh.material.emissiveColor = color_emissive;
			mesh.material.diffuseColor = color_diffuse;
		}
		else{
			mesh.material.emissiveColor = glo.bab_colors.emissive_fixe;
			mesh.material.diffuseColor = glo.bab_colors.diffuse_fixe;
		}
		//mesh.material.ambientColor = new BABYLON.Color3(couleur.color.r / glo.div_ambiant_color,
		//couleur.color.v / glo.div_ambiant_color, couleur.color.b / glo.div_ambiant_color);

		//mesh.material.diffuseColor = new BABYLON.Color3(couleur.color.r, couleur.color.v, couleur.color.b);
	});
}

function inverse_g(ms){
	ms.map( mesh => {
		mesh.z_masse = -mesh.z_masse;
	});
}

function raz_meshes(){
	meshes.map(ms =>{
		if(typeof(ms.mesh_line) != "undefined" && typeof(ms.mesh_line.dispose) == "function"){
			ms.mesh_line.dispose(false, true);
			ms.mesh_line = {};
		}
		if(typeof(ms.mesh_line_closest) != "undefined" && typeof(ms.mesh_line_closest.dispose) == "function"){
			ms.mesh_line_closest.dispose(false, true);
			ms.mesh_line_closest = {};
		}
		glo.scene.removeMesh(ms);
		ms.dispose(false, true);
		ms = {};

		add_trails(false);
	});

	num_mesh = 0;

	glo.scene.clearCachedVertexData();
	glo.scene.cleanCachedTextureBuffer();

	glo.camera.setPosition(new BABYLON.Vector3(0,0, -glo.cam_pose));
	glo.camera.setTarget(BABYLON.Vector3.Zero());

	meshes = [];

	glo.sliders_left.getSlider("masse_var").value = 5;
	glo.sliders_left.getSlider("taille_var").value = 0;
}

function meshes_visibility(ms){
	var visibility = glo.mode_check.getCheck("visibility");
	ms.map(mesh => {
		mesh.visibility = !visibility;
	});
}
function save_meshes(){
	glo.meshes_save = [];
	meshes.map(mesh => {
		var mesh_save = {};
		Object.assign(mesh_save, mesh);
		glo.meshes_save.push(mesh_save);
	});
}
function restore_meshes(){
	if(glo.meshes_save){
		raz_meshes();
		glo.meshes_save.map(mesh_save => {
			var masse = {random: glo.mode.random, scale: mesh_save.z_masse * 1000, };
			add_one_mesh(mesh_save.taille_mesh, 0, masse,
				{x: mesh_save._position.x, y: mesh_save._position.y, z: mesh_save._position.z},
				{x: mesh_save.z_vx, y: mesh_save.z_vy, z: mesh_save.z_vz},
			);
		});
	}
}

function save_state(){
	glo_save = {};

	save_sliders(glo.sliders_left);
	save_sliders(glo.sliders_right);
	save_sliders(glo.sliders_left_suit);
	save_sliders(glo.sliders_right_suit);

	Object.assign(glo_save, glo);
}
function restore_state(){
	glo = {};

	Object.assign(glo, glo_save);

	glo.slider_echelle.value = glo.echelle_lin;

	update_sliders(glo.sliders_left);
	update_sliders(glo.sliders_right);
	update_sliders(glo.sliders_left_suit);
	update_sliders(glo.sliders_right_suit);
}

function update_sliders(sliders){
	sliders.map(sl => {
		for(var i = 0; i < glo.sliders_val.length; i++){
			if(glo.sliders_val[i].name == sl.name){
				sl.updating = true;
				sl.value = glo.sliders_val[i].value;
			}
		}
	});
}
function save_sliders(sliders){
	sliders.map(sl => {
		glo.sliders_val.push({ name: sl.name, value: sl.value });
	});
}

/*g.scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
            console.log("POINTER DOWN");
            break;
        case BABYLON.PointerEventTypes.POINTERUP:
            console.log("POINTER UP");
            break;
        case BABYLON.PointerEventTypes.POINTERMOVE:
            console.log("POINTER MOVE");
            break;
        case BABYLON.PointerEventTypes.POINTERWHEEL:
            console.log("POINTER WHEEL");
            break;
        case BABYLON.PointerEventTypes.POINTERPICK:
            console.log("POINTER PICK");
            break;
        case BABYLON.PointerEventTypes.POINTERTAP:
            console.log("POINTER TAP");
            break;
        case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
            console.log("POINTER DOUBLE-TAP");
            break;
    }
});*/


function who_are_the_meshes(prop, val, op = "="){
	meshes.map(mesh => {
		switch (op) {
			case "=":
				if(mesh[prop] == val){
					console.log("Mesh num: " + mesh.num);
					console.log("Mesh id: " + mesh.id);
					mesh.selection = true;
				}
				else{
					mesh.selection = false;
				}
				break;
			case "<":
				if(mesh[prop] < val){
					console.log("Mesh num: " + mesh.num);
					console.log("Mesh id: " + mesh.id);
					mesh.selection = true;
				}
				else{
					mesh.selection = false;
				}
				break;
			case "<=":
				if(mesh[prop] <= val){
					console.log("Mesh num: " + mesh.num);
					console.log("Mesh id: " + mesh.id);
					mesh.selection = true;
				}
				else{
					mesh.selection = false;
				}
				break;
			case ">":
				if(mesh[prop] > val){
					console.log("Mesh num: " + mesh.num);
					console.log("Mesh id: " + mesh.id);
					mesh.selection = true;
				}
				else{
					mesh.selection = false;
				}
				break;
			case ">=":
				if(mesh[prop] >= val){
					console.log("Mesh num: " + mesh.num);
					console.log("Mesh id: " + mesh.id);
					mesh.selection = true;
				}
				else{
					mesh.selection = false;
				}
				break;
		}
	});
}

const viewsXYZ = ['X', '-X', 'Y', '-Y', 'Z', '-Z'];
function* selectNextViewXYZGen(){
	var index = 0;
	while(true){
		index++;
		if(index == viewsXYZ.length){ index = 0; }
		yield viewsXYZ[index];
	}
}

const selectNextViewXYZ = selectNextViewXYZGen();

function viewOnAxe(axe){
	switch(axe){
		case 'X':
			viewOnX();
		break;
		case '-X':
			viewOnX(-1);
		break;
		case 'Y':
			viewOnY();
		break;
		case '-Y':
			viewOnY(-1);
		break;
		case 'Z':
			viewOnZ();
		break;
		case '-Z':
			viewOnZ(-1);
		break;
	}
}

function viewOnX(orient = 1){
	glo.camera.alpha = 0;
	glo.camera.beta = PI/2;
	if(orient == 1){
		glo.camera.upVector = new BABYLON.Vector3(0,1,0);
	}
	else{
		glo.camera.upVector = new BABYLON.Vector3(0,0,1);
	}
}
function viewOnY(orient = 1){
	if(orient == 1){
		glo.camera.alpha = -PI/2;
		glo.camera.beta = PI/2;
		glo.camera.upVector = new BABYLON.Vector3(0,0,1);
	}
	else{
		glo.camera.alpha = -PI;
		glo.camera.beta = PI/2;
		glo.camera.upVector = new BABYLON.Vector3(1,0,0);
	}
}
function viewOnZ(orient = 1){
	glo.camera.alpha = PI/2;
	glo.camera.beta = PI/2;
	if(orient == 1){
		glo.camera.upVector = new BABYLON.Vector3(1,0,0);
	}
	else{
		glo.camera.upVector = new BABYLON.Vector3(0,1,0);
	}
}

function cameraFollowMesh(){
	if(glo.meshToFollowByCamera){
		glo.camera.focusOn([glo.meshToFollowByCamera], true);
	}
}

function meshesToOriginPosition(theMeshes = meshes){
	theMeshes.forEach(mesh => {
		mesh.position.x = mesh.startPos.x;
		mesh.position.y = mesh.startPos.y;
		mesh.position.z = mesh.startPos.z;

		mesh.virtual_x = mesh.startPos.x;
		mesh.virtual_y = mesh.startPos.y;
		mesh.virtual_z = mesh.startPos.z;

		mesh.z_vx = 0;
		mesh.z_vy = 0;
		mesh.z_vz = 0;

		mesh.virtual_vx = 0;
		mesh.virtual_vy = 0;
		mesh.virtual_vz = 0;

		mesh.z_ax = 0;
		mesh.z_ay = 0;
		mesh.z_az = 0;
	});
}

function goToMeshNearestToOthers(theMeshes = meshes){
	glo.meshToFollowByCamera = false;

	theMeshes.forEach(meshSource => {
		meshSource.distToOthers = false;
		theMeshes.forEach(meshTarget => {
			if(meshSource !== meshTarget){
				meshSource.distToOthers += meshSource.dist_to_mesh(meshTarget).dist;
			}
		});
	});

	theMeshes.forEach(mesh => {
		if(!glo.meshToFollowByCamera || glo.meshToFollowByCamera.distToOthers > mesh.distToOthers){
			glo.meshToFollowByCamera = mesh;
		}
	});

	glo.camera.focusOn([glo.meshToFollowByCamera], true);
}

//*****************CALCUL LA POSITION DE LA SOURIS*****************
function getMouse_Pos(canvas, evt) {
	var rect = canvas.getBoundingClientRect(); var W_C = 0; var H_C = 0;

	W_C = canvas.width / 2;
	H_C = canvas.height / 2;

	rect.left = 0;
	rect.top = 0;

	return {
		x: 75,
		y: 42
	};
}
