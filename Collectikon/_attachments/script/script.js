var nombreNiveauArborescence = 0;
var niveauArborescence = 0;
var textFocus = false;
var divOver = false;
var identifiantPere = "0";

function connection()
{
    var login = document.getElementById("champLogin").value;
    var password = document.getElementById("champPassword").value;

    meConnecter(login, password);
}

function meConnecter(login, password)
{
    // On se connecte à la base
    db = $.couch.db("collectikon");
    
    // On appelle la view
    db.view("Collectikon/utilisateur", {
        // En cas de succès dans la récupération des données
        success: function(data) {
            var trouve = false;
            // Pour chaque utilisateur
            for(i in data.rows){
                // Si l'identifiant et le mot de passe correspondent
                if((data.rows[i].value.login == login)&&(data.rows[i].value.password == password))
                {
                    trouve = true;

                    // On stock le login de l'utilisateur dans une variable en local storage
                    window.sessionStorage.setItem('login', login);

                    // On stock le statut de l'utilisateur dans une variable en local storage
                    window.sessionStorage.setItem('statut', data.rows[i].value.statut);

                    // On recharge la page
                    window.location.reload();
                }
            }
            if(trouve == false)
            {
                // L'identifiant ou le mot de passe est incorrecte
                document.getElementById("alerteProblemeConnexion").style.visibility = "visible";
            }
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    });
}

function meDeconnecter()
{
    // On déstock le login de l'utilisateur
    window.sessionStorage.removeItem("login");

    // On déstock le statut de l'utilisateur
    window.sessionStorage.removeItem("statut");

    // On recharge la page
    window.location.reload();
}

function verifierConnexion()
{
    // On initialise la réponse à faux
    var verdict = false;

    // Si le stockage existe
    if(typeof(Storage)!=="undefined")
    {
        // Si la variable login existe
        if (sessionStorage.login)
        {
            // La réponse sera vrai
            verdict = true;
        }
        // Sinon
        else
        {
            // Elle sera faux
            verdict = false;
        }
    }

    // On retourne la réponse
    return verdict;
}


$("#tableNavigation").ready(function()
{
    if(window.sessionStorage.historique)
    {
        document.getElementById("ligneHistorique").innerHTML = window.sessionStorage.getItem("historique");
    }
    else
    {
        ajouterALHistorique("0", "Points de vue")
    }

    if(window.sessionStorage.idTopic)
    {
        genererPage(window.sessionStorage.getItem("idTopic"));
    }
    else
    {
        genererPage("0");
    }
});

function genererPage(idPere)
{
    
    identifiantPere = idPere;
    // On enregistre la ligne historique
    enregistrerHistorique();
    // On enregistre l'id de l'élément affiché
    enregistrerIdTopic();
    
    genererCodeHtmlListeSousTopic(idPere);
    genererCodeHtmlListeIcones(idPere);
}



function ajouterALHistorique(id, nom)
{
    niveauArborescence++;
    document.getElementById("ligneHistorique").innerHTML += "<li> <a href='javascript:genererPage(\"" + id + "\");javascript:reformuler(" + niveauArborescence + ");'>" + nom + "</a> <span class=\"divider\">/</span> </li>";
    enregistrerArborescenceParcourue(nom);
}

function reformuler(place)
{
    // On recompte le nombre d'enfant
    nombreEnfant = compterLesEnfants();

    // On initialise une variable à vrai
    var continuer = true;

    if(nombreEnfant == place) continuer = false;

    var tableauArboparcourue = recupererArborescenceParcourue().split(";");

    // Tant que cette variable est à vrai
    while(continuer == true)
    {
        // On supprime la dernière cellule de l'historique
        document.getElementById("ligneHistorique").removeChild(document.getElementById("ligneHistorique").lastChild);

        tableauArboparcourue.pop();

        // On recompte le nombre d'enfant
        nombreEnfant = compterLesEnfants();

        // Si le nombre d'enfant restant égale la place du lien où on a cliqué, on s'arrête là
        if(nombreEnfant == place) continuer = false;
    }

    sessionStorage.setItem("arboParcourue", tableauArboparcourue.join(";"));

    // On modifie la valeur du niveau d'arborescence
    niveauArborescence = place;

    enregistrerHistorique();
}

function genererTitreSousTopic()
{
    var nombreEnfant = compterLesEnfants();
    var titre = "";


    if(nombreEnfant == 1)
    {
        titre = '<li class="nav-header"><h3>Points de vue</h3></li>';
    }
    else if(nombreEnfant == 2)
    {
        titre = '<li class="nav-header"><h3>Topics</h3></li>';
    }
    else
    {
        titre = '<li class="nav-header"><h3>Sous-topics</h3></li>';
    }
    return titre;
}


function compterLesEnfants()
{
    var ul = document.getElementById("ligneHistorique");
    var nombre = 0;

    for (var i = 0; i < ul.childNodes.length; i++) {
        if (ul.childNodes[i].nodeName == "LI") {
                nombre++;
        }
    }

    return nombre;
}

function genererCodeHtmlListeSousTopic(idPere)
{
    // On initialise le code HTML
    var monCodeHtmlListeSousTopic = "";

    // On se connecte à la base
    db = $.couch.db("collectikon");

    // On appelle la view qui récupère les sous-topics
    db.view("Collectikon/repertoire", {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            monCodeHtmlListeSousTopic += genererTitreSousTopic();
            // Pour chaque utilisateur
            for(i in data.rows)
            {
                // Si le père du topic est celui indiqué en paramêtre
                if( data.rows[i].value.pere == idPere )
                {
                    // On ajoute ce topic dans le code
                    monCodeHtmlListeSousTopic
                        += "<li><a href='javascript:ajouterALHistorique(\"" + data.rows[i].value._id + "\", \"" + data.rows[i].value.nom + "\");javascript:genererPage(\"" + data.rows[i].value._id + "\")'>" + data.rows[i].value.nom + "</a></li>";
                }
            }

            if(adminEstConnecte())
            {
                monCodeHtmlListeSousTopic 
                    += "<li class='divider'></li><li class='active'><a href='javascript:gererCreationTopic()'>";

                var nombreEnfants = compterLesEnfants();

                if(nombreEnfants == 1) monCodeHtmlListeSousTopic += "Ajouter un point de vue";
                else if(nombreEnfants == 2) monCodeHtmlListeSousTopic += "Ajouter un topic";
                else monCodeHtmlListeSousTopic += "Ajouter un sous-topic";
                monCodeHtmlListeSousTopic 
                    += "</a></li>";
            }
            
            $('#listeNavigationTopic').html(monCodeHtmlListeSousTopic);
        },
        error: function(status)
        {
            alert("Un problème s'est produit.");
        }
    });
}

