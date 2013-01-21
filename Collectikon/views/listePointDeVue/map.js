function(doc)
{
    if (doc.type == "point de vue")
    {
        emit(doc._id, doc);
    }
}