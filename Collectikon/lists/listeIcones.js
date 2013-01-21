function(head, req) {

  // !json templates.listeIcones
  // !code lib/mustache.js

  start({"headers":{"Content-Type":"text/html;charset=utf-8"}});

  var data = {
    icone: []
  };

  // On récupère l'objet JSON de la requête
  while (row = getRow()) {
    //Si c'est un document topic, page de discussion
    	data.icone.push({

        	id: row.value._id,
                nom: row.value.nom
    	});
  }

  //On applique les valeurs à la page html comments
  return Mustache.to_html(templates.listeIcones, data);
}
