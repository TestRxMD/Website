const Meal = require("../models/mealModel");
const { createCompletion } = require('../chatGPT/createCompletion');
const User = require("../models/userModel");
const { runJob } = require("../helper/cron_job");
const { getUser } = require("../helper/user");
const { createMealPlanPDF } = require("../helper/fill_pdf");
const moment = require("moment");
const cron = require('node-schedule');
const { sendMealPlanPdf } = require("../helper/send_email");
const { handleError } = require("../helper/handleError");

async function parseMealPlan(str) {
  const strWithoutNumber = str.replace(/\d+/g, '');
  const days = strWithoutNumber.split(';').filter(Boolean);
  const plan_format = await Promise.all(days.map(async (day, index) => {
    const meals = day.split(',');
    const dayObj = {
      day: `Day ${index + 1}`,
    };

    for(let meal of meals){
      const [mealType, mealDescription] = meal.split(':');
      if(mealDescription){
        const prompt = `please create a detailed recipe for ${mealDescription}, including prep time and cook time, ingredient list with amounts, calorie information, and cooking instructions with under 200 words.`
        const description = await createCompletion(prompt)
        dayObj[mealType.replace(/[^a-zA-Z]/g, '')] = 
        { meal: mealDescription,
          description: description};
      }
    }
    return dayObj;
  }));

  return plan_format;
}

exports.addMeal = async (req, res, next) => {
  try {
    const user = await getUser(req?.user?.sub)
    if (!user.mealPlan) {
      handleError("plase buy your meal plan first", 403)
    }
    const meal = new Meal({
      ...req.body,
      userId: req?.user?.sub
    });
    res.json({ message: "success" });
    const prompt = mealPrmopmt(req)
    const response = await createCompletion(prompt)
    let parsed_obj=await parseMealPlan(response)
    const pdf = await createMealPlanPDF(parsed_obj)
    sendMealPlanPdf(user.email, user.first_name, pdf).
      then(r => r).catch(e => console.log(e))

    await meal.save();
    await User.update({
      mealPlan: false
    }, {
      where: {
        id: req?.user?.sub
      }
    })
    return 
  } catch (err) {
    console.log(err)
    next(err);
  }
};

// exports.getMeal = async (req, res, next) => {
//   try {
//     const meals = await Meal.findAll();
//     return res.json(meals);
//   } catch (err) {
//     next(err);
//   }
// };
// exports.getMealById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const meal = await Meal.findByPk(id);
//     return res.json(meal);
//   } catch (err) {
//     next(err);
//   }
// };


const mealPrmopmt = (req) => {
  let prompt = "Given the following information,"
  if (req.body.gender) prompt += `${req.body.gender.toLowerCase()} `;
  if (req.body.age) prompt += `client who is ${req.body.age} years old, `;
  if (req.body.height) prompt += `is ${req.body.height} inch tall, `;
  if (req.body.weight) prompt += `weight ${req.body.weight}lbs, `;
  if (req.body.targetWeight) prompt += `target weight ${req.body.targetWeight}lbs, `;
  if (req.body.activityLevel) prompt += `activity level of ${req.body.activityLevel}, `;
  if (req.body.mealPreference) prompt += `meal preference of ${req.body.mealPreference}, `;
  if (req.body.allergies) prompt += `have allergies with ${req.body.allergies}, `;
  if (req.body.dietaryRestrictions) prompt += `with diatary restriction ${req.body.dietaryRestrictions.toLowerCase()}, `;
  if (req.body.vegetarianProtienSource) prompt += `vegetarian protient source ${req.body.vegetarianProtienSource.toLowerCase()}, `;
  if (req.body.veganProtienSource) prompt += `vegan protient source ${req.body.veganProtienSource.toLowerCase()}, `;
  if (req.body.preferredCuisine) prompt += `preferred cuisine ${req.body.preferredCuisine.toLowerCase()}, `;
  if (req.body.medicalConditions) prompt += `medical condition ${req.body.medicalConditions.toLowerCase()}, `;

  prompt +="please create a list of 30-day breakfast, lunch, and dinner meals. The structure should look like 1, breakfast:Bacon & eggs,lunch:Veg Quesadilla,dinner:Tofu Stir-Fry; Each set of breakfast, lunch, and dinner meals should be on one line, comma-separated."
  return prompt

}