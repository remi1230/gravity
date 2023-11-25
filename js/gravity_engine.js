function calcul_gravity(){
	var meshes_lgth = meshes.length;
	var temps = glo.temps;
	var lim_formule = glo.lim_newton;
	var lim_cohesion = glo.cohesion_posee;
	var lim_dist_cohesion = glo.lim_cohesion;
	var mode_select = glo.mode.collision;
	var rotate_mesh = glo.mode.rotate_mesh;

	for(var i = 0; i < meshes_lgth; i++){
		if(!meshes[i].pose_fixe){
			var ind_i = i;
			var mesh_attire = meshes[ind_i];
			mesh_attire.z_ax = 0;
			mesh_attire.z_ay = 0;
			mesh_attire.z_az = 0;
			for(var j = 0; j < meshes_lgth; j++){
				//var ind_j = tab_haz[j];
				var ind_j = j;
				if(ind_i != ind_j){
					var mesh_attirant = meshes[ind_j];

					var mesure = mesh_attire.dist_to_mesh(mesh_attirant);

					var dist_x = mesure.dist_x;
					var dist_y = mesure.dist_y;
					var dist_z = mesure.dist_z;

					var dist = mesure.dist;
					var formule = Math.pow(dist, 3);

					var div_vitesse = ((mesh_attire.cohesion_posee + mesh_attirant.cohesion_posee) / 2) * lim_cohesion;
					var lim_dist = ((mesh_attire.taille_mesh + mesh_attirant.taille_mesh) / 2) * lim_dist_cohesion;

					var meta = false;
					if(mesh_attire.meta_mesh && mesh_attirant.meta_mesh){
						if(mesh_attire.id_meta_mesh == mesh_attirant.id_meta_mesh){
							meta = true;
						}
					}

					var collisioner = false;
					if(mode_select){
						for(var c = 0; c < mesh_attire.collisioners.length; c++){
							if(mesh_attire.collisioners[c] == mesh_attirant){
								if(dist > lim_dist){
									mesh_attire.collisioners.splice(c, 1);
									collisioner = false;
								}
								else{
									//Tester repositionner mesh_attire
									collisioner = true;
								}
								break;
							}
						}
					}

					//if(mesh_attire.collisioners.length > 0){ collisioner = true; }

					//calcul_cohesion_2_meshes(mesh_attire, mesh_attirant);

					if(dist <= lim_dist){
						if(!mode_select){
							mesh_attire.z_vx /= div_vitesse;
							mesh_attire.z_vy /= div_vitesse;
							mesh_attire.z_vz /= div_vitesse;
						}
						else if(!collisioner){
							var m1 = mesh_attire.z_masse; var m2 = mesh_attirant.z_masse;
							var vx1 = mesh_attire.z_vx; var vy1 = mesh_attire.z_vy; var vz1 = mesh_attire.z_vz;
							var vx2 = mesh_attirant.z_vx; var vy2 = mesh_attirant.z_vy; var vz2 = mesh_attirant.z_vz;

							mesh_attire.virtual_vx += (((m1 - m2) / (m1 + m2)) * vx1) + (((2 * m2) / (m1 + m2)) * vx2);
							mesh_attire.virtual_vy += (((m1 - m2) / (m1 + m2)) * vy1) + (((2 * m2) / (m1 + m2)) * vy2);
							mesh_attire.virtual_vz += (((m1 - m2) / (m1 + m2)) * vz1) + (((2 * m2) / (m1 + m2)) * vz2);

							mesh_attire.collisioners.push(mesh_attirant);
							mesh_attire.collision = true;
						}
					}
					if(formule != 0 && !meta){
						if(formule < lim_formule){ formule = lim_formule; }
						//if(dist > lim_formule){
							mesh_attire.z_ax += (dist_x * (mesh_attirant.z_masse / formule));
							mesh_attire.z_ay += (dist_y * (mesh_attirant.z_masse / formule));
							mesh_attire.z_az += (dist_z * (mesh_attirant.z_masse / formule));
						//}
					}
				}
				mesh_attire.acceleration = Math.sqrt((Math.pow(mesh_attire.z_ax,2) + Math.pow(mesh_attire.z_ay,2) + Math.pow(mesh_attire.z_az,2)));
			}

			mesh_attire.z_vx  += mesh_attire.z_ax;
			mesh_attire.z_vy  += mesh_attire.z_ay;
			mesh_attire.z_vz  += mesh_attire.z_az;

			mesh_attire.vitesse = Math.sqrt((Math.pow(mesh_attire.z_vx,2) + Math.pow(mesh_attire.z_vy,2) + Math.pow(mesh_attire.z_vz,2)));

			mesh_attire.virtual_x += mesh_attire.z_vx * temps;
			mesh_attire.virtual_y += mesh_attire.z_vy * temps;
			mesh_attire.virtual_z += mesh_attire.z_vz * temps;

			if(mesh_attire.is_trail){
				mesh_attire.computeWorldMatrix(true);
				add_trails(glo.mode_check.getCheck('trail'), [mesh_attire]);

				mesh_attire.is_trail = false;
			}
		}
	}

	color(meshes);

	var vit = 0; var acc = 0;
	for(var i = 0; i < meshes_lgth; i++){
		var mesh_attire = meshes[i];
		if(mode_select && mesh_attire.collision){
			mesh_attire.z_vx = mesh_attire.virtual_vx;
			mesh_attire.z_vy = mesh_attire.virtual_vy;
			mesh_attire.z_vz = mesh_attire.virtual_vz;

			mesh_attire.virtual_vx = 0;
			mesh_attire.virtual_vy = 0;
			mesh_attire.virtual_vz = 0;

			mesh_attire.virtual_x += mesh_attire.z_vx * temps;
			mesh_attire.virtual_y += mesh_attire.z_vy * temps;
			mesh_attire.virtual_z += mesh_attire.z_vz * temps;

			mesh_attire.collision = false;
		}
		mesh_attire.position = new BABYLON.Vector3(mesh_attire.virtual_x, mesh_attire.virtual_y, mesh_attire.virtual_z);
		vit += mesh_attire.vitesse;
		acc += mesh_attire.acceleration;
	}
	glo.vitesse_moyenne = vit / meshes_lgth;
	glo.acceleration_moyenne = acc / meshes_lgth;

	link_meshes_to_closest(meshes);
	link_meshes(meshes);
	meshes_visibility(meshes);

	if(rotate_mesh){ rotate_meshes_self( meshes, glo.rotation_self ); }
}
