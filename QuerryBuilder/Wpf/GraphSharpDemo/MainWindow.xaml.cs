using System.Windows;

namespace GraphSharpDemo
{
    public partial class MainWindow : Window
    {
        private MainWindowViewModel vm;
        public MainWindow()
        {
            vm = new MainWindowViewModel();
            this.DataContext = vm;
            InitializeComponent();
        }
    }
}
