using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using QueryBuilder.Utils;
using QueryBuilder.Utils.Mailers;
using Wpf.DataModel;
using Wpf.ViewModel.Command;

namespace Wpf.ViewModel
{
    class EmailViewModel : IDataErrorInfo
    {
        public string Email { get; set; }
        public string Title { get; set; }
        public string SqlQuerry { get; set; }

        public ICommand ClickSendMailCommand { get; set; }
        public Action CloseAction { get; set; }

        public EmailViewModel()
        {
            SqlQuerry = MainWindowData.SqlQuerry;
            ClickSendMailCommand = new RelayCommand(arg => ClickMethodSendEmail());
        }

        private void ClickMethodSendEmail()
        {
            try
            {
                var mail = SmtpMailer.Instance();
                mail.SendMail(Email, Title, SqlQuerry);
                this.CloseAction();
                MessageBoxImage icon = MessageBoxImage.Information;
                MessageBoxButton button = MessageBoxButton.OK;
                MessageBox.Show("Mail sent", "", button, icon);
                
            }
            catch (Exception)
            {

                MessageBoxImage icon = MessageBoxImage.Error;
                MessageBoxButton button = MessageBoxButton.OK;
                MessageBox.Show("Mail didn't send", "", button, icon);
            }
                        
        }

        public string this[string columnName]
        {

            get
            {

                var error = string.Empty;
                switch (columnName)
                {
                    case "Email":
                        if (Email == null)
                        {
                            error = "Enter your e-mail";
                        }
                        else if (!ValidationMethods.EmailValidation(Email))
                        {
                            error = "Enter correct e-mail";
                        }

                        break;
                   }
                return error;
            }
        }
        public string Error
        {
            get { throw new NotImplementedException(); }
        }
    }
}

