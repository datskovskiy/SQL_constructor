using System;
using System.Windows;
using Wpf.ViewModel;

namespace Wpf.View
{
    /// <summary>
    /// Interaction logic for RegistrationForm.xaml
    /// </summary>
    public partial class RegistrationForm : Window
    {
        public RegistrationForm()
        {
            this.InitializeComponent();
            var vm = new RegistrationFormViewModel();
            this.DataContext = vm;
            if (vm.CloseAction == null)
                vm.CloseAction = new Action(this.Close);
        }

        }
}
