function(doc)
{
    if (doc.type == "topic")
    {
        emit(doc._id, doc);
    }
}