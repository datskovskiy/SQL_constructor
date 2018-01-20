using System;
using System.Configuration;
using System.IO;
using System.Net.Configuration;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading.Tasks;

namespace QueryBuilder.Utils.Mailers
{ 
    public class SmtpMailer
    {
        private static SmtpMailer _instance;
        private static MailSettingsSectionGroup _mailSettings;

        protected SmtpMailer()
        {            
        }

        public static SmtpMailer Instance(Configuration configuration)
        {
            _mailSettings = configuration.GetSectionGroup("system.net/mailSettings") as MailSettingsSectionGroup;
            return _instance ?? (_instance = new SmtpMailer());
        }

        /// <summary>
        /// Method for send mail
        /// Multiple e-mail addresses must be separated with a comma character (",").
        /// Mail settings get from app.config
        /// </summary>
        /// <param name="addressesTo"></param>
        /// <param name="subjectMail"></param>
        /// <param name="bodyMail"></param>
        /// <param name="filesPathes">Array pathes files for send</param>
        /// <returns></returns>
        public bool SendMail(string addressesTo, string subjectMail, string bodyMail, string[] filesPathes = null)
        {
            bool flagSend;

            if (string.IsNullOrWhiteSpace(addressesTo))
            {
                throw new ArgumentException("Incorrect e-mail address (To). ");
            }

            // Verify mail settings
            if (_mailSettings != null)
            {
                using (var mailClient = new SmtpClient())
                {
                    using (var message = new MailMessage())
                    {
                        try
                        {
                            message.From = new MailAddress(_mailSettings.Smtp.Network.UserName, "AltexSoftLab");
                            message.To.Add(addressesTo);
                            message.Subject = subjectMail;
                            message.Body = bodyMail;

                            if (filesPathes != null)
                            {
                                foreach (var filePath in filesPathes)
                                {
                                    if (!File.Exists(filePath)) continue;
                                    // Create  the file attachment for this e-mail message.
                                    var data = new Attachment(filePath, MediaTypeNames.Application.Octet);

                                    // Add the file attachment to this e-mail message.
                                    message.Attachments.Add(data);
                                }
                            }

                            mailClient.Send(message);

                            flagSend = true;
                        }
                        catch (SmtpException e)
                        {
                            throw new SmtpException("Mail.Send: " + e.Message);
                        }
                    }
                }
            }
            else
            {
                throw new Exception("Empty mail settings.");
            }

            return flagSend;
        }

        /// <summary>
        /// Method for send mail
        /// Multiple e-mail addresses must be separated with a comma character (",").
        /// Mail settings get from app.config
        /// </summary>
        /// <param name="addressesTo"></param>
        /// <param name="subjectMail"></param>
        /// <param name="bodyMail"></param>
        /// <param name="stream">Memory stream for attach</param>
        /// <returns></returns>
        public bool SendMail(string addressesTo, string subjectMail, string bodyMail, MemoryStream stream)
        {
            bool flagSend;

            if (string.IsNullOrWhiteSpace(addressesTo))
            {
                throw new ArgumentException("Incorrect e-mail address (To). ");
            }

            // Verify mail settings
            if (_mailSettings != null)
            {
                using (var mailClient = new SmtpClient())
                {
                    using (var message = new MailMessage())
                    {
                        try
                        {
                            message.From = new MailAddress(_mailSettings.Smtp.Network.UserName, "AltexSoftLab");
                            message.To.Add(addressesTo);
                            message.Subject = subjectMail;
                            message.Body = bodyMail;

                            var contentType = new ContentType(MediaTypeNames.Application.Octet);
                            var attach = new Attachment(stream, contentType);
                            attach.ContentDisposition.FileName = "Result.xlsx";                            

                            // Add the file attachment to this e-mail message.
                            message.Attachments.Add(attach);

                            mailClient.Send(message);

                            stream.Close();

                            flagSend = true;
                        }
                        catch (SmtpException e)
                        {
                            throw new SmtpException("Mail.Send: " + e.Message);
                        }
                    }
                }
            }
            else
            {
                throw new Exception("Empty mail settings.");
            }

            return flagSend;
        }

        public bool SendRegisterNotification(string email)
        {
            return SendMail(email, "AltexSoft M2T2", "Thank you for registering!");
        }

        public Task SendMailAsync(string addressesTo, string subjectMail, string bodyMail, string[] filesPathes = null)
        {
            if (string.IsNullOrWhiteSpace(addressesTo))
            {
                throw new ArgumentException("Incorrect e-mail address (To). ");
            }

            // Verify mail settings
            if (_mailSettings != null)
            {
                using (var mailClient = new SmtpClient())
                {
                    using (var message = new MailMessage(_mailSettings.Smtp.Network.UserName, addressesTo))
                    {
                        try
                        {
                            message.Subject = subjectMail;
                            message.Body = bodyMail;

                            if (filesPathes != null)
                            {
                                foreach (var filePath in filesPathes)
                                {
                                    if (!File.Exists(filePath)) continue;
                                    // Create  the file attachment for this e-mail message.
                                    var data = new Attachment(filePath, MediaTypeNames.Application.Octet);

                                    // Add the file attachment to this e-mail message.
                                    message.Attachments.Add(data);
                                }
                            }

                            return mailClient.SendMailAsync(message);

                        }
                        catch (SmtpException e)
                        {
                            throw new SmtpException("Mail.Send: " + e.Message);
                        }
                    }
                }
            }
            else
            {
                throw new Exception("Empty mail settings.");
            }
        }

        public Task SendAsyncRegisterNotification(string email)
        {
            return SendMailAsync(email, "AltexSoft M2T2", "Thank you for registering!");
        }

    }
}
