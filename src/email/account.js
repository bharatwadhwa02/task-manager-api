const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email , name)=>{
  sgMail.send({
    to : email,
    from : 'bharatwadhwa02@gmail.com',
    subject : 'welcome to our app!',
    text : `CONGRATULATION, ${name}. Your account is fully set to use. you can login anytime with your username and password `
  })
}

const sendCancelationEmail = (email , name)=>{
  sgMail.send({
    to : email,
    from : 'bharatwadhwa02@gmail.com',
    subject : 'sorry to see you go',
    text : `Goodbye ${name}. I hope to see you back soon`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}