function adminEstConnecte()
{
    var verdict = false;

    if(window.sessionStorage.statut)
    {
        if(window.sessionStorage.getItem("statut") == "administrateur")
        {
            verdict = true;
        }
    }

    return verdict;
}

function genererCodeHtmlListeIcones(idPere)
{
    // On initialise le code HTML
    var monCodeHtmlListeIcones = "";

    // On se connecte à la base
    db = $.couch.db("collectikon");
    
    // On appelle la view
    db.view("Collectikon/listeIcones", {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            monCodeHtmlListeIcones += '<li class="nav-header"><h3>Icônes</h3></li>';
            // Pour chaque utilisateur
            for(i in data.rows)
            {
                if( data.rows[i].value.pere == idPere )
                {
                    monCodeHtmlListeIcones 
                        += '<li><a href="_rewrite/ficheIcone/' + data.rows[i].value._id + '" >' + data.rows[i].value.nom + '</a></li>';
                }
            }

            monCodeHtmlListeIcones 
                += "<li class='active'><a href='javascript:accederCreationIcone()'>Ajouter une icône</a></li>";

            $('#listeNavigationIcone').html(monCodeHtmlListeIcones);
        },
        error: function(status)
        {
            alert("Un problème s'est produit.");
        }
    });
}

function enregistrerEtAcceder(id)
{
    window.sessionStorage.setItem("idDerniereIcone", id);
}


function enregistrerHistorique()
{
    window.sessionStorage.setItem("historique", document.getElementById("ligneHistorique").innerHTML);
}

function enregistrerIdTopic()
{
    window.sessionStorage.setItem("idTopic", identifiantPere);
}

function accederCreationIcone()
{
    window.location.href = '_list/icone/icone';
}

