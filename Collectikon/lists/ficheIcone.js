

function(head, req) {

  // !json templates.ficheIcone
  // !code lib/mustache.js

  start({"headers":{"Content-Type":"text/html;charset=utf-8"}});

  var data = {
    icone: []
  };

  // On récupère l'objet JSON de la requête
  while (row = getRow())
  {
    	data.icone.push
        (
            {

        	id: row.value._id,
                photo : row.value._attachments,
                couleur: row.value.couleur,
                date: row.value.date,
                forme: row.value.forme,
                nom: row.value.nom,
                representation: row.value.representation,
                statut: row.value.statut,
                sujet: row.value.sujet,
                type: row.value.type,
                pov : row.value.pov,
                topic : row.value.topic
            }
        );
    }

  //On applique les valeurs à la page html comments
  return Mustache.to_html(templates.ficheIcone, data);
}