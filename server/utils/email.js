import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendOtpEmail = async (email, otp, purpose = 'signup') => {
  const subject =
    purpose === 'signup'
      ? 'Verify Your Account'
      : 'Password Reset Request';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP Verification</title>
</head>

<body style="margin:0; padding:0; background-color:#fce9a9; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:400px; background:#eeeeee; border-radius:20px; padding:30px 20px; position:relative; box-shadow:0 10px 25px rgba(0,0,0,0.1);">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:15px;">
              <img src="/client/src/assets/mindbotics-logo.svg"
                   width="140"
                   alt="MindBotics Logo"
                   style="border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.1);" />
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center">
              <h2 style="font-size:18px; color:#222; margin-bottom:10px;">
                ${purpose === 'signup'
      ? 'Welcome to MindBotics 🎉'
      : 'Reset Your Password'}
              </h2>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td align="center">
              <p style="font-size:13px; color:#777; margin-bottom:25px; line-height:1.5;">
                Your OTP for
                <strong>
                  ${purpose === 'signup'
      ? 'Email Verification'
      : 'Password Reset'}
                </strong>
                is below.
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center">
              <div style="
                background:#ffffff;
                padding:20px;
                border-radius:12px;
                width:80%;
                margin:0 auto 20px;
                box-shadow:0 5px 15px rgba(0,0,0,0.1);
              ">
                <p style="font-size:14px; color:#555; margin-bottom:5px;">
                  OTP Verification Code
                </p>
                <h1 style="
                  font-size:30px;
                  letter-spacing:4px;
                  color:#000;
                  margin:0;
                ">
                  ${otp}
                </h1>
              </div>
            </td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td align="center">
              <p style="font-size:12px; color:#777; margin-bottom:20px;">
                This OTP is valid for
                <strong>${process.env.OTP_EXPIRES_MIN} minutes</strong>.
                Please do not share it with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="font-size:11px; color:#aaa; padding-top:10px;">
              © ${new Date().getFullYear()} MindBotics
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(error.response?.body || error.message);
    throw error;
  }
};




// import sgMail from '@sendgrid/mail';

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const createTransporter = () => {
//   console.log("Creating email transporter with:", {
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     user: process.env.EMAIL_USER,
//   });
//   return nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT),
//     secure: Number(process.env.EMAIL_PORT) === 465,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });
// };

// export const sendOtpEmail = async (email, otp, purpose = 'signup') => {
//   const subject =
//     purpose === 'signup'
//       ? 'Verify Your Account'
//       : 'Password Reset Request';

//   const html = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>OTP Verification</title>
// </head>

// <body style="margin:0; padding:0; background-color:#fce9a9; font-family:Arial, sans-serif;">

//   <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
//     <tr>
//       <td align="center">

//         <table width="100%" cellpadding="0" cellspacing="0"
//           style="max-width:400px; background:#eeeeee; border-radius:20px; padding:30px 20px; position:relative; box-shadow:0 10px 25px rgba(0,0,0,0.1);">

//           <!-- Logo -->
//           <tr>
//             <td align="center" style="padding-bottom:15px;">
//               <img src="publi/mindbotics-logo.jpg"
//                    width="140"
//                    alt="MindBotics Logo"
//                    style="border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.1);" />
//             </td>
//           </tr>

//           <!-- Title -->
//           <tr>
//             <td align="center">
//               <h2 style="font-size:18px; color:#222; margin-bottom:10px;">
//                 ${purpose === 'signup'
//       ? 'Welcome to MindBotics 🎉'
//       : 'Reset Your Password'}
//               </h2>
//             </td>
//           </tr>

//           <!-- Description -->
//           <tr>
//             <td align="center">
//               <p style="font-size:13px; color:#777; margin-bottom:25px; line-height:1.5;">
//                 Your OTP for
//                 <strong>
//                   ${purpose === 'signup'
//       ? 'Email Verification'
//       : 'Password Reset'}
//                 </strong>
//                 is below.
//               </p>
//             </td>
//           </tr>

//           <!-- OTP Box -->
//           <tr>
//             <td align="center">
//               <div style="
//                 background:#ffffff;
//                 padding:20px;
//                 border-radius:12px;
//                 width:80%;
//                 margin:0 auto 20px;
//                 box-shadow:0 5px 15px rgba(0,0,0,0.1);
//               ">
//                 <p style="font-size:14px; color:#555; margin-bottom:5px;">
//                   OTP Verification Code
//                 </p>
//                 <h1 style="
//                   font-size:30px;
//                   letter-spacing:4px;
//                   color:#000;
//                   margin:0;
//                 ">
//                   ${otp}
//                 </h1>
//               </div>
//             </td>
//           </tr>

//           <!-- Expiry -->
//           <tr>
//             <td align="center">
//               <p style="font-size:12px; color:#777; margin-bottom:20px;">
//                 This OTP is valid for
//                 <strong>${process.env.OTP_EXPIRES_MIN} minutes</strong>.
//                 Please do not share it with anyone.
//               </p>
//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td align="center" style="font-size:11px; color:#aaa; padding-top:10px;">
//               © ${new Date().getFullYear()} MindBotics
//             </td>
//           </tr>

//         </table>

//       </td>
//     </tr>
//   </table>

// </body>
// </html>
// `;


//   try {
//     const transporter = createTransporter();
//     await transporter.sendMail({
//       from: `"Auth System" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject,
//       html,
//     });
//     console.log(`OTP email sent successfully to ${email}`);
//   } catch (error) {
//     console.error(`Failed to send OTP email to ${email}:`, error);
//     throw error; // Rethrow to handle in calling route
//   }
// };