$("#listeIcones").ready(function()
{
    var codeHTML = "";

    // On se connecte à la base
    db = $.couch.db("collectikon");

    // On appelle la view
    db.view("Collectikon/listeIcones", {
        // En cas de succès dans la récupération des données
        success: function(data) {
            // Pour chaque utilisateur
            for(i in data.rows){

                codeHTML += "<li><a href='_rewrite/ficheIcone/3b54d7999eb7d64ed1ccb0284b00ea43'>" + data.rows[i].value.nom + "</a></li>";

                $("#listeIcones").html( codeHTML );
            }
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    });

});

$("#options").ready(function()
{
    if(verifierConnexion())
    {
        $("#options").html( "<li><a href='_list/icone/icone'>Créer une nouvelle icône</a></li>" );
    }
    else
    {
        $("#options").html( "<li>Veuillez vous connecter</li>" );
    }
});

function ajouterTopic()
{
    var nombreEnfant = compterLesEnfants();
    var nomNouveauTopic = document.getElementById("nomNouveauTopic").value;

    if(nombreEnfant == 1)
    {
        db = $.couch.db("collectikon");

        db.saveDoc(
            {
                type : "point de vue",
                nom : nomNouveauTopic,
                pere : identifiantPere
            },
            {
                success: function()
                {
                    window.location.reload();
                    montrerAlerteSuccesCreation();
                }
            }
        );
    }
    else if(nombreEnfant == 2)
    {
        db = $.couch.db("collectikon");

        db.saveDoc(
            {
                type : "topic",
                nom : nomNouveauTopic,
                pere : identifiantPere
            },
            {
                success: function()
                {
                    window.location.reload();
                    montrerAlerteSuccesCreation();
                }
            }
        );
    }
    else
    {
        db = $.couch.db("collectikon");

        db.saveDoc(
            {
                type : "sous-topic",
                nom : nomNouveauTopic,
                pere : identifiantPere
            },
            {
                success: function()
                {
                    window.location.reload();
                    montrerAlerteSuccesCreation();
                }
            }
        );
    }
}

function supprimerNiveau(nombreNiveau)
{
     for(var i = 0; i < (nombreNiveauArborescence - nombreNiveau) ; i++)
     {
        document.getElementById('navigation').removeChild(document.getElementById('navigation').lastChild);
        
     }
     nombreNiveauArborescence = nombreNiveauArborescence - (nombreNiveauArborescence - nombreNiveau);
}

function identifierParent(id, nom)
{
    idDernierParent = id;
    nomDernierParent = nom;
}

function chercherLogin(login)
{
    // On se connecte à la base
    db = $.couch.db("collectikon");

    // On appelle la view
    var a = db.view("Collectikon/utilisateur", {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            window.sessionStorage.setItem('loginExistant', false);
            // Pour chaque utilisateur
            for(i in data.rows)
            {
                // Si l'identifiant correspond
                if(data.rows[i].value.login == login)
                {
                    window.sessionStorage.setItem('loginExistant', true);
                }
            }
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    })
}

function enregistrerUtilisateur(login, password)
{
    db = $.couch.db("collectikon");

    db.saveDoc(
        {
            type : "utilisateur",
            login : login,
            password : password,
            statut : "contributeur"
        },
        {
            success: function()
            {
                window.location.reload();
                window.sessionStorage.setItem('login', login);
                alert("Votre compte a bien été créé");
            }
        }
    );
}

$("#celluleIdentification").ready(function()
{
    var connecte = verifierConnexion();

    if(connecte == true)
    {

        document.getElementById("affichageLogin").innerHTML = sessionStorage.login;
        document.getElementById("optionMeDeconnecter").style.display = "inline";

        document.getElementById("bouttonOK").style.display = "none";
        document.getElementById("champLogin").style.display = "none";
        document.getElementById("champPassword").style.display = "none";
    }
});

function montrerEncadre()
{
    textFocus = true;
    document.getElementById('encadre').style.visibility = "visible";
}

function rechercher()
{
    var morceauURL = "";
    if(window.location.href.indexOf('index.html') == -1) morceauURL = "../../";

    var recherche = document.getElementById('champRecherche').value;
    var codeHTMLRechercheUtilisateur = "";
    var codeHTMLRechercheIcone = "";

    creerBarreProgression();

    // On se connecte à la base
    db = $.couch.db("collectikon");

    // On appelle la view pour les utilisateurs
    db.view("Collectikon/utilisateur",
    {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            var decompte = 0;
            // Pour chaque utilisateur
            for(i in data.rows)
            {
                // Si l'identifiant et le mot de passe correspondent
                if((data.rows[i].value.login.indexOf(recherche) !== -1)&&(recherche != ""))
                {
                    codeHTMLRechercheUtilisateur += "<li><a href='javascript:return false;'><i class='icon-chevron-right'></i>" + data.rows[i].value.login + "</a></li>";
                    decompte++;
                }
            }
            document.getElementById("titreRechercheUtilisateur").innerHTML = "Utilisateurs ";
            document.getElementById("titreRechercheUtilisateur").innerHTML += '<span class="badge badge-success">' + decompte + '</span>';
            $("#listeRechercheUtilisateur").html(codeHTMLRechercheUtilisateur);
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    });

    document.getElementById("progression").style.width = "50%";


    // On appelle la view pour les icones
    db.view("Collectikon/listeIcones",
    {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            var decompte = 0;
            // Pour chaque utilisateur
            for(i in data.rows)
            {
                
                // Si l'identifiant et le mot de passe correspondent
                if((data.rows[i].value.nom.indexOf(recherche) !== -1)&&(recherche != ""))
                {
                    
                    codeHTMLRechercheIcone += "<li><a href='" + morceauURL + "_rewrite/ficheIcone/" + data.rows[i].value._id + "'><i class='icon-chevron-right'></i>" + data.rows[i].value.nom + "</a></li>";
                    decompte++;
                }
            }
            document.getElementById("titreRechercheIcone").innerHTML = "Icônes ";
            document.getElementById("titreRechercheIcone").innerHTML += '<span class="badge badge-success">' + decompte + '</span>';
            
            $("#listeRechercheIcone").html(codeHTMLRechercheIcone);
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    });

    document.getElementById("progression").style.width = "100%";

    
}

function creerBarreProgression()
{
    document.getElementById("barreProgression").innerHTML = "<div class='bar' id='progression' style='width: 0%;'></div>";
}

function retirerBarreProgression()
{
    document.getElementById("barreProgression").innerHTML = "";
}

function cacherEncadre()
{
    textFocus = false;
    if(divOver == false)
        document.getElementById('encadre').style.visibility = "hidden";

}

function cacherEncoreEncadre()
{

    if(textFocus == false)
    {
        document.getElementById('encadre').style.visibility = "hidden";
    }

}

function effacerFormulaireCreationCompte()
{
    document.getElementById("FormulaireCreationCompte").reset();
    /*
    document.getElementById("nouveaulogin").value = "";
    document.getElementById("nouveauPassword").value = "";
    document.getElementById("nouveauConfirmationPassword").value = "";
    */
}

function montrerEncadreCreationCompte()
{
    if(document.getElementById('encadreCreationCompte').style.visibility == "hidden")
        document.getElementById('encadreCreationCompte').style.visibility = "visible";
    else
        document.getElementById('encadreCreationCompte').style.visibility = "hidden"
}

function cacherEncadreCreationCompte()
{
    document.getElementById('encadreCreationCompte').style.visibility = "hidden";
}

function creerUtilisateur()
{
    var nouveauLogin = document.getElementById("nouveaulogin").value;

    var nouveauPassword = document.getElementById("nouveauPassword").value;
    var nouveauConfirmationPassword = document.getElementById("nouveauConfirmationPassword").value;
    var saisie = true;

    // Si tout les champs ne sont pas remplis
    if(!champsRemplis(nouveauLogin, nouveauPassword, nouveauConfirmationPassword))
    {
        // On affiche une alerte
        alert("Les trois champs doivent être remplis");
        // On passe "saisie" à faux
        saisie = false;
    }
    // Sinon si le mot de passe et la confirmation ne sont pas identique
    else if(nouveauPassword != nouveauConfirmationPassword)
    {
        // On affiche une alerte
        alert("Le mot de passe et la confirmation doivent être identiques !");
        // On passe "saisie" à faux
        saisie = false;
    }
    // Sinon si le login est déjà utilisé
    else if(window.sessionStorage.getItem("loginExistant") == "true")
    {
        // On affiche une alerte
        alert("Le login que vous avez choisi est déjà utilisé")
        // On passe "saisie" à faux
        saisie = false;
    }
    // Si "saisie" est à vrai
    if(saisie == true)
    {
        // On annonce que tout s'est bien passé
        enregistrerUtilisateur(nouveauLogin, nouveauPassword);

    }
}

function rechercherDoublon()
{
    chercherLogin(document.getElementById("nouveaulogin").value);
}

function champsRemplis(nouveauLogin, nouveauPassword, nouveauConfirmationPassword)
{
    return (nouveauLogin != "") && (nouveauPassword != "") && (nouveauConfirmationPassword != "");
}

$("#date").ready(function()
{
    afficherDate();

});

function afficherDate()
{
    document.getElementById('date').value = new Date();
}

function creerIcone2()
{
    var titre = document.getElementById("titre").value;

    var formesChoisies = new Array();
    var forme = document.getElementById("forme");

    for (var i = 0; i < forme.options.length; i++)
        if (forme.options[i].selected) formesChoisies.push(forme.options[i].value);

    var couleursChoisies = new Array();
    var couleur = document.getElementById("couleur");

    for (var i = 0; i < couleur.options.length; i++)
        if (couleur.options[i].selected) couleursChoisies.push(couleur.options[i].value);

    var reg=new RegExp("[,;]+", "g");
    var tableauRepresentations = document.getElementById("representations").value.split(reg);
    var tableauSujets = document.getElementById("sujets").value.split(reg);

    var statut = document.getElementById('statut').value;

    db = $.couch.db("collectikon");

    db.saveDoc(
        {
            nom : titre.toString(),
            type : "icone",
            forme : formesChoisies.toString(),
            couleur : couleursChoisies.toString(),
            representation : tableauRepresentations.toString(),
            sujet : tableauSujets.toString(),
            date : new Date().toString(),
            statut : statut.toString()
        },
        {
            success: function(data)
            {
                $('#rev').val(data.rev);
                $('form.formulaireUpload').ajaxSubmit(
                {
                    url: "/Collectikon/"+ data.id,
                    async: false,
                    success: function(response)
                    {
                        //window.location.href ='../../index.html';
                    }
                })
            }
        }
    );
}

function cacherAlerteMauvaisLogin()
{
    document.getElementById("alerteProblemeConnexion").style.visibility = "hidden";
}

function gererCreationTopic()
{
    if(document.getElementById("myModal").style.display == "inline")
        document.getElementById("myModal").style.display = "none";
    else
        afficherCreationTopic();
        
}

function afficherCreationTopic()
{
    if(compterLesEnfants() == 1)
    {
        document.getElementById("myModalLabel").innerHTML = "Ajouter un point de vue";
        document.getElementById("myModalMessage").innerHTML = "Nom du nouveau point de vue : "

    }
    else if(compterLesEnfants() == 2)
    {
        document.getElementById("myModalLabel").innerHTML = "Ajouter un topic";
        document.getElementById("myModalMessage").innerHTML = "Nom du nouveau topic : "

    }
    else
    {
        document.getElementById("myModalLabel").innerHTML = "Ajouter un sous-topic";
        document.getElementById("myModalMessage").innerHTML = "Nom du nouveau sous-topic : "

    }
    
    document.getElementById("myModal").style.display = "inline";
}

function fermerCreationTopic()
{
    document.getElementById("myModal").style.display = "none";
}

function cacherAlerteSuccesCreation()
{
    document.getElementById("alerteSuccesCreation").style.visibility = "hidden";
}

function montrerAlerteSuccesCreation()
{
    document.getElementById("alerteSuccesCreation").style.visibility = "visible";
}

function retournerALAccueil()
{
    window.location.href = '../../index.html';
}

function calculerSecuriteMotDePasse()
{
    var score = 1;
    var motDePasse = document.getElementById("nouveauPassword").value;

    score *= motDePasse.length;

    var regex = /\d/g;
    if(regex.test(motDePasse))
        score *= 1.5;

    if((/[A-Z]/).test(motDePasse))
        score *= 1.5;

    return score;
    
}

function afficherSecuriteMotDePasse()
{
    var score = calculerSecuriteMotDePasse();

    while(document.getElementById("progressionSecuritePassword").hasChildNodes())
    document.getElementById("progressionSecuritePassword").removeChild(document.getElementById("progressionSecuritePassword").firstChild);
    

    if(score > 1) document.getElementById("progressionSecuritePassword").innerHTML += '<div class="bar bar-danger" style="width: 33%;"></div>';
    if(score > 4) document.getElementById("progressionSecuritePassword").innerHTML += '<div class="bar bar-warning" style="width: 33%;"></div>';
    if(score > 10) document.getElementById("progressionSecuritePassword").innerHTML += '<div class="bar bar-success" style="width: 34%;"></div>';

}

function posterCommentaire()
{   
    var login = "";

    if(verifierConnexion())
    {
        login = window.sessionStorage.getItem("login");
        db = $.couch.db("collectikon");
        db.saveDoc(
            {
                type : "commentaire",
                idIcone : document.getElementById("champsCacheId").value,
                posteur : login,
                date : new Date(),
                commentaire : document.getElementById("creationCommentaire").value
            },
            {
                success: function()
                {
                    // On efface le commentaire
                    effacerCommentaire();
                    afficherCommentaires()
                }
            }
        );
    }
    
    else
        alert("Vous devez vous connecter pour laisser un commentaire");

}

function afficherCommentaires()
{
    effacerCommentaires();

    var idIcone = document.getElementById("champsCacheId").value;

    // On se connecte à la base
    db = $.couch.db("collectikon");

    // On appelle la view
    var a = db.view("Collectikon/commentaire", {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            // Pour chaque commentaire
            for(i in data.rows)
            {
                // Si l'identifiant correspond
                if(data.rows[i].value.idIcone == idIcone)
                {
                    document.getElementById("divCommentaires").innerHTML = '<div class="alert alert-info"><strong><u>' + data.rows[i].value.posteur + '</u></strong> : ' + data.rows[i].value.commentaire + ' <br> ' + convertirDate(data.rows[i].value.date) + '</div>' + document.getElementById("divCommentaires").innerHTML;
                }
            }
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    })
}

function effacerCommentaires()
{
    while(document.getElementById("divCommentaires").hasChildNodes())
        document.getElementById("divCommentaires").removeChild(document.getElementById("divCommentaires").lastChild);
}

function effacerCommentaire()
{
    document.getElementById("creationCommentaire").value = "";
}

function convertirDate(date)
{
    var jour = date.substring(8,10);
    var mois = date.substring(5,7);
    var annee = date.substring(0,4);
    return "<i>Le " + jour + "/" + mois + "/" + annee + "</i>";
}

function essai()
{

        db = $.couch.db("collectikon");
        db.saveDoc(
            {
                type : "icone",
                created_at : new Date(),
                message : document.getElementById("message").value
            },
            {
            success: function(data)
            {
                document.getElementById("_rev").value = data.rev;
                $('#formulaire').ajaxSubmit(
                {
                    url : db.uri + $.couch.encodeDocId(data.id),
                    success : function()
                    {
                        alert("l'upload s'est bien passé");
                    }
                });
            }
        });
}

function creerIcone()
{

    var formesChoisies = new Array();
    var forme = document.getElementById("forme");

    for (var i = 0; i < forme.options.length; i++)
        if (forme.options[i].selected) formesChoisies.push(forme.options[i].value);

    var couleursChoisies = new Array();
    var couleur = document.getElementById("couleur");

    for (var i = 0; i < couleur.options.length; i++)
        if (couleur.options[i].selected) couleursChoisies.push(couleur.options[i].value);

    var reg=new RegExp("[,;]+", "g");
    var tableauRepresentations = document.getElementById("representations").value.split(reg);
    var tableauSujets = document.getElementById("sujets").value.split(reg);

        db = $.couch.db("collectikon");
        db.saveDoc(
            {
                nom : document.getElementById("titre").value,
                type : "icone",
                forme : formesChoisies.toString(),
                couleur : couleursChoisies.toString(),
                representation : tableauRepresentations.toString(),
                sujet : tableauSujets.toString(),
                date : new Date().toString(),
                statut : document.getElementById('statut').value,
                pov : document.getElementById('affichagePointDeVue').value,
                topic : document.getElementById('affichageTopic').value,
                sstopic : formaterPourEnregistrementArborescenceParcourue(),
                pere : identifiantPere
            },
            {
            success: function(data)
            {
                document.getElementById("_rev").value = data.rev;
                $('#formulaire').ajaxSubmit(
                {
                    url : db.uri + $.couch.encodeDocId(data.id),
                    success : function()
                    {
                        alert("l'upload s'est bien passé");
                    }
                });
            }
        });
}


function blablabla()
{
    // On se connecte à la base
    db = $.couch.db("collectikon");

    // On appelle la view
    var a = db.view("Collectikon/icone", {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            // Pour chaque commentaire
            for(i in data.rows)
            {
                if(data.rows[i].value._id == document.getElementById('champsCacheId').value)
                {
                    for(var nomFichier in data.rows[i].value._attachments)
                    {
                        var url = "http://127.0.0.1:5984/collectikon/" + document.getElementById('champsCacheId').value + "/" + nomFichier;
                        $("#upload-file-container").html("<img src='" + url + "' style='max-width: 150px;max-height: 150px'>");
                    }
                }
            }
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    })

    
    
    

}

/*
function lancerUpload()
{
    var baseUrl = 'http://127.0.0.1:5984/playground/';
    var fileInput = document.forms['upload'].elements['file'];
}

var uploadFile = function(document, file)
{
    var name = encodeURIComponent(file.name),
        type = file.type,
        fileReader = new FileReader(),
        getRequest = new XMLHttpRequest(),
        putRequest = new XMLHttpRequest();

    getRequest.open('GET',  baseUrl + encodeURIComponent(document), true);
    getRequest.send();

    getRequest.onreadystatechange = function(response)
    {
        if (getRequest.readyState == 4 && getRequest.status == 200)
        {
            var doc = JSON.parse(getRequest.responseText);
            putRequest.open('PUT', baseUrl +
                encodeURIComponent(document) + '/' +
                name + '?rev=' + doc._rev, true);
            putRequest.setRequestHeader('Content-Type', type);
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = function (readerEvent)
            {
                putRequest.send(readerEvent.target.result);
            };
            putRequest.onreadystatechange = function(response)
            {
                if (putRequest.readyState == 4)
                {
                    console.log(putRequest);
                }
            };
        }
    };
};
*/

function maFonction()
{
    // On se connecte à la base
    db = $.couch.db("collectikon");

    // On appelle la view
    db.view("Collectikon/utilisateur", {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            // Pour chaque utilisateur
            for(i in data.rows)
            {
                // J'affiche l'identifiant
                alert(data.rows[i].value.login);
            }
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    })
}

function enregistrerArborescenceParcourue(nouvelElement)
{
    // On définit un séparateur
    var separateur = "";

    var parcouru = false;
    // Si nous avons déjà parcouru l'arbo
    if(sessionStorage.getItem("arboParcourue") !== null)
    {
        parcouru = true;
    }

    if(parcouru)
        sessionStorage.setItem("arboParcourue", sessionStorage.getItem("arboParcourue") + ";" + nouvelElement);

    else
        sessionStorage.setItem("arboParcourue", nouvelElement);

}

function recupererArborescenceParcourue()
{
    return sessionStorage.getItem("arboParcourue");
}
function afficherArborescenceParcourue()
{
    var tableauArborescenceParcourue = recupererArborescenceParcourue().split(";");

    if(tableauArborescenceParcourue.length > 2)
    {
        for(var w = 2; w < tableauArborescenceParcourue.length; w++)
        {
            document.getElementById("tableArboParourue").innerHTML +=
                '<tr>' +
                      '<td align="right">Sous-topic</td>' +
                      '<td>&nbsp;</td>' +
                      '<td><input type="text" value="' + tableauArborescenceParcourue[w] + '" size="51" disabled/></td>' +
                  '</tr>';
        }
    }
    
    document.getElementById("affichagePointDeVue").value = tableauArborescenceParcourue[0];

    document.getElementById("affichageTopic").value = tableauArborescenceParcourue[1];

    //alert(document.getElementById("affichagePointDeVue").value);

    //alert(document.getElementById("tableArboParourue").innerHTML);
}

function formaterPourEnregistrementArborescenceParcourue()
{
    var tableauArborescenceParcourue = recupererArborescenceParcourue().split(";");

    tableauArborescenceParcourue.shift();

    tableauArborescenceParcourue.shift();

    return tableauArborescenceParcourue.join(",");
}

function recupererSsTopic()
{
    var id = document.getElementById("champsCacheId").value;

    // On se connecte à la base
    db = $.couch.db("collectikon");

    // On appelle la view
    db.view("Collectikon/icone", {
        // En cas de succès dans la récupération des données
        success: function(data)
        {
            // Pour chaque utilisateur
            for(i in data.rows)
            {
                if(data.rows[i].value._id == id)
                {
                    document.getElementById("affichageSsTopic").innerHTML += data.rows[i].value.sstopic.split(",").join(" > ");
                }
            }
        },
        error: function(status){
            alert("Un problème s'est produit.");
        }
    })
}
