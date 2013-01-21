
function(doc)
{
    if (doc.type == "icone")
    {
        emit(doc._id, doc);
    }
}