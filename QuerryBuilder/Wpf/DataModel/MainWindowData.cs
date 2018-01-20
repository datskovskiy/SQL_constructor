using System.Collections.ObjectModel;
using QueryBuilder.DAL.Models;
using Wpf.ViewModel;

namespace Wpf.DataModel
{
    static class MainWindowData
    {
        public static string SqlQuerry { get; set; }
        public static string StringConnect { get; set; }
        public static string ProjectName { get; set; }
        public static string DescriptionProject { get; set; }
        public static string ProjectOwner { get; set; }

        public static User CurrentUser { get; set; }

        public static ObservableCollection<Group> UserConnections { get; set; }
    }
}
