
function(doc)
{
    if (doc.type == "commentaire")
    {
        emit(doc.date, doc);
    }
}