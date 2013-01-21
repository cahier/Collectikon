function(doc)
{
    if( doc.pere && doc.type != "icone" )
    {
        emit(doc._id, doc);
    }
}