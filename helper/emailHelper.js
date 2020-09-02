const nodemailer = require('nodemailer');
// const { google } = require('googleapis');
// const OAuth2 = google.auth.OAuth2;

// const oauth2Client = new OAuth2(
//   "159014565557-lgc68ap7a5vcst5ih7pcl3v8t0j2qeqq.apps.googleusercontent.com",
//   "5J4ntVS0XmdcP_6Jp9P_YvQ-",
//   "https://developers.google.com/oauthplayground"
// );

// oauth2Client.setCredentials({
//   refresh_token: "1//04_4cGyGjIKtfCgYIARAAGAQSNwF-L9IrtpHxhu3qzIUcTxlVNojqbX9KAfsqT2TsQwk1SULvqDmJE2ALb-1jpVsNQ2rM7qUgQ2k"
// });
// const accessToken = oauth2Client.getAccessToken();

// const smtpTransport = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: "leona.zkliu@gmail.com",
//     cliendId: "159014565557-lgc68ap7a5vcst5ih7pcl3v8t0j2qeqq.apps.googleusercontent.com",
//     refreshToken: "1//04_4cGyGjIKtfCgYIARAAGAQSNwF-L9IrtpHxhu3qzIUcTxlVNojqbX9KAfsqT2TsQwk1SULvqDmJE2ALb-1jpVsNQ2rM7qUgQ2k",
//     accessToken: accessToken,
//     tls: {
//       rejectUnauthorized: false
//     }
//   }
// });

// module.exports = smtpTransport;

// cliendId = '159014565557-lgc68ap7a5vcst5ih7pcl3v8t0j2qeqq.apps.googleusercontent.com'
// secret = '5J4ntVS0XmdcP_6Jp9P_YvQ-';

// refreshToken = '1//04_4cGyGjIKtfCgYIARAAGAQSNwF-L9IrtpHxhu3qzIUcTxlVNojqbX9KAfsqT2TsQwk1SULvqDmJE2ALb-1jpVsNQ2rM7qUgQ2k'

const defaultMail = "duml2007@icloud.com";
const senderEmail = "leona.zkliu@gmail.com";
const senderPassword = "Lzx19951006ss"
module.exports = {
  sendMail: async (subject, text, to = defaultMail) => {
    try {
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: senderEmail,
          pass: senderPassword
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      const message = {
        from: `Uforse API <${senderEmail}>`,
        to,
        subject,
        text: subject,
        html: text
      }

      transport.sendMail(message, () => {});
      
    } catch(err) {
      throw (err);
    }
  }
}



// module.exports = transport;