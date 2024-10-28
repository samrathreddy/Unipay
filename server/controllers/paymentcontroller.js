const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/paymentModel');
const FeeDetail = require('../models/feeDetailModel');
const jwt = require('jsonwebtoken');
const { feeAmount, isFeeEnabled, isFeePaid } = require('../utils/feeUtil');
const students = require('../models/rollDobModel');
const sendSuccessEmail = require('./mailer');
const { sendPaymentForVerification } = require('./discordBot');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});


function generateTransactionId() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = String(now.getFullYear()).slice(2); // Last two digits of the year
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${day}${month}${year}${hours}${minutes}${seconds}`;
}

const checkout = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { Roll, dob, feeType, feeYear, feeSem } = decoded;

    const feeDetails = await FeeDetail.findOne({ Roll, DOB: dob });

    if (feeDetails) {
      const amount = feeAmount(feeDetails, feeType, feeYear, feeSem);

      const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      };

      const order = await instance.orders.create(options);

      res.status(200).json({ success: true, order });
    } else {
      res.status(404).json({ message: 'Fee details not found' });
    }
  } catch (error) {
    console.error("Error in checkout:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const paymentVerification = async (req, res) => {
  console.log("In payment Verification")
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET).update(body).digest("hex");
  if (expectedSignature === razorpay_signature) {
    try {
      const payment = await instance.payments.fetch(razorpay_payment_id);
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const { Roll, dob, feeType, feeYear, feeSem } = decoded;
      const student = await students.findOne({ Roll, DOB: dob });

      console.log("in PaymentController");
      const transactionId = generateTransactionId(); // Generate transaction ID
      console.log(`Transaction ID: ${transactionId}`);
      const currentDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
      const currentTime = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
      try{
        // Check if the student already has a payment record
        let paymentRecord = await Payment.findOne({ Roll });
        if (!paymentRecord) {
          // If no payment record exists, create a new one with Payments as an array
          paymentRecord = new Payment({
            Roll,
            Batch: Roll.substring(0, 2),
            Name: student.Name,
            DOB: student.DOB,
            Branch: student.Branch,
            Section: student.Section,
            phone: payment.contact,
            email: student['student mail id'],
            Payments: [
              {
                transactionId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                feeType,
                feeYear,
                feeSem,
                amount: payment.amount / 100,
                status: payment.status,
                created_at_date: currentDate,
                created_at_time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
                method: payment.method,
                card_id: payment.card_id,
                bank: payment.bank,
                wallet: payment.wallet,
                vpa: payment.vpa,
                description: payment.description,
              },
            ],
          });
        } else {
          // If payment record exists, check if today's transaction ID already exists in Payments array
          const existingPayment = paymentRecord.Payments.find(p => p.transactionId === transactionId);
          
          if (!existingPayment) {
            // Add new payment record for today
            console.log("Adding new payment record for transaction ID:", transactionId);
            paymentRecord.Payments.push({
              transactionId,
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              feeType,
              feeYear,
              feeSem,
              amount: payment.amount / 100,
              status: payment.status,
              created_at_date: currentDate,
              created_at_time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
              method: payment.method,
              card_id: payment.card_id,
              bank: payment.bank,
              wallet: payment.wallet,
              vpa: payment.vpa,
              description: payment.description,
            });
          } else {
            // Optionally handle cases where the transaction ID already exists
            console.log("Payment record already exists for transaction ID:", transactionId);
          }
        }

        // Save the payment record after modification
        await paymentRecord.save();
      }catch (error) {
        console.error("Error in updating Payment DB", error);
        res.status(500).json({ success: false, message: "Error updating payment details into payment DB" });
      }

      try{
        const feeDetails = await FeeDetail.findOne({ Roll, DOB: dob });
        if (feeDetails) {
          const checkEnabled = isFeeEnabled(feeDetails, feeType, feeYear, feeSem);
          if (checkEnabled) {
            const checkPaid = isFeePaid(feeDetails, feeType, feeYear, feeSem);
            if (!checkPaid) {
              feeDetails.isPaid[feeType][feeYear] = true;
              await feeDetails.save();
            }
          }
        }
      }catch (error) {
        console.error("Error in updating original DB", error);
        res.status(500).json({ success: false, message: "Error in updating original DB" });
      }
      const paymentDetails = {
        transactionId,
        roll: student.Roll,
        name: student.Name,
        Branch: student.Branch,
        feeType,
        feeYear,
        feeSem,
        amount: payment.amount / 100,
        date: currentDate,
        time: currentTime 
      };
      // Mailing
      try{
        sendSuccessEmail(student['student mail id'], paymentDetails)
            .then(() => console.log('Email process completed.'))
            .catch(err => console.error('Email process failed:', err));

      }catch(error){
        console.error("Error sending mail", error);
        res.status(500).json({ success: false, message: "Error sending mail" });
      }

      try{
        sendPaymentForVerification(paymentDetails);
      }catch(error){
        console.error("Error sending discord", error);
      }


    } catch (error) {
      console.error("Error in paymentVerification:", error);
      res.status(500).json({ success: false, message: "Error fetching payment details from Razorpay" });
    }
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
};

module.exports = {
  checkout,
  paymentVerification,
};
