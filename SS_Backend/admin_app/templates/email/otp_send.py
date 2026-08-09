def get_otp_email_template(otp_code, minutes_valid=2):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: Arial, Helvetica, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
              
              <!-- Header -->
              <tr>
                <td style="background-color:#2563eb; padding: 28px 32px; text-align:center;">
                  <h1 style="color:#ffffff; margin:0; font-size:20px; letter-spacing: 0.5px;">
                    SS Garments
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 36px 32px;">
                  <p style="font-size:15px; color:#333333; margin:0 0 8px 0;">
                    Hello Admin,
                  </p>
                  <p style="font-size:15px; color:#333333; margin:0 0 24px 0;">
                    Use the code below to log in to your SS Garments admin panel.
                  </p>

                  <!-- OTP Box -->
                  <div style="background-color:#f0f4ff; border: 1px dashed #2563eb; border-radius:8px; text-align:center; padding: 20px 0; margin-bottom: 24px;">
                    <span style="font-size:32px; font-weight:bold; letter-spacing: 8px; color:#2563eb;">
                      {otp_code}
                    </span>
                  </div>

                  <p style="font-size:14px; color:#666666; margin:0 0 4px 0;">
                    This code is valid for <strong>{minutes_valid} minutes</strong>.
                  </p>
                  <p style="font-size:14px; color:#666666; margin:0 0 24px 0;">
                    If you did not request this code, you can safely ignore this email.
                  </p>

                  <hr style="border:none; border-top:1px solid #eeeeee; margin: 24px 0;">

                  <p style="font-size:12px; color:#999999; margin:0;">
                    For security reasons, never share this code with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#fafafa; padding: 20px 32px; text-align:center;">
                  <p style="font-size:12px; color:#aaaaaa; margin:0;">
                    &copy; {2026} SS Garments. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """