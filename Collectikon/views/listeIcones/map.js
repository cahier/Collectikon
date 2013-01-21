// Cette vue récupère toutes les icônes dans la base
function(doc)
{
    if (doc.type == "icone")
    {
        emit(null, doc);
    }
}