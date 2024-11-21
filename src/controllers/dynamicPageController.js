const dynamicPage = require("../models/dynamicPageModel");

exports.editPageInfo = async (req, res, next) => {
  try {
    const new_patient_info = await dynamicPage.update({
    ...req.body
    },{where:{id:1}});
    return res.json(new_patient_info);
  } catch (err) {
    next(err);
  }
};

