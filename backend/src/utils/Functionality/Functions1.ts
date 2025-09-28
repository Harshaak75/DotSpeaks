import path from "path";
import nodemailer from "nodemailer";
import fs from "fs/promises";

export const SendEmailToClient = async (client: any, brandHead: any) => {
  try {
    const templatePath = path.join(
      "C:\\Users\\Harsha AK\\Desktop\\project-bolt-sb1-y4qgjspa (1)\\project\\backend\\src\\template\\WelcomeEmail.html"
    );
    console.log("path: ", templatePath);

    let htmlTemplate = await fs.readFile(templatePath, "utf-8");

    htmlTemplate = htmlTemplate
      .replace("[Client Name]", client.company_name)
      .replace("[Brand Head Name]", brandHead.name)
      .replace("[Scheduling Link]", brandHead.schedulingLink)
      .replace("[Unsubscribe Link]", "#"); // Add your unsubscribe logic here

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Send the email
    await transporter.sendMail({
      from: "akharsha07@gmail.com", // company email
      to: client.email,
      subject: "Welcome! Please Schedule Your Onboarding Call",
      html: htmlTemplate, // Use the personalized HTML
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

// This function sends the password reset email
export const sendPasswordResetEmail = async (
  clientName: string,
  clientEmail: string,
  resetLink: string
) => {
  try {
    const templatePath = path.join(
      "C:\\Users\\Harsha AK\\Desktop\\project-bolt-sb1-y4qgjspa (1)\\project\\backend\\src\\template\\ResetPassword.html"
    );
    console.log("path: ", templatePath);

    let htmlTemplate = await fs.readFile(templatePath, "utf-8");

    // Personalize the template with the client's name and unique reset link
    htmlTemplate = htmlTemplate
      .replace("[Client Name]", clientName)
      .replace("[Reset Link]", resetLink);

    // Configure your Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: "akharsha07@gmail.com", // company email  
      to: clientEmail,
      subject: "Your Password Reset Link for dotspeaks",
      html: htmlTemplate,
    });

    console.log(`Password reset email sent successfully to ${clientEmail}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email.");
  }
};

export const SendRemainderEmail = async (
  email: any,
  meetingLink: any,
  startTime: any,
  title: any
) => {
  try {
    const templatePath = path.join(
      "C:\\Users\\Harsha AK\\Desktop\\project-bolt-sb1-y4qgjspa (1)\\project\\backend\\src\\template\\ReminderEmail.html"
    );
    console.log("path: ", templatePath);
    console.log("meeting link: ", meetingLink);

    let htmlTemplate = await fs.readFile(templatePath, "utf-8");

    htmlTemplate = htmlTemplate
      .replace("[Greeting Name]", email)
      .replace("[Meeting Title]", title)
      .replace("[Time Until Meeting]", startTime)
      .replace("[Meeting Link]", meetingLink);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 4. Send the email
    await transporter.sendMail({
      from: "akharsha07@gmail.com", // company email
      to: email,
      subject: "A friendly reminder about your call with Dotspeaks",
      html: htmlTemplate, // Use the personalized HTML
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};
