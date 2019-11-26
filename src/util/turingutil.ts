
exports.getPage = function (req) {

        const page =
                isNaN(req.query.page) ||
                        req.query.page === undefined ||
                        req.query.page == null ||
                        Math.sign(Number(req.query.page)) <= 0 ||
                        req.query.page.length <= 0
                        ? 1
                        : req.query.page;

        return page;
}


exports.getLimit = function (req) {
        const limit =
                isNaN(req.query.limit) ||
                        req.query.limit === undefined ||
                        req.query.limit == null ||
                        Math.sign(Number(req.query.limit)) <= 0 ||
                        req.query.limit.length <= 0
                        ? 20
                        : req.query.limit;

        return limit;
}

exports.getDescriptionLength = function (req) {
        const description_length =
                isNaN(req.query.description_length) ||
                        req.query.description_length === undefined ||
                        req.query.description_length == null ||
                        Math.sign(Number(req.query.description_length)) <= 0 ||
                        req.query.description_length <= 0
                        ? 200
                        : req.query.description_length;

        return description_length;
}


exports.getUniqueId = function (length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}








