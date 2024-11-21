const Sequelize = require("sequelize");
const sequelize = require("./index");

const DynamicPage = sequelize.define("dynamic_page", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  landing_page: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:`Testosterone Therapy&%Specializing in testosterone replacement therapy to optimize performance, strength, focus, and endurance.&%We offer a wide range of care with a primary focus in: TRT/HRT, Weight Management, Energy solutions, and ED Treatment`
  },
  about_page: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:`TestRxMD&%TestRx MD is dedicated to helping you find the best version of yourself. We are here to help discover that new you through our featured services.&%If you have a busy schedule and can't make it in to the office, no problem. We can do your appointment online! Our team can do a tele-health consultation to talk about your goals and discuss your therapy options.`
  },
  working_hour: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:`Clinic Hours&%Monday - Friday&%8:00am - 5:00pm EST&%Saturday&%Closed&%Sunday&%Closed&%Online Appointments Available!&%Can't make it to the clinic? We can see you online. Click below to get started`
  },
  podcast: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:`Watch our latest podcast videos on the most exciting topics and discussions. Click the link below to explore our full collection and never miss an episode!`
  },
  service: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:`Our Services Test&%We offer a wide range of care with a primary focus in: TRT/HRT, Weight Management, Nootropics, Peptide Therapy, and ED Treatment&%Hormone Therapy&%We will customize a hormone treatment plan based on your individual needs. We will actively monitor your hormone levels and make changes as needed to regain the vitality of your youth.&%Testosterone Therapy&%We provide a personalized complete testosterone program based upon your goals. Whether you want to be more performance oriented, or just want to have energy and libido like you used to, we can get you there!&%ED Treatment&%We know this isn't the most fun topic to discuss. We have a variety of solutions for both male and female issues. Make an appointment today to see what your options are!&%Weight Loss & Weight Control&%Our Medical Weight Loss program provides an effective and simple plan to help you easily achieve your weight loss goals and maintain a healthy weight.`
  },
  qa: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:`What is covered in our ALL-INCLUSIVE therapies?&%After the initial lab draw ($150),
     the following will be included in your monthly fee:&%Doctor Consults/Physical Exams&%Quarterly Labs (more if needed)&%Cost 
     of Medication (and any supplies needed to administer)&%Cost of expedited shipping to your door!&%Do you accept insurance?&%We don’t
     accept insurance for a couple of reasons:&%In our experience less than 10-15% of clients would have levels low enough for insurance to 
     cover their therapy. If they do decide to cover the cost of your therapy, and subsequent lab results come back normal/high, you would be 
     at risk of losing coverage of your therapy altogether.&%By not taking insurance we are able to treat the client as we see fit. We don’t 
     have insurance companies dictating how we are able to practice medicine. We truly believe this brings a much higher level of care to the client. 
     I encourage you to see what you think.&%We do accept HSA/Flex spending cards. This is a feature that a lot of clients like to take advantage of. 
     Keeps more money in your bank account.&%How long does it take to get my meds?&%If you need labs drawn:&%After the lab draw is conducted, we schedule 
     a follow-up appointment for a week out. This gives the lab plenty of time to post your results. Normally the results come back after 3-4 days, but we build in a 
     cushion for any delays. If your labs get posted earlier, you’ll have access through our patient portal. You will receive an email with a link to your results.&%After 
     the follow-up appointment any medication deemed necessary will be sent in to our mail-order compounding pharmacy. We use expedited (FedEx 2nd Day) shipping 
     (no sig req.. if you would like to require a signature.. just ask).&%From start to finish you are looking at around 10 days until meds arrive at your door in a 
     FedEx box.&%If you already have current labs (within the last 3 months):&%You get to essentially skip ahead to part b in the previous section.&%From start to finish, 
     after your consult, you would be looking at around 3 days (1 day to process and 2-day shipping).&%How much does it cost?&%We charge $150 for initial bloodwork/labs 
     (we can use labs that have been drawn in the last 3 months). Therapies vary in cost but start at $100 /month (TRT specifically starts at $200/month). All subsequent 
     lab draws/consults would be included in your monthly rate for whatever therapy you choose.`
  },
  rating: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:`I love these guys, they are spectacular. John is very knowledgeable, and they have
      helped me tremendously. I'm back at the top of my game and honestly feel better than 
      I have in  years. So glad I found this place!&%Brandon Hinton&%If you guys out there are looking for testosterone replacement therapy, look no
      further! These guys are awesome, helpful and go the extra mile for their patients! Can't
      suggest this place enough.&%Jimmy Leinbach&%The products at TestRxMD are excellent and have made a huge difference for me!
      So happy I took the leap and gave this place a shot. Looking for cutting-edge Nootropics or Testosterone?
      This is the place to call.&%Jacob Briggs&%Great service, super friendly, and everything works as described. These guys really know
      their stuff. Been doing TrT and Sermorelin and my body hasn't felt this good in years!!!&%Roger Finnigan`
  },
  treatment: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue:`TRT/HRT:&%TRT: STARTING AT $150/MONTH
    HRT: INDIVIDUALIZED PLANS&%WEIGHT-LOSS:&%STIMULANT-BASED AND 
    NON-STIMULANT BASED THERAPIES&%GH Peptide Therapy&%SERMORELIN, IPAMORELIN, 
    CJC-1295&%NOOTROPICS&%WE OFFER BOTH SEMAX AND SELANK NASAL SPRAY&%ED TREATMENT&%TADALAFIL, 
    SILDENAFIL, PT-141, OXYTOCIN, ETC.&%LABWORK&%WE OFFER PER-BASIS LAB DRAWS $150`
  }
});

DynamicPage.afterSync(async (options) => {
  const count = await DynamicPage.count(); // Check if any rows already exist
  if (count === 0) {
    await DynamicPage.create();
    console.log("Default row inserted in the dynamic_page table.");
  }
});

module.exports = DynamicPage;
