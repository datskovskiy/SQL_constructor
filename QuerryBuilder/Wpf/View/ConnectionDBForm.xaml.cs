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
    /// Interaction logic for ConnectionDbForm.xaml
    /// </summary>
    public partial class ConnectionDbForm : Window
    {
        public ConnectionDbForm()
        {
            this.InitializeComponent();
            var vm = new ConnectionDbFormViewModel();
            this.DataContext = vm;
            if (vm.CloseAction == null)
                vm.CloseAction = new Action(this.Close);
        }
    }
}
