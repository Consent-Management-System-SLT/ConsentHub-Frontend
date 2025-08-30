const nodemailer = require('nodemailer');
require('dotenv').config();

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  // Initialize email transporter with Gmail SMTP
  initializeEmailTransporter() {
    try {
      this.emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'ojithatester@gmail.com',
          pass: 'cumm brjo ktzk fook'
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify the connection
      this.emailTransporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email transporter initialization failed:', error);
        } else {
          console.log('✅ Email transporter ready for sending emails');
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
    }
  }

  // Pre-built email templates for CSR with enhanced professional content
  getPreBuiltTemplates() {
    return [
      {
        id: 'account_created_welcome',
        name: 'Account Created - Welcome Email',
        subject: 'Welcome to SLT Mobitel - Your Account is Ready!',
        message: `Dear [CUSTOMER_NAME],

Congratulations! Your SLT Mobitel account has been successfully created and is now active.

Account Details:
• Email: [CUSTOMER_EMAIL]
• Account Number: [ACCOUNT_ID]
• Registration Date: ${new Date().toLocaleDateString()}
• Status: Active and Ready to Use

What's Next:
1. Login to your account at portal.sltmobitel.lk
2. Complete your profile setup
3. Choose your preferred service plans
4. Download the MyMobitel app for easy management

Welcome Benefits:
• Island-wide 4G/5G network coverage
• 24/7 customer support at 1717
• Exclusive new customer promotions
• Seamless digital service experience
• Advanced account management tools

Need Help Getting Started?
• Visit: sltmobitel.lk/help
• Call: 1717 (24/7 support)
• Email: support@sltmobitel.lk
• Live Chat: Available on our website

Thank you for choosing SLT Mobitel as your telecommunications partner. We're excited to serve you!

Welcome to the SLT Family!

Best regards,
SLT Mobitel Team`,
        type: 'welcome',
        channels: ['email']
      },
      {
        id: 'admin_created_account',
        name: 'Account Created by Admin - Welcome Email',
        subject: 'Your SLT Mobitel Account Has Been Created',
        message: `Dear [CUSTOMER_NAME],

An account has been created for you on the SLT Mobitel platform by our administration team.

Your Account Information:
• Email: [CUSTOMER_EMAIL]
• Account ID: [ACCOUNT_ID]
• Created Date: ${new Date().toLocaleDateString()}
• Created By: SLT Administration Team
• Status: Active and Verified

Important First Steps:
1. Set up your password at: portal.sltmobitel.lk/reset-password
2. Complete your security verification
3. Review and update your account preferences
4. Explore available services and plans

Account Features Available:
• Full access to SLT Mobitel services
• Online bill payment and account management
• 4G/5G network services
• Customer support portal
• Mobile app integration
• Service upgrade options

Security Notice:
Your account has been pre-verified by our team. For security purposes, please set up your password and enable two-factor authentication when you first login.

Support & Assistance:
• Customer Service: 1717 (24/7)
• Online Support: sltmobitel.lk/support
• Service Centers: Find locations at sltmobitel.lk/centers
• Email Support: support@sltmobitel.lk

Welcome to SLT Mobitel! We're here to provide you with the best telecommunications experience.

Warm regards,
SLT Mobitel Customer Care Team`,
        type: 'administrative',
        channels: ['email']
      },
      {
        id: 'welcome',
        name: 'Welcome New Customer',
        subject: 'Welcome to SLT Mobitel - Your Journey Begins Here!',
        message: `Dear Valued Customer,

Welcome to the SLT Mobitel family! We are absolutely delighted to have you join our growing community of satisfied customers.

What You Get With SLT Mobitel:
• Island-wide network coverage with 99.5% reliability
• 4G/5G high-speed data connectivity
• 24/7 customer support through multiple channels
• Exclusive promotional offers and rewards
• Seamless roaming services across 200+ countries
• Advanced digital services and mobile banking

Your Next Steps:
• Download the MyMobitel app for easy account management
• Explore our data packages and voice plans
• Set up your online account for bill payments
• Follow us on social media for latest updates

Our customer service team is available 24/7 to assist you with any questions or concerns. Welcome aboard, and thank you for choosing SLT Mobitel as your trusted telecommunications partner!

Stay Connected, Stay Ahead!`,
        type: 'promotional',
        channels: ['email', 'sms']
      },
      {
        id: 'account_update',
        name: 'Account Update Confirmation',
        subject: 'Account Information Successfully Updated',
        message: `Dear Valued Customer,

Your account information has been successfully updated in our system.

Updated Information Summary:
• Personal details modified
• Contact information verified
• Service preferences updated
• Security settings enhanced

Recent Changes Made:
• Profile information updated on ${new Date().toLocaleDateString()}
• All changes have been verified and activated
• Your services continue without interruption
• Enhanced security measures are now active

Important Security Notice:
If you did not authorize these changes, please contact our security team immediately at 1717 or visit your nearest SLT Mobitel service center.

Your account security is our priority. We use advanced encryption and monitoring to protect your personal information.

Thank you for keeping your account information current!`,
        type: 'informational',
        channels: ['email', 'sms', 'push']
      },
      {
        id: 'payment_reminder',
        name: 'Friendly Payment Reminder',
        subject: 'Monthly Bill Payment Due - Quick & Easy Options Available',
        message: `Dear Valued Customer,

This is a friendly reminder that your monthly bill payment is due soon.

Bill Summary:
• Account Number: [Your Account Number]
• Amount Due: Rs. [Amount]
• Due Date: [Due Date]
• Current Status: Active

Convenient Payment Options:
• Online Banking through our website
• MyMobitel mobile app (Most Popular!)
• SMS Banking - Text PAY to 1717
• Any ComBank, Sampath, or HNB ATM
• SLT Mobitel service centers island-wide
• Authorized payment centers
• Dialog eZ Cash or Mobitel mCash

Why Pay On Time:
• Avoid service interruptions
• Maintain excellent credit rating
• Enjoy uninterrupted connectivity
• Qualify for special promotions

Need help with payment? Our customer service team is available 24/7 at 1717.

Thank you for being a responsible and valued customer!`,
        type: 'reminder',
        channels: ['email', 'sms', 'push']
      },
      {
        id: 'service_maintenance',
        name: 'Scheduled Maintenance Notice',
        subject: 'Network Enhancement - Scheduled Maintenance Notification',
        message: `Dear Valued Customer,

We are committed to providing you with the best network experience. To enhance our services, we will be conducting scheduled network maintenance.

Maintenance Details:
• Date: [Maintenance Date]
• Time: [Start Time] to [End Time] 
• Duration: Approximately [Duration] hours
• Affected Services: Voice, Data, and SMS
• Coverage Areas: [Specific Areas]

What to Expect:
• Temporary service interruptions may occur
• Voice calls may experience brief disconnections  
• Data speeds may vary during maintenance
• SMS delivery might be delayed
• Emergency services (119, 110, 118) remain available

Network Improvements You'll Enjoy:
• Enhanced 4G/5G coverage
• Faster data speeds
• Improved call quality
• Better indoor connectivity
• Advanced network features

We apologize for any inconvenience this may cause and appreciate your patience as we work to improve your mobile experience.

For updates during maintenance, follow us on social media or check our website.`,
        type: 'alert',
        channels: ['email', 'sms', 'push']
      },
      {
        id: 'data_package',
        name: 'Exclusive Data Package Promotion',
        subject: 'DOUBLE DATA OFFER - Limited Time Exclusive Deal!',
        message: `Dear Valued Customer,

Exclusive opportunity alert! We have a special data package promotion designed just for loyal customers like you.

DOUBLE DATA MEGA OFFER

Package Highlights:
• Get 20GB data for the price of 10GB
• High-speed 4G/5G connectivity included
• Valid for 30 days with rollover option
• Free social media data (Facebook, WhatsApp, Instagram)
• No fair usage policy restrictions
• Compatible with all devices

Special Features:
• Unlimited WhatsApp messaging
• Free access to SLT entertainment platforms
• Priority network access during peak hours
• Hotspot sharing included
• Auto-renewal available with discount

Limited Time Benefits:
• 50% extra data for first 3 months
• Free activation (usually Rs. 50)
• Bonus night data 12AM-6AM
• Exclusive customer support line

This offer is valid until [End Date] or while stocks last. Don't miss out on this incredible value!

To activate: Reply 'YES' to this message or call 1717 now!`,
        type: 'promotional',
        channels: ['email', 'sms', 'push']
      },
      {
        id: 'security_alert',
        name: 'Important Security Alert',
        subject: 'URGENT: Account Security Alert - Action Required',
        message: `Dear Valued Customer,

IMPORTANT SECURITY NOTICE - Please read carefully.

We have detected unusual activity on your account that requires immediate attention.

Detected Activities:
• Multiple login attempts from unknown devices
• Unusual data usage patterns detected
• Service changes attempted without authorization
• Potential unauthorized access attempts

Immediate Actions Taken:
• Account temporarily secured
• All suspicious activities blocked
• Enhanced monitoring activated
• Security team has been notified

Required Actions - Please Complete Within 24 Hours:
1. Contact our security hotline: 1717 (Option 2)
2. Visit nearest SLT Mobitel service center with NIC
3. Verify your identity through our secure portal
4. Reset your account passwords immediately

Important Security Tips:
• Never share your account passwords or PINs
• Use strong, unique passwords for your accounts
• Enable two-factor authentication
• Regular monitor your account statements
• Report suspicious activities immediately

Your account security is our top priority. We apologize for any inconvenience and appreciate your immediate attention to this matter.

DO NOT ignore this message - Act now to secure your account!`,
        type: 'urgent',
        channels: ['email', 'sms', 'push']
      },
      {
        id: 'thank_you',
        name: 'Customer Appreciation Message',
        subject: 'Thank You - Your Loyalty Means Everything to Us!',
        message: `Dear Valued Customer,

As we reflect on another successful year of service, we want to take a moment to express our heartfelt gratitude for your continued trust and loyalty.

Your Journey With Us:
• [X] years as a valued SLT Mobitel customer
• Trusted us with your communication needs
• Contributed to our community growth
• Helped us improve our services through feedback

What Your Loyalty Has Achieved:
• Enabled us to expand network coverage to rural areas
• Supported technological advancement in Sri Lanka
• Helped create employment opportunities
• Contributed to digital transformation initiatives

Special Recognition Benefits:
• Priority customer service support
• Exclusive access to new services and features
• Special pricing on premium packages
• Invitations to VIP events and launches
• Personalized offers based on your preferences

Looking Ahead:
We're excited to continue serving you with even better services, innovative solutions, and unmatched customer care. Your satisfaction drives our commitment to excellence.

From all of us at SLT Mobitel, thank you for being more than just a customer - thank you for being part of our family.

With sincere appreciation and warm regards,
The SLT Mobitel Team`,
        type: 'informational',
        channels: ['email', 'sms']
      },
      {
        id: 'survey_request',
        name: 'Customer Feedback Survey',
        subject: 'Help Us Serve You Better - Quick 2-Minute Survey',
        message: `Dear Valued Customer,

Your opinion matters! We are constantly striving to improve our services and would love to hear your thoughts.

Why Your Feedback is Important:
• Helps us understand your needs better
• Enables us to enhance service quality
• Guides our future service developments
• Ensures we meet your expectations
• Helps us prioritize improvements

Quick Survey Topics:
• Network coverage and quality in your area
• Customer service experience rating
• Value for money assessment
• New services you'd like to see
• Overall satisfaction with SLT Mobitel

Survey Details:
• Takes only 2-3 minutes to complete
• Mobile-friendly and easy to navigate  
• Chance to win exciting prizes worth Rs. 50,000
• Your responses are completely confidential
• No personal information required

Exclusive Survey Rewards:
• All participants get 1GB bonus data
• Monthly lucky draw for smartphones
• Special discount vouchers for loyal customers
• Priority consideration for beta services

Your feedback directly influences our service improvements and helps us serve you better.

Click the link below to start the survey:
[Survey Link - To be inserted by CSR]

Thank you for helping us make SLT Mobitel the best choice for telecommunications!`,
        type: 'informational',
        channels: ['email', 'sms']
      }
    ];
  }

  // Send email notification
  async sendEmail({ to, subject, message, messageType = 'informational', customerName = '' }) {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      // Create HTML email template based on message type
      const emailHtml = this.generateEmailTemplate({
        customerName,
        message,
        messageType,
        subject
      });

      const mailOptions = {
        from: {
          name: 'SLT Mobitel Consent Management',
          address: 'ojithatester@gmail.com'
        },
        to: to,
        subject: subject,
        text: message,
        html: emailHtml,
        headers: {
          'X-Priority': messageType === 'urgent' ? '1' : '3',
          'X-MSMail-Priority': messageType === 'urgent' ? 'High' : 'Normal'
        }
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully to ${to}`);
      console.log(`📧 Message ID: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId,
        deliveredAt: new Date(),
        channel: 'email',
        details: result
      };

    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error.message,
        channel: 'email'
      };
    }
  }

  // Send SMS notification (mock implementation)
  async sendSMS({ to, message, messageType = 'informational' }) {
    try {
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success/failure based on phone number format
      const isValidPhone = /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(to);
      
      if (!isValidPhone) {
        throw new Error('Invalid phone number format');
      }
      
      const messageId = `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`📱 SMS sent successfully to ${to}`);
      console.log(`📧 Message ID: ${messageId}`);
      
      return {
        success: true,
        messageId: messageId,
        deliveredAt: new Date(),
        channel: 'sms',
        details: { to, message, messageType }
      };

    } catch (error) {
      console.error(`❌ Failed to send SMS to ${to}:`, error);
      return {
        success: false,
        error: error.message,
        channel: 'sms'
      };
    }
  }

  // Send push notification (mock implementation)
  async sendPush({ to, title, message, messageType = 'informational' }) {
    try {
      // Simulate push notification delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const messageId = `PUSH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🔔 Push notification sent successfully to user ${to}`);
      console.log(`📧 Message ID: ${messageId}`);
      
      return {
        success: true,
        messageId: messageId,
        deliveredAt: new Date(),
        channel: 'push',
        details: { to, title, message, messageType }
      };

    } catch (error) {
      console.error(`❌ Failed to send push notification to ${to}:`, error);
      return {
        success: false,
        error: error.message,
        channel: 'push'
      };
    }
  }

  // Send notifications via multiple channels
  async sendMultiChannelNotification({ customer, channels, subject, message, messageType }) {
    const results = [];
    
    console.log(`📤 Sending multi-channel notification to ${customer.name}`);
    console.log(`📋 Channels: ${channels.join(', ')}`);
    
    for (const channel of channels) {
      try {
        let result;
        
        switch (channel.toLowerCase()) {
          case 'email':
            if (customer.email) {
              result = await this.sendEmail({
                to: customer.email,
                subject,
                message,
                messageType,
                customerName: customer.name
              });
            } else {
              result = {
                success: false,
                error: 'Customer email not available',
                channel: 'email'
              };
            }
            break;
            
          case 'sms':
            if (customer.phone) {
              result = await this.sendSMS({
                to: customer.phone,
                message: `${subject}\n\n${message}`,
                messageType
              });
            } else {
              result = {
                success: false,
                error: 'Customer phone not available',
                channel: 'sms'
              };
            }
            break;
            
          case 'push':
            result = await this.sendPush({
              to: customer.id,
              title: subject,
              message,
              messageType
            });
            break;
            
          default:
            result = {
              success: false,
              error: `Unsupported channel: ${channel}`,
              channel: channel
            };
        }
        
        results.push(result);
        
      } catch (error) {
        console.error(`❌ Error sending ${channel} notification:`, error);
        results.push({
          success: false,
          error: error.message,
          channel: channel
        });
      }
    }
    
    return results;
  }

  // Bulk send to all customers
  async sendBulkNotification({ customers, channels, subject, message, messageType }) {
    console.log(`📢 Starting bulk notification to ${customers.length} customers`);
    const results = [];
    const batchSize = 10; // Increased batch size for better performance
    
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      const batchPromises = batch.map(customer => 
        this.sendMultiChannelNotification({ customer, channels, subject, message, messageType })
      );
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          const customer = batch[index];
          if (result.status === 'fulfilled') {
            results.push({
              customerId: customer.id,
              customerName: customer.name,
              results: result.value,
              status: 'completed'
            });
          } else {
            results.push({
              customerId: customer.id,
              customerName: customer.name,
              error: result.reason,
              status: 'failed'
            });
          }
        });
        
        // Reduced delay between batches for faster processing
        if (i + batchSize < customers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced from 2000ms to 1000ms
        }
        
      } catch (error) {
        console.error(`❌ Batch processing error:`, error);
      }
    }
    
    console.log(`📊 Bulk notification completed. Processed ${results.length} customers`);
    return results;
  }

  // Generate enhanced professional HTML email template with SLT brand colors
  generateEmailTemplate({ customerName, message, messageType, subject }) {
    // SLT Mobitel Brand Colors
    const sltColors = {
      primary: '#1e90ff',        // SLT Primary Blue
      primaryDark: '#1a365d',    // SLT Dark Blue  
      success: '#00d084',        // SLT Success Green
      accent: '#3b82f6',         // SLT Accent Blue
      warning: '#fbbf24',        // SLT Warning Amber
      danger: '#f87171',         // SLT Danger Red
      info: '#60a5fa'            // SLT Info Blue
    };

    const typeColors = {
      'promotional': sltColors.primary,     // SLT Primary Blue
      'informational': sltColors.success,   // SLT Success Green
      'alert': sltColors.warning,           // SLT Warning Amber
      'urgent': sltColors.danger,           // SLT Danger Red
      'reminder': sltColors.accent          // SLT Accent Blue
    };

    const backgroundColor = typeColors[messageType] || typeColors.informational;
    const iconMap = {
      'promotional': '🎉',
      'informational': '✅',
      'alert': '⚠️',
      'urgent': '🚨',
      'reminder': '⏰'
    };
    
    const icon = iconMap[messageType] || '✅';
    
    // Format message with enhanced styling for lists and emphasis
    let formattedMessage = message;
    
    // Convert bullet points to styled HTML lists
    if (message.includes('✅') || message.includes('•') || message.includes('-')) {
      const lines = message.split('\n');
      let inList = false;
      let htmlLines = [];
      
      for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('✅') || trimmed.startsWith('•') || trimmed.startsWith('-')) {
          if (!inList) {
            htmlLines.push('<div class="feature-list">');
            inList = true;
          }
          const content = trimmed.replace(/^[✅•-]\s*/, '');
          htmlLines.push(`<div class="feature-item"><span class="feature-icon">✨</span><span class="feature-text">${content}</span></div>`);
        } else {
          if (inList) {
            htmlLines.push('</div>');
            inList = false;
          }
          if (trimmed) {
            // Check for section headers (lines ending with :)
            if (trimmed.endsWith(':') && trimmed.length < 50) {
              htmlLines.push(`<h3 class="section-header">${trimmed}</h3>`);
            } else {
              htmlLines.push(`<p class="content-paragraph">${trimmed}</p>`);
            }
          } else {
            htmlLines.push('<div class="spacer"></div>');
          }
        }
      }
      
      if (inList) {
        htmlLines.push('</div>');
      }
      
      formattedMessage = htmlLines.join('');
    } else {
      // Standard paragraph formatting
      formattedMessage = message.split('\n').filter(line => line.trim()).map(line => {
        const trimmed = line.trim();
        if (trimmed.endsWith(':') && trimmed.length < 50) {
          return `<h3 class="section-header">${trimmed}</h3>`;
        }
        return `<p class="content-paragraph">${trimmed}</p>`;
      }).join('');
    }
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${subject}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
                line-height: 1.7; 
                color: #2c3e50; 
                margin: 0; 
                padding: 20px 0; 
                background: linear-gradient(135deg, #1a365d 0%, #1e90ff 50%, #3b82f6 100%);
                min-height: 100vh;
            }
            
            .email-container { 
                max-width: 680px; 
                margin: 0 auto; 
                background: #ffffff; 
                border-radius: 20px; 
                overflow: hidden; 
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
                position: relative;
            }
            
            .email-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 6px;
                background: linear-gradient(90deg, ${backgroundColor}, #00d084, ${backgroundColor});
                z-index: 10;
            }
            
            .header { 
                background: linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 50%, ${backgroundColor}aa 100%); 
                color: white; 
                padding: 50px 40px 45px; 
                text-align: center; 
                position: relative;
                overflow: hidden;
            }
            
            .header::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: gentle-float 8s ease-in-out infinite;
            }
            
            @keyframes gentle-float {
                0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
                50% { transform: translateY(-15px) rotate(180deg); opacity: 0.8; }
            }
            
            .header-content { 
                position: relative; 
                z-index: 2; 
            }
            
            .company-branding { 
                font-size: 36px; 
                font-weight: 800; 
                margin-bottom: 15px; 
                letter-spacing: -1px;
                text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                background: linear-gradient(45deg, #ffffff, #f8f9fa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .email-subject { 
                font-size: 24px; 
                font-weight: 600; 
                opacity: 0.95; 
                margin-top: 10px;
                text-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .content-body { 
                padding: 50px 40px; 
                background: #ffffff;
                position: relative;
            }
            
            .greeting { 
                font-size: 22px; 
                color: #2c3e50; 
                margin-bottom: 30px; 
                font-weight: 700;
                border-bottom: 3px solid ${backgroundColor}20;
                padding-bottom: 15px;
            }
            
            .content-paragraph {
                font-size: 17px;
                line-height: 1.8;
                color: #34495e;
                margin: 20px 0;
                text-align: justify;
            }
            
            .section-header {
                color: ${backgroundColor};
                margin: 35px 0 20px 0;
                font-size: 20px;
                font-weight: 700;
                padding: 15px 25px;
                background: linear-gradient(135deg, ${backgroundColor}10, ${backgroundColor}20);
                border-radius: 12px;
                border-left: 5px solid ${backgroundColor};
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .feature-list {
                margin: 30px 0;
                padding: 25px;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border-radius: 15px;
                border: 1px solid #dee2e6;
            }
            
            .feature-item {
                display: flex;
                align-items: flex-start;
                margin: 15px 0;
                padding: 12px 0;
                border-bottom: 1px solid rgba(0,0,0,0.05);
            }
            
            .feature-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .feature-icon {
                color: ${backgroundColor};
                font-size: 18px;
                margin-right: 15px;
                margin-top: 2px;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            .feature-text {
                font-size: 16px;
                color: #2c3e50;
                line-height: 1.6;
                font-weight: 500;
                flex: 1;
            }
            
            .spacer {
                height: 20px;
            }
            
            .appreciation-box {
                background: linear-gradient(135deg, ${backgroundColor}08, ${backgroundColor}15);
                border-radius: 15px;
                padding: 30px;
                margin: 35px 0;
                border: 2px solid ${backgroundColor}30;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .appreciation-box::before {
                content: '✨';
                position: absolute;
                top: 15px;
                right: 20px;
                font-size: 24px;
                opacity: 0.3;
            }
            
            .appreciation-text {
                color: #2c3e50;
                font-size: 18px;
                font-weight: 600;
                margin: 0;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            .signature-section {
                margin-top: 45px;
                padding: 35px;
                background: linear-gradient(135deg, ${backgroundColor}05, ${backgroundColor}10);
                border-radius: 15px;
                border-left: 6px solid ${backgroundColor};
                position: relative;
            }
            
            .signature-title {
                color: ${backgroundColor};
                font-weight: 700;
                font-size: 18px;
                margin-bottom: 5px;
            }
            
            .signature-team {
                color: #2c3e50;
                font-size: 17px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            
            .signature-tagline {
                color: #6c757d;
                font-size: 15px;
                font-style: italic;
                margin: 0;
            }
            
            .footer-section { 
                background: linear-gradient(135deg, #1a365d, #2d5aa0); 
                color: white;
                padding: 40px; 
                text-align: center; 
            }
            
            .footer-brand { 
                font-size: 20px; 
                font-weight: 800; 
                margin-bottom: 20px; 
                text-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .footer-text { 
                margin: 12px 0; 
                font-size: 14px; 
                line-height: 1.6;
                opacity: 0.9;
            }
            
            .footer-link { 
                color: #00d084; 
                text-decoration: none; 
                font-weight: 600; 
                transition: all 0.3s ease;
            }
            
            .footer-link:hover { 
                color: #00b570;
                text-decoration: underline; 
            }
            
            .divider-line { 
                height: 2px; 
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); 
                margin: 25px 0; 
                border-radius: 1px;
            }
            
            .contact-info {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 30px;
                margin: 25px 0;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                font-size: 14px;
            }
            
            .contact-icon {
                margin-right: 8px;
                font-size: 16px;
            }
            
            .disclaimer {
                font-size: 12px;
                color: rgba(255,255,255,0.7);
                margin-top: 25px;
                line-height: 1.5;
            }
            
            .message-id {
                font-size: 11px;
                color: rgba(255,255,255,0.5);
                margin-top: 15px;
                font-family: 'Courier New', monospace;
            }
            
            /* Responsive Design */
            @media (max-width: 720px) {
                body { padding: 10px 0; }
                .email-container { margin: 0 10px; border-radius: 15px; }
                .header { padding: 40px 25px 35px; }
                .content-body { padding: 35px 25px; }
                .footer-section { padding: 30px 25px; }
                .company-branding { font-size: 28px; }
                .email-subject { font-size: 20px; }
                .greeting { font-size: 20px; }
                .contact-info { flex-direction: column; gap: 15px; }
                .feature-list { padding: 20px; }
            }
            
            @media (max-width: 480px) {
                .company-branding { font-size: 24px; }
                .email-subject { font-size: 18px; }
                .content-paragraph { font-size: 16px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="header-content">
                    <div class="company-branding">SLT Mobitel ConsentHub</div>
                    <div class="email-subject">${icon} ${subject}</div>
                </div>
            </div>
            
            <div class="content-body">
                <div class="greeting">Dear ${customerName || 'Valued Customer'},</div>
                
                ${messageType === 'alert' || messageType === 'urgent' ? 
                  `<div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #fbbf24; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                    <div style="color: #92400e; font-weight: bold; font-size: 18px; margin-bottom: 10px;">
                        ⚠️ Important Notice - Immediate Attention Required
                    </div>
                    <div style="color: #92400e; font-size: 15px;">
                        This message contains important information that requires your prompt attention.
                    </div>
                  </div>` : ''
                }
                
                <div class="message-content">
                    ${formattedMessage}
                </div>
                
                <div class="appreciation-box">
                    <p class="appreciation-text">
                        Thank you for choosing SLT Mobitel - Your trusted telecommunications partner in Sri Lanka!
                    </p>
                </div>
                
                <div class="signature-section">
                    <div class="signature-title">Best regards,</div>
                    <div class="signature-team">SLT Mobitel Customer Service Team</div>
                    <p class="signature-tagline">Connecting Sri Lanka with Excellence Since 1991</p>
                </div>
            </div>
            
            <div class="footer-section">
                <div class="footer-brand">© 2025 Sri Lanka Telecom Mobitel (Pvt) Ltd.</div>
                <p class="footer-text"><strong>All rights reserved. Official ConsentHub Communication Platform.</strong></p>
                
                <div class="divider-line"></div>
                
                <div class="contact-info">
                    <div class="contact-item">
                        <span class="contact-icon">📞</span>
                        <span><strong>Hotline:</strong> <a href="tel:1717" class="footer-link">1717</a> (24/7)</span>
                    </div>
                    <div class="contact-item">
                        <span class="contact-icon">📧</span>
                        <span><strong>Email:</strong> <a href="mailto:support@sltmobitel.lk" class="footer-link">support@sltmobitel.lk</a></span>
                    </div>
                    <div class="contact-item">
                        <span class="contact-icon">🌐</span>
                        <span><strong>Web:</strong> <a href="https://www.sltmobitel.lk" target="_blank" class="footer-link">sltmobitel.lk</a></span>
                    </div>
                </div>
                
                <div class="divider-line"></div>
                
                <p class="disclaimer">
                    This is an automated message from SLT Mobitel's ConsentHub Customer Communication System.<br>
                    Please do not reply directly to this email. For assistance, use the contact information provided above.
                </p>
                
                <p class="message-id">
                    Message ID: SLTM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
                    Sent via ConsentHub Professional Communication Platform
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Validate notification data
  validateNotificationData({ customerIds, channels, subject, message }) {
    const errors = [];
    
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      errors.push('Customer IDs are required and must be a non-empty array');
    }
    
    if (!channels || !Array.isArray(channels) || channels.length === 0) {
      errors.push('Channels are required and must be a non-empty array');
    } else {
      const validChannels = ['email', 'sms', 'push'];
      const invalidChannels = channels.filter(channel => !validChannels.includes(channel.toLowerCase()));
      if (invalidChannels.length > 0) {
        errors.push(`Invalid channels: ${invalidChannels.join(', ')}. Valid channels are: ${validChannels.join(', ')}`);
      }
    }
    
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      errors.push('Subject is required and must be a non-empty string');
    }
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      errors.push('Message is required and must be a non-empty string');
    }
    
    return errors;
  }

  // Get notification statistics
  getNotificationStats() {
    return {
      email: {
        configured: !!this.emailTransporter,
        provider: 'Gmail SMTP (ojithatester@gmail.com)'
      },
      sms: {
        configured: true,
        provider: 'Mock SMS Service'
      },
      push: {
        configured: true,
        provider: 'Mock Push Service'
      },
      templates: this.getPreBuiltTemplates().length
    };
  }

  // Send welcome email when account is created
  async sendWelcomeEmail(customerData, createdBy = 'self') {
    try {
      console.log(`📧 Sending welcome email to ${customerData.email} (created by: ${createdBy})`);
      
      // Choose appropriate template based on who created the account
      const templateId = createdBy === 'admin' ? 'admin_created_account' : 'account_created_welcome';
      const templates = this.getPreBuiltTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error(`Welcome email template not found: ${templateId}`);
      }
      
      // Replace placeholders in template
      let subject = template.subject;
      let message = template.message;
      
      const customerName = customerData.name || `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim() || 'Valued Customer';
      const customerId = customerData.id || customerData._id || 'N/A';
      
      message = message.replace(/\[CUSTOMER_NAME\]/g, customerName);
      message = message.replace(/\[CUSTOMER_EMAIL\]/g, customerData.email);
      message = message.replace(/\[ACCOUNT_ID\]/g, customerId);
      
      // Generate professional HTML email
      const htmlContent = this.generateEmailTemplate({
        customerName: customerName,
        message: message,
        messageType: 'welcome',
        subject: subject
      });
      
      // Send email
      const result = await this.emailTransporter.sendMail({
        from: {
          name: 'SLT Mobitel ConsentHub',
          address: 'ojithatester@gmail.com'
        },
        to: customerData.email,
        subject: subject,
        html: htmlContent,
        text: message // Fallback plain text
      });
      
      console.log(`✅ Welcome email sent successfully to ${customerData.email}`);
      return {
        success: true,
        messageId: result.messageId,
        templateUsed: templateId,
        recipient: customerData.email
      };
      
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${customerData.email}:`, error);
      return {
        success: false,
        error: error.message,
        recipient: customerData.email
      };
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();

module.exports = {
  NotificationService,
  notificationService
};
