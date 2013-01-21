function(head, req) {

  // !json templates.ficheUtilisateur
  // !code lib/mustache.js

  start({"headers":{"Content-Type":"text/html;charset=utf-8"}});

  var data = {
    utilisateur: []
  };

  // On récupère l'objet JSON de la requête
  while (row = getRow()) {
    	data.utilisateur.push({

        	id: row.value._id,
                login: row.value.login,
                password: row.value.password,
                nom: row.value.nom,
                prenom: row.value.prenom,
                type: row.value.type,
                email: row.value.email
    	});
  }

  //On applique les valeurs à la page html comments
  return Mustache.to_html(templates.ficheUtilisateur, data);
}