using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Windows.Input;
using QueryBuilder.DAL.Models;
using QueryBuilder.Services.Contracts;
using QueryBuilder.Services.DbServices;
using Wpf.DataModel;
using Wpf.View;
using Wpf.ViewModel.Command;

namespace Wpf.ViewModel
{
    class CreateProjectFormViewModel
    {
        public string Name { get; set; }
        public List<string> MyConnectionList { get; set; }
        public string Summary { get; set; }
        public ICommand AddConnectionCommand { get; set; }
        public ICommand CreateProjectCommand { get; set; }

        private readonly IProjectService _projectService;

        public CreateProjectFormViewModel()
        {
            AddConnectionCommand = new RelayCommand(arg => AddConnectionMethod());
            CreateProjectCommand = new RelayCommand(arg => CreateProjectMethod());

            var servicesFactory = new ServicesFactory();
            _projectService = servicesFactory.GetProjectService();
        }

        private void CreateProjectMethod()
        {
            var project = new Project
            {
                ProjectName = Name,
                ProjectOwner = MainWindowData.CurrentUser.Email,
                ProjectDescription = Summary
            };
            _projectService.SaveProject(project);
        }

        

        private void AddConnectionMethod()
        {
            var window = new ConnectionDbForm();
            window.ShowDialog();
        }

        public ObservableCollection<Group> List
        {
            get
            {
                return MainWindowData.UserConnections;
            }
            set
            {
                MainWindowData.UserConnections = value;
            }
        }

    }
}
