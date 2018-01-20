using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using Wpf.ViewModel;

namespace Wpf.View
{
    /// <summary>
    /// Interaction logic for Email.xaml
    /// </summary>
    public partial class Email : Window
    {
        public Email()
        {
            InitializeComponent();
            var vm = new EmailViewModel();
            this.DataContext = vm;
            
            if (vm.CloseAction == null)
                vm.CloseAction = new Action(this.Close);
        }
    }
}
