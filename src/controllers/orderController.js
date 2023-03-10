const Order = require("../models/orderModel");
const Orderproduct = require("../models/orderproduct");
const User = require("../models/userModel");
const { isUserAdmin, isIntakeFormComplted } = require("../helper/user");
const Product = require("../models/productModel");
const sequelize = require("../models/index");
const { handleError } = require("../helper/handleError");
const { chargeCreditCard } = require('../functions/handlePayment');
const { sendEmail } = require("../helper/send_email");
const path = require('path');
//Unused Shop stuff - save for later
// const Payment = require("../models/paymentModel");
// const Shipping = require("../models/shippingModel");

exports.createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {payment_detail, product_ordered } = req.body;
    const {cardCode,expirtationDate,cardNumber,billingLastName,
      email,billingFirstName,address,city,state,zip}=payment_detail
      if(!cardCode||!expirtationDate||!cardNumber||!billingLastName||!
        email||!billingFirstName||!address||!city||!state||!zip){
          handleError("Please fill all field", 400);
        }
    if (!(await isIntakeFormComplted(req))) {
      handleError("Please complete the registration form", 400);
    }
    const order = await Order.create(
      {
        userId: req?.user?.sub,
      },
      { transaction: t }
    );
    let total_amount=0
    let is_appointment_exist=false
    let is_renewal=false
    let product_names=[]
    for(const prod of product_ordered) {
      const product = await Product.findByPk(prod?.productId);
      product_names.push(product.product_name)
      if(product?.type=='product'){is_appointment_exist=true}
      if(product?.type=='treatment'){is_renewal=true}
      total_amount=total_amount+(Number(prod?.quantity||1)*Number(product?.price))
      const order_product_create= {
        productId: prod?.productId,
        product_name: product?.product_name,
        discount: product?.discount,
        price: product?.price,
        tax: product?.tax,
        quantity:prod?.quantity,
        orderId: order?.id,
      }
      if(product?.image_url){
        order_product_create.image_url=product?.image_url
      }
      await Orderproduct.create(
        order_product_create,
        { transaction: t }
      );
    }
    //update the user address info
    await User.update({
     address:address,
     city:city,
     state:state,
     zip_code:zip,
     country:'USA',
     appointment:true,
     left_appointment:is_appointment_exist},
    {where:{id:req?.user?.sub},transaction: t })

    const payment_info={
     amount:total_amount,
     card_detail:{
     cardNumber:cardNumber,
     expirtationDate:expirtationDate?.
      replace('/', ''),
     cardCode:cardCode,
     },
     billing_detail:{
     firstName:billingFirstName,
     lastName:billingLastName,
     email:email,
     address:address,
     city:city,
     state:state,
     zip:zip,
     country:'USA'
     }
  }
    const payment_response=await chargeCreditCard(payment_info)
    order.transId=payment_response.transId
    order.total_paid_amount=total_amount.toFixed(2)
    await order.save({ transaction: t })
    await t.commit();
    const user=await User.findByPk(req?.user?.sub)
    const filePath = path.join(__dirname,"..","..",'public', 'images','testrxmd.gif');
    const mailOptions = {
      from: process.env.EMAIL,
      to: user?.email,
      subject: "TestRxMD Appointment Order Confirmation",
      html: `
      <div style="margin:auto; max-width:650px; background-color:#C2E7FF">
      <h1 style="text-align:center;color:#2791BD;padding:10px 20px;">
      You Have successfuly Purchased An Appointment
      </h1>
      <p style="text-align:start;padding:10px 20px;">
      Thank you for purchasing a Telehealth appointment with TestRxMD. We look forward to working with you! 
      We hope that you were able to get your appointment scheduled online with no problems, but in the unlikely event
      that you were unable to complete the scheduling process after your purchase, please call us at (812) 296-6499 and 
      we will get you scheduled right away.
      </p>
      <div style="text-align:center;padding-bottom:30px">
      <img src="cid:unique@kreata.ee"/>
      </div>
      </div>
    `,
    attachments: [{
      filename: 'testrxmd.gif',
      path: filePath,
      cid: 'unique@kreata.ee' //same cid value as in the html img src
    }]
    };
    is_appointment_exist&& await sendEmail(mailOptions)
    if(is_renewal) {
      const mailOptionsRenewal = {
        from: process.env.EMAIL,
        to: user?.email,
        subject: "TestRxMD Appointment Order Confirmation",
        html: `
        <div style="margin:auto; max-width:650px; background-color:#C2E7FF">
        <h1 style="text-align:center;color:#2791BD;padding:10px 20px;">
        You Have successfuly Renewd
        </h1>
        <p style="text-align:start;padding:10px 20px;">
        Thank you for renewing  ${product_names.slice(0, -1).join(', ')}${product_names.length > 1 ?
          ' and ' : ''}${product_names[product_names.length - 1]} with TestRxMD. 
          We will begin working on your order immediately. If you have any questions or concerns, please call (812) 296-6499.
        </p>
        <div style="text-align:center;padding-bottom:30px">
        <img src="cid:unique@kreata.eqe"/>
        </div>
        </div>
      `,
      attachments: [{
        filename: 'testrxmd.gif',
        path: filePath,
        cid: 'unique@kreata.eqe' //same cid value as in the html img src
      }]
      };
      const mailOptionsAdmin = {
        from: process.env.EMAIL,
        to: ["marufbelete9@gmail.com","beletemaruf@gmail.com"],
        // to: ["rob@testrxmd.com","john@testrxmd.com"],
        subject: "TestRxMD Appointment Order Confirmation",
        html: `
        <div style="margin:auto; max-width:650px; background-color:#C2E7FF">
        <h1 style="text-align:center;color:#2791BD;padding:10px 20px;">
         Renewal Purchase Alert
        </h1>
        <p style="text-align:center;padding:5px 1px;font-size:15px;">
        Here is the client information
        </p>
        <p style="text-align:start;padding:5px 30px;">
        Name:${user?.first_name+' '+user?.last_name}
        </p>
        <p style="text-align:start;padding:5px 30px;">
        Email:${user?.email}
        </p>
        <p style="text-align:start;padding:5px 30px;">
        Phone:${user?.phone_number}
        </p>
        <p style="text-align:start;padding:5px 30px;">
        Address:${user?.address}
        </p>
        <p style="text-align:center;padding:5px 1px;font-size:15px;">
         Product Ordered
        </p>
        <p style="text-align:start;padding:1px 30px">
        <ul>
        ${product_names?.map(p=>`<li>${p}</li>`)}
        </ul>
        </p>
        <div style="text-align:center;padding-bottom:30px">
        <img src="cid:unique@kreata.eae"/>
        </div>
        </div>
      `,
      attachments: [{
        filename: 'testrxmd.gif',
        path: filePath,
        cid: 'unique@kreata.eae' //same cid value as in the html img src
      }]
      };
      await sendEmail(mailOptionsRenewal);
      await sendEmail(mailOptionsAdmin)
  }
    
    return res.json({order,is_appointment_exist,product_names});
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    // const { page, paginate } = req.query;
    if (isUserAdmin(req)) {
      const options = {
        attributes: ["id","total_paid_amount","order_date","transId"],
        include: [
          {
            model: User,
            attributes: ["id", "first_name", "last_name", "email", "address","city","state","country"],
          },
          {
            model: Orderproduct,
            attributes: ["id", "product_name", "quantity", "price"],
          },
        ],
        // page: Number(page) || 1,
        // paginate: Number(paginate) || 25,
        order: [["order_date", "DESC"]],
      };
      const orders = await Order.findAll(options);
      return res.json(orders);
    }

    const options = {
      where: { userId: req?.user?.sub },
      attributes: ["id","total_paid_amount","order_date"],
      include: [
        { model: User, 
          attributes: ["id", "first_name", "last_name", "email", "address"],
        },
        { model: Orderproduct,
          attributes: ["id", "product_name", "quantity", "price"],
        },
      ],
      // page: Number(page) || 1,
      // paginate: Number(paginate) || 25,
      order: [["order_date", "DESC"]],
    };
    const orders = await Order.findAll(options);
    return res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isUserAdmin(req)) {
      const order = await Order.findByPk(id, {
        include: ["user","order_products"],
      });
      return res.json(order);
    }
    const order = await Order.findByPk(id, {
      where: { userId: req?.user?.sub },
      include: ["user","order_products"],
    });
    return res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findAll({
      where: { userId: req?.user?.sub },
      include: ["user", "order_products"],
    });
    return res.json(order);
  } catch (err) {
    next(err);
  }
};
exports.editOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isUserAdmin(req)) {
      const updated_order = await Order.update(
        { ...req.body },
        { where: { id: id } }
      );
      return res.json(updated_order);
    }
    const updated_order = await Order.update(
      { ...req.body },
      { where: { id: id, userId: req?.user?.sub } }
    );
    return res.json(updated_order);
  } catch (err) {
    next(err);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isUserAdmin(req)) {
      await Order.destroy({ where: { id } });
      return res.json({
        success: true,
        message: "Order deleted",
      });
    }
    await Order.destroy({ where: { id, userId: req?.user?.sub } });
    return res.json({
      success: true,
      message: "Order deleted",
    });
  } catch (err) {
    next(err);
  }
};
