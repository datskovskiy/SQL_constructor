using System;
using System.ComponentModel;
using System.Windows;
using System.Windows.Input;
using QueryBuilder.DAL.Models;
using QueryBuilder.Services.Contracts;
using QueryBuilder.Services.DbServices;
using QueryBuilder.Utils;
using Wpf.DataModel;
using Wpf.View;
using Wpf.ViewModel.Command;


namespace Wpf.ViewModel
{
    class AutorizationFormViewModel : IDataErrorInfo
    {
        private readonly IUserService _userService;

        public Action CloseAction { get; set; }
        public ICommand ClickSignInCommand { get; set; }
        public ICommand ClickRegisterCommand { get; set; }

        public string Login { get; set; }
        public string Password { get; set; }

        /// <summary>
        /// Валидация и сообщения об ошибках
        /// </summary>
        /// <param name="columnName"></param>
        /// <returns></returns>
        public string this[string columnName]
        {
            get
            {
                var error = string.Empty;
                switch (columnName)
                {
                    case "Login":
                        if (Login == null)
                        {
                            error = "Enter your e-mail";
                        }
                        else if (!ValidationMethods.EmailValidation(Login))
                        {
                            error = "Enter correct e-mail";
                        }

                        break;
                    case "Password":

                        break;

                }
                return error;
            }
        }
        public string Error
        {
            get { throw new NotImplementedException(); }
        }

        public AutorizationFormViewModel()
        {
            ClickSignInCommand = new RelayCommand(arg => ClickSignInMethod());
            ClickRegisterCommand = new RelayCommand(arg => ClickRegisterMethod());

            var servicesFactory = new ServicesFactory();
            _userService = servicesFactory.GetUserService();
        }

       /// <summary>
        /// Вызывает окно регистрации
        /// </summary>
        private void ClickRegisterMethod()
        {
            var windowRegistrationForm = new RegistrationForm();
            windowRegistrationForm.ShowDialog();
            CloseAction();
        }

        private void ClickSignInMethod()
        {
            try
            {
                LoginUser(Login, Password);
                CloseAction();
            }
            catch (Exception)
            {
                MessageBox.Show(View.Resources.Resource.NotUserLogin);
            }
         }

        public void LoginUser(string email, string password)
        {
            if (!ValidationUser(email, password)) throw new ArgumentException();
        }

        private bool ValidationUser(string email, string password)
        {
            var logUser = _userService.GetUserByEmail(email);
            if (logUser != null) MainWindowData.CurrentUser = logUser;

            return MainWindowData.CurrentUser.PasswordHash.Equals(Scrambler.GetPassHash(password));
        }

    }

}