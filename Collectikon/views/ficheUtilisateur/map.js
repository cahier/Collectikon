function(doc) {
  if (doc.type == "utilisateur") {
    emit(doc.login, doc);
  }
}