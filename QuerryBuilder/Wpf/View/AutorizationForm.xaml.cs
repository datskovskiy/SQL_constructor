using System;
using System.Windows;
using Wpf.ViewModel;

namespace Wpf.View
{
    /// <summary>
    /// Interaction logic for AutorizationForm.xaml
    /// </summary>
    public partial class AutorizationForm : Window
    {
        public AutorizationForm()
        {
            InitializeComponent();
            var vm = new AutorizationFormViewModel();
            this.DataContext = vm;
            if (vm.CloseAction == null)
                vm.CloseAction = new Action(this.Close);
        }

    }
}
